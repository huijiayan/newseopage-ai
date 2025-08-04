'use client';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Input, Button, message, Tooltip, Modal } from 'antd';
import { InfoCircleOutlined, UpOutlined, DownOutlined, ExportOutlined, LinkOutlined, SearchOutlined } from '@ant-design/icons';
import apiClient from '../../../lib/api/index.js';
import { EventSourcePolyfill } from 'event-source-polyfill';
import MessageHandler from '../../../utils/MessageHandler';
import { useMediaQuery } from 'react-responsive';
import BrandAssetsModal from './brand-assets';
import HistoryCardList from './result-preview'; 
import { useRouter, usePathname } from 'next/navigation';
import PublishPage from './publish-page-new';
import BlueprintVisualization from './blue-print';
import PageLoading from '../page-loading';
import { usePostHog } from 'posthog-js/react';
import { useTheme } from '../../../utils/theme-config.js'; 
import CompetitorModal from './competitor-modal';

const TAG_FILTERS = {
  '\\[URL_GET\\]': '',  
  '\\[COMPETITOR_SELECTED\\]': '',  
  '\\[PAGES_GENERATED\\]': '',  
};

// 任务状态栏组件，用于显示当前页面生成任务的进度状态
const TaskStatusBar = ({ 
  currentStep, 
  taskSteps, 
  browserTabs,
  taskTimeEstimates,
  isExpanded, 
  setIsExpanded,
  themeStyles,
  isHydrated
}) => {
  return (
    <div className="rounded-lg overflow-visible relative"> 
      {!isExpanded && (
        <div 
          className={`w-[90%] mx-auto py-2 px-3 flex items-center justify-between cursor-pointer hover:bg-slate-700/30 ${isHydrated ? themeStyles.taskStatusBar.background : 'bg-[#0F1E45]'}`}
          style={{
            borderRadius: '12px 12px 0px 0px'
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center flex-1 min-w-0">
              <span className={`text-sm ${isHydrated ? themeStyles.taskStatusBar.currentStepText : 'text-gray-300'}`}>
                {currentStep === 0 
                  ? 'Waiting for your input' 
                  : (
                    <>
                      Current Step: <span style={{ color: '#357BF7' }}>{taskSteps[currentStep - 1]?.name || 'Processing'}</span>
                    </>
                  )
                }
              </span>
            </div>
            
            {currentStep > 0 && taskTimeEstimates[currentStep] && (
              <span className="text-xs text-blue-300 flex-shrink-0">
                {taskTimeEstimates[currentStep].time}
              </span>
            )}
          </div>

          <button className="text-gray-400 hover:text-gray-200">
            <svg 
              className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-0' : 'rotate-180'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
      {/* 展开状态 - 使用绝对定位覆盖 */}
      {isExpanded && (
        <div 
          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 w-[90%] shadow-lg z-10 ${isHydrated ? themeStyles.taskStatusBar.background : 'bg-[#0F1E45]'}`}
          style={{
            borderRadius: '12px 12px 0px 0px'
          }}
        >
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Current Page Generation Step</span>
              <button 
                className="text-gray-400 hover:text-gray-200"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <svg 
                  className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-0' : 'rotate-180'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {/* 步骤列表 */}
            <div className="space-y-1">
              {taskSteps.map((step, index) => {
                const timeInfo = taskTimeEstimates[index + 1];
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between text-xs rounded px-2 py-1 ${
                      currentStep > index + 1 ? (isHydrated ? themeStyles.taskStatusBar.expandedContent.stepItem.activeText : 'text-gray-200') : 
                      currentStep === index + 1 ? (isHydrated ? themeStyles.taskStatusBar.expandedContent.stepItem.activeText : 'text-gray-200') : 
                      (isHydrated ? themeStyles.taskStatusBar.expandedContent.stepItem.inactiveText : 'text-gray-500')
                    }`}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      {/* 步骤指示器 */}
                      <div className="mr-2 flex items-center justify-center w-3 h-3 flex-shrink-0">
                        {currentStep > index + 1 ? (
                          <div className={`w-1.5 h-1.5 rounded-full ${isHydrated ? themeStyles.taskStatusBar.expandedContent.indicator.completed : 'bg-green-400'}`}></div>
                        ) : currentStep === index + 1 ? (
                          <div className={`w-2.5 h-2.5 border rounded-full animate-spin ${isHydrated ? themeStyles.taskStatusBar.expandedContent.indicator.current : 'border-blue-400/30 border-t-blue-400'}`}></div>
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full ${isHydrated ? themeStyles.taskStatusBar.expandedContent.indicator.pending : 'bg-gray-600'}`}></div>
                        )}
                      </div>
                      <span className="text-sm truncate">{step.name}</span>
                    </div>
                    {/* 时间显示 */}
                    {timeInfo && (
                      <span className={`text-xs flex-shrink-0 ml-1 ${
                        currentStep === index + 1 ? 
                          (isHydrated ? themeStyles.taskStatusBar.expandedContent.stepItem.timeActiveText : 'text-blue-300') : 
                          (isHydrated ? themeStyles.taskStatusBar.expandedContent.stepItem.timeInactiveText : 'text-gray-500')
                      }`}>
                        {timeInfo.time}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between">
              {/* 页面数量 */}
              <div className="flex items-center space-x-2">
                <span className={`text-xs ${isHydrated ? themeStyles.taskStatusBar.expandedContent.summary.text : 'text-gray-400'}`}>Up to 10 pages can be created in 1 task, you have generated</span>
                <div className="flex items-center">
                  <span className={`text-sm font-bold ${isHydrated ? themeStyles.taskStatusBar.expandedContent.summary.countText : 'text-gray-400'}`}>{browserTabs.length}</span>
                  <span className={`text-sm ml-1 ${isHydrated ? themeStyles.taskStatusBar.expandedContent.summary.countText : 'text-gray-400'}`}>/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// 核心研究工具组件，这是整个聊天页面的主要功能组件
const ResearchTool = ({ 
  conversationId = null, 
  mode = 'normal'
}) => {
  // 添加主题配置
  const { currentTheme, getThemeConfig, isHydrated } = useTheme();
  
  // 获取research-tool主题配置，提供fallback避免hydration不匹配
  const themeStyles = isHydrated ? getThemeConfig('researchTool') : {
    background: 'linear-gradient(180deg, #121826 0%, #030810 100%)'
  };

  const [apiDetailModal, setApiDetailModal] = useState({
    visible: false,
    data: null
  });
  const isRecoveryMode = mode === 'recover';
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  useEffect(() => {
    if (conversationId !== currentConversationId) {
      setCurrentConversationId(conversationId);
      setApiDetailModal({ visible: false, data: null });
      hasRestoredProgressRef.current = false;
      setCurrentWebsiteId(null); 
      setMainProduct(''); 
      setBrowserTabs([]); 
      setActiveTab(null); 
    }
  }, [conversationId]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSlogan, setShowSlogan] = useState(!isRecoveryMode);
  const pathname = usePathname(); 
  const hasShownWelcomeMessageRef = useRef(false);
  const [chatHistory, setChatHistory] = useState(null);
  const hasRestoredProgressRef = useRef(false);
  const isRestoringHistoryRef = useRef(false);
  const [isTaskListModalVisible, setIsTaskListModalVisible] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(isRecoveryMode);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isMessageSending, setIsMessageSending] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState('browser');
  const inputRef = useRef(null);
  const chatEndRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [canProcessCompetitors, setCanProcessCompetitors] = useState(false);
  const [browserTabs, setBrowserTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const messageHandler = useMemo(() => new MessageHandler(setMessages), [setMessages]);
  const [sseConnected, setSseConnected] = useState(false);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef(null);
  const htmlStreamRef = useRef(''); 
  const isStreamingRef = useRef(false);
  const currentStreamIdRef = useRef(null); 
  const lastLogCountRef = useRef(0);
  const [isProcessingTask, setIsProcessingTask] = useState(false);
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState("Enter product website URL to get started (e.g., example.com)");
  const placeholderIntervalRef = useRef(null); 
  const placeholderTimeoutRef = useRef(null);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
  });
  const filterMessageTags = (message) => {
    let filteredMessage = message;
    Object.entries(TAG_FILTERS).forEach(([tag, replacement]) => {
      filteredMessage = filteredMessage.replace(new RegExp(tag, 'g'), replacement);
    });
    return filteredMessage;
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); 
  const sidebarRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [taskSteps, setTaskSteps] = useState([
    { id: 1, name: "Find Competitors", gradient: "from-blue-500/40 to-cyan-500/40", borderColor: "border-blue-500/60", shadowColor: "shadow-blue-500/20" },
    { id: 2, name: "Select Competitor", gradient: "from-cyan-500/40 to-teal-500/40", borderColor: "border-cyan-500/60", shadowColor: "shadow-cyan-500/20" },
    { id: 3, name: "Analyze Competitor", gradient: "from-teal-500/40 to-green-500/40", borderColor: "border-teal-500/60", shadowColor: "shadow-teal-500/20" },
    { id: 4, name: "Page Generation", gradient: "from-green-500/40 to-lime-500/40", borderColor: "border-green-500/60", shadowColor: "shadow-green-500/20" },
  ]);
  const processedStepLogIdsRef = useRef(new Set());
  const startedTaskCountRef = useRef(0);
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });
  const [showBrandAssetsModal, setShowBrandAssetsModal] = useState(false);
  const [showCompetitorModal, setShowCompetitorModal] = useState(false);
  const [isBrowserSidebarOpen, setIsBrowserSidebarOpen] = useState(false);
  const [mainProduct, setMainProduct] = useState('');
  const [selectedCompetitors, setSelectedCompetitors] = useState([]);
  const [phImageAvailable, setPhImageAvailable] = useState(false);
  const [phCheckDone, setPhCheckDone] = useState(false);
  const [showTaskConflictModal, setShowTaskConflictModal] = useState(false);
  const [conflictingTask, setConflictingTask] = useState(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const iframeContainerRef = useRef(null);
  const taskTimeEstimates = {
    0: { name: 'Waiting for input of URL', time: 'please make your input', tip: "Please input the url like seopage.ai"},
    1: { name: "Find Competitors", time: "1-3 mins", tip: "Perfect time to grab a coffee ☕" },
    2: { name: "Select Competitor", time: "please make selection", tip: "Take your time to choose wisely 🤔" },
    3: { name: "Analyze Competitor", time: "3-5 mins", tip: "Great time to stretch or check emails 📧" },
    4: { name: "Page Generation", time: "2-3 mins", tip: "Almost done! You can close this tab if needed 🎉" },
  };
  const [messageCollapsed, setMessageCollapsed] = useState(() => ({}));
  const [isStatusBarExpanded, setIsStatusBarExpanded] = useState(false);
  const router = useRouter();
  const [isPublishPageModalVisible, setIsPublishPageModalVisible] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const processedLogIdsRef = useRef([]);
  const currentTextIndexRef = useRef(0); 
  const isDeletingRef = useRef(false); 
  const charIndexRef = useRef(0); 
  const sseReconnectNoticeTimeoutRef = useRef(null);
  const isShowingReconnectNoticeRef = useRef(false);
  const isFirstMessageSentForNewTaskRef = useRef(false);
  const apiDetailModalContentRef = useRef(null);
  const [currentWebsiteId, setCurrentWebsiteId] = useState(null);
  const [hubPageIds, setHubPageIds] = useState([]);
  const [deletePageConfirm, setDeletePageConfirm] = useState({ open: false, resultId: null, generatedPageId: null });
  
  
  // 页面类型判断，用于判断当前页面是哪个页面
  const getPageMode = () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('bestpage')) {
      return 'best';
    } else if (currentPath.includes('faqpage')) {
      return 'faq';
    } else if (currentPath.includes('alternativepage')) {
      return 'alternative';
    }
    return 'alternative';
  };





  const handleDeletePage = (pageId) => {
    setDeletePageConfirm({ 
      open: true, 
      resultId: pageId,
      generatedPageId: pageId
    });



    
    // 强制检查状态是否更新
    setTimeout(() => {
    }, 100);
  };



  const handleConfirmDelete = async () => {
    try {
      messageApi.loading({ content: 'Deleting page...', key: 'deletePage', duration: 0 });
      
      const result = await apiClient.deleteAlternativeResult(deletePageConfirm.resultId);
      
      messageApi.destroy('deletePage');
      
      // 判断删除是否成功
      if (result && (result.success || result.code === 200 || result.status === 'success')) {
        messageApi.success('Page deleted successfully');
        
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
        }, 1000); // 延迟1秒后刷新，让用户看到成功消息
      } else {
        messageApi.error('Failed to delete page: Unexpected response');
        console.error('Unexpected delete response:', result);
      }
    } catch (error) {
      console.error('Delete operation failed:', error);
      messageApi.destroy('deletePage');
      messageApi.error('Delete page failed: ' + error.message);
    } finally {
      setDeletePageConfirm({ open: false, resultId: null, generatedPageId: null });
    }
  };

  const processedTipMessagesRef = useRef(new Set());

  const filterLogContent = (content) => {
    if (!content) return '';
    let filteredContent = String(content);
  
    filteredContent = filteredContent.replace(
      /<details.*?>\s*<summary>\s*Thinking\.\.\.\s*<\/summary>(.*?)<\/details>/gs, 
      (match, thinkingContent) => {
        const formattedThinking = thinkingContent
          .replace(/\.([\s\u00A0]+)/g, '. <br />')
          .replace(/\n/g, '<br />')
          .trim();
        return `<div class="thinking-block p-2 my-2 bg-gray-100 rounded text-xs text-gray-600">
                  <div class="font-medium mb-1">Thinking Process:</div>
                  <div>${formattedThinking}</div>
                </div>`;
      }
    );
    
    filteredContent = filteredContent.replace(
      /Action:\s*(.*?)(?=Thought:|<details|$)/gs,
      (match, actionContent) => {
        const formattedAction = actionContent.trim();
        if (!formattedAction) return '';
        
        return `<div class="action-block p-2 my-2 bg-blue-50 rounded text-xs text-blue-600">
                  <div class="font-medium mb-1">Executing:</div>
                  <div>${formattedAction}</div>
                </div>`;
      }
    );
    
    filteredContent = filteredContent.replace(
      /Thought:\s*(.*?)(?=Action:|<details|$)/gs,
      (match, thoughtContent) => {
        const formattedThought = thoughtContent.trim();
        if (!formattedThought) return '';
        
        return `<div class="thought-block p-2 my-2 bg-purple-50 rounded text-xs text-purple-600">
                  <div class="font-medium mb-1">Thought:</div>
                  <div>${formattedThought}</div>
                </div>`;
      }
    );
    
    filteredContent = filteredContent.replace(
      /\{\s*"action":\s*"(.*?)"\s*,\s*"action_input":\s*"(.*?)"\s*\}/gs,
      (match, action, actionInput) => {
        return `<div class="json-action-block p-2 my-2 bg-green-50 rounded text-xs text-green-600">
                  <div class="font-medium mb-1">Action: ${action}</div>
                  <div>${actionInput}</div>
                </div>`;
      }
    );
    
    filteredContent = filteredContent.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    return filteredContent;
  };

  useEffect(() => {
    if (apiDetailModal.visible && apiDetailModalContentRef.current) {
      setTimeout(() => {
        if (apiDetailModalContentRef.current) {
          apiDetailModalContentRef.current.scrollTop = apiDetailModalContentRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [apiDetailModal.visible, logs, apiDetailModal.data]); 
  
  const combinedMessages = useMemo(() => {
    // 首先处理所有thinking log类型的消息，按hub_page_id分组（排除Codes）
    const thinkingLogsByHubPageId = new Map();

    // 1. 处理API类型的logs
    const apiLogs = logs.filter(log => log.type === 'API');
    apiLogs.forEach(log => {
      const hubPageId = log.content?.hub_page_id || 'default';
      if (!thinkingLogsByHubPageId.has(hubPageId)) {
        thinkingLogsByHubPageId.set(hubPageId, []);
      }
      thinkingLogsByHubPageId.get(hubPageId).push({
        id: `thinking-log-api-${log.id}`,
        type: 'thinking-log-item',
        logType: log.type,
        content: log.content,
        step: log.step,
        timestamp: log.timestamp,
        source: 'system',
        originalLogId: log.id
      });
    });

    // 2. 处理Agent消息
    const agentMessageMap = new Map();
    logs.forEach(log => {
      if (log.type === 'Agent' && log.content) {
        try {
          const content = log.content;
          if (content.organic_data) {
            const organicData = typeof content.organic_data === 'string'
              ? JSON.parse(content.organic_data)
              : content.organic_data;

            if (organicData.event === 'agent_message') {
              const { message_id, answer } = organicData;
              const filteredAnswer = filterLogContent(answer);
              const hubPageId = content.hub_page_id || 'default';

              // 根据step类型确定logType
              let agentLogType = 'Agent';
              if (content.step === 'FIND_COMPETITORS_AGENT') {
                agentLogType = 'CompetitorsAgent';
              } else if (content.step === 'FIND_WEBSITE_SITEMAP_AGENT') {
                agentLogType = 'SitemapAgent';
              }

              if (!thinkingLogsByHubPageId.has(hubPageId)) {
                thinkingLogsByHubPageId.set(hubPageId, []);
              }

              if (!agentMessageMap.has(message_id)) {
                const agentMessage = {
                  id: message_id,
                  type: 'thinking-log-item',
                  logType: agentLogType,
                  content: filteredAnswer,
                  timestamp: log.timestamp,
                  source: 'system',
                  hubPageId: hubPageId
                };
                agentMessageMap.set(message_id, agentMessage);
                thinkingLogsByHubPageId.get(hubPageId).push(agentMessage);
              } else {
                const existingLog = agentMessageMap.get(message_id);
                existingLog.content += filteredAnswer;
              }
            }
          }
        } catch (error) {
          console.error('Error processing Agent log content:', error, 'Original log:', log);
        }
      }
    });

    // 3. 处理HTML消息
    const htmlLogs = logs.filter(log => log.type === 'Html');
    htmlLogs.forEach(log => {
      const hubPageId = log.content?.hub_page_id || 'default';
      
      if (!thinkingLogsByHubPageId.has(hubPageId)) {
        thinkingLogsByHubPageId.set(hubPageId, []);
      }
      
      const htmlItem = {
        id: `thinking-log-html-${log.id}`,
        type: 'thinking-log-item',
        logType: log.type,
        content: log.content,
        step: log.step,
        timestamp: log.timestamp,
        source: 'system',
        originalLogId: log.id
      };
      
      thinkingLogsByHubPageId.get(hubPageId).push(htmlItem);
    });

    // 4. 处理Color消息
    const colorLogs = logs.filter(log => log.type === 'Color');
    colorLogs.forEach(log => {
      const hubPageId = log.content?.hub_page_id || 'default';
      if (!thinkingLogsByHubPageId.has(hubPageId)) {
        thinkingLogsByHubPageId.set(hubPageId, []);
      }
      thinkingLogsByHubPageId.get(hubPageId).push({
        id: `thinking-log-color-${log.id}`,
        type: 'thinking-log-item',
        logType: log.type,
        content: log.content,
        step: log.step,
        timestamp: log.timestamp,
        source: 'system',
        originalLogId: log.id
      });
    });

    // 5. 处理Crawler_Images消息
    const crawlerImagesLogs = logs.filter(log => log.type === 'Crawler_Images');
    crawlerImagesLogs.forEach(log => {
      const hubPageId = log.content?.hub_page_id || 'default';
      if (!thinkingLogsByHubPageId.has(hubPageId)) {
        thinkingLogsByHubPageId.set(hubPageId, []);
      }
      thinkingLogsByHubPageId.get(hubPageId).push({
        id: `thinking-log-crawler-images-${log.id}`,
        type: 'thinking-log-item',
        logType: log.type,
        content: log.content,
        step: log.step,
        timestamp: log.timestamp,
        source: 'system',
        originalLogId: log.id
      });
    });

    // 6. 处理Crawler_Headers消息
    const crawlerHeadersLogs = logs.filter(log => log.type === 'Crawler_Headers');
    crawlerHeadersLogs.forEach(log => {
      const hubPageId = log.content?.hub_page_id || 'default';
      if (!thinkingLogsByHubPageId.has(hubPageId)) {
        thinkingLogsByHubPageId.set(hubPageId, []);
      }
      thinkingLogsByHubPageId.get(hubPageId).push({
        id: `thinking-log-crawler-headers-${log.id}`,
        type: 'thinking-log-item',
        logType: log.type,
        content: log.content,
        step: log.step,
        timestamp: log.timestamp,
        source: 'system',
        originalLogId: log.id
      });
    });

    // 7. 处理Crawler_Footers消息
    const crawlerFootersLogs = logs.filter(log => log.type === 'Crawler_Footers');
    crawlerFootersLogs.forEach(log => {
      const hubPageId = log.content?.hub_page_id || 'default';
      if (!thinkingLogsByHubPageId.has(hubPageId)) {
        thinkingLogsByHubPageId.set(hubPageId, []);
      }
      thinkingLogsByHubPageId.get(hubPageId).push({
        id: `thinking-log-crawler-footers-${log.id}`,
        type: 'thinking-log-item',
        logType: log.type,
        content: log.content,
        step: log.step,
        timestamp: log.timestamp,
        source: 'system',
        originalLogId: log.id
      });
    });

    // 8. 处理Dify消息 - 需要按hubPageId和logType进行合并
    const difyLogs = logs.filter(log => log.type === 'Dify');
    const difyGroupMap = new Map(); // 用于合并相同hubPageId和logType的Dify消息
    
    difyLogs.forEach(log => {
      let difyContent = null;
      try {
        difyContent = typeof log.content === 'string' ? JSON.parse(log.content) : log.content;
      } catch (e) {
        console.error('Failed to parse Dify content:', e);
        return;
      }

      // 如果是FIND_COMPETITORS_AGENT步骤，跳过这个日志
      if (difyContent?.step === 'FIND_COMPETITORS_AGENT' || difyContent?.step === 'FIND_WEBSITE_SITEMAP_AGENT') {
        return;
      }

      const hubPageId = difyContent?.hub_page_id || 'default';
      const groupKey = `${hubPageId}-${log.type}`; // 使用hubPageId和type作为合并key
      
      if (!thinkingLogsByHubPageId.has(hubPageId)) {
        thinkingLogsByHubPageId.set(hubPageId, []);
      }

      if (!difyGroupMap.has(groupKey)) {
        // 创建新的Dify组
        const difyGroup = {
          id: `thinking-log-dify-group-${groupKey}`,
          type: 'thinking-log-item',
          logType: log.type,
          content: [log.content], // 存储为数组以便合并
          step: log.step,
          timestamp: log.timestamp,
          source: 'system',
          originalLogIds: [log.id], // 存储所有原始ID
          isGroup: true,
          items: [log] // 存储原始日志项
        };
        difyGroupMap.set(groupKey, difyGroup);
        thinkingLogsByHubPageId.get(hubPageId).push(difyGroup);
      } else {
        // 合并到现有组
        const existingGroup = difyGroupMap.get(groupKey);
        existingGroup.content.push(log.content);
        existingGroup.originalLogIds.push(log.id);
        existingGroup.items.push(log);
        // 更新时间戳为最新的
        if (new Date(log.timestamp) > new Date(existingGroup.timestamp)) {
          existingGroup.timestamp = log.timestamp;
        }
      }
    });

    // 9. 单独处理Codes消息 - 不参与thinking log分组
    const codesLogs = logs.filter(log => log.type === 'Codes');
    const codesMessages = codesLogs.map(log => ({
      id: `codes-message-${log.id}`,
      type: 'codes-completion',
      logType: log.type,
      content: `Page generation completed successfully! Your new page is ready.`,
      timestamp: log.timestamp,
      source: 'system',
      originalLog: log, // 保留原始数据以便View查看
      resultId: log.content?.resultId // 用于关联browser tab
    }));

    const thinkingLogGroups = [];
    thinkingLogsByHubPageId.forEach((items, hubPageId) => {
      if (items.length > 0) {
        
        // 按时间排序组内项目
        items.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // 创建群组消息
        thinkingLogGroups.push({
          id: `thinking-log-group-${hubPageId}`,
          type: 'thinking-log-group',
          hubPageId: hubPageId,
          items: items,
          timestamp: items[0].timestamp, // 使用最早的时间戳作为组的时间戳
          source: 'system'
        });
      }
    });

    // 合并messages、thinkingLogGroups和codesMessages，按时间排序
    const combined = [...messages, ...thinkingLogGroups, ...codesMessages];
    combined.sort((a, b) => {
      if (a.isThinking && !b.isThinking) return 1;
      if (!a.isThinking && b.isThinking) return -1;

      const timeA = new Date(a.timestamp || a.createdAt || 0);
      const timeB = new Date(b.timestamp || b.createdAt || 0);
      return timeA - timeB;
    });

    return combined;
  }, [messages, logs]);

  const fetchHistories = async () => {
    if (!isRecoveryMode || !currentConversationId) return;
    setLoading(true);
    try {
      const chatRes = await apiClient.getAlternativeChatHistory(currentConversationId);

      if (chatRes?.data) {
        // 处理新的数据结构
        const chatHistory = chatRes.data.chatHistory || [];
        const sseMessages = chatRes.data.sseMessage || [];
        
        // 设置聊天历史
        const filteredChatHistory = {
          ...chatRes,
          data: chatHistory.map(item => ({
            ...item,
          }))
        };
        setChatHistory(filteredChatHistory);
        
        // 处理 SSE 消息作为日志
        const logMap = new Map();
        sseMessages.forEach(log => {
          const logId = log.id;
          if (logMap.has(logId)) {
            const existing = logMap.get(logId);
            existing.content = [existing.content, log.content].join(' ');
            if (new Date(log.timestamp) < new Date(existing.earliestTimestamp)) {
              existing.earliestTimestamp = log.timestamp;
            }
          } else {
            logMap.set(logId, {
              ...log,
              earliestTimestamp: log.timestamp 
            });
          }
        });

      const getTypePriority = (type) => {
        switch (type) {
          case 'Dify': return 1;
          case 'Crawler_Images': return 2;
          case 'Crawler_Headers': return 3;
          case 'Crawler_Footers': return 4;
          case 'Color': return 5;           
          case 'Crawler_Deep': return 6;    
          case 'Codes': return 7;    
          case 'Html': return 100;       
          default: return 10;              
        }
      };

      const processedLogs = Array.from(logMap.values())
        .sort((a, b) => {
          const timeComparison = new Date(a.earliestTimestamp) - new Date(b.earliestTimestamp);
            if (timeComparison === 0) {
              return getTypePriority(a.type) - getTypePriority(b.type);
            }
            return timeComparison;
          });

        setLogs(processedLogs);
        if (chatHistory.length > 0) {
          setMainProduct(chatHistory[chatHistory.length - 1].message);
        }
        setShouldConnectSSE(true);
      }
    } catch (err) {
      console.error('Failed to fetch histories:', err);
    } finally {
      setLoading(false); 
    }
  };

  const isJsonArrayMessage = (message) => {
    try {
      const parsed = JSON.parse(message);
      return Array.isArray(parsed) && 
            parsed.length > 0 && 
            parsed.every(item => 
              item && 
              typeof item === 'object' &&
              item.hasOwnProperty('name') && 
              item.hasOwnProperty('url') && 
              item.hasOwnProperty('description')
            );
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (isRecoveryMode && currentConversationId) {
      fetchHistories();
    }
  }, [isRecoveryMode, currentConversationId]);

  useEffect(() => {
    if (isRecoveryMode) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [isRecoveryMode]);

  useEffect(() => {
    if (!isRecoveryMode || !chatHistory || !Array.isArray(chatHistory.data)) return;
    
    if (isRecoveryMode && chatHistory && Array.isArray(chatHistory.data)){
      if (isFirstMessageSentForNewTaskRef.current) {
        isFirstMessageSentForNewTaskRef.current = false; 
        return; 
      }

      isRestoringHistoryRef.current = true;
      const sorted = [...chatHistory.data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      const restoredMessages = [];
      sorted.forEach(item => {
        if (item.message) {
          restoredMessages.push({
            source: 'user',
            content: item.message,
            timestamp: typeof item.createdAt === 'string' ? item.createdAt : new Date(item.createdAt).toISOString(),
          });
        }
        if (item.answer) {
          restoredMessages.push({
            content: item.answer,
            timestamp: typeof item.createdAt === 'string' ? item.createdAt : new Date(item.createdAt).toISOString(),
          });
        }
      });

      setMessages(restoredMessages);

      setTimeout(() => { isRestoringHistoryRef.current = false; }, 500);
    }
  }, [chatHistory, isRecoveryMode]);

  useEffect(() => {
    if (
      hasRestoredProgressRef.current ||
      !chatHistory || !Array.isArray(chatHistory.data) || logs.length === 0
    ) return;

    // 新增：检查 browserTabs 是否已经根据 logs 正确初始化
    const expectedBrowserTabsCount = logs.filter(log => 
      log.type === 'Codes' && log.content?.resultId
    ).length;
    
    // 如果有 Codes 日志但 browserTabs 还没有相应的数量，说明还在初始化中，等待下次执行
    if (expectedBrowserTabsCount > 0 && browserTabs.length !== expectedBrowserTabsCount) {
      return;
    }

    let step = 1;
    setIsProcessingTask(false);
  
    const validDialogCount = chatHistory.data.filter(item => item.message || item.answer).length;
    if (validDialogCount >= 2) {
      step = 2;
      setIsProcessingTask(false);
    }
  
    // 检查Dify日志并判断是否有失败状态
    const hasDify = logs.some(
      log => log.type === 'Dify' && log.content && log.content.step === 'PAGE_GENERATION_AGENT'
    );
  
    // 检查是否有失败的Dify日志
    const hasFailedDify = logs.some(
      log => log.type === 'Dify' && 
      log.content && 
      log.content.step === 'PAGE_GENERATION_AGENT' &&
      log.content.data &&
      (log.content.data.status === 'failed' || 
       log.content.data.status === 'error' ||
       log.content.data.error === 'timed out')
    );
  
    const hasHtml = logs.some(log => log.type === 'Html');
    
    // 检查最新的聊天消息是否包含错误提示
    let hasErrorMessage = false;
    if (chatHistory && chatHistory.data && chatHistory.data.length > 0) {
      const lastMessage = chatHistory.data[0];
      if (lastMessage && lastMessage.message && 
          lastMessage.message.includes("I encountered an error. Please return the sitemap")) {
        hasErrorMessage = true;
      }
    }
    
    if (hasFailedDify || hasErrorMessage) {
      setIsProcessingTask(false);
    } else if (hasDify && !hasHtml && !hasErrorMessage) {
      step = 3;
      setIsProcessingTask(true);
    }
  
    const hasCodes = logs.some(log => log.type === 'Codes');
    if (hasHtml && !hasCodes && !hasErrorMessage) {
      step = 4;
      setIsProcessingTask(true);
    }
  
    if (logs.length > 0) {
      const sortedLogs = [...logs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const lastLog = sortedLogs[sortedLogs.length - 1];
      const codesCount = logs.filter(log => log.type === 'Codes').length;

      if (browserTabs.length < 10 && (
        (lastLog.type === 'Codes') || 
        (codesCount === browserTabs.length && browserTabs.length > 0)
      )) {
        step = 2;
        setIsProcessingTask(false);
      }
    }

    if (chatHistory.data.length > 0) {
      const lastUserMessage = chatHistory.data[chatHistory.data.length - 1];
      if (lastUserMessage.message.includes('Current page generation is finished, move me to next step, tell me what i can do next')) {
        step = 2;
        setIsProcessingTask(false);
      }
    }
  
    setCurrentStep(step);
    
    if (browserTabs.length === 0) {
      if (step === 3 || step === 4) {
        startedTaskCountRef.current = 1;
      } else if (step < 3) {
        startedTaskCountRef.current = 0;
      }
    } else {
      if (step === 3 || step === 4) {
        startedTaskCountRef.current = browserTabs.length + 1;
      } else if (step < 3) {
        startedTaskCountRef.current = browserTabs.length;
      }
    }
    hasRestoredProgressRef.current = true;

    setTimeout(async () => {
      const isAvailable = await checkSitemapDataAvailable(mainProduct, localStorage.getItem('currentProductUrl') || '');
      if (isAvailable) {
        messageHandler.addGenerateSitemapButtonMessage(async () => {
          const userInputUrl = localStorage.getItem('currentProductUrl') || '';
          await handleWebsiteSitemapProcess(mainProduct, userInputUrl, currentConversationId, true);
        });
      }
    }, 500);
  }, [chatHistory, logs, browserTabs]);

  useEffect(() => {
    if (
      !isRecoveryMode ||
      !chatHistory ||
      !Array.isArray(chatHistory.data) ||
      !currentConversationId ||
      logs.length === 0
    ) {
      return;
    }

    // 检查生成的页面数是否小于10
    if (browserTabs.length >= 10) {
      return;
    }
  
    // 检查聊天记录数量（需要有多条记录，说明不是初次使用）
    if (chatHistory.data.length <= 1) {
      return;
    }

    if (isProcessingTask) {
      return;
    }

    const lastChatMessage = chatHistory.data[chatHistory.data.length - 1];
    
    if (!lastChatMessage) return;
    
    // 生成一个唯一ID来标识这条消息
    const messageId = `${lastChatMessage.id || ''}-${lastChatMessage.createdAt || Date.now()}`;
    
    // 检查这条消息是否已经处理过
    if (processedTipMessagesRef.current.has(messageId)) {
      return; // 已处理过，直接返回
    }

    // 检查是否是完成页面生成的消息
    const hasPageGeneratedMessage = lastChatMessage?.message?.includes('Current page generation is finished, move me to next step, tell me what i can do next');
    if (hasPageGeneratedMessage) {
      return;
    }

    // 检查是否是竞争对手列表
    let hasCompetitorListMessage = false;
    if (lastChatMessage?.message) {
      try {
        const parsed = JSON.parse(lastChatMessage.message);
        hasCompetitorListMessage = Array.isArray(parsed) && parsed.length > 0;
      } catch (e) {
        hasCompetitorListMessage = false;
      }
    }

    // 如果是竞争对手列表，添加提示并记录已处理
    if (hasCompetitorListMessage) {
      // 记录这条消息已经处理过
      processedTipMessagesRef.current.add(messageId);
      return;
    }

    retryCountRef.current = 0; 
    setShouldConnectSSE(true); 
  }, [isRecoveryMode, chatHistory, logs, browserTabs, currentConversationId, apiClient, messageHandler]);

  useEffect(() => {
    const updateSize = () => {
      if (iframeContainerRef.current) {
        const rect = iframeContainerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    // 立即执行一次
    updateSize();
    
    // 多次延时执行确保容器完全渲染
    const timeoutIds = [
      setTimeout(updateSize, 100),
      setTimeout(updateSize, 300), // 新增
      setTimeout(updateSize, 500), // 新增
    ];
    
    // 监听窗口大小变化
    window.addEventListener('resize', updateSize);
    
    // 使用MutationObserver监听DOM变化（可选）
    let observer;
    if (iframeContainerRef.current) {
      observer = new MutationObserver(() => {
        setTimeout(updateSize, 50);
      });
      observer.observe(iframeContainerRef.current.parentNode, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
    
    // 监听右侧面板切换
    let rafId;
    if (rightPanelTab === 'browser') {
      rafId = requestAnimationFrame(() => {
        updateSize();
        // 额外延时更新确保准确性
        setTimeout(updateSize, 200);
      });
    }
    
    return () => {
      window.removeEventListener('resize', updateSize);
      timeoutIds.forEach(id => clearTimeout(id));
      if (observer) observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [rightPanelTab, isBrowserSidebarOpen]); // 新增isBrowserSidebarOpen依赖

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        await Promise.race([
          fetch('https://api.producthunt.com/v1/docs', { 
            signal: controller.signal,
            mode: 'no-cors' 
          }),
          fetch('https://www.google.com/404__test', {
            signal: controller.signal,
            mode: 'no-cors'
          })
        ]);
        
        clearTimeout(timeoutId);
        setPhImageAvailable(true);
      } catch (error) {
        setPhImageAvailable(false);
      } finally {
        setPhCheckDone(true);
      }
    };
  
    checkNetwork();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlParamValue = urlParams.get('url');
      if (urlParamValue) {
        urlParams.delete('url');
        const newSearch = urlParams.toString();
        const newUrl =
          window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('alternativelyIsLoggedIn') === 'true';
      setIsUserLoggedIn(loggedIn);
      
      // 移除自动填充逻辑，保持输入框为空
      setUserInput('');
    };
    
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [isRecoveryMode]);

  const [shouldConnectSSE, setShouldConnectSSE] = useState(false);

  useEffect(() => {
    lastLogCountRef.current = logs.length;
  }, [logs, rightPanelTab]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.source !== 'system' && !lastMessage.isThinking) {
      }
    }
  }, [messages]);

  useEffect(() => {
    if (!isRecoveryMode && messages.length === 0 && !hasShownWelcomeMessageRef.current) {
      hasShownWelcomeMessageRef.current = true;
    }
  }, [isRecoveryMode, messages.length, messageHandler]);

  // 添加一个状态来跟踪用户是否手动操作过右侧面板
  const [hasUserManuallyClosedPanel, setHasUserManuallyClosedPanel] = useState(false);
  const [hasAutoOpenedOnce, setHasAutoOpenedOnce] = useState(false);

  // 监听messages变化，只在首次检测到生成页面时自动打开面板
  useEffect(() => {
    const pagesGridMessage = messages.find(msg => msg.type === 'pages-grid');
    
    if (pagesGridMessage && pagesGridMessage.pages) {
      // 检查是否有已生成的页面
      const hasGeneratedPages = pagesGridMessage.pages.some(page => page.isPageGenerated);
      
      // 只在首次检测到生成页面，且用户没有手动关闭过面板，且面板当前是关闭状态时自动打开
      if (hasGeneratedPages && !hasUserManuallyClosedPanel && !isBrowserSidebarOpen && !hasAutoOpenedOnce) {
        setIsBrowserSidebarOpen(true);
        setHasAutoOpenedOnce(true);
      }
    }
  }, [messages, isBrowserSidebarOpen, hasUserManuallyClosedPanel, hasAutoOpenedOnce]);

  // 监听browserTabs变化，只在首次加载历史数据时自动打开面板
  useEffect(() => {
    // 只在首次加载时（有browserTabs但用户没有手动关闭过且还没有自动打开过）自动打开
    if (browserTabs.length > 0 && !hasUserManuallyClosedPanel && !isBrowserSidebarOpen && !hasAutoOpenedOnce) {
      setIsBrowserSidebarOpen(true);
      setHasAutoOpenedOnce(true);
    }
  }, [browserTabs.length, isBrowserSidebarOpen, hasUserManuallyClosedPanel, hasAutoOpenedOnce]);

  const handleCloseTaskList = () => {
    setIsTaskListModalVisible(false);
  };

  const linkifyDomains = (text) => {
    return text.replace(
      /\b(?:https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b(?![^<]*>)/g,
      (match) => {
        const href = match.startsWith('http') ? match : `https://${match}`;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:#60a5fa;text-decoration:underline;">${match}</a>`;
      }
    );
  };

  const handleCompetitorSelect = useCallback((competitor) => {
    if (isProcessingTask) {
      messageApi.info('Please wait for the current step to finish before adding more competitors!');
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
      // 检查是否已经存在相同的hubPageId
      const exists = prev.some(c => c.hubPageId === competitor.hubPageId);
      
      // 根据是否存在决定添加或删除
      const newCompetitors = exists 
        ? prev.filter(c => c.hubPageId !== competitor.hubPageId)
        : [...prev, competitor];
      
      return newCompetitors;
    });
  
    // 自动聚焦逻辑保持不变
    requestAnimationFrame(() => {
      if (inputRef.current?.focus) {
        inputRef.current.focus();
        const textarea = document.querySelector('textarea[name="no-autofill"]');
        textarea?.focus();
      }
    });
  }, [isProcessingTask]);

  const removeCompetitor = useCallback((hubPageId) => {
    setSelectedCompetitors(prev => prev.filter(c => c.hubPageId !== hubPageId));
    setHubPageIds(prev => prev.filter(id => id !== hubPageId));
  }, []);

  const [thinkingLogExpanded, setThinkingLogExpanded] = useState({});
  const [editingPage, setEditingPage] = useState(null);

  const handleEditPage = (page) => {
    setEditingPage(page);
    setCompetitorModalMode('edit'); 
    setShowCompetitorModal(true);
  };

  const renderChatMessage = (message, index) => {
    if (message.type === 'thinking-log-group') {
      const isExpanded = thinkingLogExpanded[message.id] !== false;
      
      const getDisplayTitle = (logType, step, itemsLength) => {
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
                className={`px-4 py-3 w-full hover:shadow-slate-500/20 transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl ${isHydrated ? themeStyles.agentProcessing.background : 'bg-white/[0.04]'} ${isHydrated ? themeStyles.agentProcessing.border : 'border-white/[0.05]'} border`}
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
                    <span className={`${isHydrated ? themeStyles.agentProcessing.titleText : 'text-white'} font-medium text-sm`}>
                      Agent Processing
                    </span>
                  </div>
                </div>

                {/* 展开的内容 */}
                {isExpanded && (
                  <div className="space-y-2 border-t border-gray-600/30 pt-3">
                    {message.items.map((item, itemIndex) => {
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
                                <circle cx="7.5" cy="7" r="6.5" stroke="#8C8C8C"/>
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
                              if(!isBrowserSidebarOpen) {
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
                              e.target.style.color = '#357BF7';
                              // 也需要更新箭头的颜色
                              const arrow = e.target.querySelector('span');
                              if (arrow) arrow.style.color = '#357BF7';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = '#8C8C8C';
                              // 恢复箭头的颜色
                              const arrow = e.target.querySelector('span');
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
      const getDisplayTitle = (logType, step, itemsLength) => {
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
                className={`px-3 py-2 w-full hover:shadow-slate-500/20 transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl ${isHydrated ? themeStyles.agentProcessing.background : 'bg-white/[0.04]'} ${isHydrated ? themeStyles.agentProcessing.border : 'border-white/[0.05]'} border`}
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
                          e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                          e.target.style.color = 'rgba(255, 255, 255, 0.70)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(255, 255, 255, 0.10)';
                          e.target.style.color = 'rgba(255, 255, 255, 0.50)';
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
                {message.content.split('\n').map((line, i) => (
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
                  border: isHydrated ? themeStyles.successMessage.border : '1px solid rgba(34, 197, 94, 0.2)',
                  background: isHydrated ? themeStyles.successMessage.background : 'rgba(34, 197, 94, 0.1)',
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* 成功图标 */}
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full ${isHydrated ? themeStyles.successMessage.iconBackground : 'bg-green-500'} flex items-center justify-center`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    
                    {/* 消息内容 */}
                    <span className={`${isHydrated ? themeStyles.successMessage.text : 'text-green-300'} font-medium text-sm`}>
                      {message.content}
                    </span>
                  </div>
                  
                  {/* View按钮 */}
                  <button
                    onClick={() => {
                      if(!isBrowserSidebarOpen) {
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
                      background: isHydrated ? themeStyles.successMessage.buttonBackground : 'rgba(34, 197, 94, 0.2)',
                      border: 'none',
                      color: isHydrated ? themeStyles.successMessage.buttonText : 'rgba(34, 197, 94, 0.8)',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = isHydrated ? themeStyles.successMessage.buttonHoverBackground : 'rgba(34, 197, 94, 0.3)';
                      e.target.style.color = isHydrated ? themeStyles.successMessage.buttonHoverText : 'rgba(34, 197, 94, 1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = isHydrated ? themeStyles.successMessage.buttonBackground : 'rgba(34, 197, 94, 0.2)';
                      e.target.style.color = isHydrated ? themeStyles.successMessage.buttonText : 'rgba(34, 197, 94, 0.8)';
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
            className={`group relative px-8 py-4 ${isHydrated ? `${themeStyles.sitemapButton.backgroundClass} ${themeStyles.sitemapButton.hoverBackgroundClass}` : 'bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-blue-700/90 hover:from-blue-500/95 hover:via-indigo-500/95 hover:to-blue-600/95'} 
                       ${isHydrated ? themeStyles.sitemapButton.text : 'text-white'} font-bold text-base rounded-xl 
                       ${isHydrated ? themeStyles.sitemapButton.shadow : 'shadow-xl hover:shadow-2xl hover:shadow-blue-500/25'} 
                       transition-all duration-300 
                       transform hover:scale-105 hover:-translate-y-1 
                       backdrop-blur-sm overflow-hidden
                       animate-pulse hover:animate-none`}
            style={{
              background: isHydrated ? themeStyles.sitemapButton.background : 'linear-gradient(285.22deg, rgba(59, 130, 246, 0.15) 44.35%, rgba(150, 56, 7, 0.8) 92.26%)'
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
            <div className={`absolute inset-0 ${isHydrated && themeStyles.sitemapButton.background.includes('purple') ? 'bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-purple-400/20' : 'bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-blue-400/20'} 
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
                            ${isHydrated && themeStyles.sitemapButton.background.includes('purple') ? 'bg-gradient-to-r from-transparent via-purple-300 to-transparent' : 'bg-gradient-to-r from-transparent via-blue-300 to-transparent'} 
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
                className={`p-4 rounded-2xl text-sm ${isHydrated ? themeStyles.systemMessage.background : 'bg-slate-800/80'} ${isHydrated ? themeStyles.systemMessage.text : 'text-white'} ${isHydrated ? themeStyles.systemMessage.shadow : 'shadow-xl'} backdrop-blur-sm
                         border ${isHydrated ? themeStyles.systemMessage.border : 'border-slate-600/40'} rounded-tl-none
                         ${isHydrated ? themeStyles.systemMessage.hoverShadow : 'hover:shadow-slate-500/20'} transition-all duration-300 transform hover:-translate-y-0.5`}
                style={{
                  maxWidth: '800px',
                }}
              >
                <div className="flex items-start gap-3">
                  <InfoCircleOutlined className={`${isHydrated ? themeStyles.systemMessage.iconColor : 'text-slate-400'} text-lg mt-0.5 flex-shrink-0`} />
                  <span className="leading-relaxed">
                    {message.content.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < message.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              </div>
              <div className={`absolute -left-1 top-0 w-2 h-2 ${isHydrated ? themeStyles.systemMessage.background : 'bg-slate-800/80'} transform rotate-45`}></div>
            </div>
            <div className={`text-[10px] ${isHydrated ? themeStyles.systemMessage.timestampColor : 'text-slate-400'} mt-1 ml-2`}>
              {new Date(message.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      );
    }
    
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
          style={{animation: 'fadeIn 0.5s ease-out forwards'}}
        >
          <div className="flex max-w-[80%] flex-col items-end">
            <div className="relative">
              <div className={`p-4 text-sm backdrop-blur-sm
                transition-all duration-500
                transform hover:-translate-y-1 hover:scale-[1.02]
                ${isHydrated ? themeStyles.userMessage.text : 'text-white'}
                ${isHydrated ? themeStyles.userMessage.background : 'bg-white/10'}
                relative overflow-hidden rounded-xl`}
                style={{
                  maxWidth: '350px', 
                  wordWrap: 'break-word'
                }}>
                <div className="relative z-10">
                {filterMessageTags(message.content).split('\n').map((line, i) => (
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
        <div key={`${index}-pages`} className="flex justify-start mb-4" style={{animation: 'fadeIn 0.5s ease-out forwards'}}>
          <div className="max-w-[95%] w-full">
            {/* Title section - more compact */}
            <div className={`mb-2 text-2xs font-medium pl-3 py-1 rounded-r-md ${
              isHydrated ? `${themeStyles.pagesGrid.title.text} ${themeStyles.pagesGrid.title.background} ${themeStyles.pagesGrid.title.border}` : 'text-slate-300 bg-slate-800/20 border-l-2 border-slate-500'
            }`}>
              Found <span className={`font-bold ${isHydrated ? themeStyles.pagesGrid.title.highlight : 'text-slate-200'}`}>{message.pages.length}</span> potential {message.pageType ? `${message.pageType} ` : ""}content pages
            </div>
            
            {/* More compact list layout */}
            <div className="flex flex-col gap-1.5">
              {message.pages.map((page, idx) => (
                <div
                  key={page.hubPageId || `page-${idx}`}
                  className="group transition-all duration-200 hover:shadow-lg"
                  style={{
                    borderRadius: isHydrated ? themeStyles.pagesGrid.pageCard.borderRadius : '12px',
                    border: (() => {
                      const isSelected = selectedCompetitors.some(c => c.hubPageId === page.hubPageId);
                      if (isSelected) {
                        return isHydrated ? themeStyles.pagesGrid.pageCard.borderSelected : '1px solid var(--Color-, #357BF7)';
                      }
                      return isHydrated ? themeStyles.pagesGrid.pageCard.border : '1px solid transparent';
                    })(),
                    background: isHydrated ? themeStyles.pagesGrid.pageCard.background : '#292F3B',
                    padding: '16px'
                  }}
                  onMouseEnter={(e) => {
                    // 只有当事件目标是最外层div时才改变边框
                    if (e.target === e.currentTarget) {
                      const isSelected = selectedCompetitors.some(c => c.hubPageId === page.hubPageId);
                      if (!isSelected) {
                        e.currentTarget.style.border = isHydrated ? themeStyles.pagesGrid.pageCard.borderHover : '1px solid var(--Gray-Blue-7, #5A6B93)';
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    // 只有当事件目标是最外层div时才改变边框
                    if (e.target === e.currentTarget) {
                      const isSelected = selectedCompetitors.some(c => c.hubPageId === page.hubPageId);
                      if (!isSelected) {
                        e.currentTarget.style.border = isHydrated ? themeStyles.pagesGrid.pageCard.border : '1px solid transparent';
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
                          checked={selectedCompetitors.some(c => c.hubPageId === page.hubPageId)}
                          onChange={() => handleCompetitorSelect(page)}
                          className="w-4 h-4 text-blue-600 bg-transparent border-2 border-gray-400 rounded focus:ring-blue-500 focus:ring-2"
                          style={{ accentColor: isHydrated ? themeStyles.pagesGrid.checkbox.accentColor : '#357BF7' }}
                        />
                      )}
                      
                      {/* Page title */}
                      <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${isHydrated ? themeStyles.pagesGrid.tdkLabel.text : 'text-gray-500'}`}>
                              T:
                            </span>
                            <div className={`font-medium leading-tight ${isHydrated ? themeStyles.pagesGrid.pageTitle.text : 'text-white'}`}
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
                            borderRadius: isHydrated ? themeStyles.pagesGrid.viewButton.borderRadius : '12px',
                            background: isHydrated ? themeStyles.pagesGrid.viewButton.background : 'linear-gradient(115deg, #AA450B -2.53%, #231109 26.44%, #10132D 48.59%, #101834 68.22%, #0D47A6 96.36%)',
                            boxShadow: isHydrated ? themeStyles.pagesGrid.viewButton.boxShadow : '0px 2px 5px 0px rgba(255, 255, 255, 0.10)',
                            color: isHydrated ? themeStyles.pagesGrid.viewButton.text : 'var(--Color-, #FFF)'
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
                            borderRadius: isHydrated ? themeStyles.pagesGrid.viewButton.borderRadius : '12px',
                            background: isHydrated ? themeStyles.pagesGrid.viewButton.background : 'linear-gradient(115deg, #AA450B -2.53%, #231109 26.44%, #10132D 48.59%, #101834 68.22%, #0D47A6 96.36%)',
                            boxShadow: isHydrated ? themeStyles.pagesGrid.viewButton.boxShadow : '0px 2px 5px 0px rgba(255, 255, 255, 0.10)',
                            color: isHydrated ? themeStyles.pagesGrid.viewButton.text : 'var(--Color-, #FFF)'
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
                      <span className={`text-xs font-medium flex-shrink-0 mt-0.5 ${isHydrated ? themeStyles.pagesGrid.tdkLabel.text : 'text-gray-500'}`}>
                        D:
                      </span>
                      <div className={`${isHydrated ? themeStyles.pagesGrid.pageDescription.text : 'text-gray-400'} leading-relaxed`}
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
                        <span className={`text-xs font-medium flex-shrink-0 mt-0.5 ${isHydrated ? themeStyles.pagesGrid.tdkLabel.text : 'text-gray-500'}`}>
                          K:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {page.pageType === 'best' ? (
                            <div className="flex flex-wrap gap-1">
                              {page.relatedKeywords.slice(0, 4).map((keyword, kidx) => (
                                <span key={kidx} 
                                      className="px-2 py-1 text-xs"
                                      style={{
                                        borderRadius: isHydrated ? themeStyles.pagesGrid.keywordTag.borderRadius : '6px',
                                        background: isHydrated ? themeStyles.pagesGrid.keywordTag.background : 'var(--Gray-Blue-8, #415071)',
                                        color: isHydrated ? themeStyles.pagesGrid.keywordTag.text : 'var(--Color-, #FFF)'
                                      }}>
                                  {keyword}
                                </span>
                              ))}
                              {page.relatedKeywords.length > 4 && (
                                <span className={`text-xs ${isHydrated ? themeStyles.pagesGrid.metrics.label : 'text-gray-400'}`}>
                                  +{page.relatedKeywords.length - 4}
                                </span>
                              )}
                            </div>
                          ) : (
                            <>
                              {page.relatedKeywords.slice(0, 3).map((keyword, kidx) => (
                                <span key={kidx} 
                                      className="px-2 py-1 text-xs"
                                      style={{
                                        borderRadius: isHydrated ? themeStyles.pagesGrid.keywordTag.borderRadius : '6px',
                                        background: isHydrated ? themeStyles.pagesGrid.keywordTag.background : 'var(--Gray-Blue-8, #415071)',
                                        color: isHydrated ? themeStyles.pagesGrid.keywordTag.text : 'var(--Color-, #FFF)'
                                      }}>
                                  {keyword}
                                </span>
                              ))}
                              {page.relatedKeywords.length > 3 && (
                                <span className={`text-xs ${isHydrated ? themeStyles.pagesGrid.metrics.label : 'text-gray-400'}`}>
                                  +{page.relatedKeywords.length - 3}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Metrics row - Traffic, KD */}
                    <div className={`flex items-center gap-6 text-sm ${isHydrated ? themeStyles.pagesGrid.metrics.label : 'text-gray-400'}`} style={{ 
                      marginLeft: !page.isPageGenerated ? '28px' : '0'
                    }}>
                      {/* Traffic */}
                      <span>
                        Traffic: <span className={isHydrated ? themeStyles.pagesGrid.metrics.value : 'text-white'}>
                          {(() => {
                            const trafficValue = String(page.trafficPotential).trim();
                            return (trafficValue !== "0" && trafficValue !== "") ? page.trafficPotential : '-';
                          })()}
                        </span>
                      </span>
                      
                      {/* KD */}
                      <span>
                        KD: <span className={isHydrated ? themeStyles.pagesGrid.metrics.value : 'text-white'}>
                          {(() => {
                            const difficultyValue = String(page.difficulty).trim();
                            return (difficultyValue !== "0" && difficultyValue !== "") ? page.difficulty : '-';
                          })()}
                        </span>
                      </span>
                    </div>

                  {/* Competitors row for best type */}
                  {page.pageType === 'best' && page.competitors && page.competitors.length > 0 && (
                    <div className={`flex items-center gap-2 mt-3 text-sm ${isHydrated ? themeStyles.pagesGrid.metrics.label : 'text-gray-400'}`} style={{ 
                      marginLeft: !page.isPageGenerated ? '28px' : '0'
                    }}>
                      <span>Competitors:</span>
                      <div className="flex flex-wrap gap-1">
                        {page.competitors.map((competitor, cidx) => (
                          <span key={cidx} 
                                className="px-2 py-1 text-xs"
                                style={{
                                  borderRadius: isHydrated ? themeStyles.pagesGrid.competitorTag.borderRadius : '6px',
                                  background: isHydrated ? themeStyles.pagesGrid.competitorTag.background : 'var(--Gray-Blue-8, #415071)',
                                  color: isHydrated ? themeStyles.pagesGrid.competitorTag.text : 'var(--Color-, #FFF)'
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
        <div key={index} className="flex flex-col justify-start mb-6" style={{animation: 'fadeIn 0.5s ease-out forwards'}}>
          <div className="flex max-w-[80%] flex-row group">
            <div className="flex-shrink-0" style={{animation: 'bounceIn 0.6s ease-out forwards'}}>
            </div>
            <div className="relative">
              <div className={`text-sm ${isHydrated ? themeStyles.agentMessage.text : 'text-white'}`} style={{maxWidth: '800px', wordWrap: 'break-word'}}>
                <div className="relative z-10">
                  {message.isThinking ? (
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 ${isHydrated ? themeStyles.agentMessage.loadingDots : 'bg-gray-300'} rounded-full animate-bounce`}></div>
                      <div className={`w-2 h-2 ${isHydrated ? themeStyles.agentMessage.loadingDots : 'bg-gray-300'} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
                      <div className={`w-2 h-2 ${isHydrated ? themeStyles.agentMessage.loadingDots : 'bg-gray-300'} rounded-full animate-bounce`} style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start gap-2">
                        <button 
                          onClick={() => setMessageCollapsed(prev => ({...prev, [index]: !prev[index]}))}
                          className="text-slate-400 hover:text-slate-300 transition-colors flex-shrink-0 mt-1"
                        >
                        </button>
                        <div className="relative">
                          <div className={`${messageCollapsed[index] ?? true ? 'line-clamp-6' : ''}`}>
                          <span dangerouslySetInnerHTML={{ __html: filteredContent.split('\n').join('<br />') }} />
                        </div>
                          {(messageCollapsed[index] ?? true) && filteredContent.split('\n').length > 6 && (
                            <div className={`absolute bottom-0 left-0 right-0 h-16 pointer-events-none ${
                              isHydrated ? `${themeStyles.messageCollapse.gradientOverlay} ${themeStyles.messageCollapse.borderRadius}` : 'bg-gradient-to-b from-transparent to-slate-800/90 rounded-lg'
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

  useEffect(() => {
    if (chatEndRef.current && messages.length > 0) {
      const chatContainer = document.querySelector('.chat-messages-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    const handleLoginSuccess = () => {
      setIsUserLoggedIn(true);
    };
    window.addEventListener('alternativelyLoginSuccess', handleLoginSuccess);
    return () => {
      window.removeEventListener('alternativelyLoginSuccess', handleLoginSuccess);
    };
  }, []); 

  useEffect(() => {
    const handleLogoutSuccess = () => {
      setIsUserLoggedIn(false);
    };
    window.addEventListener('alternativelyLogoutSuccess', handleLogoutSuccess);
    return () => {
      window.removeEventListener('alternativelyLogoutSuccess', handleLogoutSuccess);
    };
  }, []); 

  const codeContainerRef = useRef(null);
  const latestAgentContentRef = useRef(null); 

  useEffect(() => {
    if (latestAgentContentRef.current) {
      latestAgentContentRef.current.scrollTop = latestAgentContentRef.current.scrollHeight;
    }
  }, [logs]); 

  const executionLogRef = useRef(null);
  useEffect(() => {
    if (executionLogRef.current) {
      executionLogRef.current.scrollTop = executionLogRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .agent-log-content-wrapper * {
        /* 基础样式覆盖 */
        font-size: 11px !important;       /* 强制字号 */
        line-height: 1.6 !important;     /* 强制行间距 */
        color: #bdc3c7 !important;       /* 强制文字颜色 */
        background-color: transparent !important; /* 强制透明背景 */
        margin: 0 !important;            /* 重置外边距 */
        padding: 0 !important;           /* 重置内边距 */
        border: none !important;         /* 重置边框 */
        font-weight: normal !important;  /* 强制普通字重 */
        font-family: inherit !important; /* 继承父级字体 */
        /* 可以添加更多需要强制统一的样式 */
      }

      /* 特定标签的微调 (可选) */
      .agent-log-content-wrapper p {
        margin-bottom: 0.5em !important; /* 给段落一点下边距 */
      }

      .agent-log-content-wrapper strong,
      .agent-log-content-wrapper b {
        font-weight: bold !important;
        color: #ecf0f1 !important; /* 粗体用更亮的颜色 */
      }

      .agent-log-content-wrapper a {
        color: #60a5fa !important;
        text-decoration: underline !important;
      }
      .agent-log-content-wrapper a:hover {
        color: #93c5fd !important;
      }

      /* 覆盖特定传入类的样式 */
      .agent-log-content-wrapper .thinking-block,
      .agent-log-content-wrapper .action-block,
      .agent-log-content-wrapper .json-action-block,
      .agent-log-content-wrapper .text-gray-600,
      .agent-log-content-wrapper .text-xs /* 覆盖其他可能的字号类 */ {
          background-color: transparent !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          border-radius: 0 !important;
          color: inherit !important; /* 继承父级颜色 */
          font-size: inherit !important; /* 继承父级字体大小 */
      }

      .fade-out-animation {
        animation: fadeOut 0.6s ease-out forwards;
      }
      
      @keyframes fadeOut {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.98); }
      }
      
      .chat-messages-container {
        opacity: 0;
        animation: fadeIn 0.6s ease-out forwards;
      }
      
      @keyframes fadeIn {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      .form-transition {
        transition: all 0.4s ease-out;
      }
      
      .form-transition.fade-out {
        opacity: 0;
        transform: translateY(20px);
      }
      
      .loading-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(to bottom, #0f172a, #1e293b, #0f172a);
        z-index: 9999;
        opacity: 0;
        animation: fadeInOut 1.2s ease-out forwards;
      }
      
      @keyframes fadeInOut {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
      }
      
      .loading-spinner {
        width: 60px;
        height: 60px;
        border: 3px solid rgba(59, 130, 246, 0.3);
        border-radius: 50%;
        border-top-color: rgba(59, 130, 246, 0.8);
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .loading-text {
        margin-top: 20px;
        color: white;
        font-size: 16px;
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.5s ease-out forwards;
        opacity: 0;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* 美化滚动条样式 */
      .h-full::-webkit-scrollbar,
      .overflow-y-auto::-webkit-scrollbar,
      .chat-messages-container::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      
      .h-full::-webkit-scrollbar-track,
      .overflow-y-auto::-webkit-scrollbar-track,
      .chat-messages-container::-webkit-scrollbar-track {
        background: rgba(15, 23, 42, 0.1);
        border-radius: 10px;
      }
      
      .h-full::-webkit-scrollbar-thumb,
      .overflow-y-auto::-webkit-scrollbar-thumb,
      .chat-messages-container::-webkit-scrollbar-thumb {
        background: rgba(59, 130, 246, 0.5);
        border-radius: 10px;
        transition: all 0.3s ease;
      }
      
      .h-full::-webkit-scrollbar-thumb:hover,
      .overflow-y-auto::-webkit-scrollbar-thumb:hover,
      .chat-messages-container::-webkit-scrollbar-thumb:hover {
        background: rgba(59, 130, 246, 0.8);
      }
      
      /* 针对 Firefox 的滚动条样式 */
      .h-full, .overflow-y-auto, .chat-messages-container {
        scrollbar-width: thin;
        scrollbar-color: rgba(59, 130, 246, 0.5) rgba(15, 23, 42, 0.1);
      }
      
      .animate-simpleAppear {
        animation: simpleAppear 0.3s ease-out forwards;
        opacity: 0;
      }
      
      @keyframes simpleAppear {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `;
  }, []);

  const validateDomain = (input) => {
    if (!input || !input.trim()) return false;
    let domain = input.trim();
    try {
      if (/^\d+$/.test(domain)) {
        return false;
      }
      if (!domain.match(/^https?:\/\//i)) {
        domain = 'https://' + domain;
      }
      const url = new URL(domain);
      domain = url.hostname;
      if (!domain.includes('.')) {
        return false;
      }
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      return domainRegex.test(domain);
    } catch (error) {
      return false;
    }
  };

  const extractDomain = (url) => {
    try {
      if (!url) return '';
      return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
    } catch (e) {
      return '';
    }
  };

  const handleStartGenerationFromModal = async ({ hubPageIds, conversationId, websiteId }) => {
    try {
      setIsMessageSending(true);
      setIsSubmitting(true);
      setCurrentStep(3);
      startedTaskCountRef.current += hubPageIds.length;
      messageHandler.addSystemMessage('System is analyzing competitors and generating pages, please wait...');
      retryCountRef.current = 0; 
      setShouldConnectSSE(true); 
      setHubPageIds([]);
      setSelectedCompetitors([]); // 清空选中的竞争对手
      setUserInput(''); // 清空输入框
      setIsProcessingTask(true);
    } catch (error) {
      messageHandler.addSystemMessage(`⚠️ Failed to process competitor selection: ${error.message}`);
    } finally {
      setIsMessageSending(false);
      setIsSubmitting(false);
    }
  };

  const formatSitemapData = (data) => {
    if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
      return [];
    }

    const formattedPages = data.data.map(page => ({
      hubPageId: page.hubPageId || `page-${Date.now()}-${Math.random()}`,
      pageTitle: page.pageTitle || 'Untitled Page',
      description: page.description || '',
      relatedKeywords: page.relatedKeywords || [],
      trafficPotential: page.trafficPotential || '0',
      difficulty: page.difficulty || 0,
      competitors: page.competitors || [],
      isPageGenerated: page.isPageGenerated || false,
      generatedPageId: page.generatedPageId || '',
      pageType: page.pageType || '',
      source: page.source || '',
      pageCategory: ['contentPage']
    }));
    
    return formattedPages;
  };

  const getMatchedWebsiteId = async (mainProduct) => {
    try {
      const websiteListResponse = await apiClient.getAlternativeWebsiteList(1, 20);
      
      if (websiteListResponse && 
          websiteListResponse.code === 200 && 
          websiteListResponse.data && 
          Array.isArray(websiteListResponse.data) && 
          websiteListResponse.data.length > 0) {
        
        let matchedWebsiteId = null;
        
        const mainProductDomain = extractDomain(mainProduct);
        // 寻找匹配的网站
        for (const website of websiteListResponse.data) {
          const websiteDomain = extractDomain(website.websiteURL);
          if (mainProductDomain && websiteDomain.includes(mainProductDomain)) {
            matchedWebsiteId = website.websiteId;
            setCurrentWebsiteId(matchedWebsiteId);
            break;
          }
        }
        
        // 如果找不到匹配的，使用第一个websiteId
        if (!matchedWebsiteId) {
          matchedWebsiteId = websiteListResponse.data[0].websiteId;
          setCurrentWebsiteId(matchedWebsiteId);
        }
        
        return { success: true, websiteId: matchedWebsiteId };
      }
      return { success: false, error: 'No website data available' };
    } catch (error) {
      console.error('Failed to fetch website list:', error);
      return { success: false, error };
    }
  };

  const checkSitemapDataAvailable = async (mainProduct, userInputUrl) => {
    try {
      // 获取匹配的websiteId
      const { success, websiteId, error } = await getMatchedWebsiteId(mainProduct, userInputUrl);
      
      if (!success) {
        return false;
      }
      
      // 请求sitemap数据
      const sitemapData = await apiClient.getWebsiteSitemap(websiteId);
      
      if (sitemapData && sitemapData.code === 200 && sitemapData.data) {
        const formattedPages = formatSitemapData(sitemapData);
        return Array.isArray(formattedPages) && formattedPages.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking sitemap data availability:', error);
      return false;
    }
  };

  const refreshPageList = async () => {
    try {
      if (!currentWebsiteId || !currentConversationId) {
        console.warn('Missing websiteId or conversationId for refresh');
        return;
      }
  
      // 显示刷新中的提示
      messageApi.loading({ content: 'Refreshing page list...', key: 'refreshList', duration: 0 });

      // 重新获取sitemap数据
      const result = await processSitemapData(currentWebsiteId, currentConversationId, true);
      
      messageApi.destroy('refreshList');
      
      if (result.success) {
        messageApi.success('Page list refreshed successfully');
      } else {
        messageApi.error('Failed to refresh page list');
      }
    } catch (error) {
      messageApi.destroy('refreshList');
      console.error('Error refreshing page list:', error);
      messageApi.error('Failed to refresh page list');
    }
  };

  const processSitemapData = async (websiteId, tempConversationId, isFromSitemapButton = false) => {
    try {
      // 调用getWebsiteSitemap接口获取数据
      const sitemapData = await apiClient.getWebsiteSitemap(websiteId);
      if (sitemapData && sitemapData.code === 200 && sitemapData.data) {
        const formattedPages = formatSitemapData(sitemapData);
  
        // 获取当前URL路径
        const currentPath = window.location.pathname;
        
        // 根据URL路径筛选页面类型
        let filteredPages = formattedPages;
        let pageTypeTitle = "";
        
        if (currentPath.includes('alternativepage')) {
          filteredPages = formattedPages.filter(page => page.pageType === 'alternative');
          pageTypeTitle = "alternative";
        } else if (currentPath.includes('bestpage')) {
          filteredPages = formattedPages.filter(page => page.pageType === 'best');
          pageTypeTitle = "best";
        } else if (currentPath.includes('faqpage')) {
          filteredPages = formattedPages.filter(page => page.pageType === 'faq');
          pageTypeTitle = "faq";
        }
  
        if (filteredPages.length === 0) {
          filteredPages = formattedPages;
          pageTypeTitle = "";
        }
  
        if(!isFromSitemapButton) {
          let chatData = filteredPages;
          
          // 处理alternative页面类型的特殊逻辑 - 只有不是从sitemap按钮发起时才执行
          if (pageTypeTitle === "alternative") {
            const allCompetitors = [];
            filteredPages.forEach(page => {
              if (page.competitors && Array.isArray(page.competitors)) {
                allCompetitors.push(...page.competitors);
              }
            });
            
            const uniqueCompetitors = [...new Set(allCompetitors)];
            const competitorsString = uniqueCompetitors.join(", ");
            
            chatData = "Here's the list of competitors, please guide user to select from this list: " + competitorsString;
            
            let chatResponse = await apiClient.chatWithAI(getPageMode(), chatData, tempConversationId);
            const messageId = messageHandler.addAgentThinkingMessage();
            messageHandler.updateAgentMessage(chatResponse.data.message.answer, messageId);
          } 
        }
  
        // 检查是否已存在pages-grid消息，如果存在则更新，否则创建新的
        setMessages(prev => {
          const existingIndex = prev.findIndex(msg => msg.type === 'pages-grid');
          
          if (existingIndex !== -1) {
            // 更新现有的pages-grid消息
            const updatedMessages = [...prev];
            updatedMessages[existingIndex] = {
              ...updatedMessages[existingIndex],
              pages: filteredPages,
              pageType: pageTypeTitle,
              timestamp: new Date().toISOString(),
            };
            return updatedMessages;
          } else {
            // 创建新的pages-grid消息
            const pagesMessage = {
              id: `pages-${Date.now()}`,
              type: 'pages-grid',
              pages: filteredPages, 
              pageType: pageTypeTitle,
              timestamp: new Date().toISOString(),
            };
            return [...prev, pagesMessage];
          }
        });
        
        return { success: true, filteredPages, pageTypeTitle };
      }
      return { success: false, error: 'Invalid sitemap data' };
    } catch (error) {
      console.error('Failed to fetch sitemap data:', error);
      return { success: false, error };
    }
  };

  // 整合上面的函数，创建一个完整的处理流程
  const handleWebsiteSitemapProcess = async (mainProduct, userInputUrl, tempConversationId, isFromSitemapButton = false) => {
    try {
      // 获取匹配的websiteId
      const { success, websiteId, error } = await getMatchedWebsiteId(mainProduct, userInputUrl);
      
      if (!success) {
        console.error('Failed to get matched website ID:', error);
        return { success: false, error };
      }
      
      // 处理sitemap数据，传递isFromSitemapButton参数
      return await processSitemapData(websiteId, tempConversationId, isFromSitemapButton);
    } catch (error) {
      console.error('Error in website sitemap process:', error);
      return { success: false, error };
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      setIsMessageSending(false);
      setIsProcessingTask(false);
      setCurrentStep(2);
    }
  };

  const handleUserInput = async (eOrString) => {
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

    if (currentStep === 0) {
      if (!validateDomain(formattedInput)) {
        messageApi.error('Please enter a valid website domain, such as example.com or https://example.com');
        setIsSubmitting(false);
        return;
      }
    }

    // --- 登录状态检查 ---
    const isLoggedIn = localStorage.getItem('alternativelyIsLoggedIn') === 'true';
    const token = localStorage.getItem('alternativelyAccessToken');
    if (!isLoggedIn || !token) {
      const showLoginEvent = new CustomEvent('showAlternativelyLoginModal');
      window.dispatchEvent(showLoginEvent);
      setIsProcessingTask(false); 
      return;
    }

    // --- 积分检查 ---
    try {
      const packageResponse = await apiClient.getCustomerPackage();
      if (packageResponse?.code === 200 && packageResponse.data) {
        const { pageGeneratorLimit, pageGeneratorUsage } = packageResponse.data;
        const availableCredits = pageGeneratorLimit - pageGeneratorUsage;
        if (availableCredits <= 0) {
          const el = document.getElementById('pricing');
          if (el) {
            messageApi.warning('You have no credits left. Please purchase a package to continue using.', 2);
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            console.warn('Subscription card element not found for scrolling.');
            messageApi.warning('You have no credits left. Please purchase a package to continue using.', 2);
          }
          setIsProcessingTask(false); 
          return;
        }
      } else {
        console.warn('[DEBUG] Failed to get user package information, continuing without credit check.');
      }
    } catch (creditError) {
      console.error('Error checking user credit:', creditError);
    } finally {
      setIsSubmitting(false);
    }

    // --- 添加用户消息并显示思考状态 ---
    messageHandler.addUserMessage(formattedInput);
    const thinkingMessageId = messageHandler.addAgentThinkingMessage();
    setUserInput('');
    setIsMessageSending(true);

    try {
      setShowSlogan(false);
      
      // 确定要使用的conversationId
      let tempConversationId = currentConversationId;
      
      // 如果没有conversationId，通过chat接口获取一个新的
      if (!tempConversationId) {
        setLoading(true);
        // 首次调用chatWithAI，不传conversationId参数，让API创建新的会话
        const chatResponse = await apiClient.chatWithAI(getPageMode(), formattedInput, tempConversationId);
        
        if (chatResponse?.code !== 200 || !chatResponse?.data?.conversationId) {
          messageHandler.updateAgentMessage('Failed to create a new task. Please try again.', thinkingMessageId);
          setIsMessageSending(false);
          return;
        }
        
        // 获取并保存新的conversationId
        tempConversationId = chatResponse.data.conversationId;
        
        // 更新状态并修改URL
        setCurrentConversationId(tempConversationId);
        isFirstMessageSentForNewTaskRef.current = true;

        // 根据当前路径决定跳转目标
        const currentPath = window.location.pathname;
        let targetPath = '/alternativepage'; // 默认跳转到 alternativepage

        if (currentPath.includes('bestpage')) {
          targetPath = '/bestpage';
        } else if (currentPath.includes('faqpage')) {
          targetPath = '/faqpage';
        } else if (currentPath.includes('alternativepage')) {
          targetPath = '/alternativepage';
        }

        router.replace(`${targetPath}?conversationId=${tempConversationId}`);
        
        // 如果响应中包含answer，处理它
        if (chatResponse.data.message.answer) {
          const rawAnswer = chatResponse.data.message.answer;
          
          // 处理URL_GET标记的情况
          if (rawAnswer.includes('[URL_GET]')) {
            localStorage.setItem('currentProductUrl', formattedInput);
            messageHandler.updateAgentMessage(rawAnswer, thinkingMessageId);
            
            const searchResponse = await apiClient.searchCompetitor(
              tempConversationId,
              formattedInput
            );
            
            if (searchResponse?.code === 1075) {
              messageHandler.addSystemMessage("⚠️ There is a task in progress. Please select from the left chat list");
              return;
            }
            
            if (searchResponse?.code === 1058) {
              messageHandler.updateAgentMessage("⚠️ Encountered a network error. Please try again.", thinkingMessageId);
              setLoading(false);
              return;
            }

            if (searchResponse?.code === 13002) {
              messageHandler.updateAgentMessage("⚠️ Please subscribe before starting a task.", thinkingMessageId);
              return;
            }
            
            if (searchResponse?.code === 200) {
              setShouldConnectSSE(true);
              window.dispatchEvent(new CustomEvent('chatStarted'));

              if (searchResponse.data.sitemapStatus === 'generated') {
                const userInputUrl = localStorage.getItem('currentProductUrl') || '';
                await handleWebsiteSitemapProcess(mainProduct, userInputUrl, tempConversationId, false);
              }

              if (searchResponse.data.sitemapStatus === 'ungenerated') {
                messageHandler.addSystemMessage(
                  "Agent starts working on find competitor list for you, it ususally takes a minute or two, please hold on..."
                );
                setIsProcessingTask(true);
              }
            }
            
            while (messageHandler.isProcessing) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            while (messageHandler.isProcessing) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            setCanProcessCompetitors(true);
            return; 
          }
          else {
            const answer = filterMessageTags(rawAnswer);
            messageHandler.updateAgentMessage(answer, thinkingMessageId);
            setLoading(false);
            return;
          }
        } 
      }
      
      const response = await apiClient.chatWithAI(getPageMode(), formattedInput, tempConversationId);
      if (response?.code === 200 && response.data?.message?.answer) {
        const rawAnswer = response.data.message.answer;
        
        if (rawAnswer.includes('[URL_GET]')) {
          localStorage.setItem('currentProductUrl', formattedInput);
          messageHandler.updateAgentMessage(rawAnswer, thinkingMessageId);
          
          const searchResponse = await apiClient.searchCompetitor(
            tempConversationId,
            formattedInput
          );
          
          if (searchResponse?.code === 1075) {
            messageHandler.updateAgentMessage("⚠️ There is a task in progress. Please select from the left chat list", thinkingMessageId);
            return;
          }
          
          if (searchResponse?.code === 1058) {
            messageHandler.updateAgentMessage("⚠️ Encountered a network error. Please try again.", thinkingMessageId);
            return;
          }

          if (searchResponse?.code === 13002) {
            messageHandler.updateAgentMessage("⚠️ Please subscribe before starting a task.", thinkingMessageId);
            return;
          }
          
          if (searchResponse?.code === 200) {
            setShouldConnectSSE(true);
            window.dispatchEvent(new CustomEvent('chatStarted'));

            if (searchResponse.data.sitemapStatus === 'generated') {
              const userInputUrl = localStorage.getItem('currentProductUrl') || '';
              await handleWebsiteSitemapProcess(mainProduct, userInputUrl, tempConversationId, false);
            }

            if (searchResponse.data.sitemapStatus === 'ungenerated') {
              messageHandler.addSystemMessage(
                "Agent starts working on find competitor list for you, it ususally takes a minute or two, please hold on..."
              );
              setIsProcessingTask(true);
            }
          }

          while (messageHandler.isProcessing) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          setCurrentStep(2);
          setIsMessageSending(true);
          setIsProcessingTask(true);
          
          while (messageHandler.isProcessing) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          setCanProcessCompetitors(true);
        } else {
          const answer = filterMessageTags(rawAnswer);
          messageHandler.updateAgentMessage(answer, thinkingMessageId);
        }
      } else {
        messageHandler.updateAgentMessage('Sorry! The service is temporarily experiencing issues. Please try again later.', thinkingMessageId);
      }
    } catch (error) {
      messageHandler.handleErrorMessage(error, thinkingMessageId);
    } finally {
      setIsMessageSending(false);
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!shouldConnectSSE || !currentConversationId) {
      // --- 新增：如果不需要连接，确保停止重连提示 ---
      isShowingReconnectNoticeRef.current = false;
      if (sseReconnectNoticeTimeoutRef.current) {
        clearTimeout(sseReconnectNoticeTimeoutRef.current);
        sseReconnectNoticeTimeoutRef.current = null;
      }
      // --- 结束新增 ---
      return;
    }

    const customerId = localStorage.getItem('alternativelyCustomerId');
    const token = localStorage.getItem('alternativelyAccessToken');
    const isLoggedIn = localStorage.getItem('alternativelyIsLoggedIn') === 'true';

    // 定义重试相关常量
    const MAX_RETRY_COUNT = 5;
    const BASE_RETRY_DELAY = 5000; // 基础重试延迟 5 秒
    const MAX_RETRY_DELAY = 60000; // 最大重试延迟 60 秒

    if (!isLoggedIn || !customerId || !token) {
      setSseConnected(false);
      return;
    }

    let eventSource = null;

    const showErrorModal = (errorMessage = 'An irreversible error occurred during the task.') => {
      setErrorModal({
        visible: true,
        message: errorMessage || '',
      });

      // 停止 SSE 连接并重置状态
      if (eventSource) {
        eventSource.close();
      }
      setSseConnected(false);
      setIsProcessingTask(false); // 标记任务处理结束
      setShouldConnectSSE(false); // 防止自动重连
      // 清理重试逻辑
      retryCountRef.current = 0;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };

    const connectSSE = () => {
      if (eventSource) {
        eventSource.close();
      }

      const currentToken = localStorage.getItem('alternativelyAccessToken');
      if (!currentToken) {
        setSseConnected(false);
        return;
      }

      // --- 修改 SSE 连接 URL，加入 websiteId ---
      const sseUrl = `https://api.websitelm.com/events/${customerId}-${currentConversationId}-chat`;
      // const sseUrl = `https://api.zhuyuejoey.com/events/${customerId}-${currentConversationId}-chat`;


      // 修复：增加错误处理和超时设置
      try {
        eventSource = new EventSourcePolyfill(sseUrl, {
          headers: {
            'Authorization': `Bearer ${currentToken}`
          },
          // 增加超时时间，避免频繁断开重连
          heartbeatTimeout: 60000, // 60秒
          // 增加连接超时
          connectionTimeout: 15000 // 15秒连接超时
        });
      } catch (error) {
        console.error('Error creating EventSource:', error);
        setSseConnected(false);
        return;
      }

      eventSource.onopen = () => {
        setSseConnected(true);
        retryCountRef.current = 0;  

        console.log('🚀 SSE Connected! 🚀');

        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }

        isShowingReconnectNoticeRef.current = false;
        if (sseReconnectNoticeTimeoutRef.current) {
          clearTimeout(sseReconnectNoticeTimeoutRef.current);
          sseReconnectNoticeTimeoutRef.current = null;
        }
      };

      eventSource.onmessage = (event) => {
        try {
          const logData = JSON.parse(event.data);
          console.log('logData', logData);

          setIsProcessingTask(true);

          let currentStepNumber = currentStep;

          // 处理 Error 类型日志
          if (logData.type === 'Error') {
            console.error('Received Error log from SSE:', logData.content);
            const errorMessage = logData.content.description;
            showErrorModal(errorMessage); // 显示错误弹窗并停止 SSE
            return; // 停止处理后续逻辑
          }

          if (logData.type === 'Info' && 
            (logData.step === 'FIND_WEBSITE_SITEMAP_AGENT_FINISHED' || 
             (logData.content && logData.content.step === 'FIND_WEBSITE_SITEMAP_AGENT_FINISHED')) &&
            ((logData.content && logData.content.status === 'finished') || logData.status === 'finished')) {
          
            console.log('Sitemap generation finished, fetching sitemap data...');
            
            // 获取当前的websiteId和conversationId
            const userInputUrl = localStorage.getItem('currentProductUrl') || '';
            
            // 异步获取sitemap数据
            (async () => {
              try {
                await handleWebsiteSitemapProcess(mainProduct, userInputUrl, currentConversationId, false);
              } catch (error) {
                console.error('Failed to fetch sitemap data after generation:', error);
              }
            })();
          }

          if (logData.type === 'Agent') {
            // 根据step类型确定logType
            let agentLogType = 'Agent';
            if (logData.step === 'FIND_COMPETITORS_AGENT' || 
                (logData.content && logData.content.step === 'FIND_COMPETITORS_AGENT')) {
              agentLogType = 'CompetitorsAgent';

              const existingSimilarLog = logs.find(log => 
                log.logType === 'CompetitorsAgent' && 
                log.step === (logData.step || (logData.content && logData.content.step)) &&
                // 检查时间戳，只考虑最近几秒内的日志
                (new Date().getTime() - new Date(log.timestamp).getTime()) < 5000
              );

              if (existingSimilarLog) {
                // 如果存在类似的日志，则不添加新的
                return;
              }

            } else if (logData.step === 'FIND_WEBSITE_SITEMAP_AGENT' || 
                      (logData.content && logData.content.step === 'FIND_WEBSITE_SITEMAP_AGENT')) {
              agentLogType = 'SitemapAgent';
            }
            
            // 保存Agent消息，使用新的logType
            const agentLog = {
              ...logData,
              type: logData.type, // 保持原始类型为'Agent'
              logType: agentLogType, // 使用新的logType区分不同类型的Agent
              step: logData.step || (logData.content && logData.content.step),
              currentStep: currentStepNumber
            };
            setLogs(prevLogs => [...prevLogs, agentLog]);
          }

          if (logData.type === 'Html') {
              setCurrentStep(4);
            if (!isStreamingRef.current || currentStreamIdRef.current !== logData.id) {
              htmlStreamRef.current = '';
              currentStreamIdRef.current = logData.id;
              isStreamingRef.current = true;
              setRightPanelTab('codes');
              if (apiDetailModal.visible) {
                setApiDetailModal({ visible: false, data: null });
              }

              // 添加新的日志项
              setLogs(prevLogs => [...prevLogs, {
                id: logData.id,
                type: 'Html',
                content: '',
                timestamp: new Date().toISOString(),
                currentStep: currentStepNumber
              }]);
            }

            // 累积 HTML 内容
            htmlStreamRef.current += logData.content;

            // 更新对应的日志项 - ★★★ 修改这里 ★★★
            setLogs(prevLogs => prevLogs.map(log =>
              // 确保只更新 ID 匹配且类型为 Html 的日志
              (log.id === currentStreamIdRef.current && log.type === 'Html') 
                ? {...log, content: htmlStreamRef.current}
                : log
            ));
            
            // 在下一个微任务中执行滚动，确保 DOM 已更新
            setTimeout(() => {
              if (codeContainerRef.current) {
                codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
              }
            }, 0);
          }
          // --- 新增 Color 类型流式处理的逻辑 ---
          else if (logData.type === 'Color') {
            setLogs(prevLogs => [...prevLogs, {
              id: logData.id,
              type: 'Color',
              content: logData.content, // 直接使用结构化数据
              step: logData.step,
              timestamp: logData.timestamp || new Date().toISOString(),
              currentStep: currentStepNumber
            }]);
          }
          else if (logData.type === 'Crawler_Images') {
            // ★★★ 修改：直接存储原始数组（或确保是数组）★★★
            const standardizedLog = {
              id: logData.id || `crawler-images-${Date.now()}-${Math.random()}`,
              type: logData.type,
              // 直接存储 content，确保它是一个数组
              content: Array.isArray(logData.content) ? logData.content : [], 
              step: logData.step,
              timestamp: logData.timestamp || new Date().toISOString(),
              currentStep: currentStepNumber
            };
            setLogs(prevLogs => [...prevLogs, standardizedLog]);
          }
          // --- 修改：处理 'Crawler_Headers' 类型 ---
          else if (logData.type === 'Crawler_Headers') {
             // ★★★ 修改：直接存储原始数组（或确保是数组）★★★
            const standardizedLog = {
              id: logData.id || `crawler-headers-${Date.now()}-${Math.random()}`,
              type: logData.type,
              // 直接存储 content，确保它是一个数组
              content: Array.isArray(logData.content) ? logData.content : [],
              step: logData.step,
              timestamp: logData.timestamp || new Date().toISOString(),
              currentStep: currentStepNumber
            };
            setLogs(prevLogs => [...prevLogs, standardizedLog]);
          }
          // --- 修改：处理 'Crawler_Footers' 类型 ---
          else if (logData.type === 'Crawler_Footers') {
             // ★★★ 修改：直接存储原始数组（或确保是数组）★★★
            const standardizedLog = {
              id: logData.id || `crawler-footers-${Date.now()}-${Math.random()}`,
              type: logData.type,
              // 直接存储 content，确保它是一个数组
              content: Array.isArray(logData.content) ? logData.content : [],
              step: logData.step,
              timestamp: logData.timestamp || new Date().toISOString(),
              currentStep: currentStepNumber
            };
            setLogs(prevLogs => [...prevLogs, standardizedLog]);
          }
          else if (logData.type === 'Codes') {
            isStreamingRef.current = false;
            currentStreamIdRef.current = null;
            const logWithStep = {
              ...logData,
              currentStep: currentStepNumber // 添加 currentStep 字段
            };
            setLogs(prevLogs => [...prevLogs, logWithStep]);
            setRightPanelTab('browser');
          }
          else if (logData.type === 'Crawler_Await') {
            const crawlerLog = {
              id: logData.id,
              type: 'Crawler_Deep',
              content: {
                awaitMinutes: logData.content.await,
                links: [],
                status: 'waiting'
              },
              step: logData.step,
              timestamp: logData.timestamp || new Date().toISOString(),
              currentStep: currentStepNumber
            };
            setLogs(prevLogs => [...prevLogs, crawlerLog]);
          }
          else if (logData.type === 'Crawler_Links') {
            // 更新现有的深度爬虫日志条目，添加链接
            setLogs(prevLogs => prevLogs.map(log => {
              if (log.id === logData.id && log.type === 'Crawler_Deep') {
                return {
                  ...log,
                  content: {
                    ...log.content,
                    links: [...log.content.links, logData.content],
                    status: 'crawling'
                  },
                  timestamp: logData.timestamp || new Date().toISOString() // 更新时间戳
                };
              }
              return log;
            }));
          }
          else {
            setLogs(prevLogs => [...prevLogs, { ...logData, currentStep: currentStepNumber }]);
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        // 确保在关闭连接前记录当前的重试次数
        const currentRetryCount = retryCountRef.current;
        
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        
        setSseConnected(false);
        
        // --- 新增：启动重连提示循环 ---
        // 先清除可能存在的旧定时器
        if (sseReconnectNoticeTimeoutRef.current) {
          clearTimeout(sseReconnectNoticeTimeoutRef.current);
          sseReconnectNoticeTimeoutRef.current = null;
        }
        isShowingReconnectNoticeRef.current = true; // 标记正在显示提示

        const showReconnectNotice = () => {
          // 如果标记为 false，则停止循环
          if (!isShowingReconnectNoticeRef.current) return;

          // 设置下一个提示的定时器
          sseReconnectNoticeTimeoutRef.current = setTimeout(showReconnectNotice, 3000); // 每 3 秒重复
        };

        // 立即显示第一个提示
        showReconnectNotice();
        // --- 结束新增 ---

        // 使用之前保存的计数值，而不是直接使用ref
        if (currentRetryCount < MAX_RETRY_COUNT) {
          // 先增加计数，再保存到ref
          const newRetryCount = currentRetryCount + 1;
          retryCountRef.current = newRetryCount;

          // 使用指数退避策略计算延迟
          const delay = Math.min(BASE_RETRY_DELAY * Math.pow(2, newRetryCount - 1), MAX_RETRY_DELAY);

          // 清除之前的超时
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }

          retryTimeoutRef.current = setTimeout(() => {
            retryTimeoutRef.current = null;
            // 检查是否仍需要连接
            if (shouldConnectSSE) {
              connectSSE();
            } else {
              // --- 新增：如果不再需要连接，停止重连提示 ---
              isShowingReconnectNoticeRef.current = false;
              if (sseReconnectNoticeTimeoutRef.current) {
                clearTimeout(sseReconnectNoticeTimeoutRef.current);
                sseReconnectNoticeTimeoutRef.current = null;
              }
              // --- 结束新增 ---
            }
          }, delay);
        } else {
          isShowingReconnectNoticeRef.current = false;
          if (sseReconnectNoticeTimeoutRef.current) {
            clearTimeout(sseReconnectNoticeTimeoutRef.current);
            sseReconnectNoticeTimeoutRef.current = null;
          }
        }
      };
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
        setSseConnected(false);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      isShowingReconnectNoticeRef.current = false;
      if (sseReconnectNoticeTimeoutRef.current) {
        clearTimeout(sseReconnectNoticeTimeoutRef.current);
        sseReconnectNoticeTimeoutRef.current = null;
      }
      retryCountRef.current = 0;
    };
  }, [shouldConnectSSE, currentConversationId, messageHandler, apiClient]); // Added dependencies

  useEffect(() => {
    const generationFinishedLog = logs.find(log => 
      log.type === 'Info' && 
      log.step === 'CURRENT_GENERATION_FINISHED' &&
      !processedStepLogIdsRef.current.has(log.id)
    )

    let logToProcess = null;
    if (generationFinishedLog) {
      logToProcess = generationFinishedLog;
    }

    if (logToProcess) {
      processedStepLogIdsRef.current.add(logToProcess.id);

      if (browserTabs.length < 10) {
        setCurrentStep(2);
        setIsProcessingTask(false);
        messageHandler.addGenerateSitemapButtonMessage(async () => {
          const userInputUrl = localStorage.getItem('currentProductUrl') || '';
          await handleWebsiteSitemapProcess(mainProduct, userInputUrl, currentConversationId, true);
        });
      }

      if (browserTabs.length >= 10) {
        setTaskSteps(prevSteps => {
          const newStep = {
            id: currentStep + 1,
            name: "Current Task Finished",
            gradient: "from-gray-500/40 to-slate-500/40",
            borderColor: "border-gray-500/60",
            shadowColor: "shadow-gray-500/20",
          };
          return [...prevSteps, newStep];
        });
        if (shouldConnectSSE) {
          setShouldConnectSSE(false);
        }
      }
    }
  }, [logs, shouldConnectSSE, setCurrentStep, setTaskSteps, setShouldConnectSSE]);

  useEffect(() => {
    const apiLog = logs.find(log => 
      log.type === 'API' && 
      log.step === 'GET_RESULT_COMPETITORS_SEMRUSH_API'
    );
  
    let hasCompetitorListInHistory = false;
    if (chatHistory) {
      for (const item of chatHistory.data) {
        if (item.message) {
          try {
            const parsed = JSON.parse(item.message);
            if (Array.isArray(parsed) && parsed.length > 0) {
              hasCompetitorListInHistory = true;
              break;
            }
          } catch (e) {
          }
        }
      }
    }

    if (apiLog && apiLog.content?.data && !hasCompetitorListInHistory) {
      const competitors = apiLog.content.data;

      // 恢复竞品名单
    }

    const finishedLog = logs.find(log => 
      log.type === 'Info' && 
      log.step === 'GENERATION_FINISHED'
    );
    
    if (finishedLog && isProcessingTask && browserTabs.length === startedTaskCountRef.current && startedTaskCountRef.current > 0) {
      setIsProcessingTask(false);
      (async () => {
        try {
          const completionMessage = "Current page generation is finished, move me to next step, tell me what i can do next [PAGES_GENERATED]";
          const response = await apiClient.chatWithAI(getPageMode(), completionMessage, currentConversationId);
          
          if (response?.code === 200 && response.data?.message?.answer) {
            const answer = filterMessageTags(response.data.message.answer);

            const thinkingMessageId = messageHandler.addAgentThinkingMessage();
            messageHandler.updateAgentMessage(answer, thinkingMessageId);

            messageHandler.addCustomCongratsMessage({
              text: "Congratulations! You have your page generated. You can bind your domain to publish it directly, or select more from the list above to generate.",
              buttons: [
                { label: "Go Edit", action: "edit" },
                { label: "Go Bind With My Domain", action: "bind" }
              ]
            });
            
          } else {
            messageHandler.addSystemMessage(
              "Oops! The service encountered a temporary issue. Could you please try sending your message again?"
            );
          }
        } catch (error) {
          messageHandler.addSystemMessage(
            "Failed to send completion message. Please try again later."
          );
        } finally {
          setIsMessageSending(false);
        }
      })();
    }
  }, [logs, browserTabs, canProcessCompetitors, currentConversationId, messageHandler, apiClient, isProcessingTask, chatHistory]);

  useEffect(() => {
    const allCodesLogs = logs.filter(log => log.type === 'Codes' && log.content?.resultId);

    const newCodesLogs = allCodesLogs.filter(log =>
      !browserTabs.some(tab => tab.id === `result-${log.content.resultId}`)
    );

    if (newCodesLogs.length === 0) {
      return;
    }

    const newTabsToAdd = [];

    newCodesLogs.forEach((log, index) => {
      const tabId = `result-${log.content.resultId}`;
      const pageNumber = browserTabs.length + index + 1;

      newTabsToAdd.push({
        id: tabId,
        title: `Page ${pageNumber}`,
        url: `https://preview.websitelm.site/en/${log.content.resultId}`
      });
    });

    setBrowserTabs(prevTabs => {
      const updatedTabs = [...prevTabs, ...newTabsToAdd];
      return updatedTabs;
    });

    if (!activeTab && newTabsToAdd.length > 0) {
      const lastNewTab = newTabsToAdd[newTabsToAdd.length - 1];
      setActiveTab(lastNewTab.id);
      setRightPanelTab('browser');
    }

  }, [logs]);

  useEffect(() => {
    if (browserTabs.length > 0 && !activeTab) {
      setActiveTab(browserTabs[0].id);
      setRightPanelTab('browser');
    }
  }, [browserTabs.length, activeTab]);

  useEffect(() => {
    return () => {
      processedLogIdsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const placeholderTexts = [
      "Enter your product website URL to get started.",
      "eg. seopage.ai or https://seopage.ai"
    ];
    const typingSpeed = 20; // milliseconds per character
    const deletingSpeed = 10;
    const pauseBetweenSentences = 1000; // Pause after typing a sentence
    const pauseAtEnd = 1000; // Pause after deleting a sentence

    // Refs are now accessed directly, no need to declare them here

    const clearTimers = () => {
      if (placeholderIntervalRef.current) {
        clearInterval(placeholderIntervalRef.current);
        placeholderIntervalRef.current = null;
      }
      if (placeholderTimeoutRef.current) {
        clearTimeout(placeholderTimeoutRef.current);
        placeholderTimeoutRef.current = null;
      }
    };

    const type = () => {
      clearTimers();
      const currentText = placeholderTexts[currentTextIndexRef.current];
      const currentSpeed = isDeletingRef.current ? deletingSpeed : typingSpeed;

      placeholderIntervalRef.current = setInterval(() => {
        if (isDeletingRef.current) {
          // Deleting logic
          if (charIndexRef.current > 0) {
            charIndexRef.current -= 1;
            setDynamicPlaceholder(currentText.substring(0, charIndexRef.current));
          } else {
            // Finished deleting current sentence
            isDeletingRef.current = false;
            // Move to the next sentence (looping back to 0 if needed)
            currentTextIndexRef.current = (currentTextIndexRef.current + 1) % placeholderTexts.length;
            clearTimers();
            // Pause before typing the next sentence
            placeholderTimeoutRef.current = setTimeout(type, pauseAtEnd);
          }
        } else {
          // Typing logic
          if (charIndexRef.current < currentText.length) {
            charIndexRef.current += 1;
            setDynamicPlaceholder(currentText.substring(0, charIndexRef.current));
          } else {
            // Finished typing current sentence
            isDeletingRef.current = true;
            clearTimers();
            // Pause before deleting
            placeholderTimeoutRef.current = setTimeout(type, pauseBetweenSentences);
          }
        }
      }, currentSpeed);
    };
    setDynamicPlaceholder("Enter product website URL to get started (e.g., example.com)");
    return () => {
      clearTimers();
    };
  }, []); 

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.ant-modal-root')) {
        return; // 如果点击在 Modal 内，则不执行关闭侧边栏的操作
      }

      // 检查侧边栏是否打开，ref 是否已绑定，以及点击的目标是否不在侧边栏内部
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        toggleSidebar(); // 调用收起侧边栏的函数
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen, toggleSidebar]); 

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openHistoryList') === 'true') {
      setIsSidebarOpen(true);
      const currentUrl = new URL(window.location);
      currentUrl.searchParams.delete('openHistoryList');
      window.history.replaceState(null, '', currentUrl.toString());
    }
  }, [setIsSidebarOpen]);

  const getPageObjectByResultId = async (resultId) => {
    try {
      let currentMainProduct = mainProduct;
      if (isRecoveryMode && chatHistory && Array.isArray(chatHistory.data) && chatHistory.data.length > 0) {
        const firstUserMessage = chatHistory.data[chatHistory.data.length - 1];
        if (firstUserMessage) {
          currentMainProduct = firstUserMessage.message;
        }
      }

      const foundWebsiteIdObject = await getMatchedWebsiteId(currentMainProduct);
      setCurrentWebsiteId(foundWebsiteIdObject.websiteId);
      
      // 1. 通过websiteId获取result列表
      const response = await apiClient.getAlternativeWebsiteResultList(foundWebsiteIdObject.websiteId);
      
      if (!response || !response.data) {
        messageApi.error('Failed to get page list');
        return null;
      }
      
      // 2. 从result数组中匹配resultId相同的page对象
      const pageObject = response.data.find(item => item.resultId === resultId);
      
      if (!pageObject) {
        messageApi.error('Page not found');
        return null;
      }
      
      // 3. 返回找到的page对象
      return pageObject;
    } catch (error) {
      console.error('Failed to get page object:', error);
      messageApi.error('Failed to get page information');
      return null;
    }
  };

  const handlePublishButtonClick = async (activeTab, buttonType = 'main_button') => {
    trackPublishClick(buttonType, {
      active_tab: activeTab,
      browser_tabs_count: browserTabs.length
    });
    
    messageApi.loading('Getting page information...');
    
    let resultId = activeTab;
    if (typeof activeTab === 'string' && activeTab.startsWith('result-')) {
      resultId = activeTab.replace('result-', '');
    }
    
    const pageObject = await getPageObjectByResultId(resultId);
    
    if (pageObject) {
      setSelectedPage(pageObject);
      setIsPublishPageModalVisible(true);
    }
  };

  const [competitorModalMode, setCompetitorModalMode] = useState('add'); // 'add' 或 'edit'

  // 根据当前路径获取对应的slogan内容
  const getSloganContent = () => {
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
      // 默认slogan (alternativepage)
      return {
        title: "Get Found When People Search Your Competitor",
        description: "Own all your competitor's brand search traffic with AI-generated pages that outrank.",
      };
    }
  };
  
  const sloganContent = getSloganContent();

  const isDomainListMessage = (message) => {
    if (!message || typeof message !== 'string') {
      return false;
    }
  
    // 去除空格和换行，统一格式
    const cleanMessage = message.trim();
    
    // 检查是否以指定文本开头
    if (!cleanMessage.startsWith("Here's the list of competitors, please guide user to select from this list:")) {
      return false;
    }
    
    // 检查是否主要由域名URL组成（用逗号分隔）
    const urlPattern = /^Here's the list of competitors, please guide user to select from this list: https?:\/\/[^,\s]+(?:\s*,\s*https?:\/\/[^,\s]+)*$/;
    
    if (urlPattern.test(cleanMessage)) {
      const domains = cleanMessage.replace("Here's the list of competitors, please guide user to select from this list:", "")
        .split(',')
        .map(d => d.trim())
        .filter(d => d.length > 0);
      
      // 验证每个都是有效的URL
      const validUrls = domains.filter(domain => {
        try {
          return /^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.([a-zA-Z]{2,})/i.test(domain);
        } catch (e) {
          return false;
        }
      });
      
      // 如果有3个或以上的域名，且都是有效URL，则认为是域名列表消息
      return domains.length >= 3 && validUrls.length === domains.length;
    }
    
    return false;
  };

  // 在组件开始处添加PostHog hook
  const posthog = usePostHog();
  
  // 统一的publish按钮埋点函数
  const trackPublishClick = useCallback((buttonType, additionalData = {}) => {
    if (posthog) {
      posthog.capture('publish_button_clicked', {
        button_type: buttonType, // 'tab_icon', 'main_button', 'sidebar_button'
        timestamp: new Date().toISOString(),
        current_path: pathname,
        conversation_id: currentConversationId,
        ...additionalData
      });
    }
  }, [posthog, pathname, currentConversationId]);

  if (loading) {
    return <PageLoading message="Initializing data..." />
  }

  const isEntryPage = !conversationId;
  return (
    <>
      {contextHolder}
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
                  margin: isEntryPage ? 'auto 0' : '0 auto', // 只在isEntryPage时垂直居中
                  padding: '2rem',
                  textAlign: 'center',
                  width: '100%' // 确保宽度占满
                }}>
                  {/* 新增顶部区域 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '356px', // 更新宽度为356px
                    height: '52px', // 更新高度为52px
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
                      <path d="M15.2724 8.1089C15.1104 7.9945 14.925 7.91757 14.7296 7.88367C14.5342 7.84978 14.3337 7.85977 14.1426 7.91292C13.9515 7.96607 13.7747 8.06106 13.6249 8.19099C13.475 8.32093 13.356 8.48256 13.2763 8.66419L12.6438 10.5863C12.49 11.0488 12.2306 11.469 11.8861 11.8138C11.5416 12.1586 11.1216 12.4183 10.6593 12.5725L8.8209 13.1697C8.55961 13.2606 8.33366 13.4317 8.17525 13.6585C8.05294 13.8304 7.97327 14.029 7.94283 14.2378C7.91238 14.4466 7.93203 14.6597 8.00016 14.8594C8.06828 15.0591 8.18293 15.2398 8.33463 15.3865C8.48633 15.5331 8.67075 15.6416 8.87265 15.703L10.6921 16.2944C11.1547 16.4479 11.5752 16.707 11.9202 17.0512C12.2652 17.3953 12.5254 17.8152 12.68 18.2774L13.2771 20.1149C13.369 20.3752 13.5395 20.6006 13.7651 20.7597C13.992 20.9162 14.2612 21 14.5368 21C14.8125 21 15.0816 20.9162 15.3085 20.7597C15.5376 20.5977 15.71 20.3679 15.8014 20.1026L16.406 18.242C16.5602 17.7918 16.8148 17.3826 17.1505 17.0454C17.4862 16.7081 17.8942 16.4516 18.3437 16.2953L20.1837 15.6989C20.4455 15.6063 20.672 15.4345 20.8316 15.2072C20.9912 14.98 21.076 14.7086 21.0742 14.4309C21.0724 14.1532 20.9841 13.883 20.8215 13.6578C20.659 13.4327 20.4303 13.2638 20.1673 13.1746L18.347 12.5832C17.7569 12.3852 17.2381 12.0178 16.8553 11.5269C16.6368 11.2451 16.4684 10.9289 16.3575 10.5904L15.7595 8.75536C15.6675 8.49415 15.4966 8.26826 15.2708 8.1089M7.26675 3.11461C7.09957 2.99647 6.89975 2.93331 6.69504 2.9339C6.49171 2.93327 6.29317 2.99553 6.12661 3.11215C5.95513 3.23323 5.82678 3.4059 5.76025 3.60501L5.45468 4.5439C5.39005 4.73883 5.28091 4.91603 5.13591 5.06146C4.99091 5.20689 4.81403 5.31655 4.61929 5.38176L3.6615 5.69226C3.46835 5.76087 3.30112 5.88752 3.18274 6.05486C3.06437 6.22221 3.00063 6.42206 3.00025 6.62704C3.00025 6.83739 3.06754 7.04222 3.19227 7.2116C3.31701 7.38097 3.49266 7.506 3.69354 7.5684L4.63326 7.87233C4.82827 7.93704 5.00553 8.04631 5.15096 8.19146C5.2964 8.33661 5.40601 8.51365 5.47111 8.70854L5.78325 9.66386C5.85057 9.85884 5.97736 10.0278 6.14575 10.1469C6.31415 10.266 6.51567 10.3293 6.72194 10.3279C6.9282 10.3264 7.12881 10.2603 7.29552 10.1388C7.46222 10.0173 7.58662 9.84663 7.65118 9.65072L7.9584 8.70936C8.02135 8.51698 8.12764 8.34161 8.26905 8.19678C8.41047 8.05194 8.58325 7.94151 8.77407 7.87397L9.73186 7.56347C9.92546 7.49509 10.0931 7.36843 10.2118 7.2009C10.3305 7.03336 10.3944 6.83318 10.3948 6.62786C10.3945 6.42079 10.3291 6.21904 10.2078 6.05124C10.0864 5.88345 9.91531 5.75813 9.71872 5.69308L8.779 5.38751C8.58323 5.32296 8.40539 5.21327 8.25984 5.06729C8.11429 4.92131 8.00512 4.74315 7.94114 4.54719L7.62982 3.59186C7.56189 3.39886 7.43557 3.23178 7.2684 3.11379" fill="#357BF7"/>
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
                  
                  {/* 修改后的小标题 */}
                  <h2 style={{ 
                    color: 'var(--Gray-7, #8C8C8C)',
                    textAlign: 'center',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '22px',
                    marginBottom: '2rem'
                  }}>
                    {sloganContent.subtitle1} {sloganContent.subtitle2}
                  </h2>
                  
                  <h3 style={{ 
                    color: '#BFBFBF',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    margin: '0 auto',
                    marginBottom: isEntryPage ? '2rem' : '0' // 在isEntryPage模式下增加底部边距
                  }}>
                    {sloganContent.description}
                  </h3>
                  
                  {isEntryPage && (
                    <>
                      {/* 在isEntryPage模式下，直接在这里放置输入框 */}
                      <div className="max-w-[600px] mx-auto mt-4">
                        <div className="relative">
                          <style jsx>{`
                            .research-tool-input::placeholder {
                              color: #9ca3af; /* Default placeholder color */
                              opacity: 0.8;
                            }
                          `}</style>
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
                                  borderRadius: '1rem', // 16px
                                  padding: '1px', // 边框宽度
                                  background: currentTheme === 'dark' ? 'linear-gradient(101deg, rgba(150, 56, 7, 1) 20.01%, rgba(255, 255, 255, 0.15) 92.85%)' : 'linear-gradient(101deg, rgba(51, 111, 255, 1) 20.01%, rgba(166, 113, 252, 0.3) 56.73%, rgba(245, 137, 79, 0.1) 92.85%)',
                                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                  WebkitMaskComposite: 'xor',
                                  maskComposite: 'exclude',
                                  pointerEvents: 'none',
                                }}
                              />
                              {/* 输入框内容 */}
                              {selectedCompetitors.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                  {/* 竞争对手标签 */}
                                </div>
                              )}
                              <Input.TextArea
                                autoComplete="off"
                                name="no-autofill"
                                ref={inputRef}
                                value={userInput}
                                autoSize={{ minRows: 2, maxRows: 6 }}
                                onChange={(e) => {
                                  setUserInput(e.target.value);
                                  if (e.target.value === '') {
                                    setSelectedCompetitors([]);
                                  }
                                }}
                                disabled={loading || isMessageSending || isProcessingTask || selectedCompetitors.length > 0}
                                placeholder={
                                  selectedCompetitors.length > 0
                                    ? "Just select cards to start the task"
                                    : !(loading || isMessageSending || isProcessingTask)
                                      ? "Please enter your website domain...."
                                      : "Agent is working, please keep waiting..."
                                }
                                className={`bg-transparent border-none shadow-none text-base ${isHydrated ? themeStyles.inputArea.text : 'text-white'} ${isHydrated ? themeStyles.inputArea.placeholder : 'placeholder-gray-400'}`}
                                style={{
                                  minHeight: '48px',
                                  background: 'transparent',
                                  color: isHydrated ? (themeStyles.inputArea.text === 'text-white' ? '#fff' : '#000') : '#fff',
                                  boxShadow: 'none',
                                  outline: 'none',
                                  border: 'none',
                                  paddingLeft: 0,
                                  paddingRight: 0,
                                  caretColor: isHydrated ? themeStyles.inputArea.caretColor : '#fff',
                                }}
                                onFocus={e => {
                                  e.target.style.background = 'transparent';
                                  e.target.style.color = isHydrated ? (themeStyles.inputArea.text === 'text-white' ? '#fff' : '#000') : '#fff';
                                  e.target.style.outline = 'none';
                                  e.target.style.boxShadow = 'none';
                                  e.target.style.border = 'none';
                                }}
                                onBlur={e => {
                                  e.target.style.background = 'transparent';
                                  e.target.style.color = isHydrated ? (themeStyles.inputArea.text === 'text-white' ? '#fff' : '#000') : '#fff';
                                  e.target.style.outline = 'none';
                                  e.target.style.boxShadow = 'none';
                                  e.target.style.border = 'none';
                                }}
                                onPressEnter={(e) => {
                                  if (e.shiftKey) {
                                    return; 
                                  }
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (userInput.trim() && !loading && !isMessageSending && selectedCompetitors.length === 0) {
                                    handleUserInput(e);
                                  }
                                }}
                              />
                              <div className="flex justify-between items-end mt-1">
                                {/* 按钮区域 */}
                                <div className="flex items-center gap-2">
                                  {/* 按钮内容 */}
                                </div>
                                <button
                                  onClick={(e) => {
                                    if (userInput.trim() && !loading && !isMessageSending && selectedCompetitors.length === 0) {
                                      handleUserInput(e);
                                    } else if (selectedCompetitors.length > 0) {
                                      handleStartGenerationFromModal({
                                        hubPageIds: selectedCompetitors.map(comp => comp.hubPageId),
                                        conversationId: currentConversationId,
                                        websiteId: selectedCompetitors[0].websiteId
                                      });
                                    }
                                  }}
                                  disabled={loading || isMessageSending || isProcessingTask || (!userInput.trim() && selectedCompetitors.length === 0)}
                                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${isHydrated ? themeStyles.sendButton.background : 'bg-gradient-to-r from-blue-500 to-indigo-600'} ${isHydrated ? themeStyles.sendButton.backgroundHover : 'hover:from-blue-600 hover:to-indigo-700'} ${isHydrated ? themeStyles.sendButton.shadow : 'shadow-md'} ${isHydrated ? themeStyles.sendButton.shadowHover : 'hover:shadow-lg'} ${isHydrated ? themeStyles.sendButton.scale : 'hover:scale-105'} ${loading || isMessageSending || isProcessingTask || (!userInput.trim() && selectedCompetitors.length === 0) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                  style={{ 
                                    width: selectedCompetitors.length > 0 ? 'auto' : '40px',
                                    height: '40px',
                                    minWidth: selectedCompetitors.length > 0 ? '160px' : '40px',
                                    padding: selectedCompetitors.length > 0 ? '0 16px' : '0',
                                    borderRadius: isHydrated ? (themeStyles.sendButton?.borderRadius || '10px') : '10px',
                                    border: isHydrated ? (themeStyles.sendButton?.border || '1px solid #D9E3F0') : '1px solid #D9E3F0',
                                    background: (loading || isMessageSending || (selectedCompetitors.length === 0 && !userInput.trim()))
                                      ? (isHydrated && currentTheme === 'dark' ? 'rgb(55 65 81 / 0.6)' : 'rgb(156 163 175)')
                                      : currentTheme === 'dark' 
                                        ? 'linear-gradient(115deg, #AA450B -2.53%, #231109 26.44%, #10132D 48.59%, #101834 68.22%, #0D47A6 96.36%)'
                                        : 'linear-gradient(101deg, #336FFF 20.01%, #A671FC 56.73%, #F5894F 92.85%)',
                                    boxShadow: isHydrated ? (themeStyles.sendButton?.shadow || 'none') : 'none',
                                    color: 'white'
                                  }}
                                >
                                  <img 
                                    src="/images/send-button-icon.png" 
                                    alt="Send" 
                                    className="w-5 h-5" 
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-center gap-6 mt-8">
                        {/* 卡片1 */}
                        <div style={{
                          width: '220px',
                          height: '144px',
                          flexShrink: 0,
                          borderRadius: '10px',
                          border: currentTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(217, 227, 240, 1)',
                          background: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: currentTheme === 'dark' ? 'none' : '0px 2px 8px rgba(0, 0, 0, 0.05)'
                        }}
                          className="group hover:cursor-pointer">
                          {/* 悬浮背景 */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="220" height="144" viewBox="0 0 220 144" fill="none" className="absolute inset-0">
                              <g filter="url(#filter0_f_3152_3643)">
                                <ellipse cx="59.6135" cy="53.739" rx="59.6135" ry="53.739" transform="matrix(-0.557461 -0.830203 0.812142 -0.58346 122.398 46.3335)" fill="#FFC632"/>
                              </g>
                              <g filter="url(#filter1_f_3152_3643)">
                                <path d="M126.812 30.0101C166.234 57.9114 155.386 105.521 170.218 113.321C188.863 123.127 207.487 83.796 201.357 60.473C194.132 32.9815 100.096 11.1018 126.812 30.0101Z" fill="#3A4DF7"/>
                              </g>
                              <g filter="url(#filter2_f_3152_3643)">
                                <path d="M174.918 61.9892C183.275 74.4351 193.602 75.689 202.23 69.4903C220.234 56.5559 152.865 -57.9068 126.679 -63.7573C107.435 -68.057 92.9501 -55.3267 96.0871 -38.475C99.6322 -19.431 97.811 -19.1507 112.348 -8.38182C124.478 0.603512 140.076 9.4047 152.353 20.0335C163.845 29.9819 167.494 50.9339 174.918 61.9892Z" fill="#3429FD" fillOpacity="0.4"/>
                              </g>
                              <defs>
                                <filter id="filter0_f_3152_3643" x="-23.2696" y="-194.328" width="312.158" height="319.632" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                                  <feGaussianBlur stdDeviation="50.6104" result="effect1_foregroundBlur_3152_3643"/>
                                </filter>
                                <filter id="filter1_f_3152_3643" x="14.0781" y="-85.0538" width="296.438" height="307.883" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                                  <feGaussianBlur stdDeviation="53.9844" result="effect1_foregroundBlur_3152_3643"/>
                                </filter>
                                <filter id="filter2_f_3152_3643" x="-12.3106" y="-172.568" width="325.525" height="353.66" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                                  <feGaussianBlur stdDeviation="53.9844" result="effect1_foregroundBlur_3152_3643"/>
                                </filter>
                              </defs>
                            </svg>
                          </div>
                          
                          <div className="relative z-10 w-[28px] h-[28px]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none"
                              className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                              <path d="M6.08948 17.3231C5.80396 17.7665 5.57312 18.2434 5.40607 18.7385H7.98177V15.4186C7.2285 15.9107 6.58457 16.5577 6.08948 17.3231ZM19.4023 15.4186V18.7385H21.978C21.811 18.2434 21.5801 17.7665 21.2946 17.3231C20.805 16.5621 20.1601 15.9132 19.4023 15.4186ZM17.4584 8.13195L13.692 3.66699L9.92569 8.13195V18.7385H17.4584V8.13195ZM13.692 12.0563C13.3105 12.0485 12.9473 11.8914 12.6802 11.6189C12.4131 11.3463 12.2636 10.9799 12.2636 10.5983C12.2636 10.2167 12.4131 9.85031 12.6802 9.57774C12.9473 9.30518 13.3105 9.14815 13.692 9.14036C14.0736 9.14815 14.4368 9.30518 14.7039 9.57774C14.971 9.85031 15.1205 10.2167 15.1205 10.5983C15.1205 10.9799 14.971 11.3463 14.7039 11.6189C14.4368 11.8914 14.0736 12.0485 13.692 12.0563Z" fill="white" fillOpacity="0.1"/>
                              <path d="M24.3832 20.8037C24.3832 17.414 22.3967 14.486 19.5234 13.1222V8.08621C19.5234 7.62757 19.3624 7.18411 19.0647 6.83481L14.4357 1.34626C14.2414 1.11542 13.965 1 13.6916 1C13.4182 1 13.1418 1.11542 12.9474 1.34626L8.31846 6.83481C8.02282 7.18483 7.86037 7.62805 7.85981 8.08621V13.1222C4.98645 14.486 3 17.414 3 20.8037H7.7535C7.68365 21.0224 7.6472 21.2593 7.6472 21.5266C7.6472 22.1979 7.87804 22.854 8.2972 23.3734C8.63933 23.7982 9.09246 24.1199 9.60631 24.3028C10.3079 25.943 11.9026 27 13.6916 27C14.5755 27 15.432 26.7388 16.164 26.2467C16.8808 25.7668 17.4367 25.0956 17.7738 24.3028C18.2875 24.121 18.7406 23.8003 19.0829 23.3764C19.5027 22.8523 19.7319 22.2011 19.7329 21.5297C19.7329 21.2745 19.6995 21.0315 19.6388 20.8068L24.3832 20.8037ZM7.98131 18.7383H5.40561C5.57266 18.2432 5.80351 17.7664 6.08902 17.3229C6.58411 16.5575 7.22804 15.9105 7.98131 15.4185V18.7383ZM9.92523 8.13178L13.6916 3.66682L17.4579 8.13178V18.7383H9.92523V8.13178ZM17.218 22.2678C17.06 22.3589 16.8778 22.3953 16.6986 22.371L16.1063 22.2981L16.0213 22.8874C15.8572 24.0386 14.8549 24.9072 13.6916 24.9072C12.5283 24.9072 11.5259 24.0386 11.3619 22.8874L11.2769 22.2951L10.6846 22.371C10.5045 22.3925 10.3223 22.3552 10.1652 22.2647C9.90093 22.1129 9.73692 21.8304 9.73692 21.5236C9.73692 21.2016 9.91612 20.9343 10.1804 20.8007H17.2058C17.4731 20.9374 17.6493 21.2047 17.6493 21.5236C17.6463 21.8334 17.4822 22.1189 17.218 22.2678ZM19.4019 18.7383V15.4185C20.1597 15.913 20.8045 16.562 21.2942 17.3229C21.5797 17.7664 21.8105 18.2432 21.9776 18.7383H19.4019Z" fill="#357BF7"/>
                              <path d="M12.2336 10.5981C12.2336 10.9848 12.3872 11.3556 12.6607 11.6291C12.9341 11.9025 13.3049 12.0561 13.6916 12.0561C14.0783 12.0561 14.4491 11.9025 14.7225 11.6291C14.9959 11.3556 15.1495 10.9848 15.1495 10.5981C15.1495 10.2115 14.9959 9.84063 14.7225 9.56721C14.4491 9.29379 14.0783 9.14019 13.6916 9.14019C13.3049 9.14019 12.9341 9.29379 12.6607 9.56721C12.3872 9.84063 12.2336 10.2115 12.2336 10.5981Z" fill="#357BF7"/>
                            </svg>

                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none" className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <path d="M24.3832 20.8037C24.3832 17.414 22.3967 14.486 19.5234 13.1222V8.08621C19.5234 7.62757 19.3624 7.18411 19.0647 6.83481L14.4357 1.34626C14.2414 1.11542 13.965 1 13.6916 1C13.4182 1 13.1418 1.11542 12.9474 1.34626L8.31846 6.83481C8.02282 7.18483 7.86037 7.62805 7.85981 8.08621V13.1222C4.98645 14.486 3 17.414 3 20.8037H7.7535C7.68365 21.0224 7.6472 21.2593 7.6472 21.5266C7.6472 22.1979 7.87804 22.854 8.2972 23.3734C8.63933 23.7982 9.09246 24.1199 9.60631 24.3028C10.3079 25.943 11.9026 27 13.6916 27C14.5755 27 15.432 26.7388 16.164 26.2467C16.8808 25.7668 17.4367 25.0956 17.7738 24.3028C18.2875 24.121 18.7406 23.8003 19.0829 23.3764C19.5027 22.8523 19.7319 22.2011 19.7329 21.5297C19.7329 21.2745 19.6995 21.0315 19.6388 20.8068L24.3832 20.8037ZM7.98131 18.7383H5.40561C5.57266 18.2432 5.80351 17.7664 6.08902 17.3229C6.58411 16.5575 7.22804 15.9105 7.98131 15.4185V18.7383ZM9.92523 8.13178L13.6916 3.66682L17.4579 8.13178V18.7383H9.92523V8.13178ZM17.218 22.2678C17.06 22.3589 16.8778 22.3953 16.6986 22.371L16.1063 22.2981L16.0213 22.8874C15.8572 24.0386 14.8549 24.9072 13.6916 24.9072C12.5283 24.9072 11.5259 24.0386 11.3619 22.8874L11.2769 22.2951L10.6846 22.371C10.5045 22.3925 10.3223 22.3552 10.1652 22.2647C9.90093 22.1129 9.73692 21.8304 9.73692 21.5236C9.73692 21.2016 9.91612 20.9343 10.1804 20.8007H17.2058C17.4731 20.9374 17.6493 21.2047 17.6493 21.5236C17.6463 21.8334 17.4822 22.1189 17.218 22.2678ZM19.4019 18.7383V15.4185C20.1597 15.913 20.8045 16.562 21.2942 17.3229C21.5797 17.7664 21.8105 18.2432 21.9776 18.7383H19.4019Z" fill="url(#paint0_radial_3136_3724)"/>
                              <path d="M12.2336 10.5981C12.2336 10.9848 12.3872 11.3556 12.6607 11.6291C12.9341 11.9025 13.3049 12.0561 13.6916 12.0561C14.0783 12.0561 14.4491 11.9025 14.7225 11.6291C14.9959 11.3556 15.1495 10.9848 15.1495 10.5981C15.1495 10.2115 14.9959 9.84063 14.7225 9.56721C14.4491 9.29379 14.0783 9.14019 13.6916 9.14019C13.3049 9.14019 12.9341 9.29379 12.6607 9.56721C12.3872 9.84063 12.2336 10.2115 12.2336 10.5981Z" fill="url(#paint1_radial_3136_3724)"/>
                              <defs>
                                <radialGradient id="paint0_radial_3136_3724" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(13.6916 27) rotate(-77.5724) scale(26.6238 75.1975)">
                                  <stop stopColor="#FFED4B"/>
                                  <stop offset="0.216346" stopColor="#FF92AB"/>
                                  <stop offset="0.55114" stopColor="#8F85FF"/>
                                  <stop offset="0.953927" stopColor="#0251FF"/>
                                </radialGradient>
                                <radialGradient id="paint1_radial_3136_3724" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(13.6916 27) rotate(-77.5724) scale(26.6238 75.1975)">
                                  <stop stopColor="#FFED4B"/>
                                  <stop offset="0.216346" stopColor="#FF92AB"/>
                                  <stop offset="0.55114" stopColor="#8F85FF"/>
                                  <stop offset="0.953927" stopColor="#0251FF"/>
                                </radialGradient>
                              </defs>
                            </svg>
                          </div>
                          
                          <div className="text-center relative z-10">
                            <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-[#262626]'}`}>Create Your First Page</p>
                            <p className="text-[#8C8C8C] text-xs mt-1">Generate alternative Pages, best pages or faq pages for your website</p>
                          </div>
                        </div>

                        {/* 卡片2 */}
                        <div style={{
                          width: '220px',
                          height: '144px',
                          flexShrink: 0,
                          borderRadius: '10px',
                          border: currentTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(217, 227, 240, 1)',
                          background: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: currentTheme === 'dark' ? 'none' : '0px 2px 8px rgba(0, 0, 0, 0.05)'
                        }}
                        className="group hover:cursor-pointer">
                        {/* 悬浮背景 */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" width="220" height="144" viewBox="0 0 220 144" fill="none" className="absolute inset-0">
                            <g filter="url(#filter0_f_3152_3643)">
                              <ellipse cx="59.6135" cy="53.739" rx="59.6135" ry="53.739" transform="matrix(-0.557461 -0.830203 0.812142 -0.58346 122.398 46.3335)" fill="#FFC632"/>
                            </g>
                            <g filter="url(#filter1_f_3152_3643)">
                              <path d="M126.812 30.0101C166.234 57.9114 155.386 105.521 170.218 113.321C188.863 123.127 207.487 83.796 201.357 60.473C194.132 32.9815 100.096 11.1018 126.812 30.0101Z" fill="#3A4DF7"/>
                            </g>
                            <g filter="url(#filter2_f_3152_3643)">
                              <path d="M174.918 61.9892C183.275 74.4351 193.602 75.689 202.23 69.4903C220.234 56.5559 152.865 -57.9068 126.679 -63.7573C107.435 -68.057 92.9501 -55.3267 96.0871 -38.475C99.6322 -19.431 97.811 -19.1507 112.348 -8.38182C124.478 0.603512 140.076 9.4047 152.353 20.0335C163.845 29.9819 167.494 50.9339 174.918 61.9892Z" fill="#3429FD" fillOpacity="0.4"/>
                            </g>
                            <defs>
                              <filter id="filter0_f_3152_3643" x="-23.2696" y="-194.328" width="312.158" height="319.632" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                                <feGaussianBlur stdDeviation="50.6104" result="effect1_foregroundBlur_3152_3643"/>
                              </filter>
                              <filter id="filter1_f_3152_3643" x="14.0781" y="-85.0538" width="296.438" height="307.883" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                                <feGaussianBlur stdDeviation="53.9844" result="effect1_foregroundBlur_3152_3643"/>
                              </filter>
                              <filter id="filter2_f_3152_3643" x="-12.3106" y="-172.568" width="325.525" height="353.66" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                                <feGaussianBlur stdDeviation="53.9844" result="effect1_foregroundBlur_3152_3643"/>
                              </filter>
                            </defs>
                          </svg>
                        </div>

                        <div className="relative z-10 w-[28px] h-[28px]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none"
                            className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                            <path d="M5.03125 22.9688H22.9688V5.03125H5.03125V22.9688ZM14.3145 16.8711H19.373C19.4852 16.8711 19.5781 16.9695 19.5781 17.0898V18.4023C19.5781 18.5227 19.4852 18.6211 19.373 18.6211H14.3145C14.2023 18.6211 14.1094 18.5227 14.1094 18.4023V17.0898C14.1094 16.9695 14.2023 16.8711 14.3145 16.8711ZM8.42188 16.6879C8.42188 16.625 8.45195 16.5621 8.50117 16.5211L11.5035 14L8.50117 11.4789C8.47604 11.4591 8.45581 11.4337 8.44206 11.4048C8.42831 11.3758 8.4214 11.3441 8.42188 11.3121V9.59766C8.42188 9.41172 8.63789 9.31055 8.78008 9.43086L14.0301 13.8305C14.1367 13.918 14.1367 14.0793 14.0301 14.1668L8.78008 18.5691C8.63789 18.6895 8.42188 18.5883 8.42188 18.4023V16.6879Z" fill="white" fillOpacity="0.1"/>
                            <path d="M24.0625 3.0625H3.9375C3.45352 3.0625 3.0625 3.45352 3.0625 3.9375V24.0625C3.0625 24.5465 3.45352 24.9375 3.9375 24.9375H24.0625C24.5465 24.9375 24.9375 24.5465 24.9375 24.0625V3.9375C24.9375 3.45352 24.5465 3.0625 24.0625 3.0625ZM22.9688 22.9688H5.03125V5.03125H22.9688V22.9688Z" fill="#357BF7"/>
                            <path d="M8.77999 18.5692L14.03 14.1668C14.1366 14.0793 14.1366 13.918 14.03 13.8305L8.77999 9.43086C8.74829 9.40391 8.70953 9.38662 8.6683 9.38104C8.62708 9.37546 8.58511 9.38183 8.5474 9.3994C8.50969 9.41696 8.4778 9.44497 8.45554 9.48012C8.43327 9.51526 8.42155 9.55605 8.42178 9.59766V11.3121C8.42178 11.3777 8.44913 11.4379 8.50108 11.4789L11.5034 14L8.50108 16.5211C8.47664 16.5416 8.4569 16.5671 8.44322 16.5958C8.42953 16.6246 8.42222 16.656 8.42178 16.6879V18.4024C8.42178 18.5883 8.6378 18.6895 8.77999 18.5692ZM14.1093 18.4024C14.1093 18.5227 14.2023 18.6211 14.3144 18.6211H19.373C19.4851 18.6211 19.578 18.5227 19.578 18.4024V17.0899C19.578 16.9696 19.4851 16.8711 19.373 16.8711H14.3144C14.2023 16.8711 14.1093 16.9696 14.1093 17.0899V18.4024Z" fill="#357BF7"/>
                          </svg>

                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none" className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <path d="M24.0625 3.0625H3.9375C3.45352 3.0625 3.0625 3.45352 3.0625 3.9375V24.0625C3.0625 24.5465 3.45352 24.9375 3.9375 24.9375H24.0625C24.5465 24.9375 24.9375 24.5465 24.9375 24.0625V3.9375C24.9375 3.45352 24.5465 3.0625 24.0625 3.0625ZM22.9688 22.9688H5.03125V5.03125H22.9688V22.9688Z" fill="url(#paint0_radial_4010_5259)"/>
                          <path d="M8.77999 18.5692L14.03 14.1668C14.1366 14.0793 14.1366 13.918 14.03 13.8305L8.77999 9.43086C8.74829 9.40391 8.70953 9.38662 8.6683 9.38104C8.62708 9.37546 8.58511 9.38183 8.5474 9.3994C8.50969 9.41696 8.4778 9.44497 8.45554 9.48012C8.43327 9.51526 8.42155 9.55605 8.42178 9.59766V11.3121C8.42178 11.3777 8.44913 11.4379 8.50108 11.4789L11.5034 14L8.50108 16.5211C8.47664 16.5416 8.4569 16.5671 8.44322 16.5958C8.42953 16.6246 8.42222 16.656 8.42178 16.6879V18.4024C8.42178 18.5883 8.6378 18.6895 8.77999 18.5692ZM14.1093 18.4024C14.1093 18.5227 14.2023 18.6211 14.3144 18.6211H19.373C19.4851 18.6211 19.578 18.5227 19.578 18.4024V17.0899C19.578 16.9696 19.4851 16.8711 19.373 16.8711H14.3144C14.2023 16.8711 14.1093 16.9696 14.1093 17.0899V18.4024Z" fill="url(#paint1_radial_4010_5259)"/>
                          <defs>
                          <radialGradient id="paint0_radial_4010_5259" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(14 24.9375) rotate(-75) scale(22.6467 76.0887)">
                          <stop stopColor="#FFED4B"/>
                          <stop offset="0.216346" stopColor="#FF92AB"/>
                          <stop offset="0.55114" stopColor="#8F85FF"/>
                          <stop offset="0.953927" stopColor="#0251FF"/>
                          </radialGradient>
                          <radialGradient id="paint1_radial_4010_5259" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(14 24.9375) rotate(-75) scale(22.6467 76.0887)">
                          <stop stopColor="#FFED4B"/>
                          <stop offset="0.216346" stopColor="#FF92AB"/>
                          <stop offset="0.55114" stopColor="#8F85FF"/>
                          <stop offset="0.953927" stopColor="#0251FF"/>
                          </radialGradient>
                          </defs>
                          </svg>
                        </div>
                        
                        
                        <div className="text-center relative z-10">
                          <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-[#262626]'}`}>Bind Your Domain</p>
                          <p className="text-[#8C8C8C] text-xs mt-1">Without domain setup, pages will only work on our subdomain</p>
                        </div>
                        </div>  

                        {/* 卡片3 */}
                        <div style={{
                            width: '220px',
                            height: '144px',
                            flexShrink: 0,
                            borderRadius: '10px',
                            border: currentTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(217, 227, 240, 1)',
                            background: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: currentTheme === 'dark' ? 'none' : '0px 2px 8px rgba(0, 0, 0, 0.05)'
                          }}
                          className="group hover:cursor-pointer">
                          {/* 悬浮背景 */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="220" height="144" viewBox="0 0 220 144" fill="none" className="absolute inset-0">
                              <g filter="url(#filter0_f_3152_3643)">
                                <ellipse cx="59.6135" cy="53.739" rx="59.6135" ry="53.739" transform="matrix(-0.557461 -0.830203 0.812142 -0.58346 122.398 46.3335)" fill="#FFC632"/>
                              </g>
                              <g filter="url(#filter1_f_3152_3643)">
                                <path d="M126.812 30.0101C166.234 57.9114 155.386 105.521 170.218 113.321C188.863 123.127 207.487 83.796 201.357 60.473C194.132 32.9815 100.096 11.1018 126.812 30.0101Z" fill="#3A4DF7"/>
                              </g>
                              <g filter="url(#filter2_f_3152_3643)">
                                <path d="M174.918 61.9892C183.275 74.4351 193.602 75.689 202.23 69.4903C220.234 56.5559 152.865 -57.9068 126.679 -63.7573C107.435 -68.057 92.9501 -55.3267 96.0871 -38.475C99.6322 -19.431 97.811 -19.1507 112.348 -8.38182C124.478 0.603512 140.076 9.4047 152.353 20.0335C163.845 29.9819 167.494 50.9339 174.918 61.9892Z" fill="#3429FD" fillOpacity="0.4"/>
                              </g>
                              <defs>
                                <filter id="filter0_f_3152_3643" x="-23.2696" y="-194.328" width="312.158" height="319.632" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                                  <feGaussianBlur stdDeviation="50.6104" result="effect1_foregroundBlur_3152_3643"/>
                                </filter>
                                <filter id="filter1_f_3152_3643" x="14.0781" y="-85.0538" width="296.438" height="307.883" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                                  <feGaussianBlur stdDeviation="53.9844" result="effect1_foregroundBlur_3152_3643"/>
                                </filter>
                                <filter id="filter2_f_3152_3643" x="-12.3106" y="-172.568" width="325.525" height="353.66" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                                  <feGaussianBlur stdDeviation="53.9844" result="effect1_foregroundBlur_3152_3643"/>
                                </filter>
                              </defs>
                            </svg>
                          </div>

                          <div className="relative z-10 w-[28px] h-[28px]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none"
                              className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                              <path d="M20.8847 5.83127C21.1249 6.4123 21.5861 6.87414 22.1667 7.11526L24.2028 7.95865C24.7838 8.19934 25.2455 8.661 25.4861 9.24208C25.7268 9.82315 25.7268 10.476 25.4861 11.0571L24.6434 13.0918C24.4026 13.6731 24.4023 14.3267 24.6441 14.9077L25.4854 16.9418C25.6047 17.2296 25.6662 17.5381 25.6662 17.8496C25.6663 18.1612 25.6049 18.4697 25.4857 18.7575C25.3665 19.0454 25.1917 19.3069 24.9714 19.5271C24.7511 19.7474 24.4895 19.9221 24.2016 20.0412L22.1671 20.884C21.586 21.1243 21.1242 21.5854 20.8831 22.1661L20.0398 24.2022C19.7991 24.7833 19.3374 25.2449 18.7564 25.4856C18.1753 25.7263 17.5224 25.7263 16.9414 25.4856L14.9068 24.6428C14.3257 24.4027 13.6731 24.4032 13.0924 24.6442L11.0564 25.4864C10.4756 25.7265 9.82332 25.7263 9.24274 25.4858C8.66216 25.2453 8.20077 24.7842 7.95993 24.2038L7.11632 22.167C6.87608 21.586 6.41495 21.1242 5.8343 20.883L3.79825 20.0396C3.21745 19.7991 2.75595 19.3377 2.51518 18.757C2.27441 18.1762 2.27408 17.5236 2.51427 16.9426L3.35702 14.908C3.59711 14.3269 3.59662 13.6742 3.35566 13.0935L2.51411 11.0559C2.3948 10.7681 2.33336 10.4596 2.33331 10.1481C2.33326 9.83653 2.3946 9.52802 2.51382 9.24018C2.63304 8.95234 2.80781 8.69082 3.02814 8.47055C3.24847 8.25029 3.51004 8.0756 3.79791 7.95646L5.83249 7.11368C6.413 6.87364 6.87455 6.41307 7.11583 5.83307L7.95919 3.79695C8.19987 3.21588 8.66152 2.75421 9.24257 2.51352C9.82363 2.27284 10.4765 2.27284 11.0575 2.51352L13.0921 3.35631C13.6732 3.59641 14.3258 3.59592 14.9065 3.35495L16.9434 2.51483C17.5244 2.27428 18.1771 2.27433 18.7581 2.51497C19.339 2.75561 19.8006 3.21714 20.0413 3.79807L20.8849 5.83479L20.8847 5.83127Z" fill="white" fillOpacity="0.1"/>
                              <path d="M10.5 13.9997L12.8333 16.333L18.0833 11.083M20.8847 5.83127C21.1249 6.4123 21.5861 6.87414 22.1667 7.11526L24.2028 7.95865C24.7838 8.19934 25.2455 8.661 25.4861 9.24208C25.7268 9.82315 25.7268 10.476 25.4861 11.0571L24.6434 13.0918C24.4026 13.6731 24.4023 14.3267 24.6441 14.9077L25.4854 16.9418C25.6047 17.2296 25.6662 17.5381 25.6662 17.8496C25.6663 18.1612 25.6049 18.4697 25.4857 18.7575C25.3665 19.0454 25.1917 19.3069 24.9714 19.5271C24.7511 19.7474 24.4895 19.9221 24.2016 20.0412L22.1671 20.884C21.586 21.1243 21.1242 21.5854 20.8831 22.1661L20.0398 24.2022C19.7991 24.7833 19.3374 25.2449 18.7564 25.4856C18.1753 25.7263 17.5224 25.7263 16.9414 25.4856L14.9068 24.6428C14.3257 24.4027 13.6731 24.4032 13.0924 24.6442L11.0564 25.4864C10.4756 25.7265 9.82332 25.7263 9.24274 25.4858C8.66216 25.2453 8.20077 24.7842 7.95993 24.2038L7.11632 22.167C6.87608 21.586 6.41495 21.1242 5.8343 20.883L3.79825 20.0396C3.21745 19.7991 2.75595 19.3377 2.51518 18.757C2.27441 18.1762 2.27408 17.5236 2.51427 16.9426L3.35702 14.908C3.59711 14.3269 3.59662 13.6742 3.35566 13.0935L2.51411 11.0559C2.3948 10.7681 2.33336 10.4596 2.33331 10.1481C2.33326 9.83653 2.3946 9.52802 2.51382 9.24018C2.63304 8.95234 2.80781 8.69082 3.02814 8.47055C3.24847 8.25029 3.51004 8.0756 3.79791 7.95646L5.83249 7.11368C6.413 6.87364 6.87455 6.41308 7.11583 5.83307L7.95919 3.79695C8.19987 3.21588 8.66152 2.75421 9.24257 2.51352C9.82363 2.27284 10.4765 2.27284 11.0575 2.51352L13.0921 3.35631C13.6732 3.59641 14.3258 3.59592 14.9065 3.35495L16.9434 2.51483C17.5244 2.27428 18.1771 2.27433 18.7581 2.51497C19.339 2.75561 19.8006 3.21714 20.0413 3.79807L20.8849 5.83479L20.8847 5.83127Z" stroke="#357BF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>

                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none" className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <path d="M23.6663 16.8503C23.6663 16.6704 23.6307 16.4922 23.5618 16.3259V16.3249L22.72 14.2908V14.2898C22.3768 13.4631 22.3774 12.5347 22.7191 11.7097L23.5618 9.67552C23.701 9.33948 23.701 8.96175 23.5618 8.62571C23.4226 8.28966 23.1557 8.02271 22.8196 7.88352L20.7845 7.03977H20.7835C19.9802 6.70619 19.3383 6.07486 18.9896 5.28001C18.9796 5.2599 18.9699 5.23948 18.9612 5.21848L18.1175 3.18138C17.9783 2.8455 17.7112 2.57832 17.3753 2.43919C17.0396 2.30018 16.6623 2.30032 16.3265 2.43919L16.3245 2.44016L14.2874 3.28001L14.2864 3.27903C13.4615 3.62047 12.5354 3.62195 11.7103 3.28099H11.7093L9.67511 2.43821C9.33909 2.29902 8.96132 2.29902 8.62531 2.43821C8.28929 2.5774 8.02231 2.84435 7.88312 3.1804L7.03937 5.21653V5.21751C6.69634 6.04208 6.03948 6.69754 5.21417 7.0388L5.2132 7.03782L3.18097 7.88059L3.17999 7.88157C3.01368 7.95046 2.86199 8.05117 2.73468 8.17845C2.60737 8.30578 2.50671 8.45739 2.43781 8.62376C2.36895 8.79004 2.33334 8.96819 2.33331 9.14817C2.33334 9.32832 2.36883 9.50715 2.43781 9.67356L2.43878 9.67454L3.27863 11.7107C3.62119 12.5363 3.62288 13.4646 3.28156 14.2908L3.28058 14.2917L2.43781 16.324L2.43878 16.3249C2.29987 16.6609 2.29954 17.0389 2.43878 17.3747C2.57803 17.7106 2.8451 17.9778 3.18097 18.1169L5.2171 18.9597L5.21808 18.9607C6.04318 19.3034 6.69878 19.9593 7.04034 20.7849L7.88409 22.822C8.02344 23.1572 8.28996 23.4232 8.62531 23.5622C8.961 23.7013 9.33834 23.702 9.67413 23.5632L11.7103 22.7204C12.5355 22.3784 13.4628 22.3784 14.2884 22.7195H14.2894L16.3245 23.5622C16.6604 23.7013 17.0375 23.7013 17.3734 23.5622C17.7094 23.423 17.9763 23.1561 18.1155 22.82L18.9593 20.7839V20.7829C19.302 19.9577 19.9587 19.3022 20.7845 18.9607L22.8187 18.1179H22.8196C22.9858 18.0491 23.1367 17.9481 23.264 17.821C23.3914 17.6937 23.4929 17.5421 23.5618 17.3757C23.6308 17.2092 23.6663 17.0305 23.6663 16.8503ZM16.3763 9.37669C16.7668 8.98616 17.3998 8.98616 17.7903 9.37669C18.1809 9.76721 18.1809 10.4002 17.7903 10.7908L12.5403 16.0408C12.3528 16.2283 12.0985 16.3337 11.8333 16.3337C11.5681 16.3337 11.3138 16.2283 11.1263 16.0408L8.79327 13.7077L8.72394 13.6316C8.40369 13.2388 8.4272 12.6598 8.79327 12.2937C9.15935 11.9276 9.73839 11.9041 10.1312 12.2243L10.2073 12.2937L11.8333 13.9197L16.3763 9.37669ZM25.6663 16.8503C25.6664 17.2932 25.579 17.7322 25.4095 18.1413C25.24 18.5504 24.9912 18.922 24.678 19.2351C24.4039 19.5091 24.0853 19.7339 23.7357 19.8991L23.5843 19.9656L21.5501 20.8083L21.5491 20.8093C21.2132 20.9483 20.9464 21.2148 20.8069 21.5505L19.9632 23.5857C19.621 24.4116 18.965 25.0677 18.139 25.4099C17.3129 25.7521 16.385 25.7521 15.5589 25.4099L13.5247 24.5671C13.1889 24.4285 12.8115 24.4289 12.4759 24.5681L12.4749 24.5691L10.4388 25.4109C9.61315 25.7523 8.6851 25.7528 7.85968 25.4109C7.08576 25.0902 6.46098 24.4934 6.10382 23.74L6.03644 23.5876L5.19269 21.5505L5.19171 21.5495C5.05273 21.2137 4.78614 20.9467 4.4505 20.8074V20.8064L2.41534 19.9646C1.58964 19.6225 0.933412 18.966 0.591126 18.1404C0.248974 17.3148 0.248728 16.3871 0.590149 15.5613V15.5603L1.43292 13.5261C1.5715 13.1902 1.57121 12.8129 1.43195 12.4773L1.43097 12.4763L0.590149 10.4392L0.530579 10.2849C0.400237 9.92084 0.333398 9.53665 0.333313 9.14915C0.333242 8.70623 0.420654 8.26734 0.590149 7.85813C0.759642 7.44898 1.00839 7.07749 1.32159 6.76438C1.63481 6.45128 2.00614 6.2023 2.41534 6.03294L4.44952 5.19016H4.4505C4.78569 5.05152 5.05204 4.78566 5.19171 4.45091L6.03546 2.41477C6.37762 1.58887 7.03378 0.932739 7.85968 0.590555C8.68565 0.248413 9.61376 0.248508 10.4398 0.590555L12.473 1.43235H12.4739C12.81 1.5712 13.1879 1.5717 13.5237 1.43235L13.5257 1.43138L15.5609 0.592508C16.3868 0.250511 17.315 0.249409 18.1409 0.591532C18.9668 0.933631 19.6229 1.58997 19.9651 2.41575L20.7982 4.42747C20.8015 4.43501 20.8057 4.44227 20.8089 4.44993C20.9478 4.78586 21.2144 5.05267 21.5501 5.19212H21.5491L23.5853 6.03587C24.4114 6.37806 25.0683 7.03399 25.4105 7.86009C25.7525 8.686 25.7524 9.61422 25.4105 10.4402L24.5677 12.4753C24.4456 12.7701 24.4302 13.096 24.5218 13.3972L24.5677 13.5241L24.5687 13.5261L25.4095 15.5593L25.4691 15.7146C25.5993 16.0786 25.6663 16.4629 25.6663 16.8503Z" fill="url(#paint0_radial_4010_5263)"/>
                              <defs>
                              <radialGradient id="paint0_radial_4010_5263" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(13.0001 25.6671) rotate(-74.9997) scale(26.2268 88.119)">
                              <stop stopColor="#FFED4B"/>
                              <stop offset="0.216346" stopColor="#FF92AB"/>
                              <stop offset="0.55114" stopColor="#8F85FF"/>
                              <stop offset="0.953927" stopColor="#0251FF"/>
                              </radialGradient>
                              </defs>
                            </svg>
                          </div>
                          <div className="text-center relative z-10">
                            <p className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-[#262626]'}`}>Bind Your Domain</p>
                            <p className="text-[#8C8C8C] text-xs mt-1">Without domain setup, pages will only work on our subdomain</p>
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
                    <div className={`flex flex-col items-center justify-center p-4 rounded-lg ${isHydrated ? themeStyles.pagesGrid.pageLimitNotice.background : 'bg-slate-800/60'} border ${isHydrated ? themeStyles.pagesGrid.pageLimitNotice.border : 'border-slate-700/50'}`}>
                      <p className={`text-center mb-3 ${isHydrated ? themeStyles.pagesGrid.pageLimitNotice.text : 'text-sm text-white/80'}`}>
                        You have reached the maximum number of pages for this task which is 10. 
                        <br />
                        You can start a new task to generate more pages!
                      </p>
                      <button
                        onClick={() => {
                          const pageMode = getPageMode();
                          let targetUrl = '/alternativepage'; // 默认值
                          
                          if (pageMode === 'best') {
                            targetUrl = '/bestpage';
                          } else if (pageMode === 'faq') {
                            targetUrl = '/faqpage';
                          } else if (pageMode === 'alternative') {
                            targetUrl = '/alternativepage';
                          }
                          
                          window.open(targetUrl, '_blank');
                        }}
                        className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-300 flex items-center gap-2 ${isHydrated ? themeStyles.pagesGrid.pageLimitNotice.button.shadow : 'shadow-md hover:shadow-lg'}
                          ${isHydrated ? `${themeStyles.pagesGrid.pageLimitNotice.button.background} ${themeStyles.pagesGrid.pageLimitNotice.button.backgroundHover}` : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'} 
                          ${isHydrated ? themeStyles.pagesGrid.pageLimitNotice.button.text : 'text-white'} 
                          border ${isHydrated ? themeStyles.pagesGrid.pageLimitNotice.button.border : 'border-blue-600/50'}
                          ${isHydrated ? themeStyles.pagesGrid.pageLimitNotice.button.scale : 'hover:scale-105'}`}
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
                        <style jsx>{`
                          .research-tool-input::placeholder {
                            color: #9ca3af; /* Default placeholder color */
                            opacity: 0.8;
                          }
                        `}</style>
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
                                borderRadius: '1rem', // 16px
                                padding: '1px', // 边框宽度
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
                            <Input.TextArea
                              autoComplete="off"
                              name="no-autofill"
                              ref={inputRef}
                              value={userInput}
                              autoSize={{ minRows: 2, maxRows: 6 }}
                              onChange={(e) => {
                                setUserInput(e.target.value);
                                if (e.target.value === '') {
                                  setSelectedCompetitors([]);
                                }
                              }}
                              disabled={loading || isMessageSending || isProcessingTask || selectedCompetitors.length > 0}
                              placeholder={
                                selectedCompetitors.length > 0
                                  ? "Just select cards to start the task"
                                  : !(loading || isMessageSending || isProcessingTask)
                                    ? "Please enter your website domain...."
                                    : "Agent is working, please keep waiting..."
                              }
                              className={`bg-transparent border-none shadow-none text-base ${isHydrated ? themeStyles.inputArea.text : 'text-white'} ${isHydrated ? themeStyles.inputArea.placeholder : 'placeholder-gray-400'}`}
                              style={{
                                minHeight: '48px',
                                background: 'transparent',
                                color: isHydrated ? (themeStyles.inputArea.text === 'text-white' ? '#fff' : '#000') : '#fff',
                                boxShadow: 'none',
                                outline: 'none',
                                border: 'none',
                                paddingLeft: 0,
                                paddingRight: 0,
                                caretColor: isHydrated ? themeStyles.inputArea.caretColor : '#fff',
                              }}
                              onFocus={e => {
                                e.target.style.background = 'transparent';
                                e.target.style.color = isHydrated ? (themeStyles.inputArea.text === 'text-white' ? '#fff' : '#000') : '#fff';
                                e.target.style.outline = 'none';
                                e.target.style.boxShadow = 'none';
                                e.target.style.border = 'none';
                              }}
                              onBlur={e => {
                                e.target.style.background = 'transparent';
                                e.target.style.color = isHydrated ? (themeStyles.inputArea.text === 'text-white' ? '#fff' : '#000') : '#fff';
                                e.target.style.outline = 'none';
                                e.target.style.boxShadow = 'none';
                                e.target.style.border = 'none';
                              }}
                              onPressEnter={(e) => {
                                if (e.shiftKey) {
                                  return; 
                                }
                                e.preventDefault();
                                e.stopPropagation();
                                if (userInput.trim() && !loading && !isMessageSending && selectedCompetitors.length === 0) {
                                  handleUserInput(e);
                                }
                              }}
                            />
                            <div className="flex justify-between items-end mt-1">
                              <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setShowBrandAssetsModal(true)}
                                className={`group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md rounded-[10px] ${isHydrated ? themeStyles.setBrandColorButton.background : 'bg-[rgba(34,42,65,1)]'} ${isHydrated ? themeStyles.setBrandColorButton.text : 'text-white/80'}`}
                                style={{ 
                                  height: '32px', 
                                  minWidth: '90px'
                                }}
                              >
                                {/* 根据主题显示不同的 SVG 图标 */}
                                {isHydrated && themeStyles.setBrandColorButton.background === 'bg-[#EFF4FF]' ? (
                                  // Light 模式 SVG
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 20" fill="none" className="transition-transform duration-300 group-hover:scale-110">
                                    <path d="M18.0832 7.9999C17.2498 4.74987 14.5832 2.24987 11.3332 1.74987C8.9165 1.33321 6.49984 2.08321 4.6665 3.66654C2.74984 5.24987 1.6665 7.66656 1.6665 10.1666C1.6665 13.8332 3.99984 17.0832 7.4165 18.2499C7.6665 18.3332 7.9165 18.4166 8.24984 18.4166C8.74984 18.4166 9.33317 18.2499 9.74984 17.9166C10.4165 17.4166 10.8332 16.5832 10.8332 15.7499C10.8332 14.5832 11.7498 13.8332 12.9998 13.8332H14.7498C16.7498 13.8332 18.3332 12.2499 18.3332 10.2499C18.3332 9.41656 18.2498 8.7499 18.0832 7.9999ZM14.7498 12.0832H12.9998C10.8332 12.0832 9.1665 13.6666 9.1665 15.6666C9.1665 15.9999 8.99984 16.2499 8.74984 16.4999C8.58317 16.5832 8.33317 16.7499 7.9165 16.6666C5.1665 15.7499 3.33317 13.0832 3.33317 10.1666C3.33317 8.16656 4.1665 6.2499 5.74984 4.91654C6.9165 3.91654 8.4165 3.33321 9.99984 3.33321C10.3332 3.33321 10.7498 3.33321 11.0832 3.41654C13.6665 3.83321 15.8332 5.83323 16.4998 8.41656C16.6665 8.9999 16.7498 9.58323 16.7498 10.1666C16.6665 11.2499 15.8332 12.0832 14.7498 12.0832Z" fill="#404040"/>
                                    <path d="M7.06675 11.8986C7.70859 11.5376 7.93625 10.7246 7.57531 10.0828C7.21431 9.44094 6.40136 9.21328 5.75953 9.57428C5.11772 9.93522 4.89004 10.7482 5.25101 11.39C5.61198 12.0318 6.42492 12.2595 7.06675 11.8986Z" fill="#404040"/>
                                    <path d="M8.89637 7.73237C9.5382 7.37142 9.76587 6.55848 9.40487 5.91665C9.04392 5.27482 8.23098 5.04715 7.58914 5.40812C6.94731 5.76909 6.71964 6.58204 7.08059 7.22387C7.44159 7.8657 8.25453 8.09337 8.89637 7.73237Z" fill="#404040"/>
                                    <path d="M13.3915 8.32051C14.0333 7.95957 14.261 7.14663 13.9 6.50479C13.539 5.86296 12.7261 5.63529 12.0843 5.99624C11.4424 6.35724 11.2148 7.17018 11.5757 7.81201C11.9367 8.45385 12.7496 8.68151 13.3915 8.32051Z" fill="#404040"/>
                                  </svg>
                                ) : (
                                  // Dark 模式 SVG
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 18 18" fill="none" className="transition-transform duration-300 group-hover:scale-110">
                                    <path d="M17.0834 6.99904C16.2501 3.74902 13.5834 1.24902 10.3334 0.749019C7.91675 0.332352 5.50008 1.08235 3.66675 2.66569C1.75008 4.24902 0.666748 6.66571 0.666748 9.16571C0.666748 12.8324 3.00008 16.0824 6.41675 17.249C6.66675 17.3324 6.91675 17.4157 7.25008 17.4157C7.75008 17.4157 8.33341 17.249 8.75008 16.9157C9.41675 16.4157 9.83341 15.5824 9.83341 14.749C9.83341 13.5824 10.7501 12.8324 12.0001 12.8324H13.7501C15.7501 12.8324 17.3334 11.249 17.3334 9.24904C17.3334 8.41571 17.2501 7.74904 17.0834 6.99904ZM13.7501 11.0824H12.0001C9.83341 11.0824 8.16675 12.6657 8.16675 14.6657C8.16675 14.999 8.00008 15.249 7.75008 15.499C7.58341 15.5824 7.33341 15.749 6.91675 15.6657C4.16675 14.749 2.33341 12.0824 2.33341 9.16571C2.33341 7.16571 3.16675 5.24904 4.75008 3.91569C5.91675 2.91569 7.41675 2.33235 9.00008 2.33235C9.33341 2.33235 9.75008 2.33235 10.0834 2.41569C12.6667 2.83235 14.8334 4.83237 15.5001 7.41571C15.6667 7.99904 15.7501 8.58237 15.7501 9.16571C15.6667 10.249 14.8334 11.0824 13.7501 11.0824Z" fill="white" fillOpacity="0.8"/>
                                  </svg>
                                )}
                                <span>Set Brand Color</span>
                                <svg 
                                  className={`w-3 h-3 ml-1 ${isRecoveryMode ? 'text-orange-400' : 'text-green-400'}`} 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  // 检查是否在 recover 模式且聊天历史记录不为空
                                  if (!isRecoveryMode) {
                                    messageApi.error('Please start a task first before adding competitors manually');
                                    return;
                                  }
                                  
                                  if (!chatHistory || !Array.isArray(chatHistory.data) || chatHistory.data.length === 0) {
                                    messageApi.error('Please start a task first before adding competitors manually');
                                    return;
                                  }
                                  
                                  setCompetitorModalMode('add'); 
                                  setEditingPage(null);
                                  setShowCompetitorModal(true);
                                }}
                                className={`group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md rounded-[10px] ${isHydrated ? themeStyles.setBrandColorButton.background : 'bg-[rgba(34,42,65,1)]'} ${isHydrated ? themeStyles.setBrandColorButton.text : 'text-white/80'}`}
                                style={{ 
                                  height: '32px', 
                                  minWidth: '90px'
                                }}
                              >
                                <span>Add Competitor</span>
                              </button>
                              </div>
                              <button
                                type="button"
                                onClick={async (e) => {
                                  // 当有选中的竞争对手时，直接开始任务处理
                                  if (selectedCompetitors.length > 0 && !loading && !isMessageSending) {
                                    // 执行与 [COMPETITOR_SELECTED] 相同的逻辑
                                    const hubPageIds = selectedCompetitors.map(competitor => competitor.hubPageId);
                                    const tempConversationId = currentConversationId;
                                    
                                    if (hubPageIds && hubPageIds.length > 0) {
                                      try {
                                        setIsMessageSending(true);
                                        setIsSubmitting(true);
                                        
                                        const generateResponse = await apiClient.generateAlternative(tempConversationId, hubPageIds, currentWebsiteId);
                                        if (generateResponse?.code === 200) {
                                          setCurrentStep(3);
                                          startedTaskCountRef.current += hubPageIds.length;
                                          messageHandler.addSystemMessage('System is analyzing competitors and generating pages, please wait...');
                                          retryCountRef.current = 0; 
                                          setShouldConnectSSE(true); 
                                          setHubPageIds([]);
                                          setSelectedCompetitors([]); // 清空选中的竞争对手
                                          setUserInput(''); // 清空输入框
                                          setIsProcessingTask(true);
                                        } else {
                                          messageHandler.addSystemMessage(`⚠️ Failed to generate alternative pages: Invalid server response`);
                                        }
                                      } catch (error) {
                                        messageHandler.addSystemMessage(`⚠️ Failed to process competitor selection: ${error.message}`);
                                      } finally {
                                        setIsMessageSending(false);
                                        setIsSubmitting(false);
                                      }
                                    } else {
                                      messageHandler.addSystemMessage(`⚠️ Failed to extract competitor information, please try again`);
                                    }
                                  }
                                  // 当没有选中竞争对手但有输入内容时，执行正常的输入处理
                                  else if (userInput.trim() && !loading && !isMessageSending) {
                                    handleUserInput(e);
                                  }
                                }}
                                disabled={loading || isMessageSending || (selectedCompetitors.length === 0 && !userInput.trim())}
                                className={`group relative flex items-center justify-center text-sm font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm overflow-hidden
                                  ${(loading || isMessageSending || (selectedCompetitors.length === 0 && !userInput.trim()))
                                    ? 'bg-gray-700/60 text-gray-400 cursor-not-allowed opacity-70 border border-gray-600/40'
                                    : 'bg-gradient-to-r from-[#AA450B] to-[#0D47A6] hover:from-[#BB560C] hover:to-[#1E5BBB] text-white cursor-pointer'
                                  }`}
                                style={{ 
                                  width: selectedCompetitors.length > 0 ? 'auto' : '40px',
                                  height: '40px',
                                  minWidth: selectedCompetitors.length > 0 ? '160px' : '40px',
                                  padding: selectedCompetitors.length > 0 ? '0 16px' : '0',
                                  borderRadius: isHydrated ? (themeStyles.sendButton?.borderRadius || '10px') : '10px',
                                  border: isHydrated ? (themeStyles.sendButton?.border || '1px solid #D9E3F0') : '1px solid #D9E3F0',
                                  background: (loading || isMessageSending || (selectedCompetitors.length === 0 && !userInput.trim()))
                                    ? (isHydrated && currentTheme === 'dark' ? 'rgb(55 65 81 / 0.6)' : 'rgb(156 163 175)')
                                    : (isHydrated ? themeStyles.sendButton?.background : 'linear-gradient(101deg, #336FFF 20.01%, #A671FC 56.73%, #F5894F 92.85%)'),
                                  boxShadow: isHydrated ? (themeStyles.sendButton?.shadow || 'none') : 'none',
                                  color: 'white'
                                }}
                              >
                                {/* 背景装饰效果 */}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                
                                {/* 根据是否有选中的竞争对手显示不同内容 */}
                                {selectedCompetitors.length > 0 ? (
                                  <span className="relative z-10 font-medium whitespace-nowrap">
                                    I've selected, start working
                                  </span>
                                ) : (
                                  <img 
                                    src="/images/send-button-icon.png"
                                    alt="send"
                                    className="w-5 h-5 relative z-10"
                                  />
                                )}
                              </button>
                            </div>
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
                border: isHydrated ? (themeStyles.rightPanel.container.border || '1px solid rgba(255, 255, 255, 0.15)') : '1px solid rgba(255, 255, 255, 0.15)',
                background: isHydrated ? (themeStyles.rightPanel.container.background || '#0B1421') : '#0B1421',
                boxShadow: '0px 6px 24px 0px rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(30px)'
              }}>
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className={`h-12 p-3 flex-shrink-0 ${isHydrated ? themeStyles.rightPanel.container.borderBottom : 'border-b border-gray-300/20'}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setRightPanelTab('browser')}
                          className={`text-sm px-3 py-1 transition-colors rounded-[10px] ${
                            rightPanelTab === 'browser'
                              ? 'font-medium'
                              : ''
                          }`}
                          style={{
                            backgroundColor: rightPanelTab === 'browser' 
                              ? (isHydrated ? themeStyles.rightPanel.mainTabs.active.background : '#0F1E45')
                              : (isHydrated ? themeStyles.rightPanel.mainTabs.inactive.background : 'transparent'),
                            color: rightPanelTab === 'browser' 
                              ? (isHydrated ? themeStyles.rightPanel.mainTabs.active.text : '#357BF7')
                              : (isHydrated ? themeStyles.rightPanel.mainTabs.inactive.text : 'rgba(255, 255, 255, 0.50)'),
                            border: rightPanelTab === 'browser' && isHydrated && themeStyles.rightPanel.mainTabs.active.border !== 'transparent'
                              ? themeStyles.rightPanel.mainTabs.active.border
                              : 'none'
                          }}
                        >
                          Generated Pages
                        </button>
                        {isStreamingRef.current && (
                          <button
                            onClick={() => setRightPanelTab('codes')}
                            className={`text-sm px-3 py-1 transition-colors rounded-[10px] ${
                              rightPanelTab === 'codes'
                                ? 'font-medium'
                                : ''
                            }`}
                            style={{
                              backgroundColor: rightPanelTab === 'codes' 
                                ? (isHydrated ? themeStyles.rightPanel.mainTabs.active.background : '#0F1E45')
                                : (isHydrated ? themeStyles.rightPanel.mainTabs.inactive.background : 'transparent'),
                              color: rightPanelTab === 'codes' 
                                ? (isHydrated ? themeStyles.rightPanel.mainTabs.active.text : '#357BF7')
                                : (isHydrated ? themeStyles.rightPanel.mainTabs.inactive.text : 'rgba(255, 255, 255, 0.50)'),
                              border: rightPanelTab === 'codes' && isHydrated && themeStyles.rightPanel.mainTabs.active.border !== 'transparent'
                                ? themeStyles.rightPanel.mainTabs.active.border
                                : 'none'
                            }}
                          >
                            Coding
                          </button>
                        )}
                        <button
                          onClick={() => setRightPanelTab('blueprints')}
                          className={`text-sm px-3 py-1 transition-colors rounded-[10px] ${
                            rightPanelTab === 'blueprints'
                              ? 'font-medium'
                              : ''
                          }`}
                          style={{
                            backgroundColor: rightPanelTab === 'blueprints' 
                              ? (isHydrated ? themeStyles.rightPanel.mainTabs.active.background : '#0F1E45')
                              : (isHydrated ? themeStyles.rightPanel.mainTabs.inactive.background : 'transparent'),
                            color: rightPanelTab === 'blueprints' 
                              ? (isHydrated ? themeStyles.rightPanel.mainTabs.active.text : '#357BF7')
                              : (isHydrated ? themeStyles.rightPanel.mainTabs.inactive.text : 'rgba(255, 255, 255, 0.50)'),
                            border: rightPanelTab === 'blueprints' && isHydrated && themeStyles.rightPanel.mainTabs.active.border !== 'transparent'
                              ? themeStyles.rightPanel.mainTabs.active.border
                              : 'none'
                          }}
                        >
                          Sitemap
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                  {apiDetailModal.visible && (
                      <div className={`absolute inset-0 z-50 ${isHydrated ? themeStyles.apiDetailModal.border : 'border-white/15'} shadow-xl`}
                            style={{
                              background: isHydrated ? themeStyles.apiDetailModal.background : '#0B1421',
                              borderRadius: isHydrated ? themeStyles.apiDetailModal.borderRadius : '24px',
                              backdropFilter: isHydrated ? themeStyles.apiDetailModal.backdropFilter : 'blur(30px)',
                              boxShadow: isHydrated ? themeStyles.apiDetailModal.boxShadow : '0px 6px 24px 0px rgba(255, 255, 255, 0.12)'
                            }}>
                        <div className="h-full flex flex-col">
                          <div className={`flex-shrink-0 flex items-center justify-between p-4 ${isHydrated ? themeStyles.apiDetailModal.header.borderBottom : 'border-b border-slate-600/30'}`}>
                            <h3 className={`text-sm font-semibold ${isHydrated ? themeStyles.apiDetailModal.header.title : 'text-slate-100'}`}>
                              {apiDetailModal.data?.logType === 'API' ? 'Result:'
                                : 
                                apiDetailModal.data?.logType === 'SitemapAgent'? 'Agent Processing - Sitemap planning generation:'
                                : 
                                apiDetailModal.data?.logType === 'CompetitorsAgent'? 'Agent Processing - Finding competitors:'
                                : 
                                apiDetailModal.data?.logType === 'Agent'? 'Agent Processing Log:'
                                : 
                                apiDetailModal.data?.logType === 'Dify'? `Agent Processing | Competitor Analysis (${(() => {
                                    const difyLogs = logs.filter(log => log.type === 'Dify');
                                    return difyLogs.length;
                                  })()} steps):`
                                : 
                                apiDetailModal.data?.logType === 'Codes' ? 'Agent Processing | Code Generation:'
                                : 
                                `${apiDetailModal.data?.logType || 'Log'} Details:`
                              }
                            </h3>
                            <button
                              onClick={() => setApiDetailModal({ visible: false, data: null })}
                              className={`${isHydrated ? themeStyles.apiDetailModal.header.closeButton : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'} transition-colors p-1 rounded-md`}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {/* 状态信息栏 - 固定高度，仅对需要的消息类型显示 */}
                          {(apiDetailModal.data?.logType === 'Html' || apiDetailModal.data?.logType === 'Agent' || apiDetailModal.data?.logType === 'CompetitorsAgent' || apiDetailModal.data?.logType === 'SitemapAgent') && (
                            <div className={`flex-shrink-0 px-4 py-2 ${isHydrated ? themeStyles.apiDetailModal.statusBar.background : 'bg-slate-700/30'} ${isHydrated ? themeStyles.apiDetailModal.statusBar.borderBottom : 'border-b border-slate-600/20'}`}>
                              {apiDetailModal.data?.logType === 'Html' && (
                                <div className="flex items-center justify-between text-xs" style={{ color: isHydrated ? themeStyles.apiDetailModal.statusBar.text : '#D9D9D9' }}>
                                  <span>
                                    {(() => {
                                      const originalLogId = apiDetailModal.data?.originalLogId;
                                      const htmlLog = logs.find(log => log.type === 'Html' && log.id === originalLogId);
                                      const contentLength = htmlLog?.content?.length || 0;
                                      return `${contentLength.toLocaleString()} characters`;
                                    })()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    {(() => {
                                      const originalLogId = apiDetailModal.data?.originalLogId;
                                      const htmlLog = logs.find(log => log.type === 'Html' && log.id === originalLogId);
                                      return htmlLog?.id === currentStreamIdRef.current ? (
                                        <>
                                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                          <span>Streaming...</span>
                                        </>
                                      ) : (
                                        <>
                                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                          <span>Complete</span>
                                        </>
                                      );
                                    })()}
                                  </span>
                                </div>
                              )}
                              {apiDetailModal.data?.logType === 'Agent' || apiDetailModal.data?.logType === 'CompetitorsAgent' || apiDetailModal.data?.logType === 'SitemapAgent' && (
                                <div className="flex items-center gap-2 text-xs" style={{ color: isHydrated ? themeStyles.apiDetailModal.statusBar.text : '#D9D9D9' }}>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                <span>
                                  {apiDetailModal.data?.logType === 'CompetitorsAgent' 
                                    ? 'Processing competitors search...' 
                                    : apiDetailModal.data?.logType === 'SitemapAgent'
                                      ? 'Processing website sitemap analysis...'
                                      : 'Processing agent response...'}
                                </span>
                              </div>
                              )}
                            </div>
                          )}
                          
                          {/* 内容区域 - 实时更新Agent消息 */}
                          <div className="flex-1 overflow-hidden">
                            <div className="h-full p-4 overflow-y-auto" 
                            ref={apiDetailModalContentRef}
                            style={{ scrollbarWidth: 'thin', scrollbarColor: isHydrated ? themeStyles.apiDetailModal.content.scrollbarColor : '#4a5568 transparent' }}>
                              <div className="text-sm leading-relaxed" style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9' }}>
                                {apiDetailModal.data?.logType === 'API' ? (
                                  <>
                                    {apiDetailModal.data?.content?.data && (
                                      <div className="mb-4">
                                        <pre className={`p-4 ${isHydrated ? themeStyles.apiDetailModal.codeBlock.background : 'bg-slate-700/50'} rounded-lg text-xs overflow-auto whitespace-pre-wrap break-words ${isHydrated ? themeStyles.apiDetailModal.codeBlock.border : 'border border-slate-600/30'}`} 
                                            style={{ 
                                              scrollbarWidth: 'thin', 
                                              scrollbarColor: isHydrated ? themeStyles.apiDetailModal.content.scrollbarColor : '#4a5568 transparent',
                                              color: isHydrated ? themeStyles.apiDetailModal.codeBlock.text : '#D9D9D9'
                                            }}>
                                          {JSON.stringify(apiDetailModal.data.content.data, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </>
                                  ) : apiDetailModal.data?.logType === 'Agent' || 
                                  apiDetailModal.data?.logType === 'CompetitorsAgent' || 
                                  apiDetailModal.data?.logType === 'SitemapAgent'? (
                                // Agent类型的实时更新显示
                                (() => {
                                  // 实时从logs中重新构建Agent消息内容
                                  const agentMessageMap = new Map();
                                  logs.forEach(log => {
                                    if (log.type === 'Agent' && log.content) {
                                      try {
                                        const content = log.content;
                                        if (content.organic_data) {
                                          const organicData = typeof content.organic_data === 'string'
                                            ? JSON.parse(content.organic_data)
                                            : content.organic_data;
                              
                                          if (organicData.event === 'agent_message') {
                                            const { message_id, answer } = organicData;
                                            
                                            // 只处理当前弹窗对应的message_id
                                            if (message_id === apiDetailModal.data?.id) {
                                              const filteredAnswer = filterLogContent(answer);
                              
                                              if (!agentMessageMap.has(message_id)) {
                                                agentMessageMap.set(message_id, {
                                                  content: filteredAnswer,
                                                  timestamp: log.timestamp
                                                });
                                              } else {
                                                const existingLog = agentMessageMap.get(message_id);
                                                existingLog.content += filteredAnswer;
                                                // 保持最新的时间戳
                                                existingLog.timestamp = log.timestamp;
                                              }
                                            }
                                          }
                                        }
                                      } catch (error) {
                                        console.error('Error processing Agent log content:', error, 'Original log:', log);
                                      }
                                    }
                                  });

                                  const currentAgentMessage = agentMessageMap.get(apiDetailModal.data?.id);
                                  const latestContent = currentAgentMessage ? 
                                    filterLogContent(currentAgentMessage.content)
                                      .replace(/\.([\s\u00A0]+)/g, '. <br />')
                                      .replace(/\n/g, '<br />') 
                                    : (apiDetailModal.data?.content || 'No content available');

                                  return (
                                    <>
                                      <div className="mb-4">
                                        <div 
                                          className={`p-4 ${isHydrated ? themeStyles.apiDetailModal.codeBlock.background : 'bg-slate-700/50'} rounded-lg text-xs leading-relaxed agent-log-content-wrapper ${isHydrated ? themeStyles.apiDetailModal.codeBlock.border : 'border border-slate-600/30'}`}
                                          style={{ 
                                            scrollbarWidth: 'thin', 
                                            scrollbarColor: isHydrated ? themeStyles.apiDetailModal.content.scrollbarColor : '#4a5568 transparent',
                                            color: isHydrated ? themeStyles.apiDetailModal.codeBlock.text : '#D9D9D9'
                                          }}
                                          dangerouslySetInnerHTML={{ __html: latestContent }}
                                        />
                                      </div>
                                    </>
                                  );
                                })()
                                ) : apiDetailModal.data?.logType === 'Dify' ? (
                                  (() => {
                                    const difyGroups = [];
                                    let currentDifyGroup = null;
                                    let lastLogType = null;

                                    // 只处理非Agent的logs用于Dify分组
                                    const nonAgentLogs = logs.filter(log => log.type !== 'Agent');
                                    const sortedLogs = [...nonAgentLogs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                                    
                                    sortedLogs.forEach((log, index) => {
                                      if (log.type === 'Dify') {
                                        if (lastLogType !== 'Dify') {
                                          // 创建新组
                                          currentDifyGroup = {
                                            id: `dify-group-${Date.now()}-${index}`,
                                            type: 'Dify',
                                            isGroup: true,
                                            items: [log],
                                            timestamp: log.timestamp
                                          };
                                          difyGroups.push(currentDifyGroup);
                                        } else {
                                          // 添加到当前组
                                          currentDifyGroup.items.push(log);
                                        }
                                      }
                                      lastLogType = log.type;
                                    });

                                    // 找到当前弹窗对应的Dify组（通过时间戳匹配）
                                    const modalTimestamp = apiDetailModal.data?.timestamp;
                                    let currentDifyGroupData = null;
                                    
                                    // 寻找最接近的Dify组
                                    for (const group of difyGroups) {
                                      const groupTime = new Date(group.timestamp).getTime();
                                      const modalTime = new Date(modalTimestamp).getTime();
                                      
                                      // 如果组的时间戳在弹窗时间戳的前后1秒内，认为是同一组
                                      if (Math.abs(groupTime - modalTime) < 1000) {
                                        currentDifyGroupData = group;
                                        break;
                                      }
                                    }
                                    
                                    // 如果找不到匹配的组，使用最新的Dify组
                                    if (!currentDifyGroupData && difyGroups.length > 0) {
                                      currentDifyGroupData = difyGroups[difyGroups.length - 1];
                                    }

                                    return (
                                      <>
                                        <div className="mb-3">  {/* 减小间距 */}
                                          <div className="space-y-2">  {/* 减小步骤间距 space-y-3 -> space-y-2 */}
                                            {currentDifyGroupData?.items?.map((difyLog, difyIndex) => {
                                              let difyContent = null;
                                              if (typeof difyLog.content === 'string') {
                                                try {
                                                  difyContent = JSON.parse(difyLog.content);
                                                } catch (e) {
                                                  console.error('Failed to parse Dify content:', e);
                                                }
                                              } else if (typeof difyLog.content === 'object' && difyLog.content !== null) {
                                                difyContent = difyLog.content;
                                              }
                                              
                                              if (!difyContent || difyContent.data?.elapsed_time === 0 || !difyContent.data?.title) {
                                                return null;
                                              }
                                              return (
                                                <div key={difyIndex} className={`p-3 ${isHydrated ? themeStyles.apiDetailModal.codeBlock.background : 'bg-slate-700/50'} rounded ${isHydrated ? themeStyles.apiDetailModal.codeBlock.border : 'border border-slate-600/30'}`}>
                                                  {/* 标题和时间行 - 处理长标题换行 */}
                                                  <div className="flex items-start justify-between mb-2 gap-3">
                                                    <div className="flex-1 min-w-0">
                                                      <div className="font-medium text-sm leading-relaxed break-words" style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9' }}>
                                                        {difyContent.data?.title}
                                                      </div>
                                                    </div>
                                                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                                      <div className="text-[10px]" style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.7 }}>
                                                        {new Date(difyLog.timestamp).toLocaleString()}
                                                      </div>
                                                    </div>
                                                  </div>
                                                  
                                                  {/* 状态行 - 紧凑显示 */}
                                                  <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-3">
                                                      <div className="flex items-center gap-1">
                                                        <span style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.7 }}>Status:</span>
                                                        {difyContent.data?.status && (
                                                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                                            difyContent.data.status.toLowerCase() === 'succeeded' || difyContent.data.status.toLowerCase() === 'success' 
                                                              ? 'text-white border-radius-6' 
                                                              : difyContent.data.status.toLowerCase() === 'failed' || difyContent.data.status.toLowerCase() === 'error'
                                                              ? 'text-red-400 bg-red-900/30'
                                                              : 'text-yellow-400 bg-yellow-900/30'
                                                          }`}
                                                          style={difyContent.data.status.toLowerCase() === 'succeeded' || difyContent.data.status.toLowerCase() === 'success' ? {
                                                            color: '#00BB1F',
                                                            background: '#0F3417',
                                                            borderRadius: '6px'
                                                          } : {}}>
                                                            {difyContent.data.status}
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                    {difyContent.data?.elapsed_time !== undefined && (
                                                      <span className="text-xs font-mono" style={{ color: '#357BF7' }}>
                                                        {difyContent.data.elapsed_time.toFixed(2)}s
                                                      </span>
                                                    )}
                                                  </div>
                                            
                                                  {difyContent.data?.error && (
                                                    <div className="flex items-start gap-2 text-xs mt-2 p-2 bg-red-900/20 rounded border border-red-500/30">
                                                      <span className="text-red-400 flex-shrink-0 mt-0.5">✗</span>
                                                      <span className="text-red-300 text-xs leading-relaxed break-words">{difyContent.data.error}</span>
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </>
                                    );
                                  })()
                                ) : apiDetailModal.data?.logType === 'Html' ? (
                                  <div className="h-full flex flex-col">
                                    <pre
                                      className={`flex-1 p-3 ${isHydrated ? themeStyles.apiDetailModal.codeBlock.background : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80'} rounded-lg text-xs whitespace-pre-wrap break-words overflow-y-auto ${isHydrated ? themeStyles.apiDetailModal.codeBlock.border : 'border border-gray-600/30'} shadow-lg backdrop-blur-sm`}
                                      style={{
                                        color: isHydrated ? themeStyles.apiDetailModal.codeBlock.text : '#D9D9D9',
                                        fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
                                        lineHeight: '1.5',
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: isHydrated ? themeStyles.apiDetailModal.content.scrollbarColor : '#4a5568 transparent'
                                      }}
                                    >
                                      {(() => {
                                        // 使用原始logId查找HTML内容，支持流式更新
                                        const originalLogId = apiDetailModal.data?.originalLogId;
                                        
                                        if (originalLogId) {
                                          // 通过原始ID查找对应的HTML log
                                          const htmlLog = logs.find(log => log.type === 'Html' && log.id === originalLogId);
                                          
                                          if (htmlLog) {
                                            // 检查是否是当前正在流式更新的log
                                            if (htmlLog.id === currentStreamIdRef.current) {
                                              // 如果是当前流，显示实时内容
                                              return htmlStreamRef.current || htmlLog.content || 'Generating code...';
                                            } else {
                                              // 否则显示完整内容
                                              return htmlLog.content || 'Code generation completed.';
                                            }
                                          }
                                        }
                                        
                                        // 降级处理：如果找不到原始log，使用modal中的内容
                                        return apiDetailModal.data?.content || 'Loading...';
                                      })()}
                                    </pre>
                                  </div>
                                ) : apiDetailModal.data?.logType === 'Color' ? (
                                  // Color类型的详细显示
                                  <div className="space-y-3">
                                    {(() => {
                                      const originalLogId = apiDetailModal.data?.originalLogId;
                                      const colorLog = logs.find(log => log.type === 'Color' && log.id === originalLogId);
                                      
                                      let colorData = {};
                                      if (colorLog?.content?.organic_data && typeof colorLog.content.organic_data === 'string') {
                                        try {
                                          colorData = JSON.parse(colorLog.content.organic_data);
                                        } catch (e) {
                                          colorData = {};
                                        }
                                      } else if (colorLog?.content) {
                                        colorData = colorLog.content;
                                      }
                                      
                                      return Object.keys(colorData).length > 0 ? (
                                        <>
                                          <div className="flex gap-2 items-center mb-3 flex-wrap">
                                            {colorData.primary_color && (
                                              <div className="relative group">
                                                <span className="w-8 h-8 rounded border-2 border-gray-600 block" style={{background: colorData.primary_color}} />
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white bg-black/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                  Primary
                                                </span>
                                              </div>
                                            )}
                                            {colorData.secondary_color && (
                                              <div className="relative group">
                                                <span className="w-8 h-8 rounded border-2 border-gray-600 block" style={{background: colorData.secondary_color}} />
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white bg-black/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                  Secondary
                                                </span>
                                              </div>
                                            )}
                                            {colorData.button_background_color && (
                                              <div className="relative group">
                                                <span className="w-8 h-8 rounded border-2 border-gray-600 block" style={{background: colorData.button_background_color}} />
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white bg-black/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                  Button
                                                </span>
                                              </div>
                                            )}
                                            {colorData.header_background_color && (
                                              <div className="relative group">
                                                <span className="w-8 h-8 rounded border-2 border-gray-600 block" style={{background: colorData.header_background_color}} />
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white bg-black/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                  Header
                                                </span>
                                              </div>
                                            )}
                                            {colorData.footer_background_color && (
                                              <div className="relative group">
                                                <span className="w-8 h-8 rounded border-2 border-gray-600 block" style={{background: colorData.footer_background_color}} />
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white bg-black/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                  Footer
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                          
                                          <div className="space-y-2 text-sm">
                                            <div style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.8 }}>Color palette detected from the website:</div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                              {colorData.primary_color && (
                                                <div><span style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.7 }}>Primary:</span> <span className="font-mono" style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9' }}>{colorData.primary_color}</span></div>
                                              )}
                                              {colorData.secondary_color && (
                                                <div><span style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.7 }}>Secondary:</span> <span className="font-mono" style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9' }}>{colorData.secondary_color}</span></div>
                                              )}
                                              {colorData.button_background_color && (
                                                <div><span style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.7 }}>Button BG:</span> <span className="font-mono" style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9' }}>{colorData.button_background_color}</span></div>
                                              )}
                                              {colorData.button_text_color && (
                                                <div><span style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.7 }}>Button Text:</span> <span className="font-mono" style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9' }}>{colorData.button_text_color}</span></div>
                                              )}
                                              {colorData.header_background_color && (
                                                <div><span style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.7 }}>Header BG:</span> <span className="font-mono" style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9' }}>{colorData.header_background_color}</span></div>
                                              )}
                                              {colorData.header_link_color && (
                                                <div><span style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.7 }}>Header Link:</span> <span className="font-mono" style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9' }}>{colorData.header_link_color}</span></div>
                                              )}
                                              {colorData.footer_background_color && (
                                                <div><span style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.7 }}>Footer BG:</span> <span className="font-mono" style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9' }}>{colorData.footer_background_color}</span></div>
                                              )}
                                              {colorData.footer_text_color && (
                                                <div><span style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.7 }}>Footer Text:</span> <span className="font-mono" style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9' }}>{colorData.footer_text_color}</span></div>
                                              )}
                                            </div>
                                            
                                            {colorData.color_summary && (
                                              <div className={`mt-3 p-2 ${isHydrated ? themeStyles.apiDetailModal.codeBlock.background : 'bg-gray-700/50'} rounded text-xs`}>
                                                <span style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.7 }}>Summary:</span> <span style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9' }}>{colorData.color_summary}</span>
                                              </div>
                                            )}
                                          </div>
                                        </>
                                      ) : (
                                        <div style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.6 }}>No color information available</div>
                                      );
                                    })()}
                                  </div>
                                
                                ) : apiDetailModal.data?.logType === 'Crawler_Images' ? (
                                  // Crawler_Images类型的详细显示
                                  <div className="space-y-3">
                                    {(() => {
                                      const originalLogId = apiDetailModal.data?.originalLogId;
                                      const crawlerLog = logs.find(log => log.type === 'Crawler_Images' && log.id === originalLogId);
                                      
                                      let imageData = [];
                                      if (Array.isArray(crawlerLog?.content)) {
                                        imageData = crawlerLog.content;
                                      } else if (crawlerLog?.content?.organic_data) {
                                        try {
                                          imageData = typeof crawlerLog.content.organic_data === 'string' 
                                            ? JSON.parse(crawlerLog.content.organic_data) 
                                            : crawlerLog.content.organic_data;
                                        } catch (e) {
                                          imageData = [];
                                        }
                                      }
                                      
                                      return Array.isArray(imageData) && imageData.length > 0 ? (
                                        <>
                                          <div className="text-sm mb-3" style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.8 }}>
                                            Found {imageData.length} images on the website
                                          </div>
                                          <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                                            {imageData.map((item, imgIndex) => (
                                              item.src ? (
                                                <a
                                                  key={imgIndex}
                                                  href={item.src}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className={`group relative block cursor-pointer aspect-square rounded ${isHydrated ? themeStyles.apiDetailModal.codeBlock.border : 'border border-gray-600'} ${isHydrated ? themeStyles.apiDetailModal.codeBlock.background : 'bg-gray-700'} overflow-hidden hover:border-gray-500 transition-colors`}
                                                >
                                                  <img
                                                    src={item.src}
                                                    alt={item.alt || 'Crawled image'}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                      e.target.style.display = 'none';
                                                      e.target.parentElement.style.backgroundImage = `url('/images/image-cannot-be-displayed.png')`;
                                                      e.target.parentElement.style.backgroundSize = 'cover';
                                                    }}
                                                  />
                                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                  </div>
                                                  {item.alt && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-1 truncate">
                                                      {item.alt}
                                                    </div>
                                                  )}
                                                </a>
                                              ) : null
                                            ))}
                                          </div>
                                        </>
                                      ) : (
                                        <div style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.6 }}>No images found</div>
                                      );
                                    })()}
                                  </div>
                                
                                ) : (apiDetailModal.data?.logType === 'Codes') ? (
                                  <div className="space-y-3">
                                    {(() => {
                                      const codesData = apiDetailModal.data?.originalLog || apiDetailModal.data;
                                      return codesData ? (
                                        <>
                                          <div className="flex items-center gap-2 mb-3">
                                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                            </svg>
                                            <span className="text-sm font-medium text-emerald-400">Generated Page Code</span>
                                          </div>
                                          
                                          <div className="space-y-3 text-sm">
                                            <div><span style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.7 }}>Type:</span> <span style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9' }}>Codes</span></div>
                                            <div><span style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.7 }}>ID:</span> <span className="font-mono text-xs" style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9' }}>{codesData.id}</span></div>
                                            
                                            {codesData.content?.html && (
                                              <div><span style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.7 }}>HTML Length:</span> <span style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9' }}>{codesData.content.html.length.toLocaleString()} characters</span></div>
                                            )}
                                          </div>
                                          
                                          {codesData.content?.html && (
                                            <div className="mt-4">
                                              <div className="text-sm mb-2" style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.8 }}>Generated HTML Code:</div>
                                              <pre className={`p-3 ${isHydrated ? themeStyles.apiDetailModal.codeBlock.background : 'bg-gray-800/50'} rounded text-xs overflow-auto max-h-96 ${isHydrated ? themeStyles.apiDetailModal.codeBlock.border : 'border border-gray-600/30'}`}
                                                  style={{ 
                                                    fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
                                                    scrollbarWidth: 'thin',
                                                    scrollbarColor: isHydrated ? themeStyles.apiDetailModal.content.scrollbarColor : '#4a5568 transparent',
                                                    color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9'
                                                  }}>
                                                {codesData.content.html}
                                              </pre>
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        <div style={{ color: isHydrated ? themeStyles.apiDetailModal.content.text : '#D9D9D9', opacity: 0.6 }}>No code information available</div>
                                      );
                                    })()}
                                  </div>
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-base">
                                      No data available for now...
                                    </div>
                                  )}
                                </div>
                              </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {rightPanelTab === 'codes' && (
                      <div 
                        className="flex h-full" 
                        style={{ 
                          scrollbarWidth: 'thin', 
                          scrollbarColor: isHydrated ? themeStyles.rightPanel.codesTab.scrollbarColor : '#4A5568 transparent'
                        }}
                      >
                        <div className="flex-1 overflow-hidden p-3">
                          {isStreamingRef.current ? (
                            <div className="space-y-4">
                              <div className="mb-2">
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`font-semibold flex items-center gap-2 ${
                                    isHydrated ? themeStyles.rightPanel.codesTab.titleText : 'text-green-400'
                                  }`}>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Agent is writing HTML code...
                                  </span>
                                  <button 
                                    className={`text-xs px-2 py-1 rounded transition-colors ${
                                      isHydrated 
                                        ? `${themeStyles.rightPanel.codesTab.copyButton.text} ${themeStyles.rightPanel.codesTab.copyButton.textHover} ${themeStyles.rightPanel.codesTab.copyButton.background}`
                                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-600/50'
                                    }`}
                                    onClick={() => navigator.clipboard.writeText(htmlStreamRef.current)}
                                  >
                                    Copy Code
                                  </button>
                                </div>
                                <div className="relative">
                                  <pre
                                    ref={codeContainerRef}
                                    className={`mt-1 p-4 rounded-lg text-xs whitespace-pre-wrap break-words overflow-y-auto shadow-lg backdrop-blur-sm border ${
                                      isHydrated 
                                        ? `${themeStyles.rightPanel.codesTab.codeContainer.background} ${themeStyles.rightPanel.codesTab.codeContainer.border}`
                                        : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-600/30'
                                    }`}
                                    style={{ 
                                      maxHeight: '75vh',
                                      color: isHydrated ? themeStyles.rightPanel.codesTab.codeContainer.text : '#e2e8f0',
                                      fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
                                      lineHeight: '1.5',
                                      scrollbarWidth: 'thin',
                                      scrollbarColor: isHydrated ? themeStyles.rightPanel.codesTab.codeContainer.scrollbarColor : '#4a5568 transparent'
                                    }}
                                  >
                                    {htmlStreamRef.current}
                                  </pre>
                                  <div className={`absolute bottom-0 left-0 right-0 h-6 pointer-events-none rounded-b-lg ${
                                    isHydrated ? themeStyles.rightPanel.codesTab.gradientMask : 'bg-gradient-to-t from-gray-800/80 to-transparent'
                                  }`}></div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className={`flex items-center justify-center h-full text-base ${
                              isHydrated ? themeStyles.rightPanel.codesTab.emptyStateText : 'text-gray-400'
                            }`}>
                              The generated code will appear here during page creation.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {rightPanelTab === 'browser' && (
                      <div className="space-y-2">
                        {browserTabs.length === 0 ? (
                          <div className="flex-1 overflow-y-auto overflow-y-hidden p-3 h-[calc(100vh-400px)]">
                            <div className="flex items-center justify-center h-full">
                              <div className="flex flex-col items-center text-gray-400 text-base">
                                <img 
                                  src={currentTheme === 'dark' ? "/images/default-no-pages.png" : "/images/default-no-pages-light.png"}
                                  alt="No pages" 
                                  className="w-96 h-88 opacity-60"
                                />
                                Your generated pages will appear here
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3">
                            <div className={`flex items-center space-x-0.5 mb-3 overflow-x-auto px-1.5 ${isHydrated ? themeStyles.rightPanel.pageTabsContainer.borderBottom : 'border-b border-slate-800/80'}`}
                              style={{
                                scrollbarWidth: isHydrated ? themeStyles.scrollbar?.firefox?.width || 'thin' : 'thin',
                                scrollbarColor: isHydrated ? themeStyles.scrollbar?.firefox?.color || '#4A5568 transparent' : '#4A5568 transparent'
                              }}
                            >
                            {browserTabs.map((tab) => (
                              <div
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={` 
                                  flex items-center justify-between px-2.5 py-1.5 min-w-[100px] max-w-[160px] cursor-pointer transition-all
                                  ${activeTab === tab.id
                                    ? (isHydrated ? `${themeStyles.rightPanel.pageTabs.active.background} ${themeStyles.rightPanel.pageTabs.active.text}` : 'bg-slate-800/90 text-slate-200')
                                    : (isHydrated ? `${themeStyles.rightPanel.pageTabs.inactive.background} ${themeStyles.rightPanel.pageTabs.inactive.text} ${themeStyles.rightPanel.pageTabs.inactive.hover}` : 'bg-slate-900/60 text-slate-500 hover:text-slate-400 hover:bg-slate-800/50')
                                  }
                                  rounded-t-[6px] relative group
                                `}
                                style={{
                                  borderTop: isHydrated && themeStyles.rightPanel.pageTabs.active.borderStyle.includes('border-t') 
                                    ? '1px solid #D9E3F0' 
                                    : activeTab === tab.id && !isHydrated ? '1px solid #64748b' : 'none',
                                  borderRight: isHydrated && themeStyles.rightPanel.pageTabs.active.borderStyle.includes('border-r') 
                                    ? '1px solid #D9E3F0' 
                                    : activeTab === tab.id && !isHydrated ? '1px solid #64748b' : 'none',
                                  borderLeft: isHydrated && themeStyles.rightPanel.pageTabs.active.borderStyle.includes('border-l') 
                                    ? '1px solid #D9E3F0' 
                                    : activeTab === tab.id && !isHydrated ? '1px solid #64748b' : 'none',
                                  boxShadow: isHydrated && activeTab === tab.id 
                                    ? themeStyles.rightPanel.pageTabs.active.boxShadow 
                                    : isHydrated && activeTab !== tab.id
                                      ? themeStyles.rightPanel.pageTabs.inactive.boxShadow
                                      : undefined
                                }}
                              >
                                {/* 标签页标题 - 字号调小 */}
                                <span className="text-[11px] font-medium truncate flex-1 leading-none flex items-center">
                                  {tab.title}
                                </span>
                                
                                {/* 发布图标 - 根据主题显示不同的 SVG */}
                                <div 
                                  className="w-4 h-4 flex-shrink-0 ml-0.5 cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center" 
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    trackPublishClick('tab_icon', {
                                      tab_id: tab.id,
                                      tab_title: tab.title
                                    });
                                    setActiveTab(tab.id);
                                    setTimeout(() => {
                                      handlePublishButtonClick(tab.id, 'tab_icon');
                                    }, 10);
                                  }}
                                  title="Publish this page"
                                  data-ph-capture-attribute-button-type="tab_icon"
                                  data-ph-capture-attribute-tab-id={tab.id}
                                >
                                  {isHydrated && themeStyles.rightPanel.container.background === '#FFF' ? (
                                    // Light 模式发布图标
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="none">
                                      <g clipPath="url(#clip0_716_2615)">
                                        <path d="M7.76367 8.81836C7.5379 8.17863 8.17764 7.53886 8.81738 7.76465L15.4404 10.0225C16.1928 10.286 16.1925 11.3397 15.4023 11.5654L13.1826 12.168C12.6934 12.3185 12.2789 12.6944 12.166 13.1836L11.5645 15.4033C11.3387 16.1935 10.2849 16.194 10.0215 15.4414L7.76367 8.81836ZM8.29883 13.4902C7.93663 13.9448 7.53106 14.2011 7.10156 14.2012H7.10059C5.96149 14.2002 4.98113 12.4039 4.56641 9.84766H7.05762L8.29883 13.4902ZM3.64551 9.84766C3.8975 11.4768 4.37881 12.9343 5.07715 13.9023C4.0705 13.6023 3.14266 13.0828 2.36035 12.3818C1.57813 11.6809 0.961002 10.8154 0.552734 9.84766H3.64551ZM9.75293 5.2666C9.81207 5.8417 9.84525 6.43731 9.84668 7.05859L9.13965 6.81836V6.81934C7.78435 6.34936 6.4608 7.58382 6.75879 8.93164H4.44629C4.3206 7.71322 4.32059 6.48502 4.44629 5.2666H9.75293ZM3.53027 5.2666C3.47077 5.8682 3.43555 6.48407 3.43555 7.09961C3.4371 7.71109 3.46856 8.32211 3.52832 8.93066H0.246094C0.0908822 8.34685 0 7.73757 0 7.10449V7.09375C0.0027772 6.47667 0.0853246 5.86238 0.246094 5.2666H3.53027ZM13.9561 5.2666C14.1152 5.86237 14.1973 6.47611 14.1992 7.09277V7.10547C14.1984 7.57221 14.1508 8.03755 14.0576 8.49414L10.7617 7.37109C10.7632 7.2806 10.7666 7.19011 10.7666 7.09961C10.7666 6.48407 10.7314 5.86819 10.6719 5.2666H13.9561ZM5.07324 0.295898C4.3749 1.26297 3.89472 2.72051 3.64551 4.35059H0.552734C0.960258 3.38297 1.57673 2.51737 2.3584 1.81641C3.14006 1.11547 4.06713 0.59597 5.07324 0.295898ZM7.10059 -0.00195312C8.2406 -0.00191573 9.22004 1.79345 9.63477 4.35059H4.56641C4.98206 1.79342 5.96149 -0.00195312 7.10059 -0.00195312ZM9.12598 0.295898C10.1326 0.595912 11.0605 1.11546 11.8428 1.81641C12.625 2.51733 13.2421 3.38286 13.6504 4.35059H10.5576C10.3056 2.72051 9.82432 1.26297 9.12598 0.295898Z" fill="url(#paint0_linear_716_2615)"/>
                                      </g>
                                      <defs>
                                        <linearGradient id="paint0_linear_716_2615" x1="4.37498" y1="-2.75246" x2="17.8055" y2="-0.104592" gradientUnits="userSpaceOnUse">
                                          <stop stopColor="#336FFF"/>
                                          <stop offset="0.504117" stopColor="#A671FC"/>
                                          <stop offset="1" stopColor="#F5894F"/>
                                        </linearGradient>
                                        <clipPath id="clip0_716_2615">
                                          <rect width="16" height="16" fill="white"/>
                                        </clipPath>
                                      </defs>
                                    </svg>
                                  ) : (
                                    // Dark 模式发布图标
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="none">
                                      <g clipPath="url(#clip0_716_2052)">
                                        <path d="M7.76367 8.81836C7.5379 8.17863 8.17764 7.53886 8.81738 7.76465L15.4404 10.0225C16.1928 10.286 16.1925 11.3397 15.4023 11.5654L13.1826 12.168C12.6934 12.3185 12.2789 12.6944 12.166 13.1836L11.5645 15.4033C11.3387 16.1935 10.2849 16.194 10.0215 15.4414L7.76367 8.81836ZM8.29883 13.4902C7.93663 13.9448 7.53106 14.2011 7.10156 14.2012H7.10059C5.96149 14.2002 4.98113 12.4039 4.56641 9.84766H7.05762L8.29883 13.4902ZM3.64551 9.84766C3.8975 11.4768 4.37881 12.9343 5.07715 13.9023C4.0705 13.6023 3.14266 13.0828 2.36035 12.3818C1.57813 11.6809 0.961002 10.8154 0.552734 9.84766H3.64551ZM9.75293 5.2666C9.81207 5.8417 9.84525 6.43731 9.84668 7.05859L9.13965 6.81836V6.81934C7.78435 6.34936 6.4608 7.58382 6.75879 8.93164H4.44629C4.3206 7.71322 4.32059 6.48502 4.44629 5.2666H9.75293ZM3.53027 5.2666C3.47077 5.8682 3.43555 6.48407 3.43555 7.09961C3.4371 7.71109 3.46856 8.32211 3.52832 8.93066H0.246094C0.0908822 8.34685 0 7.73757 0 7.10449V7.09375C0.0027772 6.47667 0.0853246 5.86238 0.246094 5.2666H3.53027ZM13.9561 5.2666C14.1152 5.86237 14.1973 6.47611 14.1992 7.09277V7.10547C14.1984 7.57221 14.1508 8.03755 14.0576 8.49414L10.7617 7.37109C10.7632 7.2806 10.7666 7.19011 10.7666 7.09961C10.7666 6.48407 10.7314 5.86819 10.6719 5.2666H13.9561ZM5.07324 0.295898C4.3749 1.26297 3.89472 2.72051 3.64551 4.35059H0.552734C0.960258 3.38297 1.57673 2.51737 2.3584 1.81641C3.14006 1.11547 4.06713 0.59597 5.07324 0.295898ZM7.10059 -0.00195312C8.2406 -0.00191573 9.22004 1.79345 9.63477 4.35059H4.56641C4.98206 1.79342 5.96149 -0.00195312 7.10059 -0.00195312ZM9.12598 0.295898C10.1326 0.595912 11.0605 1.11546 11.8428 1.81641C12.625 2.51733 13.2421 3.38286 13.6504 4.35059H10.5576C10.3056 2.72051 9.82432 1.26297 9.12598 0.295898Z" fill="url(#paint0_linear_716_2052)"/>
                                      </g>
                                      <defs>
                                        <linearGradient id="paint0_linear_716_2052" x1="7.99997" y1="-0.00195313" x2="7.99997" y2="16.001" gradientUnits="userSpaceOnUse">
                                          <stop stopColor="#FF5D00"/>
                                          <stop offset="1" stopColor="#004ECE"/>
                                        </linearGradient>
                                        <clipPath id="clip0_716_2052">
                                          <rect width="16" height="16" fill="white"/>
                                        </clipPath>
                                      </defs>
                                    </svg>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                
                            {activeTab && (
                              <div>
                                <div className={`flex items-center gap-2 mb-2 rounded-lg px-2 py-1.5`}>
                                  {/* 地址栏部分 */}
                                  <div className={`w-full px-3 py-1.5 text-xs rounded-[10px] overflow-hidden overflow-ellipsis whitespace-nowrap ${isHydrated ? themeStyles.rightPanel.urlBar.text : 'text-gray-300'}`}
                                    style={{
                                      border: isHydrated ? themeStyles.rightPanel.urlBar.border : '1px solid rgba(255, 255, 255, 0.16)',
                                      background: isHydrated ? themeStyles.rightPanel.urlBar.background : '#0B1421'
                                    }}>
                                    {browserTabs.find(tab => tab.id === activeTab)?.url}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Tooltip title="Preview Page in New Tab">
                                      <button
                                        onClick={() => window.open(browserTabs.find(tab => tab.id === activeTab)?.url, '_blank')}
                                        className={`
                                          px-2 py-1 rounded-[10px] text-xs font-semibold text-white transition duration-200 flex items-center gap-1
                                          ${isHydrated ? `${themeStyles.rightPanel.actionButtons.background} ${themeStyles.rightPanel.actionButtons.hoverBackground}` : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600'}
                                          disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-700
                                        `}
                                        title="Preview Page in New Tab"
                                      >
                                        {isHydrated && themeStyles.rightPanel.container.background === '#FFF' ? (
                                          // Light 模式预览图标
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <g clipPath="url(#clip0_716_2643)">
                                              <path d="M8.00012 3.19998H3.2001C2.77575 3.19998 2.36879 3.36855 2.06873 3.66861C1.76867 3.96867 1.6001 4.37564 1.6001 4.79999V12.8C1.6001 13.2244 1.76867 13.6313 2.06873 13.9314C2.36879 14.2314 2.77575 14.4 3.2001 14.4H11.2001C11.6245 14.4 12.0314 14.2314 12.3315 13.9314C12.6316 13.6313 12.8001 13.2244 12.8001 12.8V8" stroke="#357BF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                              <path d="M7.2002 8.8L14.4002 1.59998" stroke="#357BF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                              <path d="M10.3999 1.59998H14.3999V5.59999" stroke="#357BF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </g>
                                            <defs>
                                              <clipPath id="clip0_716_2643">
                                                <rect width="16" height="16" fill="white"/>
                                              </clipPath>
                                            </defs>
                                          </svg>
                                        ) : (
                                          // Dark 模式预览图标
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <g clipPath="url(#clip0_716_2081)">
                                              <path d="M8.00012 3.19998H3.2001C2.77575 3.19998 2.36879 3.36855 2.06873 3.66861C1.76867 3.96867 1.6001 4.37564 1.6001 4.79999V12.8C1.6001 13.2244 1.76867 13.6313 2.06873 13.9314C2.36879 14.2314 2.77575 14.4 3.2001 14.4H11.2001C11.6245 14.4 12.0314 14.2314 12.3315 13.9314C12.6316 13.6313 12.8001 13.2244 12.8001 12.8V8" stroke="#CED0D3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                              <path d="M7.2002 8.8L14.4002 1.59998" stroke="#CED0D3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                              <path d="M10.3999 1.59998H14.3999V5.59999" stroke="#CED0D3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </g>
                                            <defs>
                                              <clipPath id="clip0_716_2081">
                                                <rect width="16" height="16" fill="white"/>
                                              </clipPath>
                                            </defs>
                                          </svg>
                                        )}
                                      </button>
                                    </Tooltip>
                                    <Tooltip title="Edit This Page">
                                      <button
                                        onClick={() => {
                                          const currentTabUrl = browserTabs.find(tab => tab.id === activeTab)?.url;
                                          if (currentTabUrl) {
                                            const urlMatch = currentTabUrl.match(/\/([^\/]+)$/);
                                            if (urlMatch && urlMatch[1]) {
                                              const resultId = urlMatch[1];
                                              window.open(`/page-edit/${resultId}`, '_blank');
                                            } else {
                                              messageApi.error('Cannot extract page ID from URL');
                                            }
                                          } else {
                                            messageApi.info('Please wait until at least one page has finished generating.');
                                          }
                                        }}
                                        className={`
                                          px-2 py-1 rounded-[10px] text-xs font-semibold text-white transition duration-200 flex items-center gap-1
                                          ${isHydrated ? `${themeStyles.rightPanel.actionButtons.background} ${themeStyles.rightPanel.actionButtons.hoverBackground}` : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600'}
                                          disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-700
                                        `}
                                        title="Edit This Page"
                                      >
                                        {isHydrated && themeStyles.rightPanel.container.background === '#FFF' ? (
                                          // Light 模式编辑图标
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <g clipPath="url(#clip0_716_2648)">
                                              <path d="M7.3335 2.66667H2.66683C2.31321 2.66667 1.97407 2.80715 1.72402 3.0572C1.47397 3.30724 1.3335 3.64638 1.3335 4.00001V13.3333C1.3335 13.687 1.47397 14.0261 1.72402 14.2761C1.97407 14.5262 2.31321 14.6667 2.66683 14.6667H12.0002C12.3538 14.6667 12.6929 14.5262 12.943 14.2761C13.193 14.0261 13.3335 13.687 13.3335 13.3333V8.66667" stroke="#357BF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                              <path d="M12.3335 1.66667C12.5987 1.40145 12.9584 1.25246 13.3335 1.25246C13.7086 1.25246 14.0683 1.40145 14.3335 1.66667C14.5987 1.93189 14.7477 2.2916 14.7477 2.66667C14.7477 3.04174 14.5987 3.40145 14.3335 3.66667L8.00016 10L5.3335 10.6667L6.00016 8L12.3335 1.66667Z" stroke="#357BF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </g>
                                            <defs>
                                              <clipPath id="clip0_716_2648">
                                                <rect width="16" height="16" fill="white"/>
                                              </clipPath>
                                            </defs>
                                          </svg>
                                        ) : (
                                          // Dark 模式编辑图标
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <g clipPath="url(#clip0_716_2086)">
                                              <path d="M7.3335 2.66667H2.66683C2.31321 2.66667 1.97407 2.80715 1.72402 3.0572C1.47397 3.30724 1.3335 3.64638 1.3335 4.00001V13.3333C1.3335 13.687 1.47397 14.0261 1.72402 14.2761C1.97397 14.5262 2.31321 14.6667 2.66683 14.6667H12.0002C12.3538 14.6667 12.6929 14.5262 12.943 14.2761C13.193 14.0261 13.3335 13.687 13.3335 13.3333V8.66667" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                              <path d="M12.3335 1.66667C12.5987 1.40145 12.9584 1.25246 13.3335 1.25246C13.7086 1.25246 14.0683 1.40145 14.3335 1.66667C14.5987 1.93189 14.7477 2.2916 14.7477 2.66667C14.7477 3.04174 14.5987 3.40145 14.3335 3.66667L8.00016 10L5.3335 10.6667L6.00016 8L12.3335 1.66667Z" stroke="white" strokeOpacity="0.8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </g>
                                            <defs>
                                              <clipPath id="clip0_716_2086">
                                                <rect width="16" height="16" fill="white"/>
                                              </clipPath>
                                            </defs>
                                          </svg>
                                        )}
                                      </button>
                                    </Tooltip>
                                    <button
                                      onClick={() => {
                                        trackPublishClick('main_button', {
                                          active_tab: activeTab,
                                          browser_tabs_count: browserTabs.length
                                        });
                                        handlePublishButtonClick(activeTab, 'main_button');
                                      }}
                                      className={`
                                        px-3 py-1.5 text-xs font-medium transition-colors duration-150 flex items-center justify-center gap-1.5 min-w-[80px]
                                        ${browserTabs.length === 0
                                          ? 'text-slate-500 cursor-not-allowed opacity-60'
                                          : 'text-white'
                                        }
                                        ${currentTheme === 'light' ? 'rounded-[10px] border border-[#D9E3F0]' : 'rounded-md'}
                                      `}
                                      style={{
                                        background: browserTabs.length === 0 
                                          ? 'none' 
                                          : currentTheme === 'light'
                                            ? 'linear-gradient(101deg, #336FFF 20.01%, #A671FC 56.73%, #F5894F 92.85%)'
                                            : 'linear-gradient(115.15deg, #AA450B -2.53%, #231109 26.44%, #10132D 48.59%, #101834 68.22%, #0D47A6 96.36%)'
                                      }}
                                      title="Publish to Domain"
                                      disabled={browserTabs.length === 0}
                                      data-ph-capture-attribute-button-type="main_button"
                                      data-ph-capture-attribute-active-tab={activeTab}
                                    >
                                      <img src="/images/send-button-icon.png" alt="publish" className="w-4 h-4" />
                                      Publish
                                    </button>
                                    <button
                                      className="text-xs font-medium px-2 py-1 transition-all duration-200 hover:opacity-80 flex items-center justify-center"
                                      style={{
                                        borderRadius: isHydrated ? themeStyles.pagesGrid.viewButton.borderRadius : '12px',
                                        background: 'rgba(220, 38, 38, 0.1)',
                                        color: '#DC2626'
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const currentTab = browserTabs.find(tab => tab.id === activeTab);
                                        if (currentTab) {
                                          const resultId = currentTab.id.replace('result-', '');
                                          handleDeletePage(resultId);
                                        } else {
                                          messageApi.info('Please wait until at least one page has finished generating.');
                                        }
                                      }}
                                      title="Delete Page"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                <div 
                                  ref={iframeContainerRef}
                                  className="bg-white rounded-lg overflow-hidden relative"
                                  style={{ height: 'calc(100vh - 310px)' }}
                                >
                                  {(() => {
                                    const containerWidth = containerSize.width || 800;
                                    
                                    // 如果容器宽度仍然很小，说明可能还在加载中，使用更合理的默认值
                                    const effectiveWidth = containerWidth < 200 ? 800 : containerWidth;
                                    
                                    // 更敏感的响应式iFrame宽度计算
                                    let iframeWidth;
                                    if (effectiveWidth <= 600) {
                                      iframeWidth = 1200; // 移动端
                                    } else if (effectiveWidth <= 800) {
                                      iframeWidth = 1280; // 小屏笔记本
                                    } else if (effectiveWidth <= 1000) {
                                      iframeWidth = effectiveWidth * 1.4; // 中小屏，更敏感
                                    } else if (effectiveWidth <= 1200) {
                                      iframeWidth = effectiveWidth * 1.3; // 中屏
                                    } else if (effectiveWidth <= 1400) {
                                      iframeWidth = effectiveWidth * 1.2; // 大屏
                                    } else if (effectiveWidth <= 1600) {
                                      iframeWidth = effectiveWidth * 1.15; // 超大屏
                                    } else {
                                      iframeWidth = Math.min(1920, effectiveWidth * 1.1); // 4K屏等
                                    }
                                    
                                    // 确保在合理范围内
                                    iframeWidth = Math.max(1200, Math.min(2560, iframeWidth));
                                    
                                    // 根据实际iframeWidth计算scale
                                    const scale = Math.min(1, effectiveWidth / iframeWidth);
                                    
                                    return (
                                      <div 
                                        className="w-full h-full overflow-y-auto overflow-x-hidden"
                                        style={{
                                          transform: scale < 1 ? `scale(${scale})` : 'none',
                                          transformOrigin: 'top left',
                                          width: scale < 1 ? `${iframeWidth}px` : '100%',
                                          height: scale < 1 ? `${100 / scale}%` : '100%',
                                        }}
                                      >
                                        <iframe
                                          src={browserTabs.find(tab => tab.id === activeTab)?.url}
                                          style={{
                                            width: `${iframeWidth}px`, 
                                            height: '100%', 
                                            border: 'none'
                                          }}
                                          title="Preview"
                                          sandbox="allow-same-origin allow-scripts"
                                          onLoad={() => {
                                            // iframe加载完成后再次更新尺寸
                                            setTimeout(() => {
                                              if (iframeContainerRef.current) {
                                                const rect = iframeContainerRef.current.getBoundingClientRect();
                                                setContainerSize({ width: rect.width, height: rect.height });
                                              }
                                            }, 100);
                                          }}
                                        />
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {rightPanelTab === 'blueprints' && (
                      <div className="flex-1 h-full overflow-hidden">
                        <BlueprintVisualization 
                          websiteId={(() => {
                            // 如果currentWebsiteId为空，尝试获取
                            if (!currentWebsiteId && mainProduct) {

                              // 异步获取websiteId并更新状态
                              getMatchedWebsiteId(mainProduct).then(result => {
                                if (result.success && result.websiteId) {
                                  setCurrentWebsiteId(result.websiteId);
                                }
                              });
                              return null; // 暂时返回null，等待异步获取完成
                            }
                            return currentWebsiteId;
                          })()}
                        />
                      </div>
                    )}
                  </div>
                </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={errorModal.visible}
        title={<span>Task Failed <span style={{fontSize: 22}}>⚠️</span></span>}
        onOk={async () => {
          setErrorModal({ visible: false, message: '' });
          
          // 重新获取可选清单并显示
          try {
            setIsProcessingTask(true);

            const errorMessage = "I encountered an error. Please return the sitemap so I can reselect pages.";
            
            // 添加用户消息到界面
            messageHandler.addUserMessage(errorMessage);
            const chatResponse = await apiClient.chatWithAI(getPageMode(), errorMessage, currentConversationId);
            const messageId = messageHandler.addAgentThinkingMessage();
            messageHandler.updateAgentMessage(chatResponse.data.message.answer, messageId);
            
            // 重新获取sitemap数据
            if (currentWebsiteId && currentConversationId) {
              const result = await processSitemapData(currentWebsiteId, currentConversationId, true);
              if (result.success) {
                setIsProcessingTask(false);
              } else {
                throw new Error('Failed to reload page list');
              }
            } else if (mainProduct) {
              // 如果没有currentWebsiteId，重新获取
              const websiteResult = await getMatchedWebsiteId(mainProduct);
              if (websiteResult.success) {
                setCurrentWebsiteId(websiteResult.websiteId);
                const result = await processSitemapData(websiteResult.websiteId, currentConversationId, true);
                if (result.success) {
                  setIsProcessingTask(false);
                } else {
                  throw new Error('Failed to reload page list');
                }
              } else {
                throw new Error('Failed to get website information');
              }
            } else {
              throw new Error('No website information available');
            }
          } catch (error) {
            console.error('Failed to reload page list:', error);
            messageApi.error('Failed to reload page list. Please refresh the page and try again.');
            setIsProcessingTask(false);
          }
        }}
        okText="Reselect and Start Task"
        centered
        closable={false}
        maskClosable={false}
        width={450}
        styles={{ body: { textAlign: 'center' } }}
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <div style={{ marginBottom: 16, color: '#f87171', fontWeight: 500 }}>
          {errorModal.message || 'The task encountered an error and could not complete.'}
        </div>
        <div style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>
          Don't worry - your generated pages have been saved and your credits are protected.
        </div>
        <div style={{ color: '#64748b', fontSize: 14 }}>
          Click the button below to reload the page list and select items to restart generation.
        </div>
      </Modal>

      {deletePageConfirm.open && (
        <Modal
          open={deletePageConfirm.open}
          onCancel={() => setDeletePageConfirm({ open: false, resultId: null, generatedPageId: null })}
          title="Delete Page"
          footer={[
            <Button
              key="delete"
              type="primary"
              danger
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
      )}

      <Modal
        open={showTaskConflictModal}
        title="Task Already Running"
        onCancel={() => setShowTaskConflictModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowTaskConflictModal(false)}>
            Cancel
          </Button>,
          <Button
            key="viewTask"
            type="primary"
            onClick={() => {
              if (conflictingTask?.websiteId) {
                window.location.href = `/?conversationId=${conflictingTask.conversationId}&status=processing`;
              }
              setShowTaskConflictModal(false);
            }}
          >
            View Current Task
          </Button>
        ]}
        zIndex={2000}
      >
        <div>
          <p>You can only run one task at a time. There is currently a task in progress.</p>
          <p>Please wait for the current task to complete or abort it before starting a new one.</p>
          {conflictingTask && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Current Task:</strong> {conflictingTask.website || 'Unknown'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Status:</strong> {conflictingTask.generatorStatus}
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* 在这里添加 BrandAssetsModal */}
      {showBrandAssetsModal && (
        <BrandAssetsModal
          showBrandAssetsModal={showBrandAssetsModal}
          setShowBrandAssetsModal={setShowBrandAssetsModal}
        />
      )}

      {/* 添加 CompetitorModal */}
      {showCompetitorModal && (
        <CompetitorModal
        showCompetitorModal={showCompetitorModal}
        setShowCompetitorModal={setShowCompetitorModal}
        editingPage={editingPage}
        mode={competitorModalMode}
        mainProductUrl={localStorage.getItem('currentProductUrl') || mainProduct} 
        websiteId={currentWebsiteId} 
        currentConversationId={currentConversationId}
        onStartGeneration={handleStartGenerationFromModal}
        onRefreshPageList={refreshPageList}
        onSaveSuccess={(result) => {
          console.log('Competitor operation result:', result);
          
          if (result.action === 'create' && competitorModalMode === 'add') {
            // add模式下会自动开始生成，不需要额外操作
            console.log('Page created and generation started');
          } else if (result.action === 'update' && competitorModalMode === 'edit') {
            // edit模式下已经在handleSave中调用了refreshPageList
            console.log('Page updated and list refreshed');
          } else if (result.action === 'delete') {
            // delete操作已经在handleConfirmDelete中调用了refreshPageList
            console.log('Page deleted and list refreshed');
            
            // 可选：如果需要额外的删除后处理逻辑，可以在这里添加
            // 比如清空选中状态、显示提示信息等
            setSelectedCompetitors(prev => 
              prev.filter(comp => comp.hubPageId !== result.hubPageId)
            );
          }
        }}
      />
      )}
      
      {isTaskListModalVisible && (
        <HistoryCardList onClose={handleCloseTaskList} />
      )}

      {/* 添加 PublishPage 弹窗 */}
      {isPublishPageModalVisible && selectedPage && (
        <PublishPage
          open={isPublishPageModalVisible}
          onClose={() => setIsPublishPageModalVisible(false)}
          page={selectedPage}
          customMessageApi={messageApi}
        />
      )}
    </>
  );
};

export default ResearchTool;