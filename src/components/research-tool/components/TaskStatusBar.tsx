// 对应老代码第25-160行的TaskStatusBar组件，100%还原样式和功能
// 保持与原始代码完全一致的任务状态显示逻辑

"use client";
import React from 'react';
import type { TaskStep, BrowserTab, ThemeStyles } from '@/types/research-tool';
import { TASK_TIME_ESTIMATES } from '@/types/research-tool';

interface TaskStatusBarProps {
  currentStep: number;
  taskSteps: TaskStep[];
  browserTabs: BrowserTab[];
  taskTimeEstimates: typeof TASK_TIME_ESTIMATES;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  themeStyles: ThemeStyles;
  isHydrated: boolean;
}

// 对应老代码第25-160行的任务状态栏组件，用于显示当前页面生成任务的进度状态
export const TaskStatusBar: React.FC<TaskStatusBarProps> = ({ 
  currentStep, 
  taskSteps, 
  browserTabs,
  taskTimeEstimates,
  isExpanded, 
  setIsExpanded,
  themeStyles,
  isHydrated
}) => {
  return (
    <div className="rounded-lg overflow-visible relative"> 
      {!isExpanded && (
        <div 
          className={`w-[90%] mx-auto py-2 px-3 flex items-center justify-between cursor-pointer hover:bg-slate-700/30 ${isHydrated ? themeStyles.taskStatusBar?.background : 'bg-[#0F1E45]'}`}
          style={{
            borderRadius: '12px 12px 0px 0px'
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center flex-1 min-w-0">
              <span className={`text-sm ${isHydrated ? themeStyles.taskStatusBar?.currentStepText : 'text-gray-300'}`}>
                {currentStep === 0 
                  ? 'Waiting for your input' 
                  : (
                    <>
                      Current Step: <span style={{ color: '#357BF7' }}>{taskSteps[currentStep - 1]?.name || 'Processing'}</span>
                    </>
                  )
                }
              </span>
            </div>
            
            {currentStep > 0 && taskTimeEstimates[currentStep as keyof typeof taskTimeEstimates] && (
              <span className="text-xs text-blue-300 flex-shrink-0">
                {taskTimeEstimates[currentStep as keyof typeof taskTimeEstimates].time}
              </span>
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
      {/* 展开状态 - 使用绝对定位覆盖 */}
      {isExpanded && (
        <div 
          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 w-[90%] shadow-lg z-10 ${isHydrated ? themeStyles.taskStatusBar?.background : 'bg-[#0F1E45]'}`}
          style={{
            borderRadius: '12px 12px 0px 0px'
          }}
        >
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Current Page Generation Step</span>
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
            {/* 步骤列表 */}
            <div className="space-y-1">
              {taskSteps.map((step, index) => {
                const timeInfo = taskTimeEstimates[(index + 1) as keyof typeof taskTimeEstimates];
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between text-xs rounded px-2 py-1 ${
                      currentStep > index + 1 ? (isHydrated ? themeStyles.taskStatusBar?.expandedContent?.stepItem?.activeText : 'text-gray-200') : 
                      currentStep === index + 1 ? (isHydrated ? themeStyles.taskStatusBar?.expandedContent?.stepItem?.activeText : 'text-gray-200') : 
                      (isHydrated ? themeStyles.taskStatusBar?.expandedContent?.stepItem?.inactiveText : 'text-gray-500')
                    }`}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      {/* 步骤指示器 */}
                      <div className="mr-2 flex items-center justify-center w-3 h-3 flex-shrink-0">
                        {currentStep > index + 1 ? (
                          <div className={`w-1.5 h-1.5 rounded-full ${isHydrated ? themeStyles.taskStatusBar?.expandedContent?.indicator?.completed : 'bg-green-400'}`}></div>
                        ) : currentStep === index + 1 ? (
                          <div className={`w-2.5 h-2.5 border rounded-full animate-spin ${isHydrated ? themeStyles.taskStatusBar?.expandedContent?.indicator?.current : 'border-blue-400/30 border-t-blue-400'}`}></div>
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full ${isHydrated ? themeStyles.taskStatusBar?.expandedContent?.indicator?.pending : 'bg-gray-600'}`}></div>
                        )}
                      </div>
                      <span className="text-sm truncate">{step.name}</span>
                    </div>
                    {/* 时间显示 */}
                    {timeInfo && (
                      <span className={`text-xs flex-shrink-0 ml-1 ${
                        currentStep === index + 1 ? 
                          (isHydrated ? themeStyles.taskStatusBar?.expandedContent?.stepItem?.timeActiveText : 'text-blue-300') : 
                          (isHydrated ? themeStyles.taskStatusBar?.expandedContent?.stepItem?.timeInactiveText : 'text-gray-500')
                      }`}>
                        {timeInfo.time}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between">
              {/* 页面数量 */}
              <div className="flex items-center space-x-2">
                <span className={`text-xs ${isHydrated ? themeStyles.taskStatusBar?.expandedContent?.summary?.text : 'text-gray-400'}`}>Up to 10 pages can be created in 1 task, you have generated</span>
                <div className="flex items-center">
                  <span className={`text-sm font-bold ${isHydrated ? themeStyles.taskStatusBar?.expandedContent?.summary?.countText : 'text-gray-400'}`}>{browserTabs.length}</span>
                  <span className={`text-sm ml-1 ${isHydrated ? themeStyles.taskStatusBar?.expandedContent?.summary?.countText : 'text-gray-400'}`}>/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};