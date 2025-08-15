// 主题配置文件
import React from 'react';

export const themeConfig = {
  header: {
    dark: {
      // 导航栏背景
      navBackground: 'bg-gradient-to-b from-slate-950 to-black',
      navBorder: 'border-slate-800/50',
      
      // 背景装饰
      decorativeBackground: 'bg-[radial-gradient(circle_at_top_left,_#22d3ee10_0%,_transparent_60%)]',
      
      // 粒子效果颜色
      particleColors: {
        cyan: 'bg-cyan-500/30',
        purple: 'bg-purple-500/30', 
        rose: 'bg-rose-400/30'
      },
      
      // Logo和文字
      logoText: 'text-white',
      logoSubText: 'text-white',
      logoHover: 'group-hover:scale-105',
      
      // 导航菜单
      menuText: 'bg-clip-text text-transparent bg-gradient-to-r from-gray-300 to-gray-400',
      menuHover: 'hover:from-cyan-400 hover:to-purple-400',
      menuBorder: 'bg-gradient-to-r from-cyan-400 to-purple-400',
      
      // 用户头像和按钮
      userAvatar: 'bg-gradient-to-r from-blue-500/30 to-indigo-500/30 border-2 border-blue-400/30',
      userAvatarHover: 'group-hover:border-blue-400/60',
      userText: 'text-white group-hover:text-blue-200',
      userSubText: 'text-gray-400 group-hover:text-gray-300',
      
      // 认证按钮
      signInButton: 'text-white bg-slate-800/50 hover:bg-slate-700/60 border-slate-700/50 hover:border-cyan-500/30',
      googleButton: 'text-white bg-slate-800/50 hover:bg-slate-700/60 border-slate-700/50 hover:border-purple-500/30',
      
      // 移动端菜单
      mobileMenuBackground: 'bg-slate-900/95',
      mobileMenuBorder: 'border-slate-800/50',
      mobileMenuText: 'text-gray-300 hover:text-cyan-400',
      mobileMenuBorderTop: 'border-slate-700/50',
      mobileMenuButton: 'text-gray-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/60',
      
      // 主题切换按钮
      themeSwitchButton: 'text-gray-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/60 border-slate-700/50',
      themeSwitchIcon: 'text-yellow-400',
      
      // 弹窗和模态框
      tooltipBackground: 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-600/50',
      tooltipHeaderBackground: 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-slate-600/30',
      cardBackground: 'bg-slate-800/30 border-slate-600/30',
      
      // 图标颜色
      iconColors: {
        primary: 'text-blue-400',
        secondary: 'text-indigo-400', 
        tertiary: 'text-sky-400',
        warning: 'text-yellow-400'
      }
    },
    
    light: {
      // 导航栏背景 - 纯白背景
      navBackground: 'bg-white',
      navBorder: 'border-gray-200',
      
      // 背景装饰 - 移除装饰效果
      decorativeBackground: '',
      
      // 粒子效果颜色 - 移除粒子效果
      particleColors: {
        cyan: '',
        purple: '',
        rose: ''
      },
      
      // Logo和文字
      logoText: 'text-gray-800',
      logoSubText: 'text-gray-800',
      logoHover: 'group-hover:scale-105',
      
      // 导航菜单
      menuText: 'text-[#595959]',
      menuHover: 'hover:text-blue-600',
      menuBorder: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      
      // 用户头像和按钮
      userAvatar: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-2 border-blue-400/40',
      userAvatarHover: 'group-hover:border-blue-500/60',
      userText: 'text-gray-800 group-hover:text-blue-700',
      userSubText: 'text-gray-500 group-hover:text-gray-600',
      
      // 认证按钮
      signInButton: 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300 hover:border-blue-400/50 shadow-sm',
      googleButton: 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300 hover:border-indigo-400/50 shadow-sm',
      
      // 移动端菜单
      mobileMenuBackground: 'bg-white',
      mobileMenuBorder: 'border-gray-200',
      mobileMenuText: 'text-gray-600 hover:text-blue-600',
      mobileMenuBorderTop: 'border-gray-200',
      mobileMenuButton: 'text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-50',
      
      // 主题切换按钮
      themeSwitchButton: 'text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-50 border-gray-300 shadow-sm',
      themeSwitchIcon: 'text-gray-600',
      
      // 弹窗和模态框
      tooltipBackground: 'bg-white border-gray-300 shadow-xl',
      tooltipHeaderBackground: 'bg-gray-50 border-gray-200',
      cardBackground: 'bg-gray-50 border-gray-200',
      
      // 图标颜色
      iconColors: {
        primary: 'text-blue-600',
        secondary: 'text-indigo-600',
        tertiary: 'text-sky-600', 
        warning: 'text-orange-500'
      }
    }
  },

  sidebar: {
    dark: {
      // 侧边栏背景
      background: 'bg-slate-950/95',
      border: 'border-slate-800/50',
      
      // 折叠按钮
      collapseButton: {
        background: 'bg-slate-800/50',
        textDefault: 'text-gray-300',
        textHover: 'hover:text-white',
        iconDefault: '#9CA3AF',
        iconHover: '#FFFFFF'
      },
      
      // Todo链接
      todoLink: {
        background: 'bg-slate-800/30',
        border: 'border-slate-700/50',
        text: 'text-gray-300'
      },
      
      // 导航项
      navItem: {
        activeBg: 'bg-slate-800/50',
        activeBorder: 'border-slate-600/50',
        activeShadow: 'inset 3px 3px 6px rgba(255, 255, 255, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.2)',
        hoverBg: 'hover:bg-slate-800/30',
        activeText: 'text-white',
        inactiveText: 'text-gray-400'
      },
      
      // 分割线
      divider: 'border-slate-700/50',
      
      // 新聊天按钮
      newChatButton: {
        background: 'bg-slate-800/50',
        text: 'text-gray-300',
        textHover: 'hover:text-white'
      },
      
      // 聊天历史
      chatHistory: {
        dateIcon: 'text-gray-500',
        dateText: 'text-gray-500',
        chatItemActive: 'bg-slate-800/50 border border-slate-600/50',
        chatItemInactive: 'hover:bg-slate-800/30',
        chatTextActive: 'text-white',
        chatTextInactive: 'text-gray-400',
        deleteButton: 'text-gray-500 hover:text-red-400 hover:bg-red-500/10',
        noChatText: 'text-gray-500'
      },
      
      // 移动端导航
      mobileNav: {
        background: 'bg-slate-950/95',
        border: 'border-slate-800/50',
        textActive: 'text-blue-400',
        textInactive: 'text-gray-400'
      }
    },
    
    light: {
      // 侧边栏背景
      background: 'bg-white/95',
      border: 'border-gray-200/70',
      
      // 折叠按钮
      collapseButton: {
        background: 'bg-gray-100/80',
        textDefault: 'text-gray-600',
        textHover: 'hover:text-gray-800',
        iconDefault: '#6B7280',
        iconHover: '#374151'
      },
      
      // Todo链接
      todoLink: {
        background: 'bg-[#EBF1FD]',
        border: 'border-[#D9E3F0]',
        text: 'text-[#8C8C8C]'
      },
      
      // 导航项
      navItem: {
        activeBg: 'bg-white',
        activeBorder: 'border-[rgba(56,102,177,0.16)]',
        activeShadow: '0px 2px 10px 0px rgba(0, 0, 0, 0.10), 0px -8px 8px 2px #FFF inset, 0px 4px 30px 0px rgba(24, 59, 116, 0.20) inset',
        hoverBg: 'hover:bg-gray-50/80',
        activeText: 'text-[#262626]',
        inactiveText: 'text-[#8C8C8C]'
      },
      
      // 分割线
      divider: 'border-gray-200/70',
      
      // 新聊天按钮
      newChatButton: {
        background: 'bg-[#357BF7]',
        text: 'text-white',
        textHover: 'hover:text-white'
      },
      
      // 聊天历史
      chatHistory: {
        dateIcon: 'text-[#BFBFBF]',
        dateText: 'text-[#BFBFBF]',
        chatItemActive: 'bg-[#EBF1FD] border border-[#D9E3F0]',
        chatItemInactive: 'hover:bg-gray-50/80',
        chatTextActive: 'text-[#262626]',
        chatTextInactive: 'text-[#8C8C8C]',
        deleteButton: 'text-gray-400 hover:text-red-500 hover:bg-red-50',
        noChatText: 'text-gray-500'
      },
      
      // 移动端导航
      mobileNav: {
        background: 'bg-white/95',
        border: 'border-gray-200/70',
        textActive: 'text-blue-600',
        textInactive: 'text-gray-500'
      }
    }
  },

  researchTool: {
    dark: {
      scrollbar: {
        webkit: {
          width: '6px',
          height: '6px',
          trackBackground: 'rgba(15, 23, 42, 0.1)',
          thumbBackground: 'rgba(59, 130, 246, 0.5)',
          thumbHoverBackground: 'rgba(59, 130, 246, 0.8)',
          borderRadius: '10px'
        },
        // Firefox 滚动条
        firefox: {
          width: 'thin',
          color: 'rgba(59, 130, 246, 0.5) rgba(15, 23, 42, 0.1)'
        }
      },

      // 整体背景
      background: 'bg-gradient-to-b from-[#121826] to-[#030810]',
      
      // 用户消息气泡
      userMessage: {
        background: 'bg-white/10',
        text: 'text-white',
        border: 'border-transparent'
      },
      
      // AI Agent 消息
      agentMessage: {
        text: 'text-white',
        loadingDots: 'bg-gray-300'  // Dark模式下的加载球颜色
      },

      systemMessage: {
        background: 'bg-slate-800/80',
        text: 'text-white',
        border: 'border-slate-600/40',
        iconColor: 'text-slate-400',
        timestampColor: 'text-slate-400',
        shadow: 'shadow-xl',
        hoverShadow: 'hover:shadow-slate-500/20'
      },
      
      // Agent Processing 区域
      agentProcessing: {
        background: 'bg-white/[0.04]',
        border: 'border-white/[0.05]',
        titleText: 'text-white'
      },
      
      // Task Status Bar
      taskStatusBar: {
        background: 'bg-[#0F1E45]',
        currentStepText: 'text-gray-300',
        // 添加展开状态的样式
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
      
      // Set Brand Color 按钮
      setBrandColorButton: {
        background: 'bg-[rgba(34,42,65,1)]', 
        text: 'text-white/80'
      },
      
      // 输入框
      inputArea: {
        text: 'text-white',
        placeholder: 'placeholder-gray-400',
        caretColor: '#fff',
        border: '1px solid linear-gradient(285.22deg, rgba(255, 255, 255, 0.15) 44.35%, #963807 92.26%)',
        background: '#0B1421',
        borderRadius: '16px',
        boxShadow: '0px 4px 16px 0px rgba(255, 255, 255, 0.08)'
      },
      
      // 右边容器
      rightPanel: {
        container: {
          background: '#0B1421',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderBottom: 'border-gray-300/20'
        },
        
        // 主标签页 (Generated Pages, Sitemap)
        mainTabs: {
          active: {
            background: '#0F1E45',
            text: '#357BF7',
            border: 'transparent'
          },
          inactive: {
            background: 'transparent',
            text: 'rgba(255, 255, 255, 0.50)',
            border: 'transparent'
          }
        },
        
        // 页面标签页
        pageTabs: {
          active: {
            background: 'bg-slate-800/90',
            text: 'text-slate-200',
            border: 'border-t border-slate-600',
            borderStyle: 'border-t border-slate-600'
          },
          inactive: {
            background: 'bg-slate-900/60',
            text: 'text-slate-500',
            border: 'transparent',
            borderStyle: 'transparent'
          }
        },
        
        pageTabsContainer: {
          borderBottom: 'border-b border-white/15'  // Dark 模式
        },

        urlBar: {
          background: '#0B1421',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          text: 'rgba(255, 255, 255, 0.50)'
        },
        actionButtons: {
          background: '#D6E2FF'
        },
        
        // 右侧面板收起状态的小方块
        collapsedToggle: {
          background: '#0B1421',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0px 6px 24px 0px rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(30px)',
          iconColor: '#9CA3AF',
          iconHoverColor: '#FFFFFF'
        },
        
        // Codes 标签页
        codesTab: {
          // 容器滚动条
          scrollbarColor: '#4A5568 transparent',
          
          // 标题文字
          titleText: 'text-green-400',
          
          // Copy Code 按钮
          copyButton: {
            text: 'text-gray-400',
            textHover: 'hover:text-gray-300',
            background: 'hover:bg-gray-600/50'
          },
          
          // 代码容器
          codeContainer: {
            background: 'bg-gradient-to-br from-gray-800/80 to-gray-900/80',
            border: 'border-gray-600/30',
            text: '#e2e8f0',
            scrollbarColor: '#4a5568 transparent'
          },
          
          // 渐变遮罩
          gradientMask: 'bg-gradient-to-t from-gray-800/80 to-transparent',
          
          // 空状态文字
          emptyStateText: 'text-gray-400'
        }
      },
      
      // 成功提示消息
      successMessage: {
        background: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid rgba(34, 197, 94, 0.2)',
        text: 'text-green-300',
        iconBackground: 'bg-green-500',
        buttonBackground: 'rgba(34, 197, 94, 0.2)',
        buttonText: 'rgba(34, 197, 94, 0.8)',
        buttonHoverBackground: 'rgba(34, 197, 94, 0.3)',
        buttonHoverText: 'rgba(34, 197, 94, 1)'
      },
      
      // Sitemap 按钮
      sitemapButton: {
        background: 'linear-gradient(285.22deg, rgba(59, 130, 246, 0.15) 44.35%, rgba(150, 56, 7, 0.8) 92.26%)',
        backgroundClass: 'bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-blue-700/90',
        hoverBackgroundClass: 'hover:from-blue-500/95 hover:via-indigo-500/95 hover:to-blue-600/95',
        text: 'text-white',
        shadow: 'shadow-xl hover:shadow-2xl hover:shadow-blue-500/25'
      },

      sendButton: {
        background: 'linear-gradient(115deg, #AA450B -2.53%, #231109 26.44%, #10132D 48.59%, #101834 68.22%, #0D47A6 96.36%)',
        border: '1px solid rgba(255, 255, 255, 0.20)',
        shadow: '0px 2px 5px 0px rgba(255, 255, 255, 0.10)',
        borderRadius: '12px'
      },

      // 消息折叠渐变遮罩
      messageCollapse: {
        gradientOverlay: 'bg-gradient-to-b from-transparent to-slate-800/90',
        borderRadius: 'rounded-lg'
      },

      // API详情弹窗
      apiDetailModal: {
        // 背景和遮罩
        background: '#0B1421',
        border: 'border-white/15',
        borderRadius: '24px',
        backdropFilter: 'blur(30px)',
        boxShadow: '0px 6px 24px 0px rgba(255, 255, 255, 0.12)',
        
        // 标题栏
        header: {
          background: 'transparent',
          borderBottom: 'border-b border-slate-600/30',
          title: 'text-slate-100',
          closeButton: 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
        },
        
        // 状态信息栏
        statusBar: {
          background: 'bg-slate-700/30',
          borderBottom: 'border-b border-slate-600/20',
          text: '#D9D9D9'
        },
        
        // 内容区域
        content: {
          background: 'transparent',
          text: '#D9D9D9',
          scrollbarColor: '#4a5568 transparent'
        },
        
        // 代码块和预格式化文本
        codeBlock: {
          background: 'bg-slate-700/50',
          border: 'border border-slate-600/30',
          text: '#D9D9D9'
        }
      },
    
      // Pages Grid 消息类型
      pagesGrid: {
        // 容器
        container: {
          background: 'transparent'
        },
        
        // 标题区域
        title: {
          text: 'text-white',
          highlight: 'text-slate-200',
          background: 'bg-slate-800/20',
          border: 'border-l-2 border-slate-500'
        },
        
        // 页面卡片
        pageCard: {
          background: 'bg-gray-800',
          border: 'border border-transparent',
          borderHover: 'border border-gray-600',
          borderSelected: 'border border-blue-600',
          borderRadius: '12px'
        },
        
        // 页面标题
        pageTitle: {
          text: 'text-white'
        },
        
        // 页面描述 (新增)
        pageDescription: {
          text: 'text-gray-300',
          background: 'bg-slate-800/30',
          border: 'border-slate-700/30'
        },
        
        // TDK 标签 (新增)
        tdkLabel: {
          text: 'text-gray-400',
          highlight: 'text-cyan-400'
        },
        
        // 复选框
        checkbox: {
          accentColor: '#357BF7'
        },
        
        // View按钮
        viewButton: {
          background: 'bg-gradient-to-r from-orange-600 via-red-600 to-blue-600',
          boxShadow: 'shadow-md',
          text: 'text-white',
          borderRadius: '12px'
        },
        
        // 指标文本
        metrics: {
          label: 'text-gray-400',
          value: 'text-white'
        },
        
        // 关键词标签
        keywordTag: {
          background: 'bg-gray-700',
          text: 'text-white',
          borderRadius: '6px'
        },
        
        // 竞争对手标签
        competitorTag: {
          background: 'bg-gray-700',
          text: 'text-white',
          borderRadius: '6px'
        },
        
        // 页面限制提示
        pageLimitNotice: {
          background: 'bg-slate-800/60',
          border: 'border-slate-700/50',
          text: 'text-sm text-white/80',
          button: {
            background: 'bg-gradient-to-r from-blue-500 to-indigo-600',
            backgroundHover: 'hover:from-blue-600 hover:to-indigo-700',
            text: 'text-white',
            border: 'border-blue-600/50',
            shadow: 'shadow-md hover:shadow-lg',
            scale: 'hover:scale-105'
          }
        }
      }
    },
    
    light: {
      scrollbar: {
        // WebKit 滚动条 (Chrome, Safari, Edge) 
        webkit: {
          width: '6px',
          height: '6px',
          trackBackground: 'rgba(243, 244, 246, 0.8)',
          thumbBackground: 'rgba(107, 114, 128, 0.5)',
          thumbHoverBackground: 'rgba(107, 114, 128, 0.8)',
          borderRadius: '10px'
        },
        // Firefox 滚动条
        firefox: {
          width: 'thin',
          color: 'rgba(107, 114, 128, 0.5) rgba(243, 244, 246, 0.8)'
        }
      },

      // 整体背景
      background: 'bg-white',
      
      // 用户消息气泡
      userMessage: {
        background: 'bg-[#EBF1FD]',
        text: 'text-[#222]',
        border: 'border-transparent'
      },
      
      // AI Agent 消息
      agentMessage: {
        text: 'text-[#222]',
        loadingDots: 'bg-gray-600'  // Light模式下的加载球颜色
      },

      systemMessage: {
        background: 'bg-gray-100/80',
        text: 'text-gray-800',
        border: 'border-gray-300/60',
        iconColor: 'text-gray-500',
        timestampColor: 'text-gray-500',
        shadow: 'shadow-lg',
        hoverShadow: 'hover:shadow-gray-300/30'
      },
      
      // Agent Processing 区域
      agentProcessing: {
        background: 'bg-[#EBF1FD]',
        border: 'border-[#D9E3F0]',
        titleText: 'text-[#222]'
      },
      
      // Task Status Bar
      taskStatusBar: {
        background: 'bg-[#EFF4FF]',
        currentStepText: 'text-[#8C8C8C]',
        // 添加展开状态的样式
        expandedContent: {
          stepItem: {
            activeText: 'text-gray-800',
            inactiveText: 'text-gray-500',
            timeActiveText: 'text-blue-600',
            timeInactiveText: 'text-gray-500'
          },
          indicator: {
            completed: 'bg-green-500',
            current: 'border-blue-500/50 border-t-blue-500',
            pending: 'bg-gray-400'
          },
          summary: {
            text: 'text-gray-600',
            countText: 'text-gray-700'
          }
        }
      },
      
      // Set Brand Color 按钮
      setBrandColorButton: {
        background: 'bg-[#EFF4FF]',
        text: 'text-[#404040]'
      },
      
      // 输入框
      inputArea: {
        text: 'text-black',
        placeholder: 'placeholder-gray-500',
        caretColor: '#000',
        borderRadius: '16px',
        border: '1px solid #D9E3F0',
        background: '#FFF',
        boxShadow: '0px 4px 16px 0px rgba(255, 255, 255, 0.08)'
      },
      
      // 右边容器
      rightPanel: {
        container: {
          background: '#FFF',
          border: '1px solid #D9E3F0',
          borderBottom: 'border-b border-[rgba(217,227,240,1)]'
        },
        
        // 主标签页 (Generated Pages, Sitemap)
        mainTabs: {
          active: {
            background: '#EBF1FD',
            text: '#262626',
            border: '1px solid #D9E3F0'
          },
          inactive: {
            background: 'transparent',
            text: '#8C8C8C',
            border: 'transparent'
          }
        },
        
        // 页面标签页
        pageTabs: {
          active: {
            background: 'bg-[#D9ECFF]',
            text: 'text-[#222]',
            border: 'border-t border-r border-l border-[#D9E3F0]',
            borderStyle: 'border-t border-r border-l border-[#D9E3F0]',
            boxShadow: '-1px 0px 0px 0px #F0F0F0 inset, 0px 1px 0px 0px #F0F0F0 inset, 1px 0px 0px 0px #F0F0F0 inset'
          },
          inactive: {
            background: 'bg-white',
            text: 'text-[#8C8C8C]',
            border: 'border-t border-r border-l border-[#D9E3F0]',
            borderStyle: 'border-t border-r border-l border-[#D9E3F0]',
            boxShadow: '-1px 0px 0px 0px #F0F0F0 inset, 0px 1px 0px 0px #F0F0F0 inset, 1px 0px 0px 0px #F0F0F0 inset'
          }
        },
        
        pageTabsContainer: {
          borderBottom: 'border-b border-[rgba(217,227,240,1)]'  // Light 模式
        },

        // URL 地址栏
        urlBar: {
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid #D9E3F0',
          text: 'text-gray-700'
        },
        
        // 预览和编辑按钮
        actionButtons: {
          background: 'bg-[#D6E2FF]',
          hoverBackground: 'hover:bg-[#C5D6FF]'
        },
        
        // 右侧面板收起状态的小方块
        collapsedToggle: {
          background: '#FFFFFF',
          border: '1px solid #D9E3F0',
          boxShadow: '0px 4px 16px 0px rgba(0, 0, 0, 0.08)',
          backdropFilter: 'none',
          iconColor: '#6B7280',
          iconHoverColor: '#374151'
        },
        
        // Codes 标签页
        codesTab: {
          // 容器滚动条
          scrollbarColor: '#CBD5E0 transparent',
          
          // 标题文字
          titleText: 'text-green-600',
          
          // Copy Code 按钮
          copyButton: {
            text: 'text-gray-600',
            textHover: 'hover:text-gray-800',
            background: 'hover:bg-gray-200/50'
          },
          
          // 代码容器
          codeContainer: {
            background: 'bg-gradient-to-br from-gray-50/80 to-gray-100/80',
            border: 'border-gray-300/30',
            text: '#374151',
            scrollbarColor: '#CBD5E0 transparent'
          },
          
          // 渐变遮罩
          gradientMask: 'bg-gradient-to-t from-gray-100/80 to-transparent',
          
          // 空状态文字
          emptyStateText: 'text-gray-600'
        }
      },
      
      // 成功提示消息
      successMessage: {
        background: '#E8F5E8',
        border: '1px solid #4CAF50',
        text: 'text-[#2E7D32]',
        iconBackground: 'bg-[#4CAF50]',
        buttonBackground: '#4CAF50',
        buttonText: '#fff',
        buttonHoverBackground: '#45A049',
        buttonHoverText: '#fff'
      },
      
      // Sitemap 按钮
      sitemapButton: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundClass: 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700',
        hoverBackgroundClass: 'hover:from-blue-500 hover:via-purple-500 hover:to-blue-600',
        text: 'text-white',
        shadow: 'shadow-xl hover:shadow-2xl hover:shadow-purple-500/25'
      },

      sendButton: {
        background: 'linear-gradient(101deg, #336FFF 20.01%, #A671FC 56.73%, #F5894F 92.85%)',
        border: '1px solid #D9E3F0',
        shadow: 'none',
        borderRadius: '10px'
      },

      // 消息折叠渐变遮罩
      messageCollapse: {
        gradientOverlay: 'bg-gradient-to-b from-transparent to-white/90',
        borderRadius: 'rounded-lg'
      },

      // API详情弹窗 - 修改为 Light 模式样式
      apiDetailModal: {
        // 背景和遮罩
        background: '#FFFFFF',
        border: 'border-gray-300',
        borderRadius: '24px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0px 6px 24px 0px rgba(0, 0, 0, 0.12)',
        
        // 标题栏
        header: {
          background: 'transparent',
          borderBottom: 'border-b border-gray-200',
          title: 'text-gray-900',
          closeButton: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        },
        
        // 状态信息栏
        statusBar: {
          background: 'bg-gray-50',
          borderBottom: 'border-b border-gray-200',
          text: '#374151'
        },
        
        // 内容区域
        content: {
          background: 'transparent',
          text: '#374151',
          scrollbarColor: '#CBD5E0 transparent'
        },
        
        // 代码块和预格式化文本
        codeBlock: {
          background: 'bg-gray-50',
          border: 'border border-gray-200',
          text: '#374151'
        }
      },
      pagesGrid: {
        // 容器
        container: {
          background: 'transparent'
        },
        
        // 标题区域
        title: {
          text: 'text-black',
          highlight: 'text-gray-800',
          background: 'bg-gray-100',
          border: 'border-l-2 border-gray-400'
        },
        
        // 页面卡片
        pageCard: {
          background: 'bg-white',
          border: 'border border-gray-300',
          borderHover: 'border border-gray-400',
          borderSelected: 'border border-blue-600',
          borderRadius: '12px'
        },
        
        // 页面标题
        pageTitle: {
          text: 'text-black'
        },
        
        // 页面描述 (新增)
        pageDescription: {
          text: 'text-gray-700',
          background: 'bg-gray-100',
          border: 'border-gray-300'
        },
        
        // TDK 标签 (新增)
        tdkLabel: {
          text: 'text-gray-600',
          highlight: 'text-blue-600'
        },
        
        // 复选框
        checkbox: {
          accentColor: '#357BF7'
        },
        
        // View按钮
        viewButton: {
          background: 'bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500',
          boxShadow: 'shadow-md',
          text: 'text-white',
          borderRadius: '12px'
        },
        
        // 指标文本
        metrics: {
          label: 'text-gray-600',
          value: 'text-black'
        },
        
        // 关键词标签
        keywordTag: {
          background: 'bg-gray-200',
          text: 'text-gray-800',
          borderRadius: '6px'
        },
        
        // 竞争对手标签
        competitorTag: {
          background: 'bg-gray-200',
          text: 'text-gray-800',
          borderRadius: '6px'
        },
        
        // 页面限制提示
        pageLimitNotice: {
          background: 'bg-white/90',
          border: 'border-gray-300/60',
          text: 'text-sm text-gray-700',
          button: {
            background: 'bg-gradient-to-r from-blue-600 to-indigo-600',
            backgroundHover: 'hover:from-blue-700 hover:to-indigo-700',
            text: 'text-white',
            border: 'border-blue-500/30',
            shadow: 'shadow-sm hover:shadow-md',
            scale: 'hover:scale-105'
          }
        }
      }
    }
  },

  // 页面级别主题配置
  pages: {
    dark: {
      // 页面主要背景
      pageBackground: 'bg-gray-900',
      
      // 加载页面
      loadingBackground: 'bg-gray-900',
      loadingText: 'text-gray-300',
      loadingSpinner: 'border-purple-500 border-t-transparent',
      
      // 主标题区域
      heroSection: {
        background: 'bg-gradient-to-b from-slate-900 to-slate-800',
        titlePrimary: 'bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent',
        titleSecondary: 'text-gray-300',
        titleAccent: 'bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent',
        description: 'text-gray-300',
        shimmerEffect: 'bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20',
        decorativeGlow1: 'bg-[radial-gradient(circle_at_top_left,_#3b82f615_0%,_transparent_60%)]',
        decorativeGlow2: 'bg-[radial-gradient(circle_at_bottom_right,_#06b6d415_0%,_transparent_60%)]'
      },
      
      // 内容区域
      contentSections: {
        background: 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900',
        backgroundAlt: 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950',
        
        // 标题
        sectionTitle: 'text-white',
        sectionTitleGradient: 'bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent',
        sectionSubtitle: 'text-gray-300',
        
        // 卡片
        cardBackground: 'bg-slate-800/50',
        cardBackgroundHover: 'hover:bg-slate-800/50',
        cardBorder: 'border-slate-700/50',
        cardBorderHover: 'hover:border-slate-600/50',
        cardShadow: 'shadow-lg hover:shadow-2xl',
        cardTitle: 'text-white',
        cardTitleHover: 'group-hover:text-cyan-300',
        cardDescription: 'text-gray-300',
        cardDescriptionHover: 'group-hover:text-gray-200',
        
        // 图标
        iconGradients: {
          cyan: 'from-cyan-500 to-blue-600',
          purple: 'from-purple-500 to-indigo-600',
          emerald: 'from-emerald-500 to-teal-600',
          orange: 'from-orange-500 to-red-600',
          pink: 'from-pink-500 to-rose-600',
          amber: 'from-amber-500 to-orange-600'
        },
        
        // 装饰效果
        decorativeGlow1: 'bg-[radial-gradient(circle_at_top_left,_#ef444415_0%,_transparent_60%)]',
        decorativeGlow2: 'bg-[radial-gradient(circle_at_bottom_right,_#f9731615_0%,_transparent_60%)]',
        decorativeGlow3: 'bg-[radial-gradient(circle_at_bottom_left,_#a78bfa15_0%,_transparent_60%)]',
        decorativeGlow4: 'bg-[radial-gradient(circle_at_top_right,_#22d3ee15_0%,_transparent_60%)]'
      },
      
      // 比较表格
      comparisonTable: {
        background: 'bg-slate-800/30',
        border: 'border-slate-700/50',
        headerBackground: 'bg-slate-800/60',
        headerText: 'text-white',
        headerTextSecondary: 'text-slate-300',
        headerTextAccent: 'text-cyan-300',
        rowBackground: 'bg-slate-900/40',
        rowHover: 'hover:bg-slate-800/50',
        cellText: 'text-white',
        cellTextSecondary: 'text-slate-400',
        cellTextAccent: 'text-cyan-400',
        conclusionBackground: 'bg-slate-800/70',
        conclusionBorder: 'border-purple-400',
        conclusionHighlight: 'bg-purple-600'
      },
      
      // 问题展示区域
      problemSection: {
        stepBackground: 'bg-slate-800/50',
        stepBorder: 'border-slate-700/50',
        stepBorderHover: 'hover:border-slate-600/50',
        stepTitle: 'text-white',
        stepDescription: 'text-gray-300',
        resultBackground: 'bg-red-900/20',
        resultBorder: 'border-red-700/30',
        resultShadow: 'shadow-red-500/10 hover:shadow-red-500/20',
        resultTitle: 'text-red-400',
        resultDescription: 'text-red-300',
        quoteBackground: 'bg-slate-800/50',
        quoteBorder: 'border-slate-600/50',
        quoteText: 'text-gray-300'
      }
    },
    
    light: {
      // 页面主要背景
      pageBackground: 'bg-white',
      
      // 加载页面
      loadingBackground: 'bg-white',
      loadingText: 'text-gray-700',
      loadingSpinner: 'border-blue-500 border-t-transparent',
      
      // 主标题区域
      heroSection: {
        background: 'bg-gradient-to-b from-gray-50 to-white',
        titlePrimary: 'bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent',
        titleSecondary: 'text-gray-800',
        titleAccent: 'bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent',
        description: 'text-gray-700',
        shimmerEffect: 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10',
        decorativeGlow1: 'bg-[radial-gradient(circle_at_top_left,_#3b82f620_0%,_transparent_60%)]',
        decorativeGlow2: 'bg-[radial-gradient(circle_at_bottom_right,_#06b6d420_0%,_transparent_60%)]'
      },
      
      // 内容区域
      contentSections: {
        background: 'bg-gradient-to-b from-gray-50 via-white to-gray-50',
        backgroundAlt: 'bg-gradient-to-b from-white via-gray-50 to-white',
        
        // 标题
        sectionTitle: 'text-gray-900',
        sectionTitleGradient: 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
        sectionSubtitle: 'text-gray-700',
        
        // 卡片
        cardBackground: 'bg-white/80',
        cardBackgroundHover: 'hover:bg-white/90',
        cardBorder: 'border-gray-200/70',
        cardBorderHover: 'hover:border-gray-300/80',
        cardShadow: 'shadow-sm hover:shadow-lg',
        cardTitle: 'text-gray-900',
        cardTitleHover: 'group-hover:text-blue-700',
        cardDescription: 'text-gray-600',
        cardDescriptionHover: 'group-hover:text-gray-800',
        
        // 图标
        iconGradients: {
          cyan: 'from-cyan-600 to-blue-700',
          purple: 'from-purple-600 to-indigo-700',
          emerald: 'from-emerald-600 to-teal-700',
          orange: 'from-orange-600 to-red-700',
          pink: 'from-pink-600 to-rose-700',
          amber: 'from-amber-600 to-orange-700'
        },
        
        // 装饰效果
        decorativeGlow1: 'bg-[radial-gradient(circle_at_top_left,_#ef444420_0%,_transparent_60%)]',
        decorativeGlow2: 'bg-[radial-gradient(circle_at_bottom_right,_#f9731620_0%,_transparent_60%)]',
        decorativeGlow3: 'bg-[radial-gradient(circle_at_bottom_left,_#a78bfa20_0%,_transparent_60%)]',
        decorativeGlow4: 'bg-[radial-gradient(circle_at_top_right,_#22d3ee20_0%,_transparent_60%)]'
      },
      
      // 比较表格
      comparisonTable: {
        background: 'bg-white/80',
        border: 'border-gray-200/70',
        headerBackground: 'bg-gray-50/80',
        headerText: 'text-gray-900',
        headerTextSecondary: 'text-gray-700',
        headerTextAccent: 'text-blue-700',
        rowBackground: 'bg-white/60',
        rowHover: 'hover:bg-gray-50/80',
        cellText: 'text-gray-900',
        cellTextSecondary: 'text-gray-600',
        cellTextAccent: 'text-blue-600',
        conclusionBackground: 'bg-gray-50/90',
        conclusionBorder: 'border-blue-400',
        conclusionHighlight: 'bg-blue-600'
      },
      
      // 问题展示区域
      problemSection: {
        stepBackground: 'bg-white/80',
        stepBorder: 'border-gray-200/70',
        stepBorderHover: 'hover:border-gray-300/80',
        stepTitle: 'text-gray-900',
        stepDescription: 'text-gray-700',
        resultBackground: 'bg-red-50/80',
        resultBorder: 'border-red-200/70',
        resultShadow: 'shadow-red-100/50 hover:shadow-red-200/60',
        resultTitle: 'text-red-700',
        resultDescription: 'text-red-600',
        quoteBackground: 'bg-gray-50/80',
        quoteBorder: 'border-gray-200/70',
        quoteText: 'text-gray-700'
      }
    }
  },

  // Footer组件主题配置
  footer: {
    dark: {
      // 主要背景
      background: 'bg-gradient-to-b from-slate-950 to-black',
      
      // 装饰效果
      decorativeGlow1: 'bg-[radial-gradient(circle_at_top_right,_#22d3ee10_0%,_transparent_60%)]',
      decorativeGlow2: 'bg-[radial-gradient(circle_at_bottom_left,_#a78bfa10_0%,_transparent_60%)]',
      
      // 粒子效果
      particleColors: {
        cyan: 'bg-cyan-500/30',
        purple: 'bg-purple-500/30',
        rose: 'bg-rose-400/30'
      },
      
      // 顶部边框
      topBorder: 'bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent',
      
      // Logo和品牌
      logoHover: 'group-hover:opacity-80',
      brandText: 'text-white',
      description: 'text-gray-400',
      
      // 链接区域
      sectionTitle: 'text-white',
      linkText: 'text-gray-400',
      linkHover: 'hover:text-cyan-400',
      
      // Trustpilot评分卡片
      trustpilotCard: {
        background: 'bg-gradient-to-br from-slate-900/50 to-slate-800/30',
        border: 'border-slate-700/50',
        decorativeBorder: 'bg-gradient-to-r from-[#00B67A]/20 via-cyan-500/10 to-[#00B67A]/20',
        ratingNumber: 'text-white',
        ratingSubtext: 'text-gray-400',
        starColor: 'text-[#00B67A]',
        brandText: 'text-[#00B67A]',
        excellentText: 'text-gray-400',
        divider: 'bg-gradient-to-r from-transparent via-slate-600/50 to-transparent'
      },
      
      // 分割线
      divider: 'bg-gradient-to-r from-transparent via-slate-700/50 to-transparent',
      
      // 社交媒体图标
      socialIcon: 'text-gray-500',
      socialIconHover: 'hover:text-white hover:scale-110',
      socialIconGlow: 'group-hover:opacity-100 blur-md bg-gradient-to-r from-cyan-500 to-purple-500',
      
      // 版权信息
      copyright: 'text-gray-500'
    },
    
    light: {
      // 主要背景
      background: 'bg-gradient-to-b from-gray-50 to-white',
      
      // 装饰效果
      decorativeGlow1: 'bg-[radial-gradient(circle_at_top_right,_#3b82f620_0%,_transparent_60%)]',
      decorativeGlow2: 'bg-[radial-gradient(circle_at_bottom_left,_#8b5cf620_0%,_transparent_60%)]',
      
      // 粒子效果
      particleColors: {
        cyan: 'bg-blue-500/20',
        purple: 'bg-indigo-500/20',
        rose: 'bg-pink-400/20'
      },
      
      // 顶部边框
      topBorder: 'bg-gradient-to-r from-transparent via-blue-400/50 to-transparent',
      
      // Logo和品牌
      logoHover: 'group-hover:opacity-70',
      brandText: 'text-gray-900',
      description: 'text-gray-600',
      
      // 链接区域
      sectionTitle: 'text-gray-900',
      linkText: 'text-gray-600',
      linkHover: 'hover:text-blue-600',
      
      // Trustpilot评分卡片
      trustpilotCard: {
        background: 'bg-gradient-to-br from-white/80 to-gray-50/60',
        border: 'border-gray-200/70',
        decorativeBorder: 'bg-gradient-to-r from-[#00B67A]/15 via-blue-500/8 to-[#00B67A]/15',
        ratingNumber: 'text-gray-900',
        ratingSubtext: 'text-gray-600',
        starColor: 'text-[#00B67A]',
        brandText: 'text-[#00B67A]',
        excellentText: 'text-gray-600',
        divider: 'bg-gradient-to-r from-transparent via-gray-300/50 to-transparent'
      },
      
      // 分割线
      divider: 'bg-gradient-to-r from-transparent via-gray-300/50 to-transparent',
      
      // 社交媒体图标
      socialIcon: 'text-gray-500',
      socialIconHover: 'hover:text-gray-900 hover:scale-110',
      socialIconGlow: 'group-hover:opacity-100 blur-md bg-gradient-to-r from-blue-500 to-indigo-500',
      
      // 版权信息
      copyright: 'text-gray-600'
    }
  },

  // 登录弹窗主题配置
  loginModal: {
    dark: {
      // 背景和遮罩
      overlayBackground: 'bg-black bg-opacity-70 backdrop-blur-sm',
      modalBackground: 'bg-gray-900',
      modalBorder: 'border border-indigo-500/30',
      
      // 标题和文本
      title: 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600',
      label: 'text-gray-300',
      text: 'text-white',
      description: 'text-gray-400',
      
      // 输入框
      input: 'bg-gray-800 border-gray-700 text-white focus:ring-indigo-500 focus:border-transparent',
      inputPlaceholder: 'placeholder-gray-400',
      
      // 按钮
      primaryButton: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white',
      googleButton: 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/60 hover:border-purple-500/30 text-white',
      linkButton: 'text-indigo-400 hover:text-indigo-300',
      closeButton: 'text-gray-400 hover:text-gray-200',
      
      // 状态和消息
      errorBackground: 'bg-red-900/50 text-red-300',
      successBackground: 'bg-green-900/50 text-green-300',
      
      // 加载状态
      loadingSpinner: 'text-blue-400'
    },
    light: {
      // 背景和遮罩
      overlayBackground: 'bg-black bg-opacity-40 backdrop-blur-sm',
      modalBackground: 'bg-white',
      modalBorder: 'border border-gray-200',
      
      // 标题和文本
      title: 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600',
      label: 'text-gray-700',
      text: 'text-gray-900',
      description: 'text-gray-600',
      
      // 输入框
      input: 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500',
      inputPlaceholder: 'placeholder-gray-500',
      
      // 按钮
      primaryButton: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white',
      googleButton: 'bg-gray-100 border-gray-300 hover:bg-gray-200 hover:border-blue-500/30 text-gray-900',
      linkButton: 'text-blue-600 hover:text-blue-500',
      closeButton: 'text-gray-500 hover:text-gray-700',
      
      // 状态和消息
      errorBackground: 'bg-red-50 text-red-700',
      successBackground: 'bg-green-50 text-green-700',
      
      // 加载状态
      loadingSpinner: 'text-blue-600'
    }
  },
  
  // 发布页面弹窗主题配置
  publishModal: {
    dark: {
      // 背景和遮罩
      overlayBackground: 'bg-black bg-opacity-70 backdrop-blur-sm',
      modalBackground: 'rgba(15, 23, 42, 0.95)',
      modalBorder: 'border border-slate-700/60',
      
      // 标题栏
      headerBackground: 'bg-slate-900/90',
      headerBorder: 'border-slate-700/60',
      headerTitle: 'text-slate-100',
      
      // 内容区域
      contentBackground: 'rgba(22, 31, 49, 0.98)',
      sectionBackground: 'bg-slate-900/60',
      sectionBorder: 'border border-slate-700/50',
      
      // 文本颜色
      description: 'text-slate-300',
      
      // 步骤指示器
      stepNumber: 'bg-slate-600 ring-slate-500/50 text-white',
      stepNumberCompleted: 'bg-gradient-to-r from-green-600 to-emerald-600 ring-green-500/50 text-white',
      stepTitle: 'text-slate-300',
      
      // 状态标签
      publishedStatus: 'bg-green-900/50 text-green-300',
      unpublishedStatus: 'bg-slate-700/50 text-slate-400',
      
      // 输入框和表单
      input: 'bg-slate-800 border-slate-600 text-slate-200 focus:border-cyan-500',
      inputPrefix: 'text-gray-400',
      textarea: 'bg-slate-800 border-slate-600 text-slate-200 focus:border-cyan-500',
      
      // 按钮
      primaryButton: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-green-500/50',
      dangerButton: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-red-500/50',
      secondaryButton: 'bg-blue-600 hover:bg-blue-700 text-white',
      configButton: 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white border-slate-500/50',
      closeButton: 'text-slate-400 hover:text-slate-200',
      
      // 链接和URL显示
      urlDisplay: 'bg-slate-800 border-slate-600',
      urlLink: 'text-cyan-300 hover:text-cyan-200',
      
      // 通知和提示
      seoNotice: 'bg-green-900/30 border-green-700/50 text-green-300',
      seoWarning: 'bg-yellow-900/30 border-yellow-700/50 text-yellow-300',
      
      // Step 2 特定样式配置
      step2: {
        // 单选按钮组（未选中状态）
        radioButton: 'rgba(255, 255, 255, 0.15)',
        // Subdomain 输入框
        subdomainInput: '#0B1421',
        subdomainInputBorder: 'rgba(255, 255, 255, 0.16)',
        // Add Subdomain 按钮
        addSubdomainButton: 'var(--Color-, #357BF7)',
        addSubdomainButtonText: 'var(--Color-, #357BF7)',
        // Subdomain 列表背景
        subdomainListBackground: 'rgba(255, 255, 255, 0.04)',
        subdomainListBorder: 'rgba(255, 255, 255, 0.05)',
        // Verified 标签
        verifiedTagBackground: 'var(--black-cyberklick-2, #0F3417)',
        verifiedTagText: 'var(--light-cy-6, #00BB1F)',
      },
      
      // 单选按钮组
      radioGroup: {
        button: 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600',
        buttonSelected: 'bg-cyan-600 border-cyan-500 text-white hover:bg-cyan-500'
      }
    },
    
    light: {
      // 背景和遮罩
      overlayBackground: 'bg-black bg-opacity-40 backdrop-blur-sm',
      modalBackground: 'rgba(255, 255, 255, 0.95)',
      modalBorder: 'border border-gray-300',
      
      // 标题栏
      headerBackground: 'bg-gray-50/90',
      headerBorder: 'border-gray-300',
      headerTitle: 'text-gray-900',
      
      // 内容区域
      contentBackground: 'rgba(249, 250, 251, 0.98)',
      sectionBackground: 'bg-white/80',
      sectionBorder: 'border border-gray-200',
      
      // 文本颜色
      description: 'text-gray-600',
      
      // 步骤指示器
      stepNumber: 'bg-blue-700 text-white',
      stepNumberCompleted: 'bg-green-600 text-white',
      stepNumberInactive: 'bg-gray-500 text-white',
      stepTitle: 'text-gray-900',
      stepTitleInactive: 'text-gray-500',
      
      // 输入框和表单
      input: 'bg-white border-gray-300 text-gray-900 focus:border-blue-500',
      inputPrefix: 'text-gray-500',
      textarea: 'bg-white border-gray-300 text-gray-900 focus:border-blue-500',
      
      // 按钮
      primaryButton: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white border-green-400/50',
      dangerButton: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white border-red-400/50',
      secondaryButton: 'bg-blue-500 hover:bg-blue-600 text-white',
      configButton: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white border-gray-400/50',
      closeButton: 'text-gray-500 hover:text-gray-700',
      
      // 链接和URL显示
      urlDisplay: 'bg-gray-50 border-gray-300',
      urlLink: 'text-blue-600 hover:text-blue-500',
      
      // 通知和提示
      seoNotice: 'bg-green-50 border-green-200 text-green-700',
      seoWarning: 'bg-blue-50 border-blue-200 text-blue-700',
      
      // 单选按钮组
      radioGroup: {
        button: 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200',
        buttonSelected: 'bg-blue-500 border-blue-400 text-white hover:bg-blue-400'
      }
    }
  },
  
  // 发布设置弹窗主题配置
  publishSettingsModal: {
    dark: {
      // 背景和遮罩
      overlayBackground: 'bg-black bg-opacity-60 backdrop-blur-lg',
      modalBackground: 'linear-gradient(145deg, rgba(22, 31, 49, 0.98), rgba(17, 24, 39, 0.95))',
      modalBorder: 'border border-indigo-500/15',
      
      // 标题栏
      headerBackground: 'linear-gradient(145deg, rgba(30, 41, 59, 0.98), rgba(22, 31, 49, 0.95))',
      headerBorder: 'border-slate-700/30',
      headerTitle: 'text-white',
      
      // 卡片和容器
      cardBackground: 'rgba(30, 41, 59, 0.4)',
      cardBorder: 'border border-indigo-500/15',
      cardBackdrop: 'backdrop-filter blur-10',
      
      // 步骤指示器
      stepNumber: 'bg-indigo-600/80 text-white',
      stepNumberCompleted: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white',
      stepNumberInactive: 'bg-slate-700/50 text-slate-400',
      stepTitle: 'text-white',
      stepTitleInactive: 'text-gray-400',
      
      // 表单元素
      input: 'bg-slate-700/70 border-slate-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500',
      select: 'bg-slate-800 border-slate-600 text-slate-200 focus:border-cyan-500',
      
      // 按钮
      primaryButton: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white',
      successButton: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white',
      dangerButton: 'bg-red-600 hover:bg-red-700 text-white border-red-800/30',
      secondaryButton: 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-white',
      
      // 状态和标签
      successTag: 'bg-green-800/30 text-green-400',
      warningTag: 'bg-yellow-800/30 text-yellow-400',
      infoTag: 'bg-blue-800/30 text-blue-400',
      
      // 通知和警告
      successAlert: 'bg-green-900/30 border-green-700/40 text-green-300',
      warningAlert: 'bg-yellow-900/20 border-yellow-700/30 text-yellow-200',
      infoAlert: 'bg-blue-900/30 border-blue-700/40 text-blue-300',
      errorAlert: 'bg-red-900/20 border-red-700/30 text-red-200',
      
      // 表格
      tableHeader: 'bg-slate-800/70 text-slate-300 border-slate-700/30',
      tableCell: 'bg-slate-800/40 border-slate-700/20 text-slate-200',
      tableHover: 'hover:bg-slate-700/50',
      
      // 代码和预格式化文本
      codeBackground: 'bg-slate-900/80 border-slate-700/50',
      codeText: 'text-cyan-300',
      preBackground: 'bg-slate-900/60 border-slate-700/30',
      
      // 单选按钮组
      radioGroup: {
        wrapper: 'publish-mode-radio-group-new',
        button: 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600',
        buttonSelected: 'bg-cyan-600 border-cyan-500 text-white hover:bg-cyan-500'
      },
      
      // 折叠面板
      collapse: {
        header: 'bg-slate-800/50 text-slate-200',
        content: 'bg-slate-800/30 text-slate-300'
      }
    },
    light: {
      // 背景和遮罩
      overlayBackground: 'bg-black bg-opacity-40 backdrop-blur-lg',
      modalBackground: 'linear-gradient(145deg, rgba(249, 250, 251, 0.98), rgba(243, 244, 246, 0.95))',
      modalBorder: 'border border-blue-500/15',
      
      // 标题栏
      headerBackground: 'linear-gradient(145deg, rgba(243, 244, 246, 0.98), rgba(229, 231, 235, 0.95))',
      headerBorder: 'border-gray-300',
      headerTitle: 'text-gray-900',
      
      // 卡片和容器
      cardBackground: 'rgba(255, 255, 255, 0.8)',
      cardBorder: 'border border-blue-500/15',
      cardBackdrop: 'backdrop-filter blur-10',
      
      // 步骤指示器
      stepNumber: 'bg-blue-700 text-white',
      stepNumberCompleted: 'bg-green-600 text-white',
      stepNumberInactive: 'bg-gray-500 text-white',
      stepTitle: 'text-gray-900',
      stepTitleInactive: 'text-gray-500',
      
      // 表单元素
      input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500',
      select: 'bg-white border-gray-300 text-gray-900 focus:border-blue-500',
      
      // 按钮
      primaryButton: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white',
      successButton: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white',
      dangerButton: 'bg-red-500 hover:bg-red-600 text-white border-red-400/30',
      secondaryButton: 'bg-gray-200 hover:bg-gray-300 border-gray-300 text-gray-900',
      
      // 状态和标签
      successTag: 'bg-green-100 text-green-700',
      warningTag: 'bg-yellow-100 text-yellow-700',
      infoTag: 'bg-blue-100 text-blue-700',
      
      // 通知和警告
      successAlert: 'bg-green-50 border-green-200 text-green-700',
      warningAlert: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      infoAlert: 'bg-blue-50 border-blue-200 text-blue-700',
      errorAlert: 'bg-red-50 border-red-200 text-red-700',
      
      // 表格
      tableHeader: 'bg-gray-100 text-gray-700 border-gray-300',
      tableCell: 'bg-white border-gray-200 text-gray-900',
      tableHover: 'hover:bg-gray-50',
      
      // 代码和预格式化文本
      codeBackground: 'bg-gray-100 border-gray-300',
      codeText: 'text-blue-600',
      preBackground: 'bg-gray-50 border-gray-200',
      
      // 单选按钮组
      radioGroup: {
        wrapper: 'publish-mode-radio-group-new',
        button: 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200',
        buttonSelected: 'bg-blue-500 border-blue-400 text-white hover:bg-blue-400'
      },
      
      // 折叠面板
      collapse: {
        header: 'bg-gray-100 text-gray-700',
        content: 'bg-gray-50 text-gray-700'
      }
    }
  },

  blueprint: {
    dark: {
      // 容器背景
      container: {
        background: 'bg-transparent'
      },
      
      // 加载状态
      loading: {
        glowBackground: 'bg-gradient-to-r from-blue-400 to-indigo-500',
        title: 'text-slate-200',
        subtitle: 'text-slate-400'
      },
      
      // 无网站数据状态
      noWebsite: {
        iconBackground: 'bg-gradient-to-r from-amber-400 to-orange-500',
        iconColor: 'text-white',
        title: 'text-slate-200',
        description: 'text-slate-400'
      },
      
      // 视图模式标签
      viewModeLabel: 'text-slate-400',
      
      // 筛选按钮
      filterButton: {
        active: 'bg-slate-700 text-white',
        inactive: 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300',
        badge: 'bg-slate-600/50',
        faqActive: 'bg-blue-700/50 text-blue-200',
        faqInactive: 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/40 hover:text-blue-300',
        faqBadge: 'bg-blue-700/50',
        bestActive: 'bg-green-700/50 text-green-200',
        bestInactive: 'bg-green-900/30 text-green-400 hover:bg-green-800/40 hover:text-green-300',
        bestBadge: 'bg-green-700/50',
        alternativeActive: 'bg-purple-700/50 text-purple-200',
        alternativeInactive: 'bg-purple-900/30 text-purple-400 hover:bg-purple-800/40 hover:text-purple-300',
        alternativeBadge: 'bg-purple-700/50'
      },
      
      // 列表容器
      listContainer: {
        background: 'bg-transparent'
      },
      
      // 空状态
      emptyState: {
        text: 'text-slate-400'
      },
      
      // 页面节点（列表项）
      pageNode: {
        background: 'bg-slate-800/20',
        border: 'border-slate-700/30',
        hover: 'hover:bg-slate-800/30',
        iconBackground: 'bg-slate-700/20',
        iconColor: 'text-slate-400',
        title: 'text-slate-200',
        statusGenerated: 'bg-emerald-500/20 text-emerald-400',
        statusNotGenerated: 'bg-amber-500/20 text-amber-400',
        borderTop: 'border-slate-700/30',
        metricLabel: 'text-slate-400',
        trafficValue: 'text-emerald-400',
        difficultyValue: 'text-amber-400',
        keywordTag: 'bg-slate-700/50 text-slate-300',
        competitorTag: 'bg-red-900/30 text-red-300'
      },
      
      // 站点地图节点
      sitemapNode: {
        statusGenerated: 'border-emerald-500/40 bg-gradient-to-br from-emerald-900/30 to-emerald-800/10',
        statusNotGenerated: 'border-amber-500/40 bg-gradient-to-br from-amber-900/30 to-amber-800/10',
        headerBackground: 'bg-slate-900/50',
        headerBorder: 'border-slate-700/30',
        title: 'text-slate-200',
        trafficValue: 'text-emerald-400',
        difficultyValue: 'text-amber-400',
        metricLabel: 'text-slate-400',
        contentBackground: 'bg-slate-800/10',
        sectionTitle: 'text-slate-400',
        keywordTag: 'bg-slate-700/50 text-slate-300',
        competitorTag: 'bg-red-900/30 text-red-300',
        emptyState: 'text-slate-500',
        statusTagGenerated: 'bg-emerald-500/20 text-emerald-400',
        statusTagNotGenerated: 'bg-amber-500/20 text-amber-400'
      },
      
      // 线框控制器
      wireframeControls: {
        label: 'text-slate-400',
        container: 'bg-slate-800/50 border-slate-700/30',
        button: 'bg-slate-700/50 hover:bg-blue-500/30 text-slate-300 hover:text-white border border-slate-600/30',
        scaleText: 'text-slate-300'
      },
      
      // 站点地图视图
      sitemapView: {
        container: 'bg-transparent'
      }
    },
    
    light: {
      // 容器背景
      container: {
        background: 'bg-transparent'
      },
      
      // 加载状态
      loading: {
        glowBackground: 'bg-gradient-to-r from-blue-500 to-indigo-600',
        title: 'text-gray-800',
        subtitle: 'text-gray-600'
      },
      
      // 无网站数据状态
      noWebsite: {
        iconBackground: 'bg-gradient-to-r from-amber-500 to-orange-600',
        iconColor: 'text-white',
        title: 'text-gray-800',
        description: 'text-gray-600'
      },
      
      // 视图模式标签
      viewModeLabel: 'text-gray-600',
      
      // 筛选按钮
      filterButton: {
        active: 'bg-gray-200 text-gray-900',
        inactive: 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800',
        badge: 'bg-gray-300',
        faqActive: 'bg-blue-100 text-blue-800',
        faqInactive: 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700',
        faqBadge: 'bg-blue-200',
        bestActive: 'bg-green-100 text-green-800',
        bestInactive: 'bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700',
        bestBadge: 'bg-green-200',
        alternativeActive: 'bg-purple-100 text-purple-800',
        alternativeInactive: 'bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700',
        alternativeBadge: 'bg-purple-200'
      },
      
      // 列表容器
      listContainer: {
        background: 'bg-transparent'
      },
      
      // 空状态
      emptyState: {
        text: 'text-gray-500'
      },
      
      // 页面节点（列表项）
      pageNode: {
        background: 'bg-white/80',
        border: 'border-gray-200',
        hover: 'hover:bg-white/90 hover:border-gray-300',
        iconBackground: 'bg-gray-100',
        iconColor: 'text-gray-600',
        title: 'text-gray-900',
        statusGenerated: 'bg-green-100 text-green-700',
        statusNotGenerated: 'bg-yellow-100 text-yellow-700',
        borderTop: 'border-gray-200',
        metricLabel: 'text-gray-600',  // 修改：从 text-gray-500 改为 text-gray-600，提高对比度
        trafficValue: 'text-green-700', // 修改：从 text-green-600 改为 text-green-700，提高对比度
        difficultyValue: 'text-orange-600', // 修改：从 text-yellow-600 改为 text-orange-600，提高可见性
        keywordTag: 'bg-gray-200 text-gray-800', // 修改：提高对比度
        competitorTag: 'bg-red-100 text-red-800' // 修改：提高对比度
      },
      
      // 站点地图节点
      sitemapNode: {
        statusGenerated: 'border-green-300 bg-gradient-to-br from-green-50 to-green-100/50',
        statusNotGenerated: 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100/50',
        headerBackground: 'bg-gray-50',
        headerBorder: 'border-gray-200',
        title: 'text-gray-900',
        trafficValue: 'text-green-700', // 修改：提高对比度
        difficultyValue: 'text-orange-600', // 修改：提高可见性
        metricLabel: 'text-gray-600', // 修改：提高对比度
        contentBackground: 'bg-white/50',
        sectionTitle: 'text-gray-700', // 修改：提高对比度
        keywordTag: 'bg-gray-200 text-gray-800', // 修改：提高对比度
        competitorTag: 'bg-red-100 text-red-800', // 修改：提高对比度
        emptyState: 'text-gray-500',
        statusTagGenerated: 'bg-green-100 text-green-700',
        statusTagNotGenerated: 'bg-yellow-100 text-yellow-700'
      },
      
      // 线框控制器
      wireframeControls: {
        label: 'text-gray-600',
        container: 'bg-white/80 border-gray-300',
        button: 'bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 border border-gray-300',
        scaleText: 'text-gray-700'
      },
      
      // 站点地图视图
      sitemapView: {
        container: 'bg-transparent'
      }
    }
  },

  // 品牌资产模态框主题配置
  brandAssets: {
    dark: {
      // 背景和遮罩
      overlayBackground: 'bg-black bg-opacity-60 backdrop-blur-sm',
      modalBackground: 'bg-gray-900',
      modalBorder: 'border border-indigo-500/30',
      
      // 标题栏
      headerBackground: 'bg-transparent',
      headerBorder: 'border-gray-700',
      headerTitle: 'text-gray-200',
      closeButton: 'text-gray-400 hover:text-white',
      
      // 加载状态
      loadingSpinner: 'text-indigo-400',
      loadingText: 'text-gray-300',
      
      // 颜色块
      colorBlock: {
        border: 'border-gray-600',
        hoverBorder: 'hover:border-indigo-400',
        shadow: 'shadow-md',
      },
      
      // 颜色选择器弹窗
      colorPopover: {
        titleBackground: '#374151',
        titleColor: '#d1d5db',
        titleBorder: '1px solid #4b5563',
        arrowBackground: '#1f2937',
        inputBackground: 'bg-gray-700',
        inputBorder: 'border-gray-600',
        inputText: 'text-white',
        inputFocusRing: 'focus:ring-indigo-500',
        labelText: 'text-gray-400',
      },
      
      // 内容区域
      contentBackground: 'bg-gray-800',
      divider: 'border-gray-700',
      
      // 表单元素
      label: 'text-gray-300',
      textarea: {
        background: 'bg-gray-800',
        border: 'border-gray-600',
        text: 'text-gray-200',
        focus: 'focus:ring-indigo-500 focus:border-transparent',
      },
      
      // 预览区域
      previewContainer: {
        background: 'bg-gray-800',
        shadow: 'shadow-inner',
      },
      previewHeader: {
        border: 'border-gray-700/30',
      },
      previewBody: {
        cardBackground: 'rgba(0, 0, 0, 0.1)',
        cardBorder: 'border-opacity-40',
        textLight: '#374151',
        textDark: '#d1d5db',
        secondaryTextLight: '#4b5563',
        secondaryTextDark: '#adb5bd',
      },
      previewFooter: {
        border: 'border-gray-700/50',
      },
      
      // 按钮
      saveButton: {
        background: 'bg-gradient-to-r from-indigo-600 to-purple-600',
        hoverBackground: 'hover:from-indigo-500 hover:to-purple-500',
        text: 'text-white',
        focus: 'focus:ring-indigo-500',
        disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
      },
      
      // 滚动条
      scrollbar: {
        track: 'rgba(17, 24, 39, 0.5)',
        thumb: 'rgba(75, 85, 99, 0.7)',
        thumbHover: 'rgba(107, 114, 128, 0.8)',
      },
    },
    
    light: {
      // 背景和遮罩
      overlayBackground: 'bg-black bg-opacity-40 backdrop-blur-sm',
      modalBackground: 'bg-white',
      modalBorder: 'border border-gray-200',
      
      // 标题栏
      headerBackground: 'bg-transparent',
      headerBorder: 'border-gray-200',
      headerTitle: 'text-gray-800',
      closeButton: 'text-gray-500 hover:text-gray-700',
      
      // 加载状态
      loadingSpinner: 'text-blue-500',
      loadingText: 'text-gray-600',
      
      // 颜色块
      colorBlock: {
        border: 'border-gray-300',
        hoverBorder: 'hover:border-blue-400',
        shadow: 'shadow-sm',
      },
      
      // 颜色选择器弹窗
      colorPopover: {
        titleBackground: '#f3f4f6',
        titleColor: '#374151',
        titleBorder: '1px solid #e5e7eb',
        arrowBackground: '#ffffff',
        inputBackground: 'bg-white',
        inputBorder: 'border-gray-300',
        inputText: 'text-gray-800',
        inputFocusRing: 'focus:ring-blue-500',
        labelText: 'text-gray-500',
      },
      
      // 内容区域
      contentBackground: 'bg-gray-50',
      divider: 'border-gray-200',
      
      // 表单元素
      label: 'text-gray-700',
      textarea: {
        background: 'bg-white',
        border: 'border-gray-300',
        text: 'text-gray-800',
        focus: 'focus:ring-blue-500 focus:border-blue-500',
      },
      
      // 预览区域
      previewContainer: {
        background: 'bg-white',
        shadow: 'shadow-sm',
      },
      previewHeader: {
        border: 'border-gray-200/30',
      },
      previewBody: {
        cardBackground: 'rgba(255, 255, 255, 0.1)',
        cardBorder: 'border-opacity-40',
        textLight: '#111827',
        textDark: '#f9fafb',
        secondaryTextLight: '#374151',
        secondaryTextDark: '#e5e7eb',
      },
      previewFooter: {
        border: 'border-gray-200/50',
      },
      
      // 按钮
      saveButton: {
        background: 'bg-gradient-to-r from-blue-600 to-indigo-600',
        hoverBackground: 'hover:from-blue-500 hover:to-indigo-500',
        text: 'text-white',
        focus: 'focus:ring-blue-500',
        disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
      },
      
      // 滚动条
      scrollbar: {
        track: 'rgba(243, 244, 246, 0.8)',
        thumb: 'rgba(107, 114, 128, 0.5)',
        thumbHover: 'rgba(107, 114, 128, 0.8)',
      },
    }
  },

  // 竞品弹窗主题配置
  competitorModal: {
    dark: {
      // 背景和遮罩
      overlayBackground: 'bg-black bg-opacity-60 backdrop-blur-sm',
      modalBackground: 'bg-gray-900',
      modalBorder: 'border border-indigo-500/30',
      
      // 标题栏
      headerBorder: 'border-gray-700',
      headerTitle: 'text-gray-200',
      closeButton: 'text-gray-400 hover:text-white',
      
      // 表单元素
      label: 'text-gray-300',
      sectionTitle: 'text-gray-200',
      input: {
        background: 'bg-gray-800',
        border: 'border-gray-600',
        text: 'text-gray-200',
        focus: 'focus:ring-indigo-500 focus:border-indigo-500',
      },
      
      // 按钮
      button: {
        primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200',
        danger: 'text-red-400 hover:text-red-300 hover:bg-red-900/20',
      },
      
      // 添加区域
      addSection: {
        background: 'bg-gray-800/50',
        border: 'border-gray-700',
      },
      
      // 竞品项目
      competitorItem: {
        background: 'bg-gray-800/30',
        border: 'border-gray-700',
        title: 'text-gray-300',
      },
    },
    
    light: {
      // 背景和遮罩
      overlayBackground: 'bg-black bg-opacity-40 backdrop-blur-sm',
      modalBackground: 'bg-white',
      modalBorder: 'border border-gray-200',
      
      // 标题栏
      headerBorder: 'border-gray-200',
      headerTitle: 'text-gray-800',
      closeButton: 'text-gray-500 hover:text-gray-700',
      
      // 表单元素
      label: 'text-gray-700',
      sectionTitle: 'text-gray-800',
      input: {
        background: 'bg-white',
        border: 'border-gray-300',
        text: 'text-gray-800',
        focus: 'focus:ring-blue-500 focus:border-blue-500',
      },
      
      // 按钮
      button: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        danger: 'text-red-600 hover:text-red-700 hover:bg-red-50',
      },
      
      // 添加区域
      addSection: {
        background: 'bg-gray-50',
        border: 'border-gray-200',
      },
      
      // 竞品项目
      competitorItem: {
        background: 'bg-gray-50',
        border: 'border-gray-200',
        title: 'text-gray-700',
      },
    }
  },

  // FAQ页面主题配置
  faqPage: {
    dark: {
      // Why FAQs Matter More Than Ever 区域
      whyFaqsSection: {
        background: 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900',
        decorativeGlow1: 'bg-[radial-gradient(circle_at_top_left,_#3b82f615_0%,_transparent_60%)]',
        decorativeGlow2: 'bg-[radial-gradient(circle_at_bottom_right,_#06b6d415_0%,_transparent_60%)]',
        
        sectionTitle: 'text-white',
        sectionTitleGradient: 'bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent',
        
        // 卡片样式
        cardBackground: 'bg-slate-900/50',
        cardBackgroundHover: 'hover:bg-slate-800/50', 
        cardBorder: 'border-slate-700/50',
        cardBorderHover: 'hover:border-slate-600/50',
        cardShadow: 'shadow-lg hover:shadow-2xl',
        cardTitle: 'text-white',
        cardTitleHover: 'group-hover:text-blue-300',
        cardDescription: 'text-gray-300',
        cardDescriptionHover: 'group-hover:text-gray-200',
        
        // 图标渐变
        iconGradients: {
          blue: 'from-blue-500 to-cyan-600',
          cyan: 'from-cyan-500 to-teal-600', 
          teal: 'from-teal-500 to-blue-600'
        },
        
        // 背景光效
        cardGlow: {
          blue: 'bg-blue-500/10',
          cyan: 'bg-cyan-500/10',
          teal: 'bg-teal-500/10'
        }
      },
      
      // How It Works 区域
      howItWorksSection: {
        background: 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900',
        decorativeGlow1: 'bg-[radial-gradient(circle_at_bottom_left,_#a78bfa15_0%,_transparent_60%)]',
        decorativeGlow2: 'bg-[radial-gradient(circle_at_top_right,_#22d3ee15_0%,_transparent_60%)]',
        
        sectionTitle: 'text-white',
        sectionSubtitle: 'text-gray-300',
        
        // 流程线
        flowLine: 'bg-gradient-to-r from-transparent via-blue-500/30 to-transparent',
        
        // 步骤圆圈
        stepCircle: {
          blue: 'bg-blue-500',
          cyan: 'bg-cyan-500', 
          teal: 'bg-teal-500'
        },
        stepPulse: {
          blue: 'bg-blue-500',
          cyan: 'bg-cyan-500',
          teal: 'bg-teal-500'
        },
        
        // 内容卡片
        cardBackground: 'bg-slate-900/50',
        cardBackgroundHover: 'hover:bg-slate-800/50',
        cardBorder: 'border-slate-700/50',
        cardBorderHover: 'hover:border-slate-600/50', 
        cardShadow: 'shadow-lg hover:shadow-2xl',
        cardTitle: 'text-white',
        cardTitleHover: 'group-hover:text-cyan-300',
        cardDescription: 'text-gray-300',
        cardDescriptionHover: 'group-hover:text-gray-200',
        
        // 图标渐变
        iconGradients: {
          blue: 'from-blue-500 to-cyan-600',
          cyan: 'from-cyan-500 to-teal-600',
          teal: 'from-teal-500 to-blue-600'
        },
        
        // 背景光效
        cardGlow: {
          blue: 'bg-blue-500/10',
          cyan: 'bg-cyan-500/10',
          teal: 'bg-teal-500/10'
        }
      },
      
      // Built for GEO 比较表格区域
      geoCompareSection: {
        background: 'bg-gray-800',
        
        sectionTitle: 'text-white',
        
        // 表格样式
        tableContainer: 'bg-slate-800/30',
        tableBorder: 'border-slate-700/50',
        
        // 表头
        tableHeader: 'bg-slate-800/60',
        headerText: 'text-white',
        headerTextSecondary: 'text-slate-300',
        headerTextAccent: 'text-blue-300',
        
        // 表格行
        tableRow: 'divide-y divide-slate-700/70 bg-slate-900/40',
        rowHover: 'hover:bg-slate-800/50',
        
        // 单元格文本
        cellText: 'text-white',
        cellTextSecondary: 'text-slate-400',
        cellTextAccent: 'text-blue-400',
        
        // 结论行
        conclusionRow: 'bg-slate-800/70 border-t-2 border-blue-400',
        conclusionHighlight: 'bg-blue-600'
      },
      
      // 问题展示区域
      problemSection: {
        stepBackground: 'bg-slate-800/50',
        stepBorder: 'border-slate-700/50',
        stepBorderHover: 'hover:border-slate-600/50',
        stepTitle: 'text-white',
        stepDescription: 'text-gray-300',
        resultBackground: 'bg-red-900/20',
        resultBorder: 'border-red-700/30',
        resultShadow: 'shadow-red-500/10 hover:shadow-red-500/20',
        resultTitle: 'text-red-400',
        resultDescription: 'text-red-300',
        quoteBackground: 'bg-slate-800/50',
        quoteBorder: 'border-slate-600/50',
        quoteText: 'text-gray-300'
      },
      
      faqSection: {
        background: 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950',
        decorativeGlow1: 'bg-[radial-gradient(circle_at_center,_#3b82f615_0%,_transparent_60%)]',
        decorativeGlow2: 'bg-[radial-gradient(circle_at_top_right,_#06b6d415_0%,_transparent_60%)]',
        sectionTitleGradient: 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500',
        cardBackground: 'bg-slate-800/30',
        cardBorder: 'border-slate-700/50',
        cardShadow: 'shadow-xl hover:shadow-blue-500/20',
        cardBorderHover: 'hover:border-blue-500/30',
        cardBackgroundHover: 'hover:bg-slate-700/20',
        cardTitle: 'text-blue-100',
        cardTitleHover: 'group-hover:text-blue-300',
        cardDescription: 'text-slate-300',
        cardDescriptionHover: 'group-hover:text-slate-200',
        ctaGradient: 'from-blue-500 to-cyan-600'
      },
      
      // Key Features 区域
      keyFeaturesSection: {
        background: 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950',
        decorativeGlow1: 'bg-[radial-gradient(circle_at_center,_#8b5cf615_0%,_transparent_60%)]',
        decorativeGlow2: 'bg-[radial-gradient(circle_at_top_right,_#06b6d415_0%,_transparent_60%)]',
        
        sectionTitle: 'text-white',
        
        // 中心卡片
        centerCardBackground: 'bg-gradient-to-br from-purple-900/40 to-blue-900/40',
        centerCardBorder: 'border-purple-700/50',
        centerCardShadow: 'shadow-2xl',
        centerCardHover: 'hover:shadow-purple-500/20',
        centerCardGlow: 'bg-gradient-to-br from-purple-500/10 to-blue-500/10',
        centerIconGradient: 'from-purple-500 to-blue-600',
        centerCardTitle: 'text-white',
        centerCardTitleHover: 'group-hover:text-purple-300',
        centerCardDescription: 'text-gray-300',
        centerCardDescriptionHover: 'group-hover:text-gray-200',
        
        // 普通卡片
        cardBackground: 'bg-slate-900/50',
        cardBorder: 'border-slate-700/50',
        cardShadow: 'shadow-lg',
        cardBorderHover: 'hover:border-slate-600/50',
        cardBackgroundHover: 'hover:bg-slate-800/50',
        cardTitle: 'text-white',
        cardTitleHover: 'group-hover:text-blue-300',
        cardDescription: 'text-gray-300',
        cardDescriptionHover: 'group-hover:text-gray-200',
        
        // 图标渐变
        iconGradients: {
          emerald: 'from-emerald-500 to-green-600',
          yellow: 'from-yellow-500 to-orange-600',
          blue: 'from-blue-500 to-indigo-600',
          pink: 'from-pink-500 to-rose-600'
        },
        
        // 背景光效
        cardGlow: {
          emerald: 'bg-emerald-500/10',
          yellow: 'bg-yellow-500/10',
          blue: 'bg-blue-500/10',
          pink: 'bg-pink-500/10'
        }
      },
      
      // Perfect For 区域
      perfectForSection: {
        background: 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950',
        decorativeGlow: 'bg-[radial-gradient(circle_at_center,_#3b82f615_0%,_transparent_60%)]',
        
        sectionTitle: 'text-white',
        
        cardBackground: 'bg-slate-900/50',
        cardBorder: 'border-slate-700/50',
        cardShadow: 'shadow-lg',
        cardBorderHover: 'hover:border-slate-600/50',
        cardBackgroundHover: 'hover:bg-slate-800/50',
        cardTitle: 'text-white',
        cardTitleHover: 'group-hover:text-blue-300',
        cardDescription: 'text-gray-300',
        cardDescriptionHover: 'group-hover:text-gray-200',
        
        // 图标渐变
        iconGradients: {
          blue: 'from-blue-500 to-cyan-600',
          emerald: 'from-emerald-500 to-green-600',
          purple: 'from-purple-500 to-violet-600'
        },
        
        // 背景光效
        cardGlow: {
          blue: 'bg-blue-500/10',
          emerald: 'bg-emerald-500/10',
          purple: 'bg-purple-500/10'
        }
      },
    },
    
    light: {
      // Why FAQs Matter More Than Ever 区域
      whyFaqsSection: {
        background: 'bg-gradient-to-b from-gray-50 via-white to-gray-50',
        decorativeGlow1: 'bg-[radial-gradient(circle_at_top_left,_#3b82f620_0%,_transparent_60%)]',
        decorativeGlow2: 'bg-[radial-gradient(circle_at_bottom_right,_#06b6d420_0%,_transparent_60%)]',
        
        sectionTitle: 'text-gray-900',
        sectionTitleGradient: 'bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent',
        
        // 卡片样式
        cardBackground: 'bg-white/80',
        cardBackgroundHover: 'hover:bg-white/90',
        cardBorder: 'border-gray-200/70',
        cardBorderHover: 'hover:border-gray-300/80',
        cardShadow: 'shadow-sm hover:shadow-lg',
        cardTitle: 'text-gray-900',
        cardTitleHover: 'group-hover:text-blue-700',
        cardDescription: 'text-gray-600',
        cardDescriptionHover: 'group-hover:text-gray-800',
        
        // 图标渐变
        iconGradients: {
          blue: 'from-blue-600 to-cyan-700',
          cyan: 'from-cyan-600 to-teal-700',
          teal: 'from-teal-600 to-blue-700'
        },
        
        // 背景光效
        cardGlow: {
          blue: 'bg-blue-500/10',
          cyan: 'bg-cyan-500/10',
          teal: 'bg-teal-500/10'
        }
      },
      
      // How It Works 区域
      howItWorksSection: {
        background: 'bg-gradient-to-b from-gray-50 via-white to-gray-50',
        decorativeGlow1: 'bg-[radial-gradient(circle_at_bottom_left,_#a78bfa20_0%,_transparent_60%)]',
        decorativeGlow2: 'bg-[radial-gradient(circle_at_top_right,_#22d3ee20_0%,_transparent_60%)]',
        
        sectionTitle: 'text-gray-900',
        sectionSubtitle: 'text-gray-700',
        
        // 流程线
        flowLine: 'bg-gradient-to-r from-transparent via-blue-400/50 to-transparent',
        
        // 步骤圆圈
        stepCircle: {
          blue: 'bg-blue-600',
          cyan: 'bg-cyan-600',
          teal: 'bg-teal-600'
        },
        stepPulse: {
          blue: 'bg-blue-600',
          cyan: 'bg-cyan-600', 
          teal: 'bg-teal-600'
        },
        
        // 内容卡片
        cardBackground: 'bg-white/80',
        cardBackgroundHover: 'hover:bg-white/90',
        cardBorder: 'border-gray-200/70',
        cardBorderHover: 'hover:border-gray-300/80',
        cardShadow: 'shadow-sm hover:shadow-lg',
        cardTitle: 'text-gray-900',
        cardTitleHover: 'group-hover:text-blue-700',
        cardDescription: 'text-gray-600',
        cardDescriptionHover: 'group-hover:text-gray-800',
        
        // 图标渐变
        iconGradients: {
          blue: 'from-blue-600 to-cyan-700',
          cyan: 'from-cyan-600 to-teal-700',
          teal: 'from-teal-600 to-blue-700'
        },
        
        // 背景光效
        cardGlow: {
          blue: 'bg-blue-500/10',
          cyan: 'bg-cyan-500/10',
          teal: 'bg-teal-500/10'
        }
      },
      
      // Built for GEO 比较表格区域
      geoCompareSection: {
        background: 'bg-white',
        
        sectionTitle: 'text-gray-900',
        
        // 表格样式
        tableContainer: 'bg-white/80',
        tableBorder: 'border-gray-200/70',
        
        // 表头
        tableHeader: 'bg-gray-50/80',
        headerText: 'text-gray-900',
        headerTextSecondary: 'text-gray-700',
        headerTextAccent: 'text-blue-700',
        
        // 表格行
        tableRow: 'divide-y divide-gray-200/70 bg-white/60',
        rowHover: 'hover:bg-gray-50/80',
        
        // 单元格文本
        cellText: 'text-gray-900',
        cellTextSecondary: 'text-gray-600',
        cellTextAccent: 'text-blue-600',
        
        // 结论行
        conclusionRow: 'bg-gray-50/90 border-t-2 border-blue-400',
        conclusionHighlight: 'bg-blue-600'
      },
      
      // 问题展示区域
      problemSection: {
        stepBackground: 'bg-white/80',
        stepBorder: 'border-gray-200/70',
        stepBorderHover: 'hover:border-gray-300/80',
        stepTitle: 'text-gray-900',
        stepDescription: 'text-gray-700',
        resultBackground: 'bg-red-50/80',
        resultBorder: 'border-red-200/70',
        resultShadow: 'shadow-red-100/50 hover:shadow-red-200/60',
        resultTitle: 'text-red-700',
        resultDescription: 'text-red-600',
        quoteBackground: 'bg-gray-50/80',
        quoteBorder: 'border-gray-200/70',
        quoteText: 'text-gray-700'
      },
      
      faqSection: {
        background: 'bg-gradient-to-b from-gray-50 via-white to-gray-50',
        decorativeGlow1: 'bg-[radial-gradient(circle_at_center,_#3b82f620_0%,_transparent_60%)]',
        decorativeGlow2: 'bg-[radial-gradient(circle_at_top_right,_#06b6d420_0%,_transparent_60%)]',
        sectionTitleGradient: 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600',
        cardBackground: 'bg-white/80',
        cardBorder: 'border-gray-200/70',
        cardShadow: 'shadow-sm hover:shadow-lg',
        cardBorderHover: 'hover:border-gray-300/80',
        cardBackgroundHover: 'hover:bg-white/90',
        cardTitle: 'text-gray-900',
        cardTitleHover: 'group-hover:text-blue-700',
        cardDescription: 'text-gray-600',
        cardDescriptionHover: 'group-hover:text-gray-800',
        ctaGradient: 'from-blue-600 to-cyan-700'
      },
      
      // Key Features 区域
      keyFeaturesSection: {
        background: 'bg-gradient-to-b from-gray-50 via-white to-gray-50',
        decorativeGlow1: 'bg-[radial-gradient(circle_at_center,_#8b5cf620_0%,_transparent_60%)]',
        decorativeGlow2: 'bg-[radial-gradient(circle_at_top_right,_#06b6d420_0%,_transparent_60%)]',
        
        sectionTitle: 'text-gray-900',
        
        // 中心卡片
        centerCardBackground: 'bg-gradient-to-br from-purple-100/60 to-blue-100/60',
        centerCardBorder: 'border-purple-300/50',
        centerCardShadow: 'shadow-lg',
        centerCardHover: 'hover:shadow-purple-300/30',
        centerCardGlow: 'bg-gradient-to-br from-purple-200/20 to-blue-200/20',
        centerIconGradient: 'from-purple-600 to-blue-700',
        centerCardTitle: 'text-gray-900',
        centerCardTitleHover: 'group-hover:text-purple-700',
        centerCardDescription: 'text-gray-700',
        centerCardDescriptionHover: 'group-hover:text-gray-800',
        
        // 普通卡片
        cardBackground: 'bg-white/80',
        cardBorder: 'border-gray-200/70',
        cardShadow: 'shadow-sm',
        cardBorderHover: 'hover:border-gray-300/80',
        cardBackgroundHover: 'hover:bg-white/90',
        cardTitle: 'text-gray-900',
        cardTitleHover: 'group-hover:text-blue-700',
        cardDescription: 'text-gray-600',
        cardDescriptionHover: 'group-hover:text-gray-800',
        
        // 图标渐变
        iconGradients: {
          emerald: 'from-emerald-600 to-green-700',
          yellow: 'from-yellow-600 to-orange-700',
          blue: 'from-blue-600 to-indigo-700',
          pink: 'from-pink-600 to-rose-700'
        },
        
        // 背景光效
        cardGlow: {
          emerald: 'bg-emerald-500/10',
          yellow: 'bg-yellow-500/10',
          blue: 'bg-blue-500/10',
          pink: 'bg-pink-500/10'
        }
      },
      
      // Perfect For 区域
      perfectForSection: {
        background: 'bg-gradient-to-b from-gray-50 via-white to-gray-50',
        decorativeGlow: 'bg-[radial-gradient(circle_at_center,_#3b82f620_0%,_transparent_60%)]',
        
        sectionTitle: 'text-gray-900',
        
        cardBackground: 'bg-white/80',
        cardBorder: 'border-gray-200/70',
        cardShadow: 'shadow-sm',
        cardBorderHover: 'hover:border-gray-300/80',
        cardBackgroundHover: 'hover:bg-white/90',
        cardTitle: 'text-gray-900',
        cardTitleHover: 'group-hover:text-blue-700',
        cardDescription: 'text-gray-600',
        cardDescriptionHover: 'group-hover:text-gray-800',
        
        // 图标渐变
        iconGradients: {
          blue: 'from-blue-600 to-cyan-700',
          emerald: 'from-emerald-600 to-green-700',
          purple: 'from-purple-600 to-violet-700'
        },
        
        // 背景光效
        cardGlow: {
          blue: 'bg-blue-500/10',
          emerald: 'bg-emerald-500/10',
          purple: 'bg-purple-500/10'
        }
      },
    }
  }
};

