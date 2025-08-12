import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AITypewriterMessage } from './AITypewriterMessage';

interface AIMessage {
  id?: string;
  type: string;
  content: any;
  timestamp?: string;
  status?: string;
  domain?: string;
  conversationId?: string;
}

interface AIMessageStreamProps {
  messages: AIMessage[];
  className?: string;
  speed?: number;
  autoStart?: boolean;
  showScrollToBottom?: boolean;
  maxHeight?: string;
  onMessageComplete?: (messageId: string) => void;
  onNewMessage?: (message: AIMessage) => void;
}

export const AIMessageStream: React.FC<AIMessageStreamProps> = ({
  messages,
  className = '',
  speed = 30,
  autoStart = true,
  showScrollToBottom = true,
  maxHeight = '600px',
  onMessageComplete,
  onNewMessage
}) => {
  const [completedMessages, setCompletedMessages] = useState<Set<string>>(new Set());
  const [showScrollButton, setShowScrollButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollButtonRef = useRef<HTMLButtonElement>(null);

  // 处理新消息
  useEffect(() => {
    if (messages.length > 0 && onNewMessage) {
      const lastMessage = messages[messages.length - 1];
      onNewMessage(lastMessage);
    }
  }, [messages, onNewMessage]);

  // 处理消息完成
  const handleMessageComplete = useCallback((messageId: string) => {
    setCompletedMessages(prev => new Set([...prev, messageId]));
    if (onMessageComplete) {
      onMessageComplete(messageId);
    }
  }, [onMessageComplete]);

  // 检查是否需要显示滚动按钮
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setShowScrollButton(!isAtBottom);
    };

    container.addEventListener('scroll', checkScroll);
    checkScroll();

    return () => container.removeEventListener('scroll', checkScroll);
  }, [messages]);

  // 滚动到底部
  const scrollToBottom = useCallback((smooth = true) => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, []);

  // 自动滚动到底部（当有新消息时）
  useEffect(() => {
    if (messages.length > 0) {
      // 延迟滚动，确保DOM更新完成
      const timer = setTimeout(() => {
        scrollToBottom(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, scrollToBottom]);

  // 获取消息状态
  const getMessageStatus = (message: AIMessage): string => {
    if (message.status) return message.status;
    
    // 根据消息类型推断状态
    switch (message.type) {
      case 'tool_result':
        return 'success';
      case 'error':
        return 'error';
      case 'system_message':
        return 'processing';
      default:
        return 'success';
    }
  };

  // 过滤和排序消息
  const processedMessages = messages
    .filter(message => message && message.content)
    .map(message => ({
      ...message,
      status: getMessageStatus(message),
      id: message.id || `msg-${Date.now()}-${Math.random()}`
    }));

  return (
    <div className={`ai-message-stream ${className}`}>
      {/* 消息容器 */}
      <div
        ref={containerRef}
        className="ai-messages-container overflow-y-auto pr-2"
        style={{ maxHeight }}
      >
        {processedMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-2xl mb-2">🤖</div>
            <div className="text-sm">等待AI消息...</div>
          </div>
        ) : (
          processedMessages.map((message, index) => (
            <AITypewriterMessage
              key={message.id || index}
              message={message}
              speed={speed}
              autoStart={autoStart}
              onMessageComplete={handleMessageComplete}
              className={completedMessages.has(message.id || '') ? 'opacity-75' : ''}
            />
          ))
        )}
      </div>

      {/* 滚动到底部按钮 */}
      {showScrollToBottom && showScrollButton && (
        <button
          ref={scrollButtonRef}
          onClick={() => scrollToBottom(true)}
          className="fixed bottom-4 right-4 w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-50"
          title="滚动到底部"
        >
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      {/* 消息统计 */}
      <div className="ai-message-stats mt-4 text-xs text-gray-500 text-center">
        <span className="mr-4">
          总消息: {processedMessages.length}
        </span>
        <span className="mr-4">
          已完成: {completedMessages.size}
        </span>
        <span>
          进行中: {processedMessages.length - completedMessages.size}
        </span>
      </div>

      <style jsx>{`
        .ai-message-stream {
          position: relative;
        }
        
        .ai-messages-container {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
        
        .ai-messages-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .ai-messages-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .ai-messages-container::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        
        .ai-messages-container::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.7);
        }
        
        .ai-message-stats {
          border-top: 1px solid rgba(156, 163, 175, 0.2);
          padding-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default AIMessageStream;
