"use client";

import ScrollToTopButton from '@/components/ui/ScrollToTopButton';
import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CustomizableResearchUI from '@/components/ui/CustomizableResearchUI';
import SubscriptionCard from '@/components/ui/SubscriptionCard';
import CTAModule from '@/components/ui/CTAModule';
import InvisibleMarketingGraphic from '@/components/ui/InvisibleMarketingGraphic';
import { Hero } from '@/components/ui/Hero';
import { ResearchTool, injectResearchToolStyles } from '@/components/research-tool';

// Alternative 页面内容组件
function AlternativePageContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversationId');
  const mode = searchParams.get('mode') as 'normal' | 'recover' || 'normal';

  // 确保样式文件被正确注入
  useEffect(() => {
    if (conversationId) {
      injectResearchToolStyles();
    }
  }, [conversationId]);

  return (
      <div className="min-h-[calc(100vh-66px)] bg-[#F8FAFB] dark:bg-dark-navy">
 
        {/* 动态组件：根据 URL 参数决定显示 Hero 还是 ResearchTool */}
        {conversationId ? (
          <ResearchTool 
            conversationId={conversationId} 
            mode={mode}
          />
        ) : (
          <Hero />
        )}

        {/* InvisibleMarketingGraphic 组件 */}
        <InvisibleMarketingGraphic />

        {/* 新增静态模块 2 开始 */}
        <section className="w-full max-w-[1300px] mx-auto px-4 pt-24 pb-20">
          <h2 className="text-5xl md:text-6xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#6366f1] to-[#a855f7] mb-4 leading-tight drop-shadow-sm">How SEOPage.ai's Alternative Page<br className='hidden md:block' /> Generator Works</h2>
          <p className="text-lg md:text-xl text-center text-[#64748B] dark:text-gray-300 max-w-3xl mx-auto mb-16 font-medium">Our AI-powered system generates, optimizes, and maintains alternative pages that capture high-intent traffic from competitor searches.</p>
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-8 mb-14">
            {/* Step 1 */}
            <div className="relative flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 flex flex-col items-start min-w-[280px] max-w-[400px] border border-[#e0e7ef] dark:border-slate-700 transition-all hover:shadow-2xl">
              <span className="absolute -top-6 left-8 w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white font-bold flex items-center justify-center text-lg shadow-lg border-4 border-white dark:border-slate-800">1</span>
              <h3 className="text-2xl font-extrabold mb-2 text-[#222] dark:text-white">AI finds your top rivals</h3>
              <p className="text-base text-gray-500 dark:text-gray-300">Our system analyzes search data to identify your most valuable competitor alternative opportunities.</p>
            </div>
            {/* Step 2 */}
            <div className="relative flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 flex flex-col items-start min-w-[280px] max-w-[400px] border border-[#e0e7ef] dark:border-slate-700 transition-all hover:shadow-2xl">
              <span className="absolute -top-6 left-8 w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white font-bold flex items-center justify-center text-lg shadow-lg border-4 border-white dark:border-slate-800">2</span>
              <h3 className="text-2xl font-extrabold mb-2 text-[#222] dark:text-white">Generates data-backed comparisons</h3>
              <p className="text-base text-gray-500 dark:text-gray-300">Creates comprehensive, factual comparison pages highlighting your competitive advantages.</p>
            </div>
            {/* Step 3 */}
            <div className="relative flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 flex flex-col items-start min-w-[280px] max-w-[400px] border border-[#e0e7ef] dark:border-slate-700 transition-all hover:shadow-2xl">
              <span className="absolute -top-6 left-8 w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white font-bold flex items-center justify-center text-lg shadow-lg border-4 border-white dark:border-slate-800">3</span>
              <h3 className="text-2xl font-extrabold mb-2 text-[#222] dark:text-white">Publishes SEO-perfect pages</h3>
              <p className="text-base text-gray-500 dark:text-gray-300">Deploys optimized pages to your site with the exact structure needed to rank for alternative searches.</p>
            </div>
          </div>
          <p className="text-center text-gray-500 dark:text-gray-300 mb-8 text-base font-medium">Pages deployed in minutes, not weeks — with zero development work.</p>
          <div className="flex justify-center">
            <ScrollToTopButton className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#a21caf] text-white font-bold py-3 px-10 rounded-xl text-lg shadow-xl transition-all tracking-wide">
              See It In Action
            </ScrollToTopButton>
          </div>
        </section>
        {/* 新增静态模块 2 结束 */}

        {/* 新增静态模块 3 开始 */}
        <section className="w-full max-w-[1400px] mx-auto px-4 pt-24 pb-20">
          <h2 className="text-5xl md:text-6xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7] mb-4 leading-tight drop-shadow-sm">Key Advantages</h2>
          <p className="text-lg md:text-xl text-center text-[#64748B] dark:text-gray-300 max-w-3xl mx-auto mb-16 font-medium">Our AI-driven platform delivers more than just static pages – it creates a dynamic competitive advantage.</p>
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-8 mb-14">
            {/* Card 1 */}
            <div className="group flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 flex flex-col items-start min-w-[240px] max-w-[320px] border border-[#b6bffb] dark:border-slate-700 transition-all hover:shadow-lg relative">
              <h3 className="text-xl font-extrabold mb-2 text-[#222] dark:text-white">Feature comparisons that emphasize your strengths</h3>
              <ul className="text-sm text-gray-500 dark:text-gray-300 mb-4 list-disc pl-5">
                <li>Auto-updates</li>
                <li>Feature tracking</li>
                <li>Price monitoring</li>
              </ul>
              <span className="text-xs text-[#6366f1] dark:text-blue-300 opacity-60 group-hover:opacity-100 transition-opacity absolute bottom-4 right-6 cursor-pointer">Flip for more →</span>
            </div>
            {/* Card 2 */}
            <div className="group flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 flex flex-col items-start min-w-[240px] max-w-[320px] border border-[#b6bffb] dark:border-slate-700 transition-all hover:shadow-lg relative">
              <h3 className="text-xl font-extrabold mb-2 text-[#222] dark:text-white">Optimized for search from day one</h3>
              <ul className="text-sm text-gray-500 dark:text-gray-300 mb-4 list-disc pl-5">
                <li>Keyword research</li>
                <li>Schema markup</li>
                <li>Internal linking</li>
              </ul>
              <span className="text-xs text-[#6366f1] dark:text-blue-300 opacity-60 group-hover:opacity-100 transition-opacity absolute bottom-4 right-6 cursor-pointer">Flip for more →</span>
            </div>
            {/* Card 3 */}
            <div className="group flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 flex flex-col items-start min-w-[240px] max-w-[320px] border border-[#b6bffb] dark:border-slate-700 transition-all hover:shadow-lg relative">
              <h3 className="text-xl font-extrabold mb-2 text-[#222] dark:text-white">Never worry about outdated content</h3>
              <ul className="text-sm text-gray-500 dark:text-gray-300 mb-4 list-disc pl-5">
                <li>Weekly scans</li>
                <li>Price updates</li>
                <li>Feature changes</li>
              </ul>
              <span className="text-xs text-[#6366f1] dark:text-blue-300 opacity-60 group-hover:opacity-100 transition-opacity absolute bottom-4 right-6 cursor-pointer">Flip for more →</span>
            </div>
            {/* Card 4 */}
            <div className="group flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 flex flex-col items-start min-w-[240px] max-w-[320px] border border-[#b6bffb] dark:border-slate-700 transition-all hover:shadow-lg relative">
              <h3 className="text-xl font-extrabold mb-2 text-[#222] dark:text-white">Continuous conversion improvement</h3>
              <ul className="text-sm text-gray-500 dark:text-gray-300 mb-4 list-disc pl-5">
                <li>Layout testing</li>
                <li>CTA optimization</li>
                <li>Content variants</li>
              </ul>
              <span className="text-xs text-[#6366f1] dark:text-blue-300 opacity-60 group-hover:opacity-100 transition-opacity absolute bottom-4 right-6 cursor-pointer">Flip for more →</span>
            </div>
          </div>
          <hr className="my-12 border-[#e5e7eb] dark:border-slate-700" />
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow p-7 flex items-start gap-4 min-w-[320px]">
              <span className="mt-1"><svg width="32" height="32" fill="none" viewBox="0 0 32 32"><path d="M16 4v24M16 4l-6 6m6-6l6 6" stroke="#a855f7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="16" cy="16" r="15" stroke="#a855f7" strokeWidth="2" /></svg></span>
              <div>
                <h4 className="text-lg font-bold mb-1 dark:text-white">Lightning Fast Implementation</h4>
                <p className="text-sm text-gray-500 dark:text-gray-300">Deploy your first alternative page in under 10 minutes. Our platform handles everything from research to publishing, with no coding or design work required.</p>
              </div>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow p-7 flex items-start gap-4 min-w-[320px]">
              <span className="mt-1"><svg width="32" height="32" fill="none" viewBox="0 0 32 32"><rect x="6" y="6" width="20" height="20" rx="5" stroke="#6366f1" strokeWidth="2.2" /><path d="M11 17l4 4 6-8" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              <div>
                <h4 className="text-lg font-bold mb-1 dark:text-white">Results-Driven Analytics</h4>
                <p className="text-sm text-gray-500 dark:text-gray-300">Track rankings, traffic, and conversions with our built-in analytics dashboard. See exactly how your alternative pages are performing and generating ROI.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <ScrollToTopButton className="bg-gradient-to-r from-[#38bdf8] to-[#6366f1] hover:from-[#0ea5e9] hover:to-[#7c3aed] text-white font-bold py-3 px-10 rounded-xl text-lg shadow-xl transition-all tracking-wide mb-2">
              Generate Your First Page
            </ScrollToTopButton>
            <span className="text-gray-400 text-sm dark:text-gray-500">No credit card required to start</span>
          </div>
        </section>
        {/* 新增静态模块 3 结束 */}

              {/* 新增静态模块 4 开始 */}
              <section className="w-full max-w-[1200px] mx-auto px-4 pt-24 pb-20">
          <h2 className="text-5xl md:text-6xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7] mb-4 leading-tight drop-shadow-sm">
            Manual vs. Generic AI Builder vs. <span className="text-[#6366f1] dark:text-blue-300">AltPage.ai</span>
          </h2>
          <p className="text-lg md:text-xl text-center text-[#64748B] dark:text-gray-300 max-w-2xl mx-auto mb-12 font-medium">
            See how SEOPage.ai's Alternative Page Generator transforms weeks of work into minutes.
          </p>
          <div className="flex justify-center">
            <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
              <table className="w-full text-center text-base">
                <thead className="bg-[#f8fafc] dark:bg-slate-900 text-[#222] dark:text-white font-bold">
                  <tr>
                    <th className="py-4 px-3 font-bold">Task</th>
                    <th className="py-4 px-3 font-bold">Manual</th>
                    <th className="py-4 px-3 font-bold">Generic AI Builder</th>
                    <th className="py-4 px-3 font-bold text-[#2563eb] dark:text-blue-300">AltPage.ai</th>
                  </tr>
                </thead>
                <tbody className="text-[#222] dark:text-gray-200">
                  <tr className="border-t border-[#e5e7eb] dark:border-slate-700">
                    <td className="py-3 px-3">Competitor Analysis</td>
                    <td>None</td>
                    <td>Needs manual input</td>
                    <td className="text-[#2563eb] dark:text-blue-300">Auto-scouts rivals</td>
                  </tr>
                  <tr className="border-t border-[#e5e7eb] dark:border-slate-700">
                    <td className="py-3 px-3">SEO-Optimized Structure</td>
                    <td>Error-prone</td>
                    <td>Basic templates</td>
                    <td className="text-[#2563eb] dark:text-blue-300">Built-in SEO logic</td>
                  </tr>
                  <tr className="border-t border-[#e5e7eb] dark:border-slate-700">
                    <td className="py-3 px-3">Page Generation</td>
                    <td>Slow</td>
                    <td>Fast</td>
                    <td className="text-[#2563eb] dark:text-blue-300">Fast + Search-intent aligned</td>
                  </tr>
                  <tr className="border-t border-[#e5e7eb] dark:border-slate-700">
                    <td className="py-3 px-3">Content Uniqueness</td>
                    <td>Repetitive</td>
                    <td>Template-like</td>
                    <td className="text-[#2563eb] dark:text-blue-300">Tailored comparisons</td>
                  </tr>
                  <tr className="border-t border-[#e5e7eb] dark:border-slate-700">
                    <td className="py-3 px-3">Ongoing Updates</td>
                    <td>Manual</td>
                    <td>Needs republishing</td>
                    <td className="text-[#2563eb] dark:text-blue-300">Self-refreshing</td>
                  </tr>
                  <tr className="border-t border-[#e5e7eb] dark:border-slate-700">
                    <td className="py-3 px-3">Traffic Targeting</td>
                    <td>General</td>
                    <td>Brand-centric</td>
                    <td className="text-[#2563eb] dark:text-blue-300">Competitor keyword targeting</td>
                  </tr>
                  <tr className="border-t border-[#e5e7eb] dark:border-slate-700">
                    <td className="py-3 px-3">Conversion Focus</td>
                    <td>Static</td>
                    <td>Broad messaging</td>
                    <td className="text-[#2563eb] dark:text-blue-300">Benefit-driven by persona</td>
                  </tr>
                  <tr className="border-t border-[#e5e7eb] dark:border-slate-700">
                    <td className="py-3 px-3 font-bold">Conclusion</td>
                    <td className="italic text-gray-500 dark:text-gray-400">High effort, slow impact</td>
                    <td className="italic text-gray-500 dark:text-gray-400">Fast but shallow</td>
                    <td className="bg-[#2563eb] dark:bg-blue-700 text-white font-bold text-base py-3 px-3">Purpose-built for SEO growth</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        {/* 新增静态模块 4 结束 */}

        {/* CustomizableResearchUI 组件 */}
        <CustomizableResearchUI />

        {/* SubscriptionCard 组件 */}
        <SubscriptionCard />

        







              {/* 静态模块5 - FAQ 开始 */}
              <section className="w-full max-w-[1200px] mx-auto px-4 pt-24 pb-20">
          <h2 className="text-5xl md:text-6xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#6366f1] to-[#a855f7] mb-16 leading-tight drop-shadow-sm">
            Frequently asked questions
          </h2>
          
          <div className="space-y-6">
            {/* FAQ Item 01 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-slate-700 transition-all hover:shadow-xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                    01
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    How accurate is the AI content?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Our AI generates factual, data-backed comparisons using verified product information. All content is review-ready before publishing, ensuring maximum accuracy.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Item 02 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-slate-700 transition-all hover:shadow-xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                    02
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    How quickly will my alternative pages start ranking?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Most clients see first-page rankings within 4-6 weeks for mid-competition keywords. Our SEO-optimized structure accelerates indexing and ranking.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Item 03 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-slate-700 transition-all hover:shadow-xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                    03
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Do I need technical skills to use AltPage.ai?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    No technical skills required. Our platform handles everything from research to publishing. Simple integrations available for all major CMS platforms.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Item 04 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-slate-700 transition-all hover:shadow-xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                    04
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    How do you ensure the content is unique?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Every page is generated with unique, original content tailored to your specific product. Our AI avoids template language and creates truly custom comparisons.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Item 05 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-slate-700 transition-all hover:shadow-xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                    05
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Can I customize the page designs?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Yes, you can choose from multiple templates and customize colors, fonts, and layouts to match your brand. Pro plans include advanced customization options.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* 静态模块5 - FAQ 结束 */}

              {/* CTA 模块 */}
              <CTAModule />

      </div>
  );
}

// Alternative 页面 - 支持动态组件切换
export default function AlternativePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AlternativePageContent />
    </Suspense>
  );
} 