// 主题状态管理
class ThemeManager {
  constructor() {
    this.currentTheme = 'light'; // 修改默认主题为 light
    this.listeners = [];
    this.isInitialized = false;
  }

  // 延迟初始化，避免服务器端和客户端不一致
  init() {
    if (typeof window === 'undefined' || this.isInitialized) return;
    
    this.isInitialized = true;
    
    // 从localStorage读取保存的主题
    const savedTheme = localStorage.getItem('seopage-theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      this.currentTheme = savedTheme;
    } else {
      // 如果没有保存的主题，默认使用 light 模式
      this.currentTheme = 'light';
    }
    
    // 应用主题
    this.applyTheme();
    this.notifyListeners();
    
    // 移除系统主题变化监听，只通过手动切换控制
    // 不再监听系统主题偏好变化
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('seopage-theme', this.currentTheme);
    }
    this.applyTheme();
    this.notifyListeners();
    
    // 派发主题变化事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { theme: this.currentTheme } 
      }));
    }
  }

  applyTheme() {
    if (typeof window === 'undefined') return;
    
    // 为body添加主题类名
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    document.body.className = document.body.className.replace(/(^|\s)(light-theme|dark-theme)(\s|$)/g, ' ');
    document.body.classList.add(`${this.currentTheme}-theme`);
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  getThemeConfig(component = 'header') {
    return themeConfig[component]?.[this.currentTheme] || themeConfig[component]?.dark;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentTheme));
  }
}

