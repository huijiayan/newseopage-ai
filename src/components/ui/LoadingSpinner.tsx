'use client';

import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Preparing your workspace...", 
  size = 'lg' 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16', 
    lg: 'h-32 w-32'
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-6">
        {/* 蓝色圆形加载器 */}
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
        
        {/* 加载文本 */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}; 