// 这是整个聊天页面的主要功能组件

"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMessage } from '@/components/ui/CustomMessage';
import ChatInput from '@/components/ui/ChatInput';
import { InfoCircleOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import type { ResearchToolProps } from '@/types/research-tool';
import { useResearchTool } from './hooks/useResearchTool';
import { useTheme } from './hooks/useTheme';
import { TaskStatusBar } from './components/TaskStatusBar';
import {
  filterMessageTags,
  linkifyDomains,
  isJsonArrayMessage,
  isDomainListMessage,
  injectResearchToolStyles
} from './utils/research-tool-utils';
import apiClient from '@/lib/api';
import { WebSocketConnection } from './components/WebSocketConnection';

// 这是整个聊天页面的主要功能组件
export const ResearchTool: React.FC<ResearchToolProps> = ({
  conversationId = null,
  mode = 'normal'
}) => {
  // 注入样式
  useEffect(() => {
    injectResearchToolStyles();
  }, []);

  // 添加主题配置
  const { currentTheme, getThemeConfig, isHydrated } = useTheme();

  // 获取research-tool主题配置，提供fallback避免hydration不匹配
  const themeStyles = isHydrated ? getThemeConfig('researchTool') : {
    background: 'linear-gradient(180deg, #121826 0%, #030810 100%)'
  };

  // 添加缺失的状态变量
  const [thinkingLogExpanded, setThinkingLogExpanded] = React.useState<Record<string, boolean>>({});
  const messageApi = useMessage();
  const [isRecoveryMode, setIsRecoveryMode] = React.useState(false);
  const [chatHistory, setChatHistory] = React.useState<any>(null);
  const [competitorModalMode, setCompetitorModalMode] = React.useState<'add' | 'edit'>('add');
  const [editingPage, setEditingPage] = React.useState<any>(null);
  const [currentWebsiteId, setCurrentWebsiteId] = React.useState<string>('');
  const [hubPageIds, setHubPageIds] = React.useState<string[]>([]);

  const [startedTaskCountRef] = React.useState(React.useRef(0));
  const [retryCountRef] = React.useState(React.useRef(0));
  const [codeContainerRef] = React.useState(React.useRef<HTMLPreElement>(null));

  // 使用统一的状态管理hook
  const {
    // 状态
    isSubmitting,
    setIsSubmitting,
    showSlogan,
    setShowSlogan,
    loading,
    setLoading,
    messages,
    setMessages,
    userInput,
    setUserInput,
    isMessageSending,
    setIsMessageSending,
    rightPanelTab,
    setRightPanelTab,
    logs,
    setLogs,
    browserTabs,
    setBrowserTabs,
    activeTab,
    setActiveTab,
    isProcessingTask,
    setIsProcessingTask,
    errorModal,
    setErrorModal,
    isSidebarOpen,
    setIsSidebarOpen,
    currentStep,
    setCurrentStep,
    taskSteps,
    setTaskSteps,
    showBrandAssetsModal,
    setShowBrandAssetsModal,
    showCompetitorModal,
    setShowCompetitorModal,
    isBrowserSidebarOpen,
    setIsBrowserSidebarOpen,
    mainProduct,
    setMainProduct,
    selectedCompetitors,
    setSelectedCompetitors,
    containerSize,
    setContainerSize,
    messageCollapsed,
    currentConversationId,
    setCurrentConversationId,
    setMessageCollapsed,
    isStatusBarExpanded,
    setIsStatusBarExpanded,
    apiDetailModal,
    setApiDetailModal,
    deletePageConfirm,
    setDeletePageConfirm,

    // Refs
    inputRef,
    chatEndRef,
    iframeContainerRef,
    apiDetailModalContentRef,
    htmlStreamRef,
    isStreamingRef,
    currentStreamIdRef,

    // 计算属性
    isMobile,
    taskTimeEstimates,

    // 方法
    messageHandler,
    getPageMode,
    getSloganContent,
    handleCompetitorSelect,
    removeCompetitor,
    handleDeletePage,
    handleConfirmDelete,
    handleEditPage,

    // 路由相关
    router,
    pathname,
  } = useResearchTool(conversationId, mode);

  // WebSocket聊天功能
  // WebSocket连接管理
  const [wsConnected, setWsConnected] = useState(false);
  const [wsConnecting, setWsConnecting] = useState(false);
  const [wsConnectionState, setWsConnectionState] = useState('CLOSED');
  const [wsError, setWsError] = useState<string | null>(null);

  const handleWebSocketMessage = (data: any) => {
    console.log('🔍 ===== 收到WebSocket消息 =====');
    console.log('🔍 消息数据:', data);
    console.log('🔍 消息类型:', data.type);
    console.log('🔍 消息内容长度:', data.content?.length || 0);
    console.log('🔍 消息时间戳:', data.timestamp);
    
    // 处理WebSocket消息
    if (data.type === 'message' && data.content) {
      console.log('🔍 处理消息类型消息');
      const thinkingMessageId = `thinking-${Date.now()}`;
      messageHandler.updateAgentMessage(data.content, thinkingMessageId);
      console.log('🔍 消息已更新到界面');
    } else if (data.type === 'system') {
      console.log('🔍 处理系统消息');
      messageHandler.addSystemMessage(data.content || '系统消息');
    } else if (data.type === 'error') {
      console.log('🔍 处理错误消息');
      messageHandler.addSystemMessage(`⚠️ ${data.content || '发生错误'}`);
    } else {
      console.log('🔍 未知消息类型，跳过处理');
    }
    
    console.log('🔍 ===== WebSocket消息处理完成 =====');
  };

  const handleWebSocketError = (error: any) => {
    console.error('🔍 ===== WebSocket连接错误 =====');
    console.error('🔍 错误对象:', error);
    console.error('🔍 错误消息:', error?.message);
    console.error('🔍 错误类型:', typeof error);
    console.error('🔍 错误堆栈:', error?.stack);
    
    const errorMessage = error?.message || '未知错误';
    setWsError(errorMessage);
    messageHandler.addSystemMessage(`⚠️ WebSocket连接错误: ${errorMessage}`);
    
    console.error('🔍 ===== WebSocket错误处理完成 =====');
  };

  const handleWebSocketClose = (event: CloseEvent) => {
    console.log('🔍 ===== WebSocket连接已关闭 =====');
    console.log('🔍 关闭事件:', event);
    console.log('🔍 关闭代码:', event.code);
    console.log('🔍 关闭原因:', event.reason);
    console.log('🔍 是否正常关闭:', event.code === 1000);
    
    setWsConnected(false);
    setWsConnectionState('CLOSED');
    
    if (event.code !== 1000) {
      console.log('🔍 非正常关闭，显示警告消息');
      messageHandler.addSystemMessage('⚠️ WebSocket连接已断开');
    } else {
      console.log('🔍 正常关闭，不显示警告');
    }
    
    console.log('🔍 ===== WebSocket关闭处理完成 =====');
  };

  const handleWebSocketOpen = () => {
    console.log('🔍 ===== WebSocket连接已建立 =====');
    console.log('🔍 连接时间:', new Date().toISOString());
    console.log('🔍 当前conversationId:', currentConversationId);
    console.log('🔍 连接状态:', wsConnectionState);
    
    setWsConnected(true);
    setWsConnectionState('OPEN');
    setWsError(null);
    
    console.log('🔍 状态已更新');
    messageHandler.addSystemMessage('🔗 WebSocket连接已建立，可以开始实时聊天');
    
    console.log('🔍 ===== WebSocket连接建立完成 =====');
  };

  // 自动检测URL参数并建立WebSocket连接
  useEffect(() => {
    try {
      console.log('🔍 ===== 开始自动检测URL参数 =====');
      console.log('🔍 当前URL:', typeof window !== 'undefined' ? window.location.href : 'SSR环境');
      console.log('🔍 传入的conversationId:', conversationId);
      console.log('🔍 传入的mode:', mode);
      console.log('🔍 当前currentConversationId:', currentConversationId);
      
      // 1. 自动检测：URL中的conversationId参数
      const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      const urlConversationId = urlParams.get('conversationId');
      console.log('🔍 URL中的conversationId参数:', urlConversationId);
      
      // 2. 自动设置：恢复模式和对话ID
      let targetConversationId = conversationId || urlConversationId;
      let shouldRecover = false;
      
      if (targetConversationId) {
        console.log('🔍 检测到conversationId，准备进入恢复模式');
        console.log('🔍 目标conversationId:', targetConversationId);
        console.log('🔍 当前模式:', mode);
        
        // 如果URL中有conversationId或传入的mode是recover，则进入恢复模式
        if (urlConversationId || mode === 'recover') {
          shouldRecover = true;
          console.log('🔍 设置为恢复模式');
          setIsRecoveryMode(true);
        }
        
        // 设置conversationId - 避免无限循环
        if (targetConversationId !== currentConversationId) {
          console.log('🔍 更新currentConversationId:', targetConversationId);
          setCurrentConversationId(targetConversationId);
        }
      } else {
        console.log('🔍 未检测到conversationId，保持正常模式');
      }
      
      console.log('🔍 ===== URL参数检测完成 =====');
    } catch (error: any) {
      console.error('🔍 URL参数检测过程中发生错误:', error);
      console.error('🔍 错误详情:', {
        message: error?.message || '未知错误',
        stack: error?.stack || '无堆栈信息'
      });
    }
  }, [conversationId, mode]); // 移除currentConversationId依赖，避免无限循环

  // 当conversationId变化时，自动获取聊天历史并建立WebSocket连接
  useEffect(() => {
    try {
      if (currentConversationId) {
        console.log('🔍 ===== 开始处理conversationId变化 =====');
        console.log('🔍 conversationId已设置:', currentConversationId);
        console.log('🔍 当前模式:', mode);
        console.log('🔍 是否恢复模式:', isRecoveryMode);
        
        // 3. 自动获取：聊天历史数据
        if (mode === 'recover' || conversationId || isRecoveryMode) {
          console.log('🔍 开始恢复聊天历史记录');
          loadChatHistory(currentConversationId);
        }
        
        // 4. 自动连接：建立WebSocket连接
        console.log('🔍 准备建立WebSocket连接');
        console.log('🔍 WebSocket当前状态:', wsConnectionState);
        console.log('🔍 WebSocket是否已连接:', wsConnected);
        
        if (!wsConnected && wsConnectionState === 'CLOSED') {
          console.log('🔍 开始建立WebSocket连接...');
          // 这里会触发WebSocket连接建立
          // WebSocket连接会在组件渲染时自动建立
        }
        
        console.log('🔍 ===== conversationId变化处理完成 =====');
      }
    } catch (error: any) {
      console.error('🔍 conversationId变化处理过程中发生错误:', error);
      console.error('🔍 错误详情:', {
        message: error?.message || '未知错误',
        stack: error?.stack || '无堆栈信息'
      });
    }
  }, [currentConversationId, mode, conversationId, isRecoveryMode, wsConnected, wsConnectionState]);

  // 加载聊天历史记录
  const loadChatHistory = async (conversationId: string) => {
    console.log('🔍 ===== 开始加载聊天历史记录 =====');
    console.log('🔍 目标conversationId:', conversationId);
    
    try {
      console.log('🔍 调用API获取聊天历史...');
      const historyResponse = await apiClient.getAlternativeChatHistory(conversationId);
      console.log('🔍 聊天历史API响应:', historyResponse);
      
      if (historyResponse?.code === 200 && historyResponse.data) {
        console.log('🔍 API调用成功，开始处理历史数据');
        console.log('🔍 原始历史数据条数:', historyResponse.data.length);
        
        // 按时间顺序显示所有消息
        const sortedMessages = historyResponse.data.sort((a: any, b: any) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        console.log('🔍 排序后历史数据条数:', sortedMessages.length);
        
        // 恢复消息到界面
        let userMessageCount = 0;
        let agentMessageCount = 0;
        
        sortedMessages.forEach((msg: any, index: number) => {
          console.log(`🔍 处理第${index + 1}条历史消息:`, {
            source: msg.source,
            content: msg.content?.substring(0, 50) + (msg.content?.length > 50 ? '...' : ''),
            timestamp: msg.timestamp
          });
          
          if (msg.source === 'user') {
            messageHandler.addUserMessage(msg.content);
            userMessageCount++;
            console.log('🔍 已添加用户消息');
          } else if (msg.source === 'agent') {
            messageHandler.addAgentThinkingMessage();
            messageHandler.updateAgentMessage(msg.content, `thinking-${Date.now()}`);
            agentMessageCount++;
            console.log('🔍 已添加AI消息');
          }
        });
        
        console.log('🔍 聊天历史记录恢复完成');
        console.log('🔍 恢复的用户消息数:', userMessageCount);
        console.log('🔍 恢复的AI消息数:', agentMessageCount);
        console.log('🔍 总恢复消息数:', userMessageCount + agentMessageCount);
      } else {
        console.log('🔍 API响应异常:', historyResponse);
        if (historyResponse?.code !== 200) {
          console.log('🔍 API返回错误码:', historyResponse?.code);
        }
        if (!historyResponse?.data) {
          console.log('🔍 API返回数据为空');
        }
      }
    } catch (error: any) {
      console.error('🔍 加载聊天历史记录失败:', error);
      console.error('🔍 错误详情:', {
        message: error?.message || '未知错误',
        stack: error?.stack || '无堆栈信息'
      });
    }
    
    console.log('🔍 ===== 聊天历史记录加载完成 =====');
  };

  // 处理聊天响应的辅助函数
  const handleChatResponse = async (rawAnswer: string, thinkingMessageId: string, tempConversationId: string | null, formattedInput: string) => {
    if (rawAnswer.includes('[URL_GET]')) {
      localStorage.setItem('currentProductUrl', formattedInput);
      messageHandler.updateAgentMessage(rawAnswer, thinkingMessageId);

      // 当AI需要时，进行竞争对手搜索和websiteId匹配
      console.log('🔍 AI需要搜索竞争对手，开始处理...');
      
      // 1. 搜索竞争对手
      if (tempConversationId) {
        try {
          const searchResponse = await apiClient.searchCompetitor(
            tempConversationId,
            formattedInput
          );
          console.log('🔍 竞争对手搜索响应:', searchResponse);

          if (searchResponse?.code === 200) {
            messageHandler.addSystemMessage(
              "Agent starts working on find competitor list for you, it usually takes a minute or two, please hold on..."
            );
            setIsProcessingTask(true);
          }
        } catch (error) {
          console.error('🔍 竞争对手搜索失败:', error);
        }
      }
      
      // 2. 查找websiteId并设置currentWebsiteId
      try {
        const websiteId = await findWebsiteIdByDomain(formattedInput);
        if (websiteId) {
          console.log('🔍 找到websiteId，设置currentWebsiteId:', websiteId);
          setCurrentWebsiteId(websiteId);
        }
      } catch (error) {
        console.error('🔍 websiteId查找失败:', error);
      }
    } else {
      const answer = filterMessageTags(rawAnswer);
      messageHandler.updateAgentMessage(answer, thinkingMessageId);
    }
  };

  // 根据域名查找websiteId的函数
  const findWebsiteIdByDomain = async (domain: string): Promise<string | null> => {
    try {
      console.log('🔍 根据域名查找websiteId:', domain);
      
      // 获取网站列表进行匹配
      const websiteListResponse = await apiClient.getAlternativeWebsiteList();
      
      if (websiteListResponse?.code === 200 && websiteListResponse.data) {
        const websites = websiteListResponse.data;
        console.log('🔍 获取到网站列表:', websites.length, '个网站');
        
        // 使用includes进行模糊匹配
        const matchedWebsite = findWebsiteByDomain(domain, websites);
        
        if (matchedWebsite) {
          console.log('🔍 找到匹配的网站:', matchedWebsite);
          return matchedWebsite.websiteId || matchedWebsite.id;
        } else {
          console.log('🔍 未找到匹配的网站，使用回退机制');
          // 回退机制：使用第一个网站或生成新的websiteId
          if (websites.length > 0) {
            const fallbackWebsite = websites[0];
            console.log('🔍 使用回退网站:', fallbackWebsite);
            return fallbackWebsite.websiteId || fallbackWebsite.id;
          } else {
            console.log('🔍 网站列表为空，尝试生成新的websiteId');
            // 尝试生成新的websiteId
            try {
              const generateResponse = await apiClient.generateWebsiteId();
              if (generateResponse?.code === 200 && generateResponse.data?.websiteId) {
                console.log('🔍 生成新的websiteId:', generateResponse.data.websiteId);
                return generateResponse.data.websiteId;
              }
            } catch (error) {
              console.error('🔍 生成websiteId失败:', error);
            }
          }
        }
      } else {
        console.error('🔍 获取网站列表失败:', websiteListResponse);
      }
      
      return null;
    } catch (error: any) {
      console.error('🔍 查找websiteId失败:', error);
      return null;
    }
  };

  // 使用includes进行模糊匹配
  const findWebsiteByDomain = (domain: string, websites: any[]): any | null => {
    const cleanDomain = domain.toLowerCase().trim();
    
    // 精确匹配
    for (const website of websites) {
      const websiteUrl = website.websiteURL || website.website || '';
      const websiteDomain = extractDomainFromUrl(websiteUrl);
      
      if (websiteDomain === cleanDomain) {
        console.log('🔍 精确匹配成功:', websiteDomain);
        return website;
      }
    }
    
    // 包含匹配
    for (const website of websites) {
      const websiteUrl = website.websiteURL || website.website || '';
      const websiteDomain = extractDomainFromUrl(websiteUrl);
      
      if (websiteDomain.includes(cleanDomain) || cleanDomain.includes(websiteDomain)) {
        console.log('🔍 包含匹配成功:', websiteDomain, '包含', cleanDomain);
        return website;
      }
    }
    
    // 部分匹配（域名的主要部分）
    const domainParts = cleanDomain.split('.');
    if (domainParts.length >= 2) {
      const mainDomain = domainParts.slice(-2).join('.');
      
      for (const website of websites) {
        const websiteUrl = website.websiteURL || website.website || '';
        const websiteDomain = extractDomainFromUrl(websiteUrl);
        const websiteDomainParts = websiteDomain.split('.');
        
        if (websiteDomainParts.length >= 2) {
          const websiteMainDomain = websiteDomainParts.slice(-2).join('.');
          
          if (mainDomain === websiteMainDomain) {
            console.log('🔍 主域名匹配成功:', mainDomain);
            return website;
          }
        }
      }
    }
    
    console.log('🔍 未找到匹配的网站');
    return null;
  };

  // 从URL中提取域名
  const extractDomainFromUrl = (url: string): string => {
    if (!url) return '';
    
    try {
      // 确保URL有协议
      let fullUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = 'https://' + url;
      }
      
      const urlObj = new URL(fullUrl);
      return urlObj.hostname.toLowerCase();
    } catch (error) {
      console.error('🔍 URL解析失败:', url, error);
      return url.toLowerCase();
    }
  };

  // 添加缺失的方法
  const handleStartGenerationFromModal = async (data: any) => {
    try {
      setIsMessageSending(true);
      setIsSubmitting(true);

      const generateResponse = await apiClient.generateAlternative(
        data.conversationId,
        data.hubPageIds,
        data.websiteId
      );

      if (generateResponse?.code === 200) {
        setCurrentStep(3);
        startedTaskCountRef.current += data.hubPageIds.length;
        messageHandler.addSystemMessage('System is analyzing competitors and generating pages, please wait...');
        retryCountRef.current = 0;
        setHubPageIds([]);
        setSelectedCompetitors([]);
        setUserInput('');
        setIsProcessingTask(true);
      } else {
        messageHandler.addSystemMessage(`⚠️ Failed to generate alternative pages: Invalid server response`);
      }
    } catch (error: any) {
      messageHandler.addSystemMessage(`⚠️ Failed to process competitor selection: ${error.message}`);
    } finally {
      setIsMessageSending(false);
      setIsSubmitting(false);
    }
  };

  // 对应老代码第2669-2911行的handleUserInput函数
  const handleUserInput = async (eOrString: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    let formattedInput = '';
    if (typeof eOrString === 'string') {
      formattedInput = eOrString.trim();
    } else if (eOrString && eOrString.preventDefault) {
      eOrString.preventDefault();
      eOrString.stopPropagation();
      formattedInput = userInput.trim();
    }
    if (!formattedInput || isMessageSending) return;

    // --- 添加用户消息并显示思考状态 ---
    messageHandler.addUserMessage(formattedInput);
    const thinkingMessageId = messageHandler.addAgentThinkingMessage();
    setUserInput('');
    setIsMessageSending(true);

    try {
      setShowSlogan(false);

      // 处理域名输入 - 存储到localStorage
      const processedDomain = formattedInput;
      localStorage.setItem('currentDomain', processedDomain);
      localStorage.setItem('currentProductUrl', formattedInput);
      console.log('🔍 域名已存储:', processedDomain);

      // 根据图片规则：用户发送第一条消息创建聊天室
      let tempConversationId = currentConversationId;

      if (!tempConversationId) {
        setLoading(true);
        // 用户发送第一条消息，API自动创建聊天室并返回WebSocket连接
        const chatResponse = await apiClient.chatWithAI(getPageMode(), formattedInput, null);

        // 检查响应格式 - 可能返回WebSocket对象或包含conversationId的对象
        if (chatResponse && 'websocket' in chatResponse) {
          console.log('🔍 WebSocket模式，检查API响应中的conversationId');
          
          // 检查API响应中是否包含conversationId
          if (chatResponse.conversationId) {
            console.log('🔍 从API响应中获取到conversationId:', chatResponse.conversationId);
            tempConversationId = chatResponse.conversationId;
            setCurrentConversationId(tempConversationId);

            // 实时更新URL
            const currentPath = window.location.pathname;
            let targetPath = '/alternative';
            if (currentPath.includes('best')) {
              targetPath = '/best';
            } else if (currentPath.includes('faq') || currentPath.includes('FAQ')) {
              targetPath = '/FAQ';
            } else if (currentPath.includes('alternative')) {
              targetPath = '/alternative';
            }
            router.replace(`${targetPath}?conversationId=${tempConversationId}`);
          } else {
            console.log('🔍 WebSocket模式，等待后端返回conversationId');
            // 等待WebSocket消息中的conversationId
            const websocket = chatResponse.websocket;
            websocket.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                console.log('🔍 收到WebSocket消息:', data);
                
                if (data.conversationId) {
                  console.log('🔍 收到后端返回的conversationId:', data.conversationId);
                  setCurrentConversationId(data.conversationId);
                  
                  // 实时更新URL
                  const currentPath = window.location.pathname;
                  let targetPath = '/alternative';
                  if (currentPath.includes('best')) {
                    targetPath = '/best';
                  } else if (currentPath.includes('faq') || currentPath.includes('FAQ')) {
                    targetPath = '/FAQ';
                  } else if (currentPath.includes('alternative')) {
                    targetPath = '/alternative';
                  }
                  router.replace(`${targetPath}?conversationId=${data.conversationId}`);
                }
              } catch (error) {
                console.error('🔍 解析WebSocket消息失败:', error);
              }
            };
          }
        } else {
          messageHandler.updateAgentMessage('Failed to create a new chat. Please try again.', thinkingMessageId);
          setIsMessageSending(false);
          setLoading(false);
          return;
        }
      }

      // 处理响应 - 只使用WebSocket
      console.log('🔍 WebSocket状态检查:', {
        wsConnected,
        wsConnecting,
        wsConnectionState,
        wsError,
        hasChatService: false,
        conversationId: tempConversationId
      });

      // 使用API发送消息
      console.log('🔍 尝试通过API发送消息');
      try {
        const response = await apiClient.chatWithAI(getPageMode(), formattedInput, tempConversationId);
        if (response && 'websocket' in response) {
          console.log('🔍 WebSocket连接成功，消息将通过WebSocket处理');
        } else {
          messageHandler.updateAgentMessage('Failed to establish WebSocket connection. Please try again.', thinkingMessageId);
        }
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        messageHandler.updateAgentMessage('Failed to establish WebSocket connection. Please try again.', thinkingMessageId);
      }
    } catch (error) {
      // 静默处理错误
      console.error('Chat error:', error);
      messageHandler.updateAgentMessage('An error occurred while processing your request. Please try again.', thinkingMessageId);
    } finally {
      setIsMessageSending(false);
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // 对应老代码第1255-2155行的renderChatMessage函数
  const renderChatMessage = (message: any, index: number) => {
    if (message.type === 'thinking-log-group') {
      const isExpanded = thinkingLogExpanded[message.id] !== false;

      const getDisplayTitle = (logType: string, step: string, itemsLength: number) => {
        let title = '';
        if (logType === 'API') {
          if (step === 'FIND_COMPETITORS_SEMRUSH_API') {
            title = 'Finding competitors for the website URL';
          } else {
            title = `API Result - ${step || 'Processing'}`;
          }
        } else if (logType === 'Agent') {
          if (step === 'FIND_WEBSITE_SITEMAP_AGENT') {
            title = 'Finding website sitemap...';
          } else {
            title = 'Finding competitors...';
          }
        } else if (logType === 'CompetitorsAgent') {
          title = 'Finding competitors...';
        } else if (logType === 'SitemapAgent') {
          title = 'Finding website sitemap...';
        } else if (logType === 'Dify') {
          title = `Competitor Analysis - ${itemsLength || 0} steps`;
        } else if (logType === 'Html') {
          title = 'Code Generation - Writing HTML...';
        } else if (logType === 'Color') {
          title = 'Color Analysis - Page Style Detected';
        } else if (logType === 'Crawler_Images') {
          title = 'Image Crawling - Found Images';
        } else if (logType === 'Crawler_Headers') {
          title = 'Header Crawling - Found Header Links';
        } else if (logType === 'Crawler_Footers') {
          title = 'Footer Crawling - Found Footer Links';
        } else if (logType === 'Codes') {
          title = 'Page Generated - Coding Finished';
        } else {
          title = `${logType} Log - Processing`;
        }

        const words = title.split(' ');
        if (words.length > 10) {
          return words.slice(0, 10).join(' ') + '...';
        }
        return title;
      };

      return (
        <div
          key={message.id || `thinking-log-group-${index}`}
          className="flex justify-start mb-4"
          style={{ animation: 'fadeIn 0.5s ease-out forwards' }}
        >
          <div className="w-full flex flex-col items-start">
            <div className="relative w-full">
              <div
                className={`px-4 py-3 w-full hover:shadow-slate-500/20 transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl ${isHydrated ? themeStyles.agentProcessing?.background : 'bg-white/[0.04]'} ${isHydrated ? themeStyles.agentProcessing?.border : 'border-white/[0.05]'} border`}
              >
                {/* 标题栏 */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* 展开/折叠箭头 */}
                    <button
                      onClick={() => setThinkingLogExpanded(prev => ({
                        ...prev,
                        [message.id]: !prev[message.id]
                      }))}
                      className="flex-shrink-0 transition-transform duration-200"
                    >
                      <svg
                        className={`w-4 h-4 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: '#357BF7' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* 标题文字 */}
                    <span className={`${isHydrated ? themeStyles.agentProcessing?.titleText : 'text-white'} font-medium text-sm`}>
                      Agent Processing
                    </span>
                  </div>
                </div>

                {/* 展开的内容 */}
                {isExpanded && (
                  <div className="space-y-2 border-t border-gray-600/30 pt-3">
                    {message.items.map((item: any, itemIndex: number) => {
                      // 对于Dify组，需要特殊处理显示标题
                      let itemTitle;
                      if (item.isGroup && item.logType === 'Dify') {
                        const itemCount = item.items ? item.items.length : 1;
                        itemTitle = `Competitor Analysis - ${itemCount} ${itemCount === 1 ? 'step' : 'steps'}`;
                      } else {
                        // 对于其他类型，使用标准的getDisplayTitle函数
                        itemTitle = getDisplayTitle(item.logType, item.step, 1);
                      }

                      return (
                        <div
                          key={item.id || `item-${itemIndex}`}
                          className="flex items-center justify-between py-2 transition-colors duration-150"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* SVG圆圈图标 */}
                            <div className="flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">
                                <circle cx="7.5" cy="7" r="6.5" stroke="#8C8C8C" />
                              </svg>
                            </div>

                            {/* 项目标题 */}
                            <span
                              className="text-xs truncate"
                              style={{ color: '#8C8C8C' }}
                            >
                              {itemTitle}
                            </span>
                          </div>

                          {/* View按钮 */}
                          <button
                            onClick={() => {
                              if (!isBrowserSidebarOpen) {
                                setIsBrowserSidebarOpen(true);
                              }

                              setApiDetailModal({
                                visible: true,
                                data: item
                              })
                            }}
                            className="px-2 py-1 transition-colors duration-150 flex-shrink-0 text-xs font-medium flex items-center gap-1"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#8C8C8C',
                            }}
                            onMouseEnter={(e) => {
                              const target = e.target as HTMLElement;
                              target.style.color = '#357BF7';
                              // 也需要更新箭头的颜色
                              const arrow = target.querySelector('span') as HTMLElement;
                              if (arrow) arrow.style.color = '#357BF7';
                            }}
                            onMouseLeave={(e) => {
                              const target = e.target as HTMLElement;
                              target.style.color = '#8C8C8C';
                              // 恢复箭头的颜色
                              const arrow = target.querySelector('span') as HTMLElement;
                              if (arrow) arrow.style.color = '#8C8C8C';
                            }}
                          >
                            View
                            <span
                              className="transition-colors duration-150"
                              style={{ color: '#8C8C8C' }}
                            >
                              →
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 ml-2">
              {new Date(message.timestamp || Date.now()).toLocaleString()}
            </div>
          </div>
        </div>
      );
    }

    if (message.type === 'thinking-log') {
      const getDisplayTitle = (logType: string, step: string, itemsLength: number) => {
        let title = '';
        if (logType === 'API') {
          // 为 FIND_COMPETITORS_SEMRUSH_API 步骤添加特殊处理
          if (step === 'FIND_COMPETITORS_SEMRUSH_API') {
            title = 'Agent Processing | Finding competitors for the website URL';
          } else {
            title = `API Result - ${step || 'Processing'}`;
          }
        } else if (logType === 'Agent') {
          if (step === 'FIND_WEBSITE_SITEMAP_AGENT') {
            title = 'Agent Processing | Finding website sitemap...';
          } else {
            title = 'Agent Processing | Finding competitors...';
          }
        } else if (logType === 'CompetitorsAgent') {
          title = 'Agent Processing | Finding competitors...';
        } else if (logType === 'SitemapAgent') {
          title = 'Agent Processing | Finding website sitemap...';
        } else if (logType === 'Dify') {
          title = `Agent Processing | Competitor Analysis - ${itemsLength || 0} steps`;
        } else if (logType === 'Html') {
          title = 'Agent Processing | Code Generation - Writing HTML...';
        } else if (logType === 'Color') {
          title = 'Agent Processing | Color Analysis - Page Style Detected';
        } else if (logType === 'Crawler_Images') {
          title = 'Agent Processing | Image Crawling - Found Images';
        } else if (logType === 'Crawler_Headers') {
          title = 'Agent Processing | Header Crawling - Found Header Links';
        } else if (logType === 'Crawler_Footers') {
          title = 'Agent Processing | Footer Crawling - Found Footer Links';
        } else if (logType === 'Codes') {
          title = 'Agent Processing | Page Generated - Coding Finished';
        }
        else {
          title = `Agent Processing | ${logType} Log - Processing`;
        }

        const words = title.split(' ');
        if (words.length > 10) {
          return words.slice(0, 10).join(' ') + '...';
        }
        return title;
      };

      const displayTitle = getDisplayTitle(message.logType, message.step, message.items?.length);

      // 分割标题为两部分：Agent Processing | 和后面的内容
      const titleParts = displayTitle.split(' | ');
      const agentProcessingText = titleParts[0] + ' |'; // "Agent Processing |"
      const followingText = titleParts[1] || ''; // 后面的内容

      return (
        <div
          key={message.id || `thinking-log-${message.logType}-${index}`}
          className="flex justify-start mb-4"
          style={{ animation: 'fadeIn 0.5s ease-out forwards' }}
        >
          <div className="w-full flex flex-col items-start">
            <div className="relative w-full">
              <div
                className={`px-3 py-2 w-full hover:shadow-slate-500/20 transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl ${isHydrated ? themeStyles.agentProcessing?.background : 'bg-white/[0.04]'} ${isHydrated ? themeStyles.agentProcessing?.border : 'border-white/[0.05]'} border`}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    {/* 去掉所有SVG图标，直接显示文字 */}
                    <span className="text-white font-medium text-xs">
                      {agentProcessingText}
                    </span>
                    {followingText && (
                      <span className="text-gray-400 text-xs">
                        {' ' + followingText}
                      </span>
                    )}
                  </div>

                  {/* View按钮在右侧 */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!(message.logType === 'API' && message.step === 'FIND_COMPETITORS_SEMRUSH_API') && (
                      <button
                        onClick={() => setApiDetailModal({
                          visible: true,
                          data: message
                        })}
                        className="px-2 py-1 transition-colors duration-150 flex-shrink-0 text-xs font-medium"
                        style={{
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.10)',
                          border: 'none',
                          color: 'rgba(255, 255, 255, 0.50)',
                        }}
                        onMouseEnter={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.background = 'rgba(255, 255, 255, 0.15)';
                          target.style.color = 'rgba(255, 255, 255, 0.70)';
                        }}
                        onMouseLeave={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.background = 'rgba(255, 255, 255, 0.10)';
                          target.style.color = 'rgba(255, 255, 255, 0.50)';
                        }}
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {/* 去掉小三角形 */}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 ml-2">
              {new Date(message.timestamp || Date.now()).toLocaleString()}
            </div>
          </div>
        </div>
      );
    }

    if (message.type === 'important-tip') {
      return (
        <div
          key={`important-tip-${message.id || index}`}
          className="flex justify-start mb-4"
        >
          <div className="max-w-[80%]">
            <div className="bg-slate-700 border-l-4 border-blue-500 p-3 rounded-r-md shadow-sm">
              <div className="text-white text-sm font-medium">
                {message.content.split('\n').map((line: string, i: number) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < message.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 ml-1">
              {new Date(message.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      );
    }

    if (message.type === 'codes-completion') {
      return (
        <div
          key={message.id || `codes-completion-${index}`}
          className="flex justify-start mb-4"
          style={{ animation: 'fadeIn 0.5s ease-out forwards' }}
        >
          <div className="w-full flex flex-col items-start">
            <div className="relative w-full">
              <div
                className="px-4 py-3 w-full hover:shadow-slate-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
                style={{
                  borderRadius: '12px',
                  border: isHydrated ? themeStyles.successMessage?.border : '1px solid rgba(34, 197, 94, 0.2)',
                  background: isHydrated ? themeStyles.successMessage?.background : 'rgba(34, 197, 94, 0.1)',
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* 成功图标 */}
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full ${isHydrated ? themeStyles.successMessage?.iconBackground : 'bg-green-500'} flex items-center justify-center`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>

                    {/* 消息内容 */}
                    <span className={`${isHydrated ? themeStyles.successMessage?.text : 'text-green-300'} font-medium text-sm`}>
                      {message.content}
                    </span>
                  </div>

                  {/* View按钮 */}
                  <button
                    onClick={() => {
                      if (!isBrowserSidebarOpen) {
                        setIsBrowserSidebarOpen(true);
                      }
                      setApiDetailModal({
                        visible: true,
                        data: message
                      });
                    }}
                    className="px-3 py-1.5 transition-colors duration-150 flex-shrink-0 text-xs font-medium"
                    style={{
                      borderRadius: '6px',
                      background: isHydrated ? themeStyles.successMessage?.buttonBackground : 'rgba(34, 197, 94, 0.2)',
                      border: 'none',
                      color: isHydrated ? themeStyles.successMessage?.buttonText : 'rgba(34, 197, 94, 0.8)',
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.background = isHydrated ? themeStyles.successMessage?.buttonHoverBackground : 'rgba(34, 197, 94, 0.3)';
                      target.style.color = isHydrated ? themeStyles.successMessage?.buttonHoverText : 'rgba(34, 197, 94, 1)';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.background = isHydrated ? themeStyles.successMessage?.buttonBackground : 'rgba(34, 197, 94, 0.2)';
                      target.style.color = isHydrated ? themeStyles.successMessage?.buttonText : 'rgba(34, 197, 94, 0.8)';
                    }}
                  >
                    View Code
                  </button>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 ml-2">
              {new Date(message.timestamp || Date.now()).toLocaleString()}
            </div>
          </div>
        </div>
      );
    }

    if (message.type === 'sitemap-button') {
      return (
        <div key={message.id || index} className="flex justify-center mb-8">
          <button
            className={`group relative px-8 py-4 ${isHydrated ? `${themeStyles.sitemapButton?.backgroundClass} ${themeStyles.sitemapButton?.hoverBackgroundClass}` : 'bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-blue-700/90 hover:from-blue-500/95 hover:via-indigo-500/95 hover:to-blue-600/95'} 
                       ${isHydrated ? themeStyles.sitemapButton?.text : 'text-white'} font-bold text-base rounded-xl 
                       ${isHydrated ? themeStyles.sitemapButton?.shadow : 'shadow-xl hover:shadow-2xl hover:shadow-blue-500/25'} 
                       transition-all duration-300 
                       transform hover:scale-105 hover:-translate-y-1 
                       backdrop-blur-sm overflow-hidden
                       animate-pulse hover:animate-none`}
            style={{
              background: isHydrated ? themeStyles.sitemapButton?.background : 'linear-gradient(285.22deg, rgba(59, 130, 246, 0.15) 44.35%, rgba(150, 56, 7, 0.8) 92.26%)'
            }}
            onClick={() => {
              if (browserTabs.length >= 10) {
                messageApi.info('You have reached the maximum number of pages. Please start a new task to get started.');
                return;
              }
              if (isProcessingTask) {
                messageApi.info('A task is currently in progress. Please wait and try again later.');
                return;
              }
              if (typeof message.onGenerate === 'function') {
                message.onGenerate();
              }
            }}
          >
            {/* 背景动画效果 */}
            <div className={`absolute inset-0 ${isHydrated && themeStyles.sitemapButton?.background?.includes('purple') ? 'bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-purple-400/20' : 'bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-blue-400/20'} 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

            {/* 光泽效果 */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                            translate-x-[-100%] group-hover:translate-x-[100%] 
                            transform transition-transform duration-700"></div>

            <div className="relative z-10 flex items-center gap-3">
              <span className="text-xl animate-bounce">🗺️</span>
              <div className="flex flex-col items-start">
                <span className="tracking-wide leading-tight">Get Your Custom Sitemap Plan</span>
                <span className="text-sm opacity-90 font-medium">Click to get more quality pages hints ✨</span>
              </div>
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            {/* 底部光效 */}
            <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-px 
                            ${isHydrated && themeStyles.sitemapButton?.background?.includes('purple') ? 'bg-gradient-to-r from-transparent via-purple-300 to-transparent' : 'bg-gradient-to-r from-transparent via-blue-300 to-transparent'} 
                            opacity-60 group-hover:opacity-100 transition-opacity duration-300`}></div>
          </button>
        </div>
      );
    }

    if (message.type === 'confirm-button') {
      return (
        <div key={message.id || index} className="flex justify-center mb-6">
          <button
            className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-600 via-blue-600 to-purple-600 
                     hover:from-blue-500 hover:via-blue-500 hover:to-purple-500 
                     text-white font-semibold text-sm rounded-lg shadow-lg 
                     hover:shadow-blue-500/25 transition-all duration-300 
                     transform hover:scale-105 hover:-translate-y-0.5 
                     border border-blue-500/50 hover:border-blue-400/70
                     backdrop-blur-sm overflow-hidden"
            onClick={() => {
              if (typeof message.onConfirm === 'function') {
                message.onConfirm();
              }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center gap-2">
              <span className="text-sm">👆</span>
              <span className="tracking-wide">If you confirm, click here!</span>
              <span className="text-sm">✨</span>
            </div>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      );
    }

    // 系统消息渲染
    if (message.source === 'system') {
      return (
        <div
          key={index}
          className="flex justify-start mb-6"
          style={{ animation: 'fadeIn 0.5s ease-out forwards' }}
        >
          <div className="max-w-[80%] w-full flex flex-col items-start">
            <div className="relative">
              <div
                className={`p-4 rounded-2xl text-sm ${isHydrated ? themeStyles.systemMessage?.background : 'bg-slate-800/80'} ${isHydrated ? themeStyles.systemMessage?.text : 'text-white'} ${isHydrated ? themeStyles.systemMessage?.shadow : 'shadow-xl'} backdrop-blur-sm
                         border ${isHydrated ? themeStyles.systemMessage?.border : 'border-slate-600/40'} rounded-tl-none
                         ${isHydrated ? themeStyles.systemMessage?.hoverShadow : 'hover:shadow-slate-500/20'} transition-all duration-300 transform hover:-translate-y-0.5`}
                style={{
                  maxWidth: '800px',
                }}
              >
                <div className="flex items-start gap-3">
                  <InfoCircleOutlined className={`${isHydrated ? themeStyles.systemMessage?.iconColor : 'text-slate-400'} text-lg mt-0.5 flex-shrink-0`} />
                  <span className="leading-relaxed">
                    {message.content.split('\n').map((line: string, i: number) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < message.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              </div>
              <div className={`absolute -left-1 top-0 w-2 h-2 ${isHydrated ? themeStyles.systemMessage?.background : 'bg-slate-800/80'} transform rotate-45`}></div>
            </div>
            <div className={`text-[10px] ${isHydrated ? themeStyles.systemMessage?.timestampColor : 'text-slate-400'} mt-1 ml-2`}>
              {new Date(message.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      );
    }

    // 用户消息渲染
    if (message.source === 'user') {
      if (isJsonArrayMessage(message.content)) {
        return null;
      }

      if (isDomainListMessage(message.content)) {
        return null;
      }

      return (
        <div
          key={index}
          className="flex justify-end mb-6"
          style={{ animation: 'fadeIn 0.5s ease-out forwards' }}
        >
          <div className="flex max-w-[80%] flex-col items-end">
            <div className="relative">
              <div className={`p-4 text-sm backdrop-blur-sm
                transition-all duration-500
                transform hover:-translate-y-1 hover:scale-[1.02]
                ${isHydrated ? themeStyles.userMessage?.text : 'text-white'}
                ${isHydrated ? themeStyles.userMessage?.background : 'bg-white/10'}
                relative overflow-hidden rounded-xl`}
                style={{
                  maxWidth: '350px',
                  wordWrap: 'break-word'
                }}>
                <div className="relative z-10">
                  {filterMessageTags(message.content).split('\n').map((line: string, i: number) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < message.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 ml-2">
              {new Date(message.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      );
    }

    if (message.type === 'pages-grid') {
      return (
        <div key={`${index}-pages`} className="flex justify-start mb-4" style={{ animation: 'fadeIn 0.5s ease-out forwards' }}>
          <div className="max-w-[95%] w-full">
            {/* Title section - more compact */}
            <div className={`mb-2 text-2xs font-medium pl-3 py-1 rounded-r-md ${isHydrated ? `${themeStyles.pagesGrid?.title?.text} ${themeStyles.pagesGrid?.title?.background} ${themeStyles.pagesGrid?.title?.border}` : 'text-slate-300 bg-slate-800/20 border-l-2 border-slate-500'
              }`}>
              Found <span className={`font-bold ${isHydrated ? themeStyles.pagesGrid?.title?.highlight : 'text-slate-200'}`}>{message.pages.length}</span> potential {message.pageType ? `${message.pageType} ` : ""}content pages
            </div>

            {/* More compact list layout */}
            <div className="flex flex-col gap-1.5">
              {message.pages.map((page: any, idx: number) => (
                <div
                  key={page.hubPageId || `page-${idx}`}
                  className="group transition-all duration-200 hover:shadow-lg"
                  style={{
                    borderRadius: isHydrated ? themeStyles.pagesGrid?.pageCard?.borderRadius : '12px',
                    border: (() => {
                      const isSelected = selectedCompetitors.some((c: any) => c.hubPageId === page.hubPageId);
                      if (isSelected) {
                        return isHydrated ? themeStyles.pagesGrid?.pageCard?.borderSelected : '1px solid var(--Color-, #357BF7)';
                      }
                      return isHydrated ? themeStyles.pagesGrid?.pageCard?.border : '1px solid transparent';
                    })(),
                    background: isHydrated ? themeStyles.pagesGrid?.pageCard?.background : '#292F3B',
                    padding: '16px'
                  }}
                  onMouseEnter={(e) => {
                    // 只有当事件目标是最外层div时才改变边框
                    if (e.target === e.currentTarget) {
                      const isSelected = selectedCompetitors.some((c: any) => c.hubPageId === page.hubPageId);
                      if (!isSelected) {
                        e.currentTarget.style.border = isHydrated ? themeStyles.pagesGrid?.pageCard?.borderHover : '1px solid var(--Gray-Blue-7, #5A6B93)';
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    // 只有当事件目标是最外层div时才改变边框
                    if (e.target === e.currentTarget) {
                      const isSelected = selectedCompetitors.some((c: any) => c.hubPageId === page.hubPageId);
                      if (!isSelected) {
                        e.currentTarget.style.border = isHydrated ? themeStyles.pagesGrid?.pageCard?.border : '1px solid transparent';
                      }
                    }
                  }}
                >
                  <div className="flex flex-col">
                    {/* Header row - Checkbox, Title, Action Buttons */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {/* Checkbox替代Select按钮 */}
                        {!page.isPageGenerated && (
                          <input
                            type="checkbox"
                            checked={selectedCompetitors.some((c: any) => c.hubPageId === page.hubPageId)}
                            onChange={() => handleCompetitorSelect(page)}
                            className="w-4 h-4 text-blue-600 bg-transparent border-2 border-gray-400 rounded focus:ring-blue-500 focus:ring-2"
                            style={{ accentColor: isHydrated ? themeStyles.pagesGrid?.checkbox?.accentColor : '#357BF7' }}
                          />
                        )}

                        {/* Page title */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${isHydrated ? themeStyles.pagesGrid?.tdkLabel?.text : 'text-gray-500'}`}>
                              T:
                            </span>
                            <div className={`font-medium leading-tight ${isHydrated ? themeStyles.pagesGrid?.pageTitle?.text : 'text-white'}`}
                              style={{ fontSize: '0.875rem' }}
                              title={page.pageTitle}>
                              {page.pageTitle}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {/* Edit button - only show for non-generated pages */}
                        {!page.isPageGenerated && (
                          <button
                            className="text-xs font-medium px-3 py-1 transition-all duration-200 hover:opacity-80 flex items-center gap-1"
                            style={{
                              borderRadius: isHydrated ? themeStyles.pagesGrid?.viewButton?.borderRadius : '12px',
                              background: isHydrated ? themeStyles.pagesGrid?.viewButton?.background : 'linear-gradient(115deg, #AA450B -2.53%, #231109 26.44%, #10132D 48.59%, #101834 68.22%, #0D47A6 96.36%)',
                              boxShadow: isHydrated ? themeStyles.pagesGrid?.viewButton?.boxShadow : '0px 2px 5px 0px rgba(255, 255, 255, 0.10)',
                              color: isHydrated ? themeStyles.pagesGrid?.viewButton?.text : 'var(--Color-, #FFF)'
                            }}
                            onClick={() => handleEditPage(page)}
                          >
                            <span>Edit</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}

                        {/* View button - only show for generated pages */}
                        {page.isPageGenerated && (
                          <button
                            className="text-xs font-medium px-3 py-1 transition-all duration-200 hover:opacity-80 flex items-center gap-1"
                            style={{
                              borderRadius: isHydrated ? themeStyles.pagesGrid?.viewButton?.borderRadius : '12px',
                              background: isHydrated ? themeStyles.pagesGrid?.viewButton?.background : 'linear-gradient(115deg, #AA450B -2.53%, #231109 26.44%, #10132D 48.59%, #101834 68.22%, #0D47A6 96.36%)',
                              boxShadow: isHydrated ? themeStyles.pagesGrid?.viewButton?.boxShadow : '0px 2px 5px 0px rgba(255, 255, 255, 0.10)',
                              color: isHydrated ? themeStyles.pagesGrid?.viewButton?.text : 'var(--Color-, #FFF)'
                            }}
                            onClick={() => {
                              const previewUrl = `https://preview.websitelm.site/en/${page.generatedPageId}`;
                              window.open(previewUrl, '_blank');
                            }}
                          >
                            <span>View</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Description row - TDK D */}
                    {page.description && (
                      <div className={`flex items-start gap-2 mb-3 text-sm`} style={{
                        marginLeft: !page.isPageGenerated ? '28px' : '0'
                      }}>
                        <span className={`text-xs font-medium flex-shrink-0 mt-0.5 ${isHydrated ? themeStyles.pagesGrid?.tdkLabel?.text : 'text-gray-500'}`}>
                          D:
                        </span>
                        <div className={`${isHydrated ? themeStyles.pagesGrid?.pageDescription?.text : 'text-gray-400'} leading-relaxed`}
                          style={{ fontSize: '0.8rem' }}
                          title={page.description}>
                          {page.description.length > 120 ? `${page.description.substring(0, 120)}...` : page.description}
                        </div>
                      </div>
                    )}

                    {/* Keywords row - TDK K */}
                    {page.relatedKeywords && page.relatedKeywords.length > 0 && (
                      <div className={`flex items-start gap-2 mb-3 text-sm`} style={{
                        marginLeft: !page.isPageGenerated ? '28px' : '0'
                      }}>
                        <span className={`text-xs font-medium flex-shrink-0 mt-0.5 ${isHydrated ? themeStyles.pagesGrid?.tdkLabel?.text : 'text-gray-500'}`}>
                          K:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {page.pageType === 'best' ? (
                            <div className="flex flex-wrap gap-1">
                              {page.relatedKeywords.slice(0, 4).map((keyword: string, kidx: number) => (
                                <span key={kidx}
                                  className="px-2 py-1 text-xs"
                                  style={{
                                    borderRadius: isHydrated ? themeStyles.pagesGrid?.keywordTag?.borderRadius : '6px',
                                    background: isHydrated ? themeStyles.pagesGrid?.keywordTag?.background : 'var(--Gray-Blue-8, #415071)',
                                    color: isHydrated ? themeStyles.pagesGrid?.keywordTag?.text : 'var(--Color-, #FFF)'
                                  }}>
                                  {keyword}
                                </span>
                              ))}
                              {page.relatedKeywords.length > 4 && (
                                <span className={`text-xs ${isHydrated ? themeStyles.pagesGrid?.metrics?.label : 'text-gray-400'}`}>
                                  +{page.relatedKeywords.length - 4}
                                </span>
                              )}
                            </div>
                          ) : (
                            <>
                              {page.relatedKeywords.slice(0, 3).map((keyword: string, kidx: number) => (
                                <span key={kidx}
                                  className="px-2 py-1 text-xs"
                                  style={{
                                    borderRadius: isHydrated ? themeStyles.pagesGrid?.keywordTag?.borderRadius : '6px',
                                    background: isHydrated ? themeStyles.pagesGrid?.keywordTag?.background : 'var(--Gray-Blue-8, #415071)',
                                    color: isHydrated ? themeStyles.pagesGrid?.keywordTag?.text : 'var(--Color-, #FFF)'
                                  }}>
                                  {keyword}
                                </span>
                              ))}
                              {page.relatedKeywords.length > 3 && (
                                <span className={`text-xs ${isHydrated ? themeStyles.pagesGrid?.metrics?.label : 'text-gray-400'}`}>
                                  +{page.relatedKeywords.length - 3}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Metrics row - Traffic, KD */}
                    <div className={`flex items-center gap-6 text-sm ${isHydrated ? themeStyles.pagesGrid?.metrics?.label : 'text-gray-400'}`} style={{
                      marginLeft: !page.isPageGenerated ? '28px' : '0'
                    }}>
                      {/* Traffic */}
                      <span>
                        Traffic: <span className={isHydrated ? themeStyles.pagesGrid?.metrics?.value : 'text-white'}>
                          {(() => {
                            const trafficValue = String(page.trafficPotential).trim();
                            return (trafficValue !== "0" && trafficValue !== "") ? page.trafficPotential : '-';
                          })()}
                        </span>
                      </span>

                      {/* KD */}
                      <span>
                        KD: <span className={isHydrated ? themeStyles.pagesGrid?.metrics?.value : 'text-white'}>
                          {(() => {
                            const difficultyValue = String(page.difficulty).trim();
                            return (difficultyValue !== "0" && difficultyValue !== "") ? page.difficulty : '-';
                          })()}
                        </span>
                      </span>
                    </div>

                    {/* Competitors row for best type */}
                    {page.pageType === 'best' && page.competitors && page.competitors.length > 0 && (
                      <div className={`flex items-center gap-2 mt-3 text-sm ${isHydrated ? themeStyles.pagesGrid?.metrics?.label : 'text-gray-400'}`} style={{
                        marginLeft: !page.isPageGenerated ? '28px' : '0'
                      }}>
                        <span>Competitors:</span>
                        <div className="flex flex-wrap gap-1">
                          {page.competitors.map((competitor: string, cidx: number) => (
                            <span key={cidx}
                              className="px-2 py-1 text-xs"
                              style={{
                                borderRadius: isHydrated ? themeStyles.pagesGrid?.competitorTag?.borderRadius : '6px',
                                background: isHydrated ? themeStyles.pagesGrid?.competitorTag?.background : 'var(--Gray-Blue-8, #415071)',
                                color: isHydrated ? themeStyles.pagesGrid?.competitorTag?.text : 'var(--Color-, #FFF)'
                              }}>
                              {competitor.replace(/^https?:\/\/(www\.)?/, '').substring(0, 20)}
                              {competitor.replace(/^https?:\/\/(www\.)?/, '').length > 20 && '...'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    else {
    const filteredContent = linkifyDomains(
      filterMessageTags(message.content).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    );
      const elements = [];

      // 1. Agent消息本身
      elements.push(
      <div key={index} className="flex flex-col justify-start mb-6" style={{ animation: 'fadeIn 0.5s ease-out forwards' }}>
        <div className="flex max-w-[80%] flex-row group">
          <div className="flex-shrink-0" style={{ animation: 'bounceIn 0.6s ease-out forwards' }}>
          </div>
          <div className="relative">
            <div className={`text-sm ${isHydrated ? themeStyles.agentMessage?.text : 'text-white'}`} style={{ maxWidth: '800px', wordWrap: 'break-word' }}>
              <div className="relative z-10">
                {message.isThinking ? (
                  <div className="flex space-x-1">
                    <div className={`w-2 h-2 ${isHydrated ? themeStyles.agentMessage?.loadingDots : 'bg-gray-300'} rounded-full animate-bounce`}></div>
                    <div className={`w-2 h-2 ${isHydrated ? themeStyles.agentMessage?.loadingDots : 'bg-gray-300'} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
                    <div className={`w-2 h-2 ${isHydrated ? themeStyles.agentMessage?.loadingDots : 'bg-gray-300'} rounded-full animate-bounce`} style={{ animationDelay: '0.4s' }}></div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => setMessageCollapsed(prev => ({ ...prev, [index]: !prev[index] }))}
                        className="text-slate-400 hover:text-slate-300 transition-colors flex-shrink-0 mt-1"
                      >
                      </button>
                      <div className="relative">
                        <div className={`${messageCollapsed[index] ?? true ? 'line-clamp-6' : ''}`}>
                          <span dangerouslySetInnerHTML={{ __html: filteredContent.split('\n').join('<br />') }} />
                        </div>
                        {(messageCollapsed[index] ?? true) && filteredContent.split('\n').length > 6 && (
                          <div className={`absolute bottom-0 left-0 right-0 h-16 pointer-events-none ${isHydrated ? `${themeStyles.messageCollapse?.gradientOverlay} ${themeStyles.messageCollapse?.borderRadius}` : 'bg-gradient-to-b from-transparent to-slate-800/90 rounded-lg'
                            }`} />
                        )}
                      </div>
                    </div>
                    {filteredContent.split('\n').length > 3 && (
                      <div
                        className="mt-3 text-xs text-slate-400 text-center cursor-pointer hover:text-slate-300 flex items-center justify-center gap-1"
                        onClick={() => {
                          setMessageCollapsed(prev => ({
                            ...prev,
                            [index]: !(prev[index] ?? true)
                          }));
                        }}
                      >
                        {messageCollapsed[index] ?? true ? (
                          <>
                            <span>Show More</span>
                            <DownOutlined className="text-xs" />
                          </>
                        ) : (
                          <>
                            <span>Show Less</span>
                            <UpOutlined className="text-xs" />
                          </>
                        )}
                      </div>
                    )}

                    {message.showLoading && (
                      <div className="inline-flex items-center ml-2 mt-1">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce ml-1" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce ml-1" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
              {/* 去掉小三角形 */}
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 ml-2">
          {new Date(message.timestamp).toLocaleString()}
        </div>
      </div>
    );
      return elements;
    }
  };

  // 组合消息数据
  const combinedMessages = useMemo(() => {
    return messages;
  }, [messages]);

  // 获取slogan内容
  const sloganContent = getSloganContent();

  // 是否为入口页面
  const isEntryPage = !conversationId;

  // 对应老代码第3718行开始的主渲染逻辑
  return (
    <>
      <div className={`w-full min-h-screen text-white flex items-center justify-center p-4 relative overflow-hidden ${isHydrated ? themeStyles.background : 'bg-gradient-to-b from-[#121826] to-[#030810]'}`}
        style={{
          paddingTop: isEntryPage ? "0" : "40px",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>

        <div className={`relative z-10 w-full flex ${isMobile ? 'flex-col' : 'flex-row'} gap-6 h-[calc(100vh-140px)] px-4 text-sm ${isEntryPage ? 'justify-center' : ''}`}>
          <div className={`${isMobile
            ? 'w-full h-full'
            : !isEntryPage
              ? 'w-1/2'
              : 'w-[100%] max-w-5xl'
            } relative flex flex-col`}>

            {isMobile && (
              <div className="bg-gradient-to-r from-red-600 to-pink-700 text-white px-4 py-2.5 text-xs font-medium shadow-md rounded-md my-2">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>For a better experience viewing execution process and generated pages, please visit on desktop.
                    You will be notified through email when the task is complete.
                  </span>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto pt-4 px-4 pb-4 chat-messages-container" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#4A5568 transparent',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: messages.length === 0 && isEntryPage ? 'center' : 'flex-start',
              marginBottom: !isEntryPage ? '128px' : '0',
            }}>
              {showSlogan && !isRecoveryMode && messages.length === 0 && (
                <div style={{
                  margin: isEntryPage ? 'auto 0' : '0 auto',
                  padding: '2rem',
                  textAlign: 'center',
                  width: '100%'
                }}>
                  {/* 新增顶部区域 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '356px',
                    height: '52px',
                    flexShrink: 0,
                    margin: '0 auto 24px auto',
                    padding: '8px 16px',
                    borderRadius: '29.944px',
                    background: currentTheme === 'dark' ? 'rgba(1, 1, 2, 0.08)' : 'rgba(255, 255, 255, 0.08)',
                    boxShadow: currentTheme === 'dark'
                      ? '0px 0px 15.524px 0px rgba(83, 111, 193, 0.60) inset'
                      : '0px 0px 15.524px 0px rgba(84, 130, 255, 0.40) inset',
                    backdropFilter: 'blur(12.55px)'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="23" height="24" viewBox="0 0 23 24" fill="none">
                      <path d="M15.2724 8.1089C15.1104 7.9945 14.925 7.91757 14.7296 7.88367C14.5342 7.84978 14.3337 7.85977 14.1426 7.91292C13.9515 7.96607 13.7747 8.06106 13.6249 8.19099C13.475 8.32093 13.356 8.48256 13.2763 8.66419L12.6438 10.5863C12.49 11.0488 12.2306 11.469 11.8861 11.8138C11.5416 12.1586 11.1216 12.4183 10.6593 12.5725L8.8209 13.1697C8.55961 13.2606 8.33366 13.4317 8.17525 13.6585C8.05294 13.8304 7.97327 14.029 7.94283 14.2378C7.91238 14.4466 7.93203 14.6597 8.00016 14.8594C8.06828 15.0591 8.18293 15.2398 8.33463 15.3865C8.48633 15.5331 8.67075 15.6416 8.87265 15.703L10.6921 16.2944C11.1547 16.4479 11.5752 16.707 11.9202 17.0512C12.2652 17.3953 12.5254 17.8152 12.68 18.2774L13.2771 20.1149C13.369 20.3752 13.5395 20.6006 13.7651 20.7597C13.992 20.9162 14.2612 21 14.5368 21C14.8125 21 15.0816 20.9162 15.3085 20.7597C15.5376 20.5977 15.71 20.3679 15.8014 20.1026L16.406 18.242C16.5602 17.7918 16.8148 17.3826 17.1505 17.0454C17.4862 16.7081 17.8942 16.4516 18.3437 16.2953L20.1837 15.6989C20.4455 15.6063 20.672 15.4345 20.8316 15.2072C20.9912 14.98 21.076 14.7086 21.0742 14.4309C21.0724 14.1532 20.9841 13.883 20.8215 13.6578C20.659 13.4327 20.4303 13.2638 20.1673 13.1746L18.347 12.5832C17.7569 12.3852 17.2381 12.0178 16.8553 11.5269C16.6368 11.2451 16.4684 10.9289 16.3575 10.5904L15.7595 8.75536C15.6675 8.49415 15.4966 8.26826 15.2708 8.1089M7.26675 3.11461C7.09957 2.99647 6.89975 2.93331 6.69504 2.9339C6.49171 2.93327 6.29317 2.99553 6.12661 3.11215C5.95513 3.23323 5.82678 3.4059 5.76025 3.60501L5.45468 4.5439C5.39005 4.73883 5.28091 4.91603 5.13591 5.06146C4.99091 5.20689 4.81403 5.31655 4.61929 5.38176L3.6615 5.69226C3.46835 5.76087 3.30112 5.88752 3.18274 6.05486C3.06437 6.22221 3.00063 6.42206 3.00025 6.62704C3.00025 6.83739 3.06754 7.04222 3.19227 7.2116C3.31701 7.38097 3.49266 7.506 3.69354 7.5684L4.63326 7.87233C4.82827 7.93704 5.00553 8.04631 5.15096 8.19146C5.2964 8.33661 5.40601 8.51365 5.47111 8.70854L5.78325 9.66386C5.85057 9.85884 5.97736 10.0278 6.14575 10.1469C6.31415 10.266 6.51567 10.3293 6.72194 10.3279C6.9282 10.3264 7.12881 10.2603 7.29552 10.1388C7.46222 10.0173 7.58662 9.84663 7.65118 9.65072L7.9584 8.70936C8.02135 8.51698 8.12764 8.34161 8.26905 8.19678C8.41047 8.05194 8.58325 7.94151 8.77407 7.87397L9.73186 7.56347C9.92546 7.49509 10.0931 7.36843 10.2118 7.2009C10.3305 7.03336 10.3944 6.83318 10.3948 6.62786C10.3945 6.42079 10.3291 6.21904 10.2078 6.05124C10.0864 5.88345 9.91531 5.75813 9.71872 5.69308L8.779 5.38751C8.58323 5.32296 8.40539 5.21327 8.25984 5.06729C8.11429 4.92131 8.00512 4.74315 7.94114 4.54719L7.62982 3.59186C7.56189 3.39886 7.43557 3.23178 7.2684 3.11379" fill="#357BF7" />
                    </svg>
                    <span style={{
                      color: isHydrated ? (currentTheme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(34,34,34,0.8)') : 'rgba(255,255,255,0.8)',
                      fontFamily: 'Poppins',
                      fontSize: '16px',
                      fontStyle: 'normal',
                      fontWeight: 300,
                      lineHeight: 'normal'
                    }}>
                      Generate 5 pages for free.
                    </span>
                  </div>

                  {/* 修改后的大标题 */}
                  <h1 style={{
                    textAlign: 'center',
                    fontFamily: 'Poppins',
                    fontSize: '48px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '120%',
                    marginBottom: '1rem',
                    background: isEntryPage ? 'linear-gradient(101deg, #336FFF 20.01%, #A671FC 56.73%, #F5894F 92.85%)' :
                      (isHydrated ? (currentTheme === 'dark' ? '#fff' : '#222') : '#fff'),
                    WebkitBackgroundClip: isEntryPage ? 'text' : 'unset',
                    WebkitTextFillColor: isEntryPage ? 'transparent' : 'unset',
                    color: isEntryPage ? 'transparent' : (isHydrated ? (currentTheme === 'dark' ? '#fff' : '#222') : '#fff')
                  }}>
                    {sloganContent.title}
                  </h1>

                  <h3 style={{
                    color: '#BFBFBF',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    margin: '0 auto',
                    marginBottom: isEntryPage ? '2rem' : '0'
                  }}>
                    {sloganContent.description}
                  </h3>

                  {isEntryPage && (
                    <>
                      {/* 在isEntryPage模式下，直接在这里放置输入框 */}
                      <div className="max-w-[600px] mx-auto mt-4">
                        <div className="relative">
                          <div className="w-full max-w-xxl mx-auto">
                            <div className="rounded-2xl shadow-lg px-5 py-4 flex flex-col gap-2"
                              style={{
                                borderRadius: isHydrated ? (themeStyles.inputArea?.borderRadius || '16px') : '16px',
                                background: isHydrated ? (currentTheme === 'dark' ? (themeStyles.inputArea?.background || '#0B1421') : '#FFFFFF') : 'transparent',
                                boxShadow: isHydrated ? (currentTheme === 'dark' ? (themeStyles.inputArea?.boxShadow || '0px 4px 16px 0px rgba(255, 255, 255, 0.08)') : '0px 4px 16px 0px rgba(0, 0, 0, 0.08)') : '0 2px 16px 0 rgba(30,41,59,0.08)',
                                backdropFilter: 'blur(2px)',
                              }}
                            >
                              <div
                                style={{
                                  content: '""',
                                  position: 'absolute',
                                  inset: 0,
                                  borderRadius: '1rem',
                                  padding: '1px',
                                  background: 'linear-gradient(101deg, rgba(51, 111, 255, 1) 20.01%, rgba(166, 113, 252, 0.3) 56.73%, rgba(245, 137, 79, 0.1) 92.85%)',
                                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                  WebkitMaskComposite: 'xor',
                                  maskComposite: 'exclude',
                                  pointerEvents: 'none',
                                }}
                              />
                              <ChatInput
                                userInput={userInput}
                                setUserInput={setUserInput}
                                onSendMessage={handleUserInput}
                                loading={loading}
                                isMessageSending={isMessageSending}
                                isProcessingTask={isProcessingTask}
                                disabled={false}
                                placeholder="Please enter your website domain...."
                                chatType={getPageMode()}
                                onDomainProcessed={(domain, websiteId) => {
                                  console.log('🔍 域名已处理:', { domain, websiteId });
                                  // 这里可以添加额外的域名处理逻辑
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              {combinedMessages.map((message, index) => renderChatMessage(message, index))}
              <div ref={chatEndRef} />
            </div>

            {!isEntryPage && (
              <div className="p-4 flex-shrink-0">
                <div className={`max-w-[600px] mx-auto ${isEntryPage ? 'mt-[-80px]' : 'mt-[-160px]'}`}>
                  {browserTabs.length >= 10 ? (
                    <div className={`flex flex-col items-center justify-center p-4 rounded-lg ${isHydrated ? themeStyles.pagesGrid?.pageLimitNotice?.background : 'bg-slate-800/60'} border ${isHydrated ? themeStyles.pagesGrid?.pageLimitNotice?.border : 'border-slate-700/50'}`}>
                      <p className={`text-center mb-3 ${isHydrated ? themeStyles.pagesGrid?.pageLimitNotice?.text : 'text-sm text-white/80'}`}>
                        You have reached the maximum number of pages for this task which is 10.
                        <br />
                        You can start a new task to generate more pages!
                      </p>
                      <button
                        onClick={() => {
                          const pageMode = getPageMode();
                          let targetUrl = '/alternative';

                          if (pageMode === 'best') {
                            targetUrl = '/best';
                          } else if (pageMode === 'faq') {
                            targetUrl = '/FAQ';
                          } else if (pageMode === 'alternative') {
                            targetUrl = '/alternative';
                          }

                          window.open(targetUrl, '_blank');
                        }}
                        className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-300 flex items-center gap-2 ${isHydrated ? themeStyles.pagesGrid?.pageLimitNotice?.button?.shadow : 'shadow-md hover:shadow-lg'}
                          ${isHydrated ? `${themeStyles.pagesGrid?.pageLimitNotice?.button?.background} ${themeStyles.pagesGrid?.pageLimitNotice?.button?.backgroundHover}` : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'} 
                          ${isHydrated ? themeStyles.pagesGrid?.pageLimitNotice?.button?.text : 'text-white'} 
                          border ${isHydrated ? themeStyles.pagesGrid?.pageLimitNotice?.button?.border : 'border-blue-600/50'}
                          ${isHydrated ? themeStyles.pagesGrid?.pageLimitNotice?.button?.scale : 'hover:scale-105'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Start New Task
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <div className="w-full max-w-xxl mx-auto">
                          {!isEntryPage && (
                            <TaskStatusBar
                              currentStep={currentStep}
                              taskSteps={taskSteps}
                              browserTabs={browserTabs}
                              taskTimeEstimates={taskTimeEstimates}
                              isExpanded={isStatusBarExpanded}
                              setIsExpanded={setIsStatusBarExpanded}
                              themeStyles={themeStyles}
                              isHydrated={isHydrated}
                            />
                          )}
                          <div className="rounded-2xl shadow-lg px-5 py-4 flex flex-col gap-2"
                            style={{
                              borderRadius: isHydrated ? (themeStyles.inputArea?.borderRadius || '16px') : '16px',
                              background: isHydrated ? (themeStyles.inputArea?.background || '#FFF') : 'transparent',
                              boxShadow: isHydrated ? (themeStyles.inputArea?.boxShadow || '0px 4px 16px 0px rgba(255, 255, 255, 0.08)') : '0 2px 16px 0 rgba(30,41,59,0.08)',
                              backdropFilter: 'blur(2px)',
                            }}
                          >
                            <div
                              style={{
                                content: '""',
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '1rem',
                                padding: '1px',
                                background: 'linear-gradient(101deg, rgba(51, 111, 255, 1) 20.01%, rgba(166, 113, 252, 0.3) 56.73%, rgba(245, 137, 79, 0.1) 92.85%)',
                                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'xor',
                                maskComposite: 'exclude',
                                pointerEvents: 'none',
                              }}
                            />
                            {selectedCompetitors.length > 0 && (
                              <div className="mb-3 flex flex-wrap gap-2">
                                {selectedCompetitors.map((competitor) => (
                                  <div
                                    key={competitor.hubPageId}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-lg text-xs text-blue-300 transition-all duration-200 hover:bg-blue-600/30"
                                  >
                                    <div className="flex items-center gap-2">
                                      {competitor.logo && (
                                        <img
                                          src={competitor.logo}
                                          alt={competitor.pageTitle || 'Competitor'}
                                          className="w-4 h-4 rounded-full object-cover"
                                        />
                                      )}
                                      <span className="font-medium">
                                        {competitor.pageTitle || 'Unknown'}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => removeCompetitor(competitor.hubPageId)}
                                      className="ml-1 text-blue-400 hover:text-blue-200 transition-colors"
                                      title="Remove competitor"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <ChatInput
                              userInput={userInput}
                              setUserInput={(value) => {
                                setUserInput(value);
                                if (value === '') {
                                  setSelectedCompetitors([]);
                                }
                              }}
                              onSendMessage={handleUserInput}
                              onStartGeneration={handleStartGenerationFromModal}
                              loading={loading}
                              isMessageSending={isMessageSending}
                              isProcessingTask={isProcessingTask}
                              selectedCompetitors={selectedCompetitors.map(comp => ({
                                hubPageId: comp.hubPageId,
                                websiteId: currentWebsiteId,
                                pageTitle: comp.pageTitle,
                                url: ''
                              }))}
                              currentConversationId={currentConversationId}
                              disabled={false}
                              placeholder={
                                selectedCompetitors.length > 0
                                  ? "Just select cards to start the task"
                                  : !(loading || isMessageSending || isProcessingTask)
                                    ? "Please enter your website domain...."
                                    : "Agent is working, please keep waiting..."
                              }
                              chatType={getPageMode()}
                              onDomainProcessed={(domain, websiteId) => {
                                console.log('🔍 域名已处理:', { domain, websiteId });
                                // 这里可以添加额外的域名处理逻辑
                              }}
                            />
                            
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

          </div>

          {!isMobile && !isEntryPage && (
            <div className={`transition-all duration-300 w-1/2 min-w-[160px] flex flex-col h-full relative overflow-hidden`}
              style={{
                borderRadius: '24px',
                border: isHydrated ? (themeStyles.rightPanel?.container?.border || '1px solid rgba(255, 255, 255, 0.15)') : '1px solid rgba(255, 255, 255, 0.15)',
                background: isHydrated ? (themeStyles.rightPanel?.container?.background || '#0B1421') : '#0B1421',
                boxShadow: '0px 6px 24px 0px rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(30px)'
              }}>
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className={`h-12 p-3 flex-shrink-0 ${isHydrated ? themeStyles.rightPanel?.container?.borderBottom : 'border-b border-gray-300/20'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setRightPanelTab('browser')}
                        className={`text-sm px-3 py-1 transition-colors rounded-[10px] ${rightPanelTab === 'browser'
                            ? 'font-medium'
                            : ''
                          }`}
                        style={{
                          backgroundColor: rightPanelTab === 'browser'
                            ? (isHydrated ? themeStyles.rightPanel?.mainTabs?.active?.background : '#0F1E45')
                            : (isHydrated ? themeStyles.rightPanel?.mainTabs?.inactive?.background : 'transparent'),
                          color: rightPanelTab === 'browser'
                            ? (isHydrated ? themeStyles.rightPanel?.mainTabs?.active?.text : '#357BF7')
                            : (isHydrated ? themeStyles.rightPanel?.mainTabs?.inactive?.text : 'rgba(255, 255, 255, 0.50)'),
                          border: rightPanelTab === 'browser' && isHydrated && themeStyles.rightPanel?.mainTabs?.active?.border !== 'transparent'
                            ? themeStyles.rightPanel?.mainTabs?.active?.border
                            : 'none'
                        }}
                      >
                        Generated Pages
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  {rightPanelTab === 'browser' && (
                    <div className="space-y-2">
                      {browserTabs.length === 0 ? (
                        <div className="flex-1 overflow-y-auto overflow-y-hidden p-3 h-[calc(100vh-400px)]">
                          <div className="flex items-center justify-center h-full">
                            <div className="flex flex-col items-center text-gray-400 text-base">
                              <div className="w-96 h-88 opacity-60 flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg">
                                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              Your generated pages will appear here
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3">
                          <div className="flex items-center space-x-0.5 mb-3 overflow-x-auto px-1.5 border-b border-slate-800/80">
                            {browserTabs.map((tab) => (
                              <div
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={` 
                                    flex items-center justify-between px-2.5 py-1.5 min-w-[100px] max-w-[160px] cursor-pointer transition-all
                                    ${activeTab === tab.id
                                    ? 'bg-slate-800/90 text-slate-200'
                                    : 'bg-slate-900/60 text-slate-500 hover:text-slate-400 hover:bg-slate-800/50'
                                  }
                                    rounded-t-[6px] relative group
                                  `}
                              >
                                <span className="text-[11px] font-medium truncate flex-1 leading-none flex items-center">
                                  {tab.title}
                                </span>
                              </div>
                            ))}
                          </div>

                          {activeTab && (
                            <div>
                              <div className={`flex items-center gap-2 mb-2 rounded-lg px-2 py-1.5`}>
                                <div className="w-full px-3 py-1.5 text-xs rounded-[10px] overflow-hidden overflow-ellipsis whitespace-nowrap text-gray-300"
                                  style={{
                                    border: '1px solid rgba(255, 255, 255, 0.16)',
                                    background: '#0B1421'
                                  }}>
                                  {browserTabs.find(tab => tab.id === activeTab)?.url}
                                </div>
                              </div>
                              <div
                                ref={iframeContainerRef}
                                className="bg-white rounded-lg overflow-hidden relative"
                                style={{ height: 'calc(100vh - 310px)' }}
                              >
                                <iframe
                                  src={browserTabs.find(tab => tab.id === activeTab)?.url}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none'
                                  }}
                                  title="Preview"
                                  sandbox="allow-same-origin allow-scripts"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Modal - 暂时注释掉以避免类型错误 */}
      {/* {errorModal.visible && (
        <Modal
          open={errorModal.visible}
          title={<span>Task Failed <span style={{fontSize: 22}}>⚠️</span></span>}
          onOk={() => {
            setErrorModal({ visible: false, message: '' });
          }}
          okText="OK"
          centered
          closable={false}
          maskClosable={false}
          width={450}
          cancelButtonProps={{ style: { display: 'none' } }}
        >
          <div>
            <div style={{ marginBottom: 16, color: '#f87171', fontWeight: 500 }}>
              {errorModal.message || 'The task encountered an error and could not complete.'}
            </div>
            <div style={{ color: '#64748b', fontSize: 14 }}>
              Please try again later.
            </div>
          </div>
        </Modal>
      )} */}

      {/* Delete Page Confirmation Modal - 暂时注释掉以避免类型错误 */}
      {/* {deletePageConfirm.open && (
        <Modal
          open={deletePageConfirm.open}
          onCancel={() => setDeletePageConfirm({ open: false, resultId: null, generatedPageId: null })}
          title="Delete Page"
          footer={[
            <Button
              key="delete"
              type="primary"
              danger={true}
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>,
            <Button 
              key="cancel" 
              onClick={() => setDeletePageConfirm({ open: false, resultId: null, generatedPageId: null })}
            >
              Cancel
            </Button>
          ]}
        >
          <p>Are you sure you want to delete this page? This action cannot be undone.</p>
        </Modal>
      )} */}

      {/* WebSocket连接组件 - 只在客户端渲染 */}
      {typeof window !== 'undefined' && currentConversationId && (
        <WebSocketConnection 
          conversationId={currentConversationId}
          onMessage={handleWebSocketMessage}
          onError={handleWebSocketError}
          onClose={handleWebSocketClose}
          onOpen={handleWebSocketOpen}
          autoConnect={true}
        />
      )}
    </>
  );
};

export default ResearchTool;