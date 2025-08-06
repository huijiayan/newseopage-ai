'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface WindowSize {
  width: number;
  height: number;
}

interface UseHeaderLogicReturn {
  windowSize: WindowSize;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isScrolled: boolean;
  logoSubText: string;
  
  // 计算函数
  getLogoSize: () => { width: number; height: number; className: string };
  shouldShowBadges: () => boolean;
  shouldShowNavigation: () => boolean;
  getBadgeSpacing: () => string;
  getTextSize: () => string;
  getSpacing: () => string;
  getRouteText: () => string;
}

export const useHeaderLogic = (): UseHeaderLogicReturn => {
  const [windowSize, setWindowSize] = useState<WindowSize>({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoSubText, setLogoSubText] = useState('');
  
  const pathname = usePathname();

  // 窗口大小监听和响应式适配
  useEffect(() => {
    const updateWindowSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });
      
      // 响应式断点判断
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1200);
      setIsDesktop(width >= 1200);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    const handleResize = () => {
      updateWindowSize();
    };

    // 初始化
    updateWindowSize();
    
    // 添加事件监听器
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 监听路径变化更新 logo 文字
  useEffect(() => {
    const getLogoSubText = (pathname: string): string => {
      if (pathname === '/') {
        return '';
      } else if (pathname.includes('bestpage')) {
        return 'BestPage';
      } else if (pathname.includes('faqpage')) {
        return 'FaqPage';
      } else {
        return 'AlternativePage';
      }
    };

    const updateLogoText = () => {
      const currentPath = window.location.pathname;
      setLogoSubText(getLogoSubText(currentPath));
    };
    
    updateLogoText();
    
    const handlePopState = () => {
      updateLogoText();
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // 计算函数
  const getLogoSize = () => {
    if (isMobile) {
      return { width: 72, height: 21, className: "w-[6vw] max-w-[80px] min-w-[60px]" };
    } else if (isTablet) {
      return { width: 84, height: 24.5, className: "w-[7vw] max-w-[96px] min-w-[70px]" };
    } else {
      return { width: 96, height: 28, className: "w-[8vw] sm:w-[9.6vw] md:w-[11.2vw] max-w-[112px] min-w-[80px]" };
    }
  };

  const shouldShowBadges = () => {
    return isDesktop || (isTablet && windowSize.width >= 900);
  };

  const shouldShowNavigation = () => {
    return isDesktop || (isTablet && windowSize.width >= 900);
  };

  const getBadgeSpacing = () => {
    if (isDesktop) {
      return "ml-4 mr-8 xl:mr-12";
    } else if (isTablet && windowSize.width >= 900) {
      return "ml-3 mr-6";
    }
    return "ml-2 mr-4";
  };

  const getTextSize = () => {
    if (isMobile) {
      return "text-xs";
    } else if (isTablet) {
      return "text-sm";
    } else {
      return "text-sm";
    }
  };

  const getSpacing = () => {
    if (isMobile) {
      return "ml-1";
    } else if (isTablet) {
      return "ml-1.5";
    } else {
      return "ml-2";
    }
  };

  const getRouteText = () => {
    const currentPath = pathname || '';
    if (currentPath.includes('alternativepage') || currentPath.includes('alternative')) {
      return '| AlternativePage';
    } else if (currentPath.includes('bestpage') || currentPath.includes('best')) {
      return '| BestPage';
    } else if (currentPath.includes('faqpage')) {
      return '| FaqPage';
    }
    return '';
  };

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isScrolled,
    logoSubText,
    getLogoSize,
    shouldShowBadges,
    shouldShowNavigation,
    getBadgeSpacing,
    getTextSize,
    getSpacing,
    getRouteText,
  };
}; 