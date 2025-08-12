import { useState, useCallback, useRef, useEffect } from 'react';
import { competitorSearchService, type CompetitorSearchResult, type DomainMatchResult } from '@/services/competitorSearchService';
import { createWebSocketService, type WebSocketService, type WebSocketMessage } from '@/services/webSocketService';

export interface CompetitorFlowConfig {
  conversationId?: string | null;
  domain?: string; // 添加域名参数
  onCompetitorsFound?: (competitors: string[], websiteId?: string) => void;
  onWebsiteIdFound?: (websiteId: string, matchedWebsite?: any) => void;
  onWebSocketMessage?: (message: WebSocketMessage) => void;
  onWebSocketConnected?: () => void;
  onWebSocketError?: (error: any) => void;
  onWebSocketClosed?: (event: CloseEvent) => void;
  onError?: (error: string) => void;
}

export interface CompetitorFlowState {
  isConnectingWebSocket: boolean;
  isWebSocketConnected: boolean;
  webSocketError: string | null;
  competitors: string[]; // 添加竞争对手列表
  websiteId: string | null; // 添加网站ID
}

export interface CompetitorFlowActions {
  connectWebSocket: (conversationId: string, domain?: string) => Promise<void>; // 添加domain参数
  disconnectWebSocket: () => void;
  processDomain: (domain: string) => string;
  sendWebSocketMessage: (content: string, messageId?: string) => boolean;
  resetFlow: () => void;
  searchCompetitors: (domain: string, conversationId: string) => Promise<CompetitorSearchResult>; // 添加搜索竞争对手方法
  findWebsiteId: (domain: string) => Promise<DomainMatchResult>; // 添加查找网站ID方法
  executeFullFlow: (domain: string, conversationId: string) => Promise<{
    searchResult: CompetitorSearchResult;
    domainMatchResult: DomainMatchResult;
    webSocketConnected: boolean;
  }>;
  getConnectionState: () => string; // 添加获取连接状态方法
}

export interface UseCompetitorFlowReturn extends CompetitorFlowState, CompetitorFlowActions {}

