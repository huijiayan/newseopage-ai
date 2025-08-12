'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '@/lib/api';
import { message } from '@/components/ui/CustomMessage';

interface GoogleOneTapResponse {
  credential: string;
  [key: string]: any;
}

interface UserData {
  accessToken: string;
  email: string;
  customerId: string;
  [key: string]: any;
}

interface UseGoogleAuthProps {
  isLoggedIn: boolean;
  isOneTapShown: boolean;
  setIsLoggedIn: (value: boolean) => void;
  setUserEmail: (email: string) => void;
  setIsOneTapShown: (value: boolean) => void;
  setShowLoginModal: (value: boolean) => void;
}

interface UseGoogleAuthReturn {
  googleLoading: boolean;
  loading: boolean;
  handleGoogleLogin: () => Promise<void>;
  handleGoogleOneTapSuccess: (response: GoogleOneTapResponse) => Promise<void>;
}

declare global {
  interface Window {
    google?: any;
    dataLayer?: any[];
  }
}

export const useGoogleAuth = ({
  isLoggedIn,
  isOneTapShown,
  setIsLoggedIn,
  setUserEmail,
  setIsOneTapShown,
  setShowLoginModal,
}: UseGoogleAuthProps): UseGoogleAuthReturn => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const isLoggedInRef = useRef<boolean>(isLoggedIn);
  
  useEffect(() => {
    isLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn]);

  // 获取当前数据源
  const getCurrentSource = () => {
    if (typeof window === 'undefined') return 'alternatively';
    
    const hostname = window.location.hostname;
    
    if (hostname.includes('bestpage.ai')) {
      return 'best';
    }
    if (hostname.includes('seopage.ai')) {
      return 'seopage';
    }
    return 'alternatively';
  };

  // 谷歌登录方法
  const handleGoogleLogin = async (): Promise<void> => {
    let invitationCode: string | null = null;
    try {
      invitationCode = localStorage.getItem('invitationCode');
    } catch (e) {
      invitationCode = null;
    }
    try {
      setGoogleLoading(true);
      setLoading(true);
      const source = getCurrentSource();
      const response = await apiClient.googleLogin(invitationCode, source);
      if (response && response.data) {
        try {
          localStorage.removeItem('invitationCode');
        } catch (e) {}
        if (response.data.firstLogin) {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            'event': 'custom_event_signup_success',
            'registration_method': 'google',
            'user_id': response.data.customerId,
          });
        }
        window.location.href = response.data;
      } else {
        message.error('Google login request failed, please try again later');
      }
    } catch (error) {
      console.error('Google login failed:', error);
      message.error('Google login request failed, please try again later');
    } finally {
      setGoogleLoading(false);
      setLoading(false);
    }
  };

  // Google One Tap 回调
  const handleGoogleOneTapSuccess = useCallback(async (response: GoogleOneTapResponse): Promise<void> => {
    try {
      message.info('Authenticating...');
      const res = await apiClient.googleOneTapLogin(response.credential);
      localStorage.setItem('alternativelyAccessToken', res.accessToken);
      localStorage.setItem('alternativelyIsLoggedIn', 'true');
      localStorage.setItem('alternativelyCustomerEmail', res.data.email);
      localStorage.setItem('alternativelyCustomerId', res.data.customerId);
      if (res.data.firstLogin) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          'event': 'custom_event_signup_success',
          'registration_method': 'google_one_tap',
          'user_id': res.data.customerId,
        });
      }
      setIsLoggedIn(true);
      setUserEmail(res.email);
      message.success('Login successful!');
      setShowLoginModal(false);
      window.dispatchEvent(new CustomEvent('alternativelyLoginSuccess'));
    } catch (error: any) {
      console.error('Google One Tap login failed:', error);
      message.error(error.response?.data?.error || 'Authentication failed');
    }
  }, [setIsLoggedIn, setUserEmail, setShowLoginModal]);

  // Google One Tap 初始化
  useEffect(() => {
    let googleScript: HTMLScriptElement | null = null;
    let initializationTimeout: NodeJS.Timeout | null = null;

    const initializeOneTap = () => {
      if (!window.google || isLoggedInRef.current || isOneTapShown) {
        return;
      }

      try {
        // 确保 Google API 完全加载
        if (!window.google.accounts?.id) {
          console.warn('Google Accounts API not fully loaded');
          return;
        }

        // 添加环境检查
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
          console.warn('Google Client ID not configured');
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleOneTapSuccess,
          cancel_on_tap_outside: false,
          prompt_parent_id: "google-one-tap-button",
          // 添加额外配置以避免 FedCM 冲突
          auto_select: false,
          use_fedcm_for_prompt: false
        });

        // 延迟调用 prompt 避免竞态条件
        initializationTimeout = setTimeout(() => {
          if (!isLoggedInRef.current && window.google?.accounts?.id) {
            window.google.accounts.id.prompt((notification: any) => {
              if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                setIsOneTapShown(true);
              }
            });
          }
        }, 100);
      } catch (error) {
        console.error('Google One Tap initialization error:', error);
        setIsOneTapShown(true); // 标记为已显示，避免重复尝试
      }
    };

    const loadGoogleScript = () => {
      if (isLoggedInRef.current) {
        return;
      }
      if (!document.querySelector('#google-one-tap-script')) {
        googleScript = document.createElement('script');
        googleScript.id = 'google-one-tap-script';
        googleScript.src = 'https://accounts.google.com/gsi/client';
        googleScript.async = true;
        googleScript.defer = true;
        googleScript.onload = () => {
          if (!isLoggedInRef.current) {
            initializeOneTap();
          }
        };
        document.head.appendChild(googleScript);
      } else {
        initializeOneTap();
      }
    };

    if (!isLoggedInRef.current) {
      loadGoogleScript();
    }

    return () => {
      // 清理定时器
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
      }
      
      // 移除脚本
      if (googleScript) {
        googleScript.remove();
      }
      
      // 取消Google One Tap
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.cancel();
        } catch (error) {
          console.warn('Error canceling Google One Tap:', error);
        }
      }
    };
  }, [isLoggedIn, isOneTapShown, handleGoogleOneTapSuccess, setIsOneTapShown]);

  return {
    googleLoading,
    loading,
    handleGoogleLogin,
    handleGoogleOneTapSuccess,
  };
}; 