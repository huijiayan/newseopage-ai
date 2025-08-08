// WebSocket连接管理器
// 提供更好的连接管理和错误处理

export interface WebSocketManagerConfig {
  url: string;
  token: string;
  conversationId: string;
  onMessage?: (data: any) => void;
  onError?: (error: any) => void;
  onClose?: (event: CloseEvent) => void;
  onOpen?: () => void;
}

export class WebSocketManager {
  private websocket: WebSocket | null = null;
  private config: WebSocketManagerConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private isConnected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(config: WebSocketManagerConfig) {
    this.config = config;
  }

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  public connect(): Promise<void> {
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
        console.log('🔍 ===== WebSocket Manager 连接信息 =====');
        console.log('🔍 WebSocket URL:', this.config.url);
        console.log('🔍 ConversationId:', this.config.conversationId);
        console.log('🔍 Token存在:', !!this.config.token);
        console.log('🔍 Token预览:', this.config.token ? `${this.config.token.substring(0, 20)}...` : '无Token');
        console.log('🔍 =====================================');
        
        this.websocket = new WebSocket(this.config.url);

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
            console.log('🔍 ===== WebSocket Manager 消息接收 =====');
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
            
            console.log('🔍 =====================================');
            
            this.config.onMessage?.(data);
          } catch (error) {
            console.error('🔍 WebSocket Manager 消息解析失败:', error);
            console.error('🔍 原始消息内容:', event.data);
            this.config.onError?.(error);
          }
        };

        this.websocket.onerror = (error) => {
          console.error('🔍 WebSocket连接错误:', error);
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
          console.log('🔍 WebSocket连接已关闭:', event.code, event.reason);
          this.isConnected = false;
          this.isConnecting = false;
          
          // 清除重连定时器
          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
          }
          
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
        console.error('🔍 创建WebSocket连接失败:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

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

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('🔍 重连失败:', error);
      });
    }, delay);
  }

  public disconnect(): void {
    if (!this.isClient()) return;

    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.websocket) {
      this.websocket.close(1000, '正常关闭');
      this.websocket = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  public sendMessage(message: any): boolean {
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
}

// 创建WebSocket管理器
export const createWebSocketManager = (config: WebSocketManagerConfig): WebSocketManager => {
  return new WebSocketManager(config);
};
