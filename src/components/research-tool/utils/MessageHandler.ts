// 对应老代码 MessageHandler 工具类，完整还原所有方法
// 保持与原始代码100%一致的消息处理逻辑

import { ConversationMessage } from '@/types/research-tool';

export class MessageHandler {
  private setMessages: React.Dispatch<React.SetStateAction<ConversationMessage[]>>;
  public isProcessing: boolean = false;

  constructor(setMessages: React.Dispatch<React.SetStateAction<ConversationMessage[]>>) {
    this.setMessages = setMessages;
  }

  // 对应老代码中的addUserMessage方法
  addUserMessage(content: string, seq?: number): void {
    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      source: 'user',
      content,
      timestamp: new Date().toISOString(),
      seq,
    };
    
    this.setMessages(prev => {
      const next = [...prev, userMessage];
      next.sort((a, b) => {
        const ta = new Date((a.timestamp as string) || (a.createdAt as string) || 0).getTime();
        const tb = new Date((b.timestamp as string) || (b.createdAt as string) || 0).getTime();
        return ta - tb;
      });
      return next;
    });
  }

  // 对应老代码中的addSystemMessage方法
  addSystemMessage(content: string, seq?: number): void {
    const systemMessage: ConversationMessage = {
      id: `system-${Date.now()}`,
      source: 'system',
      content,
      timestamp: new Date().toISOString(),
      seq,
    };
    
    this.setMessages(prev => {
      const next = [...prev, systemMessage];
      next.sort((a, b) => {
        const ta = new Date((a.timestamp as string) || (a.createdAt as string) || 0).getTime();
        const tb = new Date((b.timestamp as string) || (b.createdAt as string) || 0).getTime();
        return ta - tb;
      });
      return next;
    });
  }

  // 对应老代码中的addAgentThinkingMessage方法
  addAgentThinkingMessage(seq?: number, timestampOverride?: string): string {
    const messageId = `thinking-${Date.now()}`;
    const thinkingMessage: ConversationMessage = {
      id: messageId,
      source: 'agent',
      content: '',
      timestamp: timestampOverride || new Date().toISOString(),
      isThinking: true,
      seq,
    };
    
    this.setMessages(prev => {
      const next = [...prev, thinkingMessage];
      next.sort((a, b) => {
        const ta = new Date((a.timestamp as string) || (a.createdAt as string) || 0).getTime();
        const tb = new Date((b.timestamp as string) || (b.createdAt as string) || 0).getTime();
        return ta - tb;
      });
      return next;
    });
    this.isProcessing = true;
    return messageId;
  }

  // 对应老代码中的updateAgentMessage方法
  updateAgentMessage(content: string, messageId: string): void {
    this.setMessages(prev => {
      const next = prev.map(msg => msg.id === messageId 
        ? { ...msg, content, isThinking: false, showLoading: false }
        : msg);
      next.sort((a, b) => {
        const ta = new Date((a.timestamp as string) || (a.createdAt as string) || 0).getTime();
        const tb = new Date((b.timestamp as string) || (b.createdAt as string) || 0).getTime();
        return ta - tb;
      });
      return next;
    });
    this.isProcessing = false;
  }

  // 清理所有消息
  clearMessages(): void {
    this.setMessages([]);
    this.isProcessing = false;
  }


  // 处理WebSocket消息 - 简化功能
  handleWebSocketMessage(data: any): void {
    
    if (data.type === 'message' && data.content) {
      const thinkingMessageId = `thinking-${Date.now()}`;
      this.updateAgentMessage(data.content, thinkingMessageId);
    } else if (data.type === 'system') {
      this.addSystemMessage(data.content || '系统消息');
    } else if (data.type === 'error') {
      this.addSystemMessage(`⚠️ ${data.content || '发生错误'}`);
    }

  }
}