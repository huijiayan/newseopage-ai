// 竞品搜索状态栏组件
// 显示竞品搜索和sitemap处理的状态

"use client";
import React, { useState, useEffect } from 'react';

interface CompetitorSearchStatusBarProps {
  competitorSearchStatus?: {
    status: 'idle' | 'started' | 'processing' | 'completed' | 'failed';
    progress?: number;
    competitorsCount?: number;
    error?: string;
  };
  sitemapStatus?: {
    status: 'idle' | 'processing' | 'completed' | 'failed';
    progress?: number;
    message?: string;
    error?: string;
  };
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  themeStyles: any;
  isHydrated: boolean;
}

export const CompetitorSearchStatusBar: React.FC<CompetitorSearchStatusBarProps> = ({
  competitorSearchStatus,
  sitemapStatus,
  isExpanded,
  setIsExpanded,
  themeStyles,
  isHydrated
}) => {
  const [currentStatus, setCurrentStatus] = useState<'idle' | 'searching' | 'processing' | 'completed' | 'failed'>('idle');
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');

  // 更新状态和进度
  useEffect(() => {
    if (competitorSearchStatus?.status === 'started' || competitorSearchStatus?.status === 'processing') {
      setCurrentStatus('searching');
      setCurrentProgress(competitorSearchStatus.progress || 0);
      setCurrentMessage('正在搜索竞争对手...');
    } else if (sitemapStatus?.status === 'processing') {
      setCurrentStatus('processing');
      setCurrentProgress(sitemapStatus.progress || 0);
      setCurrentMessage(sitemapStatus.message || '正在处理网站地图...');
    } else if (competitorSearchStatus?.status === 'completed' && sitemapStatus?.status === 'completed') {
      setCurrentStatus('completed');
      setCurrentProgress(100);
      setCurrentMessage('任务完成');
    } else if (competitorSearchStatus?.status === 'failed' || sitemapStatus?.status === 'failed') {
      setCurrentStatus('failed');
      setCurrentProgress(0);
      setCurrentMessage(competitorSearchStatus?.error || sitemapStatus?.error || '任务失败');
    } else {
      setCurrentStatus('idle');
      setCurrentProgress(0);
      setCurrentMessage('等待用户输入');
    }
  }, [competitorSearchStatus, sitemapStatus]);

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'searching':
        return 'text-blue-400';
      case 'processing':
        return 'text-yellow-400';
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getProgressColor = () => {
    switch (currentStatus) {
      case 'searching':
        return 'bg-blue-400';
      case 'processing':
        return 'bg-yellow-400';
      case 'completed':
        return 'bg-green-400';
      case 'failed':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="rounded-lg overflow-visible relative">
      {!isExpanded && (
        <div 
          className={`w-[90%] mx-auto py-2 px-3 flex items-center justify-between cursor-pointer hover:bg-slate-700/30 ${isHydrated ? themeStyles?.taskStatusBar?.background : 'bg-[#0F1E45]'}`}
          style={{
            borderRadius: '12px 12px 0px 0px'
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center flex-1 min-w-0">
              <span className={`text-sm ${getStatusColor()}`}>
                {currentMessage}
              </span>
            </div>
            
            {currentStatus !== 'idle' && (
              <div className="flex items-center space-x-2">
                <div className="w-16 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${getProgressColor()}`}
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">
                  {currentProgress}%
                </span>
              </div>
            )}
          </div>

          <button className="text-gray-400 hover:text-gray-200">
            <svg 
              className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-0' : 'rotate-180'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* 展开状态 */}
      {isExpanded && (
        <div 
          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 w-[90%] shadow-lg z-10 ${isHydrated ? themeStyles?.taskStatusBar?.background : 'bg-[#0F1E45]'}`}
          style={{
            borderRadius: '12px 12px 0px 0px'
          }}
        >
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">竞品搜索和网站地图处理状态</span>
              <button 
                className="text-gray-400 hover:text-gray-200"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <svg 
                  className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-0' : 'rotate-180'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* 竞品搜索状态 */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">竞品搜索</span>
                <span className={`text-xs ${getStatusColor()}`}>
                  {competitorSearchStatus?.status === 'started' && '已启动'}
                  {competitorSearchStatus?.status === 'processing' && '进行中'}
                  {competitorSearchStatus?.status === 'completed' && '已完成'}
                  {competitorSearchStatus?.status === 'failed' && '失败'}
                  {!competitorSearchStatus?.status && '等待中'}
                </span>
              </div>
              {competitorSearchStatus?.status === 'processing' && (
                <div className="w-full h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-400 rounded-full transition-all duration-300"
                    style={{ width: `${competitorSearchStatus.progress || 0}%` }}
                  />
                </div>
              )}
              {competitorSearchStatus?.status === 'completed' && (
                <span className="text-xs text-green-400">
                  找到 {competitorSearchStatus.competitorsCount || 0} 个竞争对手
                </span>
              )}
              {competitorSearchStatus?.status === 'failed' && (
                <span className="text-xs text-red-400">
                  {competitorSearchStatus.error}
                </span>
              )}
            </div>

            {/* 网站地图状态 */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">网站地图处理</span>
                <span className={`text-xs ${getStatusColor()}`}>
                  {sitemapStatus?.status === 'processing' && '处理中'}
                  {sitemapStatus?.status === 'completed' && '已完成'}
                  {sitemapStatus?.status === 'failed' && '失败'}
                  {!sitemapStatus?.status && '等待中'}
                </span>
              </div>
              {sitemapStatus?.status === 'processing' && (
                <div className="w-full h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${sitemapStatus.progress || 0}%` }}
                  />
                </div>
              )}
              {sitemapStatus?.status === 'completed' && (
                <span className="text-xs text-green-400">
                  网站地图处理完成
                </span>
              )}
              {sitemapStatus?.status === 'failed' && (
                <span className="text-xs text-red-400">
                  {sitemapStatus.error}
                </span>
              )}
            </div>

            {/* 总体进度 */}
            <div className="mt-3 pt-3 border-t border-gray-600">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">总体进度</span>
                <span className={`text-xs ${getStatusColor()}`}>
                  {currentProgress}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${getProgressColor()}`}
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
