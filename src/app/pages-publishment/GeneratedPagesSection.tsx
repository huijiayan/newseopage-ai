'use client';

import React from 'react';

// 类型定义
interface GeneratedPage {
  resultId: string;
  deploymentStatus: 'published' | 'draft';
  siteUrl: string;
  slug: string;
  taskWebsite: string;
  createdAt?: string;
}

interface GeneratedPagesSectionProps {
  themeStyles: any;
  pageTheme: any;
  generatedPages: GeneratedPage[];
  pagesLoading: boolean;
}

/**
 * 生成的页面展示组件
 * 显示已生成的页面列表和空状态
 */
export const GeneratedPagesSection: React.FC<GeneratedPagesSectionProps> = ({
  themeStyles,
  pageTheme,
  generatedPages,
  pagesLoading
}) => {
  return (
    <div className={`mt-8 ${themeStyles.generatedPagesBackground} p-6 rounded-xl border-2 ${themeStyles.generatedPagesBorder}`}>
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h2 className={`text-xl font-bold ${themeStyles.generatedPagesTitle}`}>
            Step 4: Publish Your Generated Pages
          </h2>
          <p className={`text-xs ${themeStyles.generatedPagesSubtitle} mt-1`}>
            {generatedPages.length > 0 ? `${generatedPages.length} pages total` : 'No generated pages yet'}
          </p>
        </div>
      </div>

      {generatedPages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50 dark:opacity-30">📄</div>
          <h3 className={`text-lg font-medium ${pageTheme.contentSections.cardTitle} mb-2`}>
            No Generated Pages Yet
          </h3>
          <p className={`text-sm ${pageTheme.contentSections.cardDescription} mb-4`}>
            Complete the first step to create pages, and they will appear here
          </p>
          <button
            className={`${themeStyles.createPagesButton} shadow-md hover:shadow-lg transition-all duration-300 px-6 py-2 h-auto flex items-center justify-center gap-2 mx-auto rounded-lg`}
            onClick={() => window.location.href = '/alternative'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="relative inline-block">
              Start Creating Pages
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></span>
            </span>
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {generatedPages.map((page, index) => (
            <div
              key={page.resultId || index}
              className={`${themeStyles.pageCard.background} ${themeStyles.pageCard.border} ${themeStyles.pageCard.shadow} rounded-lg p-4 transition-all duration-300 hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-sm font-semibold ${themeStyles.pageCard.title} truncate`}>
                  {page.slug || `Page ${index + 1}`}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  page.deploymentStatus === 'published' 
                    ? themeStyles.statusLive 
                    : themeStyles.statusDraft
                }`}>
                  {page.deploymentStatus === 'published' ? 'Live' : 'Draft'}
                </span>
              </div>
              <p className={`text-xs ${themeStyles.pageCard.metadata} mb-3`}>
                {page.taskWebsite || 'Generated Page'}
              </p>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${themeStyles.pageCard.metadata}`}>
                  {page.createdAt ? new Date(page.createdAt).toLocaleDateString() : 'N/A'}
                </span>
                <div className="flex gap-2">
                  <button
                    className={`${themeStyles.previewButton} px-3 py-1 rounded text-xs transition-colors`}
                    onClick={() => window.open(page.siteUrl, '_blank')}
                  >
                    Preview
                  </button>
                  <button
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      page.deploymentStatus === 'published' 
                        ? themeStyles.unpublishButton 
                        : themeStyles.publishButton
                    }`}
                  >
                    {page.deploymentStatus === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 