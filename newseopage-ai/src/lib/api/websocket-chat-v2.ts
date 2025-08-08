// 重新设计的WebSocket聊天系统
// 提供更稳定的连接管理和智能重连机制

export interface WebSocketConfig {
  conversationId: string;
  token: string;
  onMessage?: (data: any) => void;
  onError?: (error: any) => void;
  onClose?: (event: CloseEvent) => void;
  onOpen?: () => void;
  onReconnect?: (attempt: number) => void;
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
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 1; // 减少重连次数到1次
  private reconnectDelay = 5000; // 增加初始延迟到5秒
  private isConnecting = false;
  private isConnected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private lastHeartbeat = 0;
  private heartbeatInterval = 60000; // 60秒心跳，减少心跳频率

  constructor(config: WebSocketConfig) {
    this.config = config;
  }

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private getWebSocketUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_CHAT_WS_URL || 'wss://agents.zhuyuejoey.com';
    return `${baseUrl}/ws/chat/${this.config.conversationId}?token=${this.config.token}`;
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
          this.reconnectAttempts = 0;
          
          // 清除连接超时
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          
          // 启动心跳
          this.startHeartbeat();
          
          this.config.onOpen?.();
          resolve();
        };

        this.websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // 处理心跳响应
            if (data.type === 'heartbeat') {
              this.lastHeartbeat = Date.now();
              return;
            }
            
            this.config.onMessage?.(data);
          } catch (error) {
            console.error('🔍 WebSocket V2 消息解析失败:', error);
            this.config.onError?.(error);
          }
        };

        this.websocket.onerror = (error) => {
          this.handleConnectionFailure('连接错误', reject, error);
        };

        this.websocket.onclose = (event) => {
          this.handleConnectionClose(event);
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
    
    // 停止心跳
    this.stopHeartbeat();
    
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
    
    // 停止心跳
    this.stopHeartbeat();
    
    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // 检查关闭代码，决定是否重连
    if (event.code === 1006) {
      // 1006是异常关闭，可能是网络问题，尝试重连一次
      this.attemptReconnect();
    }
    
    this.config.onClose?.(event);
  }

  private attemptReconnect(): void {
    if (!this.isClient()) return;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    // 如果正在连接中，不要重复重连
    if (this.isConnecting) {
      return;
    }

    this.reconnectAttempts++;
    this.config.onReconnect?.(this.reconnectAttempts);

    // 使用固定延迟，避免频繁重连
    const delay = this.reconnectDelay;

    this.reconnectTimer = setTimeout(() => {
      if (!this.isConnecting) {
        this.connect().catch(() => {
          // 静默处理重连失败
        });
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.lastHeartbeat = Date.now();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        try {
          this.websocket.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
        } catch (error) {
          // 静默处理心跳失败
        }
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  public disconnect(): void {
    if (!this.isClient()) return;

    // 清除所有定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    this.stopHeartbeat();

    if (this.websocket) {
      this.websocket.close(1000, '正常关闭');
      this.websocket = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
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
  onReconnect?: (attempt: number) => void
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
    onMessage,
    onError,
    onClose,
    onOpen,
    onReconnect
  };

  const service = new WebSocketChatV2(config);
  await service.connect();
  return service;
};
