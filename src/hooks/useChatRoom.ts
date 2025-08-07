// 聊天室Hook
// 提供React组件中聊天室功能的状态管理和方法

import { useState, useCallback, useRef } from 'react';
import { ChatRoomService, ChatRoomConfig, ChatRoomResponse, CompetitorSearchResponse } from '@/services/chatRoomService';
import { getPageMode } from '@/components/research-tool/utils/research-tool-utils';

export interface UseChatRoomOptions {
  chatType?: 'alternative' | 'best' | 'faq';
  conversationId?: string | null;
  onChatCreated?: (conversationId: string) => void;
  onCompetitorsFound?: (competitors: any[], websiteId?: string) => void;
  onWebsiteIdFound?: (websiteId: string) => void;
  onError?: (error: string) => void;
}

export interface UseChatRoomReturn {
  // 状态
  isCreating: boolean;
  isSearching: boolean;
  error: string | null;
  
  // 方法
  createOrContinueChat: (message: string) => Promise<ChatRoomResponse>;
  processDomain: (domain: string) => string;
  searchCompetitors: (domain: string, conversationId: string) => Promise<CompetitorSearchResponse>;
  findWebsiteIdByDomain: (domain: string) => Promise<string | null>;
  getStoredDomain: () => string | null;
  getStoredProductUrl: () => string | null;
  clearStoredDomain: () => void;
  
  // 服务实例
  chatRoomService: ChatRoomService;
}

export const useChatRoom = (options: UseChatRoomOptions = {}): UseChatRoomReturn => {
  const {
    chatType = getPageMode() as 'alternative' | 'best' | 'faq',
    conversationId,
    onChatCreated,
    onCompetitorsFound,
    onWebsiteIdFound,
    onError
  } = options;

  // 状态
  const [isCreating, setIsCreating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 服务实例
  const chatRoomServiceRef = useRef<ChatRoomService>(
    new ChatRoomService({
      chatType,
      conversationId
    })
  );

  // 创建或继续聊天室
  const createOrContinueChat = useCallback(async (message: string): Promise<ChatRoomResponse> => {
    try {
      setIsCreating(true);
      setError(null);

      console.log('🔍 开始创建或继续聊天室:', {
        chatType,
        conversationId,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : '')
      });

      const response = await chatRoomServiceRef.current.createOrContinueChat(message);

      if (response.success && response.conversationId) {
        console.log('🔍 聊天室创建成功:', response.conversationId);
        onChatCreated?.(response.conversationId);
      } else if (response.error) {
        console.error('🔍 聊天室创建失败:', response.error);
        setError(response.error);
        onError?.(response.error);
      }

      return response;
    } catch (error: any) {
      console.error('🔍 聊天室创建异常:', error);
      const errorMessage = error.message || '聊天室创建失败';
      setError(errorMessage);
      onError?.(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsCreating(false);
    }
  }, [chatType, conversationId, onChatCreated, onError]);

  // 处理域名
  const processDomain = useCallback((domain: string): string => {
    try {
      setError(null);
      const processedDomain = chatRoomServiceRef.current.processDomain(domain);
      console.log('🔍 域名处理成功:', processedDomain);
      return processedDomain;
    } catch (error: any) {
      console.error('🔍 域名处理失败:', error);
      const errorMessage = error.message || '域名处理失败';
      setError(errorMessage);
      onError?.(errorMessage);
      throw error;
    }
  }, [onError]);

  // 搜索竞争对手
  const searchCompetitors = useCallback(async (domain: string, conversationId: string): Promise<CompetitorSearchResponse> => {
    try {
      setIsSearching(true);
      setError(null);

      console.log('🔍 开始搜索竞争对手:', {
        domain,
        conversationId,
        chatType
      });

      const response = await chatRoomServiceRef.current.searchCompetitors(domain, conversationId);

      if (response.success) {
        console.log('🔍 竞争对手搜索成功:', {
          competitorsCount: response.competitors?.length || 0,
          websiteId: response.websiteId
        });
        onCompetitorsFound?.(response.competitors || [], response.websiteId);
      } else if (response.error) {
        console.error('🔍 竞争对手搜索失败:', response.error);
        setError(response.error);
        onError?.(response.error);
      }

      return response;
    } catch (error: any) {
      console.error('🔍 竞争对手搜索异常:', error);
      const errorMessage = error.message || '竞争对手搜索失败';
      setError(errorMessage);
      onError?.(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsSearching(false);
    }
  }, [chatType, onCompetitorsFound, onError]);

  // 根据域名查找websiteId
  const findWebsiteIdByDomain = useCallback(async (domain: string): Promise<string | null> => {
    try {
      setError(null);
      const websiteId = await chatRoomServiceRef.current.findWebsiteIdByDomain(domain);
      console.log('🔍 websiteId查找结果:', websiteId);
      
      if (websiteId) {
        console.log('🔍 找到websiteId，触发回调:', websiteId);
        onWebsiteIdFound?.(websiteId);
      }
      
      return websiteId;
    } catch (error: any) {
      console.error('🔍 websiteId查找失败:', error);
      const errorMessage = error.message || 'websiteId查找失败';
      setError(errorMessage);
      onError?.(errorMessage);
      return null;
    }
  }, [onError, onWebsiteIdFound]);

  // 获取存储的域名
  const getStoredDomain = useCallback((): string | null => {
    return chatRoomServiceRef.current.getStoredDomain();
  }, []);

  // 获取存储的产品URL
  const getStoredProductUrl = useCallback((): string | null => {
    return chatRoomServiceRef.current.getStoredProductUrl();
  }, []);

  // 清除存储的域名信息
  const clearStoredDomain = useCallback((): void => {
    chatRoomServiceRef.current.clearStoredDomain();
    console.log('🔍 已清除存储的域名信息');
  }, []);

  return {
    // 状态
    isCreating,
    isSearching,
    error,
    
    // 方法
    createOrContinueChat,
    processDomain,
    searchCompetitors,
    findWebsiteIdByDomain,
    getStoredDomain,
    getStoredProductUrl,
    clearStoredDomain,
    
    // 服务实例
    chatRoomService: chatRoomServiceRef.current,
  };
};
