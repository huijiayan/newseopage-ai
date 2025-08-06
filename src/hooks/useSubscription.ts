// 共享订阅逻辑 Hook

import { useState, useEffect, useCallback } from 'react';
import { message } from '@/components/ui/CustomMessage';
import apiClient from '@/lib/api';
import type { 
  Plan, 
  UserInfo, 
  PaymentData, 
  ApiError, 
  BillingPeriod, 
  BillingPeriodOption 
} from '@/types/subscription';

// 模拟套餐数据
export const mockPlans: Plan[] = [
  {
    name: "Free Trial",
    price: { monthly: 0, yearly: 0 },
    description: "Start exploring with 50 free credits to get started",
    buttonText: "Start Generating Now",
    popular: false,
    features: [
      {
        title: "Features include:",
        items: [
          "50 credits/month (approx. 5 pages for alternative page or blog generation)",
          "Generate up to 5 pages in total /month",
          "Freely hosting 5 pages on our server",
          "Auto images grabbing and matching",
          "Auto internal links insertion",
          "AI page design and generation",
          "Standard support",
          "1 Free onboarding call"
        ]
      }
    ],
    planId: 'free-trial'
  },
  {
    name: "Standard",
    price: { monthly: 9.9, yearly: 9 },
    description: "Everything you need to start creating alternative pages",
    buttonText: "Choose This Plan",
    popular: false,
    features: [
      {
        title: "Features include:",
        items: [
          "100 credits/month (approx. 10 pages for alternative page or blog generation)",
          "Generate up to 10 pages in total /month",
          "Freely hosting 10 pages on our server",
          "Auto images grabbing and matching",
          "Auto internal links insertion",
          "AI page design and generation",
          "Standard support",
          "1 Free onboarding call"
        ]
      }
    ]
  },
  {
    name: "Professional",
    price: { monthly: 26.9, yearly: 21.9 },
    description: "Perfect for teams scaling alternative page production",
    buttonText: "Choose This Plan",
    popular: true,
    features: [
      {
        title: "Everything in Standard, plus:",
        items: [
          "300 credits/month (approx. 30 pages for alternative page or blog generation)",
          "Generate up to 30 pages in total /month",
          "Freely hosting 30 pages on our server",
          "Auto images grabbing and matching",
          "Auto internal links insertion",
          "AI page design and generation",
          "Priority page generation",
          "Pro features:",
          "More alternative pages generation",
          "Unlimited Page Section Re-generation",
          "Priority support"
        ]
      }
    ]
  }
];

// 计费周期选项
export const billingPeriods: BillingPeriodOption[] = [
  { id: 'yearly', label: 'Annual · Save 20%' },
  { id: 'monthly', label: 'Monthly' }
];

// 用户认证 Hook
export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('alternativelyAccessToken'));
    }
  }, []);

  const handleLoginSuccess = useCallback((userInfo: UserInfo) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('alternativelyAccessToken', userInfo.accessToken);
      localStorage.setItem('alternativelyIsLoggedIn', 'true');
      localStorage.setItem('alternativelyCustomerEmail', userInfo.email);
      localStorage.setItem('alternativelyCustomerId', userInfo.customerId);
    }

    setIsLoggedIn(true);
    setShowLoginModal(false);
    message.success('Login successful!');
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('alternativelyLoginSuccess'));
    }
  }, []);

  const triggerLogin = useCallback(() => {
    setShowLoginModal(true);
  }, []);

  return {
    isLoggedIn,
    showLoginModal,
    setShowLoginModal,
    handleLoginSuccess,
    triggerLogin
  };
};

// 套餐选择 Hook
export const usePlanSelection = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('yearly');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    setPlans(mockPlans);
  }, []);

  const handlePeriodChange = useCallback((period: BillingPeriod) => {
    setSelectedPeriod(period);
  }, []);

  return {
    selectedPeriod,
    plans,
    selectedPlan,
    setSelectedPlan,
    handlePeriodChange
  };
};

// 支付处理 Hook
export const usePayment = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePaymentSubmit = useCallback(async (
    paymentData: PaymentData,
    onSuccess?: (data: any) => void,
    onError?: (error: string) => void
  ) => {
    console.log('Processing payment', paymentData);
    
    try {
      const res = await apiClient.createSubscription({
        customerId: paymentData.customerId,
        email: paymentData.email,
        name: paymentData.name,
        packageId: paymentData.packageId,
        paymentMethodId: paymentData.paymentMethodId,
      });

      console.log('Subscription creation response', res);

      if (res?.code === 200) {
        message.success('Subscription successful!');
        setShowPaymentModal(false);
        
        if (onSuccess) {
          onSuccess(res.data);
        }
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const errorMessage = res?.message || 'Subscription failed';
        message.error(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      const apiError = error as ApiError;
      const errorMessage = apiError?.response?.data?.message || apiError?.message || 'Payment failed';
      message.error(`Payment failed: ${errorMessage}`);
      
      if (onError) {
        onError(errorMessage);
      }
    }
  }, []);

  return {
    showPaymentModal,
    setShowPaymentModal,
    handlePaymentSubmit
  };
};

// 完整订阅流程 Hook
export const useSubscriptionFlow = () => {
  const auth = useAuth();
  const planSelection = usePlanSelection();
  const payment = usePayment();

  const handleSelectPlan = useCallback((plan: Plan) => {
    console.log('User selected plan', plan);
    
    // 免费试用计划处理
    if (plan.planId === 'free-trial') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return; 
    }

    planSelection.setSelectedPlan(plan);

    // 检查登录状态
    if (!auth.isLoggedIn) {
      console.log('User not logged in, showing login modal');
      auth.triggerLogin();
      return;
    }

    // 已登录，直接进入支付流程
    console.log('User logged in, proceeding to payment');
    payment.setShowPaymentModal(true);
  }, [auth, planSelection, payment]);

  return {
    ...auth,
    ...planSelection,
    ...payment,
    handleSelectPlan
  };
}; 