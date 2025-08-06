'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import PagesPublishmentComplete from '@/app/pages-publishment/PagesPublishmentComplete';

export default function PagesPublishmentPage() {
  const { userEmail, setUserEmail } = useApp();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 检查用户登录状态
  useEffect(() => {
    const checkAuthStatus = () => {
      // 检查 localStorage 中的登录状态
      const accessToken = localStorage.getItem('alternativelyAccessToken');
      const customerEmail = localStorage.getItem('alternativelyCustomerEmail');
      
      if (accessToken && customerEmail) {
        setIsAuthenticated(true);
        // 确保 AppContext 中的 userEmail 状态也同步更新
        if (!userEmail) {
          setUserEmail(customerEmail);
        }
      } else {
        // 如果没有登录状态，重定向到首页
        router.push('/');
      }
      setIsCheckingAuth(false);
    };

    // 立即检查认证状态，不需要延迟
    checkAuthStatus();
  }, [router, userEmail, setUserEmail]);

  // 如果正在检查认证状态，显示一个简单的加载状态
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#f5f7ff] dark:bg-dark-navy flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // 如果未认证，不显示任何内容（正在重定向）
  if (!isAuthenticated) {
    return null;
  }

  return <PagesPublishmentComplete />;
} 