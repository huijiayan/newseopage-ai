'use client';

import { useEffect } from 'react';

// Ant Design HMR修复组件
// 专门解决@ant-design/cssinjs与Next.js HMR的兼容性问题
export function AntdHMRFix() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // 延迟执行HMR修复
      const timer = setTimeout(() => {
        import('@/lib/hmr-fix').catch((error) => {
          console.warn('🔧 Ant Design HMR修复导入失败:', error.message);
        });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, []);

  // 这个组件不渲染任何内容
  return null;
}
