"use client"; 
import React, { useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { SendButton } from "./SendButton";
import apiClient from '@/lib/api/index';

export const Hero: React.FC = () => {
  const router = useRouter();
  const [userInput, setUserInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMessageSending, setIsMessageSending] = useState(false);
  const [isProcessingTask, setIsProcessingTask] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSlogan, setShowSlogan] = useState(true);
  const [shouldConnectSSE, setShouldConnectSSE] = useState(false);
  const [canProcessCompetitors, setCanProcessCompetitors] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const isFirstMessageSentForNewTaskRef = useRef(false);

  // 验证域名的函数
  const validateDomain = (input: string): boolean => {
    let domain = input.trim();
    
    // 检查是否为空
    if (!domain) {
      return false;
    }
    
    // 检查是否只包含数字
    if (/^\d+$/.test(domain)) {
      return false;
    }

    // 如果没有协议，添加https://
    if (!domain.match(/^https?:\/\//i)) {
      domain = 'https://' + domain;
    }

    try {
      const url = new URL(domain);
      domain = url.hostname;
    } catch (error) {
      return false;
    }

    // 检查是否包含点号（必须有顶级域名）
    if (!domain.includes('.')) {
      return false;
    }

    // 使用更严格的域名正则表达式
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return domainRegex.test(domain);
  };

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

    // 域名验证
    if (!validateDomain(formattedInput)) {
      showAlertMessage('Please enter a valid website domain, such as example.com or https://example.com');
      setIsSubmitting(false);
      return;
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
          messageHandler.addSystemMessage('You have no credits left. Please purchase a package to continue using.');
          setIsSubmitting(false);
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
          setLoading(false);
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

        // 跳转到聊天室页面，传递conversationId参数
        router.replace(`${targetPath}?conversationId=${tempConversationId}`);
        
        // 清空消息列表，因为要跳转到新页面
        setMessages([]);
        setShowSlogan(false);
        
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleSendClick = () => {
    // 先验证域名
    if (!userInput.trim()) {
      showAlertMessage('Please enter a website domain');
      return;
    }
    
    if (/^\d+$/.test(userInput.trim())) {
      showAlertMessage('Please enter a valid website domain, not just numbers');
      return;
    }
    
    if (!validateDomain(userInput)) {
      showAlertMessage('Please enter a valid website domain, such as example.com or https://example.com');
      return;
    }
    
    // 验证通过，调用API
    handleUserInput(userInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
                                e.preventDefault();
      handleSendClick(); // 使用handleSendClick来触发验证
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

  return (
    <section className="w-full py-12 flex flex-col items-center bg-white dark:bg-gray-900 min-h-[600px] justify-center">
      {/* 顶部按钮 */}
      <button className="mb-8 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium shadow-sm transition hover:shadow-md border border-blue-200/30 dark:border-blue-700/30">
        ✨ Generate 5 pages for free.
      </button>

      {/* 渐变大标题 */}
      <h1
        className="text-2xl sm:text-3xl md:text-6xl font-extrabold text-center mb-4 leading-tight px-4"
                                style={{ 
          background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 40%, #ec4899 70%, #f59e0b 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Get Found When People Search Your Competitor
                </h1>
                
      {/* 副标题 */}
      <p className="text-gray-500 dark:text-gray-400 text-base text-center mb-8 max-w-xl leading-relaxed px-4">
        Own all your competitor's brand search traffic with AI-generated pages that outrank.
      </p>

      {/* 输入框 */}
      <div className="w-full max-w-2xl mb-12 px-1">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-blue-200 dark:border-blue-700 relative px-4 pt-2 pb-28 hover:shadow-lg transition-shadow duration-300">
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-200 text-lg placeholder-gray-400 dark:placeholder-gray-500 leading-loose"
            placeholder="Please enter your website domain...."
            disabled={isSubmitting || isMessageSending || isProcessingTask}
          />
          <div className="absolute bottom-3 right-3">
            <SendButton 
              onClick={handleSendClick}
              disabled={isSubmitting || isMessageSending || isProcessingTask || !userInput.trim()}
              hasContent={userInput.trim().length > 0}
            />
                        </div>
                      </div>
                    </div>

      {/* 消息显示区域 */}
      {messages.length > 0 && (
        <div className="w-full max-w-2xl mb-8 px-1">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : message.type === 'system'
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}>
                  {message.isThinking ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                      <span className="text-sm">{message.content}</span>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
                            </div>
        </div>
      )}

      {/* 警示框 */}
      <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
        showAlert ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      } ${showAlert ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className="bg-red-500 dark:bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <span className="text-sm font-medium">
                {alertMessage}
              </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
      {/* 步骤卡片 */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 justify-center px-4">
                      {/* 卡片1 */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300 max-w-xs">
          <div className="mb-3 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-blue-500 dark:text-blue-400">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
                          </svg>
                        </div>
          <div className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">Create Your First Page</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            Generate alternative Pages, best pages or faq pages for your website
                        </div>
                      </div>

                      {/* 卡片2 */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300 max-w-xs">
          <div className="mb-3 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-blue-500 dark:text-blue-400">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" />
                        </svg>
                      </div>
          <div className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">Bind Your Domain</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            Without domain setup, pages will only work on our subdomain
                      </div>
                      </div>  

                      {/* 卡片3 */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300 max-w-xs">
          <div className="mb-3 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-blue-500 dark:text-blue-400">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6" />
              <path d="M21 12h-6m-6 0H3" />
                          </svg>
                        </div>
          <div className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">Bind Your Domain</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            Without domain setup, pages will only work on our subdomain
          </div>
        </div>
      </div>
    </section>
  );
};