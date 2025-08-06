"use client";

import React, { useState, useEffect } from 'react';
import { useWebSocketChat } from '@/hooks/useWebSocketChat';

export default function WebSocketTestPage() {
  const [conversationId, setConversationId] = useState('test-conversation-123');
  const [token, setToken] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const {
    isConnected,
    isConnecting,
    connectionState,
    error,
    connect,
    disconnect,
    sendMessage,
    reconnect
  } = useWebSocketChat({
    conversationId,
    autoConnect: false,
    onMessage: (data) => {
      addLog(`收到消息: ${JSON.stringify(data)}`);
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

  useEffect(() => {
    // 获取token
    const storedToken = localStorage.getItem('alternativelyAccessToken');
    if (storedToken) {
      setToken(storedToken);
      addLog(`Token已获取: ${storedToken.substring(0, 20)}...`);
    } else {
      addLog('未找到Token');
    }
  }, []);

  const handleConnect = async () => {
    addLog(`尝试连接到: ${conversationId}`);
    try {
      await connect(conversationId);
    } catch (error) {
      addLog(`连接失败: ${error}`);
    }
  };

  const handleSendMessage = () => {
    const success = sendMessage('Hello WebSocket!');
    addLog(`发送消息: ${success ? '成功' : '失败'}`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">WebSocket 连接测试</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Conversation ID:</label>
            <input
              type="text"
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Token:</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="从localStorage获取"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 
                isConnecting ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span>状态: {connectionState}</span>
            </div>
            
            {error && (
              <div className="text-red-600 text-sm">
                错误: {error}
              </div>
            )}
          </div>

          <div className="space-x-2">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {isConnecting ? '连接中...' : '连接'}
            </button>
            
            <button
              onClick={disconnect}
              disabled={!isConnected}
              className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
            >
              断开
            </button>
            
            <button
              onClick={() => reconnect()}
              className="px-4 py-2 bg-yellow-600 text-white rounded"
            >
              重连
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!isConnected}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              发送消息
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">连接日志</h3>
          <div className="bg-gray-100 p-4 rounded h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
