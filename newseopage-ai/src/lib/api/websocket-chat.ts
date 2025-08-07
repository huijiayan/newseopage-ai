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
        console.log('🔍 ===== WebSocket Chat 连接信息 =====');
        console.log('🔍 WebSocket URL:', wsUrl);
        console.log('🔍 ConversationId:', this.config.conversationId);
        console.log('🔍 Token存在:', !!this.config.token);
        console.log('🔍 Token预览:', this.config.token ? `${this.config.token.substring(0, 20)}...` : '无Token');
        console.log('🔍 ===================================');
        
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
            console.log('🔍 ===== WebSocket Chat 消息接收 =====');
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
            
            console.log('🔍 ===================================');
            
            this.config.onMessage?.(data);
          } catch (error) {
            console.error('🔍 WebSocket Chat 消息解析失败:', error);
            console.error('🔍 原始消息内容:', event.data);
            this.config.onError?.(error);
          }
        };

        this.websocket.onerror = (error) => {
          console.error('WebSocket连接错误:', error);
          this.isConnecting = false;
          
          // 检查是否是资源不足错误
          if (error && typeof error === 'object' && 'message' in error) {
            const errorMessage = (error as any).message;
            if (errorMessage && errorMessage.includes('Insufficient resources')) {
              console.warn('🔍 WebSocket连接失败：服务器资源不足，将在5秒后重试');
              setTimeout(() => {
                this.reconnect();
              }, 5000);
            }
          }
          
          this.config.onError?.(error);
          reject(error);
        };

        this.websocket.onclose = (event) => {
          console.log('WebSocket连接已关闭:', event.code, event.reason);
          this.isConnected = false;
          this.isConnecting = false;
          
          // 检查关闭代码，决定是否重连
          if (event.code !== 1000 && event.code !== 1001) {
            // 非正常关闭，尝试重连
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
              console.log(`🔍 WebSocket非正常关闭 (${event.code})，尝试重连...`);
              this.reconnect();
            } else {
              console.error('🔍 WebSocket重连次数已达上限，停止重连');
            }
          } else {
            console.log('🔍 WebSocket正常关闭，不进行重连');
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
      console.log('🔍 达到最大重连次数，停止重连');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔍 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    // 使用指数退避策略
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    console.log(`🔍 重连延迟: ${delay}ms`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('🔍 重连失败:', error);
      });
    }, delay);
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
