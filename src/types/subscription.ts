// 共享订阅类型定义

export interface UserInfo {
  accessToken: string;
  email: string;
  customerId: string;
}

export interface Plan {
  name: string;
  price: {
    monthly: string | number;
    yearly: string | number;
  };
  description: string;
  buttonText: string;
  popular: boolean;
  features: Array<{
    title: string;
    items: Array<string | React.ReactElement>;
  }>;
  priceId?: {
    monthly?: string;
    yearly?: string;
  };
  packageFeatureId?: {
    monthly?: string;
    yearly?: string;
  };
  planId?: string;
}

export interface PaymentData {
  customerId: string;
  email: string;
  name: string;
  packageId: string;
  paymentMethodId: string;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export interface SubscriptionFlowProps {
  plans?: Plan[];
  selectedPeriod?: 'yearly' | 'monthly';
  onSubscriptionSuccess?: (data: any) => void;
  onSubscriptionError?: (error: string) => void;
  showPlans?: boolean;
  className?: string;
}

export interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  plan: Plan | null;
  period: string;
  onSubmit: (paymentData: PaymentData) => Promise<void>;
}

export interface SubscriptionCardProps {
  plans?: Plan[];
  selectedPeriod?: 'yearly' | 'monthly';
  onPlanSelect?: (plan: Plan) => void;
  className?: string;
}

export type BillingPeriod = 'yearly' | 'monthly';

export interface BillingPeriodOption {
  id: BillingPeriod;
  label: string;
} 