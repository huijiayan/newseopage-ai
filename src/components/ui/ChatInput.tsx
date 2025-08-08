'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Input } from 'antd';
import { useTheme } from '../../utils/theme-config.js';
import { validateDomain, extractDomain } from '../research-tool/utils/research-tool-utils';

interface Competitor {
  hubPageId: string;
  websiteId: string;
  pageTitle?: string;
  url?: string;
}

interface ChatInputProps {
  userInput: string;
  setUserInput: (value: string) => void;
  onSendMessage: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onStartGeneration?: (params: {
    hubPageIds: string[];
    conversationId: string | null;
    websiteId: string;
  }) => void;
  loading?: boolean;
  isMessageSending?: boolean;
  isProcessingTask?: boolean;
  selectedCompetitors?: Competitor[];
  currentConversationId?: string | null;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  chatType?: 'alternative' | 'best' | 'faq';
  onDomainProcessed?: (domain: string, websiteId?: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  userInput,
  setUserInput,
  onSendMessage,
  onStartGeneration,
  loading = false,
  isMessageSending = false,
  isProcessingTask = false,
  selectedCompetitors = [],
  currentConversationId = null,
  disabled = false,
  placeholder,
  className = '',
  chatType = 'alternative',
  onDomainProcessed,
}) => {
  const { currentTheme, getThemeConfig, isHydrated } = useTheme();
  const inputRef = useRef<any>(null);
  
  // 获取主题配置
  const themeStyles = isHydrated ? getThemeConfig('researchTool') : {
    background: 'linear-gradient(180deg, #121826 0%, #030810 100%)'
  };

  // 动态占位符文本
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    if (selectedCompetitors.length > 0) {
      return "Just select cards to start the task";
    }
    
    if (loading || isMessageSending || isProcessingTask) {
      return "Agent is working, please keep waiting...";
    }
    
    return "Please enter your website domain....";
  };

  // 处理域名输入
  const processDomainInput = (input: string): string => {
    let domain = input.trim();
    
    // 验证域名格式
    if (!validateDomain(domain)) {
      return input; // 返回原始输入，让用户看到错误
    }
    
    // 提取域名
    const extractedDomain = extractDomain(domain);
    
    // 存储到localStorage
    localStorage.setItem('currentDomain', extractedDomain);
    localStorage.setItem('currentProductUrl', domain);
    
    console.log('🔍 域名已处理并存储:', {
      original: domain,
      extracted: extractedDomain,
      chatType
    });
    
    return extractedDomain;
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
    if (e.target.value === '') {
      // 如果输入框为空，清空选中的竞争对手
      // 这里可以通过props传递回调函数来处理
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.shiftKey) {
      return; // 允许换行
    }
    e.preventDefault();
    e.stopPropagation();
    
    if (userInput.trim() && !loading && !isMessageSending && selectedCompetitors.length === 0) {
      onSendMessage(e);
    }
  };

  // 处理发送按钮点击
  const handleSendClick = (e: React.MouseEvent) => {
    if (userInput.trim() && !loading && !isMessageSending && selectedCompetitors.length === 0) {
      // 处理域名输入
      const processedInput = processDomainInput(userInput);
      
      // 如果有域名处理回调，调用它
      if (onDomainProcessed) {
        onDomainProcessed(processedInput);
      }
      
      onSendMessage(e);
    } else if (selectedCompetitors.length > 0 && onStartGeneration) {
      onStartGeneration({
        hubPageIds: selectedCompetitors.map(comp => comp.hubPageId),
        conversationId: currentConversationId,
        websiteId: selectedCompetitors[0].websiteId
      });
    }
  };

  // 移除竞争对手
  const removeCompetitor = (hubPageId: string) => {
    // 这里可以通过props传递回调函数来处理
    console.log('Remove competitor:', hubPageId);
  };

  // 检查按钮是否禁用
  const isButtonDisabled = disabled || loading || isMessageSending || isProcessingTask || (!userInput.trim() && selectedCompetitors.length === 0);

  return (
    <div className={`w-full max-w-xxl mx-auto ${className}`}>
      <div 
        className="rounded-2xl shadow-lg px-5 py-4 flex flex-col gap-2"
        style={{
          borderRadius: isHydrated ? (themeStyles.inputArea?.borderRadius || '16px') : '16px',
          background: isHydrated ? (currentTheme === 'dark' ? (themeStyles.inputArea?.background || '#0B1421') : '#FFFFFF') : 'transparent',
          boxShadow: isHydrated ? (currentTheme === 'dark' ? (themeStyles.inputArea?.boxShadow || '0px 4px 16px 0px rgba(255, 255, 255, 0.08)') : '0px 4px 16px 0px rgba(0, 0, 0, 0.08)') : '0 2px 16px 0 rgba(30,41,59,0.08)',
          backdropFilter: 'blur(2px)',
        }}
      >
        {/* 渐变边框效果 */}
        <div 
          style={{
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: '1rem',
            padding: '1px',
            background: currentTheme === 'dark' ? 'linear-gradient(101deg, rgba(150, 56, 7, 1) 20.01%, rgba(255, 255, 255, 0.15) 92.85%)' : 'linear-gradient(101deg, rgba(51, 111, 255, 1) 20.01%, rgba(166, 113, 252, 0.3) 56.73%, rgba(245, 137, 79, 0.1) 92.85%)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            pointerEvents: 'none',
          }}
        />

        {/* 竞争对手标签 */}
        {selectedCompetitors.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedCompetitors.map((competitor) => (
              <div
                key={competitor.hubPageId}
                className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
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

        {/* 输入框 */}
        <textarea
          autoComplete="off"
          name="no-autofill"
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          disabled={disabled || loading || isMessageSending || isProcessingTask || selectedCompetitors.length > 0}
          placeholder={getPlaceholder()}
          className={`bg-transparent border-none shadow-none text-base resize-none ${
            isHydrated ? themeStyles.inputArea?.text || 'text-white' : 'text-white'
          } ${
            isHydrated ? themeStyles.inputArea?.placeholder || 'placeholder-gray-400' : 'placeholder-gray-400'
          }`}
          style={{
            minHeight: '48px',
            background: 'transparent',
            color: isHydrated ? (themeStyles.inputArea?.text === 'text-white' ? '#fff' : '#000') : '#fff',
            boxShadow: 'none',
            outline: 'none',
            border: 'none',
            paddingLeft: 0,
            paddingRight: 0,
            caretColor: isHydrated ? themeStyles.inputArea?.caretColor || '#fff' : '#fff',
          }}
          onFocus={(e: React.FocusEvent<HTMLTextAreaElement>) => {
            e.target.style.background = 'transparent';
            e.target.style.color = isHydrated ? (themeStyles.inputArea?.text === 'text-white' ? '#fff' : '#000') : '#fff';
            e.target.style.outline = 'none';
            e.target.style.boxShadow = 'none';
            e.target.style.border = 'none';
          }}
          onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => {
            e.target.style.background = 'transparent';
            e.target.style.color = isHydrated ? (themeStyles.inputArea?.text === 'text-white' ? '#fff' : '#000') : '#fff';
            e.target.style.outline = 'none';
            e.target.style.boxShadow = 'none';
            e.target.style.border = 'none';
          }}
          onKeyPress={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleKeyPress(e);
            }
          }}
        />

        {/* 按钮区域 */}
        <div className="flex justify-between items-end mt-1">
          <div className="flex items-center gap-2">
            {/* 可以在这里添加其他按钮 */}
          </div>
          
          {/* 发送按钮 */}
          <button
            onClick={handleSendClick}
            disabled={isButtonDisabled}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
              isHydrated ? themeStyles.sendButton?.background || 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
            } ${
              isHydrated ? themeStyles.sendButton?.backgroundHover || 'hover:from-blue-600 hover:to-indigo-700' : 'hover:from-blue-600 hover:to-indigo-700'
            } ${
              isHydrated ? themeStyles.sendButton?.shadow || 'shadow-md' : 'shadow-md'
            } ${
              isHydrated ? themeStyles.sendButton?.shadowHover || 'hover:shadow-lg' : 'hover:shadow-lg'
            } ${
              isHydrated ? themeStyles.sendButton?.scale || 'hover:scale-105' : 'hover:scale-105'
            } ${
              isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            style={{ 
              width: selectedCompetitors.length > 0 ? 'auto' : '40px',
              height: '40px',
              minWidth: selectedCompetitors.length > 0 ? '160px' : '40px',
              padding: selectedCompetitors.length > 0 ? '0 16px' : '0',
              borderRadius: isHydrated ? (themeStyles.sendButton?.borderRadius || '10px') : '10px',
              border: isHydrated ? (themeStyles.sendButton?.border || '1px solid #D9E3F0') : '1px solid #D9E3F0',
              background: isButtonDisabled
                ? (isHydrated && currentTheme === 'dark' ? 'rgb(55 65 81 / 0.6)' : 'rgb(156 163 175)')
                : currentTheme === 'dark' 
                  ? 'linear-gradient(115deg, #AA450B -2.53%, #231109 26.44%, #10132D 48.59%, #101834 68.22%, #0D47A6 96.36%)'
                  : 'linear-gradient(101deg, #336FFF 20.01%, #A671FC 56.73%, #F5894F 92.85%)',
              boxShadow: isHydrated ? (themeStyles.sendButton?.shadow || 'none') : 'none',
              color: 'white'
            }}
          >
            <img 
              src="/icons/send-button-icon.png" 
              alt="Send" 
              className="w-5 h-5" 
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
