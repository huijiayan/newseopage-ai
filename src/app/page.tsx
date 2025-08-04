import { HomeHero } from '@/components/ui/HomeHero';
import CustomizableResearchUI from '@/components/ui/CustomizableResearchUI';
import SubscriptionCard from '@/components/ui/SubscriptionCard';

export default function Home() {

  return (
    <div className="min-h-screen bg-[#f5f7ff] dark:bg-dark-navy">
      <HomeHero />
      {/* 静态模块1 */}
      {/* Marketing Graphic Section */}
      <section className="w-full py-24 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Why Marketers Choose SeoPage.ai
          </h2>
          
          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Top-Left Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-gray-50 dark:hover:bg-slate-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                All the traffic, none of the busywork.
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Stop hand-coding "Best of" lists, FAQ hubs, or endless vs-competitor write-ups—our agent does it while you sleep.
              </p>
            </div>
            
            {/* Top-Right Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-gray-50 dark:hover:bg-slate-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Pages purpose-built for AI Overviews & PAA.
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Structured data, conversational snippets, and citation-ready answers baked in.
              </p>
            </div>
            
            {/* Bottom-Left Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-gray-50 dark:hover:bg-slate-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Evergreen, self-optimizing content.
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We auto-track feature changes, price shifts, and SERP moves, then rewrite only what's needed—exactly how AltPage already auto-updates alternative pages.
              </p>
            </div>
            
            {/* Bottom-Right Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-gray-50 dark:hover:bg-slate-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Blueprint + Daily To-Do.
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Get a living SiteMap roadmap and a prioritized task list that slots neatly into your calendar or project tool.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* 静态模块2 */}
      {/* SEO Page Templates Section */}
      <section className="w-full py-24 bg-white dark:bg-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Heading */}
          <h2 className="text-4xl md:text-4xl font-bold text-center text-purple-600 dark:text-purple-400 mb-16">
            100+ SEO Page Templates We Generate & Maintain
          </h2>
          
          {/* Template Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Top-Left Card: Competitive & List Pages */}
            <div className="bg-white dark:bg-slate-700 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-gray-50 dark:hover:bg-slate-600">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Competitive & List Pages
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Alternatives</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">[Brand] vs [Brand]</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">10 Best [Category]</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Best Free [Category]</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Side-by-side grids</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Feature-gap pages</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Upgrade paths</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Price-tier comparisons</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Gift Guides</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Buyer Guides</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Vendor Scorecards</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Ranking Tables</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Top Picks Under $X</span>
              </div>
            </div>
            
            {/* Top-Right Card: Answer & Authority Pages */}
            <div className="bg-white dark:bg-slate-700 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-gray-50 dark:hover:bg-slate-600">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Answer & Authority Pages
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">FAQ Hubs</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">People-Also-Ask clusters</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">How-To Guides</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Troubleshooting Articles</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Glossaries</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Definition Micros</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Stats Round-ups</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Benchmarks</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Survey Reports</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Interview Transcripts</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Myth-Busters</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Is [Brand] Down?</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Compliance Explain-ers</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Accessibility FAQs</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Security Overviews</span>
              </div>
            </div>
            
            {/* Bottom-Left Card: Use-Case & Persona Pages */}
            <div className="bg-white dark:bg-slate-700 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-gray-50 dark:hover:bg-slate-600">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Use-Case & Persona Pages
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Industry Solutions</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Role-Based Landing Pages</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Job-Description Templates</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Case Studies</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Success Stories</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">For Start-ups / SMB / Enterprise</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Scenario Walk-throughs</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Migration Guides</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Implementation Checklists</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">ROI Calculators</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Savings Calculators</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Interactive Quizzes</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Assessments</span>
              </div>
            </div>
            
            {/* Bottom-Right Card: Resource & Conversion Pages */}
            <div className="bg-white dark:bg-slate-700 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-gray-50 dark:hover:bg-slate-600">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Resource & Conversion Pages
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Template Galleries</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">E-book Downloads</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Whitepaper Hubs</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Webinar Sign-ups</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Course Details</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Changelog Logs</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Release Notes</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Integration Docs</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">API Guides</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Partner Directories</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Affiliate Program Pages</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Press Kits</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Event Landing Pages</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Local Service Pages</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm">Micro-landing AB tests</span>
              </div>
            </div>
          </div>
          
          {/* Closing Text */}
          <p className="text-center text-gray-600 dark:text-gray-300 italic mt-12 text-lg">
            ...and 60+ more. All pages are discoverable, schema-marked, and designed to work alongside—not instead of—your main site.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-24 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-16">
            How It Works
          </h2>
          
          {/* Steps List */}
          <div className="space-y-8">
            {/* Step 1: 360° Intelligence Sweep */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    360° Intelligence Sweep
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    We crawl your existing SiteMap and primary competitors, extracting themes, gaps, and ranking opportunities.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: SiteMap Blueprint Engine */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    SiteMap Blueprint Engine
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    The agent drafts a hierarchical SiteMap—clusters, hubs, and internal links—mapped to intent and difficulty.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Daily Page Factory */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Daily Page Factory
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Each day it adds, rewrites, or retires pages based on new data (traffic shifts, feature launches, SERP volatility).
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4: Smart Publish & Test */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Smart Publish & Test
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    One click to your CMS (or our managed hosting). Built-in A/B & multivariate tests refine copy, CTAs, and layout.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 5: Insights & To-Dos */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Insights & To-Dos
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Log in to see a prioritized checklist: approve drafts, review competitor intel, or simply set to 'auto-ship.'
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Advantages Comparison Table */}
      <section className="w-full py-24 bg-white dark:bg-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-center text-purple-600 dark:text-purple-400 mb-16">
            Key Advantages
          </h2>
          
          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
              {/* Table Header */}
              <thead className="bg-purple-50 dark:bg-purple-900/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                    Point Tools & Freelancers
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                    Generic AI Writers
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700">
                    SeoPage.ai
                  </th>
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Page types covered */}
                <tr className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    Page types covered
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-300">
                    2-3 templates
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-300">
                    Needs prompts
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-semibold text-blue-600 dark:text-blue-400">
                    100+ out of the box
                  </td>
                </tr>

                {/* Competitor analysis */}
                <tr className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    Competitor analysis
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-300">
                    Manual spreadsheets
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-300">
                    None
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-semibold text-blue-600 dark:text-blue-400">
                    Real-time, automated
                  </td>
                </tr>

                {/* Site architecture */}
                <tr className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    Site architecture
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-300">
                    DIY
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-300">
                    Unstructured
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-semibold text-blue-600 dark:text-blue-400">
                    Full clustered SiteMap
                  </td>
                </tr>

                {/* Continuous optimization */}
                <tr className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    Continuous optimization
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-300">
                    Quarterly at best
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-300">
                    Manual refresh
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-semibold text-blue-600 dark:text-blue-400">
                    Daily, agent-driven
                  </td>
                </tr>

                {/* Time to live */}
                <tr className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    Time to live
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-300">
                    Weeks
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-300">
                    Days
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-semibold text-blue-600 dark:text-blue-400">
                    Minutes/page
                  </td>
                </tr>

                {/* Conclusion */}
                <tr className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    Conclusion
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-300">
                    Slow & expensive
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-300">
                    Fast but shallow
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-lg">
                    Purpose-built for rankings
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-24 bg-gradient-to-b from-blue-50/30 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-center text-purple-600 dark:text-purple-400 mb-16">
            FAQ
          </h2>
          
          {/* FAQ Cards */}
          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Do these pages replace my current website?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                No. SeoPage.ai publishes under /seo/ or a sub-domain, leaving your core site untouched yet internally linked for authority flow.
              </p>
            </div>

            {/* FAQ Item 2 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                What CMS do you support?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                WordPress, Webflow, Shopify, Ghost, custom headless, and direct HTML export—plus fully-hosted options.
              </p>
            </div>

            {/* FAQ Item 3 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                How fast can I expect results?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Most users see first-page impressions for long-tail queries inside 10 days; competitive terms follow as authority builds.
              </p>
            </div>

            {/* FAQ Item 4 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Can I edit content?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Absolutely. Lock sections, tweak tone, or overwrite entire pages—our agent still handles updates around your edits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CustomizableResearchUI 组件 */}
      <CustomizableResearchUI />

      {/* SubscriptionCard 组件 */}
      <SubscriptionCard />
    </div>
  );
}
