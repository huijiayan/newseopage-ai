// 对应老代码中的复杂业务逻辑hooks，封装主要的状态管理
// 保持与原始代码100%一致的状态管理逻辑

"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMediaQuery } from 'react-responsive';
import type { 
  ConversationMessage, 
  PageData, 
  BrowserTab, 
  TaskStep, 
  LogData, 
  ApiDetailModal, 
  DeletePageConfirm, 
  ErrorModal, 
  ChatHistory 
} from '@/types/research-tool';
import { DEFAULT_TASK_STEPS, TASK_TIME_ESTIMATES } from '@/types/research-tool';
import { MessageHandler } from '../utils/MessageHandler';
import apiClient from '@/lib/api';

export const useResearchTool = (conversationId: string | null = null) => {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });
  
  // 对应老代码中的基础状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSlogan, setShowSlogan] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isMessageSending, setIsMessageSending] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState('browser');
  const [logs, setLogs] = useState<LogData[]>([]);
  const [canProcessCompetitors, setCanProcessCompetitors] = useState(false);
  const [browserTabs, setBrowserTabs] = useState<BrowserTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [isProcessingTask, setIsProcessingTask] = useState(false);
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState("Enter product website URL to get started (e.g., example.com)");
  const [errorModal, setErrorModal] = useState<ErrorModal>({ visible: false, message: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [taskSteps, setTaskSteps] = useState<TaskStep[]>(DEFAULT_TASK_STEPS);
  const [showBrandAssetsModal, setShowBrandAssetsModal] = useState(false);
  const [showCompetitorModal, setShowCompetitorModal] = useState(false);
  const [isBrowserSidebarOpen, setIsBrowserSidebarOpen] = useState(false);
  const [mainProduct, setMainProduct] = useState('');
  const [selectedCompetitors, setSelectedCompetitors] = useState<PageData[]>([]);
  const [phImageAvailable, setPhImageAvailable] = useState(false);
  const [phCheckDone, setPhCheckDone] = useState(false);
  const [showTaskConflictModal, setShowTaskConflictModal] = useState(false);
  const [conflictingTask, setConflictingTask] = useState(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [messageCollapsed, setMessageCollapsed] = useState<Record<number, boolean>>({});
  const [isStatusBarExpanded, setIsStatusBarExpanded] = useState(false);
  const [isPublishPageModalVisible, setIsPublishPageModalVisible] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [currentWebsiteId, setCurrentWebsiteId] = useState<string | null>(null);
  const [hubPageIds, setHubPageIds] = useState<string[]>([]);
  const [deletePageConfirm, setDeletePageConfirm] = useState<DeletePageConfirm>({ 
    open: false, 
    resultId: null, 
    generatedPageId: null 
  });
  const [apiDetailModal, setApiDetailModal] = useState<ApiDetailModal>({ 
    visible: false, 
    data: null 
  });
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const [thinkingLogExpanded, setThinkingLogExpanded] = useState<Record<string, boolean>>({});
  const [editingPage, setEditingPage] = useState<PageData | null>(null);
  const [competitorModalMode, setCompetitorModalMode] = useState<'add' | 'edit'>('add');
  const [shouldConnectWS, setShouldConnectWS] = useState(false);
  const [hasUserManuallyClosedPanel, setHasUserManuallyClosedPanel] = useState(false);
  const [hasAutoOpenedOnce, setHasAutoOpenedOnce] = useState(false);

  // 对应老代码中的refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const apiDetailModalContentRef = useRef<HTMLDivElement>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const latestAgentContentRef = useRef<HTMLDivElement>(null);
  const executionLogRef = useRef<HTMLDivElement>(null);
  const hasShownWelcomeMessageRef = useRef(false);
  const hasRestoredProgressRef = useRef(false);
  const isRestoringHistoryRef = useRef(false);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const htmlStreamRef = useRef('');
  const isStreamingRef = useRef(false);
  const currentStreamIdRef = useRef<string | null>(null);
  const lastLogCountRef = useRef(0);
  const placeholderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const placeholderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processedStepLogIdsRef = useRef(new Set<string>());
  const startedTaskCountRef = useRef(0);
  const processedLogIdsRef = useRef<string[]>([]);
  const currentTextIndexRef = useRef(0);
  const isDeletingRef = useRef(false);
  const charIndexRef = useRef(0);
  const wsReconnectNoticeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isShowingReconnectNoticeRef = useRef(false);
  const isFirstMessageSentForNewTaskRef = useRef(false);
  const processedTipMessagesRef = useRef(new Set<string>());

  // 创建MessageHandler实例
  const messageHandler = useMemo(() => new MessageHandler(setMessages), []);

  // 获取页面模式
  const getPageMode = useCallback(() => {
    if (typeof window === 'undefined') return 'alternative';
    const currentPath = window.location.pathname;
    if (currentPath.includes('bestpage')) {
      return 'best';
    } else if (currentPath.includes('faqpage')) {
      return 'faq';
            } else if (currentPath.includes('alternative')) {
      return 'alternative';
    }
    return 'alternative';
  }, []);

  // 获取slogan内容
  const getSloganContent = useCallback(() => {
    if (pathname?.includes('/bestpage')) {
      return {
        title: "Rank Higher When People Search For The Best Options",
        description: "Dominate search results with AI-powered 'best of' pages that capture high-intent buyers at the perfect moment.",
      };
    } else if (pathname?.includes('/faqpage')) {
      return {
        title: "Answer First When People Ask Important Questions", 
        description: "Capture question-based search traffic with AI-generated FAQ pages that position you as the authority in your industry.",
      };
    } else {
      return {
        title: "Get Found When People Search Your Competitor",
        description: "Own all your competitor's brand search traffic with AI-generated pages that outrank.",
      };
    }
  }, [pathname]);

  // 切换侧边栏
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // 处理竞争对手选择
  const handleCompetitorSelect = useCallback((competitor: PageData) => {
    if (isProcessingTask) {
      console.info('Please wait for the current step to finish before adding more competitors!');
      return;
    }

    if (competitor.hubPageId) {
      setHubPageIds(prev => {
        const newIds = [...prev];
        if (!newIds.includes(competitor.hubPageId)) {
          newIds.push(competitor.hubPageId);
        }
        return newIds;
      });
    }

    setSelectedCompetitors(prev => {
      const exists = prev.some(c => c.hubPageId === competitor.hubPageId);
      return exists 
        ? prev.filter(c => c.hubPageId !== competitor.hubPageId)
        : [...prev, competitor];
    });

    // 自动聚焦
    requestAnimationFrame(() => {
      if (inputRef.current?.focus) {
        inputRef.current.focus();
      }
    });
  }, [isProcessingTask]);

  // 移除竞争对手
  const removeCompetitor = useCallback((hubPageId: string) => {
    setSelectedCompetitors(prev => prev.filter(c => c.hubPageId !== hubPageId));
    setHubPageIds(prev => prev.filter(id => id !== hubPageId));
  }, []);

  // 处理页面删除
  const handleDeletePage = useCallback((pageId: string) => {
    setDeletePageConfirm({ 
      open: true, 
      resultId: pageId,
      generatedPageId: pageId
    });
  }, []);

  // 确认删除
  const handleConfirmDelete = useCallback(async () => {
    try {
      const result = await apiClient.deleteAlternativeResult(deletePageConfirm.resultId!);
      
      if (result && (result.success || result.code === 200 || result.status === 'success')) {
        // 更新消息列表，移除已删除的页面
        setMessages(prevMessages => {
          return prevMessages.map(message => {
            if (message.type === 'pages-grid' && message.pages) {
              return {
                ...message,
                pages: message.pages.filter(p => p.generatedPageId !== deletePageConfirm.generatedPageId)
              };
            }
            return message;
          });
        });
        
        // 刷新页面
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.error('Unexpected delete response:', result);
      }
    } catch (error) {
      console.error('Delete operation failed:', error);
    } finally {
      setDeletePageConfirm({ open: false, resultId: null, generatedPageId: null });
    }
  }, [deletePageConfirm]);

  // 处理编辑页面
  const handleEditPage = useCallback((page: PageData) => {
    setEditingPage(page);
    setCompetitorModalMode('edit');
    setShowCompetitorModal(true);
  }, []);

  return {
    // 状态
    isSubmitting,
    setIsSubmitting,
    showSlogan,
    setShowSlogan,
    chatHistory,
    setChatHistory,
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
    canProcessCompetitors,
    setCanProcessCompetitors,
    browserTabs,
    setBrowserTabs,
    activeTab,
    setActiveTab,
    wsConnected,
    setWsConnected,
    isProcessingTask,
    setIsProcessingTask,
    dynamicPlaceholder,
    setDynamicPlaceholder,
    errorModal,
    setErrorModal,
    isSidebarOpen,
    setIsSidebarOpen,
    isUserLoggedIn,
    setIsUserLoggedIn,
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
    phImageAvailable,
    setPhImageAvailable,
    phCheckDone,
    setPhCheckDone,
    showTaskConflictModal,
    setShowTaskConflictModal,
    conflictingTask,
    setConflictingTask,
    containerSize,
    setContainerSize,
    messageCollapsed,
    setMessageCollapsed,
    isStatusBarExpanded,
    setIsStatusBarExpanded,
    isPublishPageModalVisible,
    setIsPublishPageModalVisible,
    selectedPage,
    setSelectedPage,
    currentWebsiteId,
    setCurrentWebsiteId,
    hubPageIds,
    setHubPageIds,
    deletePageConfirm,
    setDeletePageConfirm,
    apiDetailModal,
    setApiDetailModal,
    currentConversationId,
    setCurrentConversationId,
    thinkingLogExpanded,
    setThinkingLogExpanded,
    editingPage,
    setEditingPage,
    competitorModalMode,
    setCompetitorModalMode,
    shouldConnectWS,
    setShouldConnectWS,
    hasUserManuallyClosedPanel,
    setHasUserManuallyClosedPanel,
    hasAutoOpenedOnce,
    setHasAutoOpenedOnce,

    // Refs
    inputRef,
    chatEndRef,
    sidebarRef,
    iframeContainerRef,
    apiDetailModalContentRef,
    codeContainerRef,
    latestAgentContentRef,
    executionLogRef,
    hasShownWelcomeMessageRef,
    hasRestoredProgressRef,
    isRestoringHistoryRef,
    retryCountRef,
    retryTimeoutRef,
    htmlStreamRef,
    isStreamingRef,
    currentStreamIdRef,
    lastLogCountRef,
    placeholderIntervalRef,
    placeholderTimeoutRef,
    processedStepLogIdsRef,
    startedTaskCountRef,
    processedLogIdsRef,
    currentTextIndexRef,
    isDeletingRef,
    charIndexRef,
    wsReconnectNoticeTimeoutRef,
    isShowingReconnectNoticeRef,
    isFirstMessageSentForNewTaskRef,
    processedTipMessagesRef,

    // 计算属性
    isMobile,
    isRecoveryMode: true,
    taskTimeEstimates: TASK_TIME_ESTIMATES,
    
    // 方法
    messageHandler,
    getPageMode,
    getSloganContent,
    toggleSidebar,
    handleCompetitorSelect,
    removeCompetitor,
    handleDeletePage,
    handleConfirmDelete,
    handleEditPage,
    
    // 路由相关
    router,
    pathname,
  };
};