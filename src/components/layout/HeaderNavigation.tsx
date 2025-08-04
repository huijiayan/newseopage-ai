'use client';

import React from 'react';
import type { MouseEvent } from 'react';

interface NavigationItem {
  label: string;
  href: string;
  onClick: (e: MouseEvent<HTMLAnchorElement>) => void;
}

interface HeaderNavigationProps {
  shouldShowNavigation: boolean;
  navs: NavigationItem[];
}

export const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  shouldShowNavigation,
  navs,
}) => {
  return (
    <nav className={`flex items-center flex-1 justify-end ${shouldShowNavigation ? 'mx-4' : 'mx-2'} flex-nowrap`}>
      {navs.map((item) => (
        <a
          key={item.label}
          href={item.href}
          onClick={item.onClick}
          className={`relative group ${shouldShowNavigation ? 'px-4 xl:px-5' : 'px-2'} py-2 whitespace-nowrap`}
        >
          <span className={`text-gray-600 dark:text-dark-text-secondary ${shouldShowNavigation ? 'text-[15px]' : 'text-sm'} font-medium group-hover:text-blue-600 dark:group-hover:text-dark-text-primary transition-colors whitespace-nowrap`}>
            {item.label}
          </span>
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-gradient-blue to-gradient-purple scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </a>
      ))}
    </nav>
  );
}; 