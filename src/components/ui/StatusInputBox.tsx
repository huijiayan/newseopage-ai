'use client';

import React from 'react';

interface StatusInputBoxProps {
  title: string;
  content: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  actions?: {
    primary?: {
      icon: string;
      text: string;
      onClick: () => void;
    };
    secondary?: {
      text: string;
      onClick: () => void;
    };
  };
  disabled?: boolean;
}

/**
 * 状态输入框组件 - 模拟图片中的"Waiting for your input"框
 */
const StatusInputBox: React.FC<StatusInputBoxProps> = ({
  title,
  content,
  isExpanded = false,
  onToggle,
  actions,
  disabled = false
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 主要状态框 */}
      <div 
        className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 cursor-pointer transition-all duration-200 ${
          isExpanded ? 'rounded-b-none' : ''
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-blue-500 text-sm font-medium">
              {title}
            </div>
            {!isExpanded && (
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                {content}
              </div>
            )}
          </div>
          
          {onToggle && (
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 展开的内容区域 */}
      {isExpanded && (
        <div className="bg-white dark:bg-gray-800 border border-t-0 border-blue-200 dark:border-blue-800 rounded-b-2xl p-4">
          {/* 输入框区域 */}
          <div className="space-y-4">
            <div className="text-gray-700 dark:text-gray-300 text-sm">
              {content}
            </div>
            
            {/* 输入框 */}
            <div className="relative">
              <input
                type="text"
                placeholder="Agent is working, please keep waiting..."
                disabled={disabled}
                className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  disabled ? 'cursor-not-allowed opacity-75' : ''
                }`}
              />
            </div>
            
            {/* 操作按钮区域 */}
            {actions && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4">
                  {actions.primary && (
                    <button
                      onClick={actions.primary.onClick}
                      disabled={disabled}
                      className="flex items-center space-x-2 px-3 py-1.5 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>{actions.primary.icon}</span>
                      <span>{actions.primary.text}</span>
                    </button>
                  )}
                  
                  {actions.secondary && (
                    <button
                      onClick={actions.secondary.onClick}
                      disabled={disabled}
                      className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actions.secondary.text}
                    </button>
                  )}
                </div>
                
                {/* 发送按钮 */}
                <button
                  disabled={disabled}
                  className="w-10 h-10 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusInputBox;