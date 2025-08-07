'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface ThemeConfig {
  contentSections: {
    backgroundAlt: string;
    decorativeGlow4: string;
    decorativeGlow3: string;
    sectionTitle: string;
    sectionSubtitle: string;
  };
  heroSection: {
    titleAccent: string;
    description: string;
  };
}

// 主题配置函数
const getThemeConfig = (section: string): ThemeConfig => {
  return {
    contentSections: {
      backgroundAlt: 'bg-white dark:bg-slate-900',
      decorativeGlow4: 'bg-gradient-to-br from-blue-500/20 to-purple-600/20',
      decorativeGlow3: 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20',
      sectionTitle: 'text-gray-900 dark:text-white',
      sectionSubtitle: 'text-gray-600 dark:text-gray-300'
    },
    heroSection: {
      titleAccent: 'bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-purple-600 dark:from-blue-400 dark:via-purple-400 dark:to-purple-400',
      description: 'text-gray-600 dark:text-gray-300'
    }
  };
};

export default function InvisibleMarketingGraphic(): JSX.Element {
  const { theme } = useTheme();
  const currentTheme = theme;
  const pageTheme: ThemeConfig = getThemeConfig('pages');

  // 动画相关状态
  const [animatedInputValue, setAnimatedInputValue] = useState<string>('');
  const [animationPhase, setAnimationPhase] = useState<'typing' | 'clicking'>('typing');
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [postClickPhase, setPostClickPhase] = useState<'idle' | 'spinning' | 'showingArrow'>('idle');
  const fullTextToType: string = "wix alternative";

  // 滚动到顶部函数
  const scrollToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 动画效果
  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;
    let clickTimerId: NodeJS.Timeout | undefined;

    const typeCharacter = (): void => {
      if (currentCharIndex < fullTextToType.length) {
        setAnimatedInputValue(fullTextToType.slice(0, currentCharIndex + 1));
        setCurrentCharIndex(currentCharIndex + 1);
        timerId = setTimeout(typeCharacter, 100);
      } else {
        setAnimationPhase('clicking');
        setTimeout(() => {
          setIsSearching(true);
          setPostClickPhase('spinning');
          setTimeout(() => {
            setPostClickPhase('showingArrow');
            setTimeout(() => {
              setPostClickPhase('idle');
              setIsSearching(false);
              setAnimationPhase('typing');
              setCurrentCharIndex(0);
              setAnimatedInputValue('');
            }, 2000);
          }, 1000);
        }, 500);
      }
    };

    if (animationPhase === 'typing') {
      timerId = setTimeout(typeCharacter, 100);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
      if (clickTimerId) clearTimeout(clickTimerId);
    };
  }, [currentCharIndex, animationPhase]);

  return (
    <section id="the-problem">
      {/* FeatureIntro 组件内容 - 支持主题 */}
      <div 
        className={`${pageTheme.contentSections.backgroundAlt} py-24 sm:py-32 relative overflow-hidden`} 
      >
        {/* 移除背景装饰渐变 */}
        {/* <div className={`absolute inset-0 ${pageTheme.contentSections.decorativeGlow4} opacity-70`}></div> */}
        {/* <div className={`absolute inset-0 ${pageTheme.contentSections.decorativeGlow3} opacity-70`}></div> */}
        <div className={`absolute top-1/4 left-1/4 w-72 h-72 ${currentTheme === 'dark' ? 'bg-purple-600/10' : 'bg-purple-500/20'} rounded-full filter blur-3xl opacity-40 animate-pulse`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-72 h-72 ${currentTheme === 'dark' ? 'bg-cyan-600/10' : 'bg-cyan-500/20'} rounded-full filter blur-3xl opacity-40 animate-pulse animation-delay-2000`}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-8 ${pageTheme.heroSection.titleAccent}`}>
            Missing on 'Alternative' keywords?
            <br />
            You're invisible.
          </h2>
          <p className={`text-lg ${pageTheme.heroSection.description} leading-relaxed mb-16 max-w-3xl mx-auto text-center`}>
            Every day, potential customers search for alternatives to your competitors. Without optimized comparison pages, you're missing out on high-intent traffic.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-12 text-left">
            {/* 步骤 1 - 搜索框 */}
            <div className="flex flex-col items-center">
              <div className="w-full flex justify-center items-center mb-8 h-72">
                <div className={`w-full max-w-md ${currentTheme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg border ${currentTheme === 'dark' ? 'border-slate-600' : 'border-gray-300'} shadow-xl transition-all duration-300 p-6 sm:p-8 overflow-hidden text-sm font-sans flex flex-col justify-center h-full relative`}>
                  <div className={`transition-opacity duration-300 ${postClickPhase === 'spinning' || postClickPhase === 'showingArrow' ? 'opacity-0' : 'opacity-100'}`}>
                    <div className={`flex items-center justify-between w-full mb-4 pb-2 border-b ${currentTheme === 'dark' ? 'border-slate-600' : 'border-gray-200'}`}>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full opacity-70"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full opacity-70"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full opacity-70"></div>
                      </div>
                      <div className={`w-1/3 h-2 ${currentTheme === 'dark' ? 'bg-slate-600' : 'bg-gray-200'} rounded-sm opacity-70`}></div>
                    </div>
                    <div className={`flex items-center border ${currentTheme === 'dark' ? 'border-slate-600' : 'border-gray-300'} rounded-full px-3 py-1.5 shadow-sm ${currentTheme === 'dark' ? 'bg-slate-700' : 'bg-white'} w-full hover:shadow-md transition-shadow duration-200`}>
                      <img src="/icons/google-logo.png" alt="Google logo" className="h-5 w-auto mr-3 flex-shrink-0" />
                      <input type="text" value={animatedInputValue} className={`flex-grow outline-none ${currentTheme === 'dark' ? 'text-white' : 'text-gray-800'} text-sm sm:text-base mr-2 bg-transparent min-w-0`} readOnly />
                      <div
                        className={`ml-auto p-2 rounded-full transition-all duration-200 ease-in-out transform cursor-pointer flex items-center justify-center flex-shrink-0 ${
                          isSearching
                            ? 'bg-blue-700 scale-90 shadow-inner'
                            : 'bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md hover:shadow-lg'
                        }`}
                        style={{ width: '36px', height: '36px' }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className={`spinner-container ${postClickPhase === 'spinning' ? 'visible' : ''}`}>
                    <div className="spinner"></div>
                  </div>

                  <div className={`arrow-container ${postClickPhase === 'showingArrow' ? 'visible' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-cyan-300 bg-cyan-900/50 rounded-full mb-3">Step 1</span>
                <h3 className={`text-2xl sm:text-3xl font-bold ${pageTheme.contentSections.sectionTitle} mb-4`}>User searches for alternatives</h3>
                <p className={`${pageTheme.contentSections.sectionSubtitle} text-lg`}>High-intent prospects actively seeking options beyond your competitors</p>
              </div>
            </div>

            {/* 步骤 2 - 竞争对手结果 */}
            <div className="flex flex-col items-center">
              <div className="w-full flex justify-center items-center mb-8 h-72">
                <div className={`w-full max-w-md ${currentTheme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg border border-green-500/50 transition-transform duration-300 p-4 overflow-hidden text-sm font-sans relative h-full`}>
                  <div className={`flex items-center border ${currentTheme === 'dark' ? 'border-slate-600' : 'border-gray-200'} rounded-full px-3 py-1.5 mb-2 ${currentTheme === 'dark' ? 'bg-slate-700' : 'bg-white'} opacity-70`}>
                    <img src="/icons/google-logo.png" alt="Google logo" className="h-4 w-auto mr-2" />
                    <input type="text" value="wix alternative" className={`flex-grow outline-none ${currentTheme === 'dark' ? 'text-white' : 'text-gray-600'} text-xs bg-transparent`} readOnly />
                  </div>
                  <div className="space-y-2 opacity-80">
                    <div className={`border border-green-400 rounded p-2 ${currentTheme === 'dark' ? 'bg-green-900/30' : 'bg-green-50/50'}`}>
                      <span className={`text-xs ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} block truncate`}>https://www.competitor-a.com/</span>
                      <a href="#" onClick={(e: React.MouseEvent) => e.preventDefault()} className="text-blue-700 text-base sm:text-lg hover:underline block truncate font-medium">
                        Competitor A - The Easy Website Builder
                      </a>
                      <p className={`${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-xs leading-tight mt-0.5`}>
                        Build stunning websites quickly with Competitor A. Perfect for small businesses looking for a Wix alternative...
                      </p>
                    </div>
                    <div className={`border border-green-400 rounded p-2 ${currentTheme === 'dark' ? 'bg-green-900/30' : 'bg-green-50/50'}`}>
                      <span className={`text-xs ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} block truncate`}>https://www.competitor-b.io/features</span>
                      <a href="#" onClick={(e: React.MouseEvent) => e.preventDefault()} className="text-blue-700 text-base sm:text-lg hover:underline block truncate font-medium">
                        Compare Competitor B vs Wix | Find Your Fit
                      </a>
                      <p className={`${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-xs leading-tight mt-0.5`}>
                        See how Competitor B stacks up against Wix. More design freedom and better pricing options available...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-green-400 bg-green-900/50 rounded-full mb-3">Step 2</span>
                <h3 className={`text-2xl sm:text-3xl font-bold ${pageTheme.contentSections.sectionTitle} mb-4`}>Competitor results dominate</h3>
                <p className={`${pageTheme.contentSections.sectionSubtitle} text-lg`}>Your competitors control the narrative and capture these valuable leads</p>
              </div>
            </div>

            {/* 步骤 3 - 错失机会 */}
            <div className="flex flex-col items-center">
              <div className="w-full flex justify-center items-center mb-8 h-72">
                <div className={`w-full max-w-md ${currentTheme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg border border-red-500/50 shadow-lg shadow-red-500/10 transition-transform duration-300 p-4 overflow-hidden text-sm font-sans relative h-full`}>
                  <div className={`flex items-center border ${currentTheme === 'dark' ? 'border-slate-600' : 'border-gray-200'} rounded-full px-3 py-1.5 mb-3 shadow-sm ${currentTheme === 'dark' ? 'bg-slate-700' : 'bg-white'} opacity-70`}>
                    <img src="/icons/google-logo.png" alt="Google logo" className="h-4 w-auto mr-2" />
                    <input type="text" value="wix alternative" className={`flex-grow outline-none ${currentTheme === 'dark' ? 'text-white' : 'text-gray-600'} text-xs bg-transparent`} readOnly />
                  </div>
                  <div className="space-y-3 opacity-40 blur-[2px]">
                    <div>
                      <span className={`text-xs ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} block truncate`}>https://www.competitor-a.com/</span>
                      <a href="#" onClick={(e: React.MouseEvent) => e.preventDefault()} className="text-blue-700 text-base sm:text-lg hover:underline block truncate font-medium">
                        Competitor A - The Easy Website Builder
                      </a>
                      <p className={`${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-xs leading-tight mt-0.5`}>
                        Build stunning websites quickly with Competitor A. Perfect for small businesses looking for a Wix alternative...
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-red-900/20 to-transparent flex items-center justify-center p-4">
                    <div className={`text-center p-4 ${currentTheme === 'dark' ? 'bg-slate-700/90' : 'bg-white/90'} backdrop-blur-sm rounded-lg shadow-xl border border-red-300 max-w-xs`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600 mx-auto mb-2 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-700 font-semibold text-base">You're Invisible Here!</p>
                      <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mt-1`}>Competitors rank, but without an Alternative Page, you miss out.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-300 bg-purple-900/50 rounded-full mb-3">Step 3</span>
                <h3 className={`text-2xl sm:text-3xl font-bold ${pageTheme.contentSections.sectionTitle} mb-4`}>Your opportunity vanishes</h3>
                <p className={`${pageTheme.contentSections.sectionSubtitle} text-lg`}>Without targeted alternative pages, you miss these conversion-ready prospects</p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className={`text-xl font-medium ${pageTheme.contentSections.sectionSubtitle} mb-6`}>
              Don't let competitors steal your potential customers.
            </p>
            <button
              onClick={scrollToTop}
              className={`inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white ${currentTheme === 'dark' 
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentTheme === 'dark' ? 'focus:ring-offset-slate-900 focus:ring-cyan-500' : 'focus:ring-offset-white focus:ring-blue-500'} transition-all duration-300 ease-in-out transform hover:scale-105 ${currentTheme === 'dark' ? 'hover:shadow-cyan-500/30' : 'hover:shadow-blue-500/30'}`}
            >
              Generate Alternative Pages Now
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .spinner-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }
        
        .spinner-container.visible {
          opacity: 1;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .arrow-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }
        
        .arrow-container.visible {
          opacity: 1;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
} 