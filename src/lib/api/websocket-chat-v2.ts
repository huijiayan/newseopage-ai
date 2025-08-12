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
  type: 'message' | 'system' | 'error';
  content: string;
  timestamp: string;
  conversationId?: string;
  messageId?: string;
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
    const url = `${baseUrl}/ws/chat/${this.config.conversationId}?token=${this.config.token}`;
    
    // 如果提供了域名，添加到URL参数中
    if (this.config.domain) {
      const finalUrl = `${url}&domain=${encodeURIComponent(this.config.domain)}`;
      console.log('🔍 WebSocket URL with domain:', finalUrl);
      return finalUrl;
    }
    
    console.log('🔍 WebSocket URL without domain:', url);
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
    console.log(`🔍 安排重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})，延迟: ${delay}ms`);
    
    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => {
      this.isReconnecting = false;
      if (this.shouldReconnect) {
        this.connect().catch(error => {
          console.error('🔍 重连失败:', error);
        });
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
          console.log('🔍 WebSocket连接成功');
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
              console.log('🔍 域名信息已自动发送:', this.config.domain);
            } catch (error) {
              console.warn('🔍 发送域名信息失败:', error);
            }
          }
          
          this.config.onOpen?.();
          resolve();
        };

        this.websocket.onmessage = (event) => {
          // 减少日志输出，避免控制台刷屏
          if (process.env.NODE_ENV === 'development') {
            console.log('🔍 WebSocket V2 收到消息:', event.data);
          }
          
          // 尝试解析JSON，如果失败则传递原始数据
          try {
            const data = JSON.parse(event.data);
            this.config.onMessage?.(data);
          } catch (error) {
            // 只在开发环境下输出解析错误
            if (process.env.NODE_ENV === 'development') {
              console.log('🔍 JSON解析失败，传递原始数据:', event.data);
            }
            this.config.onMessage?.(event.data);
          }
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

    console.log('🔍 手动断开WebSocket连接');
    
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
    console.log('🔍 手动重连');
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
      this.connect().catch(error => {
        console.error('🔍 手动重连失败:', error);
      });
    }, 1000);
  }

  public sendMessage(message: ChatMessage): boolean {
    if (!this.isClient()) {
      console.warn('🔍 WebSocket只在客户端可用');
      return false;
    }

    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      console.warn('🔍 WebSocket未连接');
      return false;
    }

    try {
      this.websocket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('🔍 发送WebSocket消息失败:', error);
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
  
  console.log('🔍 WebSocket连接参数检查:', {
    conversationId,
    domain,
    hasToken: !!token,
    tokenLength: token?.length || 0,
    hasDomain: !!domain,
  });
  
  if (!token) {
    console.error('🔍 缺少访问令牌，请先登录');
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
