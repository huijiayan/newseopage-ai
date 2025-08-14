// 聊天室服务
// 处理聊天室创建、域名处理、竞争对手搜索等功能

import apiClient from '@/lib/api';
import { validateDomain, extractDomain } from '@/components/research-tool/utils/research-tool-utils';

export interface ChatRoomConfig {
  chatType: 'alternative' | 'best' | 'faq';
  conversationId?: string | null;
  domain?: string;
}

export interface ChatRoomResponse {
  success: boolean;
  conversationId?: string;
  message?: string;
  error?: string;
}

export interface CompetitorSearchResponse {
  success: boolean;
  competitors?: any[];
  websiteId?: string;
  error?: string;
}

export interface SitemapStatusResponse {
  success: boolean;
  status?: string;
  progress?: number;
  message?: string;
  error?: string;
}

export class ChatRoomService {
  private config: ChatRoomConfig;

  constructor(config: ChatRoomConfig) {
    this.config = config;
  }

  // 创建或继续聊天室
  async createOrContinueChat(message: string): Promise<ChatRoomResponse> {
    try {
      console.log('🔍 创建或继续聊天室:', {
        chatType: this.config.chatType,
        conversationId: this.config.conversationId,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : '')
      });

      // 调用聊天API（仅创建会话并返回会话ID）
      const response = await apiClient.chatWithAI(
        this.config.chatType,
        message,
        this.config.conversationId
      );

      // 新逻辑：返回创建成功与会话ID
      if (response && (response as any).conversationId) {
        return {
          success: true,
          conversationId: (response as any).conversationId,
          message: '聊天室创建成功'
        };
      }
      return { success: false, error: '聊天室创建失败' };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '聊天室创建失败'
      };
    }
  }

  // 处理域名输入
  processDomain(domain: string): string {
    let processedDomain = domain.trim();
    
    // 验证域名格式
    if (!validateDomain(processedDomain)) {
      throw new Error('无效的域名格式');
    }
    
    // 提取域名
    const extractedDomain = extractDomain(processedDomain);
    
    // 存储到localStorage
    localStorage.setItem('currentDomain', extractedDomain);
    localStorage.setItem('currentProductUrl', processedDomain);
    
    return extractedDomain;
  }

  // 启动竞品搜索 - 新增功能
  async startCompetitorSearch(tempConversationId: string, formattedInput: string): Promise<CompetitorSearchResponse> {
    try {
      const response = await apiClient.searchCompetitor(tempConversationId, formattedInput);
      if (response?.code === 200) {
        return {
          success: true,
          competitors: response.data?.competitors || [],
          websiteId: response.data?.websiteId
        };
      } else if (response?.code === 1075) {
        return {
          success: false,
          error: 'There is a task in progress. Please select from the left chat list'
        };
      } else if (response?.code === 1058) {
        return {
          success: false,
          error: 'Encountered a network error. Please try again.'
        };
      } else if (response?.code === 13002) {
        return {
          success: false,
          error: 'Please subscribe before starting a task.'
        };
      } else {
        return {
          success: false,
          error: '竞争对手搜索失败'
        };
      }
    } catch (error: any) {
      console.error('🔍 竞争对手搜索失败:', error);
      return {
        success: false,
        error: error.message || '竞争对手搜索失败'
      };
    }
  }

  // 检查sitemap状态 - 新增功能
  async checkSitemapStatus(websiteId: string): Promise<SitemapStatusResponse> {
    try {
      
      const response = await apiClient.getWebsiteSitemap(websiteId);
      
      if (response?.code === 200) {
        return {
          success: true,
          status: response.data?.status || 'processing',
          progress: response.data?.progress || 0,
          message: response.data?.message || '网站地图处理中'
        };
      } else {
        return {
          success: false,
          error: '获取网站地图状态失败'
        };
      }
    } catch (error: any) {
      console.error('🔍 检查sitemap状态失败:', error);
      return {
        success: false,
        error: error.message || '检查sitemap状态失败'
      };
    }
  }

  // 搜索竞争对手
  async searchCompetitors(domain: string, conversationId: string): Promise<CompetitorSearchResponse> {
    try {
      const response = await apiClient.searchCompetitor(conversationId, domain);
      
      if (response?.code === 200) {
        return {
          success: true,
          competitors: response.data?.competitors || [],
          websiteId: response.data?.websiteId
        };
      } else if (response?.code === 1058) {
        return {
          success: false,
          error: 'Encountered a network error. Please try again.'
        };
      } else if (response?.code === 13002) {
        return {
          success: false,
          error: 'Please subscribe before starting a task.'
        };
      } else {
        return {
          success: false,
          error: '竞争对手搜索失败'
        };
      }
    } catch (error: any) {
      console.error('🔍 竞争对手搜索失败:', error);
      return {
        success: false,
        error: error.message || '竞争对手搜索失败'
      };
    }
  }




  // 获取存储的域名
  getStoredDomain(): string | null {
    return localStorage.getItem('currentDomain');
  }

  // 获取存储的产品URL
  getStoredProductUrl(): string | null {
    return localStorage.getItem('currentProductUrl');
  }

  // 清除存储的域名信息
  clearStoredDomain(): void {
    localStorage.removeItem('currentDomain');
    localStorage.removeItem('currentProductUrl');
  }
}

// 创建聊天室服务实例
export const createChatRoomService = (config: ChatRoomConfig): ChatRoomService => {
  return new ChatRoomService(config);
};

// 默认聊天室服务
export const defaultChatRoomService = createChatRoomService({
  chatType: 'alternative'
});
