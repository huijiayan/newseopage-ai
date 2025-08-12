'use client';

import React from 'react';

interface HeaderBadgesProps {
  shouldShowBadges: () => boolean;
  getBadgeSpacing: () => string;
  isDarkMode: boolean;
  isTablet: boolean;
  phCheckDone: boolean;
  phImageAvailable: boolean;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export const HeaderBadges: React.FC<HeaderBadgesProps> = ({
  shouldShowBadges,
  getBadgeSpacing,
  isDarkMode,
  isTablet,
  phCheckDone,
  phImageAvailable,
  onImageLoad,
  onImageError,
}) => {
  return (
    <div className={`${shouldShowBadges() ? 'flex' : 'hidden'} items-center ${getBadgeSpacing()} flex-shrink-0`}>
      {/* TrustPilot 徽章 */}
      <div className="flex-shrink-0">
        <a 
          href="https://www.trustpilot.com/review/www.altpage.ai" 
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block hover:scale-[1.02] transition-transform duration-300"
        >
          <div className="flex items-center bg-white dark:bg-dark-card rounded-lg px-2 py-1.5 shadow-sm h-[40px] border border-green-400">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="ml-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-slate-800 dark:text-white">4.0</span>
                  <span className="text-xs text-green-500 font-medium ml-1">Trustpilot</span>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
      
      {/* ProductHunt 徽章 */}
      {phCheckDone && phImageAvailable && (
        <div className="flex-shrink-0 ml-3">
          <a href="https://www.producthunt.com/products/altpage-ai?embed=true&utm_source=badge-top-post-badge&utm_medium=badge&utm_source=badge-altpage&#0045;ai" target="_blank">
            <img
              src={`https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=967689&theme=${isDarkMode ? 'dark' : 'light'}&period=daily&t=1749613315263`}
              alt="AltPage&#0046;ai - Steal&#0032;competitor&#0032;brand&#0032;traffic&#0032;with&#0032;alternative&#0032;pages | Product Hunt"
              style={{
                width: shouldShowBadges() && isTablet ? '160px' : '180px',
                height: '40px',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
              width={shouldShowBadges() && isTablet ? 160 : 180}
              height="40"
              onLoad={onImageLoad}
              onError={onImageError}
            />
          </a>
        </div>
      )}
      
      {/* ProductHunt 备用显示方式 */}
      {phCheckDone && !phImageAvailable && (
        <div className="flex-shrink-0 ml-3">
          <a 
            href="https://www.producthunt.com/products/altpage-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block hover:scale-[1.02] transition-transform duration-300"
          >
            <div className={`${shouldShowBadges() && isTablet ? 'w-[160px]' : 'w-[180px]'} h-[40px] bg-white dark:bg-[#2B2B2B] border border-[#E16A5E] dark:border-gray-600 rounded-md flex items-center px-2.5 shadow-sm group`}>
              <div className="flex items-center w-full gap-1.5">
                <div className="w-5 h-5 flex-shrink-0 relative">
                  <img 
                    src="/icons/gold-medal.png" 
                    alt="Gold Medal" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="text-[7px] font-medium leading-tight tracking-wide text-[#E16A5E] dark:text-[#FF6154]">
                    PRODUCT HUNT
                  </div>
                  <div className="text-[11px] font-bold leading-tight text-[#E16A5E] dark:text-gray-100">
                    #1 Product of the Day
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      )}
    </div>
  );
}; 