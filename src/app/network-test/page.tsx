"use client";

import React, { useState, useEffect } from 'react';

export default function NetworkTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testWebSocketConnection = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    addResult('开始网络连接测试...');
    
    // 测试1: 检查环境变量
    addResult(`WebSocket URL: ${process.env.NEXT_PUBLIC_CHAT_WS_URL || 'wss://agents.zhuyuejoey.com'}`);
    addResult(`Chat API URL: ${process.env.NEXT_PUBLIC_CHAT_API_URL || 'https://agents.zhuyuejoey.com'}`);
    
    // 测试2: 检查token
    const token = localStorage.getItem('alternativelyAccessToken');
    if (token) {
      addResult(`Token存在: ${token.substring(0, 20)}...`);
    } else {
      addResult('❌ Token不存在，请先登录');
      setIsTesting(false);
      return;
    }
    
    // 测试3: 尝试WebSocket连接
    try {
      addResult('尝试WebSocket连接...');
      const wsUrl = `${process.env.NEXT_PUBLIC_CHAT_WS_URL || 'wss://agents.zhuyuejoey.com'}/ws/chat/test-connection?token=${token}`;
      addResult(`连接URL: ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      
      const timeout = setTimeout(() => {
        addResult('❌ WebSocket连接超时');
        ws.close();
        setIsTesting(false);
      }, 10000);
      
      ws.onopen = () => {
        clearTimeout(timeout);
        addResult('✅ WebSocket连接成功');
        ws.close();
        setIsTesting(false);
      };
      
      ws.onerror = (error) => {
        clearTimeout(timeout);
        addResult(`❌ WebSocket连接错误: ${error}`);
        setIsTesting(false);
      };
      
      ws.onclose = (event) => {
        clearTimeout(timeout);
        addResult(`WebSocket连接关闭: ${event.code} - ${event.reason}`);
        setIsTesting(false);
      };
      
    } catch (error) {
      addResult(`❌ WebSocket连接异常: ${error}`);
      setIsTesting(false);
    }
  };

  const testHttpConnection = async () => {
    setIsTesting(true);
    addResult('测试HTTP连接...');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CHAT_API_URL || 'https://agents.zhuyuejoey.com'}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        addResult('✅ HTTP连接成功');
      } else {
        addResult(`❌ HTTP连接失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      addResult(`❌ HTTP连接异常: ${error}`);
    }
    
    setIsTesting(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">网络连接测试</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testWebSocketConnection}
          disabled={isTesting}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isTesting ? '测试中...' : '测试WebSocket连接'}
        </button>
        
        <button
          onClick={testHttpConnection}
          disabled={isTesting}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 ml-2"
        >
          {isTesting ? '测试中...' : '测试HTTP连接'}
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="text-lg font-medium mb-2">测试结果</h3>
        <div className="bg-white p-4 rounded h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500">点击按钮开始测试</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {result}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
