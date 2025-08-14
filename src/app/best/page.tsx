"use client";

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Hero } from "@/components/ui/Hero";
import { ResearchTool, injectResearchToolStyles } from '@/components/research-tool';
import { themeConfig } from '@/utils/theme-config.js';



function BestPageContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversationId');
  const isDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false;
  const pageTheme = themeConfig.pages[isDark ? 'dark' : 'light'];
  const currentTheme = isDark ? 'dark' : 'light';


  // 确保样式文件被正确注入
  useEffect(() => {
    if (conversationId) {
      injectResearchToolStyles();
    }
  }, [conversationId]);

  return (
    <div>
      {/* 动态组件：根据 URL 参数决定显示 Hero 还是 ResearchTool */}
      {conversationId ? (
        <ResearchTool
          conversationId={conversationId}
        />
      ) : (
        <Hero />
      )}

      {/* 新增静态模块 1 开始 */}
      <section id="the-problem" className={`py-12 sm:py-16 lg:py-20 ${pageTheme.contentSections.background} relative overflow-hidden`}>
        <div className={`absolute inset-0 ${pageTheme.contentSections.decorativeGlow1}`}></div>
        <div className={`absolute inset-0 ${pageTheme.contentSections.decorativeGlow2}`}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold ${pageTheme.contentSections.sectionTitleGradient} mb-4 sm:mb-6 px-2`}>The Problem</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-12 sm:mb-16">
            <div className="space-y-6 sm:space-y-8">
              <div className={`${pageTheme.problemSection.stepBackground} backdrop-blur-sm border ${pageTheme.problemSection.stepBorder} rounded-2xl p-4 sm:p-6 ${pageTheme.problemSection.stepBorderHover} transition-all duration-300`}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r ${pageTheme.contentSections.iconGradients.cyan} rounded-lg flex items-center justify-center text-white flex-shrink-0 mt-1`}>
                    <span className="text-xs sm:text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h3 className={`text-base sm:text-lg font-semibold ${pageTheme.problemSection.stepTitle} mb-2`}>High-Intent Shoppers Search</h3>
                    <p className={`text-sm sm:text-base ${pageTheme.problemSection.stepDescription} leading-relaxed`}>
                      Every day, purchase-ready customers Google "best project-management tool," "best AI copywriter," or "best noise-cancelling earbuds."
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${pageTheme.problemSection.stepBackground} backdrop-blur-sm border ${pageTheme.problemSection.stepBorder} rounded-2xl p-4 sm:p-6 ${pageTheme.problemSection.stepBorderHover} transition-all duration-300`}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r ${pageTheme.contentSections.iconGradients.orange} rounded-lg flex items-center justify-center text-white flex-shrink-0 mt-1`}>
                    <span className="text-xs sm:text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h3 className={`text-base sm:text-lg font-semibold ${pageTheme.problemSection.stepTitle} mb-2`}>Competitors Intercept Traffic</h3>
                    <p className={`text-sm sm:text-base ${pageTheme.problemSection.stepDescription} leading-relaxed`}>
                      Aggregator blogs and review sites scoop up the traffic while your official site stays invisible.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className={`${pageTheme.problemSection.resultBackground} backdrop-blur-sm border ${pageTheme.problemSection.resultBorder} rounded-2xl p-6 sm:p-8 shadow-lg ${pageTheme.problemSection.resultShadow} transition-all duration-500`}>
                <div className="text-center">
                  <div className="mb-4 sm:mb-6 flex justify-center">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${pageTheme.contentSections.iconGradients.orange} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                      <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                  </div>

                  <h3 className={`text-xl sm:text-2xl font-bold ${pageTheme.problemSection.resultTitle} mb-3 sm:mb-4`}>The Result</h3>
                  <p className={`${pageTheme.problemSection.resultDescription} leading-relaxed text-base sm:text-lg`}>
                    You lose purchase-ready prospects before the conversation even starts.
                  </p>
                </div>
              </div>

              <div className="hidden lg:block absolute -left-8 top-1/2 transform -translate-y-1/2">
                <svg className={`w-6 h-6 ${pageTheme.problemSection.resultTitle}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 ${pageTheme.problemSection.quoteBackground} border ${pageTheme.problemSection.quoteBorder} rounded-full backdrop-blur-sm mx-4`}>
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${currentTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <p className={`${pageTheme.problemSection.quoteText} italic text-xs sm:text-sm text-center`}>
                While you focus on building great products, competitors capture your potential customers
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* 新增静态模块 1 结束 */}

      {/* 新增静态模块 2 开始 */}
      <section id="how-it-works" className={`py-12 sm:py-16 lg:py-20 ${pageTheme.contentSections.background} relative overflow-hidden`}>
        <div className={`absolute inset-0 ${pageTheme.contentSections.decorativeGlow3}`}></div>
        <div className={`absolute inset-0 ${pageTheme.contentSections.decorativeGlow4}`}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold ${pageTheme.contentSections.sectionTitle} mb-4 sm:mb-6 px-2`}>Our Solution</h2>
            <p className={`text-base sm:text-lg lg:text-xl ${pageTheme.contentSections.sectionSubtitle} max-w-3xl mx-auto px-4`}>
              From URL to authority pages in minutes - fully automated competitive research and content generation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {[
              {
                step: "01",
                title: "Drop Your URL",
                description: "BestPage.ai crawls your site, feature docs, pricing, and reviews to understand exactly what you sell—zero manual tagging.",
                icon: (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                ),
                gradient: pageTheme.contentSections.iconGradients.cyan
              },
              {
                step: "02",
                title: "Category Intelligence Engine™",
                description: "We map your product to the most searched sub-categories (and hidden niches) using live SERP + keyword data.",
                icon: (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                ),
                gradient: pageTheme.contentSections.iconGradients.purple
              },
              {
                step: "03",
                title: "Instant Authority Pages",
                description: "For each category we generate a \"10 Best … in 2025\" landing page: credible intro, data-backed rankings, rich product cards, comparison tables, FAQs, and schema.",
                icon: (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <line x1="10" y1="9" x2="8" y2="9" />
                  </svg>
                ),
                gradient: pageTheme.contentSections.iconGradients.emerald
              },
              {
                step: "04",
                title: "Autopilot Updates",
                description: "As competitors change pricing, features, or ratings we refresh your pages so they stay current and keep ranking.",
                icon: (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M23 4v6h-6" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                ),
                gradient: pageTheme.contentSections.iconGradients.orange
              },
              {
                step: "05",
                title: "1-Click Publish",
                description: "Push to WordPress, Webflow, custom CMS—or host on a BestPage sub-domain while you decide.",
                icon: (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                    <path d="M2 2l7.586 7.586" />
                    <circle cx="11" cy="11" r="2" />
                  </svg>
                ),
                gradient: pageTheme.contentSections.iconGradients.pink
              }
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className={`${pageTheme.contentSections.cardBackground} backdrop-filter backdrop-blur-sm border ${pageTheme.contentSections.cardBorder} rounded-2xl p-6 sm:p-8 ${pageTheme.contentSections.cardShadow} ${pageTheme.contentSections.cardBorderHover} ${pageTheme.contentSections.cardBackgroundHover} transition-all duration-500 group relative z-10 h-full`}>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${item.gradient} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <div className={`text-xl sm:text-2xl font-bold text-gray-400 group-hover:text-gray-500 transition-colors duration-300`}>
                      {item.step}
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-lg sm:text-xl font-bold ${pageTheme.contentSections.cardTitle} mb-3 sm:mb-4 leading-tight ${pageTheme.contentSections.cardTitleHover} transition-colors duration-300`}>
                      {item.title}
                    </h3>
                    <p className={`${pageTheme.contentSections.cardDescription} text-sm sm:text-base leading-relaxed ${pageTheme.contentSections.cardDescriptionHover} transition-colors duration-300`}>
                      {item.description}
                    </p>
                  </div>

                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* 新增静态模块 2 结束 */}

      {/* 新增静态模块 3 开始 */}
      <section id="comparison" className={`py-12 sm:py-16 lg:py-20 ${pageTheme.contentSections.background}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold ${pageTheme.contentSections.sectionTitleGradient} mb-4 sm:mb-6 px-2`}>Why It Wins</h2>
          </div>

          <div className={`overflow-x-auto rounded-lg shadow-xl border ${pageTheme.comparisonTable.border} ${pageTheme.comparisonTable.background} backdrop-blur-sm`}>
            <table className="min-w-full divide-y divide-slate-700 text-xs sm:text-sm lg:text-base">
              <thead className={pageTheme.comparisonTable.headerBackground}>
                <tr>
                  <th scope="col" className={`py-3 sm:py-3.5 pl-3 sm:pl-4 pr-2 sm:pr-3 text-left text-sm sm:text-base font-semibold ${pageTheme.comparisonTable.headerText} sm:pl-6 sticky left-0 ${pageTheme.comparisonTable.headerBackground} z-10 min-w-[120px]`}></th>
                  <th scope="col" className={`px-2 sm:px-3 py-3 sm:py-3.5 text-center text-sm sm:text-base font-semibold ${pageTheme.comparisonTable.headerTextSecondary} min-w-[100px]`}>Manual Content Team</th>
                  <th scope="col" className={`px-2 sm:px-3 py-3 sm:py-3.5 text-center text-sm sm:text-base font-semibold ${pageTheme.comparisonTable.headerTextSecondary} min-w-[100px]`}>Generic AI Writer</th>
                  <th scope="col" className={`px-2 sm:px-3 py-3 sm:py-3.5 text-center text-sm sm:text-base font-semibold ${pageTheme.comparisonTable.headerTextAccent} min-w-[100px]`}>BestPage.ai</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-slate-700/70 ${pageTheme.comparisonTable.rowBackground}`}>
                {[
                  { feature: 'Category discovery', manual: 'Spreadsheet grind', generic: 'Needs prompts', bestpage: 'Auto-detects' },
                  { feature: 'SEO architecture', manual: 'Hit-or-miss', generic: 'Basic template', bestpage: 'Keyword- & schema-ready' },
                  { feature: 'Trust signals', manual: 'Ad-heavy reviews', generic: 'None', bestpage: 'Transparent ranking logic' },
                  { feature: 'Ongoing maintenance', manual: 'Quarterly rewrites', generic: 'Manual refresh', bestpage: 'Self-updating' },
                  { feature: 'Time to launch', manual: '4–6 weeks', generic: '1–2 days', bestpage: '<10 minutes' }
                ].map((row, index) => (
                  <tr key={index} className={`${pageTheme.comparisonTable.rowHover} transition-colors duration-150`}>
                    <td className={`py-3 sm:py-4 pl-3 sm:pl-4 pr-2 sm:pr-3 font-medium ${pageTheme.comparisonTable.cellText} sm:pl-6 sticky left-0 bg-inherit z-10 text-xs sm:text-sm`}>{row.feature}</td>
                    <td className={`px-2 sm:px-3 py-3 sm:py-4 text-center ${pageTheme.comparisonTable.cellTextSecondary} text-xs sm:text-sm`}>{row.manual}</td>
                    <td className={`px-2 sm:px-3 py-3 sm:py-4 text-center ${pageTheme.comparisonTable.cellTextSecondary} text-xs sm:text-sm`}>{row.generic}</td>
                    <td className={`px-2 sm:px-3 py-3 sm:py-4 text-center ${pageTheme.comparisonTable.cellTextAccent} font-medium text-xs sm:text-sm`}>{row.bestpage}</td>
                  </tr>
                ))}
                <tr className={`${pageTheme.comparisonTable.conclusionBackground} border-t-2 ${pageTheme.comparisonTable.conclusionBorder}`}>
                  <td className={`py-4 sm:py-5 pl-3 sm:pl-4 pr-2 sm:pr-3 text-left text-sm sm:text-base font-semibold ${pageTheme.comparisonTable.cellText} sm:pl-6 sticky left-0 bg-inherit z-10`}>Conclusion</td>
                  <td className={`px-2 sm:px-3 py-4 sm:py-5 text-center text-sm sm:text-base font-medium ${pageTheme.comparisonTable.cellTextSecondary} italic`}>Slow & expensive</td>
                  <td className={`px-2 sm:px-3 py-4 sm:py-5 text-center text-sm sm:text-base font-medium ${pageTheme.comparisonTable.cellTextSecondary} italic`}>Fast but shallow</td>
                  <td className={`px-2 sm:px-3 py-4 sm:py-5 text-center text-sm sm:text-base font-bold text-white ${pageTheme.comparisonTable.conclusionHighlight}`}>Purpose-built for rankings</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {/* 新增静态模块 3 结束 */}

      {/* 新增静态模块 4 开始 */}
      <section id="features" className={`py-12 sm:py-16 lg:py-20 ${pageTheme.contentSections.backgroundAlt} relative overflow-hidden`}>
        <div className={`absolute inset-0 ${pageTheme.contentSections.decorativeGlow3}`}></div>
        <div className={`absolute inset-0 ${pageTheme.contentSections.decorativeGlow4}`}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold ${pageTheme.contentSections.sectionTitleGradient} mb-4 sm:mb-6 px-2`}>Key Advantages</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "Credibility by Design",
                description: "Each listicle cites independent sources, shows scoring criteria, and discloses affiliate links to build trust.",
                icon: (
                  <div className="flex items-center justify-center w-full">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 9l6 6 6-6" />
                      <path d="M12 3v18" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  </div>
                ),
                gradient: pageTheme.contentSections.iconGradients.amber,
                bgGlow: currentTheme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-500/5'
              },
              {
                title: "SEO-First Framework",
                description: "Title tags, URLs, table-of-contents, FAQ-schema, and internal links baked in.",
                icon: (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                    <circle cx="11" cy="11" r="3" />
                  </svg>
                ),
                gradient: pageTheme.contentSections.iconGradients.cyan,
                bgGlow: currentTheme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-500/5'
              },
              {
                title: "Conversion Boosters",
                description: "Smart CTAs auto-match the reader's intent and route warm leads straight to your funnel.",
                icon: (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 3v18h18" />
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                  </svg>
                ),
                gradient: pageTheme.contentSections.iconGradients.emerald,
                bgGlow: currentTheme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-500/5'
              },
              {
                title: "Analytics Built-In",
                description: "Track rankings, clicks, and assisted revenue from every Best Page inside one dashboard.",
                icon: (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M7 8h10" />
                    <path d="M7 12h4" />
                    <path d="M7 16h6" />
                  </svg>
                ),
                gradient: pageTheme.contentSections.iconGradients.purple,
                bgGlow: currentTheme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-500/5'
              },
              {
                title: "Zero Code, Zero Design Work",
                description: "Choose a theme, tweak brand colors, you’re done.",
                icon: (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                ),
                gradient: pageTheme.contentSections.iconGradients.pink,
                bgGlow: currentTheme === 'dark' ? 'bg-pink-500/10' : 'bg-pink-500/5'
              }
            ].map((advantage, index) => (
              <div
                key={index}
                className={`group relative ${pageTheme.contentSections.cardBackground} backdrop-filter backdrop-blur-sm border ${pageTheme.contentSections.cardBorder} rounded-2xl p-6 sm:p-8 ${pageTheme.contentSections.cardShadow} ${pageTheme.contentSections.cardBorderHover} ${pageTheme.contentSections.cardBackgroundHover} transition-all duration-500`}
              >
                <div className={`absolute inset-0 rounded-2xl ${advantage.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>

                <div className="relative z-10 mb-4 sm:mb-6">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r ${advantage.gradient} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    {advantage.icon}
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className={`text-lg sm:text-xl font-bold ${pageTheme.contentSections.cardTitle} mb-3 sm:mb-4 leading-tight ${pageTheme.contentSections.cardTitleHover} transition-colors duration-300`}>
                    {advantage.title}
                  </h3>
                  <p className={`${pageTheme.contentSections.cardDescription} text-sm sm:text-base leading-relaxed ${pageTheme.contentSections.cardDescriptionHover} transition-colors duration-300`}>
                    {advantage.description}
                  </p>
                </div>

                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${advantage.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none blur-xl`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* 新增静态模块 4 结束 */}

      {/* 新增静态模块 5 开始 */}
      <section id="perfect-for" className={`py-12 sm:py-16 lg:py-20 ${pageTheme.contentSections.backgroundAlt} relative overflow-hidden`}>
        <div className={`absolute inset-0 ${pageTheme.contentSections.decorativeGlow3}`}></div>
        <div className={`absolute inset-0 ${pageTheme.contentSections.decorativeGlow4}`}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold ${pageTheme.contentSections.sectionTitleGradient} mb-4 sm:mb-6 px-2`}>Perfect For</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "E-commerce",
                description: "Boost your product listings and increase sales with optimized listicles.",
                icon: (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                ),
                gradient: pageTheme.contentSections.iconGradients.pink,
                bgGlow: currentTheme === 'dark' ? 'bg-pink-500/10' : 'bg-pink-500/5'
              },
              {
                title: "B2B",
                description: "Establish authority and attract high-quality leads with tailored listicles.",
                icon: (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                ),
                gradient: pageTheme.contentSections.iconGradients.purple,
                bgGlow: currentTheme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-500/5'
              },
              {
                title: "Service Providers",
                description: "Enhance your service offerings and attract more clients with targeted listicles.",
                icon: (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                ),
                gradient: pageTheme.contentSections.iconGradients.emerald,
                bgGlow: currentTheme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-500/5'
              },
              {
                title: "Educational Content",
                description: "Educate and engage your audience with informative and engaging listicles.",
                icon: (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                ),
                gradient: pageTheme.contentSections.iconGradients.cyan,
                bgGlow: currentTheme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-500/5'
              },
              {
                title: "Blogs and Websites",
                description: "Attract more visitors and engage your audience with high-quality listicles.",
                icon: (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                ),
                gradient: pageTheme.contentSections.iconGradients.orange,
                bgGlow: currentTheme === 'dark' ? 'bg-orange-500/10' : 'bg-orange-500/5'
              }
            ].map((advantage, index) => (
              <div
                key={index}
                className={`group relative ${pageTheme.contentSections.cardBackground} backdrop-filter backdrop-blur-sm border ${pageTheme.contentSections.cardBorder} rounded-2xl p-6 sm:p-8 ${pageTheme.contentSections.cardShadow} ${pageTheme.contentSections.cardBorderHover} ${pageTheme.contentSections.cardBackgroundHover} transition-all duration-500`}
              >
                <div className={`absolute inset-0 rounded-2xl ${advantage.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>

                <div className="relative z-10 mb-4 sm:mb-6">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r ${advantage.gradient} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    {advantage.icon}
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className={`text-lg sm:text-xl font-bold ${pageTheme.contentSections.cardTitle} mb-3 sm:mb-4 leading-tight ${pageTheme.contentSections.cardTitleHover} transition-colors duration-300`}>
                    {advantage.title}
                  </h3>
                  <p className={`${pageTheme.contentSections.cardDescription} text-sm sm:text-base leading-relaxed ${pageTheme.contentSections.cardDescriptionHover} transition-colors duration-300`}>
                    {advantage.description}
                  </p>
                </div>

                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${advantage.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none blur-xl`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* 新增静态模块 5 结束 */}



    </div>
  );
}

export default function BestPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BestPageContent />
    </Suspense>
  );
}
