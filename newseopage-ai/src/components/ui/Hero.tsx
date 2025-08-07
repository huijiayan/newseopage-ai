"use client"; 
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { SendButton } from "./SendButton";
import ChatInput from "./ChatInput";
import apiClient from '@/lib/api/index';

export const Hero: React.FC = () => {
  const router = useRouter();
  const [userInput, setUserInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMessageSending, setIsMessageSending] = useState(false);
  const [isProcessingTask, setIsProcessingTask] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSlogan, setShowSlogan] = useState(true);
  const [shouldConnectWS, setShouldConnectWS] = useState(false);
  const [canProcessCompetitors, setCanProcessCompetitors] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const isFirstMessageSentForNewTaskRef = useRef(false);

  // 懒加载效果
  useEffect(() => {
    // 模拟渐进式加载
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // 0.8秒的加载时间，更快的响应

    return () => clearTimeout(loadTimer);
  }, []);



  // 获取页面模式的函数
  const getPageMode = (): string => {
    // 这里可以根据当前路径返回相应的模式
    return 'alternative';
  };

  // 模拟的 messageApi 对象
  const messageApi = {
    error: (msg: string) => console.error(msg),
    warning: (msg: string, duration?: number) => console.warn(msg)
  };

  // 消息状态管理
  const [messages, setMessages] = useState<any[]>([]);
  const [messageIdCounter, setMessageIdCounter] = useState(0);
  
  // 生成唯一ID的函数
  const generateUniqueId = () => {
    setMessageIdCounter(prev => prev + 1);
    return `${Date.now()}-${messageIdCounter}-${Math.random().toString(36).substr(2, 9)}`;
  };
  
  // 真实的 messageHandler 对象
  const messageHandler = {
    isProcessing: false,
    addUserMessage: (msg: string) => {
      const userMessage = {
        id: generateUniqueId(),
        type: 'user',
        content: msg,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      console.log('User message added:', msg);
    },
    addAgentThinkingMessage: () => {
      const thinkingId = generateUniqueId();
      const thinkingMessage = {
        id: thinkingId,
        type: 'agent',
        content: '🤔 Thinking...',
        isThinking: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, thinkingMessage]);
      return thinkingId;
    },
    updateAgentMessage: (msg: string, id: any) => {
      setMessages(prev => prev.map(message => 
        message.id === id 
          ? { ...message, content: msg, isThinking: false }
          : message
      ));
      console.log('Agent message updated:', msg);
    },
    addSystemMessage: (msg: string) => {
      const systemMessage = {
        id: generateUniqueId(),
        type: 'system',
        content: msg,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, systemMessage]);
      console.log('System message added:', msg);
    },
    handleErrorMessage: (error: any, id: any) => {
      const errorMessage = typeof error === 'string' ? error : 'An error occurred';
      setMessages(prev => prev.map(message => 
        message.id === id 
          ? { ...message, content: `❌ ${errorMessage}`, isThinking: false }
          : message
      ));
      console.error('Error message:', error);
    }
  };

  // 使用真实的 apiClient (已导入)

  // 其他辅助函数
  const filterMessageTags = (text: string): string => text.replace(/\[.*?\]/g, '');
  const handleWebsiteSitemapProcess = async (mainProduct: any, userInputUrl: string, conversationId: any, flag: boolean) => {
    // 处理网站地图的逻辑
  };

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
          messageHandler.addSystemMessage('You have no credits left. Please purchase a package to continue using.');
          setIsSubmitting(false);
          return;
        }
      } else {
        console.warn('[DEBUG] Failed to get user package information, continuing without credit check.');
      }
    } catch (creditError) {
      console.error('Error checking user credit:', creditError);
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
        let chatResponse;
        let conversationId: string | null = null;
        try {
          console.log('🔍 Hero.tsx - 准备调用API，参数:', {
            chatType: getPageMode(),
            message: formattedInput,
            conversationId: tempConversationId
          });
          
          chatResponse = await apiClient.chatWithAI(getPageMode(), formattedInput, tempConversationId);
          
          // 检查响应格式 - chatWithAI接口已经生成conversationId
          if (chatResponse && 'websocket' in chatResponse) {
            console.log('🔍 WebSocket模式，API已生成conversationId');
            
            // API响应中应该包含conversationId
            if (chatResponse.conversationId) {
              console.log('🔍 从API响应中获取到conversationId:', chatResponse.conversationId);
              
              // 更新状态并跳转
              setCurrentConversationId(chatResponse.conversationId);
              isFirstMessageSentForNewTaskRef.current = true;

              // 根据当前路径决定跳转目标
              const currentPath = window.location.pathname;
              let targetPath = '/alternative'; // 默认跳转到 alternative

              if (currentPath.includes('best')) {
                targetPath = '/best';
              } else if (currentPath.includes('faq') || currentPath.includes('FAQ')) {
                targetPath = '/FAQ';
              } else if (currentPath.includes('alternative')) {
                targetPath = '/alternative';
              }

              // 跳转到聊天室页面，传递真实的conversationId
              router.replace(`${targetPath}?conversationId=${chatResponse.conversationId}`);
              
              // 清空消息列表，因为要跳转到新页面
              setMessages([]);
              setShowSlogan(false);
              
              return;
            } else {
              console.error('🔍 API响应中未包含conversation_id');
              messageHandler.updateAgentMessage('Failed to create a new task. Please try again.', thinkingMessageId);
              setIsMessageSending(false);
              setLoading(false);
              return;
            }
          } else {
            messageHandler.updateAgentMessage('Failed to create a new task. Please try again.', thinkingMessageId);
            setIsMessageSending(false);
            setLoading(false);
            return;
          }
        } catch (error) {
          messageHandler.updateAgentMessage('Failed to create a new task. Please try again.', thinkingMessageId);
          setIsMessageSending(false);
          setLoading(false);
          return;
        }
        
        // 非WebSocket模式，使用API返回的conversationId
        if (conversationId) {
          // 更新状态并修改URL
          setCurrentConversationId(conversationId);
          isFirstMessageSentForNewTaskRef.current = true;

          // 根据当前路径决定跳转目标
          const currentPath = window.location.pathname;
          let targetPath = '/alternative'; // 默认跳转到 alternative

          if (currentPath.includes('best')) {
            targetPath = '/best';
          } else if (currentPath.includes('faq') || currentPath.includes('FAQ')) {
            targetPath = '/FAQ';
          } else if (currentPath.includes('alternative')) {
            targetPath = '/alternative';
          }

          // 跳转到聊天室页面，传递conversationId参数
          router.replace(`${targetPath}?conversationId=${conversationId}`);
          
          // 清空消息列表，因为要跳转到新页面
          setMessages([]);
          setShowSlogan(false);
          
          // 跳转后不再处理后续逻辑，因为页面会重新加载
          return;
        }
        
        // 如果响应中包含answer，处理它
        if (chatResponse && !('websocket' in chatResponse) && (chatResponse as any)?.message?.answer) {
          const rawAnswer = (chatResponse as any).message.answer;
          
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
              setShouldConnectWS(true);
              window.dispatchEvent(new CustomEvent('chatStarted'));

              if (searchResponse.data.sitemapStatus === 'generated') {
                const userInputUrl = localStorage.getItem('currentProductUrl') || '';
                await handleWebsiteSitemapProcess(getPageMode(), userInputUrl, tempConversationId, false);
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
      // 检查响应格式
      if (response && !('websocket' in response) && (response as any)?.message?.answer) {
        const rawAnswer = (response as any).message.answer;
        
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
            setShouldConnectWS(true);
            window.dispatchEvent(new CustomEvent('chatStarted'));

            if (searchResponse.data.sitemapStatus === 'generated') {
              const userInputUrl = localStorage.getItem('currentProductUrl') || '';
              await handleWebsiteSitemapProcess(getPageMode(), userInputUrl, tempConversationId, false);
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
          
          setCanProcessCompetitors(true);
          return; 
        } else {
          const answer = filterMessageTags(rawAnswer);
          messageHandler.updateAgentMessage(answer, thinkingMessageId);
          setLoading(false);
          return;
        }
      } else {
        messageHandler.updateAgentMessage('Failed to get response from server. Please try again.', thinkingMessageId);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error in handleUserInput:', error);
      messageHandler.updateAgentMessage('An error occurred. Please try again.', thinkingMessageId);
      setLoading(false);
    } finally {
      setIsMessageSending(false);
      setIsSubmitting(false);
    }
  };



  // 显示警示框的函数
  const showAlertMessage = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    
    // 3秒后自动消失
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  // 加载状态显示
  if (isLoading) {
    return (
      <section className="w-full py-8 sm:py-12 lg:py-16 flex flex-col items-center bg-white dark:bg-gray-900 min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-6">
          {/* 简洁的C形加载动画 */}
          <div className="loading-spinner"></div>
          
          {/* 加载文本 */}
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg font-medium">
              Preparing your workspace...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-8 sm:py-12 lg:py-16 flex flex-col items-center bg-white dark:bg-gray-900 min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] justify-center animate-fade-in transition-all duration-500 px-4 sm:px-6 lg:px-8">
      {/* 顶部按钮 */}
      <button className="mb-6 sm:mb-8 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium shadow-sm transition hover:shadow-md border border-blue-200/30 dark:border-blue-700/30">
        ✨ Generate 5 pages for free.
      </button>

      {/* 渐变大标题 */}
      <h1
        className="text-lg sm:text-xl md:text-3xl lg:text-5xl xl:text-6xl font-extrabold text-center mb-3 sm:mb-4 leading-tight px-2 sm:px-4 max-w-5xl mx-auto"
        style={{ 
          background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 40%, #ec4899 70%, #f59e0b 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Get Found When People Search Your Competitor
      </h1>
                
      {/* 副标题 */}
      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm lg:text-base text-center mb-6 sm:mb-8 max-w-2xl sm:max-w-3xl lg:max-w-4xl leading-relaxed px-2 sm:px-4">
        Own all your competitor's brand search traffic with AI-generated pages that outrank.
      </p>

      {/* 输入框 */}
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-3xl mb-8 sm:mb-12 px-2 sm:px-1">
        <ChatInput
          userInput={userInput}
          setUserInput={setUserInput}
          onSendMessage={handleUserInput}
          loading={loading}
          isMessageSending={isMessageSending}
          isProcessingTask={isProcessingTask}
          disabled={isSubmitting}
          placeholder="Please enter your website domain...."
        />
      </div>


      {/* 警示框 */}
      <div className={`fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
        showAlert ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      } ${showAlert ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className="bg-red-500 dark:bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg max-w-[90vw] sm:max-w-none">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-2 sm:ml-3">
              <span className="text-xs sm:text-sm font-medium">
                {alertMessage}
              </span>
            </div>
          </div>
        </div>
      </div>
                    
      {/* 步骤卡片 */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-2 sm:px-4">
        {/* 卡片1 */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300 max-w-[280px] sm:max-w-xs mx-auto sm:mx-0">
          <div className="mb-2 sm:mb-3 p-2 sm:p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <svg width="20" height="20" className="sm:w-6 sm:h-6 fill-none stroke-current text-blue-500 dark:text-blue-400" strokeWidth={1.5}>
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-gray-800 dark:text-gray-200">Create Your First Page</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
            Generate alternative Pages, best pages or faq pages for your website
          </div>
        </div>

        {/* 卡片2 */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300 max-w-[280px] sm:max-w-xs mx-auto sm:mx-0">
          <div className="mb-2 sm:mb-3 p-2 sm:p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <svg width="20" height="20" className="sm:w-6 sm:h-6 fill-none stroke-current text-blue-500 dark:text-blue-400" strokeWidth={1.5}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" />
            </svg>
          </div>
          <div className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-gray-800 dark:text-gray-200">Bind Your Domain</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
            Without domain setup, pages will only work on our subdomain
          </div>
        </div>  

        {/* 卡片3 */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300 max-w-[280px] sm:max-w-xs mx-auto sm:mx-0">
          <div className="mb-2 sm:mb-3 p-2 sm:p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <svg width="20" height="20" className="sm:w-6 sm:h-6 fill-none stroke-current text-blue-500 dark:text-blue-400" strokeWidth={1.5}>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6" />
              <path d="M21 12h-6m-6 0H3" />
            </svg>
          </div>
          <div className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-gray-800 dark:text-gray-200">Bind Your Domain</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
            Without domain setup, pages will only work on our subdomain
          </div>
        </div>
      </div>
    </section>
  );
};