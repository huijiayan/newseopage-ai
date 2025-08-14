"use client";
import React from 'react';

type StepStatus = 'pending' | 'processing' | 'success' | 'failed';

interface AgentProcessingPanelProps {
  title?: string;
  steps: Array<{ key: string; label?: string }>;
  statusMap: Record<string, StepStatus>;
  themeStyles?: any;
  isHydrated?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  onViewStep?: (stepKey: string) => void;
}

const StatusIcon: React.FC<{ status: StepStatus }> = ({ status }) => {
  if (status === 'success') {
    return (
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (status === 'processing') {
    return (
      <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-blue-400/40 border-t-blue-400 animate-spin" />
    );
  }
  if (status === 'failed') {
    return (
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }
  return <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-400/40" />;
};

export const AgentProcessingPanel: React.FC<AgentProcessingPanelProps> = ({
  title = 'Agent Processing',
  steps,
  statusMap,
  themeStyles,
  isHydrated,
  isExpanded = true,
  onToggle,
  onViewStep
}) => {
  const isDark = Boolean(
    isHydrated && typeof themeStyles?.agentProcessing?.titleText === 'string' &&
    themeStyles.agentProcessing.titleText.includes('text-white')
  );

  return (
    <div
      className={`w-full rounded-xl overflow-hidden ${
        isHydrated ? themeStyles?.agentProcessing?.background : 'bg-[#E8F5E9]'
      } ${isHydrated ? themeStyles?.agentProcessing?.border : 'border-[#C8E6C9]'} border`}
    >
      <button
        className={`w-full flex items-center justify-between px-4 py-3 ${
          isHydrated ? themeStyles?.agentProcessing?.titleText : 'text-gray-700'
        } font-semibold`}
        onClick={onToggle}
      >
        <span className="text-sm">{title}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <>
          <div className={`h-px w-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`} />
          <div className={`${isDark ? 'divide-white/10' : 'divide-black/5'} divide-y`}>
            {steps.map((s) => (
              <div key={s.key} className="flex items-start justify-between px-4 py-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <StatusIcon status={statusMap[s.key] || 'pending'} />
                  <span className={`text-sm ${isDark ? 'text-white/90' : 'text-gray-700'} whitespace-normal break-words leading-5`}>
                    {s.label || s.key}
                  </span>
                </div>
                <button
                  onClick={() => onViewStep && onViewStep(s.key)}
                  className={`text-sm ${isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-700'} flex items-center gap-1`}
                >
                  <span>View</span>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AgentProcessingPanel;


