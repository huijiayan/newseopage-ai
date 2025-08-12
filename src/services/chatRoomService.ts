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

      // 调用聊天API
      const response = await apiClient.chatWithAI(
        this.config.chatType,
        message,
        this.config.conversationId
      );

      // 检查响应格式
      if (response && 'websocket' in response) {
        return {
          success: true,
          conversationId: this.config.conversationId || `temp-${Date.now()}`,
          message: '聊天室创建成功'
        };
      } else if (response && (response as any)?.message?.answer) {
        return {
          success: true,
          conversationId: this.config.conversationId || undefined,
          message: '聊天室创建成功'
        };
      } else {
        return {
          success: false,
          error: '聊天室创建失败'
        };
      }
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
      console.log('🔍 竞品搜索启动');
      console.log('🔍 API调用: apiClient.searchCompetitor(tempConversationId, formattedInput)');
      console.log('🔍 功能: 开始搜索竞争对手');
      
      const response = await apiClient.searchCompetitor(tempConversationId, formattedInput);
      
      console.log('🔍 响应处理:');
      console.log('🔍 检查任务状态 (sitemapStatus)');
      console.log('🔍 处理各种错误码 (1075, 1058, 13002)');
      
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
      console.log('🔍 检查sitemap状态');
      console.log('🔍 搜索完成之后，还要检查sitemapstatus网站地图的处理');
      console.log('🔍 这些数据通过实时聊天将后端的数据推到前端');
      
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

  // 根据域名查找websiteId - 不调用历史记录
  async findWebsiteIdByDomain(domain: string): Promise<string | null> {
    try {
      console.log('🔍 根据域名查找websiteId:', domain);
      console.log('🔍 ✅ 跳过历史记录获取，直接生成新的websiteId');
      
      // 不调用历史记录API，直接生成新的websiteId
      try {
        const generateResponse = await apiClient.generateWebsiteId();
        if (generateResponse?.code === 200 && generateResponse.data?.websiteId) {
          console.log('🔍 ✅ 生成新的websiteId:', generateResponse.data.websiteId);
          return generateResponse.data.websiteId;
        } else {
          console.log('🔍 ⚠️ 生成websiteId失败，使用回退方案');
          // 回退方案：生成一个基于时间戳的websiteId
          const fallbackWebsiteId = `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          console.log('🔍 使用回退websiteId:', fallbackWebsiteId);
          return fallbackWebsiteId;
        }
      } catch (error: any) {
        console.error('🔍 生成websiteId失败:', error);
        // 最后的回退方案
        const fallbackWebsiteId = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log('🔍 使用最终回退websiteId:', fallbackWebsiteId);
        return fallbackWebsiteId;
      }
    } catch (error: any) {
      console.error('🔍 查找websiteId失败:', error);
      return null;
    }
  }

  // 使用includes进行模糊匹配
  private findWebsiteByDomain(domain: string, websites: any[]): any | null {
    const cleanDomain = domain.toLowerCase().trim();
    
    // 精确匹配
    for (const website of websites) {
      const websiteUrl = website.websiteURL || website.website || '';
      const websiteDomain = this.extractDomainFromUrl(websiteUrl);
      
      if (websiteDomain === cleanDomain) {
        console.log('🔍 精确匹配成功:', websiteDomain);
        return website;
      }
    }
    
    // 包含匹配
    for (const website of websites) {
      const websiteUrl = website.websiteURL || website.website || '';
      const websiteDomain = this.extractDomainFromUrl(websiteUrl);
      
      if (websiteDomain.includes(cleanDomain) || cleanDomain.includes(websiteDomain)) {
        console.log('🔍 包含匹配成功:', websiteDomain, '包含', cleanDomain);
        return website;
      }
    }
    
    // 部分匹配（域名的主要部分）
    const domainParts = cleanDomain.split('.');
    if (domainParts.length >= 2) {
      const mainDomain = domainParts.slice(-2).join('.');
      
      for (const website of websites) {
        const websiteUrl = website.websiteURL || website.website || '';
        const websiteDomain = this.extractDomainFromUrl(websiteUrl);
        const websiteDomainParts = websiteDomain.split('.');
        
        if (websiteDomainParts.length >= 2) {
          const websiteMainDomain = websiteDomainParts.slice(-2).join('.');
          
          if (mainDomain === websiteMainDomain) {
            console.log('🔍 主域名匹配成功:', mainDomain);
            return website;
          }
        }
      }
    }
    
    console.log('🔍 未找到匹配的网站');
    return null;
  }

  // 从URL中提取域名
  private extractDomainFromUrl(url: string): string {
    if (!url) return '';
    
    try {
      // 确保URL有协议
      let fullUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = 'https://' + url;
      }
      
      const urlObj = new URL(fullUrl);
      return urlObj.hostname.toLowerCase();
    } catch (error) {
      console.error('🔍 URL解析失败:', url, error);
      return url.toLowerCase();
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
