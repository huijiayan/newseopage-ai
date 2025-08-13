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
  reconnectDelay = 2000
}, ref) => {
  // 添加主题配置
  const { getThemeConfig, isHydrated } = useTheme();
  
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
  
  // 自动重连相关（委托给底层类），这里只保留手动触发接口
  const reconnectAttempts = useRef(0);
  // 心跳相关
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatCountRef = useRef(0);
  
  // 生成消息ID用于去重
  const generateMessageId = useCallback((data: any): string => {
    // 放宽去重条件：仅当有稳定标识时才返回键，否则返回空串表示“不去重”
    if (data && typeof data === 'object') {
      if (typeof (data as any).id === 'string' && (data as any).id.length > 0) return (data as any).id;
      if (typeof (data as any).messageId === 'string' && (data as any).messageId.length > 0) return (data as any).messageId;
      if (typeof (data as any).timestamp === 'string' && typeof (data as any).content === 'string') {
        return `${(data as any).timestamp}_${(data as any).content.substring(0, 50)}`;
      }
      if (
        typeof (data as any)?.payload?.timestamp === 'string' &&
        typeof (data as any)?.content === 'string'
      ) {
        return `${(data as any).payload.timestamp}_${(data as any).content.substring(0, 50)}`;
      }
    }
    return '';
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
          if (messageId) {
            if (processedMessages.current.has(messageId)) {
              continue;
            }
            processedMessages.current.add(messageId);
          }
          onMessage?.(queuedData);
          if (typeof window !== 'undefined') {
            lastMessageTime.current = Date.now();
          }
          try {
            const extractTs = (data: any): string | null => {
              try {
                if (!data) return null;
                if (typeof data === 'string') {
                  try {
                    const obj = JSON.parse(data);
                    return (
                      (typeof obj?.timestamp === 'string' && obj.timestamp) ||
                      (typeof obj?.ts === 'number' && String(obj.ts)) ||
                      (typeof obj?.payload?.timestamp === 'string' && obj.payload.timestamp) ||
                      null
                    );
                  } catch {
                    return null;
                  }
                }
                if (typeof data === 'object') {
                  return (
                    (typeof data?.timestamp === 'string' && data.timestamp) ||
                    (typeof data?.ts === 'number' && String(data.ts)) ||
                    (typeof data?.payload?.timestamp === 'string' && data.payload.timestamp) ||
                    null
                  );
                }
                return null;
              } catch { return null; }
            };
            const plusOneTs = (ts: string): string => {
              if (/^\d+$/.test(ts)) {
                const n = Number(ts);
                return String(Number.isFinite(n) ? n + 1 : ts);
              }
              const ms = Date.parse(ts);
              if (!Number.isNaN(ms)) {
                return new Date(ms + 1).toISOString();
              }
              return ts;
            };
            const ts = extractTs(queuedData);
            if (ts && conversationId) {
              const key = `ws_resume_ts_${conversationId}`;
              const prev = localStorage.getItem(key);
              const next = plusOneTs(ts);
              const prevMs = prev && !/^\d+$/.test(prev) ? Date.parse(prev) : Number(prev);
              const nextMs = !/^\d+$/.test(next) ? Date.parse(next) : Number(next);
              const okPrev = typeof prevMs === 'number' && Number.isFinite(prevMs);
              const okNext = typeof nextMs === 'number' && Number.isFinite(nextMs);
              if ((okNext && !okPrev) || (okNext && okPrev && nextMs >= prevMs)) {
                localStorage.setItem(key, next);
              }
            }
          } catch {}
        }
      }
      isProcessing.current = false;
    }, 20);
  }, [generateMessageId, onMessage]);

  // 处理连接失败
  const handleConnectionFailure = useCallback((reason: string, error: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 WebSocket连接失败: ${reason}`, error);
    }
    
    setError(error?.message || reason);
    setIsConnected(false);
    setConnectionState('CLOSED');
    onError?.(error);
  }, [maxReconnectAttempts, onError]);

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

        if (process.env.NODE_ENV === 'development') {
          console.log('尝试建立 WebSocket 连接');
        }

      const service = await connectWebSocketChatV2(
        conversationId,
        (data: any) => {
          // 入队并批处理，降低渲染频率且统一处理去重/断点续传时间
          messageQueue.current.push(data);
          processMessageQueue();
        },
        (error: any) => {
          handleConnectionFailure('连接错误', error);
        },
        (event: CloseEvent) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔍 WebSocket连接关闭:', event.code, event.reason);
            }
          // 停止心跳
          if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
          }
          setIsConnected(false);
          setConnectionState('CLOSED');
          onClose?.(event);
        },
        () => {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔍 WebSocket连接成功');
            }
          setIsConnected(true);
          setConnectionState('OPEN');
          setError(null);
          reconnectAttempts.current = 0; // 重置重连计数
          onOpen?.();
        },
        domain
      );

      setChatService(service);
      setIsConnecting(false);
    } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('🔍 WebSocket连接失败:', error);
        }
      handleConnectionFailure('连接失败', error);
      setIsConnecting(false);
    }
    }, [conversationId, domain, onMessage, onError, onClose, onOpen, handleConnectionFailure]);

  // 手动重连
  const reconnect = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 手动重连');
    }
    reconnectAttempts.current = 0; // 重置重连计数
    // 直接委托给底层类
    if (chatService) {
      chatService.reconnect();
    } else {
      // 若尚未创建实例，则触发一次 connect
      connect();
    }
  }, [chatService, connect]);

  // 断开连接
  const disconnect = useCallback(() => {
    if (chatService) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 断开WebSocket连接');
      }
      
      // 停止心跳
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      chatService.disconnect();
      setChatService(null);
      setIsConnected(false);
      setConnectionState('CLOSED');
      setError(null);
      
      // 重置连接状态
      connectionAttempts.current = 0;
      lastConnectionTime.current = 0;
      reconnectAttempts.current = 0;
      // 清空去重集合与队列
      processedMessages.current.clear();
      messageQueue.current.length = 0;
      isProcessing.current = false;
    }
  }, [chatService]);

  // 强制断开连接（用于没有conversationId时）
  const forceDisconnect = useCallback(() => {
    if (chatService || isConnected) {
      
      if (chatService) {
        chatService.disconnect();
      }
      // 停止心跳
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      setChatService(null);
      setIsConnected(false);
      setConnectionState('CLOSED');
      setError(null);
      
      // 重置状态
      connectionAttempts.current = 0;
      lastConnectionTime.current = 0;
      reconnectAttempts.current = 0;
      processedMessages.current.clear();
      messageQueue.current.length = 0;
      isProcessing.current = false;
    }
  }, [chatService, isConnected]);

  // 发送消息
  const sendMessage = useCallback((message: any) => {
    if (!chatService || !isConnected) return false;

    let success = false;
    if (typeof message === 'string') {
      success = chatService.sendChatMessage(message);
    } else if (message && typeof message === 'object' && typeof message.type === 'string') {
      // 已是 ChatMessage 结构
      success = chatService.sendMessage(message);
    } else {
      // 业务负载对象，包裹为 ChatMessage
      success = chatService.sendMessage({
        type: 'message',
        content: JSON.stringify(message),
        timestamp: new Date().toISOString(),
      } as any);
    }

    if (success) {
      onSendMessage?.(message);
    }
    return success;
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
  
  // 删除重复的自动连接副作用，避免双重触发

  // 清理
  useEffect(() => {
    return () => {
      if (chatService) {
        chatService.disconnect();
      }
      
      // 停止心跳
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      // 清理消息处理状态
      processedMessages.current.clear();
      messageQueue.current.length = 0;
      isProcessing.current = false;
    };
  }, [chatService]);

  // 连接成功后启动心跳，断开时停止
  useEffect(() => {
    if (isConnected && chatService) {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      heartbeatCountRef.current = 0;
      heartbeatIntervalRef.current = setInterval(() => {
        heartbeatCountRef.current += 1;
        try {
          chatService.sendHeartbeat(heartbeatCountRef.current, 'astream_events');
        } catch {}
      }, 10000); // 10秒一次
      return () => {
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
      };
    }
  }, [isConnected, chatService]);
  
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
        
        {/* 组件层不再管理自动重连，仅显示基本状态 */}
        
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
