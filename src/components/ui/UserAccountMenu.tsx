'use client';

import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

interface UserAccountMenuProps {
  userEmail: string | null;
  isMobile: boolean;
  isTablet: boolean;
  showCreditsTooltip: boolean;
  userCredits: {
    pageGeneratorLimit: number;
    pageGeneratorUsage: number;
  };
  packageType: number;
  removeWatermark: boolean;
  taskNotificationEmail: boolean;
  userCreditsLoading: boolean;
  onAccountClick: () => void;
  onToggleWatermark: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onToggleTaskNotification: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onLogoutClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onCloseTooltip: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const getPackageDisplayName = (packageType: number): string => {
  switch(packageType) {
    case 0: return 'Free Trial';
    case 1: return 'Standard';
    case 2: return 'Professional';
    case 3: return 'Free';
    default: return `Unknown (${packageType})`;
  }
};

const isWatermarkFeatureAvailable = (packageType: number): boolean => {
  return packageType === 1 || packageType === 2;
};

export const UserAccountMenu: React.FC<UserAccountMenuProps> = ({
  userEmail,
  isMobile,
  isTablet,
  showCreditsTooltip,
  userCredits,
  packageType,
  removeWatermark,
  taskNotificationEmail,
  userCreditsLoading,
  onAccountClick,
  onToggleWatermark,
  onToggleTaskNotification,
  onLogoutClick,
  onCloseTooltip,
}) => {
  return (
    <div 
      className="flex items-center space-x-2 cursor-pointer select-none relative" 
      onClick={onAccountClick}
      data-trigger="credits"
    >
      {/* 用户头像 - 如果有用户头像URL则显示，否则显示默认图标 */}
      <div className="flex items-center justify-center">
        <FaUserCircle className={`${isMobile ? 'text-xl' : 'text-2xl'} text-blue-500 hover:text-blue-600 transition-colors`} />
      </div>
              <span className={`font-medium text-gray-700 dark:text-gray-200 ${isMobile ? 'text-sm' : 'text-base'} ${isMobile ? 'max-w-[120px] truncate' : isTablet ? 'max-w-[150px] truncate' : ''} hover:text-gray-900 dark:hover:text-gray-100 transition-colors`}>
          {userEmail ? userEmail.split('@')[0] : 'User'}
        </span>
      {showCreditsTooltip ? (
        <IoIosArrowUp className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-500 transition-transform`} />
      ) : (
        <IoIosArrowDown className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-500 transition-transform`} />
      )}
      
      {/* 用户设置弹窗 */}
      {showCreditsTooltip && (
        <div 
          className="absolute right-0 top-10 w-[620px] bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 backdrop-blur-sm"
          style={{animation: 'fadeIn 0.2s ease-out forwards'}}
          onClick={(e) => e.stopPropagation()}
          data-tooltip="credits"
        >
          {/* 弹窗标题栏 */}
          <div className="bg-gray-50 dark:bg-slate-700 px-6 py-4 border-b border-gray-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Account Settings
              </h3>
              <button
                onClick={onCloseTooltip}
                className="text-blue-600 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 用户信息 */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-600">
            <div className="flex items-center space-x-3">
              <FaUserCircle className="text-3xl text-blue-500" />
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {userEmail ? userEmail.split('@')[0] : 'User'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userEmail || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>

          {/* 弹窗内容 */}
          <div className="p-6">
            {/* 积分信息卡片 */}
            <div className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800 dark:text-white">
                  Credits Usage
                </h4>
                <div className="px-2 py-1 rounded text-xs text-blue-600 bg-blue-500/10">
                  {getPackageDisplayName(packageType)} Plan
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Available Credits
                </span>
                <span className="font-bold text-orange-500">
                  {userCreditsLoading ? '...' : `${((userCredits?.pageGeneratorLimit || 0) - (userCredits?.pageGeneratorUsage || 0)) * 10}`}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 opacity-75">
                  {userCreditsLoading ? '' : `Approximately can generate ${(userCredits?.pageGeneratorLimit || 0) - (userCredits?.pageGeneratorUsage || 0)} pages`}
                </span>
              </div>
            </div>

            {/* 设置选项 */}
            <div className="space-y-3">
              {/* 水印设置 */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    Hide Watermark
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Remove "Powered by" watermark from generated pages
                    {!isWatermarkFeatureAvailable(packageType) && (
                      <span className="block text-orange-400 mt-1">
                        Available in Standard and Professional plans
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={onToggleWatermark}
                  disabled={!isWatermarkFeatureAvailable(packageType)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    removeWatermark && isWatermarkFeatureAvailable(packageType)
                      ? 'bg-blue-600' 
                      : 'bg-gray-600'
                  } ${!isWatermarkFeatureAvailable(packageType) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      removeWatermark && isWatermarkFeatureAvailable(packageType) ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 邮件通知设置 */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    Task Completion Email
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get notified when page generation is complete
                  </p>
                </div>
                <button
                  onClick={onToggleTaskNotification}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    taskNotificationEmail ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      taskNotificationEmail ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 分隔线 */}
              <div className="border-t border-gray-200 dark:border-slate-600 my-4"></div>

              {/* 登出按钮 */}
              <div className="pt-2">
                <button
                  onClick={onLogoutClick}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 transition-all duration-300 text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 