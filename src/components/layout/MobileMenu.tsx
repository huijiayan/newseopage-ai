'use client';

import React from 'react';
import type { MouseEvent } from 'react';
import { Button } from '@/components/ui/Button';

interface NavigationItem {
  label: string;
  href: string;
  onClick: (e: MouseEvent<HTMLAnchorElement>) => void;
}

interface MobileMenuProps {
  isMenuOpen: boolean;
  shouldShowNavigation: () => boolean;
  navs: NavigationItem[];
  userEmail: string | null;
  isLoggedIn: boolean;
  isMobile: boolean;
  googleLoading: boolean;
  loading: boolean;
  onMenuItemClick: (item: NavigationItem) => void;
  onLoginClick: () => void;
  onGoogleLoginClick: () => void;
  onLogoutClick: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isMenuOpen,
  shouldShowNavigation,
  navs,
  userEmail,
  isLoggedIn,
  isMobile,
  googleLoading,
  loading,
  onMenuItemClick,
  onLoginClick,
  onGoogleLoginClick,
  onLogoutClick,
}) => {
  if (!isMenuOpen || shouldShowNavigation()) return null;

  return (
    <div className="py-4 border-t border-gray-200 dark:border-dark-border">
      <nav className="flex flex-col space-y-1">
        {navs.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={() => onMenuItemClick(item)}
            className="relative group py-2.5 px-3"
          >
            <span className="text-gray-600 dark:text-dark-text-secondary text-[15px] font-medium group-hover:text-blue-600 dark:group-hover:text-dark-text-primary transition-colors">
              {item.label}
            </span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-gradient-blue to-gradient-purple scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </a>
        ))}
      </nav>
      <div className="mt-6 px-3 space-y-3">
        {userEmail && isLoggedIn ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Hi, {userEmail ? userEmail.split('@')[0] : 'User'}</span>
            </div>
            <button
              onClick={onLogoutClick}
              className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 shadow-lg text-sm"
            >
              Log Out
            </button>
          </div>
        ) : (
          <>
            <Button 
              variant="outline" 
              className={`w-full dark:border-dark-border dark:text-dark-text-primary dark:hover:bg-dark-hover ${isMobile ? 'h-8 text-xs' : 'h-9 text-[15px]'}`}
              onClick={onLoginClick}
            >
              Sign In
            </Button>
            <Button 
              variant="outline" 
              className={`w-full flex items-center justify-center space-x-2 dark:border-dark-border dark:text-dark-text-primary dark:hover:bg-dark-hover ${isMobile ? 'h-8 text-xs min-h-[32px]' : 'h-9 text-[15px] min-h-[36px]'}`}
              onClick={onGoogleLoginClick}
              disabled={googleLoading || loading}
            >
              {googleLoading || loading ? (
                <svg className="animate-spin h-4 w-4 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span>{isMobile ? 'Google' : 'Sign in with Google'}</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}; 