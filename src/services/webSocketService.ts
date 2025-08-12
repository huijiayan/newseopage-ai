import { connectWebSocketChatV2, WebSocketChatV2 } from '@/lib/api/websocket-chat-v2';

export interface WebSocketMessage {
  id?: string;
  type: string;
  content: any;
  step?: string;
  timestamp?: string;
  status?: string;
  domain?: string; // 添加域名字段支持
  conversationId?: string; // 添加会话ID字段支持
}

export interface WebSocketServiceConfig {
  conversationId: string;
  domain?: string; // 添加域名参数
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: any) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
}

export class WebSocketService {
  private chatService: WebSocketChatV2 | null = null;
  private config: WebSocketServiceConfig;
  private isConnected = false;
  private isConnecting = false;

  constructor(config: WebSocketServiceConfig) {
    this.config = config;
  }

  /**
   * 连接WebSocket
   */
  async connect(): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      console.log('🔍 WebSocket已连接或正在连接中，跳过重复连接');
      return;
    }

    try {
      this.isConnecting = true;
      
      console.log('🔍 开始连接WebSocket, 会话ID:', this.config.conversationId);

      this.chatService = await connectWebSocketChatV2(
        this.config.conversationId,
        this.handleMessage.bind(this),
        this.handleError.bind(this),
        this.handleClose.bind(this),
        this.handleOpen.bind(this),
        this.config.domain // 传递域名参数
      );

      console.log('🔍 WebSocket连接成功');
      this.isConnected = true;
    } catch (error: any) {
      console.error('🔍 WebSocket连接失败:', error);
      this.isConnected = false;
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * 断开WebSocket连接
   */
  disconnect(): void {
    console.log('🔍 断开WebSocket连接');
    
    if (this.chatService) {
      this.chatService.disconnect();
      this.chatService = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
  }

  /**
   * 发送消息
   */
  sendMessage(content: string, messageId?: string): boolean {
    if (!this.chatService || !this.isConnected) {
      console.error('🔍 WebSocket未连接，无法发送消息');
      return false;
    }

    return this.chatService.sendChatMessage(content, messageId);
  }

  /**
   * 获取连接状态
   */
  getConnectionState(): string {
    if (!this.chatService) return 'CLOSED';
    return this.chatService.getConnectionState();
  }

  /**
   * 检查是否已连接
   */
  isWebSocketConnected(): boolean {
    return this.isConnected && this.chatService?.isConnectionOpen() === true;
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: any): void {
    console.log('🔍 WebSocketService收到原始消息:', data);
    console.log('🔍 消息类型:', typeof data);
    console.log('🔍 消息结构:', JSON.stringify(data, null, 2));
    
    // 直接传递原始数据，不做任何处理
    this.config.onMessage?.(data);
  }

  /**
   * 处理连接错误
   */
  private handleError(error: any): void {
    console.error('🔍 WebSocket错误:', error);
    this.isConnected = false;
    this.config.onError?.(error);
  }

  /**
   * 处理连接打开
   */
  private handleOpen(): void {
    console.log('🔍 WebSocket连接已打开');
    this.isConnected = true;
    this.config.onOpen?.();
  }

  /**
   * 处理连接关闭
   */
  private handleClose(event: CloseEvent): void {
    console.log('🔍 WebSocket连接已关闭:', event.code);
    this.isConnected = false;
    this.config.onClose?.(event);
  }


}

// 创建WebSocket服务实例
export const createWebSocketService = (config: WebSocketServiceConfig): WebSocketService => {
  return new WebSocketService(config);
};
