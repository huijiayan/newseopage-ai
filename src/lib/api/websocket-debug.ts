// WebSocket调试和监控工具
// 提供连接状态监控、错误诊断和性能分析

export interface WebSocketDebugInfo {
  url: string;
  readyState: number;
  readyStateText: string;
  bufferedAmount: number;
  protocol: string;
  extensions: string;
  timestamp: number;
  connectionDuration: number;
  messageCount: number;
  errorCount: number;
  reconnectAttempts: number;
  lastError?: string;
  lastMessageTime?: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

export interface WebSocketMetrics {
  totalConnections: number;
  successfulConnections: number;
  failedConnections: number;
  totalMessages: number;
  totalErrors: number;
  averageConnectionTime: number;
  uptime: number;
}

export class WebSocketDebugger {
  private static instance: WebSocketDebugger;
  private metrics: WebSocketMetrics;
  private connectionStartTime: number = 0;
  private messageCount: number = 0;
  private errorCount: number = 0;
  private lastMessageTime: number = 0;
  private connectionAttempts: number = 0;
  private successfulConnections: number = 0;
  private failedConnections: number = 0;
  private totalConnectionTime: number = 0;

  private constructor() {
    this.metrics = {
      totalConnections: 0,
      successfulConnections: 0,
      failedConnections: 0,
      totalMessages: 0,
      totalErrors: 0,
      averageConnectionTime: 0,
      uptime: 0
    };
  }

  public static getInstance(): WebSocketDebugger {
    if (!WebSocketDebugger.instance) {
      WebSocketDebugger.instance = new WebSocketDebugger();
    }
    return WebSocketDebugger.instance;
  }

  // 记录连接开始
  public recordConnectionStart(): void {
    this.connectionStartTime = Date.now();
    this.connectionAttempts++;
    this.metrics.totalConnections++;
  }

  // 记录连接成功
  public recordConnectionSuccess(): void {
    if (this.connectionStartTime > 0) {
      const connectionTime = Date.now() - this.connectionStartTime;
      this.totalConnectionTime += connectionTime;
      this.metrics.averageConnectionTime = this.totalConnectionTime / this.metrics.successfulConnections;
    }
    this.successfulConnections++;
    this.metrics.successfulConnections++;
    this.connectionStartTime = 0;
  }

  // 记录连接失败
  public recordConnectionFailure(error?: string): void {
    this.failedConnections++;
    this.metrics.failedConnections++;
    this.connectionStartTime = 0;
    if (error) {
      console.error('🔍 WebSocket连接失败:', error);
    }
  }

  // 记录消息接收
  public recordMessage(): void {
    this.messageCount++;
    this.lastMessageTime = Date.now();
    this.metrics.totalMessages++;
  }

  // 记录错误
  public recordError(error: any): void {
    this.errorCount++;
    this.metrics.totalErrors++;
    console.error('🔍 WebSocket错误:', error);
  }

  // 获取连接信息
  public getConnectionInfo(websocket: WebSocket | null, url: string): WebSocketDebugInfo {
    if (!websocket) {
      return {
        url,
        readyState: 3, // CLOSED
        readyStateText: 'CLOSED',
        bufferedAmount: 0,
        protocol: '',
        extensions: '',
        timestamp: Date.now(),
        connectionDuration: 0,
        messageCount: this.messageCount,
        errorCount: this.errorCount,
        reconnectAttempts: this.connectionAttempts,
        connectionQuality: 'disconnected'
      };
    }

    const now = Date.now();
    const connectionDuration = this.connectionStartTime > 0 ? now - this.connectionStartTime : 0;
    
    let connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected' = 'disconnected';
    if (websocket.readyState === WebSocket.OPEN) {
      if (this.errorCount === 0 && this.messageCount > 0) {
        connectionQuality = 'excellent';
      } else if (this.errorCount < 3) {
        connectionQuality = 'good';
      } else {
        connectionQuality = 'poor';
      }
    }

    return {
      url,
      readyState: websocket.readyState,
      readyStateText: this.getReadyStateText(websocket.readyState),
      bufferedAmount: websocket.bufferedAmount,
      protocol: websocket.protocol,
      extensions: websocket.extensions,
      timestamp: now,
      connectionDuration,
      messageCount: this.messageCount,
      errorCount: this.errorCount,
      reconnectAttempts: this.connectionAttempts,
      lastError: this.getLastError(),
      lastMessageTime: this.lastMessageTime,
      connectionQuality
    };
  }

