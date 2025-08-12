// WebSocket聊天Hook
// 提供React组件中WebSocket聊天功能的状态管理和方法

import { useState, useEffect, useRef, useCallback } from 'react';
import { WebSocketChatV2, connectWebSocketChatV2, ChatMessage } from '@/lib/api/websocket-chat-v2';

export interface UseWebSocketChatOptions {
  conversationId?: string;
  domain?: string; // 添加域名参数
  autoConnect?: boolean;
  onMessage?: (data: any) => void;
  onError?: (error: any) => void;
  onClose?: (event: CloseEvent) => void;
  onOpen?: () => void;
}

export interface UseWebSocketChatReturn {
  // 状态
  isConnected: boolean;
  isConnecting: boolean;
  connectionState: string;
  error: string | null;
  
  // 方法
  connect: (conversationId?: string) => Promise<void>;
  disconnect: () => void;
  sendMessage: (content: string, messageId?: string) => boolean;
  
  // 服务实例
  chatService: WebSocketChatV2 | null;
}

export const useWebSocketChat = (options: UseWebSocketChatOptions = {}): UseWebSocketChatReturn => {
  const {
    conversationId: initialConversationId,
    domain, // 提取域名参数
    autoConnect = false,
    onMessage,
    onError,
    onClose,
    onOpen
  } = options;

  // 状态
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState('CLOSED');
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState(initialConversationId);
  const [isClient, setIsClient] = useState(false);

  // Refs
  const chatServiceRef = useRef<WebSocketChatV2 | null>(null);
  const isMountedRef = useRef(true);

  // 确保只在客户端运行
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 清理函数
  const cleanup = useCallback(() => {
    if (chatServiceRef.current) {
      chatServiceRef.current.disconnect();
      chatServiceRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionState('CLOSED');
    setError(null);
  }, []);

  // 连接WebSocket
  const connect = useCallback(async (conversationId?: string) => {
    // 只在客户端执行
    if (!isClient || typeof window === 'undefined') {
      return;
    }

    const targetConversationId = conversationId || currentConversationId;
    
    if (!targetConversationId) {
      setError('缺少conversationId');
      return;
    }

    try {
      setError(null);
      setIsConnecting(true);
      setConnectionState('CONNECTING');

      const service = await connectWebSocketChatV2(
        targetConversationId,
        (data: any) => {
          if (isMountedRef.current) {
            console.log('🔍 useWebSocketChat收到原始消息:', data);
            console.log('🔍 消息类型:', typeof data);
            console.log('🔍 消息结构:', JSON.stringify(data, null, 2));
            onMessage?.(data);
          }
        },
        (error: any) => {
          if (isMountedRef.current) {
            setError(error?.message || '连接错误');
            onError?.(error);
          }
        },
        (event: CloseEvent) => {
          if (isMountedRef.current) {
            setIsConnected(false);
            setConnectionState('CLOSED');
            onClose?.(event);
          }
        },
        () => {
          if (isMountedRef.current) {
            setIsConnected(true);
            setConnectionState('OPEN');
            onOpen?.();
          }
        },
        domain // 传递域名参数
      );

      chatServiceRef.current = service;
      setCurrentConversationId(targetConversationId);

      // 定期检查连接状态
      const checkConnection = () => {
        if (service && isMountedRef.current) {
          const state = service.getConnectionState();
          setConnectionState(state);
          setIsConnected(state === 'OPEN');
        }
      };

      // 每秒检查一次连接状态
      const interval = setInterval(checkConnection, 1000);

      // 清理定时器
      setTimeout(() => clearInterval(interval), 0);

    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err?.message || '连接失败');
        setIsConnecting(false);
        setConnectionState('CLOSED');
      }
    }
  }, [currentConversationId, onMessage, onError, onClose, onOpen, isClient, domain]);

  // 断开连接
  const disconnect = useCallback(() => {
    if (!isClient) return;
    
    if (chatServiceRef.current) {
      chatServiceRef.current.disconnect();
      chatServiceRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionState('CLOSED');
  }, [isClient]);

  // 发送消息
  const sendMessage = useCallback((content: string, messageId?: string): boolean => {
    if (!isClient) return false;
    
    if (!chatServiceRef.current) {
      setError('WebSocket未连接');
      return false;
    }

    const success = chatServiceRef.current.sendChatMessage(content, messageId);
    if (!success) {
      setError('发送消息失败');
    }
    return success;
  }, [isClient]);



  // 自动连接
  useEffect(() => {
    if (isClient && autoConnect && currentConversationId && !isConnected && !isConnecting) {
      console.log('🔍 尝试自动连接WebSocket');
      connect();
    }

    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [autoConnect, currentConversationId, isClient, isConnected, isConnecting, connect, cleanup]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return {
    // 状态
    isConnected: isClient ? isConnected : false,
    isConnecting: isClient ? isConnecting : false,
    connectionState: isClient ? connectionState : 'CLOSED',
    error: isClient ? error : null,
    
    // 方法
    connect,
    disconnect,
    sendMessage,
    
    // 服务实例
    chatService: isClient ? chatServiceRef.current : null,
  };
};
