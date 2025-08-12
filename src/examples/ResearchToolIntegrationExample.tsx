'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useCompetitorSearchIntegration } from '@/components/research-tool/CompetitorSearchIntegration';
import { validateDomain } from '@/components/research-tool/utils/research-tool-utils';
import type { WebSocketMessage } from '@/services/webSocketService';

/**
 * 这是一个示例，展示如何将竞争对手搜索流程集成到现有的ResearchTool中
 * 
 * 主要特点：
 * 1. 竞争对手搜索 → 域名匹配 → WebSocket连接的完整流程
 * 2. 替换原有的SSE依赖，改用纯WebSocket
 * 3. 与现有UI组件无缝集成
 */
export const ResearchToolIntegrationExample: React.FC = () => {
  // 基础状态
  const [domain, setDomain] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  // UI状态
  const [isProcessingTask, setIsProcessingTask] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // 用于模拟现有ResearchTool的状态管理
  const messageIdCounter = useRef(0);

  // 添加消息到聊天界面
  const addMessage = useCallback((type: 'user' | 'agent' | 'system', content: string, extra?: any) => {
    const messageId = `msg-${++messageIdCounter.current}`;
    setMessages(prev => [...prev, {
      id: messageId,
      type,
      content,
      timestamp: new Date().toISOString(),
      ...extra
    }]);
    return messageId;
  }, []);

  // 添加日志条目
  const addLog = useCallback((logData: any) => {
    setLogs(prev => [...prev, {
      ...logData,
      id: logData.id || `log-${Date.now()}-${Math.random()}`,
      timestamp: logData.timestamp || new Date().toISOString()
    }]);
  }, []);

  // 使用竞争对手搜索集成
  const competitorIntegration = useCompetitorSearchIntegration({
    conversationId,
    domain,
    onCompetitorsFound: (competitors, websiteId) => {
      console.log('🔍 [Example] 找到竞争对手:', competitors.length, '个');
      
      // 更新UI状态
      setCurrentStep(2);
      setIsProcessingTask(false);
      
      // 添加成功消息
      addMessage('agent', `找到 ${competitors.length} 个竞争对手，websiteId: ${websiteId || '未找到'}`);
      
      // 添加竞争对手选择UI (模拟)
      if (competitors.length > 0) {
        addMessage('system', '请从以下竞争对手中选择:', {
          type: 'competitor_selection',
          competitors,
          websiteId
        });
      }
    },
    onWebsiteIdFound: (websiteId, matchedWebsite) => {
      console.log('🔍 [Example] 找到网站ID:', websiteId);
      addMessage('system', `网站ID匹配成功: ${websiteId}`);
    },
    onWebSocketMessage: (message: WebSocketMessage) => {
      console.log('🔍 [Example] WebSocket消息:', message);
      
      // 处理不同类型的WebSocket消息，替代原有的SSE处理逻辑
      handleWebSocketMessage(message);
    },
    onWebSocketConnected: () => {
      console.log('🔍 [Example] WebSocket已连接');
      addMessage('system', '✅ 实时连接已建立，开始处理任务...');
      setIsProcessingTask(true);
      setCurrentStep(3);
    },
    onError: (error: string) => {
      console.error('🔍 [Example] 流程错误:', error);
      addMessage('system', `❌ 错误: ${error}`);
      setIsProcessingTask(false);
    },
    onFlowComplete: (data) => {
      console.log('🔍 [Example] 流程完成:', data);
      addMessage('agent', `流程完成! 竞争对手: ${data.competitors.length}个, WebSocket: ${data.webSocketConnected ? '已连接' : '未连接'}`);
      
      if (data.webSocketConnected) {
        // 流程完成后可以发送消息来触发页面生成等后续操作
        competitorIntegration.sendMessage('开始页面生成流程');
      }
    }
  });

  // 处理WebSocket消息 (替代原有的SSE处理逻辑)
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    const { type, content, step, id } = message;

    switch (type) {
      case 'Info':
        addLog({ type: 'Info', content, step, id });
        
        // 处理特定的信息类型
        if (step === 'CURRENT_GENERATION_FINISHED') {
          setCurrentStep(4);
          setIsProcessingTask(false);
          addMessage('agent', '页面生成完成！');
        }
        break;

      case 'Agent':
        addLog({ type: 'Agent', content, step, id });
        addMessage('agent', `Agent正在工作: ${step}`);
        break;

      case 'Error':
        addLog({ type: 'Error', content, step, id });
        addMessage('system', `❌ 错误: ${content.description || content}`);
        setIsProcessingTask(false);
        break;

      case 'Html':
        // 处理HTML流式内容
        addLog({ type: 'Html', content, step, id });
        console.log('🔍 收到HTML内容，长度:', content.length);
        break;

      case 'Codes':
        addLog({ type: 'Codes', content, step, id });
        addMessage('system', '✅ 代码生成完成');
        
        // 可以在这里处理生成的页面
        if (content.resultId) {
          addMessage('agent', `页面已生成，ID: ${content.resultId}`);
        }
        break;

      case 'Crawler_Images':
      case 'Crawler_Headers':
      case 'Crawler_Footers':
        addLog({ type, content: Array.isArray(content) ? content : [], step, id });
        addMessage('system', `${type} 数据已收集`);
        break;

      default:
        addLog({ type, content, step, id });
        console.log('🔍 收到未知类型消息:', type);
    }
  }, [addLog, addMessage]);

  // 处理用户输入
  const handleUserInput = useCallback(async (input: string) => {
    if (!input.trim()) return;

    // 添加用户消息
    addMessage('user', input);

    // 验证是否是域名输入
    if (validateDomain(input)) {
      setDomain(input);
      
      // 生成会话ID
      const newConversationId = `conversation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setConversationId(newConversationId);
      
      // 添加处理中消息
      const thinkingId = addMessage('agent', '正在处理您的输入...', { isThinking: true });
      setCurrentStep(1);
      setIsProcessingTask(true);
      
      try {
        // 启动完整的竞争对手搜索流程
        console.log('🔍 [Example] 启动流程，域名:', input, '会话ID:', newConversationId);
        
        const result = await competitorIntegration.startFlow(input, newConversationId);
        
        if (result) {
          // 更新thinking消息
          setMessages(prev => prev.map(msg => 
            msg.id === thinkingId 
              ? { ...msg, content: '✅ 输入处理完成，正在搜索竞争对手...', isThinking: false }
              : msg
          ));
        } else {
          throw new Error('流程启动失败');
        }
      } catch (error: any) {
        setMessages(prev => prev.map(msg => 
          msg.id === thinkingId 
            ? { ...msg, content: `❌ 处理失败: ${error.message}`, isThinking: false }
            : msg
        ));
        setIsProcessingTask(false);
      }
    } else {
      // 非域名输入，可能是聊天消息
      if (competitorIntegration.isWebSocketConnected) {
        // 通过WebSocket发送消息
        const success = competitorIntegration.sendMessage(input);
        if (success) {
          addMessage('system', '消息已发送');
        } else {
          addMessage('system', '❌ 消息发送失败');
        }
      } else {
        addMessage('system', '请先输入有效的域名来开始流程');
      }
    }
  }, [addMessage, competitorIntegration]);

  // 处理竞争对手选择 (模拟)
  const handleCompetitorSelection = useCallback((selectedCompetitors: string[]) => {
    if (selectedCompetitors.length === 0) {
      addMessage('system', '请至少选择一个竞争对手');
      return;
    }

    addMessage('user', `已选择 ${selectedCompetitors.length} 个竞争对手`);
    addMessage('agent', '开始分析选定的竞争对手...');
    
    setCurrentStep(3);
    setIsProcessingTask(true);

    // 通过WebSocket发送选择的竞争对手
    if (competitorIntegration.isWebSocketConnected) {
      const message = JSON.stringify({
        type: 'competitor_selection',
        competitors: selectedCompetitors
      });
      competitorIntegration.sendMessage(message);
    }
  }, [addMessage, competitorIntegration]);

  // 重置流程
  const handleReset = useCallback(() => {
    competitorIntegration.resetFlow();
    setMessages([]);
    setLogs([]);
    setDomain('');
    setConversationId(null);
    setIsProcessingTask(false);
    setCurrentStep(0);
    addMessage('system', '流程已重置');
  }, [competitorIntegration, addMessage]);

  // 获取当前步骤描述
  const getStepDescription = () => {
    const steps = [
      '等待输入域名',
      '搜索竞争对手',
      '选择竞争对手',
      '分析竞争对手',
      '生成页面'
    ];
    return steps[currentStep] || '未知步骤';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 标题和状态 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          研究工具集成示例
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          展示竞争对手搜索 → 域名匹配 → WebSocket连接的完整流程
        </p>
        
        {/* 状态指示器 */}
        <div className="flex items-center space-x-4 text-sm">
          <div className={`px-3 py-1 rounded-full ${
            isProcessingTask 
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            步骤 {currentStep}: {getStepDescription()}
          </div>
          
          <div className={`px-3 py-1 rounded-full ${
            competitorIntegration.isWebSocketConnected
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}>
            WebSocket: {competitorIntegration.isWebSocketConnected ? '已连接' : '未连接'}
          </div>
          
          {competitorIntegration.competitors.length > 0 && (
            <div className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
              竞争对手: {competitorIntegration.competitors.length}个
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 聊天界面 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            聊天界面
          </h2>
          
          {/* 消息列表 */}
          <div className="h-96 overflow-y-auto mb-4 space-y-3 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-50 dark:bg-blue-900/20 ml-8'
                    : message.type === 'agent'
                    ? 'bg-green-50 dark:bg-green-900/20 mr-8'
                    : 'bg-gray-50 dark:bg-gray-700 mx-4'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {message.type === 'user' ? '用户' : message.type === 'agent' ? 'AI助手' : '系统'}
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {message.isThinking && '🤔 '}
                      {message.content}
                    </p>
                    
                    {/* 竞争对手选择界面 */}
                    {message.type === 'competitor_selection' && message.competitors && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          选择竞争对手 (已找到 {message.competitors.length} 个):
                        </p>
                        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                          {message.competitors.slice(0, 5).map((competitor: string, index: number) => (
                            <button
                              key={index}
                              onClick={() => handleCompetitorSelection([competitor])}
                              className="text-left p-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                              disabled={isProcessingTask}
                            >
                              {competitor}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => handleCompetitorSelection(message.competitors.slice(0, 3))}
                          className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                          disabled={isProcessingTask}
                        >
                          选择前3个竞争对手
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                请输入域名开始流程，例如: seopage.ai
              </div>
            )}
          </div>
          
          {/* 输入框 */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="输入域名开始流程，例如: seopage.ai"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUserInput(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              disabled={isProcessingTask}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                重置
              </button>
              {competitorIntegration.isWebSocketConnected && (
                <button
                  onClick={() => competitorIntegration.sendMessage('测试WebSocket连接')}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                >
                  测试WebSocket
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 日志面板 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            WebSocket日志
          </h2>
          
          <div className="h-96 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded text-sm ${
                  log.type === 'Error' 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                    : log.type === 'Info'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : log.type === 'Agent'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="font-medium">{log.type}</span>
                    {log.step && <span className="ml-2 text-xs opacity-75">({log.step})</span>}
                    <div className="mt-1">
                      {typeof log.content === 'object' ? JSON.stringify(log.content, null, 2) : log.content}
                    </div>
                  </div>
                  <span className="text-xs opacity-50 ml-2">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                暂无WebSocket日志
              </div>
            )}
          </div>
          
          {/* 状态信息 */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="font-medium text-gray-900 dark:text-white">连接状态</div>
              <div className="text-gray-600 dark:text-gray-400">
                {competitorIntegration.getConnectionState?.() || '未知'}
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="font-medium text-gray-900 dark:text-white">会话ID</div>
              <div className="text-gray-600 dark:text-gray-400 truncate">
                {conversationId || '未生成'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
