'use client';

import { useMessage } from './CustomMessage';

// 兼容 Ant Design message API 的包装器
export const createMessageWrapper = () => {
  const messageApi = useMessage();
  
  return {
    success: (content: string, duration?: number) => {
      messageApi.success(content, duration);
    },
    error: (content: string, duration?: number) => {
      messageApi.error(content, duration);
    },
    info: (content: string, duration?: number) => {
      messageApi.info(content, duration);
    },
    warning: (content: string, duration?: number) => {
      messageApi.warning(content, duration);
    },
    loading: (content: string, duration?: number) => {
      messageApi.loading(content, duration);
    },
    destroy: () => {
      messageApi.destroy();
    }
  };
};

// 直接导出的 message 对象（用于非 Hook 组件）
let globalMessageApi: ReturnType<typeof createMessageWrapper> | null = null;

export const setGlobalMessageApi = (api: ReturnType<typeof createMessageWrapper>) => {
  globalMessageApi = api;
};

export const message = {
  success: (content: string, duration?: number) => {
    if (globalMessageApi) {
      globalMessageApi.success(content, duration);
    } else {
      console.warn('Message API not initialized');
    }
  },
  error: (content: string, duration?: number) => {
    if (globalMessageApi) {
      globalMessageApi.error(content, duration);
    } else {
      console.warn('Message API not initialized');
    }
  },
  info: (content: string, duration?: number) => {
    if (globalMessageApi) {
      globalMessageApi.info(content, duration);
    } else {
      console.warn('Message API not initialized');
    }
  },
  warning: (content: string, duration?: number) => {
    if (globalMessageApi) {
      globalMessageApi.warning(content, duration);
    } else {
      console.warn('Message API not initialized');
    }
  },
  loading: (content: string, duration?: number) => {
    if (globalMessageApi) {
      globalMessageApi.loading(content, duration);
    } else {
      console.warn('Message API not initialized');
    }
  },
  destroy: () => {
    if (globalMessageApi) {
      globalMessageApi.destroy();
    } else {
      console.warn('Message API not initialized');
    }
  }
}; 