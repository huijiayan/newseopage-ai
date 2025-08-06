'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

const footerLinks = {
  PRODUCT: [
    { label: 'Alternative Pages', href: '/alternative' },
    { label: 'Best Pages', href: '/best' },
    { label: 'Alternative Pages: To Capture Competitor Traffic', href: '#' },
    { label: 'Best of Pages: Unlock Top SEO Traffic in 2025', href: '#' },
    { label: 'FAQ Pages: Your Key to LLM Content Invocation', href: '#' },
  ],
  'SEO STRATEGY': [
    { label: 'Mastering SEO Blog Writing Strategy', href: '#' },
    { label: 'Automated SEO: Complete Guide to Scaling Search Strategy', href: '#' },
    { label: 'Advanced Keyword Research Techniques in 2025', href: '#' },
    { label: 'Enterprise SEO Audit Strategies for Success', href: '#' },
    { label: 'SEO Leads: Ultimate Guide to Generating Qualified Prospects', href: '#' },
    { label: 'Landing Page Optimization Conversion Strategy', href: '#' },
  ],
  'SEO CONCEPT EXPLAINER': [
    { label: 'Why Page Type Matters for AI SEO Pages', href: '#' },
    { label: 'FAQ: Why Alternative Page Matters', href: '#' },
    { label: 'How SEOPage.ai Revolutionizes Digital Marketing', href: '#' },
    { label: 'Common SEO Mistakes Small Business Owners Make', href: '#' },
    { label: 'Business Startups SEO Agency Strategic Growth Guide', href: '#' },
    { label: 'Startup SEO Services Growth Strategy Guide', href: '#' },
    { label: 'SEO Agency for Startups Growth Partnership', href: '#' },
    { label: 'How to Optimize Landing Page for Lead Generation', href: '#' },
  ],
  ALTERNATIVE: [
    { label: 'SEOPage.ai vs Jasper', href: '#' },
    { label: 'SEOPage.ai vs Ctrify', href: '#' },
    { label: 'SEOPage.ai vs SurferSEO', href: '#' },
    { label: 'SEOPage.ai vs SEO.ai', href: '#' },
    { label: 'SEOPage.ai vs WriteSonic', href: '#' },
    { label: 'SEOPage.ai vs AISEO.ai', href: '#' },
  ],
  COMPANY: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms and Conditions', href: '#' },
    { label: 'Partners', href: '#' },
    { label: 'About Us', href: '#' },
  ],
};

export const Footer = () => {
  const { isDarkMode } = useApp();

  return (
    <footer className="relative bg-[#F5F7FF] dark:bg-dark-navy py-12 mt-24 text-[0.8125rem]">
      {/* 渐变边框 */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#4F8CFF] via-[#A855F7] to-[#FF6B81]" />
      
      <div className="max-w-[1200px] mx-auto px-6" style={{ transform: 'translateX(13%)' }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-14 gap-y-8">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="flex flex-col">
              <h3 className="text-[11px] font-semibold text-gray-800 dark:text-dark-text-primary uppercase tracking-wide mb-3">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="block text-[11px] leading-[1.6] text-gray-500 hover:text-blue-600 dark:text-dark-text-secondary dark:hover:text-dark-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-[#F0F3FF] dark:border-dark-border pt-6">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Image 
                src={isDarkMode ? "/icons/seopage-logo-normal.png" : "/icons/seopage-logo-light.png"}
                alt="SEOPAGE.AI" 
                width={90} 
                height={26}
                className="w-[90px]"
                priority 
                style={{ width: 'auto', height: 'auto' }}
              />
            </Link>
            <span className="ml-3 text-[11px] text-gray-500 dark:text-dark-text-secondary">
              © 2025 SEOPage.ai. All rights reserved.
            </span>
          </div>
          <Link 
            href="https://twitter.com/seopageai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 dark:text-dark-text-secondary dark:hover:text-dark-text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
};
