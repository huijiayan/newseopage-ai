// WebSocket连接组件
// 提供简化的连接管理和用户控制，包含自动重连机制

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { connectWebSocketChatV2, WebSocketChatV2 } from '@/lib/api/websocket-chat-v2';
import { useTheme } from '../hooks/useTheme';

interface WebSocketConnectionProps {
  conversationId: string;
  domain?: string; // 添加域名参数
  onMessage?: (data: any) => void;
  onError?: (error: any) => void;
  onClose?: (event: CloseEvent) => void;
  onOpen?: () => void;
  autoConnect?: boolean;
  onSendMessage?: (message: any) => void; // 添加发送消息的回调
  enableAutoReconnect?: boolean; // 启用自动重连
  maxReconnectAttempts?: number; // 最大重连次数
  reconnectDelay?: number; // 重连延迟
  onThemeSwitch?: (theme: 'dark' | 'light') => void; // 添加主题切换回调
}

export interface WebSocketConnectionRef {
  sendMessage: (message: any) => boolean;
  isConnected: boolean;
  isConnecting: boolean;
  connectionState: string;
  reconnect: () => void; // 添加手动重连方法
}

export const WebSocketConnection = React.forwardRef<WebSocketConnectionRef, WebSocketConnectionProps>(({
  conversationId,
  domain,
  onMessage,
  onError,
  onClose,
  onOpen,
  autoConnect = false,
  onSendMessage,
  enableAutoReconnect = true,
  maxReconnectAttempts = 5,
  reconnectDelay = 2000,
  onThemeSwitch
}, ref) => {
  // 添加主题配置
  const { currentTheme, getThemeConfig, isHydrated } = useTheme();
  
  // 获取research-tool主题配置，提供fallback避免hydration不匹配
  const themeStyles = isHydrated ? getThemeConfig('researchTool') : {
    background: 'linear-gradient(180deg, #121826 0%, #030810 100%)'
  };
  
  // 只在开发环境下输出渲染日志
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 WebSocketConnection组件渲染:', {
      conversationId,
      domain,
      autoConnect,
      enableAutoReconnect
    });
  }
  
  const [chatService, setChatService] = useState<WebSocketChatV2 | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState('CLOSED');
  const [error, setError] = useState<string | null>(null);
  
  // 消息去重和防重复处理
  const processedMessages = useRef<Set<string>>(new Set());
  const lastMessageTime = useRef<number>(0);
  const messageQueue = useRef<any[]>([]);
  const isProcessing = useRef(false);
  
  // 连接防抖和状态监控
  const connectionAttempts = useRef(0);
  const lastConnectionTime = useRef(0);
  const connectionDebounceTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // 自动重连相关
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const isReconnecting = useRef(false);
  const shouldReconnect = useRef(enableAutoReconnect);
  
  // 连接健康检查
  const healthCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const lastPingTime = useRef<number>(0);
  
  // 生成消息ID用于去重
  const generateMessageId = useCallback((data: any): string => {
    if (typeof data === 'string') {
      return data;
    }
    if (data && typeof data === 'object') {
      // 尝试从消息中提取唯一标识
      if (data.id) return data.id;
      if (data.messageId) return data.messageId;
      if (data.timestamp && data.content) {
        return `${data.timestamp}_${data.content.substring(0, 50)}`;
      }
      // 如果没有明显标识，使用JSON字符串的hash
      return JSON.stringify(data).slice(0, 100);
    }
    return String(data);
  }, []);
  
  // 处理消息队列 - 简化逻辑
  const processMessageQueue = useCallback(() => {
    // 只在客户端执行
    if (typeof window === 'undefined') return;
    if (isProcessing.current || messageQueue.current.length === 0) return;
    
    isProcessing.current = true;
    
    setTimeout(() => {
      while (messageQueue.current.length > 0) {
        const queuedData = messageQueue.current.shift();
        if (queuedData) {
          const messageId = generateMessageId(queuedData);
          if (!processedMessages.current.has(messageId)) {
            processedMessages.current.add(messageId);
            onMessage?.(queuedData);
          }
        }
      }
      isProcessing.current = false;
    }, 20);
  }, [generateMessageId, onMessage]);

  // 清理重连定时器
  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);

  // 清理健康检查定时器
  const clearHealthCheckTimer = useCallback(() => {
    if (healthCheckInterval.current) {
      clearInterval(healthCheckInterval.current);
      healthCheckInterval.current = null;
    }
  }, []);

  // 启动健康检查
  const startHealthCheck = useCallback(() => {
    // 只在客户端执行
    if (typeof window === 'undefined') return;
    if (!enableAutoReconnect) return;
    
    clearHealthCheckTimer();
    
    healthCheckInterval.current = setInterval(() => {
      if (isConnected && chatService) {
        const now = Date.now();
        // 如果超过30秒没有收到消息，认为连接可能有问题
        if (now - lastMessageTime.current > 30000) {
          console.log('🔍 WebSocket连接可能异常，尝试重连');
          handleConnectionFailure('连接超时检测', new Error('连接超时'));
        }
      }
    }, 10000); // 每10秒检查一次
  }, [enableAutoReconnect, isConnected, chatService, clearHealthCheckTimer]);

  // 处理连接失败
  const handleConnectionFailure = useCallback((reason: string, error: any) => {
    console.log(`🔍 WebSocket连接失败: ${reason}`, error);
    
    setError(error?.message || reason);
    setIsConnected(false);
    setConnectionState('CLOSED');
    onError?.(error);
    
    // 如果启用自动重连且未达到最大重连次数，则尝试重连
    if (shouldReconnect.current && reconnectAttempts.current < maxReconnectAttempts) {
      scheduleReconnect();
    }
  }, [maxReconnectAttempts, onError]);

  // 安排重连
  const scheduleReconnect = useCallback(() => {
    if (isReconnecting.current) return;
    
    isReconnecting.current = true;
    reconnectAttempts.current++;
    
    const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts.current - 1), 30000);
    console.log(`🔍 安排重连 (${reconnectAttempts.current}/${maxReconnectAttempts})，延迟: ${delay}ms`);
    
    clearReconnectTimer();
    reconnectTimer.current = setTimeout(() => {
      isReconnecting.current = false;
      if (shouldReconnect.current && conversationId) {
        connect();
      }
    }, delay);
  }, [reconnectDelay, maxReconnectAttempts, conversationId, clearReconnectTimer]);

  // 连接WebSocket
  const connect = useCallback(async () => {
    if (!conversationId) {
      console.log('🔍 没有conversationId，跳过连接');
      return;
    }
    
    // 防止重复连接
    if (isConnecting || isConnected || chatService) {
      return;
    }
    
    // 连接防抖 - 简化逻辑
    // 只在客户端执行
    if (typeof window === 'undefined') return;
    const now = Date.now();
    if (now - lastConnectionTime.current < 1000) {
      return;
    }

    try {
      setError(null);
      setIsConnecting(true);
      setConnectionState('CONNECTING');
      lastConnectionTime.current = now;
      connectionAttempts.current++;

      // 只保留关键连接建立提示
      console.log('WebSocket连接已建立');

      const service = await connectWebSocketChatV2(
        conversationId,
        (data: any) => {
          // 消息去重处理
          const messageId = generateMessageId(data);
          if (processedMessages.current.has(messageId)) {
            return;
          }
          
          // 标记消息已处理
          processedMessages.current.add(messageId);
          // 只在客户端执行
          if (typeof window !== 'undefined') {
            lastMessageTime.current = Date.now();
          }
          
          // 传递消息给父组件
          onMessage?.(data);
        },
        (error: any) => {
          handleConnectionFailure('连接错误', error);
        },
        (event: CloseEvent) => {
          console.log('🔍 WebSocket连接关闭:', event.code, event.reason);
          setIsConnected(false);
          setConnectionState('CLOSED');
          onClose?.(event);
          
          // 如果不是正常关闭，尝试重连
          if (event.code !== 1000 && shouldReconnect.current) {
            handleConnectionFailure('连接异常关闭', new Error(`连接关闭: ${event.code} - ${event.reason}`));
          }
        },
        () => {
          console.log('🔍 WebSocket连接成功');
          setIsConnected(true);
          setConnectionState('OPEN');
          setError(null);
          reconnectAttempts.current = 0; // 重置重连计数
          onOpen?.();
          
          // 启动健康检查
          startHealthCheck();
        },
        domain
      );

      setChatService(service);
      setIsConnecting(false);
    } catch (error: any) {
      console.error('🔍 WebSocket连接失败:', error);
      handleConnectionFailure('连接失败', error);
      setIsConnecting(false);
    }
  }, [conversationId, domain, onMessage, onError, onClose, onOpen, handleConnectionFailure, startHealthCheck]);

  // 手动重连
  const reconnect = useCallback(() => {
    console.log('🔍 手动重连');
    reconnectAttempts.current = 0; // 重置重连计数
    shouldReconnect.current = true;
    
    if (chatService) {
      chatService.disconnect();
      setChatService(null);
    }
    
    setIsConnected(false);
    setConnectionState('CLOSED');
    setError(null);
    
    // 延迟一下再连接，避免立即重连
    setTimeout(() => {
      connect();
    }, 1000);
  }, [chatService, connect]);

  // 断开连接
  const disconnect = useCallback(() => {
    if (chatService) {
      console.log('🔍 断开WebSocket连接');
      shouldReconnect.current = false; // 禁用自动重连
      clearReconnectTimer();
      clearHealthCheckTimer();
      
      chatService.disconnect();
      setChatService(null);
      setIsConnected(false);
      setConnectionState('CLOSED');
      setError(null);
      
      // 重置连接状态
      connectionAttempts.current = 0;
      lastConnectionTime.current = 0;
      reconnectAttempts.current = 0;
      isReconnecting.current = false;
    }
  }, [chatService, clearReconnectTimer, clearHealthCheckTimer]);

  // 强制断开连接（用于没有conversationId时）
  const forceDisconnect = useCallback(() => {
    if (chatService || isConnected) {
      shouldReconnect.current = false; // 禁用自动重连
      clearReconnectTimer();
      clearHealthCheckTimer();
      
      if (chatService) {
        chatService.disconnect();
      }
      setChatService(null);
      setIsConnected(false);
      setConnectionState('CLOSED');
      setError(null);
      
      // 重置状态
      connectionAttempts.current = 0;
      lastConnectionTime.current = 0;
      reconnectAttempts.current = 0;
      isReconnecting.current = false;
      processedMessages.current.clear();
      messageQueue.current.length = 0;
      isProcessing.current = false;
    }
  }, [chatService, isConnected, clearReconnectTimer, clearHealthCheckTimer]);

  // 发送消息
  const sendMessage = useCallback((message: any) => {
    if (chatService && isConnected) {
      const success = chatService.sendChatMessage(JSON.stringify(message));
      if (success) {
        onSendMessage?.(message);
      }
      return success;
    } else {
      return false;
    }
  }, [chatService, isConnected, onSendMessage]);

  // 暴露方法给父组件
  React.useImperativeHandle(ref, () => ({
    sendMessage,
    isConnected,
    isConnecting,
    connectionState,
    reconnect
  }));

  // 核心连接逻辑 - 只在有conversationId时连接，无conversationId时断开
  useEffect(() => {
    if (autoConnect && conversationId && !isConnected && !isConnecting) {
      connect();
    } else if (autoConnect && !conversationId && isConnected) {
      forceDisconnect();
    }
  }, [autoConnect, conversationId, isConnected, isConnecting, connect, forceDisconnect]);
  
  // conversationId变化时的连接管理
  useEffect(() => {
    if (conversationId && !isConnected && !isConnecting) {
      connect();
    } else if (!conversationId && isConnected) {
      forceDisconnect();
    }
  }, [conversationId, isConnected, isConnecting, connect, forceDisconnect]);

  // 清理
  useEffect(() => {
    return () => {
      shouldReconnect.current = false;
      clearReconnectTimer();
      clearHealthCheckTimer();
      
      if (chatService) {
        chatService.disconnect();
      }
      
      // 清理消息处理状态
      processedMessages.current.clear();
      messageQueue.current.length = 0;
      isProcessing.current = false;
    };
  }, [chatService, clearReconnectTimer, clearHealthCheckTimer]);
  
  // 定期清理过期的消息ID，防止内存泄漏
  useEffect(() => {
    // 只在客户端执行
    if (typeof window === 'undefined') return;
    
    const cleanupInterval = setInterval(() => {
      if (processedMessages.current.size > 1000) {
        processedMessages.current.clear();
      }
    }, 5 * 60 * 1000); // 每5分钟检查一次
    
    return () => clearInterval(cleanupInterval);
  }, []);

  // 获取状态颜色
  const getStatusColor = () => {
    switch (connectionState) {
      case 'OPEN':
        return 'success';
      case 'CONNECTING':
        return 'warning';
      case 'CLOSED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div 
      className={`p-4 rounded-lg mb-4 transition-all duration-300 ${
        isHydrated 
          ? `${themeStyles.systemMessage?.background || 'bg-slate-800/20'} ${themeStyles.systemMessage?.border || 'border-slate-700/40'} ${themeStyles.systemMessage?.shadow || 'shadow-lg'}` 
          : 'bg-slate-800/20 border-slate-700/40 shadow-lg'
      }`}
      style={{
        padding: '16px',
        borderRadius: '6px',
        marginBottom: '16px'
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className={`font-semibold ${
            isHydrated 
              ? themeStyles.systemMessage?.text || 'text-slate-200' 
              : 'text-slate-200'
          }`}>
            WebSocket连接状态
          </div>
          
          {/* 主题切换按钮 */}
          <button
            onClick={() => {
              const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
              if (onThemeSwitch) {
                onThemeSwitch(newTheme);
              } else {
                // 如果没有传入回调，使用默认的切换方式
                localStorage.setItem('research-tool-theme', newTheme);
                window.location.reload();
              }
            }}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
              currentTheme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
            title={`当前主题: ${currentTheme === 'dark' ? '深色' : '浅色'}，点击切换到${currentTheme === 'dark' ? '浅色' : '深色'}`}
          >
            {currentTheme === 'dark' ? '🌙' : '☀️'} {currentTheme === 'dark' ? '浅色' : '深色'}
          </button>
        </div>
        
        <div className={`${
          isHydrated 
            ? themeStyles.systemMessage?.text || 'text-slate-300' 
            : 'text-slate-300'
        }`}>
          <span>状态: </span>
          <span className={
            getStatusColor() === 'success' ? (isHydrated ? themeStyles.successMessage?.text || 'text-green-400' : 'text-green-400') : 
            getStatusColor() === 'warning' ? (isHydrated ? themeStyles.warningMessage?.text || 'text-yellow-400' : 'text-yellow-400') : 
            (isHydrated ? themeStyles.errorMessage?.text || 'text-red-400' : 'text-red-400')
          }>
            {connectionState}
          </span>
        </div>
        
        {conversationId && (
          <div className={`${
            isHydrated 
              ? themeStyles.systemMessage?.text || 'text-slate-300' 
              : 'text-slate-300'
          }`}>
            <span>Conversation ID: </span>
            <code className={`px-2 py-1 rounded text-sm ${
              isHydrated 
                ? `${themeStyles.systemMessage?.codeBackground || 'bg-slate-700/50'} ${themeStyles.systemMessage?.codeText || 'text-slate-200'}`
                : 'bg-slate-700/50 text-slate-200'
            }`}>{conversationId}</code>
          </div>
        )}
        
        {enableAutoReconnect && (
          <div className={`${
            isHydrated 
              ? themeStyles.systemMessage?.text || 'text-slate-300' 
              : 'text-slate-300'
          }`}>
            <span>自动重连: </span>
            <span className={`${
              isHydrated 
                ? themeStyles.infoMessage?.text || 'text-blue-400'
                : 'text-blue-400'
            }`}>
              已启用 ({reconnectAttempts.current}/{maxReconnectAttempts})
            </span>
          </div>
        )}
        
        {error && (
          <div className={`p-3 rounded-md ${
            isHydrated 
              ? `${themeStyles.errorMessage?.background || 'bg-red-900/20'} ${themeStyles.errorMessage?.border || 'border-red-700/40'}` 
              : 'bg-red-900/20 border-red-700/40'
          }`}>
            <div className={`font-semibold ${
              isHydrated 
                ? themeStyles.errorMessage?.text || 'text-red-200' 
                : 'text-red-200'
            }`}>
              连接错误
            </div>
            <div className={`${
              isHydrated 
                ? themeStyles.errorMessage?.text || 'text-red-300' 
                : 'text-red-300'
            }`}>
              {error}
            </div>
            <button 
              onClick={() => setError(null)}
              className={`mt-1 px-2 py-1 rounded border cursor-pointer transition-colors ${
                isHydrated 
                  ? `${themeStyles.errorMessage?.buttonBackground || 'bg-red-800/40'} ${themeStyles.errorMessage?.buttonText || 'text-red-200'} ${themeStyles.errorMessage?.buttonHoverBackground || 'hover:bg-red-700/50'}` 
                  : 'bg-red-800/40 text-red-200 hover:bg-red-700/50'
              }`}
            >
              关闭
            </button>
          </div>
        )}
        
        <div className="flex gap-2 flex-wrap">
          {!isConnected && !isConnecting && (
            <button 
              onClick={connect} 
              disabled={isConnecting}
              className={`px-3 py-1 rounded cursor-pointer transition-all duration-200 ${
                isHydrated 
                  ? `${themeStyles.sendButton?.background || 'bg-blue-600 hover:bg-blue-500'} ${themeStyles.sendButton?.border || 'border-0'} ${themeStyles.sendButton?.text || 'text-white'}` 
                  : 'bg-blue-600 hover:bg-blue-500 border-0 text-white'
              }`}
            >
              {isConnecting ? '连接中...' : '连接'}
            </button>
          )}
          
          {isConnected && (
            <button 
              onClick={disconnect}
              className={`px-3 py-1 rounded border cursor-pointer transition-colors ${
                isHydrated 
                  ? `${themeStyles.secondaryButton || 'bg-slate-700 hover:bg-slate-600'} ${themeStyles.systemMessage?.border || 'border-slate-600'} ${themeStyles.systemMessage?.text || 'text-slate-300'}` 
                  : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300'
              }`}
            >
              断开
            </button>
          )}
          
          {enableAutoReconnect && !isConnected && (
            <button 
              onClick={reconnect}
              className={`px-3 py-1 rounded cursor-pointer transition-all duration-200 ${
                isHydrated 
                  ? `${themeStyles.secondaryButton || 'bg-yellow-600 hover:bg-yellow-500'} ${themeStyles.sendButton?.text || 'text-white'} border-0` 
                  : 'bg-yellow-600 hover:bg-yellow-500 text-white border-0'
              }`}
            >
              重连
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
