// WebSocket连接组件
// 提供简化的连接管理和用户控制

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { connectWebSocketChatV2, WebSocketChatV2 } from '@/lib/api/websocket-chat-v2';

interface WebSocketConnectionProps {
  conversationId: string;
  onMessage?: (data: any) => void;
  onError?: (error: any) => void;
  onClose?: (event: CloseEvent) => void;
  onOpen?: () => void;
  autoConnect?: boolean;
}

export const WebSocketConnection: React.FC<WebSocketConnectionProps> = ({
  conversationId,
  onMessage,
  onError,
  onClose,
  onOpen,
  autoConnect = false
}) => {
  const [chatService, setChatService] = useState<WebSocketChatV2 | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState('CLOSED');
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // 连接WebSocket
  const connect = useCallback(async () => {
    if (!conversationId) {
      setError('缺少conversationId');
      return;
    }

    try {
      setError(null);
      setIsConnecting(true);
      setConnectionState('CONNECTING');

      const service = await connectWebSocketChatV2(
        conversationId,
        (data: any) => {
          console.log('🔍 收到WebSocket消息:', data);
          onMessage?.(data);
        },
        (error: any) => {
          console.error('🔍 WebSocket错误:', error);
          setError(error?.message || '连接错误');
          setIsConnected(false);
          setConnectionState('CLOSED');
          onError?.(error);
        },
        (event: CloseEvent) => {
          console.log('🔍 WebSocket连接关闭:', event.code, event.reason);
          setIsConnected(false);
          setConnectionState('CLOSED');
          onClose?.(event);
        },
        () => {
          console.log('🔍 WebSocket连接已建立');
          setIsConnected(true);
          setConnectionState('OPEN');
          setReconnectAttempts(0);
          onOpen?.();
        },
        (attempt: number) => {
          console.log(`🔍 WebSocket重连尝试 ${attempt}`);
          setReconnectAttempts(attempt);
        }
      );

      setChatService(service);
      setIsConnecting(false);
    } catch (error: any) {
      console.error('🔍 WebSocket连接失败:', error);
      setError(error?.message || '连接失败');
      setIsConnecting(false);
      setConnectionState('CLOSED');
      onError?.(error);
    }
  }, [conversationId, onMessage, onError, onClose, onOpen]);

  // 断开连接
  const disconnect = useCallback(() => {
    if (chatService) {
      chatService.disconnect();
      setChatService(null);
      setIsConnected(false);
      setConnectionState('CLOSED');
      setError(null);
      setReconnectAttempts(0);
    }
  }, [chatService]);

  // 手动重连
  const reconnect = useCallback(async () => {
    disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
    await connect();
  }, [disconnect, connect]);

  // 自动连接
  useEffect(() => {
    console.log('🔍 ===== WebSocket自动连接检查 =====');
    console.log('🔍 autoConnect:', autoConnect);
    console.log('🔍 conversationId:', conversationId);
    console.log('🔍 isConnected:', isConnected);
    console.log('🔍 isConnecting:', isConnecting);
    
    if (autoConnect && conversationId && !isConnected && !isConnecting) {
      console.log('🔍 满足自动连接条件，开始连接...');
      connect();
    } else {
      console.log('🔍 不满足自动连接条件，跳过连接');
      if (!autoConnect) console.log('🔍 原因: autoConnect为false');
      if (!conversationId) console.log('🔍 原因: conversationId为空');
      if (isConnected) console.log('🔍 原因: 已连接');
      if (isConnecting) console.log('🔍 原因: 正在连接中');
    }
    
    console.log('🔍 ===== 自动连接检查完成 =====');
  }, [autoConnect, conversationId, isConnected, isConnecting, connect]);

  // 清理
  useEffect(() => {
    return () => {
      if (chatService) {
        chatService.disconnect();
      }
    };
  }, [chatService]);

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
    <div style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: '6px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          <strong>WebSocket连接状态</strong>
        </div>
        
        <div>
          <span>状态: </span>
          <span style={{ color: getStatusColor() === 'success' ? '#52c41a' : getStatusColor() === 'warning' ? '#faad14' : '#ff4d4f' }}>
            {connectionState}
          </span>
        </div>
        
        {conversationId && (
          <div>
            <span>Conversation ID: </span>
            <code>{conversationId}</code>
          </div>
        )}
        
        {reconnectAttempts > 0 && (
          <div>
            <span>重连次数: </span>
            <span style={{ color: '#faad14' }}>{reconnectAttempts}</span>
          </div>
        )}
        
        {error && (
          <div style={{ 
            padding: '8px 12px', 
            backgroundColor: '#fff2f0', 
            border: '1px solid #ffccc7', 
            borderRadius: '6px',
            color: '#cf1322'
          }}>
            <div><strong>连接错误</strong></div>
            <div>{error}</div>
            <button 
              onClick={() => setError(null)}
              style={{ 
                marginTop: '4px', 
                padding: '2px 8px', 
                border: '1px solid #ffccc7', 
                borderRadius: '4px',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            >
              关闭
            </button>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isConnected && !isConnecting && (
            <button 
              onClick={connect} 
              disabled={isConnecting}
              style={{ 
                padding: '4px 12px', 
                backgroundColor: '#1890ff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {isConnecting ? '连接中...' : '连接'}
            </button>
          )}
          
          {isConnected && (
            <button 
              onClick={disconnect}
              style={{ 
                padding: '4px 12px', 
                backgroundColor: 'transparent', 
                color: '#666', 
                border: '1px solid #d9d9d9', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              断开
            </button>
          )}
          
          {!isConnected && !isConnecting && (
            <button 
              onClick={reconnect}
              style={{ 
                padding: '4px 12px', 
                backgroundColor: 'transparent', 
                color: '#666', 
                border: '1px solid #d9d9d9', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              重连
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
