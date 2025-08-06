'use client';

import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';

export function useTheme() {
  const { isDarkMode, setIsDarkMode } = useApp();

  useEffect(() => {
    // 检查本地存储中的主题设置
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, [setIsDarkMode]);

  useEffect(() => {
    // 当主题改变时更新文档根元素的class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
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