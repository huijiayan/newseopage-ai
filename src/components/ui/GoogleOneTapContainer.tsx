'use client';

import React from 'react';

interface GoogleOneTapContainerProps {
  isLoggedIn: boolean;
  isMobile: boolean;
  isTablet: boolean;
}

export const GoogleOneTapContainer: React.FC<GoogleOneTapContainerProps> = ({
  isLoggedIn,
  isMobile,
  isTablet,
}) => {
  // 使用useEffect来避免水合错误
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // 在客户端渲染之前不显示组件
  if (!mounted) {
    return null;
  }

  return (
    <div 
      id="google-one-tap-button"
      className={`fixed right-4 z-[9999] ${isMobile ? 'top-20' : isTablet ? 'top-22' : 'top-24'}`}
      style={{ 
        display: isLoggedIn ? 'none' : 'block',
        width: isMobile ? '300px' : isTablet ? '350px' : '400px',
        height: '50px'
      }}
    />
  );
}; 