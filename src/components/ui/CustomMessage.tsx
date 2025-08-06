'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';

// 消息类型
type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';

// 消息接口
interface MessageItem {
  id: string;
  type: MessageType;
  content: string;
  duration?: number;
}

// 消息上下文
interface MessageContextType {
  success: (content: string, duration?: number) => void;
  error: (content: string, duration?: number) => void;
  info: (content: string, duration?: number) => void;
  warning: (content: string, duration?: number) => void;
  loading: (content: string, duration?: number) => void;
  destroy: () => void;
}

const MessageContext = createContext<MessageContextType | null>(null);

// 消息提供者组件
export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<MessageItem[]>([]);

  const addMessage = (type: MessageType, content: string, duration: number = 3) => {
    const id = crypto.randomUUID();
    const newMessage: MessageItem = { id, type, content, duration };
    
    setMessages(prev => [...prev, newMessage]);

    // 自动移除消息
    if (duration > 0) {
      setTimeout(() => {
        removeMessage(id);
      }, duration * 1000);
    }
  };

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const messageApi: MessageContextType = {
    success: (content: string, duration?: number) => addMessage('success', content, duration),
    error: (content: string, duration?: number) => addMessage('error', content, duration),
    info: (content: string, duration?: number) => addMessage('info', content, duration),
    warning: (content: string, duration?: number) => addMessage('warning', content, duration),
    loading: (content: string, duration?: number) => addMessage('loading', content, duration),
    destroy: () => setMessages([])
  };

  return (
    <MessageContext.Provider value={messageApi}>
      {children}
      <MessageContainer messages={messages} onRemove={removeMessage} />
    </MessageContext.Provider>
  );
};

// 消息容器组件
const MessageContainer: React.FC<{
  messages: MessageItem[];
  onRemove: (id: string) => void;
}> = ({ messages, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} onRemove={onRemove} />
      ))}
    </div>
  );
};

// 单个消息组件
const MessageItem: React.FC<{
  message: MessageItem;
  onRemove: (id: string) => void;
}> = ({ message, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 动画进入
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(message.id), 300);
  };

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'loading':
        return (
          <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (message.type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'loading': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (message.type) {
      case 'success': return 'text-green-800';
      case 'error': return 'text-red-800';
      case 'info': return 'text-blue-800';
      case 'warning': return 'text-yellow-800';
      case 'loading': return 'text-blue-800';
      default: return 'text-gray-800';
    }
  };

  return (
    <div
      className={`
        ${getBgColor()} ${getTextColor()}
        border rounded-lg shadow-lg p-4 min-w-80 max-w-md
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message.content}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Hook 用于在组件中使用消息
export const useMessage = (): MessageContextType => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

// 兼容 Ant Design message API 的导出
export const message: MessageContextType = {
  success: () => console.warn('message.success called outside MessageProvider'),
  error: () => console.warn('message.error called outside MessageProvider'),
  info: () => console.warn('message.info called outside MessageProvider'),
  warning: () => console.warn('message.warning called outside MessageProvider'),
  loading: () => console.warn('message.loading called outside MessageProvider'),
  destroy: () => console.warn('message.destroy called outside MessageProvider')
}; 