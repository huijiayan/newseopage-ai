import apiClient from '@/lib/api';

export interface CompetitorSearchConfig {
  domain: string;
  conversationId: string;
}

export interface CompetitorSearchResult {
  success: boolean;
  competitors?: string[];
  websiteId?: string;
  error?: string;
  code?: number;
}

export interface DomainMatchResult {
  success: boolean;
  websiteId?: string;
  matchedWebsite?: any;
  error?: string;
}

export class CompetitorSearchService {

  /**
   * 搜索竞争对手
   */
  async searchCompetitors(config: CompetitorSearchConfig): Promise<CompetitorSearchResult> {
    try {
      console.log('🔍 ===== 开始搜索竞争对手 =====');
      console.log('🔍 域名:', config.domain);
      console.log('🔍 会话ID:', config.conversationId);
      console.log('🔍 请求时间:', new Date().toISOString());
      
      const response = await apiClient.searchCompetitor(config.conversationId, config.domain);
      console.log('🔍 ===== 竞争对手搜索响应 =====');
      console.log('🔍 响应代码:', response?.code);
      console.log('🔍 响应状态:', response?.status);
      console.log('🔍 响应数据:', response?.data);
      console.log('🔍 完整响应:', JSON.stringify(response, null, 2));
      console.log('🔍 响应时间:', new Date().toISOString());

      if (response?.code === 200) {
        console.log('🔍 ✅ 竞争对手搜索成功');
        console.log('🔍 找到竞争对手数量:', response.data?.competitors?.length || 0);
        console.log('🔍 竞争对手列表:', response.data?.competitors);
        console.log('🔍 网站ID:', response.data?.websiteId);
        return {
          success: true,
          competitors: response.data?.competitors || [],
          websiteId: response.data?.websiteId,
        };
      } else if (response?.code === 1075) {
        console.log('🔍 ❌ 任务进行中错误 (1075)');
        return {
          success: false,
          error: 'There is a task in progress. Please select from the left chat list',
          code: 1075
        };
      } else if (response?.code === 1058) {
        console.log('🔍 ❌ 网络错误 (1058)');
        return {
          success: false,
          error: 'Encountered a network error. Please try again.',
          code: 1058
        };
      } else if (response?.code === 13002) {
        console.log('🔍 ❌ 订阅错误 (13002)');
        return {
          success: false,
          error: 'Please subscribe before starting a task.',
          code: 13002
        };
      } else {
        console.log('🔍 ❌ 未知错误，代码:', response?.code);
        return {
          success: false,
          error: '竞争对手搜索失败',
          code: response?.code
        };
      }
    } catch (error: any) {
      console.error('🔍 ===== 竞争对手搜索异常 =====');
      console.error('🔍 错误对象:', error);
      console.error('🔍 错误消息:', error?.message);
      console.error('🔍 错误堆栈:', error?.stack);
      console.error('🔍 错误时间:', new Date().toISOString());
      return {
        success: false,
        error: error?.message || '竞争对手搜索失败'
      };
    }
  }

  /**
   * 根据域名查找websiteId (不调用历史记录)
   */
  async findWebsiteIdByDomain(domain: string): Promise<DomainMatchResult> {
    try {
      console.log('🔍 ===== 开始查找websiteId =====');
      console.log('🔍 查找域名:', domain);
      console.log('🔍 请求时间:', new Date().toISOString());
      
      // 不调用历史记录API，直接返回成功状态
      console.log('🔍 ✅ 跳过历史记录获取，直接返回成功');
      console.log('🔍 处理时间:', new Date().toISOString());
      
      // 返回一个模拟的成功结果，不依赖历史数据
      return {
        success: true,
        websiteId: `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        matchedWebsite: {
          websiteId: `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          websiteURL: domain,
          website: domain
        }
      };
    } catch (error: any) {
      console.error('🔍 ===== 查找websiteId异常 =====');
      console.error('🔍 错误对象:', error);
      console.error('🔍 错误消息:', error?.message);
      console.error('🔍 错误堆栈:', error?.stack);
      console.error('🔍 错误时间:', new Date().toISOString());
      return {
        success: false,
        error: error?.message || '查找websiteId失败'
      };
    }
  }

  /**
   * 处理域名格式化
   */
  processDomain(domain: string): string {
    if (!domain || !domain.trim()) {
      throw new Error('域名不能为空');
    }

    let cleanDomain = domain.trim();

    // 验证域名格式
    if (!this.validateDomain(cleanDomain)) {
      throw new Error('域名格式无效');
    }

    // 提取域名
    const extractedDomain = this.extractDomainFromUrl(cleanDomain);
    
    console.log('🔍 域名处理结果:', {
      original: domain,
      extracted: extractedDomain
    });

    return extractedDomain;
  }

  /**
   * 使用includes进行模糊匹配
   */


  /**
   * 从URL中提取域名
   */
  private extractDomainFromUrl(url: string): string {
    if (!url) return '';
    
    try {
      // 如果不是完整URL，添加协议
      if (!url.match(/^https?:\/\//i)) {
        url = 'https://' + url;
      }
      
      const urlObj = new URL(url);
      return urlObj.hostname.toLowerCase();
    } catch (error) {
      // 如果URL解析失败，尝试简单的字符串处理
      return url.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
    }
  }

  /**
   * 验证域名格式
   */
  private validateDomain(input: string): boolean {
    if (!input || !input.trim()) return false;
    
    let domain = input.trim();
    
    try {
      // 检查是否是纯数字
      if (/^\d+$/.test(domain)) {
        return false;
      }
      
      // 添加协议前缀进行URL验证
      if (!domain.match(/^https?:\/\//i)) {
        domain = 'https://' + domain;
      }
      
      const url = new URL(domain);
      domain = url.hostname;
      
      // 检查是否包含至少一个点
      if (!domain.includes('.')) {
        return false;
      }
      
      // 使用正则表达式验证域名格式
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      return domainRegex.test(domain);
    } catch (error) {
      return false;
    }
  }
}

// 创建单例实例
export const competitorSearchService = new CompetitorSearchService();
