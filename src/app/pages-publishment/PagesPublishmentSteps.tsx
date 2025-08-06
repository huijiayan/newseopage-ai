'use client';

import React from 'react';

// 类型定义
interface FaviconStatus {
  isUploaded: boolean;
  url: string | null;
  loading: boolean;
  file: File | null;
  previewUrl: string | null;
}

interface GscStatus {
  isConnected: boolean;
  sites: any[];
  loading: boolean;
}

interface PagesPublishmentStepsProps {
  themeStyles: any;
  faviconStatus: FaviconStatus;
  gscStatus: GscStatus;
  onDomainCheck: () => void;
  onFaviconChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFaviconUpload: () => void;
  onGscConnect: () => void;
  onGscDisconnect: () => void;
}

/**
 * 页面发布步骤组件
 * 包含域名验证、Favicon上传、GSC连接等步骤
 */
export const PagesPublishmentSteps: React.FC<PagesPublishmentStepsProps> = ({
  themeStyles,
  faviconStatus,
  gscStatus,
  onDomainCheck,
  onFaviconChange,
  onFaviconUpload,
  onGscConnect,
  onGscDisconnect
}) => {
  return (
    <div className="space-y-6">
      {/* Step 1: Domain Verification */}
      <div className={`mb-6 ${themeStyles.launchPrepBackground} p-6 rounded-xl border-2 ${themeStyles.launchPrepBorder}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className={`text-xl font-bold ${themeStyles.launchPrepTitle}`}>
                Step 1: Domain Verification
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className={`ml-2 ${themeStyles.todoIncomplete.background} ${themeStyles.todoIncomplete.border} px-6 py-2 rounded-lg flex items-center gap-2 transition-colors`}
              onClick={onDomainCheck}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Check My Domains
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Upload Favicon */}
      <div className={`mb-6 ${themeStyles.launchPrepBackground} p-6 rounded-xl border-2 ${themeStyles.launchPrepBorder}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className={`text-xl font-bold ${themeStyles.launchPrepTitle}`}>
                Step 2: Upload Favicon
              </h2>
              <p className={`text-xs ${themeStyles.launchPrepSubtitle} mt-1`}>
                Add a favicon to display in browser tabs for your published pages
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Favicon 预览 */}
            <div className="flex items-center gap-2">
              {faviconStatus.url ? (
                <>
                  <img
                    src={faviconStatus.url}
                    alt="Current favicon"
                    className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 object-contain bg-white dark:bg-gray-800 p-1"
                  />
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700">
                    Uploaded
                  </span>
                </>
              ) : faviconStatus.previewUrl ? (
                <>
                  <img
                    src={faviconStatus.previewUrl}
                    alt="Favicon preview"
                    className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 object-contain bg-white dark:bg-gray-800 p-1"
                  />
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                    Preview
                  </span>
                </>
              ) : (
                <div className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* 上传控件 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <label className={`${themeStyles.todoIncomplete.background} ${themeStyles.todoIncomplete.border} px-4 py-1 rounded-lg flex items-center gap-2 cursor-pointer transition-colors`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Select Image
                  <input
                    type="file"
                    accept=".ico,.png,.jpg,.jpeg,.svg"
                    onChange={onFaviconChange}
                    className="hidden"
                  />
                </label>
                <button
                  className={`${themeStyles.primaryButton} text-white px-4 py-1 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={!faviconStatus.file || faviconStatus.loading}
                  onClick={onFaviconUpload}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {faviconStatus.loading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supported formats: .ico, .png, .jpg, .svg (max 1MB)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Google Search Console Connect */}
      <div className={`mb-6 ${themeStyles.launchPrepBackground} p-6 rounded-xl border-2 ${themeStyles.launchPrepBorder}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className={`text-xl font-bold ${themeStyles.launchPrepTitle}`}>
                Step 3: Connect to Google Search Console
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              gscStatus.isConnected
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700'
            }`}>
              {gscStatus.isConnected ? 'Connected' : 'Not Connected'}
            </span>
            <button
              className={`ml-2 ${themeStyles.todoIncomplete.background} ${themeStyles.todoIncomplete.border} px-6 py-2 rounded-lg flex items-center gap-2 transition-colors`}
              onClick={gscStatus.isConnected ? onGscDisconnect : onGscConnect}
              disabled={gscStatus.loading}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {gscStatus.loading ? 'Loading...' : (gscStatus.isConnected ? 'Disconnect' : 'Connect')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 