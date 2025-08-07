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
  private maxReconnectAttempts = 3; // 减少重连次数
  private reconnectDelay = 2000; // 增加初始延迟
  private isConnecting = false;
  private isConnected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private lastHeartbeat = 0;
  private heartbeatInterval = 30000; // 30秒心跳

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
        console.log('🔍 WebSocket已连接或正在连接中');
        resolve();
        return;
      }

      this.isConnecting = true;
      
      try {
        const wsUrl = this.getWebSocketUrl();
        console.log('🔍 ===== WebSocket  连接信息 =====');
        console.log('🔍 WebSocket URL:', wsUrl);
        console.log('🔍 ConversationId:', this.config.conversationId);
        console.log('🔍 Token存在:', !!this.config.token);
        console.log('🔍 ================================');
        
        this.websocket = new WebSocket(wsUrl);

        // 设置连接超时
        this.connectionTimeout = setTimeout(() => {
          if (this.websocket && this.websocket.readyState === WebSocket.CONNECTING) {
            console.error('🔍 WebSocket连接超时');
            this.websocket.close();
            this.handleConnectionFailure('连接超时', reject);
          }
        }, 10000); // 10秒超时

        this.websocket.onopen = () => {
          console.log('🔍 WebSocket连接已建立');
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
            console.log('🔍 ===== WebSocket V2 消息接收 =====');
            console.log('🔍 原始消息:', event.data);
            console.log('🔍 解析后数据:', data);
            console.log('🔍 消息类型:', typeof data);
            console.log('🔍 消息键:', Object.keys(data));
            if (data.conversationId) {
              console.log('🔍 消息中的conversationId:', data.conversationId);
            }
            if (data.type) {
              console.log('🔍 消息类型:', data.type);
            }
            
            // 检查interrupt相关信息
            if (data.interrupt !== undefined) {
              console.log('🔍 ⚠️ 发现interrupt信息:', data.interrupt);
            }
            if (data.interrupted !== undefined) {
              console.log('🔍 ⚠️ 发现interrupted信息:', data.interrupted);
            }
            if (data.canInterrupt !== undefined) {
              console.log('🔍 ⚠️ 发现canInterrupt信息:', data.canInterrupt);
            }
            
            // 检查消息内容中是否包含interrupt关键词
            if (data.content && typeof data.content === 'string' && data.content.toLowerCase().includes('interrupt')) {
              console.log('🔍 ⚠️ 消息内容包含interrupt关键词:', data.content);
            }
            
            console.log('🔍 ================================');
            
            // 处理心跳响应
            if (data.type === 'heartbeat') {
              this.lastHeartbeat = Date.now();
              console.log('🔍 收到心跳响应');
              return;
            }
            
            this.config.onMessage?.(data);
          } catch (error) {
            console.error('🔍 WebSocket V2 消息解析失败:', error);
            console.error('🔍 原始消息内容:', event.data);
            this.config.onError?.(error);
          }
        };

        this.websocket.onerror = (error) => {
          console.error('🔍 WebSocket连接错误:', error);
          this.handleConnectionFailure('连接错误', reject, error);
        };

        this.websocket.onclose = (event) => {
          console.log('🔍 WebSocket连接已关闭:', event.code, event.reason);
          this.handleConnectionClose(event);
        };

      } catch (error) {
        console.error('🔍 创建WebSocket连接失败:', error);
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
    
    console.error(`🔍 WebSocket${reason}:`, error);
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
    if (event.code === 1000 || event.code === 1001) {
      console.log('🔍 WebSocket正常关闭，不进行重连');
    } else {
      console.log(`🔍 WebSocket非正常关闭 (${event.code})`);
      this.attemptReconnect();
    }
    
    this.config.onClose?.(event);
  }

  private attemptReconnect(): void {
    if (!this.isClient()) return;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('🔍 达到最大重连次数，停止重连');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔍 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.config.onReconnect?.(this.reconnectAttempts);

    // 使用指数退避策略，但限制最大延迟
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 15000);
    console.log(`🔍 重连延迟: ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('🔍 重连失败:', error);
      });
    }, delay);
  }

  private startHeartbeat(): void {
    this.lastHeartbeat = Date.now();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.websocket) {
        try {
          this.websocket.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
        } catch (error) {
          console.error('🔍 心跳发送失败:', error);
          this.handleConnectionFailure('心跳失败', () => {});
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
  console.log('🔍 获取Token:', token ? '存在' : '不存在');
  
  if (!token) {
    console.error('🔍 缺少访问令牌');
    throw new Error('缺少访问令牌，请先登录');
  }

  console.log('🔍 准备连接WebSocket，conversationId:', conversationId);

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
