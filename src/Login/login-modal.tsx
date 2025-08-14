import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/api/index';
import { useMessage } from '@/components/ui/CustomMessage';
import { useTheme } from '@/hooks/useTheme';

interface LoginModalProps {
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  isLoginForm: boolean;
  setIsLoginForm: (isLogin: boolean) => void;
  isForgotPassword: boolean;
  setIsForgotPassword: (isForgot: boolean) => void;
  onLoginSuccess: (data: { accessToken: string; email: string; customerId: string }) => void;
  handleGoogleLogin: (invitationCode?: string) => Promise<void>;
  onRegisterSuccess: (data: { accessToken: string; email: string; customerId: string }) => void;
}

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

interface ResetForm {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ 
  showLoginModal, 
  setShowLoginModal, 
  isLoginForm, 
  setIsLoginForm, 
  isForgotPassword, 
  setIsForgotPassword,
  onLoginSuccess,
  handleGoogleLogin,
  onRegisterSuccess
}) => {
  const { theme } = useTheme();
  const themeValue: ThemeType = (theme === 'dark' ? 'dark' : 'light');

  // 主题样式配置
  type ThemeType = 'light' | 'dark';
  interface ThemeConfig {
    overlayBackground: string;
    modalBackground: string;
    modalBorder: string;
    text: string;
    title: string;
    label: string;
    input: string;
    inputPlaceholder: string;
    primaryButton: string;
    googleButton: string;
    linkButton: string;
    closeButton: string;
    loadingSpinner: string;
    description: string;
  }
  const themeConfig: Record<ThemeType, ThemeConfig> = {
    light: {
      overlayBackground: 'bg-black bg-opacity-30',
      modalBackground: 'bg-white',
      modalBorder: 'border border-gray-200',
      text: 'text-gray-900',
      title: 'text-gray-900',
      label: 'text-gray-700',
      input: 'bg-gray-100 border border-gray-300 text-gray-900',
      inputPlaceholder: 'placeholder-gray-400',
      primaryButton: 'bg-indigo-600 text-white hover:bg-indigo-700',
      googleButton: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100',
      linkButton: 'text-indigo-600 hover:text-indigo-800',
      closeButton: 'text-gray-400 hover:text-gray-600',
      loadingSpinner: 'text-indigo-600',
      description: 'text-gray-500',
    },
    dark: {
      overlayBackground: 'bg-black bg-opacity-60',
      modalBackground: 'bg-gray-900',
      modalBorder: 'border border-gray-700',
      text: 'text-gray-100',
      title: 'text-gray-100',
      label: 'text-gray-300',
      input: 'bg-gray-800 border border-gray-700 text-gray-100',
      inputPlaceholder: 'placeholder-gray-400',
      primaryButton: 'bg-indigo-500 text-white hover:bg-indigo-600',
      googleButton: 'bg-gray-800 border border-gray-600 text-gray-100 hover:bg-gray-700',
      linkButton: 'text-indigo-400 hover:text-indigo-200',
      closeButton: 'text-gray-500 hover:text-gray-300',
      loadingSpinner: 'text-indigo-400',
      description: 'text-gray-400',
    },
  };
  const currentThemeConfig = themeConfig[themeValue];

  const messageApi = useMessage();
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: ''
  });
  
  // Register form state
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    email: '',
    code: '',
    password: '',
    confirmPassword: ''
  });
  
  // Reset password form state
  const [resetForm, setResetForm] = useState<ResetForm>({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Other states
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [cooldownTimer, setCooldownTimer] = useState<NodeJS.Timeout | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  // 新增：注册表单密码可见性状态
  const [showRegisterPasswords, setShowRegisterPasswords] = useState({
    password: false,
    confirmPassword: false
  });

  // Add state to track all types of error messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 新增：Google 登录 loading 状态
  const [googleLoading, setGoogleLoading] = useState(false);

  // Clean up timer
  useEffect(() => {
    return () => {
      if (cooldownTimer) {
        clearInterval(cooldownTimer);
      }
    };
  }, [cooldownTimer]);

  useEffect(() => {
    if (errorMessage) {
      messageApi.error(errorMessage);
      setErrorMessage(null);
    }
  }, [errorMessage, messageApi]);

  // Handle success messages with useEffect
  useEffect(() => {
    if (successMessage) {
      messageApi.success(successMessage);
      setSuccessMessage(null);
    }
  }, [successMessage, messageApi]);

  // Handle login form input change
  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle register form input change
  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle reset password form input change
  const handleResetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetForm(prev => ({ ...prev, [name]: value }));
  };

  // Send verification code
  const sendCode = async (type: 'reset' | 'register') => {
    const email = type === 'reset' ? resetForm.email : registerForm.email;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      const response = await apiClient.sendEmailCode(email, type === 'reset' ? 'forgot_password' : 'register');
      
      // Handle email already exists case
      if (response && response.code === 1001) {
        setErrorMessage('Email already exists. Please use a different email address.');
        return;
      }
      
      // Start cooldown
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setCooldownTimer(timer);
      
      setSuccessMessage('Verification code sent to your email');
    } catch (error: any) {
      console.error("Failed to send verification code:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Failed to send verification code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle login submit
  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await apiClient.login(loginForm.email, loginForm.password);
      
      // Check if response contains error code despite 200 status
      if (response && response.code === 1047) {
        setErrorMessage('Password is incorrect. Please try again.');
        return;
      }
      
      // Handle customer not found error
      if (response && response.code === 1002) {
        setErrorMessage('Account not found. Please check your email address or register first.');
        return;
      }
      
      if (response && response.accessToken) {
        onLoginSuccess({
          accessToken: response.accessToken,
          email: response.data.email,
          customerId: response.data.customerId
        });
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      // Handle error response
      if (error.response && error.response.data) {
        const { code, message: errorMessage } = error.response.data;
        if (code === 1047) {
          setErrorMessage('Password is incorrect. Please try again.');
        } else if (code === 1002) {
          setErrorMessage('Account not found. Please check your email address or register first.');
        } else {
          setErrorMessage(errorMessage || 'Login failed. Please check your credentials.');
        }
      } else {
        setErrorMessage('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle register submit
  const handleRegister = async () => {
    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    // 新增：从 localStorage 获取 invitationCode
    let invitationCode = null;
    try {
      invitationCode = localStorage.getItem('invitationCode');
    } catch (e) {
      // 兼容 SSR 或隐私模式
      invitationCode = null;
    }

    try {
      setLoading(true);
      const response = await apiClient.register({
        email: registerForm.email,
        password: registerForm.password,
        code: registerForm.code,
        inviteCode: invitationCode || undefined, // 传递给接口
      });

      // 注册成功后删除 invitationCode
      if (invitationCode) {
        try {
          localStorage.removeItem('invitationCode');
        } catch (e) {}
      }

      if (response && response.code && response.code !== 200) {
        setErrorMessage(response.message || 'Registration failed. Please try again.');
        return;
      }
      
      setSuccessMessage('Registration successful!');
      
      try {
        const loginResponse = await apiClient.login(registerForm.email, registerForm.password);
        
        if (loginResponse && loginResponse.accessToken) {
          if (onRegisterSuccess) {
            onRegisterSuccess({
              accessToken: loginResponse.accessToken,
              email: loginResponse.data.email,
              customerId: loginResponse.data.customerId
            });
          } 
          else if (onLoginSuccess) {
            onLoginSuccess({
              accessToken: loginResponse.accessToken,
              email: loginResponse.data.email,
              customerId: loginResponse.data.customerId
            });
          }
          
          setShowLoginModal(false);
        } else {
          // If auto-login fails but registration succeeded, redirect to login form
          setIsLoginForm(true);
          setSuccessMessage('Registration successful. Please log in with your credentials.');
        }
      } catch (loginError: any) {
        console.error("Auto-login after registration failed:", loginError);
        setIsLoginForm(true);
        setSuccessMessage('Registration successful. Please log in with your credentials.');
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || 'Registration failed. Please try again.');
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle reset password
  const handleResetPassword = async () => {
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      const response = await apiClient.resetPassword({
        email: resetForm.email,
        code: resetForm.code,
        newPassword: resetForm.newPassword,
        confirmPassword: resetForm.confirmPassword
      });
      
      if (response && response.code === 1041) {
        setErrorMessage(response.message || 'Passwords do not match. Please re-enter your password.');
        return;
      }
      
      setSuccessMessage('Password reset successful. Please login with your new password.');
      setIsForgotPassword(false);
      setIsLoginForm(true);
    } catch (error: any) {
      console.error("Password reset failed:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Password reset failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle between login and register forms
  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
    setIsForgotPassword(false);
  };
  
  // Show forgot password form
  const showForgotPassword = () => {
    setIsForgotPassword(true);
    setIsLoginForm(false);
  };
  
  // Back to login form
  const backToLogin = () => {
    setIsForgotPassword(false);
    setIsLoginForm(true);
  };

  // 修改 handleGoogleLogin
  const handleGoogleLoginClick = async () => {
    let invitationCode: string | undefined = undefined;
    try {
      const code = localStorage.getItem('invitationCode');
      invitationCode = code === null ? undefined : code;
    } catch (e) {
      invitationCode = undefined;
    }
    try {
      setGoogleLoading(true);
      await handleGoogleLogin(invitationCode); // 调用父组件传进来的 Google 登录逻辑
      if (invitationCode) {
        try {
          localStorage.removeItem('invitationCode');
        } catch (e) {}
      }
    } catch (e: any) {
      // 可以加错误提示
    }
    finally {
      setGoogleLoading(false);
    }
  };

  // 确保模态框只渲染一次的防御性代码
  if (!showLoginModal) return null;

  return (
    <>
      {/* contextHolder is now handled by useMessage hook */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-all`}>
        <div className={`w-full max-w-md p-8 mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-0 relative`} style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)'}}>
          <button 
            onClick={() => setShowLoginModal(false)}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl"
            aria-label="Close"
          >
            ×
          </button>
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 w-full text-center">
              {isForgotPassword ? 'Reset Password' : (isLoginForm ? 'Sign In' : 'Create Account')}
            </h2>
          </div>
          {/* Login Form */}
          {isLoginForm && !isForgotPassword && (
            <form onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleLogin(); }} className="space-y-5">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-3 flex items-center h-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showLoginPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <button
                  type="button"
                  onClick={showForgotPassword}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-lg shadow-md hover:from-indigo-600 hover:to-violet-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
              {/* 谷歌登录按钮 */}
              <button
                type="button"
                onClick={() => { console.log('google btn click'); handleGoogleLoginClick(); }}
                disabled={loading || googleLoading}
                className="w-full mt-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                {googleLoading ? (
                  <svg className="w-5 h-5 mr-2 animate-spin text-gray-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                <span>Sign in with Google</span>
              </button>
              <div className="mt-6 text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={toggleForm}
                    className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors"
                  >
                    Register now
                  </button>
                </span>
              </div>
            </form>
          )}
          
          {/* Register Form */}
          {!isLoginForm && !isForgotPassword && (
            <form onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleRegister(); }}>
              <div className="mb-4">
                <label className={`block mb-2 text-sm font-medium ${currentThemeConfig.label}`}>Email</label>
                <div className="flex">
                  <input
                    type="email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterInputChange}
                    className={`w-full px-3 py-2 ${currentThemeConfig.input} rounded-l-md focus:outline-none focus:ring-2 ${currentThemeConfig.inputPlaceholder}`}
                    placeholder="Enter your email"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => sendCode('register')}
                    disabled={cooldown > 0}
                    className={`px-4 py-2 ${currentThemeConfig.input} rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors`}
                  >
                    {cooldown > 0 ? `${cooldown}s` : 'Send'}
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className={`block mb-2 text-sm font-medium ${currentThemeConfig.label}`}>Verification Code</label>
                <input
                  type="text"
                  name="code"
                  value={registerForm.code}
                  onChange={handleRegisterInputChange}
                  className={`w-full px-3 py-2 ${currentThemeConfig.input} rounded-md focus:outline-none focus:ring-2 ${currentThemeConfig.inputPlaceholder}`}
                  placeholder="Enter verification code"
                  required
                />
              </div>
              <div className="mb-4 relative">
                <label className={`block mb-2 text-sm font-medium ${currentThemeConfig.label}`}>Password</label>
                <input
                  type={showRegisterPasswords.password ? "text" : "password"}
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterInputChange}
                  className={`w-full px-3 py-2 ${currentThemeConfig.input} rounded-md focus:outline-none focus:ring-2 ${currentThemeConfig.inputPlaceholder} pr-10`}
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPasswords(prev => ({...prev, password: !prev.password}))}
                  className={`absolute inset-y-0 right-3 flex items-center h-full register-eye-btn ${currentThemeConfig.closeButton}`}
                >
                  {showRegisterPasswords.password ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="mb-6 relative">
                <label className={`block mb-2 text-sm font-medium ${currentThemeConfig.label}`}>Confirm Password</label>
                <input
                  type={showRegisterPasswords.confirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterInputChange}
                  className={`w-full px-3 py-2 ${currentThemeConfig.input} rounded-md focus:outline-none focus:ring-2 ${currentThemeConfig.inputPlaceholder} pr-10`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPasswords(prev => ({...prev, confirmPassword: !prev.confirmPassword}))}
                  className={`absolute inset-y-0 right-3 flex items-center h-full register-eye-btn ${currentThemeConfig.closeButton}`}
                >
                  {showRegisterPasswords.confirmPassword ? (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-4 py-2 ${currentThemeConfig.primaryButton} rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02]`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className={`w-5 h-5 mr-2 animate-spin ${currentThemeConfig.loadingSpinner}`} viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Register'}
              </button>
              
              <div className="mt-6 text-center">
                <p className={`text-sm ${currentThemeConfig.description}`}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={toggleForm}
                    className={`font-medium ${currentThemeConfig.linkButton} transition-colors`}
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          )}
          
          {/* Forgot Password Form */}
          {isForgotPassword && (
            <form onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleResetPassword(); }}>
              <div className="mb-4">
                <label className={`block mb-2 text-sm font-medium ${currentThemeConfig.label}`}>Email</label>
                <div className="flex">
                  <input
                    type="email"
                    name="email"
                    value={resetForm.email}
                    onChange={handleResetInputChange}
                    className={`w-full px-3 py-2 ${currentThemeConfig.input} rounded-l-md focus:outline-none focus:ring-2 ${currentThemeConfig.inputPlaceholder}`}
                    placeholder="Enter your email"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => sendCode('reset')}
                    disabled={cooldown > 0}
                    className={`px-4 py-2 ${currentThemeConfig.input} rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors`}
                  >
                    {cooldown > 0 ? `${cooldown}s` : 'Send'}
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className={`block mb-2 text-sm font-medium ${currentThemeConfig.label}`}>Verification Code</label>
                <input
                  type="text"
                  name="code"
                  value={resetForm.code}
                  onChange={handleResetInputChange}
                  className={`w-full px-3 py-2 ${currentThemeConfig.input} rounded-md focus:outline-none focus:ring-2 ${currentThemeConfig.inputPlaceholder}`}
                  placeholder="Enter verification code"
                  required
                />
              </div>
              <div className="mb-4">
                <label className={`block mb-2 text-sm font-medium ${currentThemeConfig.label}`}>New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={resetForm.newPassword}
                    onChange={handleResetInputChange}
                    className={`w-full px-3 py-2 ${currentThemeConfig.input} rounded-md focus:outline-none focus:ring-2 ${currentThemeConfig.inputPlaceholder} pr-10`}
                    placeholder="Create a new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({...prev, newPassword: !prev.newPassword}))}
                    className={`absolute inset-y-0 right-3 flex items-center h-full ${currentThemeConfig.closeButton}`}
                  >
                    {showPasswords.newPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="mb-6">
                <label className={`block mb-2 text-sm font-medium ${currentThemeConfig.label}`}>Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={resetForm.confirmPassword}
                    onChange={handleResetInputChange}
                    className={`w-full px-3 py-2 ${currentThemeConfig.input} rounded-md focus:outline-none focus:ring-2 ${currentThemeConfig.inputPlaceholder} pr-10`}
                    placeholder="Confirm your new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({...prev, confirmPassword: !prev.confirmPassword}))}
                    className={`absolute inset-y-0 right-3 flex items-center h-full ${currentThemeConfig.closeButton}}`}
                  >
                    {showPasswords.confirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-4 py-2 ${currentThemeConfig.primaryButton} rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02]`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className={`w-5 h-5 mr-2 animate-spin ${currentThemeConfig.loadingSpinner}`} viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Reset Password'}
              </button>
              
              <div className="mt-6 text-center">
                <p className={`text-sm ${currentThemeConfig.description}`}>
                  <button
                    type="button"
                    onClick={backToLogin}
                    className={`font-medium ${currentThemeConfig.linkButton} transition-colors`}
                  >
                    Back to login
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

//防止不必要的重新渲染
export default React.memo(LoginModal); 