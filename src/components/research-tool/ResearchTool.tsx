// 这是整个聊天页面的主要功能组件

"use client";
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMessage } from '@/components/ui/CustomMessage';
import ChatInput from '@/components/ui/ChatInput';
import { InfoCircleOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import type { ResearchToolProps } from '@/types/research-tool';
import { useResearchTool } from './hooks/useResearchTool';
import { useTheme } from './hooks/useTheme';
import { TaskStatusBar } from './components/TaskStatusBar';
import { AgentProcessingPanel } from './components/AgentProcessingPanel';
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
  
  // 获取URL参数
  const searchParams = useSearchParams();

  // 获取research-tool主题配置，提供fallback避免hydration不匹配
  const themeStyles = isHydrated ? getThemeConfig('researchTool') : {
    background: 'linear-gradient(180deg, #121826 0%, #030810 100%)',
    pagesGrid: {
      pageCard: {
        background: 'bg-white',
        border: 'border border-gray-300',
        borderSelected: 'border border-blue-600'
      },
      pageTitle: {
        text: 'text-black'
      },
      tdkLabel: {
        text: 'text-gray-700'
      },
      pageDescription: {
        text: 'text-gray-600'
      },
      keywordTag: {
        background: 'bg-gray-200',
        text: 'text-black'
      },
      metrics: {
        label: 'text-gray-600',
        value: 'text-black'
      },
      viewButton: {
        background: 'bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500'
      }
    }
  };

  // 添加缺失的状态变量
  const [thinkingLogExpanded, setThinkingLogExpanded] = React.useState<Record<string, boolean>>({});
  const messageApi = useMessage();

  // 仅保留"WebSocket V2 收到原始消息"日志，屏蔽其它控制台输出
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
    console.warn = (..._args: any[]) => { };
    console.error = (..._args: any[]) => { };
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
  // Agent Processing steps status
  const AGENT_STEPS = [
    { key: 'competitor_retriever', label: 'competitor_retriever' },
    { key: 'competitor_validator', label: 'competitor_validator' },
    { key: 'generate_sitemap_planning', label: 'generate_sitemap_planning' },
  ] as const;
  // 多 Agent 面板：每个 agent 一个卡片，卡片下保留所有工具项及状态
  type StepStatus = 'pending' | 'processing' | 'success';
  interface AgentPanelState {
    agentName: string;
    steps: Array<{ key: string; label?: string }>;
    statusMap: Record<string, StepStatus>;
    queue: string[]; // 未展示的后续工具，按顺序出现
  }
  const [agentPanels, setAgentPanels] = useState<AgentPanelState[]>([]);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  // 独立展开/收起状态：每个 agent 一份
  const [agentPanelExpandedMap, setAgentPanelExpandedMap] = useState<Record<string, boolean>>({});
  // 记录各工具最近一次结果，用于 View 展示：按 agentName 归档
  const [lastToolResults, setLastToolResults] = useState<Record<string, Record<string, any>>>({});
  // 右侧覆盖层（仅改变文字展示，不改区域结构）
  const [rightOverlay, setRightOverlay] = useState<{ visible: boolean; title?: string; content?: any }>({ visible: false });


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
      const domain = localStorage.getItem('pendingDomainInput');
      if (domain && domain !== currentDomain) {
        setCurrentDomain(domain);
      }
    };

    // 初始检查
    checkDomain();

    // 监听storage事件
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pendingDomainInput') {
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



  // 记录已提交生成的 hubPageId，用于在 UI 中彻底移除这些卡片
  const [submittedHubIds, setSubmittedHubIds] = useState<Set<string>>(new Set());
  // 是否将剩余卡片隐藏（不占位），提供底部按钮控制显示/隐藏
  const [hideRemainingCards, setHideRemainingCards] = useState<boolean>(false);

  // 开始生成：清空输入与已选卡片，并隐藏其余卡片；把已选的 hubPageId 标记为已提交
  const handleStartGeneration = useCallback((params: { hubPageIds: string[]; conversationId: string | null; websiteId: string; }) => {
    try {
      if (Array.isArray(params.hubPageIds) && params.hubPageIds.length > 0) {
        setSubmittedHubIds(prev => {
          const next = new Set(prev);
          params.hubPageIds.forEach(id => next.add(id));
          return next;
        });
      }
    } finally {
      // 清空输入与已选项，并默认折叠剩余卡片
      setSelectedCompetitors([]);
      setUserInput('');
      setHideRemainingCards(true);
    }
  }, [setSelectedCompetitors, setUserInput]);

  // WebSocket聊天功能
  // WebSocket连接管理
  const [wsConnected, setWsConnected] = useState(false);
  const [wsConnecting, setWsConnecting] = useState(false);
  const [wsConnectionState, setWsConnectionState] = useState('CLOSED');
  const [wsError, setWsError] = useState<string | null>(null);

  // 监听conversationId变化，跳转成功后自动发送域名
  useEffect(() => {
    // 只有当conversationId存在且WebSocket连接成功时才自动发送
    if (conversationId && wsConnected && currentDomain) {
      // 延迟发送，确保页面完全加载
      const timer = setTimeout(() => {
        // 检查是否已经有消息，避免重复发送
        if (messages.length === 0) {
          // 自动发送域名
          const message = {
            type: 'user_message',
            content: currentDomain,
            domain: currentDomain,
            conversationId: conversationId,
            timestamp: new Date().toISOString()
          };

          // 通过WebSocket发送消息
          if (webSocketRef.current && webSocketRef.current.isConnected) {
            webSocketRef.current.sendMessage(message);
            
            // 添加用户消息到UI
            messageHandler.addUserMessage(currentDomain);
            
            // 添加AI思考消息
            messageHandler.addAgentThinkingMessage();
            
            // 发送完成后，删除localStorage中的域名，避免影响下一次输入
            localStorage.removeItem('pendingDomainInput');
            localStorage.removeItem('currentProductUrl');
            
            console.log('✅ 域名已自动发送并清理localStorage:', currentDomain);
          }
        }
      }, 1000); // 延迟1秒发送

      return () => clearTimeout(timer);
    }
  }, [conversationId, wsConnected, currentDomain, messages.length, messageHandler]);

  // 额外的检查：确保在页面加载完成后能正确触发自动发送
  useEffect(() => {
    // 当页面完全加载后，检查是否需要自动发送域名
    if (conversationId && currentDomain && !wsConnected) {
      // 如果WebSocket还没有连接，等待连接成功
      const checkConnection = () => {
        if (wsConnected && webSocketRef.current?.isConnected) {
          // 延迟发送，确保页面完全加载
          setTimeout(() => {
            if (messages.length === 0) {
              // 自动发送域名
              const message = {
                type: 'user_message',
                content: currentDomain,
                domain: currentDomain,
                conversationId: conversationId,
                timestamp: new Date().toISOString()
              };

              if (webSocketRef.current?.isConnected) {
                webSocketRef.current.sendMessage(message);
                messageHandler.addUserMessage(currentDomain);
                messageHandler.addAgentThinkingMessage();
                
                // 发送完成后，删除localStorage中的域名
                localStorage.removeItem('pendingDomainInput');
                localStorage.removeItem('currentProductUrl');
                
                console.log('✅ 页面加载完成后，域名已自动发送并清理localStorage:', currentDomain);
              }
            }
          }, 1500); // 延迟1.5秒发送
        }
      };

      // 监听WebSocket连接状态变化
      const interval = setInterval(checkConnection, 500);
      
      return () => clearInterval(interval);
    }
  }, [conversationId, currentDomain, wsConnected, messages.length, messageHandler]);

  // 顺序队列与去重
  const processedAiTextRef = useRef<Set<string>>(new Set());
  // 删除队列相关代码，改为直接渲染
  // type QueueItem =
  //   | { kind: 'text'; content: string }
  //   | { kind: 'hub_entries'; pageType?: string; entries: any[] }
  //   | { kind: 'html_chunk'; resultId: string; title?: string; chunk: string; replace?: boolean };
  // const aiQueueRef = useRef<QueueItem[]>([]);
  // const isProcessingQueueRef = useRef(false);

  const agentPanelInsertedRef = useRef<boolean>(false);
  const processedHubEntriesRef = useRef<Set<string>>(new Set());

  // 流式HTML处理相关状态
  const streamingHtmlRef = useRef<Map<string, { content: string; title: string; startTime: number }>>(new Map());
  const [activeStreamingTab, setActiveStreamingTab] = useState<string | null>(null);

  // 消息去重相关状态
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  const processedMessageContentRef = useRef<Set<string>>(new Set());

  const typewriteToChatSequential = useCallback(async (fullText: string) => {
    // 内容去重检查，防止相同内容重复显示
    if (processedMessageContentRef.current.has(fullText.trim())) {
      console.log('🔍 内容已存在，跳过重复显示:', fullText.substring(0, 50) + '...');
      return;
    }
    
    // 记录内容为已处理
    processedMessageContentRef.current.add(fullText.trim());
    
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

  // 将一段 HTML 文本以 data:URL 的形式加入右侧 Generated Pages 预览标签
  const addPreviewHtml = useCallback((html: string, title?: string) => {
    try {
      if (typeof html !== 'string' || html.trim().length === 0) return;
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
      addPreviewTab(dataUrl, title || 'HTML Preview');
    } catch { }
  }, [addPreviewTab]);

    // 处理流式HTML消息的函数
  const handleStreamingHtmlMessage = useCallback((message: any) => {
    const { type, tool_name, agent_name, result, seq, metadata } = message;
 
    // 只处理 write_html_codes_tool 的消息
    if (tool_name !== 'write_html_codes_tool') return;
 
    // 生成唯一的流式ID
    const streamId = `${agent_name}_${tool_name}_${metadata?.run_id || Date.now()}`;
 
    if (type === 'message_start') {
      // 开始流式输出，初始化HTML内容
      const title = `Generated HTML Page - ${new Date().toLocaleTimeString()}`;
      streamingHtmlRef.current.set(streamId, {
        content: '',
        title,
        startTime: Date.now()
      });
      
      // 创建流式预览标签
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent('')}`;
      addPreviewTab(dataUrl, title);
      setActiveStreamingTab(streamId);
 
    } else if (type === 'message_chunk') {
      // 接收HTML片段，拼接到现有内容并实时更新预览
      const current = streamingHtmlRef.current.get(streamId);
      if (current && typeof result === 'string') {
        current.content += result;
        
        // 实时更新预览内容
        if (activeStreamingTab === streamId) {
          const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(current.content)}`;
          // 更新现有标签的URL
          setBrowserTabs(prev => 
            prev.map(tab => 
              tab.title === current.title 
                ? { ...tab, url: dataUrl }
                : tab
            )
          );
        }
      }
 
    } else if (type === 'message_end') {
      // 流式输出结束，立即渲染完整HTML到右侧预览
      const current = streamingHtmlRef.current.get(streamId);
      if (current && current.content.trim().length > 0) {
        // 立即将完整HTML添加到右侧预览并激活标签
        activateHtmlPreview(current.content, current.title);
        
        // 清理流式内容
        streamingHtmlRef.current.delete(streamId);
        setActiveStreamingTab(null);
      }
    }
  }, [addPreviewTab, setBrowserTabs, activeStreamingTab]);

  // 确保HTML生成完成后立即激活预览标签
  const activateHtmlPreview = useCallback((htmlContent: string, title: string) => {
    // 添加到预览
    addPreviewHtml(htmlContent, title);
    
    // 找到刚添加的标签并激活它
    setBrowserTabs(prev => {
      const newTabs = [...prev];
      const newTab = newTabs[newTabs.length - 1];
      if (newTab && newTab.title === title) {
        setActiveTab(newTab.id);
      }
      return newTabs;
    });
  }, [addPreviewHtml, setBrowserTabs, setActiveTab]);

  // 消息去重检查函数
  const isMessageProcessed = useCallback((message: any): boolean => {
    // 生成消息的唯一标识
    const messageId = message?.id || 
                     message?.seq?.toString() || 
                     `${message?.type}_${message?.timestamp}_${message?.tool_name}_${message?.agent_name}` ||
                     `${Date.now()}_${Math.random()}`;
    
    // 检查消息ID是否已处理
    if (processedMessageIdsRef.current.has(messageId)) {
      return true; // 已处理
    }
    
    // 检查消息内容是否重复（对于文本消息）
    if (message?.result || message?.content) {
      const content = (message.result || message.content || '').toString().trim();
      if (content && processedMessageContentRef.current.has(content)) {
        return true; // 内容重复
      }
    }
    
    return false; // 未处理
  }, []);

  // 标记消息为已处理
  const markMessageAsProcessed = useCallback((message: any): void => {
    // 生成消息的唯一标识
    const messageId = message?.id || 
                     message?.seq?.toString() || 
                     `${message?.type}_${message?.timestamp}_${message?.tool_name}_${message?.agent_name}` ||
                     `${Date.now()}_${Math.random()}`;
    
    // 记录消息ID
    processedMessageIdsRef.current.add(messageId);
    
    // 记录消息内容（对于文本消息）
    if (message?.result || message?.content) {
      const content = (message.result || message.content || '').toString().trim();
      if (content) {
        processedMessageContentRef.current.add(content);
      }
    }
  }, []);



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
    } catch { }
  }, []);

  const handleWebSocketMessage = (data: any) => {
    // 抑制某些系统提示的辅助函数
    const shouldSuppressMessage = (text: string | undefined | null): boolean => {
      if (typeof text !== 'string') return false;
      const suppressedPhrases = [
        'System is analyzing competitors and generating pages',
      ];
      const lower = text.toLowerCase();
      return suppressedPhrases.some(p => lower.includes(p.toLowerCase()));
    };

    // 兼容字符串消息（某些后端直接发送字符串）
    let payload: any = data;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch { /* ignore */ }
    }

    // 处理流式HTML消息
    handleStreamingHtmlMessage(payload);

    const isToolCall = !!(payload && (payload.event === 'tool_call' || payload.type === 'tool_call'));
    const isToolResult = !!(payload && (payload.event === 'tool_result' || payload.type === 'tool_result'));
    const isChatStart = !!(payload && (payload.event === 'chat_start' || payload.type === 'chat_start'));
    const isChatEnd = !!(payload && (payload.event === 'chat_end' || payload.type === 'chat_end'));
    const isHandoffStart = !!(payload && (payload.event === 'handoff_start' || payload.type === 'handoff_start'));
    const isHandoffEnd = !!(payload && (payload.event === 'handoff_end' || payload.type === 'handoff_end'));
    const isInterrupt = !!(payload && payload.type === 'interrupt');


    // 将后续的处理逻辑封装为函数
    const processOne = (one: any) => {
      // 消息去重检查
      if (isMessageProcessed(one)) {
        return; // 如果消息已处理，直接返回
      }
      
      const isToolCallOne = !!(one && (one.event === 'tool_call' || one.type === 'tool_call'));
      const isToolResultOne = !!(one && (one.event === 'tool_result' || one.type === 'tool_result'));
      const isChatStartOne = !!(one && (one.event === 'chat_start' || one.type === 'chat_start'));
      const isChatEndOne = !!(one && (one.event === 'chat_end' || one.type === 'chat_end'));
      const isHandoffStartOne = !!(one && (one.event === 'handoff_start' || one.type === 'handoff_start'));
      const isHandoffEndOne = !!(one && (one.event === 'handoff_end' || one.type === 'handoff_end'));


      try {
        // 一旦收到 chat_start，立即显示处理面板（区域样式不变，仅开启渲染）
        if (isChatStartOne) {
          setShowAgentPanel(true);
        }

        if (isToolCallOne) {
          // 根据后端最新数据结构：读取 agent_name 与 tool_name，并更新面板文案
          const agentName = (one?.agent_name || one?.content?.agent_name || one?.payload?.agent_name || '').toString().trim();
          const toolName = (one?.tool_name || one?.content?.tool || one?.tool || '').toString().trim();
          // 第一次遇到任何 tool_call 前，在队列中插入一次 AgentProcessingPanel 的占位指令
          if (!agentPanelInsertedRef.current) {
            agentPanelInsertedRef.current = true;
            setMessages(prev => [
              ...prev,
              { id: `agent-panel-${Date.now()}`, type: 'agent-panel', content: '', timestamp: new Date().toISOString() } as any
            ]);
            // 同时初始化一个默认的 agent panel，确保渲染条件满足
            setShowAgentPanel(true);
            setAgentPanels(prev => {
              if (prev.length === 0) {
                return [{ agentName: 'Initializing...', steps: [], statusMap: {}, queue: [] }];
              }
              return prev;
            });
          }
          if (agentName) {
            setShowAgentPanel(true);
            setAgentPanels(prev => {
              const next = [...prev];
              let idx = next.findIndex(p => p.agentName === agentName);
              if (idx === -1) {
                next.push({ agentName, steps: [], statusMap: {}, queue: [] });
                idx = next.length - 1;
              }
              if (toolName) {
                const panel = { ...next[idx] };
                const alreadyVisible = panel.steps.some(s => s.key === toolName);
                if (!alreadyVisible) {
                  panel.steps = [...panel.steps, { key: toolName, label: toolName }];
                }
                panel.statusMap = { ...panel.statusMap, [toolName]: 'processing' };
                next[idx] = panel;
              }
              return next;
            });
          }
          // 支持两种结构：state.content 与 state.messages
          const state = one?.payload?.args?.state || {};
          const arrContent = Array.isArray(state?.content) ? state.content : [];
          const arrMessages = Array.isArray(state?.messages) ? state.messages : [];
          const arr = [...arrContent, ...arrMessages];

                  // 注释掉tool_call中的文本渲染，只保留chat_end的result渲染
        // for (const item of arr) {
        //   if (item?.type === 'user_message') continue;
        //   if (typeof item?.content === 'string' && item.content.trim().length > 0) {
        //     if (!processedAiTextRef.current.has(item.content)) {
        //       processedAiTextRef.current.add(item.content);
        //       // 直接渲染，不进入队列
        //       typewriteToChatSequential(item.content);
        //     }
        //     continue;
        //   }
        //   const msgType = item?.type || item?._type;
        //   if (msgType === 'AIMessage' && typeof item?.content === 'string' && item.content.trim().length > 0) {
        //     if (!processedAiTextRef.current.has(item.content)) {
        //       processedAiTextRef.current.add(item.content);
        //       // 直接渲染，不进入队列
        //       typewriteToChatSequential(item.content);
        //     }
        //     continue;
        //   }
        // }
        }

        // 处理 agent handoff 事件
        if (isHandoffStartOne || isHandoffEndOne) {
          const agentName: string = (one?.agent_name || one?.content?.agent_name || one?.payload?.agent_name || '').toString().trim();
          const toolName: string = (one?.tool_name || one?.content?.tool || one?.tool || '').toString().trim();
          const stepKey = `handoff:${toolName || 'unknown'}`;
          const stepLabel = `${toolName || 'unknown'}`;
          if (agentName) {
            setShowAgentPanel(true);
            setAgentPanels(prev => {
              const next = [...prev];
              let idx = next.findIndex(p => p.agentName === agentName);
              if (idx === -1) {
                next.push({ agentName, steps: [], statusMap: {}, queue: [] });
                idx = next.length - 1;
              }
              const panel = { ...next[idx] };
              if (!panel.steps.some(s => s.key === stepKey)) {
                panel.steps = [...panel.steps, { key: stepKey, label: stepLabel }];
              } else {
                panel.steps = panel.steps.map(s => s.key === stepKey ? { ...s, label: stepLabel } : s);
              }
              panel.statusMap = { ...panel.statusMap, [stepKey]: isHandoffEndOne ? 'success' : 'processing' };
              next[idx] = panel;
              return next;
            });
            try {
              setLastToolResults(prev => ({
                ...prev,
                [agentName]: { ...(prev[agentName] || {}), [stepKey]: one }
              }));
            } catch { }
          }
        }



        // 处理 chat_end → 打字机消息
        if (isChatEndOne) {
          try {
            const endResult = (one?.result || one?.payload?.result || one?.content || '').toString();
            if (endResult && endResult.trim().length > 0) {
              typewriteToChatSequential(endResult);
              // 标记消息为已处理
              markMessageAsProcessed(one);
            }
          } catch { }
        }

        // 处理 interrupt → 将 prompt 内容打印到聊天中
        if (one.type === 'interrupt') {
          try {
            const prompt = one?.result?.prompt || one?.prompt || one?.content;
            if (typeof prompt === 'string' && prompt.trim().length > 0) {
              // 使用打字机效果显示prompt内容
              typewriteToChatSequential(prompt);
              // 标记消息为已处理，防止重复执行
              markMessageAsProcessed(one);
              console.log('🔍 processOne: 收到中断消息，prompt内容已显示到聊天中:', prompt);
            }
          } catch (e) {
            console.error('processOne: 处理中断消息时出错:', e);
          }
        }

        if (isToolResultOne) {
          // 解析 tool_result 的 hub_entries
          const output = one?.payload?.output || one?.output || {};
          try {
            const agentName: string = (one?.agent_name || one?.content?.agent_name || one?.payload?.agent_name || '').toString().trim();
            const toolName: string = (one?.tool_name || one?.content?.tool || one?.tool || '').toString().trim();
            if (agentName) {
              setShowAgentPanel(true);
              setAgentPanels(prev => {
                const next = [...prev];
                let idx = next.findIndex(p => p.agentName === agentName);
                if (idx === -1) {
                  next.push({ agentName, steps: [], statusMap: {}, queue: [] });
                  idx = next.length - 1;
                }
                if (toolName) {
                  const panel = { ...next[idx] };
                  const visible = panel.steps.some(s => s.key === toolName);
                  if (!visible) {
                    panel.steps = [...panel.steps, { key: toolName, label: toolName }];
                  }
                  panel.statusMap = { ...panel.statusMap, [toolName]: 'success' };
                  next[idx] = panel;
                }
                return next;
              });
            }
            const resultData = one?.result || one?.payload?.result || output?.result || output || null;
            if (agentName && toolName && resultData) {
              setLastToolResults(prev => ({
                ...prev,
                [agentName]: { ...(prev[agentName] || {}), [toolName]: resultData }
              }));
            }
          } catch { }

          // 新增：处理 fetch_website_html_tool 的结果
          const agentName = (one?.agent_name || one?.content?.agent_name || one?.payload?.agent_name || '').toString().trim();
          const toolName = (one?.tool_name || one?.content?.tool || one?.tool || '').toString().trim();

          if (toolName === 'fetch_website_html_tool') {
            const resultData = one?.result || one?.payload?.result || output?.result || output || null;
            if (resultData) {
              // 只显示系统消息，不在右侧预览HTML内容
              const url = resultData?.url || 'Unknown URL';
            }
          }

          let hubEntries: any[] = [];
          let pageType: string | undefined = output?.page_type || output?.pageType;
          const resultData = one?.result || one?.payload?.result || output?.result || output || null;
          const hubEntriesCandidates = [
            (output as any)?.hub_entries,
            (output as any)?.result?.hub_entries,
            (one as any)?.hub_entries,
            (one as any)?.payload?.hub_entries,
            (one as any)?.payload?.result?.hub_entries,
            (one as any)?.result?.hub_entries,
            (resultData as any)?.hub_entries,
          ];
          for (const candidate of hubEntriesCandidates) {
            if (Array.isArray(candidate) && candidate.length > 0) { hubEntries = candidate; break; }
          }
          if (hubEntries.length === 0) {
            const altEntriesCandidates = [
              (output as any)?.entries,
              (output as any)?.result?.entries,
              (resultData as any)?.entries,
            ];
            for (const candidate of altEntriesCandidates) {
              if (Array.isArray(candidate) && candidate.length > 0) { hubEntries = candidate; break; }
            }
          }
          if (!pageType) {
            pageType = (output as any)?.result?.page_type
              || (output as any)?.result?.pageType
              || (resultData as any)?.page_type
              || (resultData as any)?.pageType
              || (one as any)?.page_type
              || (one as any)?.pageType;
          }
          const possibleMarkdown = output?.markdown || output?.final_markdown || one?.payload?.markdown || one?.markdown;
          if (typeof possibleMarkdown === 'string' && possibleMarkdown.trim().length > 0) {
            setLatestMarkdown(possibleMarkdown);
          }

          // 处理生成的页面 HTML（pages_html -> page_html，支持流式分片）
          try {
            const pagesHtml = (output as any)?.pages_html || (resultData as any)?.pages_html || (one as any)?.pages_html;
            if (Array.isArray(pagesHtml)) {
              for (const entry of pagesHtml) {
                const resultId = entry?.result_id || entry?.id || `${Date.now()}`;
                const title = entry?.title || resultId;
                const pageHtml = entry?.page_html || entry?.html || '';
                if (typeof pageHtml === 'string') {
                  // 直接渲染，不进入队列
                  addPreviewHtml(pageHtml, title);
                } else if (Array.isArray(entry?.chunks)) {
                  // 后端若以 chunks 数组形式流式提供
                  for (const ch of entry.chunks) {
                    const text = typeof ch === 'string' ? ch : (ch?.text || '');
                    if (text) {
                      // 直接渲染，不进入队列
                      addPreviewHtml(text, title);
                    }
                  }
                }
              }
            }
          } catch { }
          if (hubEntries.length > 0) {
            try {
              const getTs = (x: any) => new Date(x?.timestamp || x?.createdAt || Date.now()).getTime();
              const sortedEntries = [...hubEntries].sort((a, b) => getTs(a) - getTs(b));

              // 检查是否有新的 hub_entries 数据
              const newEntries = sortedEntries.filter(entry => {
                const entryId = entry?.id || entry?.hubPageId || entry?.result_id || '';
                return entryId && !processedHubEntriesRef.current.has(entryId);
              });

              // 只有当有新数据时才更新页面
              if (newEntries.length > 0) {
                // 记录已处理的条目ID
                newEntries.forEach(entry => {
                  const entryId = entry?.id || entry?.hubPageId || entry?.result_id || '';
                  if (entryId) {
                    processedHubEntriesRef.current.add(entryId);
                  }
                });

                const pages = transformHubEntriesToPages(newEntries);
                setMessages((prev) => {
                  const nowIso = new Date().toISOString();
                  const next: any[] = [
                    ...prev,
                    {
                      id: `pages-grid-${Date.now()}`,
                      type: 'pages-grid',
                      content: '',
                      pages,
                      pageType: pageType || 'alternative',
                      timestamp: nowIso,
                    },
                  ];
                  next.sort((a, b) => new Date(a.timestamp || a.createdAt || 0).getTime() - new Date(b.timestamp || b.createdAt || 0).getTime());
                  return next as any;
                });
              }
            } catch (err) {
              messageHandler.addSystemMessage('⚠️ 候选卡片生成失败，请重试');
            }
          }

          const generatedId = output?.generated_page_id || output?.generatedPageId || output?.result_id || output?.resultId;
          if (typeof generatedId === 'string' && generatedId.trim().length > 0) {
            const previewUrl = `https://preview.websitelm.site/en/${generatedId}`;
            addPreviewTab(previewUrl, `Preview ${generatedId.slice(0, 6)}`);
            const matchedHub = recentHubIdsRef.current.find(id => typeof id === 'string' && id.length > 0);
            logIdDebug('recv', one, matchedHub, 'tool_result');
          }
        }
      } catch (e) { }

      // 顺序处理队列（打字机等）
      // processAIQueue(); // 删除队列处理，改为直接渲染

      // 处理其他类型的消息
      if (one.type) {
        switch (one.type) {
          case 'markdown': {
            const md = typeof one.content === 'string' ? one.content : (typeof one.markdown === 'string' ? one.markdown : '');
            if (md) setLatestMarkdown(md);
            break;
          }
          case 'interrupt': {
            // 处理中断消息，将prompt内容打印到聊天中
            const prompt = one?.result?.prompt || one?.prompt || one?.content;
            if (typeof prompt === 'string' && prompt.trim().length > 0) {
              // 使用打字机效果显示prompt内容
              typewriteToChatSequential(prompt);
              // 标记消息为已处理，防止重复执行
              markMessageAsProcessed(one);
              console.log('🔍 收到中断消息，prompt内容已显示到聊天中:', prompt);
            }
            break;
          }
          default:
            if (typeof one?.markdown === 'string') {
              setLatestMarkdown(one.markdown);
            }
            const genId = one?.generated_page_id || one?.generatedPageId || one?.result_id || one?.resultId;
            if (typeof genId === 'string' && genId.trim().length > 0) {
              const previewUrl = `https://preview.websitelm.site/en/${genId}`;
              addPreviewTab(previewUrl, `Preview ${genId.slice(0, 6)}`);
              const matchedHub = recentHubIdsRef.current.find(id => typeof id === 'string' && id.length > 0);
              logIdDebug('recv', one, matchedHub, 'default');
            }
            break;
        }
      } else {
        const textCandidate =
          (typeof one === 'string' && one) ||
          (typeof one?.content === 'string' && one.content) ||
          (typeof one?.markdown === 'string' && one.markdown) ||
          '';
        if (textCandidate && textCandidate.trim().length > 0) {
          // 直接渲染，不进入队列
          typewriteToChatSequential(textCandidate);
        }
      }
    };

    // 直接处理当前消息（不使用 seq 逻辑）

    try {
      // 一旦收到 chat_start，立即显示处理面板（区域样式不变，仅开启渲染）
      if (isChatStart) {
        setShowAgentPanel(true);
      }

      if (isToolCall) {
        // 根据后端最新数据结构：读取 agent_name 与 tool_name，并更新面板文案
        const agentName = (payload?.agent_name || payload?.content?.agent_name || payload?.payload?.agent_name || '').toString().trim();
        const toolName = (payload?.tool_name || payload?.content?.tool || payload?.tool || '').toString().trim();
        if (agentName) {
          setShowAgentPanel(true);
          setAgentPanels(prev => {
            const next = [...prev];
            let idx = next.findIndex(p => p.agentName === agentName);
            if (idx === -1) {
              next.push({ agentName, steps: [], statusMap: {}, queue: [] });
              idx = next.length - 1;
            }
            if (toolName) {
              const panel = { ...next[idx] };
              const alreadyVisible = panel.steps.some(s => s.key === toolName);
              if (!alreadyVisible) {
                panel.steps = [...panel.steps, { key: toolName, label: toolName }];
              }
              // 新的规则：Tool 被调用后处于等待（loading），直到收到对应的 tool_result 才成功
              panel.statusMap = { ...panel.statusMap, [toolName]: 'processing' };
              next[idx] = panel;
            }
            return next;
          });
        }
        // 支持两种结构：state.content 与 state.messages
        const state = payload?.payload?.args?.state || {};
        const arrContent = Array.isArray(state?.content) ? state.content : [];
        const arrMessages = Array.isArray(state?.messages) ? state.messages : [];
        const arr = [...arrContent, ...arrMessages];

        // 注释掉tool_call中的文本渲染，只保留chat_end的result渲染
        // for (const item of arr) {
        //   if (item?.type === 'user_message') continue; // 跳过用户输入

        //   if (typeof item?.content === 'string' && item.content.trim().length > 0) {
        //     if (!processedAiTextRef.current.has(item.content)) {
        //       processedAiTextRef.current.add(item.content);
        //       // 直接渲染，不进入队列
        //       typewriteToChatSequential(item.content);
        //     }
        //     continue;
        //   }
        //   // 兼容消息对象形态：{ _type: 'AIMessage', content: '...' }
        //   const msgType = item?.type || item?._type;
        //   if (msgType === 'AIMessage' && typeof item?.content === 'string' && item.content.trim().length > 0) {
        //     if (!processedAiTextRef.current.has(item.content)) {
        //       processedAiTextRef.current.add(item.content);
        //       // 直接渲染，不进入队列
        //       typewriteToChatSequential(item.content);
        //     }
        //     continue;
        //   }
        // }
      }

      // 处理 agent handoff 事件，展示到各自的 agent 卡片中
      if (isHandoffStart || isHandoffEnd) {
        const agentName: string = (payload?.agent_name || payload?.content?.agent_name || payload?.payload?.agent_name || '').toString().trim();
        const toolName: string = (payload?.tool_name || payload?.content?.tool || payload?.tool || '').toString().trim();
        const stepKey = `handoff:${toolName || 'unknown'}`;
        // 仅展示目标名称，不展示 handoff_start / handoff_end 前缀
        const stepLabel = `${toolName || 'unknown'}`;
        if (agentName) {
          setShowAgentPanel(true);
          setAgentPanels(prev => {
            const next = [...prev];
            let idx = next.findIndex(p => p.agentName === agentName);
            if (idx === -1) {
              next.push({ agentName, steps: [], statusMap: {}, queue: [] });
              idx = next.length - 1;
            }
            const panel = { ...next[idx] };
            if (!panel.steps.some(s => s.key === stepKey)) {
              panel.steps = [...panel.steps, { key: stepKey, label: stepLabel }];
            } else {
              panel.steps = panel.steps.map(s => s.key === stepKey ? { ...s, label: stepLabel } : s);
            }
            panel.statusMap = { ...panel.statusMap, [stepKey]: isHandoffEnd ? 'success' : 'processing' };
            next[idx] = panel;
            return next;
          });
          try {
            setLastToolResults(prev => ({
              ...prev,
              [agentName]: { ...(prev[agentName] || {}), [stepKey]: payload }
            }));
          } catch { }
        }
      }

      // 处理 chat_end：将 result 作为一条AI文本消息展示（打字机效果），紧随用户消息之后
      if (isChatEnd) {
        try {
          const endResult = (payload?.result || payload?.payload?.result || payload?.content || '').toString();
          if (endResult && endResult.trim().length > 0) {
            // 直接渲染，不进入队列
            typewriteToChatSequential(endResult);
            // 标记消息为已处理
            markMessageAsProcessed(payload);
          }
        } catch { }
      }

      // 处理 interrupt：将 prompt 内容打印到聊天中
      if (isInterrupt) {
        try {
          const prompt = payload?.result?.prompt || payload?.prompt || payload?.content;
          if (typeof prompt === 'string' && prompt.trim().length > 0) {
            // 使用打字机效果显示prompt内容
            typewriteToChatSequential(prompt);
            // 标记消息为已处理，防止重复执行
            markMessageAsProcessed(payload);
            console.log('🔍 收到中断消息，prompt内容已显示到聊天中:', prompt);
          }
        } catch (e) {
          console.error('处理中断消息时出错:', e);
        }
      }

      if (isToolResult) {
        // 解析 tool_result 的 hub_entries（兼容多种后端返回结构）
        const output = payload?.payload?.output || payload?.output || {};
        // 更新 AgentProcessing 面板
        let resultData: any = null;
        try {
          const agentName: string = (payload?.agent_name || payload?.content?.agent_name || payload?.payload?.agent_name || '').toString().trim();
          const toolName: string = (payload?.tool_name || payload?.content?.tool || payload?.tool || '').toString().trim();
          if (agentName) {
            setShowAgentPanel(true);
            setAgentPanels(prev => {
              const next = [...prev];
              let idx = next.findIndex(p => p.agentName === agentName);
              if (idx === -1) {
                next.push({ agentName, steps: [], statusMap: {}, queue: [] });
                idx = next.length - 1;
              }
              if (toolName) {
                const panel = { ...next[idx] };
                const visible = panel.steps.some(s => s.key === toolName);
                if (!visible) {
                  panel.steps = [...panel.steps, { key: toolName, label: toolName }];
                }
                // 新的规则：只要收到对应的 tool_result，就标记为成功（对号）
                panel.statusMap = { ...panel.statusMap, [toolName]: 'success' };
                next[idx] = panel;
              }
              return next;
            });
          }
          // 保存结果以供 View 展示（按 agent 分组）
          resultData = payload?.result || payload?.payload?.result || output?.result || output || null;
          if (agentName && toolName && resultData) {
            setLastToolResults(prev => ({
              ...prev,
              [agentName]: { ...(prev[agentName] || {}), [toolName]: resultData }
            }));
          }
        } catch { }
        // 更健壮的 hub_entries 与 page_type 提取
        let hubEntries: any[] = [];
        let pageType: string | undefined = output?.page_type || output?.pageType;

        const hubEntriesCandidates = [
          (output as any)?.hub_entries,
          (output as any)?.result?.hub_entries,
          (payload as any)?.hub_entries,
          (payload as any)?.payload?.hub_entries,
          (payload as any)?.payload?.result?.hub_entries,
          (payload as any)?.result?.hub_entries,
          (resultData as any)?.hub_entries,
        ];
        for (const candidate of hubEntriesCandidates) {
          if (Array.isArray(candidate) && candidate.length > 0) { hubEntries = candidate; break; }
        }
        if (hubEntries.length === 0) {
          const altEntriesCandidates = [
            (output as any)?.entries,
            (output as any)?.result?.entries,
            (resultData as any)?.entries,
          ];
          for (const candidate of altEntriesCandidates) {
            if (Array.isArray(candidate) && candidate.length > 0) { hubEntries = candidate; break; }
          }
        }
        if (!pageType) {
          pageType = (output as any)?.result?.page_type
            || (output as any)?.result?.pageType
            || (resultData as any)?.page_type
            || (resultData as any)?.pageType
            || (payload as any)?.page_type
            || (payload as any)?.pageType;
        }
        // 捕获 markdown 文本
        const possibleMarkdown = output?.markdown || output?.final_markdown || payload?.payload?.markdown || payload?.markdown;
        if (typeof possibleMarkdown === 'string' && possibleMarkdown.trim().length > 0) {
          setLatestMarkdown(possibleMarkdown);
        }

        // 处理生成的页面 HTML（pages_html -> page_html，支持流式分片）
        try {
          const pagesHtml = (output as any)?.pages_html || (resultData as any)?.pages_html || (payload as any)?.pages_html;
          if (Array.isArray(pagesHtml)) {
            for (const entry of pagesHtml) {
              const resultId = entry?.result_id || entry?.id || `${Date.now()}`;
              const title = entry?.title || resultId;
              const pageHtml = entry?.page_html || entry?.html || '';
              if (typeof pageHtml === 'string') {
                // 直接渲染，不进入队列
                addPreviewHtml(pageHtml, title);
              } else if (Array.isArray(entry?.chunks)) {
                for (const ch of entry.chunks) {
                  const text = typeof ch === 'string' ? ch : (ch?.text || '');
                  if (text) {
                    // 直接渲染，不进入队列
                    addPreviewHtml(text, title);
                  }
                }
              }
            }
          }
        } catch { }
        if (hubEntries.length > 0) {
          const count = hubEntries.length;
          // 在卡片前插入一条提示气泡
          // 直接渲染，不进入队列
          typewriteToChatSequential(`Found ${count} candidate pages. Please check the boxes in the cards below and click Generate.`);

          // 直接处理hub_entries，不进入队列
          try {
            const getTs = (x: any) => new Date(x?.timestamp || x?.createdAt || Date.now()).getTime();
            const sortedEntries = [...hubEntries].sort((a, b) => getTs(a) - getTs(b));

            // 检查是否有新的 hub_entries 数据
            const newEntries = sortedEntries.filter(entry => {
              const entryId = entry?.id || entry?.hubPageId || entry?.result_id || '';
              return entryId && !processedHubEntriesRef.current.has(entryId);
            });

            // 只有当有新数据时才更新页面
            if (newEntries.length > 0) {
              // 记录已处理的条目ID
              newEntries.forEach(entry => {
                const entryId = entry?.id || entry?.hubPageId || entry?.result_id || '';
                if (entryId) {
                  processedHubEntriesRef.current.add(entryId);
                }
              });

              const pages = transformHubEntriesToPages(newEntries);
              setMessages((prev) => {
                const nowIso = new Date().toISOString();
                const next: any[] = [
                  ...prev,
                  {
                    id: `pages-grid-${Date.now()}`,
                    type: 'pages-grid',
                    content: '',
                    pages,
                    pageType: pageType || 'alternative',
                    timestamp: nowIso,
                  },
                ];
                next.sort((a, b) => new Date(a.timestamp || a.createdAt || 0).getTime() - new Date(b.timestamp || b.createdAt || 0).getTime());
                return next as any;
              });
            }
          } catch (err) {
            messageHandler.addSystemMessage('⚠️ 候选卡片生成失败，请重试');
          }
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
    } catch (e) { }

    // 顺序处理队列
    // processAIQueue();


    // 调用 processOne 处理消息，确保 agent-panel 消息被正确加入队列
    processOne(payload); // 删除重复调用，避免消息重复处理
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
        // 禁用自动加载历史记录功能
        // (async () => {
        //   try { await loadChatHistory(currentConversationId); } catch {}
        // })();

        // 4. 自动连接：建立WebSocket连接（由下方组件控制）
        if (!wsConnected && wsConnectionState === 'CLOSED') {
          // WebSocket 连接会在组件渲染时自动建立
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
          // 检查消息是否已经处理过，避免重复处理
          if (!isMessageProcessed(rec)) {
            handleWebSocketMessage(rec);
          }
          const ts =
            (typeof rec?.timestamp === 'string' && rec.timestamp) ||
            (typeof rec?.ts === 'number' && rec.ts) ||
            (typeof rec?.payload?.timestamp === 'string' && rec.payload.timestamp) ||
            null;
          if (ts) lastTs = ts;
        } catch (e) { }
      }

      // 记录最后一条事件时间戳用于断点续传
      try {
        const key = `ws_resume_ts_${conversationId}`;
        if (lastTs) {
          localStorage.setItem(key, String(lastTs));
        }
      } catch { }

    } catch (error) {
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
      localStorage.setItem('pendingDomainInput', formattedInput);
      localStorage.setItem('currentProductUrl', formattedInput);

      // 只有当域名真正变化时才更新状态
      if (formattedInput !== currentDomain) {
        setCurrentDomain(formattedInput);
      }

      // 根据图片规则：用户发送第一条消息创建聊天室
      let tempConversationId = currentConversationId;

      if (!tempConversationId) {
        setLoading(true);
        // 用户发送第一条消息，API创建聊天室并返回 conversationId（不再直接返回 WebSocket）
        const chatResponse = await apiClient.chatWithAI(getPageMode(), formattedInput, null);

        if (chatResponse && (chatResponse as any).conversationId) {
          tempConversationId = (chatResponse as any).conversationId as string;
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
          // 显示跳转等待页面
          setLoading(true);
          
          router.replace(`${targetPath}?conversationId=${tempConversationId}`);
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

  //处理消息
  const renderChatMessage = (message: any, index: number) => {
    // 处理域名信息消息


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
                className={`p-4 rounded-2xl text-sm ${isHydrated ? themeStyles.systemMessage?.background : (currentTheme === 'dark' ? 'bg-slate-800/80' : 'bg-slate-100')} ${isHydrated ? themeStyles.systemMessage?.text : (currentTheme === 'dark' ? 'text-white' : 'text-black')} ${isHydrated ? themeStyles.systemMessage?.shadow : 'shadow-xl'} backdrop-blur-sm
                         border ${isHydrated ? themeStyles.systemMessage?.border : (currentTheme === 'dark' ? 'border-slate-600/40' : 'border-slate-200')} rounded-tl-none
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
              <div className={`absolute -left-1 top-0 w-2 h-2 ${isHydrated ? themeStyles.systemMessage?.background : (currentTheme === 'dark' ? 'bg-slate-800/80' : 'bg-slate-100')} transform rotate-45`}></div>
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
            <div className={`text-[10px] mt-1 ml-2 ${isHydrated ? (currentTheme === 'dark' ? 'text-slate-400' : 'text-gray-500') : 'text-slate-400'}`}>
              {new Date(message.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      );
    }

    if (message.type === 'pages-grid') {
      const remainingPages = (message.pages || []).filter((p: any) => !submittedHubIds.has(p.hubPageId));
      const remainingCount = remainingPages.length;
      const shouldHide = hideRemainingCards && remainingCount > 0;
      return (
        <div key={`${index}-pages`} className="flex justify-start mb-4" style={{ animation: 'fadeIn 0.5s ease-out forwards' }}>
          <div className="max-w-[95%] w-full">
            {/* 显示/隐藏剩余卡片的控制按钮 - 始终显示 */}
            <div className="flex justify-center mb-4">
              <button
                className="transition-all duration-500 ease-in-out transform hover:scale-105"
                onClick={() => setHideRemainingCards(v => !v)}
                style={{
                  background: 'linear-gradient(90deg, #8B5CF6 0%, #7C3AED 100%)',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  minWidth: '320px',
                  justifyContent: 'space-between'
                }}
              >
                {/* 左侧图标 */}
                <div className="flex items-center gap-3">
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z" 
                      fill="#60A5FA"
                    />
                  </svg>
                  
                  {/* 文字内容 */}
                  <div className="text-left">
                    <div className="text-white font-bold text-lg leading-tight">
                      {hideRemainingCards ? 'Show Remaining Cards' : 'Hide Remaining Cards'}
                    </div>
                    <div className="text-white/80 text-sm leading-tight">
                      Click to {hideRemainingCards ? 'show' : 'hide'} quality pages hints ✨
                    </div>
                  </div>
                </div>
                
                {/* 右侧箭头 */}
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 20 20" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M7.5 15L12.5 10L7.5 5" 
                    stroke="white" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* More compact list layout */}
            <div className="flex flex-col gap-1.5" style={{ display: shouldHide ? 'none' : undefined }}>

              {remainingPages.map((page: any, idx: number) => (
                <div
                  key={page.hubPageId || `page-${idx}`}
                  className={`group transition-all duration-200 hover:shadow-lg rounded-xl p-4 ${
                    isHydrated ? themeStyles.pagesGrid?.pageCard?.background : 'bg-white'
                  } ${
                    (() => {
                      const isSelected = selectedCompetitors.some((c: any) => c.hubPageId === page.hubPageId);
                      if (isSelected) {
                        return isHydrated ? themeStyles.pagesGrid?.pageCard?.borderSelected : 'border border-blue-600';
                      }
                      return isHydrated ? themeStyles.pagesGrid?.pageCard?.border : 'border border-gray-300';
                    })()
                  }`}
                  onMouseEnter={(e) => {
                    // 只有当事件目标是最外层div时才改变边框
                    if (e.target === e.currentTarget) {
                      const isSelected = selectedCompetitors.some((c: any) => c.hubPageId === page.hubPageId);
                      if (!isSelected) {
                        if (isHydrated && themeStyles.pagesGrid?.pageCard?.borderHover) {
                          // 使用主题配置的hover边框
                          e.currentTarget.className = e.currentTarget.className.replace(
                            /border\s+border-[a-z-]+/g, 
                            themeStyles.pagesGrid.pageCard.borderHover
                          );
                        } else {
                          // 使用fallback样式
                          e.currentTarget.classList.remove('border-gray-300');
                          e.currentTarget.classList.add('border-gray-400');
                        }
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    // 只有当事件目标是最外层div时才改变边框
                    if (e.target === e.currentTarget) {
                      const isSelected = selectedCompetitors.some((c: any) => c.hubPageId === page.hubPageId);
                      if (!isSelected) {
                        if (isHydrated && themeStyles.pagesGrid?.pageCard?.border) {
                          // 使用主题配置的默认边框
                          e.currentTarget.className = e.currentTarget.className.replace(
                            /border\s+border-[a-z-]+/g, 
                            themeStyles.pagesGrid.pageCard.border
                          );
                        } else {
                          // 使用fallback样式
                          e.currentTarget.classList.remove('border-gray-400');
                          e.currentTarget.classList.add('border-gray-300');
                        }
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
                            className="w-4 h-4 text-blue-600 bg-transparent border-2 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                            style={{ accentColor: isHydrated ? themeStyles.pagesGrid?.checkbox?.accentColor : '#357BF7' }}
                          />
                        )}

                        {/* Page title */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${isHydrated ? themeStyles.pagesGrid?.tdkLabel?.text : 'text-gray-700'}`}>
                              T:
                            </span>
                            <div className={`font-medium leading-tight text-base ${isHydrated ? themeStyles.pagesGrid?.pageTitle?.text : 'text-black'}`}
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
                            className={`text-xs font-medium px-3 py-1 transition-all duration-200 hover:opacity-80 flex items-center gap-1 rounded-xl text-white ${
                              isHydrated ? themeStyles.pagesGrid?.viewButton?.background : 'bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500'
                            }`}
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

                        {/* 查看按钮，在生成的页面展示 */}
                        {page.isPageGenerated && (
                          <button
                            className={`text-xs font-medium px-3 py-1 transition-all duration-200 hover:opacity-80 flex items-center gap-1 rounded-xl text-white ${
                              isHydrated ? themeStyles.pagesGrid?.viewButton?.background : 'bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500'
                            }`}
                            onClick={() => {
                              const idForPreview = page.hubPageId || page.generatedPageId || page.id;
                              const previewUrl = `https://preview.websitelm.site/en/${idForPreview}`;
                              window.open(previewUrl, '_blank');
                            }}
                          >
                            <span>View →</span>
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
                      <div className={`flex items-start gap-2 mb-3 text-sm ${
                        !page.isPageGenerated ? 'ml-7' : 'ml-0'
                      }`}>
                        <span className={`text-xs font-medium flex-shrink-0 mt-0.5 ${isHydrated ? themeStyles.pagesGrid?.tdkLabel?.text : 'text-gray-700'}`}>
                          D:
                        </span>
                        <div className={`text-sm ${isHydrated ? themeStyles.pagesGrid?.pageDescription?.text : 'text-gray-600'} leading-relaxed`}
                          title={page.description}>
                          {page.description.length > 120 ? `${page.description.substring(0, 120)}...` : page.description}
                        </div>
                      </div>
                    )}

                    {/* Keywords row - TDK K */}
                    {page.relatedKeywords && page.relatedKeywords.length > 0 && (
                      <div className={`flex items-start gap-2 mb-3 text-sm ${
                        !page.isPageGenerated ? 'ml-7' : 'ml-0'
                      }`}>
                        <span className={`text-xs font-medium flex-shrink-0 mt-0.5 ${isHydrated ? themeStyles.pagesGrid?.tdkLabel?.text : 'text-gray-700'}`}>
                          K:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {page.pageType === 'best' ? (
                            <div className="flex flex-wrap gap-1">
                              {page.relatedKeywords.slice(0, 4).map((keyword: string, kidx: number) => (
                                <span key={kidx}
                                  className={`px-2 py-1 text-xs rounded-md ${
                                    isHydrated ? themeStyles.pagesGrid?.keywordTag?.background : 'bg-gray-200'
                                  } ${
                                    isHydrated ? themeStyles.pagesGrid?.keywordTag?.text : 'text-black'
                                  }`}>
                                  {keyword}
                                </span>
                              ))}
                              {page.relatedKeywords.length > 4 && (
                                <span className={`text-xs ${isHydrated ? themeStyles.pagesGrid?.metrics?.label : 'text-gray-600'}`}>
                                  +{page.relatedKeywords.length - 4}
                                </span>
                              )}
                            </div>
                          ) : (
                            <>
                              {page.relatedKeywords.slice(0, 3).map((keyword: string, kidx: number) => (
                                <span key={kidx}
                                  className={`px-2 py-1 text-xs rounded-md ${
                                    isHydrated ? themeStyles.pagesGrid?.keywordTag?.background : 'bg-gray-200'
                                  } ${
                                    isHydrated ? themeStyles.pagesGrid?.keywordTag?.text : 'text-black'
                                  }`}>
                                  {keyword}
                                </span>
                              ))}
                              {page.relatedKeywords.length > 3 && (
                                <span className={`text-xs ${isHydrated ? themeStyles.pagesGrid?.metrics?.label : 'text-gray-600'}`}>
                                  +{page.relatedKeywords.length - 3}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Metrics row - Traffic, KD */}
                    <div className={`flex items-center gap-6 text-sm ${isHydrated ? themeStyles.pagesGrid?.metrics?.label : 'text-gray-500'} ${
                      !page.isPageGenerated ? 'ml-7' : 'ml-0'
                    }`}>
                      {/* Traffic */}
                      <span>
                        Traffic: <span className={isHydrated ? themeStyles.pagesGrid?.metrics?.value : 'text-black'}>
                          {(() => {
                            const trafficValue = String(page.trafficPotential).trim();
                            return (trafficValue !== "0" && trafficValue !== "") ? page.trafficPotential : '-';
                          })()}
                        </span>
                      </span>

                      {/* KD */}
                      <span>
                        KD: <span className={isHydrated ? themeStyles.pagesGrid?.metrics?.value : 'text-black'}>
                          {(() => {
                            const difficultyValue = String(page.difficulty).trim();
                            return (difficultyValue !== "0" && difficultyValue !== "") ? page.difficulty : '-';
                          })()}
                        </span>
                      </span>
                    </div>

                    {/* Competitors row for best type */}
                    {page.pageType === 'best' && page.competitors && page.competitors.length > 0 && (
                      <div className={`flex items-center gap-2 mt-3 text-sm ${isHydrated ? themeStyles.pagesGrid?.metrics?.label : 'text-gray-500'} ${
                        !page.isPageGenerated ? 'ml-7' : 'ml-0'
                      }`}>
                        <span>Competitors:</span>
                        <div className="flex flex-wrap gap-1">
                          {page.competitors.map((competitor: string, cidx: number) => (
                            <span key={cidx}
                              className={`px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-800`}>
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
            {/* Timestamp for pages-grid block */}
            <div className="text-[10px] text-slate-400 mt-2 ml-2">
              {new Date(message.timestamp || Date.now()).toLocaleString()}
            </div>
          </div>
        </div>
      );
    }

    else {
      // 当为思考态时不渲染占位气泡
      if (message.isThinking) {
        return null;
      }
      const rawContent = typeof message.content === 'string' ? message.content : '';
      const filteredContent = linkifyDomains(
        filterMessageTags(rawContent).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      );

      // 使用与用户消息一致的样式（左侧对齐）
      return (
        <div
          key={index}
          className="flex justify-start mb-6"
          style={{ animation: 'fadeIn 0.5s ease-out forwards' }}
        >
          <div className="flex max-w-[80%] flex-col items-start">
            <div className="relative">
              <div className={`p-4 text-sm backdrop-blur-sm
                transition-all duration-500
                transform hover:-translate-y-1 hover:scale-[1.02]
                ${isHydrated ? themeStyles.userMessage?.text : (currentTheme === 'dark' ? 'text-white' : 'text-black')}
                ${isHydrated ? themeStyles.userMessage?.background : (currentTheme === 'dark' ? 'bg-white/10' : 'bg-slate-100')}
                relative overflow-hidden rounded-xl`}
                style={{
                  maxWidth: '350px',
                  wordWrap: 'break-word'
                }}>
                <div className="relative z-10">
                  <span dangerouslySetInnerHTML={{ __html: filteredContent.split('\n').join('<br />') }} />
                </div>
              </div>
            </div>
            <div className={`text-[10px] mt-1 ml-2 ${isHydrated ? (currentTheme === 'dark' ? 'text-slate-400' : 'text-gray-500') : 'text-slate-400'}`}>
              {new Date(message.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      );
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
  // 跳转等待页面显示
  if (loading) {
    return (
      <section className="w-full py-8 sm:py-12 lg:py-16 flex flex-col items-center bg-white dark:bg-gray-900 min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-6">
          {/* 简洁的C形加载动画 */}
          <div className="loading-spinner"></div>
          
          {/* 加载文本 */}
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg font-medium">
              Initializing data...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className={`w-full min-h-screen text-white flex items-center justify-center p-4 relative overflow-hidden ${isHydrated ? themeStyles.background : 'bg-gradient-to-b from-[#121826] to-[#030810]'}`}
        style={{
          paddingTop: isEntryPage ? "0" : "40px",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
        <style jsx>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>

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
                                position: 'relative',
                              }}
                            >
                              {/* 渐变边框 */}
                              <div
                                style={{
                                  content: '""',
                                  position: 'absolute',
                                  inset: 0,
                                  borderRadius: '1rem',
                                  padding: '1px',
                                  background: currentTheme === 'dark'
                                    ? 'linear-gradient(101deg, rgba(51, 111, 255, 0.95) 0%, rgba(255, 255, 255, 0.25) 100%)'
                                    : 'linear-gradient(101deg, rgba(51, 111, 255, 1) 0%, rgba(255, 255, 255, 0.95) 100%)',
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
                                variant="bare"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              {/* 严格按照 seq 顺序渲染消息（队列中包含 agent-panel 占位） */}
              {combinedMessages.map((message, index) => {
                if (message.type === 'agent-panel') {
                  if (!showAgentPanel || agentPanels.length === 0) return null;
                  return (
                    <div key={`agent-panels-after-${index}`} className="mb-4 space-y-3">
                      {agentPanels.map((panel, i) => (
                        <div
                          key={panel.agentName}
                          className="animate-slideUp"
                          style={{ animation: 'slideUp 0.4s ease-out forwards', animationDelay: `${i * 80}ms` }}
                        >
                          <AgentProcessingPanel
                            title={panel.agentName || 'Agent Processing'}
                            steps={panel.steps as any}
                            statusMap={panel.statusMap as any}
                            themeStyles={themeStyles}
                            isHydrated={isHydrated}
                            isExpanded={agentPanelExpandedMap[panel.agentName] ?? true}
                            onToggle={() => setAgentPanelExpandedMap(prev => ({ ...prev, [panel.agentName]: !(prev[panel.agentName] ?? true) }))}
                            onViewStep={(stepKey: string) => {
                              const content = (lastToolResults[panel.agentName] || {})[stepKey];
                              setRightPanelTab('browser');
                              setRightOverlay({ visible: true, title: `${panel.agentName} · ${stepKey}`, content });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  );
                }
                return renderChatMessage(message, index);
              })}
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
                              position: 'relative',
                            }}
                          >
                            {/* 渐变边框 */}
                            <div
                              style={{
                                content: '""',
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '1rem',
                                padding: '1px',
                                background: currentTheme === 'dark'
                                  ? 'linear-gradient(101deg, rgba(51, 111, 255, 0.95) 0%, rgba(255, 255, 255, 0.25) 100%)'
                                  : 'linear-gradient(101deg, rgba(51, 111, 255, 1) 0%, rgba(255, 255, 255, 0.95) 100%)',
                                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'xor',
                                maskComposite: 'exclude',
                                pointerEvents: 'none',
                              }}
                            />
                            {/* Removed selected competitors chips display */}
                            <ChatInput
                              userInput={userInput}
                              setUserInput={(value) => {
                                setUserInput(value);
                                if (value === '') {
                                  setSelectedCompetitors([]);
                                }
                              }}
                              onSendMessage={handleUserInput}
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
                              variant="bare"
                              onStartGeneration={handleStartGeneration}
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
                    <div className="space-y-2 relative h-full">
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
                      {/* 右侧覆盖层：展示 View 的结果数据 */}
                      {rightOverlay.visible && (
                        <div className="absolute inset-0 z-10 p-3">
                          <div
                            className="w-full h-full rounded-lg shadow-lg overflow-auto"
                            style={{
                              border: currentTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid rgba(0, 0, 0, 0.12)',
                              background: currentTheme === 'dark' ? '#0B1421' : '#F8FAFC',
                              color: currentTheme === 'dark' ? '#E5E7EB' : '#111827'
                            }}
                          >
                            <div className="sticky top-0 z-20 flex items-center justify-between px-3 py-2"
                              style={{
                                background: currentTheme === 'dark' ? 'rgba(11, 20, 33, 0.95)' : 'rgba(248, 250, 252, 0.95)',
                                borderBottom: currentTheme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)'
                              }}
                            >
                              <div className="text-sm font-medium truncate pr-3">{rightOverlay.title}</div>
                              <button
                                className="text-xs px-2 py-1 rounded hover:opacity-80"
                                style={{
                                  background: currentTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                                  color: currentTheme === 'dark' ? '#E5E7EB' : '#111827'
                                }}
                                onClick={() => setRightOverlay({ visible: false })}
                              >
                                Close
                              </button>
                            </div>
                            <div className="px-3 pb-4 pt-2">
                              <pre className="text-[12px] leading-5 whitespace-pre-wrap break-words">
                                {typeof rightOverlay.content === 'string' ? rightOverlay.content : JSON.stringify(rightOverlay.content, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}

                      {browserTabs.length === 0 ? (
                        <div className="flex-1 overflow-y-auto overflow-y-hidden p-3 h-[calc(100vh-400px)]">
                                                      <div className="flex items-center justify-center h-full">
                              <div className="flex flex-col items-center text-gray-600 dark:text-gray-400 text-base">
                                <div className="w-96 h-88 opacity-60 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                  <svg className="w-24 h-24 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <span className="text-gray-700 dark:text-gray-300">Your generated pages will appear here</span>
                              </div>
                            </div>
                        </div>
                      ) : (
                        <div className="p-3">
                          <div className="flex items-center space-x-0.5 mb-3 overflow-x-auto px-1.5 border-b border-gray-200 dark:border-slate-800/80">
                            {browserTabs.map((tab) => (
                              <div
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={` 
                                    flex items-center justify-between px-2.5 py-1.5 min-w-[100px] max-w-[160px] cursor-pointer transition-all
                                    ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white dark:bg-slate-800/90 dark:text-slate-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-900/60 dark:text-slate-500 dark:hover:text-slate-400 dark:hover:bg-slate-800/50'
                                  }
                                    rounded-t-[6px] relative group
                                  `}
                              >
                              </div>
                            ))}
                          </div>

                          {activeTab && (
                            <div>
                              <div className={`flex items-center gap-2 mb-2 rounded-lg px-2 py-1.5`}>
                                <div className="flex items-center gap-2 w-full">
                                  <div className="flex-1 px-3 py-1.5 text-xs rounded-[10px] overflow-hidden overflow-ellipsis whitespace-nowrap text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                                    {browserTabs.find(tab => tab.id === activeTab)?.url}
                                  </div>
                                  <button
                                    onClick={() => {
                                      const currentUrl = browserTabs.find(tab => tab.id === activeTab)?.url;
                                      if (currentUrl && currentUrl.startsWith('http')) {
                                        window.open(currentUrl, '_blank');
                                      }
                                    }}
                                    className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-[10px] transition-colors duration-200 flex items-center gap-1"
                                    title="publish"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    publish
                                  </button>
                                </div>
                              </div>
                              <div
                                ref={iframeContainerRef}
                                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden relative border border-gray-200 dark:border-gray-600"
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
        />
      )}
    </>
  );
};

export default ResearchTool;