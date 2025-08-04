import React from 'react';

interface ScrollToTopButtonProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ children, className }) => {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button type="button" className={className} onClick={handleClick}>
      {children}
    </button>
  );
};

export default ScrollToTopButton; 