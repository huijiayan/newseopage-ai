import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TypewriterText } from './TypewriterText';

interface AIMessage {
  id?: string;
  type: string;
  content: any;
  timestamp?: string;
  status?: string;
  domain?: string;
  conversationId?: string;
}

interface AITypewriterMessageProps {
  message: AIMessage;
  className?: string;
  speed?: number;
  showControls?: boolean;
  onMessageComplete?: (messageId: string) => void;
  autoStart?: boolean;
}

export const AITypewriterMessage: React.FC<AITypewriterMessageProps> = ({
  message,
  className = '',
  speed = 30,
  showControls = true,
  onMessageComplete,
  autoStart = true
}) => {
  const [processedContent, setProcessedContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 处理不同类型的消息内容
  const processMessageContent = useCallback((msg: AIMessage): string => {
    if (!msg.content) return '';

    // 如果是字符串，直接返回
    if (typeof msg.content === 'string') {
      return msg.content;
    }

    // 如果是对象，尝试提取文本内容
    if (typeof msg.content === 'object') {
      // 处理AI消息结构
      if (msg.content.messages && Array.isArray(msg.content.messages)) {
        const aiMessages = msg.content.messages.filter((m: any) => 
          m.type === 'AIMessage' && m.content && typeof m.content === 'string'
        );
        
        if (aiMessages.length > 0) {
          return aiMessages.map((m: any) => m.content).join('\n\n');
        }
      }

      // 处理工具结果
      if (msg.content.output && typeof msg.content.output === 'string') {
        return msg.content.output;
      }

      // 处理payload内容
      if (msg.content.payload) {
        if (typeof msg.content.payload === 'string') {
          return msg.content.payload;
        }
        if (msg.content.payload.content && typeof msg.content.payload.content === 'string') {
          return msg.content.payload.content;
        }
      }

      // 尝试从content中提取文本
      const extractText = (obj: any): string => {
        if (typeof obj === 'string') return obj;
        if (Array.isArray(obj)) {
          return obj.map(extractText).filter(Boolean).join('\n');
        }
        if (obj && typeof obj === 'object') {
          const textParts: string[] = [];
          for (const [key, value] of Object.entries(obj)) {
            if (key === 'content' || key === 'text' || key === 'message') {
              const extracted = extractText(value);
              if (extracted) textParts.push(extracted);
            }
          }
          return textParts.join('\n');
        }
        return '';
      };

      const extracted = extractText(msg.content);
      if (extracted) return extracted;
    }

    // 如果都失败了，返回JSON字符串
    try {
      return JSON.stringify(msg.content, null, 2);
    } catch {
      return '无法解析的消息内容';
    }
  }, []);

  // 处理消息内容
  useEffect(() => {
    if (!message) return;

    setIsProcessing(true);
    const content = processMessageContent(message);
    setProcessedContent(content);
    
    // 延迟一下再开始打字效果，让用户有时间看到消息出现
    timeoutRef.current = setTimeout(() => {
      setIsProcessing(false);
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, processMessageContent]);

  // 处理打字完成
  const handleTypingComplete = useCallback(() => {
    setIsComplete(true);
    if (message.id && onMessageComplete) {
      onMessageComplete(message.id);
    }
  }, [message.id, onMessageComplete]);

  // 获取消息类型图标
  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'tool_result':
        return '🔧';
      case 'agent_message':
        return '🤖';
      case 'system_message':
        return '⚙️';
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      default:
        return '💬';
    }
  };

  // 获取消息类型标题
  const getMessageTitle = (type: string) => {
    switch (type) {
      case 'tool_result':
        return '工具执行结果';
      case 'agent_message':
        return 'AI助手';
      case 'system_message':
        return '系统消息';
      case 'error':
        return '错误信息';
      case 'success':
        return '成功信息';
      default:
        return 'AI消息';
    }
  };

  // 获取消息状态样式
  const getMessageStatusStyle = (status?: string) => {
    switch (status) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'processing':
        return 'border-blue-500/30 bg-blue-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  if (!message || !processedContent) {
    return null;
  }

  return (
    <div className={`ai-typewriter-message mb-4 ${className}`}>
      <div className="relative w-full">
        <div
          className={`px-4 py-3 w-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 rounded-xl border ${getMessageStatusStyle(message.status)}`}
        >
          {/* 消息头部 */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg">
              {getMessageIcon(message.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm">
                {getMessageTitle(message.type)}
              </div>
              {message.domain && (
                <div className="text-xs text-gray-400 mt-1">
                  域名: {message.domain}
                </div>
              )}
            </div>
            {message.timestamp && (
              <div className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* 消息内容 */}
          <div className="ml-11">
            {isProcessing ? (
              <div className="text-gray-400 text-sm">正在处理消息...</div>
            ) : (
              <TypewriterText
                text={processedContent}
                speed={speed}
                autoStart={autoStart}
                onComplete={handleTypingComplete}
                showCursor={!isComplete}
                className="text-gray-200 text-sm leading-relaxed"
              />
            )}
          </div>

          {/* 消息状态 */}
          {message.status && (
            <div className="mt-3 ml-11">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                message.status === 'success' ? 'bg-green-100 text-green-800' :
                message.status === 'error' ? 'bg-red-100 text-red-800' :
                message.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                message.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {message.status === 'success' && '✅'}
                {message.status === 'error' && '❌'}
                {message.status === 'warning' && '⚠️'}
                {message.status === 'processing' && '⏳'}
                {message.status}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITypewriterMessage;
