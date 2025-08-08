import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/components/research-tool/styles/research-tool.css';
import { Layout } from '@/components/layout/Layout';
import { AppProvider } from '@/context/AppContext';
import { MessageProvider } from '@/components/ui/CustomMessage';
import { AntdHMRFix } from '@/components/ui/AntdHMRFix';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NewSEOPage.ai - AI-Powered SEO Tools',
  description: 'Optimize your website SEO with AI-powered tools and analytics',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProvider>
          <MessageProvider>
            <Layout>
              {children}
              <AntdHMRFix />
            </Layout>
          </MessageProvider>
        </AppProvider>
      </body>
    </html>
  );
}
