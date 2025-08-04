'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { LoginBanner } from '@/components/ui/LoginBanner';
import { useApp } from '@/context/AppContext';

export function Layout({ children }: { children: ReactNode }) {
  const { isSidebarOpen } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFB] dark:bg-dark-navy">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main
          className="flex-1 p-6"
          style={{
            marginLeft: isSidebarOpen ? '240px' : '0',
            transition: 'margin-left 300ms ease-in-out',
          }}
        >
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Footer />
      <LoginBanner />
    </div>
  );
}
