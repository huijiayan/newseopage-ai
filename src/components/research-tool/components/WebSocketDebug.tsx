"use client";

import React, { useState, useEffect } from 'react';
import { useWebSocketChat } from '@/hooks/useWebSocketChat';

interface WebSocketDebugProps {
  conversationId?: string;
}

export const WebSocketDebug: React.FC<WebSocketDebugProps> = ({ conversationId }) => {
  const [isClient, setIsClient] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const addLog = (message: string) => {
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const {
    isConnected,
    isConnecting,
    connectionState,
    error,
    connect,
    disconnect,
    sendMessage,
    reconnect,
    chatService
  } = useWebSocketChat({
    conversationId,
    autoConnect: false,
    onMessage: (data) => {
      addLog(`收到消息: ${JSON.stringify(data).substring(0, 100)}...`);
    },
    onError: (error) => {
      addLog(`错误: ${error?.message || '未知错误'}`);
    },
    onClose: (event) => {
      addLog(`连接关闭: ${event.code} - ${event.reason}`);
    },
    onOpen: () => {
      addLog('连接已建立');
    }
  });

  const handleConnect = async () => {
    if (!conversationId) {
      addLog('❌ 缺少conversationId');
      return;
    }
    
    addLog(`尝试连接到: ${conversationId}`);
    try {
      await connect(conversationId);
    } catch (error) {
      addLog(`连接失败: ${error}`);
    }
  };

  const handleSendTestMessage = () => {
    const success = sendMessage('测试消息', 'test-msg');
    addLog(`发送测试消息: ${success ? '成功' : '失败'}`);
  };

  const handleDisconnect = () => {
    disconnect();
    addLog('手动断开连接');
  };

  const handleReconnect = async () => {
    addLog('尝试重连');
    try {
      await reconnect();
    } catch (error) {
      addLog(`重连失败: ${error}`);
    }
  };

  // 检查token
  useEffect(() => {
    const token = localStorage.getItem('alternativelyAccessToken');
    if (token) {
      addLog(`Token存在: ${token.substring(0, 20)}...`);
    } else {
      addLog('❌ Token不存在');
    }
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-gray-900 rounded-lg p-4 border border-gray-600 max-w-md">
      <h3 className="text-lg font-medium text-white mb-4">WebSocket 调试</h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 
            isConnecting ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-white">状态: {connectionState}</span>
        </div>
        
        <div className="text-xs text-gray-300">
          Conversation ID: {conversationId || '无'}
        </div>
        
        {error && (
          <div className="text-xs text-red-400">
            错误: {error}
          </div>
        )}
      </div>
      
      <div className="space-x-2 mb-4">
        <button
          onClick={handleConnect}
          disabled={isConnecting || !conversationId}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded disabled:opacity-50"
        >
          连接
        </button>
        
        <button
          onClick={handleDisconnect}
          disabled={!isConnected}
          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded disabled:opacity-50"
        >
          断开
        </button>
        
        <button
          onClick={handleReconnect}
          className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded"
        >
          重连
        </button>
        
        <button
          onClick={handleSendTestMessage}
          disabled={!isConnected}
          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded disabled:opacity-50"
        >
          测试消息
        </button>
      </div>

      <div className="text-xs text-gray-400">
        <div className="mb-1">调试日志:</div>
        <div className="bg-gray-800 p-2 rounded max-h-32 overflow-y-auto">
          {debugLogs.slice(-8).map((log, index) => (
            <div key={index} className="text-xs mb-1">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