  // 获取性能指标
  public getMetrics(): WebSocketMetrics {
    this.metrics.uptime = Date.now() - (this.connectionStartTime || Date.now());
    return { ...this.metrics };
  }

  // 重置指标
  public resetMetrics(): void {
    this.metrics = {
      totalConnections: 0,
      successfulConnections: 0,
      failedConnections: 0,
      totalMessages: 0,
      totalErrors: 0,
      averageConnectionTime: 0,
      uptime: 0
    };
    this.messageCount = 0;
    this.errorCount = 0;
    this.connectionAttempts = 0;
    this.successfulConnections = 0;
    this.failedConnections = 0;
    this.totalConnectionTime = 0;
  }

  // 诊断连接问题
  public diagnoseConnection(websocket: WebSocket | null, url: string): string[] {
    const issues: string[] = [];
    const info = this.getConnectionInfo(websocket, url);

    if (info.readyState === WebSocket.CLOSED) {
      issues.push('WebSocket连接已关闭');
      
      if (this.errorCount > 0) {
        issues.push(`检测到 ${this.errorCount} 个错误`);
      }
      
      if (this.connectionAttempts > 5) {
        issues.push(`重连次数过多 (${this.connectionAttempts})，可能存在网络问题`);
      }
    }

    if (info.readyState === WebSocket.CONNECTING && info.connectionDuration > 10000) {
      issues.push('连接超时，可能存在网络延迟或服务器问题');
    }

    if (info.connectionQuality === 'poor') {
      issues.push('连接质量较差，建议检查网络环境');
    }

    if (this.lastMessageTime > 0 && Date.now() - this.lastMessageTime > 60000) {
      issues.push('长时间未收到消息，连接可能已断开');
    }

    return issues;
  }

  // 获取连接建议
  public getConnectionAdvice(issues: string[]): string[] {
    const advice: string[] = [];

    if (issues.includes('WebSocket连接已关闭')) {
      advice.push('尝试重新连接');
      advice.push('检查网络连接是否正常');
      advice.push('确认服务器是否在线');
    }

    if (issues.includes('连接超时')) {
      advice.push('检查网络延迟');
      advice.push('尝试使用不同的网络环境');
      advice.push('联系技术支持');
    }

    if (issues.includes('连接质量较差')) {
      advice.push('优化网络环境');
      advice.push('减少网络干扰');
      advice.push('考虑使用有线连接');
    }

    if (issues.includes('长时间未收到消息')) {
      advice.push('发送心跳消息测试连接');
      advice.push('检查服务器状态');
      advice.push('重新建立连接');
    }

    return advice;
  }

  private getReadyStateText(readyState: number): string {
    switch (readyState) {
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

  private getLastError(): string | undefined {
    // 这里可以扩展为存储具体的错误信息
    return this.errorCount > 0 ? `检测到 ${this.errorCount} 个错误` : undefined;
  }

  // 生成诊断报告
  public generateDiagnosticReport(websocket: WebSocket | null, url: string): string {
    const info = this.getConnectionInfo(websocket, url);
    const issues = this.diagnoseConnection(websocket, url);
    const advice = this.getConnectionAdvice(issues);
    const metrics = this.getMetrics();

    return `
🔍 WebSocket 诊断报告
====================

连接状态:
- URL: ${info.url}
- 状态: ${info.readyStateText} (${info.readyState})
- 连接质量: ${info.connectionQuality}
- 连接时长: ${info.connectionDuration}ms

性能指标:
- 总连接次数: ${metrics.totalConnections}
- 成功连接: ${metrics.successfulConnections}
- 失败连接: ${metrics.failedConnections}
- 消息数量: ${metrics.totalMessages}
- 错误数量: ${metrics.totalErrors}
- 平均连接时间: ${metrics.averageConnectionTime.toFixed(2)}ms

检测到的问题:
${issues.length > 0 ? issues.map(issue => `- ${issue}`).join('\n') : '- 无问题'}

建议:
${advice.length > 0 ? advice.map(advice => `- ${advice}`).join('\n') : '- 连接正常'}

时间: ${new Date().toLocaleString()}
    `.trim();
  }
}

// 导出单例实例
export const websocketDebugger = WebSocketDebugger.getInstance();
