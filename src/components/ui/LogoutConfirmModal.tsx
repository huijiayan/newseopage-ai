'use client';

import React from 'react';

interface LogoutConfirmModalProps {
  showLogoutConfirm: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  showLogoutConfirm,
  onConfirm,
  onCancel,
}) => {
  if (!showLogoutConfirm) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl shadow-xl p-6 max-w-xs w-full">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Confirm Logout</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to log out?</p>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
}; 