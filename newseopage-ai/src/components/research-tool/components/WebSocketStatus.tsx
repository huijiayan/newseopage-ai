"use client";

import React, { useState, useEffect } from 'react';
import { useWebSocketChat } from '@/hooks/useWebSocketChat';

interface WebSocketStatusProps {
  conversationId: string;
}

export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({ conversationId }) => {
  const [isClient, setIsClient] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // 确保只在客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const {
    isConnected,
    isConnecting,
    connectionState,
    error,
    connect,
    disconnect,
    reconnect
  } = useWebSocketChat({
    conversationId,
    autoConnect: false,
    onMessage: (data) => {
      addDebugInfo(`收到消息: ${JSON.stringify(data).substring(0, 50)}...`);
    },
    onError: (error) => {
      addDebugInfo(`错误: ${error?.message || '未知错误'}`);
    },
    onClose: (event) => {
      addDebugInfo(`连接关闭: ${event.code} - ${event.reason}`);
    },
    onOpen: () => {
      addDebugInfo('连接已建立');
    }
  });

  const handleConnect = async () => {
    addDebugInfo(`尝试连接到: ${conversationId}`);
    try {
      await connect(conversationId);
    } catch (error) {
      addDebugInfo(`连接失败: ${error}`);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    addDebugInfo('手动断开连接');
  };

  const handleReconnect = async () => {
    addDebugInfo('尝试重连');
    try {
      await reconnect();
    } catch (error) {
      addDebugInfo(`重连失败: ${error}`);
    }
  };

  // 在服务器端渲染时不显示任何内容
  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-800 rounded-lg p-4 border border-gray-600 max-w-md">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 
          isConnecting ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
        <span className="text-sm text-white">{connectionState}</span>
      </div>
      
      <div className="text-xs text-gray-300 mb-2">
        Conversation ID: {conversationId}
      </div>
      
      {error && (
        <div className="text-xs text-red-400 mb-2">
          错误: {error}
        </div>
      )}
      
      <div className="flex gap-2 mb-2">
        {!isConnected && !isConnecting && (
          <button
            onClick={handleConnect}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
          >
            连接
          </button>
        )}
        {isConnected && (
          <button
            onClick={handleDisconnect}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
          >
            断开
          </button>
        )}
        <button
          onClick={handleReconnect}
          className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded"
        >
          重连
        </button>
      </div>

      {/* 调试信息 */}
      <div className="text-xs text-gray-400">
        <div className="mb-1">调试信息:</div>
        <div className="bg-gray-900 p-2 rounded max-h-32 overflow-y-auto">
          {debugInfo.slice(-5).map((info, index) => (
            <div key={index} className="text-xs mb-1">
              {info}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
