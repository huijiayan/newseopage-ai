// @jsxImportSource react
import React, { useEffect, useState, useCallback, useRef } from 'react';
import apiClient from '../lib/api';
import { message } from '@/components/ui/CustomMessage';
import LoginModal from './login-modal';
import { useApp } from '@/context/AppContext';

// 扩展window类型声明
declare global {
  interface Window {
    dataLayer?: any[];
    google?: any;
  }
}

interface AuthManagerProps {
  showLoginModal?: boolean;
  setShowLoginModal?: (show: boolean) => void;
}

export default function AuthManager(props: AuthManagerProps) {
  // 直接用message，不用useMessage
  // const [messageApi, contextHolder]: [MessageInstance, React.ReactNode] = message.useMessage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [internalShowLoginModal, setInternalShowLoginModal] = useState(false);
  const showLoginModal = props.showLoginModal !== undefined ? props.showLoginModal : internalShowLoginModal;
  const setShowLoginModal = props.setShowLoginModal || setInternalShowLoginModal;
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isOneTapShown, setIsOneTapShown] = useState(false);
  const isLoggedInRef = useRef(isLoggedIn);
  const { setUserEmail: setAppUserEmail } = useApp();

  useEffect(() => {
    isLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn]);

  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem('alternativelyIsLoggedIn');
    const storedEmail = localStorage.getItem('alternativelyCustomerEmail');
    if (storedIsLoggedIn === 'true' && storedEmail) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
      setAppUserEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const customerId = urlParams.get('customerId');
    const email = urlParams.get('email');
    const isValidJWT = accessToken?.split('.').length === 3;
    if (accessToken && isValidJWT && customerId && email) {
      try {
        localStorage.removeItem('alternativelyAccessToken');
        localStorage.removeItem('alternativelyIsLoggedIn');
        localStorage.removeItem('alternativelyCustomerId');
        localStorage.removeItem('alternativelyCustomerEmail');
        const decodedEmail = decodeURIComponent(email);
        localStorage.setItem('alternativelyIsLoggedIn', 'true');
        localStorage.setItem('alternativelyAccessToken', accessToken);
        localStorage.setItem('alternativelyCustomerId', customerId);
        localStorage.setItem('alternativelyCustomerEmail', decodedEmail);
        setIsLoggedIn(true);
        setUserEmail(decodedEmail);
        setAppUserEmail(decodedEmail);
        message.success('Login successful!');
        window.history.replaceState({}, document.title, window.location.pathname);
        const loginSuccessEvent = new CustomEvent('alternativelyLoginSuccess');
        window.dispatchEvent(loginSuccessEvent);
        
        // 登录成功后刷新页面
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('Login process failed:', error);
        message.error('Authentication failed');
        localStorage.removeItem('alternativelyAccessToken');
        localStorage.removeItem('alternativelyIsLoggedIn');
        localStorage.removeItem('alternativelyCustomerId');
        localStorage.removeItem('alternativelyCustomerEmail');
      }
    }
  }, []);

  const getCurrentSource = () => {
    if (typeof window === 'undefined') return 'alternatively';
    const hostname = window.location.hostname;
    if (hostname.includes('bestpage.ai')) return 'best';
    if (hostname.includes('seopage.ai')) return 'seopage';
    return 'alternatively';
  };


  const handleGoogleLogin = async () => {
    console.log('handleGoogleLogin called');
    let invitationCode = null;
    try {
      invitationCode = localStorage.getItem('invitationCode');
    } catch (e) {
      invitationCode = null;
    }
    try {
      setLoading(true);
      const source = getCurrentSource();
      console.log('before apiClient.googleLogin');
      const response = await apiClient.googleLogin(invitationCode, source);
      console.log('googleLogin response', response);
      if (response && response.data) {
        try { localStorage.removeItem('invitationCode'); } catch (e) {}
        if (response.data.firstLogin) {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            'event': 'custom_event_signup_success',
            'registration_method': 'google',
            'user_id': response.data.customerId,
          });
        }
        
        // Google登录API返回的是重定向URL，不是用户信息
        // 我们需要等待用户完成OAuth流程后再获取用户信息
        // 这里先不设置登录状态，等待OAuth回调完成
        
        console.log('Google OAuth URL:', response.data);
        // Google登录需要重定向到OAuth页面
        // 用户完成OAuth后会回到我们的回调URL
        if (response.data && typeof response.data === 'string' && response.data.startsWith('http')) {
          window.location.href = response.data;
        } else {
          message.error('Invalid OAuth URL received');
        }
      } else {
        message.error('Google login request failed, please try again later');
      }
    } catch (error) {
      console.error('Google login failed:', error);
      message.error('Google login request failed, please try again later');
    } finally {
      setLoading(false);
    }
  };


  
  const handleLoginSuccess = (userData: any) => {
    localStorage.setItem('alternativelyAccessToken', userData.accessToken);
    localStorage.setItem('alternativelyIsLoggedIn', 'true');
    localStorage.setItem('alternativelyCustomerEmail', userData.email);
    localStorage.setItem('alternativelyCustomerId', userData.customerId);
    setIsLoggedIn(true);
    setUserEmail(userData.email);
    setAppUserEmail(userData.email);
    message.success('Login successful!');
    setShowLoginModal(false);
    window.dispatchEvent(new Event('alternativelyLoginSuccess'));
    
    // 登录成功后刷新页面
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleRegisterSuccess = (userData: any) => {
    localStorage.setItem('alternativelyAccessToken', userData.accessToken);
    localStorage.setItem('alternativelyIsLoggedIn', 'true');
    localStorage.setItem('alternativelyCustomerEmail', userData.email);
    localStorage.setItem('alternativelyCustomerId', userData.customerId);
    setIsLoggedIn(true);
    setUserEmail(userData.email);
    setAppUserEmail(userData.email);
    message.success('Registration successful!');
    setShowLoginModal(false);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'custom_event_signup_success',
      'registration_method': 'email',
      'user_id': userData.customerId,
    });
    window.dispatchEvent(new Event('alternativelyLoginSuccess'));
    
    // 注册成功后刷新页面
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  useEffect(() => {
    const handleShowLoginModal = () => {
      if (!showLoginModal) {
        setShowLoginModal(true);
        setIsLoginForm(true);
      }
    };
    window.addEventListener('showAlternativelyLoginModal', handleShowLoginModal);
    return () => {
      window.removeEventListener('showAlternativelyLoginModal', handleShowLoginModal);
    };
  }, [setIsLoginForm, showLoginModal]);

  useEffect(() => {
    const handleLoginSuccess = () => {
      const storedIsLoggedIn = localStorage.getItem('alternativelyIsLoggedIn');
      const storedEmail = localStorage.getItem('alternativelyCustomerEmail');
      if (storedIsLoggedIn === 'true' && storedEmail) {
        setIsLoggedIn(true);
        setUserEmail(storedEmail);
        setAppUserEmail(storedEmail);
      }
    };
    window.addEventListener('alternativelyLoginSuccess', handleLoginSuccess);
    return () => {
      window.removeEventListener('alternativelyLoginSuccess', handleLoginSuccess);
    };
  }, []);

  // 添加token失效事件监听器
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('Token已失效，清除登录状态');
      setIsLoggedIn(false);
      setUserEmail('');
      setAppUserEmail('');
      message.error('登录已过期，请重新登录');
      // 可以选择自动显示登录弹窗
      setShowLoginModal(true);
    };
    
    window.addEventListener('tokenExpired', handleTokenExpired);
    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, [setShowLoginModal]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const invitation = urlParams.get('invitation');
      const showGoogleLogin = urlParams.get('showGoogleLogin');
      const showLoginModalParam = urlParams.get('showLoginModal');
      const storedIsLoggedIn = localStorage.getItem('alternativelyIsLoggedIn') === 'true';
      if (invitation) {
        try { localStorage.setItem('invitationCode', invitation); } catch (e) {}
        urlParams.delete('invitation');
        const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '') + window.location.hash;
        window.history.replaceState({}, '', newUrl);
      }
      if (showGoogleLogin === 'true' && !storedIsLoggedIn) {
        urlParams.delete('showGoogleLogin');
        const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '') + window.location.hash;
        window.history.replaceState({}, '', newUrl);
        setTimeout(() => { handleGoogleLogin(); }, 500);
      }
      if (showLoginModalParam === 'true' && !storedIsLoggedIn) {
        urlParams.delete('showLoginModal');
        const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '') + window.location.hash;
        window.history.replaceState({}, '', newUrl);
        setTimeout(() => {
          setShowLoginModal(true);
          setIsLoginForm(true);
        }, 500);
      }
    }
  }, [handleGoogleLogin, setShowLoginModal, setIsLoginForm]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };
  const confirmLogout = () => {
    localStorage.removeItem('alternativelyAccessToken');
    localStorage.removeItem('alternativelyIsLoggedIn');
    localStorage.removeItem('alternativelyCustomerEmail');
    localStorage.removeItem('alternativelyCustomerId');
    setIsLoggedIn(false);
    setUserEmail('');
    message.info('Logged out successfully');
    setShowLogoutConfirm(false);
    setTimeout(() => { window.location.href = '/'; }, 500);
  };
  const cancelLogout = () => setShowLogoutConfirm(false);

  return (
    <>
      {/* contextHolder移除 */}
      <LoginModal
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        isLoginForm={isLoginForm}
        setIsLoginForm={setIsLoginForm}
        isForgotPassword={isForgotPassword}
        setIsForgotPassword={setIsForgotPassword}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
        handleGoogleLogin={handleGoogleLogin}
      />
      {/* 登出确认弹窗 */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full border">
            <h3 className="text-xl font-semibold mb-4">Confirm Logout</h3>
            <p className="mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={cancelLogout} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors">Cancel</button>
              <button onClick={confirmLogout} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors">Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 