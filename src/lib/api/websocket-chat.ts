// WebSocket聊天服务类
// 提供完整的WebSocket聊天功能，包括连接管理、消息发送和接收

export interface ChatMessage {
  type: 'message' | 'system' | 'error';
  content: string;
  timestamp: string;
  conversationId?: string;
  messageId?: string;
}

export interface WebSocketChatConfig {
  conversationId: string;
  token: string;
  onMessage?: (data: any) => void;
  onError?: (error: any) => void;
  onClose?: (event: CloseEvent) => void;
  onOpen?: () => void;
}

export class WebSocketChatService {
  private websocket: WebSocket | null = null;
  private config: WebSocketChatConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private isConnected = false;

  constructor(config: WebSocketChatConfig) {
    this.config = config;
  }

  // 检查是否在客户端环境
  private isClient(): boolean {
    return typeof window !== 'undefined' && typeof WebSocket !== 'undefined';
  }

  // 连接到WebSocket服务器
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // 只在客户端执行
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
        const wsUrl = `${process.env.NEXT_PUBLIC_CHAT_WS_URL || 'wss://agents.zhuyuejoey.com'}/ws/chat/${this.config.conversationId}?token=${this.config.token}`;
        console.log('🔍 连接WebSocket:', wsUrl);
        console.log('🔍 使用Token:', this.config.token ? `${this.config.token.substring(0, 20)}...` : '无Token');
        
        this.websocket = new WebSocket(wsUrl);

        this.websocket.onopen = () => {
          console.log('🔍 WebSocket连接已建立');
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.config.onOpen?.();
          resolve();
        };

        this.websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('🔍 收到WebSocket消息:', data);
            this.config.onMessage?.(data);
          } catch (error) {
            console.error('解析WebSocket消息失败:', error);
            this.config.onError?.(error);
          }
        };

        this.websocket.onerror = (error) => {
          console.error('WebSocket连接错误:', error);
          this.isConnecting = false;
          this.config.onError?.(error);
          reject(error);
        };

        this.websocket.onclose = (event) => {
          console.log('WebSocket连接已关闭:', event.code, event.reason);
          this.isConnected = false;
          this.isConnecting = false;
          
          // 如果不是正常关闭，尝试重连
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnect();
          }
          
          this.config.onClose?.(event);
        };

      } catch (error) {
        console.error('创建WebSocket连接失败:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // 发送消息
  public sendMessage(message: ChatMessage): boolean {
    if (!this.isClient()) {
      console.warn('WebSocket只在客户端可用');
      return false;
    }

    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket未连接');
      return false;
    }

    try {
      this.websocket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('发送WebSocket消息失败:', error);
      return false;
    }
  }

  // 发送聊天消息
  public sendChatMessage(content: string, messageId?: string): boolean {
    const message: ChatMessage = {
      type: 'message',
      content,
      timestamp: new Date().toISOString(),
      messageId
    };
    return this.sendMessage(message);
  }

  // 重连
  private reconnect(): void {
    if (!this.isClient()) return;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('达到最大重连次数');
      return;
    }

    this.reconnectAttempts++;
    console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('重连失败:', error);
      });
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  // 断开连接
  public disconnect(): void {
    if (!this.isClient()) return;

    if (this.websocket) {
      this.websocket.close(1000, '正常关闭');
      this.websocket = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  // 检查连接是否打开
  public isConnectionOpen(): boolean {
    if (!this.isClient()) return false;
    return this.websocket?.readyState === WebSocket.OPEN;
  }

  // 获取连接状态
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
}

// 创建WebSocket聊天服务
export const createWebSocketChat = (config: WebSocketChatConfig): WebSocketChatService => {
  return new WebSocketChatService(config);
};

// 连接WebSocket聊天
export const connectWebSocketChat = async (
  conversationId: string,
  onMessage?: (data: any) => void,
  onError?: (error: any) => void,
  onClose?: (event: CloseEvent) => void,
  onOpen?: () => void
): Promise<WebSocketChatService> => {
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

  const config: WebSocketChatConfig = {
    conversationId,
    token,
    onMessage,
    onError,
    onClose,
    onOpen
  };

  const service = new WebSocketChatService(config);
  await service.connect();
  return service;
};
