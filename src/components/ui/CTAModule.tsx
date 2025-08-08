// CTA 模块组件

'use client';
import React from 'react';

interface CTAModuleProps {
  title?: string;
  description?: string;
  buttonText?: string;
  calendlyUrl?: string;
  className?: string;
}

const CTAModule: React.FC<CTAModuleProps> = ({
  title = "Still have questions?",
  description = "Our team is ready to help you get started with alternative pages that drive results.",
  buttonText = "Schedule a Demo",
  calendlyUrl = "https://calendly.com/joey-techacc/30min",
  className = ""
}) => {
  const handleScheduleDemo = () => {
    // 在新窗口中打开 Calendly 链接
    window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className={`w-full max-w-[800px] mx-auto px-4 pt-16 pb-20 ${className}`}>
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
        <div className="flex justify-center">
          <button 
            onClick={handleScheduleDemo}
            className="bg-gradient-to-r from-[#0ea5e9] to-[#6366f1] hover:from-[#0284c7] hover:to-[#7c3aed] text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTAModule; 