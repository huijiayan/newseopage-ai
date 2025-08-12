// 重新设计的WebSocket聊天系统
// 提供更稳定的连接管理和智能重连机制

export interface WebSocketConfig {
  conversationId: string;
  token: string;
  domain?: string; // 添加域名参数
  onMessage?: (data: any) => void;
  onError?: (error: any) => void;
  onClose?: (event: CloseEvent) => void;
  onOpen?: () => void;
}

export interface ChatMessage {
  type: 'message' | 'system' | 'error' | 'heartbeat';
  content?: string;
  timestamp: string;
  conversationId?: string;
  messageId?: string;
  // 心跳扩展字段（仅当 type 为 heartbeat 使用）
  execution_mode?: string;
  heartbeat_count?: number;
}

export class WebSocketChatV2 {
  private websocket: WebSocket | null = null;
  private config: WebSocketConfig;
  private isConnecting = false;
  private isConnected = false;
  private connectionTimeout: NodeJS.Timeout | null = null;
  
  // 自动重连相关
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private shouldReconnect = true;
  private isReconnecting = false;

  constructor(config: WebSocketConfig) {
    this.config = config;
  }

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private getWebSocketUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_CHAT_WS_URL || 'wss://agents.zhuyuejoey.com';
    let url = `${baseUrl}/ws/chat/${this.config.conversationId}?token=${this.config.token}`;
    
    // 断点续传：携带上次消息时间戳（若存在）
    try {
      if (this.isClient()) {
        const key = `ws_resume_ts_${this.config.conversationId}`;
        let fromTs = localStorage.getItem(key);
        if (fromTs && String(fromTs).length > 0) {
          // 将边界改为独占：若是纯数字毫秒，则 +1；否则按 ISO 解析 +1ms
          const plusOne = (ts: string): string => {
            if (/^\d+$/.test(ts)) {
              const n = Number(ts);
              return String(Number.isFinite(n) ? n + 1 : ts);
            }
            const ms = Date.parse(ts);
            if (!Number.isNaN(ms)) {
              return new Date(ms + 1).toISOString();
            }
            return ts;
          };
          fromTs = plusOne(String(fromTs));
          url += `&fromTs=${encodeURIComponent(String(fromTs))}&exclusive=1`;
        }
      }
    } catch {}
    
