import apiClient from '../lib/api/index';

interface ChatSessionParams {
  chatType: string;
  message: string;
  conversationId?: string | null;
}

interface PublishStatusParams {
  resultId: string;
  status: string;
  siteURL: string;
}

interface GenerateAlternativeParams {
  conversationId: string;
  hubPageIds: string[];
  websiteId: string;
}

interface AlternativeDetailOptions {
  [key: string]: any;
}

class AlternativePageService {
  // 创建新的聊天会话
  async createChatSession(chatType: string, message: string, conversationId: string | null = null) {
    try {
      const response = await apiClient.chatWithAI(chatType, message, conversationId);
      return response;
    } catch (error) {
      console.error('Failed to create chat session:', error);
      throw error;
    }
  }

  // 创建SSE流式聊天会话
  async createStreamChatSession(chatType: string, message: string, conversationId: string | null = null, onMessage?: (data: any) => void) {
    try {
      const response = await apiClient.chatWithAI(chatType, message, conversationId, undefined, onMessage);
      return response;
    } catch (error) {
      console.error('Failed to create stream chat session:', error);
      throw error;
    }
  }

  // 获取聊天历史 - 已删除API调用
  async getChatHistory(conversationId: string) {
    console.log('🔍 跳过聊天历史API调用，不获取历史记录');
    return { code: 200, data: [] };
  }

  // 获取网站列表
  async getWebsiteList(page: number = 1, limit: number = 100) {
    try {
      const response = await apiClient.getAlternativeWebsiteList(page, limit);
      return response;
    } catch (error) {
      console.error('Failed to get website list:', error);
      throw error;
    }
  }

  // 获取网站结果列表
  async getWebsiteResultList(websiteId: string) {
    try {
      const response = await apiClient.getAlternativeWebsiteResultList(websiteId);
      return response;
    } catch (error) {
      console.error('Failed to get website result list:', error);
      throw error;
    }
  }

  // 获取客户套餐信息
  async getCustomerPackage() {
    try {
      const response = await apiClient.getCustomerPackage();
      return response;
    } catch (error) {
      console.error('Failed to get customer package:', error);
      return null;
    }
  }

  // 删除页面
  async deletePage(websiteId: string) {
    try {
      const response = await apiClient.deletePage(websiteId);
      return response;
    } catch (error) {
      console.error('Failed to delete page:', error);
      return null;
    }
  }

  // 更新页面发布状态
  async updatePublishStatus(resultId: string, status: string, siteURL: string) {
    try {
      const response = await apiClient.updateAlternativePublishStatus(resultId, status, siteURL);
      return response;
    } catch (error) {
      console.error('Failed to update publish status:', error);
      throw error;
    }
  }

  // 更新页面Slug
  async updateSlug(resultId: string, slug: string) {
    try {
      const response = await apiClient.updateAlternativeSlug(resultId, slug);
      return response;
    } catch (error) {
      console.error('Failed to update slug:', error);
      throw error;
    }
  }

  // 获取网站Sitemap
  async getWebsiteSitemap(websiteId: string) {
    try {
      const response = await apiClient.getWebsiteSitemap(websiteId);
      return response;
    } catch (error) {
      console.error('Failed to get website sitemap:', error);
      throw error;
    }
  }

  // 搜索竞争对手
  async searchCompetitor(conversationId: string, website: string) {
    try {
      const response = await apiClient.searchCompetitor(conversationId, website);
      return response;
    } catch (error: any) {
      console.error('Failed to search competitor:', error.message);
      throw error;
    }
  }

  // 生成替代页面
  async generateAlternative(conversationId: string, hubPageIds: string[], websiteId: string) {
    try {
      const response = await apiClient.generateAlternative(conversationId, hubPageIds, websiteId);
      return response;
    } catch (error: any) {
      console.error('Failed to generate alternative:', error.message);
      throw error;
    }
  }

  // 获取替代页面详情
  async getAlternativeDetail(websiteId: string, options: AlternativeDetailOptions = {}) {
    try {
      const response = await apiClient.getAlternativeDetail(websiteId, options);
      return response;
    } catch (error) {
      console.error('Failed to get alternative detail:', error);
      throw error;
    }
  }

  // 获取替代页面来源
  async getAlternativeSources(websiteId: string) {
    try {
      const response = await apiClient.getAlternativeSources(websiteId);
      return response;
    } catch (error) {
      console.error('Failed to get alternative sources:', error);
      throw error;
    }
  }

  // 获取替代页面结果
  async getAlternativeResult(websiteId: string) {
    try {
      const response = await apiClient.getAlternativeResult(websiteId);
      return response;
    } catch (error) {
      console.error('Failed to get alternative result:', error);
      throw error;
    }
  }

  // 修改样式
  async changeStyle(styleColor: string, websiteId: string) {
    try {
      const response = await apiClient.changeStyle(styleColor, websiteId);
      return response;
    } catch (error) {
      console.error('Failed to change style:', error);
      throw error;
    }
  }

  // 获取替代页面状态
  async getAlternativeStatus(websiteId: string) {
    try {
      const response = await apiClient.getAlternativeStatus(websiteId);
      return response;
    } catch (error: any) {
      console.error('Failed to get alternative status:', error.message);
      throw error;
    }
  }
}

export default new AlternativePageService(); 