// 对应老代码中的工具函数集合，100%还原原始逻辑
// 包含所有helper函数和常用工具方法

import { TAG_FILTERS } from '@/types/research-tool';
import type { PageData, LogData } from '@/types/research-tool';

// 对应老代码第227-233行的filterMessageTags函数
export const filterMessageTags = (message: string): string => {
  let filteredMessage = message;
  Object.entries(TAG_FILTERS).forEach(([tag, replacement]) => {
    filteredMessage = filteredMessage.replace(new RegExp(tag, 'g'), replacement);
  });
  return filteredMessage;
};

// 对应老代码第364-421行的filterLogContent函数
export const filterLogContent = (content: string): string => {
  if (!content) return '';
  let filteredContent = String(content);

    filteredContent = filteredContent.replace(
    /<details.*?>\s*<summary>\s*Thinking\.\.\.\s*<\/summary>(.*?)<\/details>/g,
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
    /Action:\s*(.*?)(?=Thought:|<details|$)/g,
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
    /Thought:\s*(.*?)(?=Action:|<details|$)/g,
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
    /\{\s*"action":\s*"(.*?)"\s*,\s*"action_input":\s*"(.*?)"\s*\}/g,
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

// 对应老代码第2390-2410行的validateDomain函数
export const validateDomain = (input: string): boolean => {
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

// 对应老代码第2412-2419行的extractDomain函数
export const extractDomain = (url: string): string => {
  try {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
  } catch (e) {
    return '';
  }
};

// 对应老代码第1193-1201行的linkifyDomains函数
export const linkifyDomains = (text: string): string => {
  return text.replace(
    /\b(?:https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b(?![^<]*>)/g,
    (match) => {
      const href = match.startsWith('http') ? match : `https://${match}`;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:#60a5fa;text-decoration:underline;">${match}</a>`;
    }
  );
};

// 对应老代码第781-796行的isJsonArrayMessage函数
export const isJsonArrayMessage = (message: string): boolean => {
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

// 对应老代码第3660-3696行的isDomainListMessage函数
export const isDomainListMessage = (message: string): boolean => {
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

// 对应老代码第2442-2463行的formatSitemapData函数
export const formatSitemapData = (data: any): PageData[] => {
  if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
    return [];
  }

  const formattedPages = data.data.map((page: any) => ({
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

// 对应老代码第284-294行的getPageMode函数
export const getPageMode = (): string => {
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
};

// CSS样式注入函数，对应老代码第2203-2387行
export const injectResearchToolStyles = (): void => {
  if (typeof document === 'undefined') return;
  
  const existingStyle = document.getElementById('research-tool-styles');
  if (existingStyle) return;

  const style = document.createElement('style');
  style.id = 'research-tool-styles';
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
    .agent-log-content-wrapper .text-xs {
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

    .research-tool-input::placeholder {
      color: #9ca3af !important;
      opacity: 0.8 !important;
    }
  `;
  
  document.head.appendChild(style);
};