'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/index';
import ClientWrapper from '@/components/layout/ClientWrapper';
import { PagesPublishmentSteps } from './PagesPublishmentSteps';
import { GeneratedPagesSection } from './GeneratedPagesSection';

// 类型定义
interface GeneratedPage {
  resultId: string;
  deploymentStatus: 'published' | 'draft';
  siteUrl: string;
  slug: string;
  taskWebsite: string;
  createdAt?: string;
}

interface SelectedPage {
  resultId: string;
  deploymentStatus: 'published' | 'draft';
  siteUrl: string;
  slug: string;
  taskWebsite: string;
}

interface FaviconStatus {
  isUploaded: boolean;
  url: string | null;
  loading: boolean;
  file: File | null;
  previewUrl: string | null;
}

interface GscStatus {
  isConnected: boolean;
  sites: any[];
  loading: boolean;
}

// 模拟组件
const PublishPage = ({ resultId, deploymentStatus, siteUrl, slug, taskWebsite, onSuccess }: {
  resultId: string;
  deploymentStatus: string;
  siteUrl: string;
  slug: string;
  taskWebsite: string;
  onSuccess: () => void;
}) => {
  return <div>Publish Page Component</div>;
};



// 主题配置
const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // 检查系统主题偏好
    const checkTheme = () => {
      const isDarkMode = typeof window !== 'undefined' && 
        (window.matchMedia('(prefers-color-scheme: dark)').matches || 
         document.documentElement.classList.contains('dark'));
      
      setCurrentTheme(isDarkMode ? 'dark' : 'light');
    };

    // 初始检查
    checkTheme();

    // 监听主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);

    // 监听 DOM 变化（手动切换主题）
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      mediaQuery.removeEventListener('change', checkTheme);
      observer.disconnect();
    };
  }, []);
  
  return {
    currentTheme,
    getThemeConfig: (section: string) => ({
      loadingText: 'text-gray-600 dark:text-gray-300',
      contentSections: {
        cardTitle: 'text-gray-900 dark:text-white',
        cardDescription: 'text-gray-600 dark:text-gray-300'
      }
    })
  };
};

/**
 * Pages Publishment 完整页面组件
 * 整合了所有发布管理功能：域名验证、Favicon上传、GSC连接、页面发布
 */
