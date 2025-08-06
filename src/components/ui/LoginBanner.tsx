'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useSubscription';
import LoginModal from '@/Login/login-modal';

export const LoginBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const auth = useAuth();

  // 根据登录状态控制横幅显示
  useEffect(() => {
    setIsVisible(!auth.isLoggedIn);
  }, [auth.isLoggedIn]);

  // 处理关闭横幅
  const handleClose = () => {
    setIsVisible(false);
  };

  // 处理快速开始按钮点击
  const handleQuickStart = () => {
    auth.triggerLogin();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* 底部固定横幅 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-50 via-white to-purple-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 border-t border-gray-200 dark:border-slate-700 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 左侧空间 */}
            <div className="flex-1"></div>
            
            {/* 中间内容区域 */}
            <div className="flex items-center space-x-4">
              {/* 关闭按钮 */}
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                aria-label="Close banner"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* 文本内容 */}
              <span className="text-base text-gray-700 dark:text-gray-300 font-medium">
                Turn competitor searches into customers - start for free.
              </span>

              {/* 右侧按钮 */}
              <button
                onClick={handleQuickStart}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 hover:from-purple-700 hover:to-purple-800 dark:hover:from-purple-600 dark:hover:to-purple-700 rounded-lg text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Quick Start
              </button>
            </div>

            {/* 右侧空间 */}
            <div className="flex-1"></div>
          </div>
        </div>
      </div>

      {/* 登录模态框 */}
      <LoginModal
        showLoginModal={auth.showLoginModal} 
        setShowLoginModal={auth.setShowLoginModal}
        isLoginForm={true}
        setIsLoginForm={() => {}}
        isForgotPassword={false}
        setIsForgotPassword={() => {}}
        onLoginSuccess={(userInfo) => {
          auth.handleLoginSuccess(userInfo);
        }}
        handleGoogleLogin={async () => {}}
        onRegisterSuccess={(userInfo) => {
          auth.handleLoginSuccess(userInfo);
        }}
      />
    </>
  );
}; 