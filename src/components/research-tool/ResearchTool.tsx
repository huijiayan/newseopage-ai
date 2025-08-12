// 这是整个聊天页面的主要功能组件

"use client";
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
import type { WebSocketConnectionRef } from './components/WebSocketConnection';
import { AIMessageStream } from '@/components/ui/AIMessageStream';

// 这是整个聊天页面的主要功能组件
export const ResearchTool: React.FC<ResearchToolProps> = ({
  conversationId = null
}) => {
  // 注入样式
  useEffect(() => {
    injectResearchToolStyles();
  }, []);

  // 添加主题配置
  const { currentTheme, getThemeConfig, isHydrated, switchTheme } = useTheme();

  // 获取research-tool主题配置，提供fallback避免hydration不匹配
  const themeStyles = isHydrated ? getThemeConfig('researchTool') : {
    background: 'linear-gradient(180deg, #121826 0%, #030810 100%)'
  };

  // 添加缺失的状态变量
  const [thinkingLogExpanded, setThinkingLogExpanded] = React.useState<Record<string, boolean>>({});
  const messageApi = useMessage();

  // 仅保留“WebSocket V2 收到原始消息”日志，屏蔽其它控制台输出
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const original = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };
    const allow = (args: unknown[]): boolean => {
      try {
        const first = args[0];
        return typeof first === 'string' && first.includes('WebSocket V2 收到原始消息');
      } catch {
        return false;
      }
    };
    console.log = (...args: any[]) => {
      if (allow(args)) original.log(...args);
    };
    console.info = (...args: any[]) => {
      if (allow(args)) original.info(...args);
    };
    console.warn = (..._args: any[]) => {};
    console.error = (..._args: any[]) => {};
    return () => {
      console.log = original.log;
      console.info = original.info;
      console.warn = original.warn;
      console.error = original.error;
    };
  }, []);

  const [chatHistory, setChatHistory] = React.useState<any>(null);
  const [competitorModalMode, setCompetitorModalMode] = React.useState<'add' | 'edit'>('add');
  const [editingPage, setEditingPage] = React.useState<any>(null);
  const [currentWebsiteId, setCurrentWebsiteId] = React.useState<string>('');
  const [hubPageIds, setHubPageIds] = React.useState<string[]>([]);
  const [currentDomain, setCurrentDomain] = React.useState<string>('');
  const webSocketRef = React.useRef<WebSocketConnectionRef>(null);
  // 最终 Markdown 文本（用于在 Generated Pages 面板中展示）
  const [latestMarkdown, setLatestMarkdown] = useState<string>('');
  // 调试：仅记录与 hubPageId 相关的发送/接收原始数据
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  type DebugLevel = 'send' | 'recv' | 'info' | 'error';
  interface IdDebugEntry { id: string; time: string; level: DebugLevel; hubId?: string; messageType?: string; raw: any }
  const [idDebugLogs, setIdDebugLogs] = useState<IdDebugEntry[]>([]);
  const recentHubIdsRef = useRef<string[]>([]);
  const pushWatchedHubId = useCallback((hubId: string) => {
    if (!hubId) return;
    recentHubIdsRef.current = [hubId, ...recentHubIdsRef.current.filter(id => id !== hubId)].slice(0, 20);
  }, []);
  const logIdDebug = useCallback((level: DebugLevel, raw: any, hubId?: string, messageType?: string) => {
    setIdDebugLogs(prev => [
      { id: `${Date.now()}`, time: new Date().toLocaleString(), level, hubId, messageType, raw },
      ...prev
    ].slice(0, 200));
  }, []);

  // 监听localStorage中的域名变化
  useEffect(() => {
    const checkDomain = () => {
      const domain = localStorage.getItem('currentDomain');
      if (domain && domain !== currentDomain) {
        setCurrentDomain(domain);
      }
    };

    // 初始检查
    checkDomain();

    // 监听storage事件
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentDomain') {
        setCurrentDomain(e.newValue || '');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // 移除currentDomain依赖，避免无限循环

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
  } = useResearchTool(conversationId);

  // WebSocket聊天功能
  // WebSocket连接管理
  const [wsConnected, setWsConnected] = useState(false);
  const [wsConnecting, setWsConnecting] = useState(false);
  const [wsConnectionState, setWsConnectionState] = useState('CLOSED');
  const [wsError, setWsError] = useState<string | null>(null);

  // 顺序队列与去重
  const processedAiTextRef = useRef<Set<string>>(new Set());
  type QueueItem =
    | { kind: 'text'; content: string }
    | { kind: 'hub_entries'; pageType?: string; entries: any[] };
  const aiQueueRef = useRef<QueueItem[]>([]);
  const isProcessingQueueRef = useRef(false);

  const typewriteToChatSequential = useCallback(async (fullText: string) => {
    const messageId = messageHandler.addAgentThinkingMessage();
    const baseDelay = 24;
    return await new Promise<void>((resolve) => {
      let current = '';
      let idx = 0;
      const step = () => {
        if (idx >= fullText.length) {
          messageHandler.updateAgentMessage(current, messageId);
          resolve();
          return;
        }
        current += fullText[idx++];
        messageHandler.updateAgentMessage(current, messageId);
        const ch = current[current.length - 1];
        const extra = ch === '\n' ? baseDelay * 3 : (',.;!?'.includes(ch) ? baseDelay * 2 : 0);
        setTimeout(step, baseDelay + extra);
      };
      step();
    });
  }, [messageHandler]);

  const transformHubEntriesToPages = useCallback((entries: any[]) => {
    return (entries || []).map((e: any) => ({
      hubPageId: e.id || e.hubPageId || '',
      websiteId: e.websiteId || '',
      pageTitle: e.pageTitle || '',
      description: e.description || '',
      relatedKeywords: e.relatedKeywords || [],
      trafficPotential: e.trafficPotential ?? '-',
      difficulty: e.difficulty ?? '-',
      competitors: e.competitors || [],
      isPageGenerated: !!e.isPageGenerated,
      generatedPageId: e.generatedPageId || '',
      pageType: e.pageType || 'alternative',
      source: e.source || 'ai',
      logo: e.logo,
    }));
  }, []);

  const processAIQueue = useCallback(async () => {
    if (isProcessingQueueRef.current) return;
    isProcessingQueueRef.current = true;
    try {
      while (aiQueueRef.current.length > 0) {
        const item = aiQueueRef.current.shift()!;
        if (item.kind === 'text') {
          await typewriteToChatSequential(item.content);
        } else if (item.kind === 'hub_entries') {
          try {
            const pages = transformHubEntriesToPages(item.entries);
            setMessages((prev) => [
              ...prev,
              {
                id: `pages-grid-${Date.now()}`,
                type: 'pages-grid',
                content: '',
                pages,
                pageType: item.pageType || 'alternative',
                timestamp: new Date().toISOString(),
              } as any,
            ]);
          } catch (err) {
            messageHandler.addSystemMessage('⚠️ 候选卡片生成失败，请重试');
          }
        }
      }
    } finally {
      isProcessingQueueRef.current = false;
    }
  }, [setMessages, transformHubEntriesToPages, typewriteToChatSequential]);

  // 便捷函数：将预览链接添加到右侧 Generated Pages 面板
  const addPreviewTab = useCallback((url: string, title?: string) => {
    if (!url) return;
    setBrowserTabs(prev => {
      // 去重
      if (prev.some(t => t.url === url)) return prev;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newTab = { id, title: title || 'Preview', url } as any;
      // 激活新标签
      setActiveTab(id);
      return [...prev, newTab];
    });
  }, [setActiveTab, setBrowserTabs]);

  // 勾选/点击 Edit 时，通过 WebSocket 的 message.type 传递 hubPageId
  const sendSelectedHubId = useCallback((hubId: string) => {
    try {
      if (webSocketRef.current && webSocketRef.current.isConnected) {
        const msg = {
          type: 'message',
          content: hubId,
          timestamp: new Date().toISOString(),
        } as any;
        pushWatchedHubId(hubId);
        logIdDebug('send', msg, hubId, 'message');
        webSocketRef.current.sendMessage(msg);
      }
    } catch {}
  }, []);

  const handleWebSocketMessage = (data: any) => {

    // 兼容字符串消息（某些后端直接发送字符串）
    let payload: any = data;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch { /* ignore */ }
    }
    
    const isToolCall = !!(payload && (payload.event === 'tool_call' || payload.type === 'tool_call'));
    const isToolResult = !!(payload && (payload.event === 'tool_result' || payload.type === 'tool_result'));

    try {
      if (isToolCall) {
        const arr = Array.isArray(payload?.payload?.args?.state?.messages)
          ? payload.payload.args.state.messages
          : [];

        for (const item of arr) {
          if (item?.type === 'user_message') continue; // 跳过用户输入

          // 捕获 markdown 消息
          if (item?.type === 'markdown' || typeof item?.markdown === 'string') {
            const md = typeof item?.markdown === 'string' ? item.markdown : (typeof item?.content === 'string' ? item.content : '');
            if (md) setLatestMarkdown(md);
            continue;
          }

          if (typeof item?.content === 'string' && item.content.trim().length > 0) {
            if (!processedAiTextRef.current.has(item.content)) {
              processedAiTextRef.current.add(item.content);
              aiQueueRef.current.push({ kind: 'text', content: item.content });
            }
            continue;
          }

          // 按需忽略 website 详情对象

          if (Array.isArray(item?.hub_entries)) {
            const entries = item.hub_entries;
            const count = entries.length;
            // 在卡片前插入一条提示气泡
            aiQueueRef.current.push({ kind: 'text', content: `${count} candidate pages have been found. Please check the boxes in the cards below and click "Generate".` });
            aiQueueRef.current.push({ kind: 'hub_entries', pageType: item.page_type, entries });
            continue;
          }
        }
      }

      if (isToolResult) {
        // 解析 tool_result 的 hub_entries（常见在 payload.output.hub_entries）
        const output = payload?.payload?.output || payload?.output || {};
        const hubEntries = Array.isArray(output?.hub_entries) ? output.hub_entries : [];
        const pageType = output?.page_type || output?.pageType;
        // 捕获 markdown 文本
        const possibleMarkdown = output?.markdown || output?.final_markdown || payload?.payload?.markdown || payload?.markdown;
        if (typeof possibleMarkdown === 'string' && possibleMarkdown.trim().length > 0) {
          setLatestMarkdown(possibleMarkdown);
        }
        if (hubEntries.length > 0) {
          const count = hubEntries.length;
          // 在卡片前插入一条提示气泡
          aiQueueRef.current.push({ kind: 'text', content: `Found ${count} candidate pages. Please check the boxes in the cards below and click Generate.` });
          aiQueueRef.current.push({ kind: 'hub_entries', pageType, entries: hubEntries });
        }

        // 如果返回了生成完成的页面ID，自动打开右侧预览标签
        const generatedId = output?.generated_page_id || output?.generatedPageId || output?.result_id || output?.resultId;
        if (typeof generatedId === 'string' && generatedId.trim().length > 0) {
          const previewUrl = `https://preview.websitelm.site/en/${generatedId}`;
          addPreviewTab(previewUrl, `Preview ${generatedId.slice(0, 6)}`);
          // 命中最近的 hubIds 则记录调试
          const matchedHub = recentHubIdsRef.current.find(id => typeof id === 'string' && id.length > 0);
          logIdDebug('recv', payload, matchedHub, 'tool_result');
        }
      }
    } catch (e) {}

    // 顺序处理队列
    processAIQueue();
    
    // 处理其他类型的消息
    if (payload.type) {
      // 根据消息类型添加到相应的消息列表
      switch (payload.type) {
        case 'markdown': {
          const md = typeof payload.content === 'string' ? payload.content : (typeof payload.markdown === 'string' ? payload.markdown : '');
          if (md) setLatestMarkdown(md);
          break;
        }
        case 'message':
        case 'agent':
          messageHandler.addSystemMessage(payload.content);
          break;
        case 'error':
          messageHandler.addSystemMessage(`❌ 错误: ${payload.content}`);
          break;
        case 'system':
          messageHandler.addSystemMessage(payload.content);
          break;
        case 'warning':
          messageHandler.addSystemMessage(payload.content);
        default:
          // 对于未知类型的消息，作为系统消息处理
          if (typeof payload?.markdown === 'string') {
            setLatestMarkdown(payload.markdown);
          } else if (typeof payload?.content === 'string') {
            messageHandler.addSystemMessage(payload.content);
          }
          // 解析可能包含的生成页面ID
          const genId = payload?.generated_page_id || payload?.generatedPageId || payload?.result_id || payload?.resultId;
          if (typeof genId === 'string' && genId.trim().length > 0) {
            const previewUrl = `https://preview.websitelm.site/en/${genId}`;
            addPreviewTab(previewUrl, `Preview ${genId.slice(0, 6)}`);
            const matchedHub = recentHubIdsRef.current.find(id => typeof id === 'string' && id.length > 0);
            logIdDebug('recv', payload, matchedHub, 'default');
          }
          break;
      }
    } else {
      // 兜底：无 type 的纯文本或未知结构，按文本渲染
      const textCandidate =
        (typeof payload === 'string' && payload) ||
        (typeof payload?.content === 'string' && payload.content) ||
        (typeof payload?.markdown === 'string' && payload.markdown) ||
        '';
      if (textCandidate && textCandidate.trim().length > 0) {
        aiQueueRef.current.push({ kind: 'text', content: textCandidate });
        processAIQueue();
      }
    }
  };

  const handleWebSocketError = (error: any) => {
    const errorMessage = error?.message || '未知错误';
    setWsError(errorMessage);
  };

  const handleWebSocketClose = (event: CloseEvent) => {
    setWsConnected(false);
    setWsConnectionState('CLOSED');
    
    if (event.code !== 1000) {
    }
  };

  const handleWebSocketOpen = () => {
    setWsConnected(true);
    setWsConnectionState('OPEN');
    setWsError(null);
  };

  // 自动检测URL参数并建立WebSocket连接
  useEffect(() => {
    try {
      // 1. 自动检测：URL中的conversationId参数
      const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      const urlConversationId = urlParams.get('conversationId');
      
      // 2. 自动设置：恢复模式和对话ID
      let targetConversationId = conversationId || urlConversationId;
      let shouldRecover = false;
      
      if (targetConversationId) {

        
        // 设置conversationId - 避免无限循环
        if (targetConversationId !== currentConversationId) {
          setCurrentConversationId(targetConversationId);
        }
      }
    } catch (error: any) {
    }
  }, [conversationId]); // 移除currentConversationId依赖，避免无限循环

  // 当conversationId变化时，自动获取聊天历史并建立WebSocket连接
  useEffect(() => {
    try {
      if (currentConversationId) {
        // 4. 自动连接：建立WebSocket连接
        if (!wsConnected && wsConnectionState === 'CLOSED') {
          // 这里会触发WebSocket连接建立
          // WebSocket连接会在组件渲染时自动建立
        }
      }
    } catch (error: any) {
    }
  }, [currentConversationId]); // 简化依赖，避免循环

  // 加载聊天历史记录并恢复渲染进度
  const loadChatHistory = async (conversationId: string) => {
    try {


      const resp = await apiClient.getAlternativeChatHistory(conversationId as any);
      const records = Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp)
          ? resp
          : Array.isArray(resp?.records)
            ? resp.records
            : [];

      if (!Array.isArray(records) || records.length === 0) {
        return;
      }

      // 依次回放历史事件，使用现有的消息处理逻辑以保证渲染一致
      let lastTs: string | number | null = null;
      for (const rec of records) {
        try {
          handleWebSocketMessage(rec);
          const ts =
            (typeof rec?.timestamp === 'string' && rec.timestamp) ||
            (typeof rec?.ts === 'number' && rec.ts) ||
            (typeof rec?.payload?.timestamp === 'string' && rec.payload.timestamp) ||
            null;
          if (ts) lastTs = ts;
        } catch (e) {}
      }

      // 记录最后一条事件时间戳用于断点续传
      try {
        const key = `ws_resume_ts_${conversationId}`;
        if (lastTs) {
          localStorage.setItem(key, String(lastTs));
        }
      } catch {}
      
    } catch (error) {
    }
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
    } catch (error) { return url.toLowerCase(); }
  };

  // 添加缺失的方法
  const handleStartGenerationFromModal = async (data: any) => {
    try {
      setIsMessageSending(true);
      setIsSubmitting(true);
      // 优先走 WebSocket 实时流程（勾选时已发送固定ID触发生成）
      if (webSocketRef.current && webSocketRef.current.isConnected) {
        setCurrentStep(3);
        startedTaskCountRef.current += (data?.hubPageIds?.length || 0);
        messageHandler.addSystemMessage('System is analyzing competitors and generating pages, please wait...');
        retryCountRef.current = 0;
        setHubPageIds([]);
        setSelectedCompetitors([]);
        setUserInput('');
        setIsProcessingTask(true);
        return;
      }

      // 兜底：若当前无 WebSocket 连接，则使用 REST API 触发生成，并确保 websiteId 存在
      let ensureConversationId = data?.conversationId || currentConversationId;
      let ensureWebsiteId = data?.websiteId || currentWebsiteId;

      try {
        if (!ensureWebsiteId) {
          const genIdResp = await apiClient.generateWebsiteId();
          if (genIdResp?.code === 200) {
            ensureWebsiteId = genIdResp?.data?.websiteId || ensureWebsiteId;
            if (ensureWebsiteId) setCurrentWebsiteId(ensureWebsiteId);
          }
        }
      } catch {}

      const generateResponse = await apiClient.generateAlternative(
        ensureConversationId,
        data?.hubPageIds || hubPageIds,
        ensureWebsiteId
      );

      if (
        generateResponse?.code === 200 ||
        generateResponse?.success === true ||
        generateResponse?.status === 'success'
      ) {
        setCurrentStep(3);
        startedTaskCountRef.current += (data?.hubPageIds?.length || hubPageIds.length);
        messageHandler.addSystemMessage('System is analyzing competitors and generating pages, please wait...');
        retryCountRef.current = 0;
        setHubPageIds([]);
        setSelectedCompetitors([]);
        setUserInput('');
        setIsProcessingTask(true);
      } else {
        const detail = typeof generateResponse === 'object' ? JSON.stringify(generateResponse) : String(generateResponse);
        messageHandler.addSystemMessage(`⚠️ Failed to generate alternative pages: Invalid server response\n${detail}`);
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
      
      // 只有当域名真正变化时才更新状态
      if (processedDomain !== currentDomain) {
        setCurrentDomain(processedDomain);
      }

      // 根据图片规则：用户发送第一条消息创建聊天室
      let tempConversationId = currentConversationId;

      if (!tempConversationId) {
        setLoading(true);
        // 用户发送第一条消息，API自动创建聊天室并返回WebSocket连接
        const chatResponse = await apiClient.chatWithAI(getPageMode(), formattedInput, null);

        // 检查响应格式 - 可能返回WebSocket对象或包含conversationId的对象
        if (chatResponse && 'websocket' in chatResponse) {
  
          
          // 检查API响应中是否包含conversationId
          if (chatResponse.conversationId) {
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

            // 等待WebSocket消息中的conversationId
            const websocket = chatResponse.websocket;
            websocket.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
        
                
                if (data.conversationId) {
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
              } catch (error) {}
            };
          }
        } else {
          messageHandler.updateAgentMessage('Failed to create a new chat. Please try again.', thinkingMessageId);
          setIsMessageSending(false);
          setLoading(false);
          return;
        }
      }

      // 通过WebSocket发送业务请求
      try {
        // 检查WebSocket连接状态
        if (webSocketRef.current && webSocketRef.current.isConnected) {
          // 通过WebSocket发送消息
          const message = {
            type: 'user_message',
            content: formattedInput,
            domain: currentDomain,
            conversationId: currentConversationId,
            timestamp: new Date().toISOString()
          };
          
          // 通过WebSocket发送消息
          const success = webSocketRef.current.sendMessage(message);
          if (success) {
          } else {
          }
        } else {
        }
      } catch (error) {
        
      }
    } catch (error) {
      // 静默处理错误
      messageHandler.updateAgentMessage('An error occurred while processing your request. Please try again.', thinkingMessageId);
    } finally {
      setIsMessageSending(false);
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // 对应老代码第1255-2155行的renderChatMessage函数
  const renderChatMessage = (message: any, index: number) => {
    // 处理域名信息消息
    if (message.type === 'domain_info') {
      return (
        <div
          key={message.id || `domain-info-${index}`}
          className="flex justify-start mb-4"
          style={{ animation: 'fadeIn 0.5s ease-out forwards' }}
        >
          <div className="w-full flex flex-col items-start">
            <div className="relative w-full">
              <div
                className={`px-4 py-3 w-full hover:shadow-slate-500/20 transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl ${isHydrated ? themeStyles.systemMessage?.background : 'bg-blue-500/10'} ${isHydrated ? themeStyles.systemMessage?.border : 'border-blue-500/20'} border`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-500 text-lg">🌐</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`${isHydrated ? themeStyles.systemMessage?.text : 'text-blue-100'} font-medium text-sm mb-1`}>
                      域名信息
                    </div>
                    <div className={`${isHydrated ? themeStyles.systemMessage?.text : 'text-blue-200'} text-sm`}>
                      {message.content}
                    </div>
                    {message.domain && (
                      <div className="mt-2 text-xs text-blue-300/70">
                        域名: {message.domain}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 ml-11">
                  {new Date(message.timestamp || Date.now()).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

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
                {(typeof message.content === 'string' ? message.content : '').split('\n').map((line: string, i: number) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < (typeof message.content === 'string' ? message.content : '').split('\n').length - 1 && <br />}
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
                    {(typeof message.content === 'string' ? message.content : '').split('\n').map((line: string, i: number) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < (typeof message.content === 'string' ? message.content : '').split('\n').length - 1 && <br />}
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
                  {filterMessageTags(typeof message.content === 'string' ? message.content : '').split('\n').map((line: string, i: number) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < (typeof message.content === 'string' ? message.content : '').split('\n').length - 1 && <br />}
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
                            onChange={() => {
                              // 先更新本地选择状态，再发送 ID（与 UI 操作严格绑定）
                              handleCompetitorSelect(page);
                              setTimeout(() => sendSelectedHubId(page.hubPageId), 0);
                            }}
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
                        {/* Edit button - only show for non-generated pages; 点击时通过 WebSocket 发送 hubPageId */}
                        {!page.isPageGenerated && (
                          <button
                            className="text-xs font-medium px-3 py-1 transition-all duration-200 hover:opacity-80 flex items-center gap-1"
                            style={{
                              borderRadius: isHydrated ? themeStyles.pagesGrid?.viewButton?.borderRadius : '12px',
                              background: isHydrated ? themeStyles.pagesGrid?.viewButton?.background : 'linear-gradient(115deg, #AA450B -2.53%, #231109 26.44%, #10132D 48.59%, #101834 68.22%, #0D47A6 96.36%)',
                              boxShadow: isHydrated ? themeStyles.pagesGrid?.viewButton?.boxShadow : '0px 2px 5px 0px rgba(255, 255, 255, 0.10)',
                              color: isHydrated ? themeStyles.pagesGrid?.viewButton?.text : 'var(--Color-, #FFF)'
                            }}
                            onClick={() => {
                              // 点击 Edit 也仅在用户此操作时发送
                              sendSelectedHubId(page.hubPageId);
                            }}
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
                              const idForPreview = page.hubPageId || page.generatedPageId || page.id;
                              const previewUrl = `https://preview.websitelm.site/en/${idForPreview}`;
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
    const rawContent = typeof message.content === 'string' ? message.content : '';
    const filteredContent = linkifyDomains(
      filterMessageTags(rawContent).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    );
      const elements = [];

      // 1. Agent消息本身
      elements.push(
      <div key={index} className="flex flex-col justify-start mb-6" style={{ animation: 'fadeIn 0.5s ease-out forwards' }}>
        <div className="flex max-w-[80%] flex-row group">
          <div className="flex-shrink-0" style={{ animation: 'bounceIn 0.6s ease-out forwards' }}>
          </div>
          <div className="relative w-full">
            <div
              className={`px-4 py-3 w-full rounded-xl border ${
                isHydrated ? themeStyles.systemMessage?.background : 'bg-slate-800/60'
              } ${isHydrated ? themeStyles.systemMessage?.border : 'border-slate-600/40'}`}
              style={{ maxWidth: '800px' }}
            >
            <div className={`text-sm ${isHydrated ? themeStyles.agentMessage?.text : 'text-white'}`} style={{ wordWrap: 'break-word' }}>
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
                        {(messageCollapsed[index] ?? true) && filteredContent && filteredContent.split('\n').length > 6 && (
                          <div className={`absolute bottom-0 left-0 right-0 h-16 pointer-events-none ${isHydrated ? `${themeStyles.messageCollapse?.gradientOverlay} ${themeStyles.messageCollapse?.borderRadius}` : 'bg-gradient-to-b from-transparent to-slate-800/90 rounded-lg'
                            }`} />
                        )}
                      </div>
                    </div>
                    {filteredContent && filteredContent.split('\n').length > 3 && (
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

            {/* 调试面板开关 */}
            {!isEntryPage && (
              <div className="absolute right-2 top-2 z-20 flex items-center gap-2">
                <button
                  onClick={() => setIsDebugOpen(v => !v)}
                  className="px-2 py-1 text-xs rounded-md"
                  style={{
                    background: '#334155',
                    color: '#E2E8F0',
                    border: '1px solid rgba(255,255,255,0.16)'
                  }}
                >
                  {isDebugOpen ? '关闭调试' : '打开调试'}
                </button>
              </div>
            )}

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
              {/* 调试面板 */}
              {isDebugOpen && !isEntryPage && (
                <div className="mb-3">
                  <div
                    className="rounded-lg p-3 text-xs"
                    style={{
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      background: '#0B1421',
                      color: '#D1D5DB',
                      maxHeight: '240px',
                      overflowY: 'auto'
                    }}
                  >
                    <div className="mb-2 font-medium" style={{color:'#93C5FD'}}>ID 调试（最近 200 条，仅勾选/生成相关）</div>
                    {idDebugLogs.length === 0 && (
                      <div style={{color:'#94A3B8'}}>暂无调试信息</div>
                    )}
                    {idDebugLogs.map((log) => (
                      <div key={log.id} className="mb-2">
                        <div className="flex items-center gap-2">
                          <span style={{color: log.level === 'send' ? '#34D399' : log.level === 'recv' ? '#60A5FA' : log.level === 'error' ? '#F87171' : '#E5E7EB'}}>
                            [{log.level.toUpperCase()}]
                          </span>
                          <span style={{color:'#94A3B8'}}>{log.time}</span>
                          {log.hubId && (
                            <span className="px-1.5 py-0.5 rounded" style={{background:'#1E293B', color:'#93C5FD'}}>
                              hubId: {log.hubId}
                            </span>
                          )}
                          {log.messageType && (
                            <span className="px-1.5 py-0.5 rounded" style={{background:'#1F2937', color:'#E5E7EB'}}>
                              type: {log.messageType}
                            </span>
                          )}
                        </div>
                        <pre className="whitespace-pre-wrap break-words" style={{color:'#CBD5E1'}}>
{typeof log.raw === 'string' ? log.raw : JSON.stringify(log.raw, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showSlogan && messages.length === 0 && (
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
                      {typeof latestMarkdown === 'string' && latestMarkdown.trim().length > 0 && (
                        <div className="px-3 pt-3">
                          <div
                            className="rounded-lg p-3 text-xs whitespace-pre-wrap break-words"
                            style={{
                              border: '1px solid rgba(255, 255, 255, 0.16)',
                              background: '#0B1421',
                              color: '#D1D5DB',
                              maxHeight: '180px',
                              overflowY: 'auto'
                            }}
                          >
                            {latestMarkdown}
                          </div>
                        </div>
                      )}
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
          ref={webSocketRef}
          conversationId={currentConversationId}
          domain={currentDomain || undefined}
          onMessage={handleWebSocketMessage}
          onError={handleWebSocketError}
          onClose={handleWebSocketClose}
          onOpen={handleWebSocketOpen}
          autoConnect={true}
          onSendMessage={undefined}
          onThemeSwitch={switchTheme}
        />
      )}
    </>
  );
};

export default ResearchTool;