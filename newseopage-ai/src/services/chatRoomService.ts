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
        console.log('🔍 WebSocket模式，聊天室创建成功');
        return {
          success: true,
          conversationId: this.config.conversationId || `temp-${Date.now()}`,
          message: '聊天室创建成功'
        };
      } else if (response && (response as any)?.message?.answer) {
        console.log('🔍 HTTP模式，聊天室创建成功');
        return {
          success: true,
          conversationId: this.config.conversationId || undefined,
          message: '聊天室创建成功'
        };
      } else {
        console.error('🔍 聊天室创建失败: 无效响应');
        return {
          success: false,
          error: '聊天室创建失败'
        };
      }
    } catch (error: any) {
      console.error('🔍 聊天室创建失败:', error);
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
    
    console.log('🔍 域名已处理并存储:', {
      original: processedDomain,
      extracted: extractedDomain,
      chatType: this.config.chatType
    });
    
    return extractedDomain;
  }

  // 搜索竞争对手
  async searchCompetitors(domain: string, conversationId: string): Promise<CompetitorSearchResponse> {
    try {
      console.log('🔍 搜索竞争对手:', {
        domain,
        conversationId,
        chatType: this.config.chatType
      });

      const response = await apiClient.searchCompetitor(conversationId, domain);
      
      if (response?.code === 200) {
        console.log('🔍 竞争对手搜索成功');
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

  // 根据域名查找websiteId - 使用前端匹配逻辑
  async findWebsiteIdByDomain(domain: string): Promise<string | null> {
    try {
      console.log('🔍 根据域名查找websiteId:', domain);
      
      // 获取网站列表进行匹配
      const websiteListResponse = await apiClient.getAlternativeWebsiteList();
      
      if (websiteListResponse?.code === 200 && websiteListResponse.data) {
        const websites = websiteListResponse.data;
        console.log('🔍 获取到网站列表:', websites.length, '个网站');
        
        // 使用includes进行模糊匹配
        const matchedWebsite = this.findWebsiteByDomain(domain, websites);
        
        if (matchedWebsite) {
          console.log('🔍 找到匹配的网站:', matchedWebsite);
          return matchedWebsite.websiteId || matchedWebsite.id;
        } else {
          console.log('🔍 未找到匹配的网站，使用回退机制');
          // 回退机制：使用第一个网站或生成新的websiteId
          if (websites.length > 0) {
            const fallbackWebsite = websites[0];
            console.log('🔍 使用回退网站:', fallbackWebsite);
            return fallbackWebsite.websiteId || fallbackWebsite.id;
          } else {
            console.log('🔍 网站列表为空，尝试生成新的websiteId');
            // 尝试生成新的websiteId
            try {
              const generateResponse = await apiClient.generateWebsiteId();
              if (generateResponse?.code === 200 && generateResponse.data?.websiteId) {
                console.log('🔍 生成新的websiteId:', generateResponse.data.websiteId);
                return generateResponse.data.websiteId;
              }
            } catch (error) {
              console.error('🔍 生成websiteId失败:', error);
            }
          }
        }
      } else {
        console.error('🔍 获取网站列表失败:', websiteListResponse);
      }
      
      return null;
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