export const useCompetitorFlow = (config: CompetitorFlowConfig = {}): UseCompetitorFlowReturn => {
  // State management
  const [state, setState] = useState<CompetitorFlowState>({
    isConnectingWebSocket: false,
    isWebSocketConnected: false,
    webSocketError: null,
    competitors: [], // 初始化竞争对手列表
    websiteId: null, // 初始化网站ID
  });

  // Refs for WebSocket service and cleanup
  const webSocketServiceRef = useRef<WebSocketService | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (webSocketServiceRef.current) {
        webSocketServiceRef.current.disconnect();
        webSocketServiceRef.current = null;
      }
    };
  }, []);

  // Update state helper
  const updateState = useCallback((updates: Partial<CompetitorFlowState>) => {
    if (!isMountedRef.current) return;
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Process domain
  const processDomain = useCallback((domain: string): string => {
    try {
      return competitorSearchService.processDomain(domain);
    } catch (error: any) {
      const errorMessage = error.message || '域名处理失败';
      config.onError?.(errorMessage);
      throw error;
    }
  }, [config]);

  // Search competitors
  const searchCompetitors = useCallback(async (domain: string, conversationId: string): Promise<CompetitorSearchResult> => {
    try {
      console.log('🔍 开始搜索竞争对手:', domain);
      const result = await competitorSearchService.searchCompetitors({ domain, conversationId });
      
      if (result.success && result.competitors) {
        setState(prev => ({ 
          ...prev, 
          competitors: result.competitors || [],
          websiteId: result.websiteId || null
        }));
        config.onCompetitorsFound?.(result.competitors || [], result.websiteId);
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || '搜索竞争对手失败';
      config.onError?.(errorMessage);
      throw error;
    }
  }, [config]);

  // Find website ID by domain
  const findWebsiteId = useCallback(async (domain: string): Promise<DomainMatchResult> => {
    try {
      console.log('🔍 开始查找网站ID:', domain);
      const result = await competitorSearchService.findWebsiteIdByDomain(domain);
      
      if (result.success && result.websiteId) {
        setState(prev => ({ 
          ...prev, 
          websiteId: result.websiteId || null
        }));
        config.onWebsiteIdFound?.(result.websiteId, result.matchedWebsite);
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || '查找网站ID失败';
      config.onError?.(errorMessage);
      throw error;
    }
  }, [config]);

  // Connect WebSocket
  const connectWebSocket = useCallback(async (conversationId: string, domain?: string): Promise<void> => {
    try {
      // 检查是否已经连接
      if (webSocketServiceRef.current && webSocketServiceRef.current.isWebSocketConnected()) {
        console.log('🔍 WebSocket已经连接，跳过重复连接');
        return;
      }

      updateState({ 
        isConnectingWebSocket: true, 
        webSocketError: null,
        isWebSocketConnected: false
      });

      console.log('🔍 ===== 开始WebSocket连接流程 =====');
      console.log('🔍 会话ID:', conversationId);
      console.log('🔍 域名:', domain);

      // Disconnect existing connection if any
      if (webSocketServiceRef.current) {
        console.log('🔍 断开现有WebSocket连接');
        webSocketServiceRef.current.disconnect();
      }

      // Create new WebSocket service
      webSocketServiceRef.current = createWebSocketService({
        conversationId,
        domain, // 传递域名参数
        onMessage: (message: WebSocketMessage) => {
          console.log('🔍 收到WebSocket消息:', message.type, message.content);
          config.onWebSocketMessage?.(message);
        },
        onOpen: () => {
          console.log('🔍 WebSocket连接已建立');
          updateState({ isWebSocketConnected: true });
          config.onWebSocketConnected?.();
        },
        onError: (error: any) => {
          console.error('🔍 WebSocket错误:', error);
          const errorMessage = error?.message || 'WebSocket连接错误';
          updateState({ 
            webSocketError: errorMessage,
            isWebSocketConnected: false
          });
          config.onWebSocketError?.(error);
          config.onError?.(errorMessage);
        },
        onClose: (event: CloseEvent) => {
          console.log('🔍 WebSocket连接关闭:', event.code);
          updateState({ isWebSocketConnected: false });
          config.onWebSocketClosed?.(event);
        }
      });

      await webSocketServiceRef.current.connect();
      console.log('🔍 WebSocket连接成功');
    } catch (error: any) {
      const errorMessage = error.message || 'WebSocket连接失败';
      console.error('🔍 WebSocket连接失败:', error);
      updateState({ 
        webSocketError: errorMessage,
        isWebSocketConnected: false
      });
      config.onError?.(errorMessage);
      throw error;
    } finally {
      updateState({ isConnectingWebSocket: false });
    }
  }, [config, updateState]);

  // Disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    console.log('🔍 断开WebSocket连接');
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.disconnect();
      webSocketServiceRef.current = null;
    }
    updateState({ 
      isWebSocketConnected: false,
      webSocketError: null
    });
  }, [updateState]);

  // Send WebSocket message
  const sendWebSocketMessage = useCallback((content: string, messageId?: string): boolean => {
    if (!webSocketServiceRef.current) {
      console.error('🔍 WebSocket服务未初始化');
      return false;
    }
    
    return webSocketServiceRef.current.sendMessage(content, messageId);
  }, []);

  // Reset entire flow
  const resetFlow = useCallback(() => {
    console.log('🔍 重置竞争对手流程');
    disconnectWebSocket();
    setState({
      isConnectingWebSocket: false,
      isWebSocketConnected: false,
      webSocketError: null,
      competitors: [], // 重置竞争对手列表
      websiteId: null, // 重置网站ID
    });
  }, [disconnectWebSocket]);

  // Execute full flow: process domain → connect websocket
  const executeFullFlow = useCallback(async (domain: string, conversationId: string) => {
    console.log('🔍 ===== 执行完整流程 =====');
    console.log('🔍 域名:', domain);
    console.log('🔍 会话ID:', conversationId);
    console.log('🔍 开始时间:', new Date().toISOString());

    try {
      // Step 1: Process domain
      console.log('🔍 ===== 步骤1: 处理域名 =====');
      const processedDomain = processDomain(domain);
      console.log('🔍 处理后的域名:', processedDomain);

      // Step 2: Connect WebSocket directly
      console.log('🔍 ===== 步骤2: 连接WebSocket =====');
      let webSocketConnected = false;
      try {
        await connectWebSocket(conversationId, processedDomain);
        webSocketConnected = true;
        console.log('🔍 ✅ WebSocket连接成功');
      } catch (error: any) {
        console.error('🔍 ❌ WebSocket连接失败:', error);
        console.error('🔍 错误详情:', {
          message: error?.message,
          stack: error?.stack,
          timestamp: new Date().toISOString()
        });
        // Don't throw error, let the flow continue
      }

      console.log('🔍 ===== 完整流程执行完毕 =====');
      console.log('🔍 结束时间:', new Date().toISOString());
      console.log('🔍 最终结果:', {
        webSocketConnected,
        processedDomain
      });
      
      return {
        searchResult: { success: true, competitors: [], websiteId: undefined },
        domainMatchResult: { success: true, websiteId: undefined, matchedWebsite: null },
        webSocketConnected
      };
    } catch (error: any) {
      console.error('🔍 ===== 完整流程执行失败 =====');
      console.error('🔍 错误对象:', error);
      console.error('🔍 错误消息:', error?.message);
      console.error('🔍 错误堆栈:', error?.stack);
      console.error('🔍 失败时间:', new Date().toISOString());
      const errorMessage = error?.message || '流程执行失败';
      config.onError?.(errorMessage);
      throw error;
    }
  }, [processDomain, connectWebSocket, config]);

  // 获取连接状态
  const getConnectionState = useCallback((): string => {
    if (!webSocketServiceRef.current) return 'CLOSED';
    return webSocketServiceRef.current.getConnectionState();
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    connectWebSocket,
    disconnectWebSocket,
    processDomain,
    sendWebSocketMessage,
    resetFlow,
    searchCompetitors, // 添加搜索竞争对手方法
    findWebsiteId, // 添加查找网站ID方法
    executeFullFlow,
    getConnectionState,
  };
};
