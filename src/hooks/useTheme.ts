'use client';

import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { getLocalStorageItem, setLocalStorageItem } from '@/lib/utils';

export function useTheme() {
  const { isDarkMode, setIsDarkMode } = useApp();

  useEffect(() => {
    // 检查本地存储中的主题设置
    const savedTheme = getLocalStorageItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, [setIsDarkMode]);

  useEffect(() => {
    // 当主题改变时更新文档根元素的class
    if (typeof window !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        setLocalStorageItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        setLocalStorageItem('theme', 'light');
      }
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return {
    theme: isDarkMode ? 'dark' : 'light',
    toggleTheme,
  };
} 