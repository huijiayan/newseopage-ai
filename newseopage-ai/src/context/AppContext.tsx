'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import apiClient from '@/lib/api';
import { getLocalStorageItem } from '@/lib/utils';

type PageType = 'Alternative Page' | 'Best Page' | null;

interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  pageType: PageType;
}

interface WebsiteEntry {
  id: string;
  websiteURL: string;
  pagesGenerated: number;
  createdAt: Date;
  pageType: PageType;
  status?: string;
}

interface AppContextType {
  activePage: PageType;
  setActivePage: (page: PageType) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  // 聊天记录管理
  chatMessages: ChatMessage[];
  websiteEntries: WebsiteEntry[];
  addChatMessage: (content: string, pageType: PageType) => void;
  getChatMessagesByPage: (pageType: PageType) => ChatMessage[];
  clearChatMessages: (pageType?: PageType) => void;
  // 后端数据管理
  loadWebsiteEntries: () => Promise<void>;
  deleteWebsiteEntry: (entryId: string) => Promise<void>;
  isLoading: boolean;
  // 用户输入状态管理
  hasUserSubmitted: boolean;
  setHasUserSubmitted: (submitted: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activePage, setActivePage] = useState<PageType>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [websiteEntries, setWebsiteEntries] = useState<WebsiteEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserSubmitted, setHasUserSubmitted] = useState(false);

  // 监听主题变化并应用到 html 标签
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDarkMode);
    }
  }, [isDarkMode]);

  // 自动从localStorage恢复邮箱
  useEffect(() => {
    const storedEmail = getLocalStorageItem('alternativelyCustomerEmail');
    if (storedEmail) setUserEmail(storedEmail);
  }, []);

  // 添加聊天消息
  const addChatMessage = (content: string, pageType: PageType) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      pageType,
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  // 根据页面类型获取聊天消息
  const getChatMessagesByPage = (pageType: PageType) => {
    return chatMessages.filter(msg => msg.pageType === pageType);
  };

  // 清除聊天消息
  const clearChatMessages = (pageType?: PageType) => {
    if (pageType) {
      setChatMessages(prev => prev.filter(msg => msg.pageType !== pageType));
    } else {
      setChatMessages([]);
    }
  };

  // 从后端加载网站条目
  const loadWebsiteEntries = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getAlternativeWebsiteList();
      
      if (response?.code === 200 && response.data) {
        const entries: WebsiteEntry[] = response.data.map((item: any) => {
          // 安全地解析日期
          let createdAt: Date;
          try {
            const dateString = item.createdAt || item.created_at;
            if (dateString) {
              createdAt = new Date(dateString);
              // 检查日期是否有效
              if (isNaN(createdAt.getTime())) {
                createdAt = new Date(); // 使用当前日期作为后备
              }
            } else {
              createdAt = new Date(); // 使用当前日期作为后备
            }
          } catch (error) {
            console.error('Date parsing error:', error);
            createdAt = new Date(); // 使用当前日期作为后备
          }

          return {
            id: item.websiteId || item.id,
            websiteURL: item.websiteURL || item.website,
            pagesGenerated: item.pagesGenerated || item.pagesCount || 0,
            createdAt,
            pageType: 'Alternative Page' as PageType, // 默认为 Alternative Page
            status: item.status
          };
        });
        setWebsiteEntries(entries);
      }
    } catch (error: any) {
      console.error('Failed to load website entries:', error);
      // 如果是404错误，设置空数组而不是显示错误
      if (error.response?.status === 404) {
        console.log('Website entries endpoint not found, setting empty array');
        setWebsiteEntries([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 删除网站条目
  const deleteWebsiteEntry = async (entryId: string) => {
    try {
      await apiClient.deletePage(entryId);
      setWebsiteEntries(prev => prev.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error('Failed to delete website entry:', error);
    }
  };

  // 初始加载网站条目
  useEffect(() => {
    if (userEmail) {
      loadWebsiteEntries();
    }
  }, [userEmail]);

  // 当用户提交输入后，重新加载网站条目以获取最新数据
  useEffect(() => {
    if (hasUserSubmitted && userEmail) {
      // 延迟一点时间让后端处理完成
      const timer = setTimeout(() => {
        loadWebsiteEntries();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasUserSubmitted, userEmail]);

  return (
    <AppContext.Provider 
      value={{ 
        activePage, 
        setActivePage, 
        isSidebarOpen, 
        setIsSidebarOpen,
        isDarkMode,
        setIsDarkMode,
        userEmail,
        setUserEmail,
        chatMessages,
        websiteEntries,
        addChatMessage,
        getChatMessagesByPage,
        clearChatMessages,
        loadWebsiteEntries,
        deleteWebsiteEntry,
        isLoading,
        hasUserSubmitted,
        setHasUserSubmitted,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 