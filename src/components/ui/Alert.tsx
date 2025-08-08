import { useEffect } from 'react';

interface AlertProps {
  open: boolean;
  message: string;
  onClose?: () => void;
  type?: 'error' | 'success' | 'info';
  duration?: number; // 自动关闭时间（毫秒）
}

export const Alert = ({ open, message, onClose, type = 'error', duration = 4000 }: AlertProps) => {
  useEffect(() => {
    if (open && duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  return (
    <div
      className={`fixed left-1/2 top-4 z-50 px-6 py-3 rounded-xl flex items-center shadow-lg border transition-all duration-400
        ${open ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-6 opacity-0 pointer-events-none'}
        ${type === 'error' ? 'bg-white border-red-200' : type === 'success' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}
      style={{ transform: 'translateX(-50%)', minWidth: 320, maxWidth: '90vw' }}
      aria-live="assertive"
    >
      {type === 'error' && <span className="text-red-500 text-xl mr-2">✖</span>}
      {type === 'success' && <span className="text-green-500 text-xl mr-2">✔</span>}
      {type === 'info' && <span className="text-blue-500 text-xl mr-2">ℹ️</span>}
      <span className="text-gray-800">{message}</span>
    </div>
  );
}; 