    // 如果提供了域名，添加到URL参数中
    if (this.config.domain) {
      const finalUrl = `${url}&domain=${encodeURIComponent(this.config.domain)}`;
      return finalUrl;
    }
    return url;
  }

  // 清理重连定时器
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // 安排重连
  private scheduleReconnect(): void {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }
    
    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => {
      this.isReconnecting = false;
      if (this.shouldReconnect) {
        this.connect().catch(() => {});
      }
    }, delay);
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isClient()) {
        reject(new Error('WebSocket只在客户端可用'));
        return;
      }

      if (this.isConnecting || this.isConnected) {
        resolve();
        return;
      }

      this.isConnecting = true;
      
      try {
        const wsUrl = this.getWebSocketUrl();
        
        this.websocket = new WebSocket(wsUrl);

        // 设置连接超时
        this.connectionTimeout = setTimeout(() => {
          if (this.websocket && this.websocket.readyState === WebSocket.CONNECTING) {
            this.websocket.close();
            this.handleConnectionFailure('连接超时', reject);
          }
        }, 10000); // 10秒超时

        this.websocket.onopen = () => {
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0; // 重置重连计数
          
          // 清除连接超时
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          
          // 连接成功后自动发送域名信息
          if (this.config.domain) {
            try {
              const domainMessage = {
                type: 'domain_info',
                content: `🌐 正在分析域名: ${this.config.domain}`,
                timestamp: new Date().toISOString(),
                conversationId: this.config.conversationId,
                domain: this.config.domain
              };
              
              // 发送域名信息消息
              this.websocket?.send(JSON.stringify(domainMessage));
            } catch {}
          }
          
          this.config.onOpen?.();
          resolve();
        };

        this.websocket.onmessage = (event) => {
          // 仅转发原始数据，不做JSON解析
          if (process.env.NODE_ENV === 'development') {
            console.log('🔍 WebSocket V2 收到原始消息:', event.data);
          }
          this.config.onMessage?.(event.data);
        };

        this.websocket.onerror = (error) => {
          this.handleConnectionFailure('连接错误', reject, error);
        };

        this.websocket.onclose = (event) => {
          this.handleConnectionClose(event);
          
          // 如果不是正常关闭且启用重连，则尝试重连
          if (event.code !== 1000 && this.shouldReconnect) {
            this.scheduleReconnect();
          }
        };

      } catch (error) {
        this.handleConnectionFailure('创建连接失败', reject, error);
      }
    });
  }

  private handleConnectionFailure(reason: string, reject: (error: any) => void, error?: any) {
    this.isConnecting = false;
    this.isConnected = false;
    
    // 清除连接超时
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    this.config.onError?.(error || new Error(reason));
    reject(error || new Error(reason));
  }

  private handleConnectionClose(event: CloseEvent) {
    this.isConnected = false;
    this.isConnecting = false;
    
    // 清除连接超时
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    this.config.onClose?.(event);
  }

  public disconnect(): void {
    if (!this.isClient()) return;

    
    // 禁用自动重连
    this.shouldReconnect = false;
    this.clearReconnectTimer();

    // 清除连接超时
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this.websocket) {
      this.websocket.close(1000, '正常关闭');
      this.websocket = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
  }

  // 启用自动重连
  public enableAutoReconnect(): void {
    this.shouldReconnect = true;
  }

  // 禁用自动重连
  public disableAutoReconnect(): void {
    this.shouldReconnect = false;
    this.clearReconnectTimer();
  }

  // 手动重连
  public reconnect(): void {
    this.reconnectAttempts = 0;
    this.shouldReconnect = true;
    
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
    
    // 延迟一下再连接
    setTimeout(() => {
      this.connect().catch(() => {});
    }, 1000);
  }

  public sendMessage(message: ChatMessage): boolean {
    if (!this.isClient()) {
      return false;
    }

    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      this.websocket.send(JSON.stringify(message));
      return true;
    } catch {
      return false;
    }
  }

  public sendChatMessage(content: string, messageId?: string): boolean {
    const message: ChatMessage = {
      type: 'message',
      content,
      timestamp: new Date().toISOString(),
      messageId
    };
    return this.sendMessage(message);
  }

  // 发送原始JSON对象（用于心跳等自定义协议）
  public sendRaw(payload: any): boolean {
    if (!this.isClient()) return false;
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) return false;
    try {
      this.websocket.send(JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  // 发送心跳
  public sendHeartbeat(count: number, executionMode: string = 'astream_events'): boolean {
    const payload: ChatMessage = {
      type: 'heartbeat',
      execution_mode: executionMode,
      heartbeat_count: count,
      timestamp: new Date().toISOString(),
      conversationId: this.config.conversationId,
    };
    return this.sendRaw(payload);
  }

  public isConnectionOpen(): boolean {
    if (!this.isClient()) return false;
    return this.websocket?.readyState === WebSocket.OPEN;
  }

  public getConnectionState(): string {
    if (!this.isClient()) return 'CLOSED';
    
    if (!this.websocket) return 'CLOSED';
    
    switch (this.websocket.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }

  public getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  public getMaxReconnectAttempts(): number {
    return this.maxReconnectAttempts;
  }

  public setMaxReconnectAttempts(max: number): void {
    this.maxReconnectAttempts = max;
  }

  public setReconnectDelay(delay: number): void {
    this.reconnectDelay = delay;
  }
}

// 创建WebSocket聊天实例
export const createWebSocketChatV2 = (config: WebSocketConfig): WebSocketChatV2 => {
  return new WebSocketChatV2(config);
};

// 连接WebSocket聊天
export const connectWebSocketChatV2 = async (
  conversationId: string,
  onMessage?: (data: any) => void,
  onError?: (error: any) => void,
  onClose?: (event: CloseEvent) => void,
  onOpen?: () => void,
  domain?: string
): Promise<WebSocketChatV2> => {
  // 只在客户端执行
  if (typeof window === 'undefined') {
    throw new Error('WebSocket只在客户端可用');
  }

  const token = localStorage.getItem('alternativelyAccessToken');
  
  if (!token) {
    throw new Error('缺少访问令牌，请先登录');
  }

  const config: WebSocketConfig = {
    conversationId,
    token,
    domain,
    onMessage,
    onError,
    onClose,
    onOpen
  };

  const service = new WebSocketChatV2(config);
  await service.connect();
  return service;
};
