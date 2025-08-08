import Image from 'next/image';
import { FC, ReactNode } from 'react';

interface SendButtonProps {
  iconSrc?: string;
  alt?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'gradient';
  hasContent?: boolean;
}

export const SendButton: FC<SendButtonProps> = ({ 
  iconSrc = "/icons/send-button-icon.png", 
  alt = 'send', 
  onClick, 
  disabled = false, 
  children,
  className = '',
  size = 'md',
  variant = 'gradient',
  hasContent = false
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const variantClasses = {
    primary: 'hover:bg-gray-400 dark:hover:bg-gray-600',
    secondary: 'hover:bg-gray-500 dark:hover:bg-gray-700',
    gradient: 'hover:bg-gray-300 dark:hover:bg-gray-600'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
              className={`
          flex items-center justify-center rounded-full transition-all duration-300 
          shadow-md hover:shadow-lg hover:scale-105
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
          bg-[#B8BEC7] dark:bg-gray-600 dark:border-gray-500
        `}
      style={{ 
        minWidth: children ? 'auto' : sizeClasses[size].split(' ')[0],
        height: sizeClasses[size].split(' ')[1],
        padding: children ? '0 16px' : '0',
        borderRadius: '10px',
        border: '1px solid #D9E3F0',
        color: 'white'
      }}
    >
      {children ? (
        <span className="font-medium whitespace-nowrap">{children}</span>
      ) : hasContent ? (
        <img 
          src="/icons/publish-icon.png" 
          alt="publish" 
          className="w-5 h-5" 
        />
      ) : (
        <img 
          src={iconSrc} 
          alt={alt} 
          className="w-5 h-5" 
        />
      )}
    </button>
  );
}; 