// 创建全局主题管理器实例
export const themeManager = new ThemeManager();

// 辅助函数：获取主题样式类
export const getThemeClass = (component, property) => {
  const config = themeManager.getThemeConfig(component);
  
  // 处理嵌套属性，如 'collapseButton.background'
  const properties = property.split('.');
  let result = config;
  
  for (const prop of properties) {
    if (result && typeof result === 'object' && result[prop]) {
      result = result[prop];
    } else {
      return '';
    }
  }
  
  return typeof result === 'string' ? result : '';
};

// React Hook for theme
export const useTheme = () => {
  // 服务器端渲染时始终返回 light 主题，避免 hydration 不匹配
  const [currentTheme, setCurrentTheme] = React.useState('light'); // 修改默认值为 light
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    // 客户端初始化
    themeManager.init();
    setCurrentTheme(themeManager.getCurrentTheme());
    setIsHydrated(true);

    const unsubscribe = themeManager.subscribe(setCurrentTheme);
    
    const handleThemeChange = (event) => {
      setCurrentTheme(event.detail.theme);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('themeChanged', handleThemeChange);
    }
    
    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('themeChanged', handleThemeChange);
      }
    };
  }, []);

  const toggleTheme = React.useCallback(() => {
    themeManager.toggleTheme();
  }, []);

  const getThemeConfig = React.useCallback((component) => {
    return themeManager.getThemeConfig(component);
  }, [currentTheme]);

  return {
    currentTheme,
    toggleTheme,
    getThemeConfig,
    isHydrated // 提供 hydration 状态
  };
};