'use client';

import React, { useCallback, useEffect } from 'react';
import { useCompetitorFlow } from '@/hooks/useCompetitorFlow';
import type { WebSocketMessage } from '@/services/webSocketService';

interface CompetitorSearchIntegrationProps {
  conversationId?: string | null;
  domain?: string;
  autoStart?: boolean;
  onCompetitorsFound?: (competitors: string[], websiteId?: string) => void;
  onWebsiteIdFound?: (websiteId: string, matchedWebsite?: any) => void;
  onWebSocketMessage?: (message: WebSocketMessage) => void;
  onWebSocketConnected?: () => void;
  onError?: (error: string) => void;
  onFlowComplete?: (data: {
    competitors: string[];
    websiteId: string | null;
    webSocketConnected: boolean;
  }) => void;
}

/**
 * 竞争对手搜索集成组件
 * 这个组件可以无缝集成到现有的研究工具中，提供完整的竞争对手搜索→域名匹配→WebSocket连接流程
 */
export const CompetitorSearchIntegration: React.FC<CompetitorSearchIntegrationProps> = ({
  conversationId,
  domain,
  autoStart = false,
  onCompetitorsFound,
  onWebsiteIdFound,
  onWebSocketMessage,
  onWebSocketConnected,
  onError,
  onFlowComplete
}) => {
  // 初始化竞争对手流程
  const competitorFlow = useCompetitorFlow({
    conversationId,
    onCompetitorsFound: (competitors, websiteId) => {
      console.log('🔍 [Integration] 找到竞争对手:', competitors.length, '个');
      onCompetitorsFound?.(competitors, websiteId);
    },
    onWebsiteIdFound: (websiteId, matchedWebsite) => {
      console.log('🔍 [Integration] 找到网站ID:', websiteId);
      onWebsiteIdFound?.(websiteId, matchedWebsite);
    },
    onWebSocketMessage: (message) => {
      console.log('🔍 [Integration] WebSocket消息:', message.type);
      onWebSocketMessage?.(message);
    },
    onWebSocketConnected: () => {
      console.log('🔍 [Integration] WebSocket已连接');
      onWebSocketConnected?.();
    },
    onError: (error) => {
      console.error('🔍 [Integration] 流程错误:', error);
      onError?.(error);
    }
  });

  // 自动开始流程
  useEffect(() => {
    if (autoStart && domain && conversationId) {
      handleStartFlow();
    }
  }, [autoStart, domain, conversationId]);

  // 开始完整流程
  const handleStartFlow = useCallback(async () => {
    if (!domain || !conversationId) {
      console.warn('🔍 [Integration] 缺少必要参数:', { domain: !!domain, conversationId: !!conversationId });
      onError?.('缺少域名或会话ID');
      return;
    }

    try {
      console.log('🔍 [Integration] 开始执行完整流程');
      const result = await competitorFlow.executeFullFlow(domain, conversationId);
      
      console.log('🔍 [Integration] 流程执行完毕:', result);
      
      onFlowComplete?.({
        competitors: competitorFlow.competitors,
        websiteId: competitorFlow.websiteId,
        webSocketConnected: result.webSocketConnected
      });
    } catch (error: any) {
      console.error('🔍 [Integration] 流程执行失败:', error);
      onError?.(error.message || '流程执行失败');
    }
  }, [domain, conversationId, competitorFlow, onFlowComplete, onError]);

  // 手动触发竞争对手搜索
  const searchCompetitors = useCallback(async (targetDomain?: string, targetConversationId?: string) => {
    const useDomain = targetDomain || domain;
    const useConversationId = targetConversationId || conversationId;
    
    if (!useDomain || !useConversationId) {
      onError?.('缺少域名或会话ID');
      return null;
    }

    try {
      const result = await competitorFlow.searchCompetitors(useDomain, useConversationId);
      return result;
    } catch (error: any) {
      onError?.(error.message || '搜索竞争对手失败');
      return null;
    }
  }, [domain, conversationId, competitorFlow, onError]);

  // 手动触发域名匹配
  const findWebsiteId = useCallback(async (targetDomain?: string) => {
    const useDomain = targetDomain || domain;
    
    if (!useDomain) {
      onError?.('缺少域名');
      return null;
    }

    try {
      const result = await competitorFlow.findWebsiteId(useDomain);
      return result;
    } catch (error: any) {
      onError?.(error.message || '查找网站ID失败');
      return null;
    }
  }, [domain, competitorFlow, onError]);

  // 手动触发WebSocket连接
  const connectWebSocket = useCallback(async (targetConversationId?: string) => {
    const useConversationId = targetConversationId || conversationId;
    
    if (!useConversationId) {
      onError?.('缺少会话ID');
      return false;
    }

    try {
      await competitorFlow.connectWebSocket(useConversationId, domain); // 传递域名参数
      return true;
    } catch (error: any) {
      onError?.(error.message || 'WebSocket连接失败');
      return false;
    }
  }, [conversationId, domain, competitorFlow, onError]);

  // 发送WebSocket消息
  const sendMessage = useCallback((content: string, messageId?: string) => {
    return competitorFlow.sendWebSocketMessage(content, messageId);
  }, [competitorFlow]);

  // 重置流程
  const resetFlow = useCallback(() => {
    competitorFlow.resetFlow();
  }, [competitorFlow]);

  // 暴露API给父组件 (通过props传递ref时使用)
  // React.useImperativeHandle可以在需要时通过forwardRef使用

  // 这是一个无UI的集成组件，仅处理逻辑
  return null;
};

// 导出便利的钩子，供其他组件使用
export const useCompetitorSearchIntegration = (props: CompetitorSearchIntegrationProps) => {
  const competitorFlow = useCompetitorFlow({
    conversationId: props.conversationId,
    domain: props.domain, // 传递域名参数
    onCompetitorsFound: props.onCompetitorsFound,
    onWebsiteIdFound: props.onWebsiteIdFound,
    onWebSocketMessage: props.onWebSocketMessage,
    onWebSocketConnected: props.onWebSocketConnected,
    onError: props.onError
  });

  const startFlow = useCallback(async (domain?: string, conversationId?: string) => {
    const useDomain = domain || props.domain;
    const useConversationId = conversationId || props.conversationId;
    
    if (!useDomain || !useConversationId) {
      props.onError?.('缺少域名或会话ID');
      return null;
    }

    try {
      const result = await competitorFlow.executeFullFlow(useDomain, useConversationId);
      
      props.onFlowComplete?.({
        competitors: competitorFlow.competitors,
        websiteId: competitorFlow.websiteId,
        webSocketConnected: result.webSocketConnected
      });
      
      return result;
    } catch (error: any) {
      props.onError?.(error.message || '流程执行失败');
      return null;
    }
  }, [props, competitorFlow]);

  // 发送WebSocket消息
  const sendMessage = useCallback((content: string, messageId?: string) => {
    return competitorFlow.sendWebSocketMessage(content, messageId);
  }, [competitorFlow]);

  return {
    ...competitorFlow,
    startFlow,
    sendMessage
  };
};
