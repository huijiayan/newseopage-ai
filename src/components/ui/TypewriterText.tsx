import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // 打字速度（毫秒/字符）
  delay?: number; // 开始前的延迟（毫秒）
  onComplete?: () => void; // 打字完成后的回调
  className?: string; // 自定义样式类
  showCursor?: boolean; // 是否显示光标
  cursorBlink?: boolean; // 光标是否闪烁
  autoStart?: boolean; // 是否自动开始
  pauseOnPunctuation?: boolean; // 是否在标点符号处暂停
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50,
  delay = 0,
  onComplete,
  className = '',
  showCursor = true,
  cursorBlink = true,
  autoStart = true,
  pauseOnPunctuation = true
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  // 在标点符号处增加延迟
  const getDelayForChar = (char: string, baseSpeed: number): number => {
    if (!pauseOnPunctuation) return baseSpeed;
    
    const punctuationDelays: Record<string, number> = {
      '.': baseSpeed * 3,
      '!': baseSpeed * 3,
      '?': baseSpeed * 3,
      ',': baseSpeed * 2,
      ';': baseSpeed * 2,
      ':': baseSpeed * 2,
      '\n': baseSpeed * 4,
    };
    
    return punctuationDelays[char] || baseSpeed;
  };

  // 开始打字效果
  const startTyping = () => {
    if (isTyping || isComplete) return;
    
    setIsTyping(true);
    setCurrentIndex(0);
    setDisplayText('');
    setIsComplete(false);
  };

  // 停止打字效果
  const stopTyping = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsTyping(false);
  };

  // 重置打字效果
  const resetTyping = () => {
    stopTyping();
    setDisplayText('');
    setCurrentIndex(0);
    setIsTyping(false);
    setIsComplete(false);
  };

  // 立即显示完整文本
  const showFullText = () => {
    stopTyping();
    setDisplayText(text);
    setCurrentIndex(text.length);
    setIsComplete(true);
    onComplete?.();
  };

  // 打字效果逻辑
  useEffect(() => {
    if (!autoStart || !text || isTyping) return;

    const timer = setTimeout(() => {
      startTyping();
    }, delay);

    return () => clearTimeout(timer);
  }, [autoStart, text, delay]);

  useEffect(() => {
    if (!isTyping || currentIndex >= text.length) {
      if (isTyping) {
        setIsTyping(false);
        setIsComplete(true);
        onComplete?.();
      }
      return;
    }

    const char = text[currentIndex];
    const charDelay = getDelayForChar(char, speed);

    timeoutRef.current = setTimeout(() => {
      setDisplayText(prev => prev + char);
      setCurrentIndex(prev => prev + 1);
    }, charDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isTyping, currentIndex, text, speed, onComplete]);

  // 光标闪烁效果
  useEffect(() => {
    if (!showCursor || !cursorBlink || !cursorRef.current) return;

    const interval = setInterval(() => {
      if (cursorRef.current) {
        cursorRef.current.style.opacity = cursorRef.current.style.opacity === '0' ? '1' : '0';
      }
    }, 500);

    return () => clearInterval(interval);
  }, [showCursor, cursorBlink]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 当文本变化时重置
  useEffect(() => {
    if (text !== displayText && !isTyping) {
      resetTyping();
    }
  }, [text]);

  return (
    <div className={`typewriter-text ${className}`}>
      <span className="typewriter-content">
        {displayText}
        {showCursor && (
          <span
            ref={cursorRef}
            className="typewriter-cursor"
            style={{
              display: 'inline-block',
              width: '2px',
              height: '1.2em',
              backgroundColor: 'currentColor',
              marginLeft: '2px',
              animation: cursorBlink ? 'cursor-blink 1s infinite' : 'none'
            }}
          />
        )}
      </span>
      
      {/* 控制按钮 */}
      <div className="typewriter-controls mt-2 flex gap-2">
        {!isComplete && !isTyping && (
          <button
            onClick={startTyping}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            开始
          </button>
        )}
        {isTyping && (
          <button
            onClick={stopTyping}
            className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            暂停
          </button>
        )}
        {!isTyping && (
          <button
            onClick={showFullText}
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            显示全部
          </button>
        )}
        <button
          onClick={resetTyping}
          className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          重置
        </button>
      </div>

      <style jsx>{`
        .typewriter-text {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        
        .typewriter-content {
          display: inline;
        }
        
        .typewriter-cursor {
          animation: cursor-blink 1s infinite;
        }
        
        @keyframes cursor-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        .typewriter-controls {
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }
        
        .typewriter-controls:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default TypewriterText;
