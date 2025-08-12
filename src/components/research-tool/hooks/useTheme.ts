// 对应老代码中的主题配置hook，100%还原主题系统
// 保持与原始代码完全一致的主题配置逻辑

import { useState, useEffect } from 'react';
import type { ThemeStyles } from '@/types/research-tool';

// 对应老代码中的主题配置数据结构
const themeConfigs = {
  dark: {
    researchTool: {
      background: 'linear-gradient(180deg, #121826 0%, #030810 100%)',
      taskStatusBar: {
        background: 'bg-[#0F1E45]',
        currentStepText: 'text-gray-300',
        expandedContent: {
          stepItem: {
            activeText: 'text-gray-200',
            inactiveText: 'text-gray-500',
            timeActiveText: 'text-blue-300',
            timeInactiveText: 'text-gray-500'
          },
          indicator: {
            completed: 'bg-green-400',
            current: 'border-blue-400/30 border-t-blue-400',
            pending: 'bg-gray-600'
          },
          summary: {
            text: 'text-gray-400',
            countText: 'text-gray-400'
          }
        }
      },
      inputArea: {
        borderRadius: '16px',
        background: '#0B1421',
        boxShadow: '0px 4px 16px 0px rgba(255, 255, 255, 0.08)',
        text: 'text-white',
        placeholder: 'placeholder-gray-400',
        caretColor: '#fff'
      },
      sendButton: {
        borderRadius: '10px',
        background: 'linear-gradient(101deg, #336FFF 20.01%, #A671FC 56.73%, #F5894F 92.85%)',
        border: '1px solid #D9E3F0',
        shadow: 'none'
      },
      rightPanel: {
        container: {
          border: '1px solid rgba(255, 255, 255, 0.15)',
          background: '#0B1421',
          borderBottom: 'border-b border-gray-300/20'
        },
        mainTabs: {
          active: {
            background: '#0F1E45',
            text: '#357BF7',
            border: 'transparent'
          },
          inactive: {
            background: 'transparent',
            text: 'rgba(255, 255, 255, 0.50)'
          }
        }
      },
      apiDetailModal: {
        background: '#0B1421',
        border: 'border-white/15',
        borderRadius: '24px',
        backdropFilter: 'blur(30px)',
        boxShadow: '0px 6px 24px 0px rgba(255, 255, 255, 0.12)',
        header: {
          borderBottom: 'border-b border-slate-600/30',
          title: 'text-slate-100',
          closeButton: 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
        },
        statusBar: {
          background: 'bg-slate-700/30',
          borderBottom: 'border-b border-slate-600/20',
          text: '#D9D9D9'
        },
        content: {
          text: '#D9D9D9',
          scrollbarColor: '#4a5568 transparent'
        },
        codeBlock: {
          background: 'bg-slate-700/50',
          border: 'border border-slate-600/30',
          text: '#D9D9D9'
        }
      },
      agentProcessing: {
        background: 'bg-white/[0.04]',
        border: 'border-white/[0.05]',
        titleText: 'text-white'
      },
      agentMessage: {
        text: 'text-white',
        loadingDots: 'bg-gray-300'
      },
      systemMessage: {
        background: 'bg-slate-800/80',
        text: 'text-white',
        shadow: 'shadow-xl',
        border: 'border-slate-600/40',
        hoverShadow: 'hover:shadow-slate-500/20',
        iconColor: 'text-slate-400',
        timestampColor: 'text-slate-400',
        codeBackground: 'bg-slate-700/50',
        codeText: 'text-slate-200'
      },
      userMessage: {
        text: 'text-white',
        background: 'bg-white/10'
      },
      successMessage: {
        border: '1px solid rgba(34, 197, 94, 0.2)',
        background: 'rgba(34, 197, 94, 0.1)',
        text: 'text-green-300',
        iconBackground: 'bg-green-500',
        buttonBackground: 'rgba(34, 197, 94, 0.2)',
        buttonText: 'rgba(34, 197, 94, 0.8)',
        buttonHoverBackground: 'rgba(34, 197, 94, 0.3)',
        buttonHoverText: 'rgba(34, 197, 94, 1)'
      },
      warningMessage: {
        text: 'text-yellow-400'
      },
      errorMessage: {
        text: 'text-red-400',
        background: 'bg-red-900/20',
        border: 'border-red-700/40',
        buttonBackground: 'bg-red-800/40',
        buttonText: 'text-red-200',
        buttonHoverBackground: 'hover:bg-red-700/50'
      },
      infoMessage: {
        text: 'text-blue-400'
      },
      sitemapButton: {
        background: 'linear-gradient(285.22deg, rgba(59, 130, 246, 0.15) 44.35%, rgba(150, 56, 7, 0.8) 92.26%)',
        backgroundClass: 'bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-blue-700/90',
        hoverBackgroundClass: 'hover:from-blue-500/95 hover:via-indigo-500/95 hover:to-blue-600/95',
        text: 'text-white',
        shadow: 'shadow-xl hover:shadow-2xl hover:shadow-blue-500/25'
      },
      messageCollapse: {
        gradientOverlay: 'bg-gradient-to-b from-transparent to-slate-800/90',
        borderRadius: 'rounded-lg'
      },
      pagesGrid: {
        title: {
          text: 'text-slate-300',
          background: 'bg-slate-800/20',
          border: 'border-l-2 border-slate-500',
          highlight: 'text-slate-200'
        },
        pageCard: {
          borderRadius: '12px',
          border: '1px solid transparent',
          borderSelected: '1px solid var(--Color-, #357BF7)',
          borderHover: '1px solid var(--Gray-Blue-7, #5A6B93)',
          background: '#292F3B'
        },
        checkbox: {
          accentColor: '#357BF7'
        },
        pageTitle: {
          text: 'text-white'
        },
        pageDescription: {
          text: 'text-gray-400'
        },
        tdkLabel: {
          text: 'text-gray-500'
        },
        keywordTag: {
          borderRadius: '6px',
          background: 'var(--Gray-Blue-8, #415071)',
          text: 'var(--Color-, #FFF)'
        },
        competitorTag: {
          borderRadius: '6px',
          background: 'var(--Gray-Blue-8, #415071)',
          text: 'var(--Color-, #FFF)'
        },
        metrics: {
          label: 'text-gray-400',
          value: 'text-white'
        },
        viewButton: {
          borderRadius: '12px',
          background: 'linear-gradient(115deg, #AA450B -2.53%, #231109 26.44%, #10132D 48.59%, #101834 68.22%, #0D47A6 96.36%)',
          boxShadow: '0px 2px 5px 0px rgba(255, 255, 255, 0.10)',
          text: 'var(--Color-, #FFF)'
        },
        pageLimitNotice: {
          background: 'bg-slate-800/60',
          border: 'border-slate-700/50',
          text: 'text-sm text-white/80',
          button: {
            shadow: 'shadow-md hover:shadow-lg',
            background: 'bg-gradient-to-r from-blue-500 to-indigo-600',
            backgroundHover: 'hover:from-blue-600 hover:to-indigo-700',
            text: 'text-white',
            border: 'border-blue-600/50',
            scale: 'hover:scale-105'
          }
        }
      },
      setBrandColorButton: {
        background: 'bg-[rgba(34,42,65,1)]',
        text: 'text-white/80'
      },
      secondaryButton: 'bg-slate-700 hover:bg-slate-600'
    }
  },
  light: {
    researchTool: {
      background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
      taskStatusBar: {
        background: 'bg-[#EFF4FF]',
        currentStepText: 'text-gray-700',
        expandedContent: {
          stepItem: {
            activeText: 'text-gray-800',
            inactiveText: 'text-gray-500',
            timeActiveText: 'text-blue-600',
            timeInactiveText: 'text-gray-500'
          },
          indicator: {
            completed: 'bg-green-500',
            current: 'border-blue-500/30 border-t-blue-500',
            pending: 'bg-gray-400'
          },
          summary: {
            text: 'text-gray-600',
            countText: 'text-gray-800'
          }
        }
      },
      inputArea: {
        borderRadius: '16px',
        background: '#FFFFFF',
        boxShadow: '0px 4px 16px 0px rgba(0, 0, 0, 0.08)',
        text: 'text-black',
        placeholder: 'placeholder-gray-500',
        caretColor: '#000'
      },
      sendButton: {
        borderRadius: '10px',
        background: 'linear-gradient(101deg, #336FFF 20.01%, #A671FC 56.73%, #F5894F 92.85%)',
        border: '1px solid #D9E3F0',
        shadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
      },
      rightPanel: {
        container: {
          border: '1px solid rgba(217, 227, 240, 1)',
          background: '#FFFFFF',
          borderBottom: 'border-b border-gray-200'
        },
        mainTabs: {
          active: {
            background: '#EFF4FF',
            text: '#357BF7',
            border: '1px solid #D9E3F0'
          },
          inactive: {
            background: 'transparent',
            text: 'rgba(102, 102, 102, 0.80)'
          }
        }
      },
      setBrandColorButton: {
        background: 'bg-[#EFF4FF]',
        text: 'text-[#666666]'
      },
      systemMessage: {
        background: 'bg-gray-100/80',
        text: 'text-gray-800',
        shadow: 'shadow-lg',
        border: 'border-gray-300/40',
        hoverShadow: 'hover:shadow-gray-400/20',
        iconColor: 'text-gray-500',
        timestampColor: 'text-gray-500',
        codeBackground: 'bg-gray-200/50',
        codeText: 'text-gray-700'
      },
      userMessage: {
        text: 'text-gray-800',
        background: 'bg-gray-100/10'
      },
      successMessage: {
        border: '1px solid rgba(34, 197, 94, 0.2)',
        background: 'rgba(34, 197, 94, 0.1)',
        text: 'text-green-700',
        iconBackground: 'bg-green-500',
        buttonBackground: 'rgba(34, 197, 94, 0.2)',
        buttonText: 'rgba(34, 197, 94, 0.8)',
        buttonHoverBackground: 'rgba(34, 197, 94, 0.3)',
        buttonHoverText: 'rgba(34, 197, 94, 1)'
      },
      warningMessage: {
        text: 'text-yellow-600'
      },
      errorMessage: {
        text: 'text-red-600',
        background: 'bg-red-100/20',
        border: 'border-red-300/40',
        buttonBackground: 'bg-red-200/40',
        buttonText: 'text-red-700',
        buttonHoverBackground: 'hover:bg-red-300/50'
      },
      infoMessage: {
        text: 'text-blue-600'
      },
      secondaryButton: 'bg-gray-600 hover:bg-gray-500'
    }
  }
};

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    // 默认使用dark主题，也可以从localStorage读取用户偏好
    const savedTheme = localStorage.getItem('research-tool-theme') as 'dark' | 'light' || 'dark';
    setCurrentTheme(savedTheme);
  }, []);

  const getThemeConfig = (component: string): any => {
    if (!isHydrated) {
      // 在hydration之前返回默认的dark主题配置
      return themeConfigs.dark.researchTool;
    }
    return themeConfigs[currentTheme]?.researchTool || themeConfigs.dark.researchTool;
  };

  const switchTheme = (theme: 'dark' | 'light') => {
    setCurrentTheme(theme);
    localStorage.setItem('research-tool-theme', theme);
  };

  return {
    currentTheme,
    isHydrated,
    getThemeConfig,
    switchTheme
  };
};