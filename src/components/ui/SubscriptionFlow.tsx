// 完整订阅流程业务组件

'use client';
import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useTheme } from '@/hooks/useTheme';
import { useSubscriptionFlow, billingPeriods } from '@/hooks/useSubscription';
import LoginModal from '@/Login/login-modal';
import type { 
  SubscriptionFlowProps, 
  PaymentModalProps, 
  PaymentData, 
  ApiError,
  Plan 
} from '@/types/subscription';

const stripePromise = loadStripe('pk_live_51QzBUgG7uNS0P061vxzgyNH6xBkE2jb3R8myNWI61y288DupEs9W0asrS5gtlIubp6sCCEaIrXSVvyVG3z4DjBAU00ISuF1DvJ');

/**
 * 支付模态框组件
 */
function PaymentModal({ visible, onClose, plan, period, onSubmit }: PaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [cardError, setCardError] = useState('');

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    setCardError('');
    
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setCardError('Card element not found');
        setProcessing(false);
        return;
      }

      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name,
          email,
          address: { postal_code: postalCode }
        }
      });
      
      if (error) {
        setCardError(error.message || 'An error occurred');
        setProcessing(false);
        return;
      }

      // 获取用户信息
      const customerId = localStorage.getItem('alternativelyCustomerId');
      if (!customerId) {
        alert('Customer ID not found. Please log in again.');
        setProcessing(false);
        return;
      }

      // 检查 plan 和 packageFeatureId
      if (!plan || !plan.packageFeatureId) {
        alert('Plan information is missing.');
        setProcessing(false);
        return;
      }

      const packageId = plan.packageFeatureId[period as keyof typeof plan.packageFeatureId];
      if (!packageId) {
        alert('Package ID not found for selected period.');
        setProcessing(false);
        return;
      }

      // 调用支付处理函数
      await onSubmit({
        customerId,
        email,
        name,
        packageId,
        paymentMethodId: paymentMethod.id,
      });
      
    } catch (err) {
      console.error('Payment submission failed:', err);
      const apiError = err as ApiError;
      const errorMessage = apiError?.response?.data?.message || apiError?.message || 'An unexpected error occurred.';
      alert(`Payment failed: ${errorMessage}`);
      setProcessing(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Complete Your Subscription</h3>
        
        {/* 价格展示区 */}
        <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg mb-4">
          <div className="text-center">
            <div className="font-bold text-lg text-gray-900 dark:text-white">{plan?.name} Plan</div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              {period === 'yearly' ? 'Annual Billing' : 'Monthly Billing'}
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-2">
              ${plan?.price?.[period as keyof typeof plan.price] ?? '-'}/mo
            </div>
          </div>
        </div>

        {/* 表单区 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</label>
            <input
              type="text"
              placeholder="Postal code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Card Information</label>
            <div className="mt-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-slate-700">
              <CardElement
                options={{
                  style: {
                    base: { 
                      fontSize: '16px', 
                      color: '#32325d', 
                      '::placeholder': { color: '#bfbfbf' } 
                    },
                    invalid: { color: '#fa755a' }
                  }
                }}
                onChange={(e) => setCardError(e.error ? e.error.message || 'An error occurred' : '')}
              />
            </div>
            {cardError && <div className="text-red-500 text-sm mt-1">{cardError}</div>}
          </div>
        </div>

        {/* 按钮区 */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={processing}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!stripe || !elements || processing}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : 'Confirm & Subscribe'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 订阅流程组件
 * 封装完整的订阅流程：用户选择套餐 → 登录验证 → 支付处理 → 订阅创建
 */
const SubscriptionFlow: React.FC<SubscriptionFlowProps> = ({ 
  plans: propPlans,
  selectedPeriod: propSelectedPeriod,
  onSubscriptionSuccess,
  onSubscriptionError,
  showPlans = true,
  className = ''
}) => {
  const { theme } = useTheme();
  const currentTheme = theme;
  
  // 使用共享订阅流程 Hook
  const subscriptionFlow = useSubscriptionFlow();
  
  // 使用 props 或 Hook 中的数据
  const plans = propPlans || subscriptionFlow.plans;
  const selectedPeriod = propSelectedPeriod || subscriptionFlow.selectedPeriod;
  
  // 简化的主题配置
  const pageTheme = {
    contentSections: {
      background: 'bg-white dark:bg-slate-900',
      decorativeGlow1: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
      decorativeGlow2: 'bg-gradient-to-tl from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
      sectionTitleGradient: 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
      sectionSubtitle: 'text-gray-600 dark:text-gray-300',
      cardDescription: 'text-gray-700 dark:text-gray-200',
      cardTitle: 'text-gray-900 dark:text-white',
      cardBackground: 'bg-white/95 dark:bg-slate-800/95',
      cardBorder: 'border-gray-200/70 dark:border-slate-700/50',
      cardBackgroundHover: 'hover:bg-white dark:hover:bg-slate-800'
    }
  };

  // 处理支付提交
  const handlePaymentSubmit = async (paymentData: PaymentData) => {
    await subscriptionFlow.handlePaymentSubmit(
      paymentData,
      onSubscriptionSuccess,
      onSubscriptionError
    );
  };

  // 处理套餐选择
  const handleSelectPlan = (plan: Plan) => {
    subscriptionFlow.handleSelectPlan(plan);
  };

  // 处理周期变化
  const handlePeriodChange = (periodId: 'yearly' | 'monthly') => {
    if (!propSelectedPeriod) {
      subscriptionFlow.handlePeriodChange(periodId);
    }
  };

  /**
   * 渲染套餐选择按钮
   */
  const renderPlanButton = (plan: Plan) => (
    <button
      key={plan.name}
      className={`relative w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl text-white text-base font-medium
        ${currentTheme === 'dark'
          ? `bg-slate-900 hover:bg-slate-800`
          : plan.popular
            ? `bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700`
            : plan.name === "Free Trial"
              ? `bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700`
              : `bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700`
        }
        transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 shadow-lg`}
      onClick={() => handleSelectPlan(plan)}
    >
      {plan.buttonText || 'Select Plan'}
    </button>
  );

  return (
    <>
      {/* 套餐选择区域 */}
      {showPlans && (
        <div className={`${className} ${pageTheme.contentSections.background} py-12 sm:py-16 lg:py-20 relative overflow-hidden`}>
          <div className={`absolute inset-0 ${pageTheme.contentSections.decorativeGlow1}`}></div>
          <div className={`absolute inset-0 ${pageTheme.contentSections.decorativeGlow2}`}></div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center">
              <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold ${pageTheme.contentSections.sectionTitleGradient} mb-4 sm:mb-6 px-2`}>
                Simple, Transparent Pricing
              </h2>
              <p className={`text-lg sm:text-xl ${pageTheme.contentSections.sectionSubtitle} mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed`}>
                Choose the plan that's right for you
              </p>

              {/* Billing period toggle */}
              <div className="mt-8 sm:mt-12 flex justify-center">
                <div className={`relative ${pageTheme.contentSections.cardBackground} backdrop-blur-sm p-1 rounded-full flex border ${pageTheme.contentSections.cardBorder}`}>
                  {billingPeriods.map(period => (
                    <button
                      key={period.id}
                      onClick={() => handlePeriodChange(period.id)}
                      className={`relative py-2 px-4 sm:px-6 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                        selectedPeriod === period.id
                          ? currentTheme === 'dark'
                            ? `bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-rose-500/20 text-white shadow-inner`
                            : `bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg`
                          : currentTheme === 'dark'
                            ? `text-gray-400 hover:text-gray-200`
                            : `text-gray-600 hover:text-gray-800`
                      }`}
                    >
                      <span className="relative">{period.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 套餐卡片网格 */}
              <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative flex flex-col rounded-2xl p-6 sm:p-8 transition-all duration-500 text-center
                      backdrop-blur-sm
                      ${
                        plan.popular
                          ? currentTheme === 'dark'
                            ? `${pageTheme.contentSections.cardBackground} border-2 border-purple-500/50 ring-4 ring-purple-500/10 scale-[1.02] shadow-xl shadow-purple-500/20`
                            : `bg-white/95 border-2 border-purple-400/60 ring-4 ring-purple-400/15 scale-[1.02] shadow-xl shadow-purple-400/25`
                          : plan.name === "Free Trial"
                            ? currentTheme === 'dark'
                              ? `${pageTheme.contentSections.cardBackground} border ${pageTheme.contentSections.cardBorder} shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/10`
                              : `bg-white/95 border border-gray-200/70 shadow-lg shadow-emerald-400/10 hover:shadow-emerald-400/15`
                            : currentTheme === 'dark'
                              ? `${pageTheme.contentSections.cardBackground} border ${pageTheme.contentSections.cardBorder} shadow-lg shadow-cyan-500/5 hover:shadow-cyan-500/10`
                              : `bg-white/95 border border-gray-200/70 shadow-lg shadow-cyan-400/10 hover:shadow-cyan-400/15`
                      }
                      ${pageTheme.contentSections.cardBackgroundHover}
                      hover:translate-y-[-4px]`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                        <div className={`bg-gradient-to-r from-purple-500 to-rose-500 text-white px-4 sm:px-6 py-2 rounded-full text-sm font-bold shadow-lg ${currentTheme === 'dark' ? 'shadow-purple-500/20' : 'shadow-purple-400/25'}`}>
                          MOST POPULAR ✨
                        </div>
                      </div>
                    )}

                    <h3 className={`text-xl sm:text-2xl font-bold ${pageTheme.contentSections.cardTitle} mt-4`}>{plan.name}</h3>

                    <div className="mt-6 sm:mt-8 mb-4 flex items-center justify-center space-x-4">
                      <span className={`text-4xl sm:text-5xl font-extrabold tracking-tight
                        ${plan.popular
                          ? currentTheme === 'dark'
                            ? `bg-gradient-to-r from-purple-400 to-rose-400 bg-clip-text text-transparent`
                            : `bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent`
                          : plan.name === "Free Trial"
                            ? currentTheme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                            : currentTheme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                        }
                      `}>
                        {plan.name === "Free Trial" ? '$0' : `$${plan.price[selectedPeriod as keyof typeof plan.price]}`}
                      </span>
                      {plan.name !== "Free Trial" && (
                        <span className={`text-lg ${pageTheme.contentSections.cardDescription} font-medium`}>/mo</span>
                      )}
                    </div>

                    <p className={`mt-4 ${pageTheme.contentSections.cardDescription}`}>{plan.description}</p>

                    {/* 套餐选择按钮 */}
                    <div className="mt-6 sm:mt-8 relative group">
                      <div className={`absolute -inset-0.5 rounded-xl blur-sm bg-gradient-to-r ${
                        plan.popular
                          ? `from-purple-500 via-fuchsia-500 to-rose-500 opacity-70 group-hover:opacity-100`
                          : plan.name === "Free Trial"
                            ? `from-emerald-500 to-green-500 opacity-50 group-hover:opacity-70`
                            : `from-cyan-500 to-blue-500 opacity-50 group-hover:opacity-70`
                        } transition duration-300`}></div>
                      {renderPlanButton(plan)}
                    </div>

                    {/* 功能列表 */}
                    <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
                      {plan.features.map((section, index) => (
                        <div key={index}>
                          <h4 className={`text-sm font-semibold uppercase tracking-wide mb-3 sm:mb-4
                            ${plan.popular
                              ? currentTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                              : plan.name === "Free Trial"
                                ? currentTheme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                                : currentTheme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                            }`}>
                            {section.title}
                          </h4>
                          <ul className="space-y-3 sm:space-y-4">
                            {section.items.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-start">
                                <div className={`w-5 h-5 mr-3 rounded-full flex-shrink-0 flex items-center justify-center
                                  ${plan.popular
                                    ? currentTheme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-500/15'
                                    : plan.name === "Free Trial"
                                      ? currentTheme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-500/15'
                                      : currentTheme === 'dark' ? 'bg-cyan-500/20' : 'bg-cyan-500/15'
                                  }`}>
                                  <svg className={`w-3.5 h-3.5
                                    ${plan.popular
                                      ? currentTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                                      : plan.name === "Free Trial"
                                        ? currentTheme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                                        : currentTheme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                                    }`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <span className={`${pageTheme.contentSections.cardDescription} text-left text-sm sm:text-base`}>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 支付模态框 */}
      <Elements stripe={stripePromise}>
        <PaymentModal
          visible={subscriptionFlow.showPaymentModal}
          onClose={() => subscriptionFlow.setShowPaymentModal(false)}
          plan={subscriptionFlow.selectedPlan}
          period={selectedPeriod}
          onSubmit={handlePaymentSubmit}
        />
      </Elements>

      {/* 登录模态框 */}
      <LoginModal
        showLoginModal={subscriptionFlow.showLoginModal}
        setShowLoginModal={subscriptionFlow.setShowLoginModal}
        isLoginForm={true}
        setIsLoginForm={() => {}}
        isForgotPassword={false}
        setIsForgotPassword={() => {}}
        onLoginSuccess={subscriptionFlow.handleLoginSuccess}
        handleGoogleLogin={async () => {}}
        onRegisterSuccess={subscriptionFlow.handleLoginSuccess}
      />
    </>
  );
};

export default SubscriptionFlow; 