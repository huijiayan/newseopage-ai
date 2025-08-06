'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useApp } from '@/context/AppContext';
import apiClient from '@/lib/api';

// 添加模态框动画样式
const modalStyles = `
  @keyframes modalSlideIn {
    0% {
      transform: scale(0.95) translateY(20px);
      opacity: 0;
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }
`;

interface ChatItem {
  conversationId: string;
  websiteUrl?: string;
  chatType: string;
  createdAt: string;
  generatorIds?: string[];
}

interface ChatGroup {
  date: string;
  chats: ChatItem[];
}

const sidebarItems = [
  {
    label: 'Alternative Page' as const,
    icon: '/icons/alternative-icon.png',
    activeIcon: '/icons/alternative-icon-chosen.png',
    href: '/alternative',
  },
  {
    label: 'Best Page' as const,
    icon: '/icons/best-icon.png',
    activeIcon: '/icons/best-icon-chosen.png',
    href: '/best',
  },
  {
    label: 'FAQ Page' as const,
    icon: '/icons/best-icon.png',
    activeIcon: '/icons/best-icon-chosen.png',
    href: '/faq',
  },
] as const;

const SidebarContent = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { 
    isSidebarOpen, 
    setIsSidebarOpen, 
    isDarkMode, 
    setIsDarkMode,
    userEmail
  } = useApp();
  
  // 检查用户登录状态
  const isLoggedIn = !!userEmail;
  const [windowWidth, setWindowWidth] = useState(0);
  const [chatList, setChatList] = useState<ChatItem[]>([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteChat, setSelectedDeleteChat] = useState<ChatItem | null>(null);
  const currentConversationId = searchParams.get('conversationId');

  // 根据当前路径获取聊天类型
  const getCurrentChatType = useCallback(() => {
    if (pathname.includes('/alternative')) {
      return 'alternative';
    } else if (pathname.includes('/best')) {
      return 'best';
    } else if (pathname.includes('/faq')) {
      return 'faq';
    }
    return 'alternative';
  }, [pathname]);

  // 根据聊天类型获取对应的页面路径
  const getPagePathByChatType = (chatType: string) => {
    switch (chatType) {
      case 'alternative':
        return '/alternative';
      case 'best':
        return '/best';
      case 'faq':
        return '/faq';
      default:
        return '/alternative';
    }
  };

  // 获取默认页面路径
  const getDefaultPagePath = () => {
    if (typeof window === 'undefined') return '/alternative';
    
    const hostname = window.location.hostname;
    
    if (hostname.includes('bestpage.ai')) {
      return '/best';
    }
    
    return '/alternative';
  };

  // 加载聊天历史
  const loadChats = useCallback(async () => {
    try {
      if (!isLoggedIn) {
        setChatList([]);
        setChatLoading(false);
        return;
      }

      setChatLoading(true);
      const res = await apiClient.getChatHistoryList(null, 1, 200);
      const allChats = res?.data || [];
      
      const currentChatType = getCurrentChatType();
      const filteredChats = allChats.filter((chat: ChatItem) => chat.chatType === currentChatType);
      
      setChatList(filteredChats);
    } catch (error) {
      console.error('Failed to load chat list:', error);
      setChatList([]);
    } finally {
      setChatLoading(false);
    }
  }, [isLoggedIn, getCurrentChatType]);

  // 监听登录成功事件
  useEffect(() => {
    const handleLoginSuccess = () => {
      loadChats();
    };

    window.addEventListener('alternativelyLoginSuccess', handleLoginSuccess);
    return () => {
      window.removeEventListener('alternativelyLoginSuccess', handleLoginSuccess);
    };
  }, [loadChats]);

  // 监听聊天开始事件
  useEffect(() => {
    const handleAnyChatStarted = () => {
      loadChats();
    };

    window.addEventListener('chatStarted', handleAnyChatStarted);
    return () => {
      window.removeEventListener('chatStarted', handleAnyChatStarted);
    };
  }, [loadChats]);

  // 初始加载
  useEffect(() => {
    loadChats();
  }, [pathname, loadChats]);

  // 监听窗口大小变化，自动控制侧边栏显示
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      
      // 当页面宽度足够时自动展开，空间不足时收起
      if (width >= 1200) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // 初始化
    handleResize();
    
    // 添加事件监听器
    window.addEventListener('resize', handleResize);
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setIsSidebarOpen]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // 按日期对聊天进行分组
  const groupChatsByDate = (chats: ChatItem[]): ChatGroup[] => {
    const groups: { [key: string]: ChatItem[] } = {};
    
    chats.forEach(chat => {
      if (!chat.createdAt) return;
      
      const dateKey = formatDate(chat.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(chat);
    });
    
    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => ({
        date,
        chats: groups[date]
      }));
  };

  // 获取聊天显示名称
  const getChatDisplayName = (chat: ChatItem) => {
    if (chat.websiteUrl) {
      return chat.websiteUrl;
    }
    return 'Untitled Chat';
  };

  // 处理删除按钮点击
  const handleDeleteChatClick = (e: React.MouseEvent, chat: ChatItem) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedDeleteChat(chat);
    setShowDeleteModal(true);
  };

  // 关闭删除模态框
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedDeleteChat(null);
  };

  // 处理删除聊天
  const handleDeleteChat = async () => {
    if (!selectedDeleteChat || !selectedDeleteChat.conversationId) {
      console.error('Cannot delete: Chat information missing.');
      return;
    }

    setDeletingChatId(selectedDeleteChat.conversationId);
    try {
      const res = await apiClient.deleteChatMessage(selectedDeleteChat.conversationId);
      if (res && res.code === 200) {
        await loadChats();
        
        if (currentConversationId === selectedDeleteChat.conversationId) {
          const defaultPath = getDefaultPagePath();
          window.location.href = defaultPath;
        }
      } else {
        console.error('Failed to delete chat. Please try again.');
      }
    } catch (error) {
      console.error('Delete chat failed:', error);
    } finally {
      setDeletingChatId(null);
      setShowDeleteModal(false);
      setSelectedDeleteChat(null);
    }
  };

  // 处理点击历史记录条目来恢复聊天
  const handleRestoreChat = (chat: ChatItem) => {
    // 将当前聊天的 websiteUrl 设置到 localStorage 中
    if (chat.websiteUrl) {
      localStorage.setItem('currentProductUrl', chat.websiteUrl);
    }
    
    const targetPath = getPagePathByChatType(chat.chatType);
    const newPath = `${targetPath}?conversationId=${chat.conversationId}`;
    window.location.href = newPath;
  };

  // 处理新建聊天
  const handleNewChat = () => {
    const defaultPath = getDefaultPagePath();
    window.location.href = defaultPath;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: modalStyles }} />
      {/* 删除确认模态框 */}
      {showDeleteModal && selectedDeleteChat && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseDeleteModal}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[120%] max-w-lg mx-4 transform scale-95 opacity-0 transition-all duration-300 ease-out"
            style={{
              animation: 'modalSlideIn 0.3s ease-out forwards'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 模态框头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Chat
              </h3>
              <button
                onClick={handleCloseDeleteModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 模态框内容 */}
            <div className="p-5">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Are you sure you want to delete this chat?
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Chat: {getChatDisplayName(selectedDeleteChat)}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                This action cannot be undone.
              </p>
            </div>

            {/* 模态框底部按钮 */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChat}
                disabled={deletingChatId === selectedDeleteChat.conversationId}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {deletingChatId === selectedDeleteChat.conversationId ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 展开按钮 */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={`fixed left-0 top-[66px] w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg ${
          isSidebarOpen ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          transform: isSidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 300ms ease-in-out, opacity 300ms ease-in-out',
        }}
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 侧边栏 */}
      <div 
        className="fixed top-[66px] left-0 h-[calc(100vh-66px)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col z-40 backdrop-blur-sm"
        style={{
          width: '280px',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 300ms ease-in-out',
        }}
      >
        {/* 侧边栏内容 */}
        <div className="flex-1 py-6 px-4 overflow-y-auto">
          {/* Pages Publishment 模块 - 仅在登录状态下显示 */}
          {isLoggedIn && (
            <div className="mb-8">
              <Link
                href="/pages-publishment"
                className={`group relative flex items-center p-3 rounded-2xl transition-all duration-300 overflow-hidden ${
                  pathname === '/pages-publishment' 
                    ? 'bg-gradient-to-br from-purple-700 to-indigo-800 shadow-xl shadow-purple-500/30 border border-purple-400 text-white' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 border border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-200 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-800/30 dark:hover:to-indigo-800/30 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg'
                }`}
              >
                {/* 背景装饰 */}
                <div className={`absolute inset-0 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  pathname === '/pages-publishment' ? 'opacity-20' : ''
                }`}></div>
                
                {/* 图标容器 */}
                <div className={`relative w-7 h-7 flex items-center justify-center mr-3 rounded-xl ${
                  pathname === '/pages-publishment' 
                    ? 'bg-white/20 backdrop-blur-sm' 
                    : 'bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40'
                }`}>
                  <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 transition-colors ${
                    pathname === '/pages-publishment' 
                      ? 'text-white' 
                      : 'text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300'
                  }`}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                
                {/* 文字内容 */}
                <div className="relative flex-1">
                  <span className={`text-sm font-semibold transition-colors ${
                    pathname === '/pages-publishment' 
                      ? 'text-white' 
                      : 'text-gray-800 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-300'
                  }`}>
                    Pages Publishment
                  </span>
                </div>
                
                {/* 状态指示器 */}
                <div className={`relative w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  pathname === '/pages-publishment' 
                    ? 'bg-white shadow-sm' 
                    : 'bg-purple-400 dark:bg-purple-500 group-hover:scale-125'
                }`}></div>
                
                {/* 悬停时的光效 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12"></div>
              </Link>
            </div>
          )}
          
          {/* 导航项目 */}
          <div className="space-y-2 mb-8">
            {sidebarItems.map((item) => {
              // 根据路径判断是否激活，不管URL参数
              const isActive = pathname.startsWith(item.href);
              
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group relative flex items-center p-3 rounded-2xl transition-all duration-300 overflow-hidden ${
                    isActive 
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-black shadow-xl' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {/* 背景装饰 */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-gray-900/5 to-gray-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isActive ? 'opacity-10' : ''
                  }`}></div>
                  
                  <div className="flex items-center w-full relative">
                    <div className={`w-7 h-7 flex items-center justify-center mr-3 rounded-xl ${
                      isActive 
                        ? 'bg-white/20 dark:bg-black/20' 
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                    }`}>
                      {item.label === 'Alternative Page' ? (
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                          <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" 
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-semibold">
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 分隔线 */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

          {/* 新建聊天按钮和历史记录 */}
          <div className="space-y-4">
            <button
              className="w-full flex items-center justify-center px-5 py-3 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              onClick={handleNewChat}
            >
              <div className="w-5 h-5 flex items-center justify-center mr-2.5 bg-white rounded-full">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm font-semibold">New Chat</span>
            </button>
            
            {/* 历史记录显示 */}
            <div>
              {chatLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Loading...</p>
                </div>
              ) : chatList.length > 0 ? (
                <div className="space-y-4">
                  {/* 日期分组 */}
                  {groupChatsByDate(chatList).map((group) => (
                    <div key={group.date}>
                      {/* 日期标题 */}
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3 px-2">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {group.date}
                      </div>
                      
                      {/* 条目列表 */}
                      <div className="space-y-2">
                        {group.chats.map((chat) => (
                          <div 
                            key={chat.conversationId} 
                            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                            onClick={() => handleRestoreChat(chat)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-gray-800 dark:text-gray-200 break-words font-medium">
                                  {getChatDisplayName(chat)}
                                </div>
                                {chat.generatorIds && chat.generatorIds.length > 0 && (
                                  <div className="flex items-center mt-3">
                                    <span className="inline-block bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 text-xs px-3 py-1 rounded-full font-medium">
                                      {chat.generatorIds.length} Pages Generated
                                    </span>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={(e) => handleDeleteChatClick(e, chat)}
                                disabled={deletingChatId === chat.conversationId}
                                className="ml-3 p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="删除"
                              >
                                {deletingChatId === chat.conversationId ? (
                                  <div className="w-4 h-4">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                  </div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No chats</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start a new conversation</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部控制按钮 */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-5">
          {/* 主题切换 */}
          <div className="flex items-center justify-between">
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setIsDarkMode(false)}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  !isDarkMode 
                    ? 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Light
              </button>
              <button
                onClick={() => setIsDarkMode(true)}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Dark
              </button>
            </div>
            
            {/* 收起按钮 */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export const Sidebar = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SidebarContent />
    </Suspense>
  );
}; 