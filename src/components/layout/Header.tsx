'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import AuthManager from '@/Login';
import apiClient from '@/lib/api';
import { message } from '@/components/ui/CustomMessage';

// 导入拆分的组件
import { UserAccountMenu } from '@/components/ui/UserAccountMenu';
import { LogoutConfirmModal } from '@/components/ui/LogoutConfirmModal';
import { GoogleOneTapContainer } from '@/components/ui/GoogleOneTapContainer';
import { HeaderNavigation } from '@/components/layout/HeaderNavigation';
import { HeaderBadges } from '@/components/layout/HeaderBadges';
import { MobileMenu } from '@/components/layout/MobileMenu';

// 导入Hooks
import { useHeaderLogic } from '@/hooks/useHeaderLogic';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

// 样式定义
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  html { scroll-behavior: smooth; }
`;

// 类型定义
interface UserCredits {
  pageGeneratorLimit: number;
  pageGeneratorUsage: number;
}

interface UserData {
  accessToken: string;
  email: string;
  customerId: string;
  [key: string]: any;
}

// 导航配置
const navs = [
  { 
    label: 'The Problem', 
    href: '#the-problem',
    onClick: (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      document.getElementById('the-problem')?.scrollIntoView();
    }
  },
  { 
    label: 'How It Works', 
    href: '#how-it-works',
    onClick: (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      document.getElementById('how-it-works')?.scrollIntoView();
    }
  },
  { 
    label: 'Features', 
    href: '#features',
    onClick: (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      document.getElementById('features')?.scrollIntoView();
    }
  },
  { 
    label: 'Pricing', 
    href: '#pricing',
    onClick: (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      document.getElementById('pricing')?.scrollIntoView();
    }
  },
  { 
    label: 'FAQ', 
    href: '#faq',
    onClick: (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      document.getElementById('faq')?.scrollIntoView();
    }
  },

];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode, userEmail, setUserEmail } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreditsTooltip, setShowCreditsTooltip] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  // 用户状态
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // 初始化时检查localStorage中的登录状态
    if (typeof window !== 'undefined') {
      const storedIsLoggedIn = localStorage.getItem('alternativelyIsLoggedIn');
      const storedEmail = localStorage.getItem('alternativelyCustomerEmail');
      return storedIsLoggedIn === 'true' && !!storedEmail;
    }
    return false;
  });
  const [isOneTapShown, setIsOneTapShown] = useState(false);
  const [removeWatermark, setRemoveWatermark] = useState(false);
  const [taskNotificationEmail, setTaskNotificationEmail] = useState(false);
  const [packageType, setPackageType] = useState(0);
  const [userCredits, setUserCredits] = useState<UserCredits>({
    pageGeneratorLimit: 0,
    pageGeneratorUsage: 0
  });
  const [userCreditsLoading, setUserCreditsLoading] = useState(false);
  const [phImageAvailable, setPhImageAvailable] = useState(false);
  const [phCheckDone, setPhCheckDone] = useState(false);

  // 使用自定义Hooks
  const {
    isMobile,
    isTablet,
    isScrolled,
    getLogoSize,
    shouldShowBadges,
    shouldShowNavigation,
    getBadgeSpacing,
    getSpacing,
    getTextSize,
    getRouteText,
  } = useHeaderLogic();

  const {
    googleLoading,
    loading,
    handleGoogleLogin,
  } = useGoogleAuth({
    isLoggedIn,
    isOneTapShown,
    setIsLoggedIn,
    setUserEmail,
    setIsOneTapShown,
    setShowLoginModal,
  });

  // 域名重定向逻辑
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
      const pathname = window.location.pathname;
        if (pathname === '/' || pathname === '/home') {
          if (hostname.includes('altpage.ai')) {
            window.location.href = '/alternative';
          } else if (hostname.includes('bestpage.ai')) {
            window.location.href = '/bestpage';
          }
        }
      }
  }, []);

  // 同步用户邮箱
  useEffect(() => {
    const syncUserEmail = () => {
      const storedEmail = localStorage.getItem('alternativelyCustomerEmail');
      if (storedEmail) {
        setUserEmail(storedEmail);
      }
    };
    
    // 初始化时同步用户邮箱
    syncUserEmail();
    
    window.addEventListener('alternativelyLoginSuccess', syncUserEmail);
    return () => {
      window.removeEventListener('alternativelyLoginSuccess', syncUserEmail);
    };
  }, [setUserEmail]);

  // 添加token失效事件监听器
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('Header: Token已失效，清除登录状态');
      setIsLoggedIn(false);
      setUserEmail('');
      setShowCreditsTooltip(false);
      message.error('登录已过期，请重新登录');
    };
    
    window.addEventListener('tokenExpired', handleTokenExpired);
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  // URL 参数处理
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const customerId = urlParams.get('customerId');
    const email = urlParams.get('email');
    const isValidJWT = accessToken?.split('.').length === 3;
    
    if (accessToken && isValidJWT && customerId && email) {
      try {
        const decodedEmail = decodeURIComponent(email);
        localStorage.setItem('alternativelyIsLoggedIn', 'true');
        localStorage.setItem('alternativelyAccessToken', accessToken);
        localStorage.setItem('alternativelyCustomerId', customerId);
        localStorage.setItem('alternativelyCustomerEmail', decodedEmail);
        setIsLoggedIn(true);
        setUserEmail(decodedEmail);
        message.success('Login successful!');
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Login process failed:', error);
        message.error('Authentication failed');
      }
    }
  }, [setUserEmail]);

  // Product Hunt 网络检查
  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        await Promise.race([
          fetch('https://httpbin.org/status/200', {
            signal: controller.signal,
            mode: 'no-cors'
          }),
          fetch('https://jsonplaceholder.typicode.com/posts/1', {
            signal: controller.signal,
            mode: 'no-cors'
          })
        ]);
        
        clearTimeout(timeoutId);
        setPhImageAvailable(true);
      } catch (error) {
        setPhImageAvailable(false);
      } finally {
        setPhCheckDone(true);
      }
    };

    checkNetwork();
  }, []);

  // 点击外部关闭弹窗
  useEffect(() => {
    if (!showCreditsTooltip) return;
    const handleClickOutside = (e: Event) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setShowCreditsTooltip(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCreditsTooltip]);

  // 事件处理函数
  const handleAccountClick = () => {
    setShowCreditsTooltip(!showCreditsTooltip);
  };

  const handleToggleWatermark = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (packageType !== 1 && packageType !== 2) return;
    try {
      const newWatermarkStatus = !removeWatermark;
      await apiClient.setWatermark(newWatermarkStatus);
      setRemoveWatermark(newWatermarkStatus);
      message.success(`Watermark ${newWatermarkStatus ? 'hidden' : 'shown'} successfully`);
    } catch (error) {
      message.error('Failed to update watermark setting');
    }
  };

  const handleToggleTaskNotification = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      const newNotificationStatus = !taskNotificationEmail;
      await apiClient.updateNotificationPreferences({
        channel: "email",
        enabled: newNotificationStatus,
        notificationType: "page_task_finished"
      });
      setTaskNotificationEmail(newNotificationStatus);
      message.success(`Task completion email ${newNotificationStatus ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      message.error('Failed to update notification setting');
    }
  };

  const handleLogoutClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
        setShowCreditsTooltip(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('alternativelyAccessToken');
    localStorage.removeItem('alternativelyIsLoggedIn');
    localStorage.removeItem('alternativelyCustomerEmail');
    localStorage.removeItem('alternativelyCustomerId');
    setIsLoggedIn(false);
    setUserEmail('');
    setShowLogoutConfirm(false);
    message.info('Logged out successfully');
    setTimeout(() => window.location.href = '/', 500);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.classList.remove('opacity-0');
    e.currentTarget.classList.add('opacity-100');
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.style.display = 'none';
  };

  const handleMobileMenuItemClick = (item: any) => {
    setIsMenuOpen(false);
    if (item.onClick) {
      item.onClick({ preventDefault: () => {} } as MouseEvent<HTMLAnchorElement>);
    }
  };

  const handleMobileLogoutClick = () => {
    handleLogoutClick({ stopPropagation: () => {} } as React.MouseEvent<HTMLButtonElement>);
    setIsMenuOpen(false);
  };

      return (
    <>
      {/* Google One Tap 容器 */}
      <GoogleOneTapContainer 
        isLoggedIn={isLoggedIn}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* 登出确认弹窗 */}
      <LogoutConfirmModal 
        showLogoutConfirm={showLogoutConfirm}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <header className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-dark-navy border-b border-gray-200 dark:border-dark-border select-none transition-all duration-300 ${
        isScrolled ? 'shadow-md' : ''
      }`}>
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between ${isMobile ? 'min-h-14' : isTablet ? 'min-h-16' : 'min-h-[66px]'}`}>
            {/* Logo区域 */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex-shrink-0 hover:scale-105 transition-transform duration-200 flex items-center">
                <Image 
                  src={isDarkMode ? "/icons/seopage-logo-normal.png" : "/icons/seopage-logo-light.png"}
                  alt="SEOPAGE.AI" 
                  width={getLogoSize().width} 
                  height={getLogoSize().height} 
                  className={getLogoSize().className}
                />
                <span className={`${getSpacing()} ${getTextSize()} text-gray-900 dark:text-white ${isMobile ? 'hidden' : 'inline-block'}`}>
                  {getRouteText()}
                </span>
              </Link>
              
              {/* 评分和奖牌 */}
              <HeaderBadges 
                shouldShowBadges={shouldShowBadges}
                getBadgeSpacing={getBadgeSpacing}
                isDarkMode={isDarkMode}
                isTablet={isTablet}
                phCheckDone={phCheckDone}
                phImageAvailable={phImageAvailable}
                onImageLoad={handleImageLoad}
                onImageError={handleImageError}
              />
            </div>

            {/* 移动端菜单按钮 */}
            <button 
              className={`${shouldShowNavigation() ? 'hidden' : 'block'} p-2 text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-hover rounded-lg transition-colors`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* 桌面端导航和按钮 */}
            <div className={`${shouldShowNavigation() ? 'flex' : 'hidden'} items-center`}>
              <HeaderNavigation 
                shouldShowNavigation={shouldShowNavigation()}
                navs={navs}
              />

              {/* 登录按钮区域 */}
              <div className="flex items-center">
                {userEmail && isLoggedIn ? (
                  <div ref={accountRef}>
                    <UserAccountMenu 
                      userEmail={userEmail}
                      isMobile={isMobile}
                      isTablet={isTablet}
                      showCreditsTooltip={showCreditsTooltip}
                      userCredits={userCredits}
                      packageType={packageType}
                      removeWatermark={removeWatermark}
                      taskNotificationEmail={taskNotificationEmail}
                      userCreditsLoading={userCreditsLoading}
                      onAccountClick={handleAccountClick}
                      onToggleWatermark={handleToggleWatermark}
                      onToggleTaskNotification={handleToggleTaskNotification}
                      onLogoutClick={handleLogoutClick}
                      onCloseTooltip={(e) => {
                                e.stopPropagation();
                                setShowCreditsTooltip(false);
                              }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`dark:border-dark-border dark:text-dark-text-primary dark:hover:bg-dark-hover ${isMobile ? 'min-w-[70px] h-8 text-xs' : 'min-w-[90px] h-9 text-[15px]'}`}
                      onClick={() => setShowLoginModal(true)}
                    >
                      Sign In
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`flex items-center space-x-2 dark:border-dark-border dark:text-dark-text-primary dark:hover:bg-dark-hover whitespace-nowrap ${isMobile ? 'h-8 text-xs px-2 min-w-[120px]' : 'h-9 text-[15px] px-4 min-w-[160px]'}`}
                      onClick={handleGoogleLogin}
                      disabled={googleLoading || loading}
                    >
                      {googleLoading || loading ? (
                        <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      )}
                      <span>{isMobile ? 'Google' : 'Sign in with Google'}</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 移动端菜单 */}
          <MobileMenu 
            isMenuOpen={isMenuOpen}
            shouldShowNavigation={shouldShowNavigation}
            navs={navs}
            userEmail={userEmail}
            isLoggedIn={isLoggedIn}
            isMobile={isMobile}
            googleLoading={googleLoading}
            loading={loading}
            onMenuItemClick={handleMobileMenuItemClick}
            onLoginClick={() => {
                        setShowLoginModal(true);
                        setIsMenuOpen(false);
                      }}
            onGoogleLoginClick={() => {
                        handleGoogleLogin();
                        setIsMenuOpen(false);
                      }}
            onLogoutClick={handleMobileLogoutClick}
          />
        </div>
    </header>
      
      {/* 占位元素 */}
      <div className={`${isMobile ? 'h-14' : isTablet ? 'h-16' : 'h-[66px]'}`}></div>
      
      <AuthManager showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} />
      
      <style>{animationStyles}</style>
    </> 
  );
};