function PagesPublishmentComplete() {
  const { currentTheme, getThemeConfig } = useTheme();
  const pageTheme = getThemeConfig('pages');
  const router = useRouter();

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);
  const [isResultPreviewVisible, setIsResultPreviewVisible] = useState(false);
  const [isPublishPageModalVisible, setIsPublishPageModalVisible] = useState(false);
  const [selectedPage, setSelectedPage] = useState<SelectedPage | null>(null);
  const [generatedPages, setGeneratedPages] = useState<GeneratedPage[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [message, setMessage] = useState('');

  // GSC状态管理
  const [gscStatus, setGscStatus] = useState<GscStatus>({
    isConnected: false,
    sites: [],
    loading: false
  });

  // Favicon状态管理
  const [faviconStatus, setFaviconStatus] = useState<FaviconStatus>({
    isUploaded: false,
    url: null,
    loading: false,
    file: null,
    previewUrl: null
  });

  // 主题样式配置
  const getThemeStyles = () => {
    if (currentTheme === 'dark') {
      return {
        // 主容器背景
        mainBackground: 'bg-[#0D1117]',
        contentBackground: 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#0A1122] to-[#0D1729]',

        // 顶部统计区域
        topStatsBackground: 'bg-gradient-to-b from-[#111827]/80 via-[#111827]/70 to-[#111827]/60',
        topStatsBorder: 'border-indigo-900/40',
        topStatsShadow: 'shadow-lg shadow-indigo-900/20',
        titleBorder: 'border-indigo-800/20',

        // 标题和文字
        mainTitle: 'bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white',
        subtitle: 'text-blue-300',

        // Launch Preparation 区域
        launchPrepBackground: 'bg-gradient-to-br from-[#1E293B]/90 to-[#111827]/80',
        launchPrepBorder: 'border-indigo-900/40',
        launchPrepTitle: 'bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200',
        launchPrepSubtitle: 'text-blue-300/90',

        // Todo 项目
        todoCompleted: {
          border: 'border-emerald-800/50',
          background: 'bg-gradient-to-r from-emerald-900/30 to-emerald-800/10',
          text: 'text-emerald-200',
          description: 'text-emerald-300/90'
        },
        todoIncomplete: {
          border: 'border-red-900/40',
          background: 'bg-gradient-to-r from-[#1E293B]/80 to-[#111827]/60',
          text: 'text-red-100',
          description: 'text-red-300/90',
          badge: 'bg-red-900/40 text-red-200'
        },

        // Generated Pages 区域
        generatedPagesBackground: 'bg-gradient-to-br from-[#1E293B]/90 to-[#111827]/80',
        generatedPagesBorder: 'border-purple-900/40',
        generatedPagesTitle: 'bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200',
        generatedPagesSubtitle: 'text-purple-300/90',

        // 页面卡片
        pageCard: {
          background: 'bg-gradient-to-br from-slate-800/90 to-slate-900/80',
          border: 'border-slate-700/40 hover:border-slate-600/60',
          shadow: 'shadow-md hover:shadow-lg',
          title: 'text-white',
          metadata: 'text-slate-400',
          wireframeElements: 'bg-slate-700',
          wireframeElementsAlt: 'bg-slate-700/80',
          wireframeElementsLight: 'bg-slate-700/60',
          previewHint: 'bg-slate-900/60 text-slate-300',
          previewLoading: 'bg-slate-900/70'
        },

        // 按钮 - 统一深色主题配色
        primaryButton: 'bg-blue-600 hover:bg-blue-500 text-white border-0',
        secondaryButton: 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-0',
        dangerButton: 'bg-red-700/80 hover:bg-red-600/90 text-red-200 border-0',
        
        // 保持兼容性的旧样式
        publishButton: 'bg-blue-600 hover:bg-blue-500 text-white border-0',
        unpublishButton: 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-0',
        previewButton: 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-0',
        createPagesButton: 'bg-gradient-to-r from-slate-700 to-slate-800 border-slate-600 text-slate-300',

        // 状态指示器
        statusLive: 'bg-green-900/40 text-green-300',
        statusDraft: 'bg-orange-900/40 text-orange-300',

        // 链接
        linkText: 'text-blue-400 hover:underline',

        // 网站分组
        siteGroupIcon: 'text-blue-400',
        siteGroupTitle: 'text-blue-200',
        siteGroupBadge: 'text-slate-400 bg-slate-800'
      };
    } else {
      return {
        // 主容器背景
        mainBackground: 'bg-white',
        contentBackground: 'bg-gradient-to-b from-gray-50 via-white to-gray-50',

        // 顶部统计区域
        topStatsBackground: 'bg-gradient-to-b from-white/90 via-gray-50/80 to-white/70',
        topStatsBorder: 'border-gray-200/60',
        topStatsShadow: 'shadow-lg shadow-gray-200/30',
        titleBorder: 'border-gray-200/40',

        // 标题和文字
        mainTitle: 'bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-600 to-gray-800',
        subtitle: 'text-blue-600',

        // Launch Preparation 区域
        launchPrepBackground: 'bg-gradient-to-br from-white/90 to-gray-50/80',
        launchPrepBorder: 'border-blue-200/60',
        launchPrepTitle: 'bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600',
        launchPrepSubtitle: 'text-gray-600 dark:text-gray-300',

        // Todo 项目
        todoCompleted: {
          border: 'border-emerald-200 dark:border-emerald-700',
          background: 'bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20',
          text: 'text-emerald-700 dark:text-emerald-300',
          description: 'text-emerald-600 dark:text-emerald-400'
        },
        todoIncomplete: {
          border: 'border-red-200 dark:border-red-700',
          background: 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20',
          text: 'text-red-700 dark:text-red-300',
          description: 'text-red-600 dark:text-red-400',
          badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
        },

        // Generated Pages 区域
        generatedPagesBackground: 'bg-gradient-to-br from-white/90 to-gray-50/80',
        generatedPagesBorder: 'border-purple-200/60',
        generatedPagesTitle: 'bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600',
        generatedPagesSubtitle: 'text-gray-600 dark:text-gray-300',

        // 页面卡片
        pageCard: {
          background: 'bg-white dark:bg-slate-800',
          border: 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
          shadow: 'shadow-md hover:shadow-lg',
          title: 'text-gray-900 dark:text-white',
          metadata: 'text-gray-500 dark:text-gray-400',
          wireframeElements: 'bg-gray-100 dark:bg-slate-700',
          wireframeElementsAlt: 'bg-gray-50 dark:bg-slate-700/80',
          wireframeElementsLight: 'bg-gray-50/80 dark:bg-slate-700/60',
          previewHint: 'bg-gray-900/60 text-white dark:bg-slate-900/80 dark:text-slate-200',
          previewLoading: 'bg-gray-900/70 dark:bg-slate-900/90'
        },

        // 按钮 - 统一浅色主题配色
        primaryButton: 'bg-blue-600 hover:bg-blue-500 text-white border-0',
        secondaryButton: 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 border-0',
        dangerButton: 'bg-red-600 hover:bg-red-500 text-white border-0',
        
        // 保持兼容性的旧样式
        publishButton: 'bg-blue-600 hover:bg-blue-500 text-white border-0',
        unpublishButton: 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 border-0',
        previewButton: 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 border-0',
        createPagesButton: 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500 text-white',

        // 状态指示器
        statusLive: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
        statusDraft: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',

        // 链接
        linkText: 'text-blue-600 hover:underline dark:text-blue-400',

        // 网站分组
        siteGroupIcon: 'text-blue-600 dark:text-blue-400',
        siteGroupTitle: 'text-gray-900 dark:text-white',
        siteGroupBadge: 'text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'
      };
    }
  };

  const themeStyles = getThemeStyles();

  // 显示消息
  const showMessage = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // 加载生成的页面
  const loadGeneratedPages = async () => {
    try {
      setPagesLoading(true);
      const customerId = localStorage.getItem('alternativelyCustomerId');
      if (!customerId) {
        setPagesLoading(false);
        return;
      }

      // 使用customerId作为websiteId，或者从其他地方获取websiteId
      const websiteId = customerId; // 这里可能需要根据实际情况调整
      const response = await apiClient.getAlternativeWebsiteResultList(websiteId);
      if (response && response.code === 200) {
        setGeneratedPages(response.data || []);
      } else {
        console.error('Failed to load generated pages:', response);
        showMessage('Failed to load generated pages. Please try again.', 'error');
      }
    } catch (error: any) {
      console.error('Error loading generated pages:', error);
      showMessage('Failed to load generated pages. Please try again.', 'error');
    } finally {
      setPagesLoading(false);
    }
  };

  // 域名检查处理
  const handleDomainCheck = async () => {
    try {
      const customerId = localStorage.getItem('alternativelyCustomerId');
      if (!customerId) {
        showMessage('Please login first', 'error');
        return;
      }

      // 获取当前域名设置
      const domainResponse = await apiClient.getDomain(customerId);
      setSelectedPage({
        resultId: 'domain-settings',
        deploymentStatus: domainResponse.data?.verifiedStatus === 'SUCCESS' ? 'published' : 'draft',
        siteUrl: domainResponse.data?.domainName || '',
        slug: '',
        taskWebsite: 'Domain Configuration'
      });
      setIsPublishPageModalVisible(true);
    } catch (error: any) {
      console.error('Failed to load domain settings:', error);
      showMessage('Failed to load domain settings', 'error');
    }
  };

  // GSC连接处理
  const handleGscConnect = async () => {
    try {
      const customerId = localStorage.getItem('alternativelyCustomerId');
      if (!customerId) {
        showMessage('Please login first', 'error');
        return;
      }

      const response = await apiClient.gscAuth(customerId);
      if (response?.code === 200 && response.redirectURL) {
        window.location.href = response.redirectURL;
      } else {
        showMessage(response?.message || 'Failed to connect to Google', 'error');
      }
    } catch (error: any) {
      showMessage(error.message, 'error');
    }
  };

  // GSC断开连接处理
  const handleGscDisconnect = async () => {
    try {
      const customerId = localStorage.getItem('alternativelyCustomerId');
      if (!customerId) {
        showMessage('Please login first', 'error');
        return;
      }

      console.log('Attempting disconnect for customer:', customerId);

      const response = await apiClient.cancelGscAuth();
      console.log('Disconnect response:', response);

      setGscStatus(prev => ({
        ...prev,
        isConnected: false,
        sites: [],
        loading: false
      }));

      showMessage('Disconnected successfully!', 'success');
    } catch (error: any) {
      console.error('Disconnect error:', error);
      showMessage(error.response?.data?.message || error.message || 'Disconnect failed', 'error');
    }
  };

  // Favicon预览处理
  const handleFaviconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFaviconStatus(prev => ({
        ...prev,
        previewUrl,
        file
      }));
    }
  };

  // Favicon上传处理
  const handleFaviconUpload = async () => {
    if (!faviconStatus.file) {
      showMessage('Please select a favicon image first', 'warning');
      return;
    }

    try {
      setFaviconStatus(prev => ({ ...prev, loading: true }));
      showMessage('Uploading favicon...', 'success');

      const response = await apiClient.uploadFavicon(faviconStatus.file);

      if (response && response.code === 200) {
        showMessage('Favicon uploaded successfully', 'success');

        setFaviconStatus({
          isUploaded: true,
          url: response.data?.url || faviconStatus.previewUrl,
          previewUrl: null,
          loading: false,
          file: null
        });
      } else {
        showMessage(response?.message || 'Failed to upload favicon', 'error');
        setFaviconStatus(prev => ({ ...prev, loading: false }));
      }
    } catch (error: any) {
      console.error('Favicon upload error:', error);
      showMessage(error.message || 'Failed to upload favicon', 'error');
      setFaviconStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // 检查Favicon状态
  useEffect(() => {
    const checkFaviconStatus = async () => {
      try {
        const customerId = localStorage.getItem('alternativelyCustomerId');
        if (!customerId) return;

        const customerInfo = await apiClient.getCustomerInfo();
        if (customerInfo?.code === 200 && customerInfo.data?.faviconUrl) {
          setFaviconStatus(prev => ({
            ...prev,
            isUploaded: true,
            url: customerInfo.data.faviconUrl,
            loading: false,
            file: null
          }));
        }
      } catch (error: any) {
        console.error('Failed to check favicon status:', error);
      }
    };

    checkFaviconStatus();
  }, []);

  // 检查GSC状态
  useEffect(() => {
    const checkGscStatus = async () => {
      try {
        const customerId = localStorage.getItem('alternativelyCustomerId');
        if (!customerId) return;

        setGscStatus(prev => ({ ...prev, loading: true }));
        const response = await apiClient.checkGscAuth(customerId);
        setGscStatus({
          isConnected: response?.code === 200,
          sites: response?.data?.sites || [],
          loading: false
        });
      } catch (error: any) {
        console.error('Failed to check GSC status:', error);
        setGscStatus(prev => ({ ...prev, loading: false }));
      }
    };

    checkGscStatus();
  }, []);

  // 初始化
  useEffect(() => {
    const initialize = async () => {
      try {
        const customerId = localStorage.getItem('alternativelyCustomerId');
        if (!customerId) {
          router.push('/');
          return;
        }

        setCurrentCustomerId(customerId);
        // 异步加载页面数据，但不阻塞页面显示
        loadGeneratedPages().catch(error => {
          console.error('Failed to load generated pages:', error);
        });
      } catch (error: any) {
        console.error('Initialization error:', error);
      }
    };

    initialize();
  }, [router]);

  return (
    <>
      <ClientWrapper>
        <div className={`min-h-screen ${themeStyles.mainBackground}`}>
          {/* Main Content */}
          <div className={`flex-1 ${themeStyles.contentBackground} min-h-screen`}>
            {/* Top Stats Section */}
            <div className={`${themeStyles.topStatsBackground} ${themeStyles.topStatsBorder} ${themeStyles.topStatsShadow}`}>
              <div className="max-w-7xl mx-auto px-4">
                <div className={`py-5 border-b ${themeStyles.titleBorder}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-blue-600 via-blue-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-xl shadow-blue-600/20">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <h1 className={`text-2xl font-bold ${themeStyles.mainTitle} tracking-wide`}>
                          To get your pages online!
                        </h1>
                        <p className={`text-xs ${themeStyles.subtitle} mt-1`}>
                          Unlock your website's traffic potential
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Section */}
            <div className="max-w-7xl mx-auto p-6 pt-8 min-h-[calc(100vh-300px)]">
              <div className="space-y-8 pb-16">
                 {/* 页面发布步骤组件 */}
                 <PagesPublishmentSteps
                   themeStyles={themeStyles}
                   faviconStatus={faviconStatus}
                   gscStatus={gscStatus}
                   onDomainCheck={handleDomainCheck}
                   onFaviconChange={handleFaviconChange}
                   onFaviconUpload={handleFaviconUpload}
                   onGscConnect={handleGscConnect}
                   onGscDisconnect={handleGscDisconnect}
                 />

                 {/* 生成的页面展示组件 */}
                 <GeneratedPagesSection
                   themeStyles={themeStyles}
                   pageTheme={pageTheme}
                   generatedPages={generatedPages}
                   pagesLoading={pagesLoading}
                 />
              </div>
            </div>
          </div>
        </div>
      </ClientWrapper>

      {/* Message Display */}
      {message && (
        <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-4 py-2 text-gray-900 dark:text-white">
          {message}
        </div>
      )}

      {/* Modals */}
      {isPublishPageModalVisible && selectedPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Domain Settings</h3>
              <button
                onClick={() => setIsPublishPageModalVisible(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PublishPage
              resultId={selectedPage.resultId}
              deploymentStatus={selectedPage.deploymentStatus}
              siteUrl={selectedPage.siteUrl}
              slug={selectedPage.slug}
              taskWebsite={selectedPage.taskWebsite}
              onSuccess={() => {
                setIsPublishPageModalVisible(false);
                loadGeneratedPages();
              }}
            />
          </div>
        </div>
      )}

    </>
  );
}

// 辅助函数
function getLayoutData() {
  return {
    pageHeaders: {
      "actionItems": [
        {
          "backgroundColor": "#3B82F6",
          "href": "#get-started",
          "isExternal": false,
          "label": "Start Blueprinting",
          "textColor": "#FFFFFF",
          "variant": "button"
        }
      ],
      "logo": {
        "src": "/images/blueprint-logo.png",
        "width": 160
      },
      "mainMenuItems": [
        { "label": "Features", "link": "#features" },
        { "label": "Use Cases", "link": "#use-cases" },
        { "label": "Pricing", "link": "#pricing" }
      ]
    },
    pageFooters: {
      "companyName": "Blueprint Engine",
      "sections": [
        {
          "links": [
            { "label": "Features", "url": "#features" },
            { "label": "Documentation", "url": "#docs" }
          ],
          "title": "Resources"
        }
      ]
    }
  };
}

export default PagesPublishmentComplete; 