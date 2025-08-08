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
  addUserMessage(content: string): void {
    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      source: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    this.setMessages(prev => [...prev, userMessage]);
  }

  // 对应老代码中的addSystemMessage方法
  addSystemMessage(content: string): void {
    const systemMessage: ConversationMessage = {
      id: `system-${Date.now()}`,
      source: 'system',
      content,
      timestamp: new Date().toISOString(),
    };
    
    this.setMessages(prev => [...prev, systemMessage]);
  }

  // 对应老代码中的addAgentThinkingMessage方法
  addAgentThinkingMessage(): string {
    const messageId = `thinking-${Date.now()}`;
    const thinkingMessage: ConversationMessage = {
      id: messageId,
      source: 'agent',
      content: '',
      timestamp: new Date().toISOString(),
      isThinking: true,
    };
    
    this.setMessages(prev => [...prev, thinkingMessage]);
    this.isProcessing = true;
    return messageId;
  }

  // 对应老代码中的updateAgentMessage方法
  updateAgentMessage(content: string, messageId: string): void {
    this.setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content, isThinking: false, showLoading: false }
        : msg
    ));
    this.isProcessing = false;
  }

  // 对应老代码中的addGenerateSitemapButtonMessage方法
  addGenerateSitemapButtonMessage(onGenerate: () => void): void {
    const buttonMessage: ConversationMessage = {
      id: `sitemap-button-${Date.now()}`,
      type: 'sitemap-button',
      content: 'Generate sitemap pages',
      timestamp: new Date().toISOString(),
      source: 'system',
      onGenerate,
    };
    
    this.setMessages(prev => [...prev, buttonMessage]);
  }

  // 对应老代码中的addCustomCongratsMessage方法
  addCustomCongratsMessage(config: { text: string; buttons: Array<{ label: string; action: string }> }): void {
    const congratsMessage: ConversationMessage = {
      id: `congrats-${Date.now()}`,
      type: 'custom-congrats',
      content: config.text,
      timestamp: new Date().toISOString(),
      source: 'system',
    };
    
    this.setMessages(prev => [...prev, congratsMessage]);
  }

  // 对应老代码中的handleErrorMessage方法
  handleErrorMessage(error: any, messageId?: string): void {
    const errorContent = error?.message || 'An unexpected error occurred. Please try again.';
    
    if (messageId) {
      this.updateAgentMessage(`⚠️ ${errorContent}`, messageId);
    } else {
      this.addSystemMessage(`⚠️ ${errorContent}`);
    }
    this.isProcessing = false;
  }

  // 对应老代码中的addImportantTip方法
  addImportantTip(content: string): void {
    const tipMessage: ConversationMessage = {
      id: `tip-${Date.now()}`,
      type: 'important-tip',
      content,
      timestamp: new Date().toISOString(),
      source: 'system',
    };
    
    this.setMessages(prev => [...prev, tipMessage]);
  }

  // 对应老代码中的addConfirmButton方法
  addConfirmButton(content: string, onConfirm: () => void): void {
    const buttonMessage: ConversationMessage = {
      id: `confirm-button-${Date.now()}`,
      type: 'confirm-button',
      content,
      timestamp: new Date().toISOString(),
      source: 'system',
      onConfirm,
    };
    
    this.setMessages(prev => [...prev, buttonMessage]);
  }

  // 清理所有消息
  clearMessages(): void {
    this.setMessages([]);
    this.isProcessing = false;
  }

  // 移除特定消息
  removeMessage(messageId: string): void {
    this.setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }

  // 更新特定消息
  updateMessage(messageId: string, updates: Partial<ConversationMessage>): void {
    this.setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, ...updates }
        : msg
    ));
  }

  // 处理竞品搜索状态更新 - 新增功能
  handleCompetitorSearchUpdate(data: any): void {
    console.log('🔍 处理竞品搜索状态更新:', data);
    
    if (data.status === 'started') {
      this.addSystemMessage('🔍 竞品搜索已启动，正在搜索竞争对手...');
    } else if (data.status === 'processing') {
      this.addSystemMessage(`🔄 竞品搜索进行中... ${data.progress || 0}%`);
    } else if (data.status === 'completed') {
      this.addSystemMessage(`✅ 竞品搜索完成，找到 ${data.competitorsCount || 0} 个竞争对手`);
    } else if (data.status === 'failed') {
      this.addSystemMessage(`❌ 竞品搜索失败: ${data.error || '未知错误'}`);
    }
  }

  // 处理sitemap状态更新 - 新增功能
  handleSitemapStatusUpdate(data: any): void {
    console.log('🔍 处理sitemap状态更新:', data);
    
    if (data.status === 'processing') {
      this.addSystemMessage(`🔄 网站地图处理中... ${data.progress || 0}%`);
    } else if (data.status === 'completed') {
      this.addSystemMessage('✅ 网站地图处理完成');
    } else if (data.status === 'failed') {
      this.addSystemMessage(`❌ 网站地图处理失败: ${data.error || '未知错误'}`);
    }
  }

  // 处理任务状态更新 - 新增功能
  handleTaskStatusUpdate(data: any): void {
    console.log('🔍 处理任务状态更新:', data);
    
    if (data.status === 'started') {
      this.addSystemMessage('🚀 任务已启动');
    } else if (data.status === 'processing') {
      this.addSystemMessage(`🔄 任务处理中... ${data.progress || 0}%`);
    } else if (data.status === 'completed') {
      this.addSystemMessage('✅ 任务完成');
    } else if (data.status === 'failed') {
      this.addSystemMessage(`❌ 任务失败: ${data.error || '未知错误'}`);
    }
  }

  // 处理WebSocket消息 - 增强功能
  handleWebSocketMessage(data: any): void {
    console.log('🔍 处理WebSocket消息:', data);
    
    if (data.type === 'message' && data.content) {
      const thinkingMessageId = `thinking-${Date.now()}`;
      this.updateAgentMessage(data.content, thinkingMessageId);
    } else if (data.type === 'system') {
      this.addSystemMessage(data.content || '系统消息');
    } else if (data.type === 'error') {
      this.addSystemMessage(`⚠️ ${data.content || '发生错误'}`);
    } else if (data.type === 'competitor_search') {
      this.handleCompetitorSearchUpdate(data);
    } else if (data.type === 'sitemap_status') {
      this.handleSitemapStatusUpdate(data);
    } else if (data.type === 'task_status') {
      this.handleTaskStatusUpdate(data);
    }
  }
}