'use client';
import React, { forwardRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface TestimonialItem {
  id: number;
  quote: string;
  avatar: string;
  name: string;
  role: string;
}

const CustomizableResearchUI = forwardRef<HTMLDivElement, {}>(({}, ref) => {
  const { theme } = useTheme();
  const currentTheme = theme;
  
  // 简化的主题配置
  const pageTheme = {
    contentSections: {
      background: 'bg-white dark:bg-slate-900',
      decorativeGlow1: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
      decorativeGlow2: 'bg-gradient-to-tl from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
      sectionTitleGradient: 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
      sectionSubtitle: 'text-gray-600 dark:text-gray-300',
      cardDescription: 'text-gray-700 dark:text-gray-200',
      cardTitle: 'text-gray-900 dark:text-white'
    }
  };

  const topRowTestimonials: TestimonialItem[] = [
    {
      id: 1,
      quote: "Wow, this is the kind of next level thinking and execution in Ai that is exciting and original. As a solo-preneur I've wanted to build this for years but never have organized the material. Thank you 🙏 now I have no excuses!",
      avatar: 'https://ph-avatars.imgix.net/679713/11a4f6e0-d541-4266-83ec-f7e9cc2d3a66.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=32&h=32&fit=crop&frame=1&dpr=1',
      name: 'Terrence Kelleman',
      role: 'Inventor, Mighty Wallet',
    },
    {
      id: 2,
      quote: "🎉 Huge congrats on the launch, @joey_zhu1 & SEOPage.ai team! Love how you empower brands to steal competitor traffic with SEO-optimized comparison pages—genius use of AI to automate analysis and deployment! 🔥 One suggestion: Could you add dynamic \"alternative page\" performance dashboards (e.g., real-time keyword ranking vs competitors)? This would help users tweak content faster. 👀",
      avatar: 'https://ph-avatars.imgix.net/7267714/d2baf1e8-56f4-4ba1-8958-77b856fc8e66.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=32&h=32&fit=crop&frame=1&dpr=1',
      name: 'Zepeng She',
      role: 'Co-founder of Tate-A-Tate AI',
    },
    {
      id: 3,
      quote: "interesting. seems like a good example for what marketing philosophy finally leads to, intellectually, morally, creatively and in terms of its understanding of \"productivity\"",
      avatar: 'https://ph-avatars.imgix.net/5749734/3b7eb273-0c9a-4b4f-93ab-e09782b05bc8.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=32&h=32&fit=crop&frame=1&dpr=1',
      name: 'O Schultz',
      role: 'creative research',
    },
    {
      id: 4,
      quote: "Kudos to the team for creating a tool that simplifies a complex task.",
      avatar: 'https://ph-avatars.imgix.net/5307889/1a99b696-14ad-4a29-aeac-3c77ab3ca62d.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=32&h=32&fit=crop&frame=1&dpr=1',
      name: 'lynn',
      role: 'Co-founder and hacker',
    },
    {
      id: 5,
      quote: "No tech skills needed, just smart positioning and fast execution. Big congrats on the launch!",
      avatar: 'https://ph-avatars.imgix.net/6122443/89760908-17a1-4da7-8966-e4f2d4d66513.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=32&h=32&fit=crop&frame=1&dpr=1',
      name: 'Supa Liu',
      role: 'Please call me Supa Cool',
    },
  ];

  const bottomRowTestimonials: TestimonialItem[] = [
    {
      id: 6,
      quote: "Wow, that's impressive! It sounds like your product goes above and beyond expectations by not only providing analysis but also bringing ideas to life. Congrats on creating something that truly innovates. Can't wait to see how it impacts businesses. 🚀",
      avatar: 'https://ph-avatars.imgix.net/3514778/ef1ea7f1-4c38-4980-be27-c29d415139fd.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=32&h=32&fit=crop&frame=1&dpr=1',
      name: 'Alex Cloudstar',
      role: 'Solo dev. PH #4. Let\'s go.',
    },
    {
      id: 7,
      quote: "This looks like a really smart way to tackle competitor traffic, SEOPage.ai! The AI agent concept is cool. How does it determine the key advantages to highlight on the alternative pages, especially if features are quite similar?",
      avatar: 'https://ph-avatars.imgix.net/8539542/original.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=32&h=32&fit=crop&frame=1&dpr=1',
      name: 'YX Cathy',
      role: 'GTM @viralt',
    },
    {
      id: 8,
      quote: "This tool is great! It's easy to use and highly efficient, significantly improving work efficiency. I truly find it very useful!",
      avatar: 'https://ph-avatars.imgix.net/8481607/a0558407-f13d-426d-99be-25d32d06af98.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=32&h=32&fit=crop&frame=1&dpr=1',
      name: 'Alex Liju',
      role: 'Attribuly attribution for Shopify',
    },
    {
      id: 9,
      quote: "Cool! AltPageai presents a compelling solution for businesses aiming to strategically capture competitor brand traffic. Congrats on your launch.",
      avatar: 'https://ph-avatars.imgix.net/7984703/bbc4d274-78c2-4aa8-ab53-71f32f92a39d.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=32&h=32&fit=crop&frame=1&dpr=1',
      name: 'Alex Liu',
      role: 'Developer',
    },
    {
      id: 10,
      quote: "This product angle is so amazing that it might be criticized on the suspicion of plagiarism, but it does bring in the most intuitive traffic. I wonder how search engines will face this trend.....:D",
      avatar: 'https://ph-avatars.imgix.net/5178508/dbdebeb2-0666-4f4a-a0a7-927c28157e39.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=32&h=32&fit=crop&frame=1&dpr=1',
      name: 'Yan Bingbing',
      role: 'Founder at UIPaaS',
    },
  ];

  // 创建重复内容用于无缝滚动
  const createRepeatedItems = (items: TestimonialItem[]) => {
    return [...items, ...items, ...items];
  };

  const topRowItems = createRepeatedItems(topRowTestimonials);
  const bottomRowItems = createRepeatedItems(bottomRowTestimonials);

  return (
    <div id="showcase-section" ref={ref} className={`${pageTheme.contentSections.background} py-12 sm:py-16 lg:py-20 relative overflow-hidden`}>
      <div className={`absolute inset-0 ${pageTheme.contentSections.decorativeGlow1}`}></div>
      <div className={`absolute inset-0 ${pageTheme.contentSections.decorativeGlow2}`}></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex flex-col items-center mb-6">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold ${pageTheme.contentSections.sectionTitleGradient} mb-4 sm:mb-6 px-2`}>
              🎉 We Got #1 Product of the Day! 🚀
            </h2>
            <a 
              href="https://www.producthunt.com/posts/altpage-ai?embed=true&utm_source=badge-top-post-badge&utm_medium=badge&utm_source=badge-altpage&#0045;ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mb-6 hover:scale-105 transition-transform duration-200"
            >
              <img 
                src={`https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=967689&theme=${currentTheme}&period=daily&t=1748270618907`}
                alt="SEOPage.ai - Steal competitor brand traffic with alternative pages | Product Hunt" 
                className="w-[250px] h-[54px]"
                width="250" 
                height="54" 
              />
            </a>
          </div>
          <p className={`text-lg sm:text-xl ${pageTheme.contentSections.sectionSubtitle} font-medium`}>
            👀 Let's see what users are really talking about 💬
          </p>
        </div>

        {/* Top Row - 从左到右滚动 */}
        <div className="mb-8 relative overflow-hidden">
          <div className="scroll-container-left">
            <div className="scroll-content">
              {topRowItems.map((item, index) => (
                <a
                  key={`top-${item.id}-${index}`}
                  href="https://www.producthunt.com/posts/altpage-ai?embed=true&utm_source=badge-top-post-badge&utm_medium=badge&utm_source=badge-altpage-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="testimonial-card cursor-pointer hover:scale-105 transition-transform duration-200"
                >
                  <div className="flex flex-col h-full justify-between">
                    <p className={`${pageTheme.contentSections.cardDescription} mb-4 text-sm leading-relaxed line-clamp-4 flex-1`}>{item.quote}</p>
                    <div className="flex items-center mt-auto">
                      <img 
                        src={item.avatar} 
                        alt={item.name} 
                        className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0"
                        onError={(e) => {(e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';}} 
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className={`${pageTheme.contentSections.cardTitle} font-medium text-sm truncate`}>{item.name}</h4>
                        <p className={`${currentTheme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'} text-xs truncate`}>{item.role}</p>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
          {/* 左右淡出遮罩 */}
          <div className={`absolute top-0 left-0 w-32 h-full bg-gradient-to-r ${currentTheme === 'dark' ? 'from-slate-950' : 'from-white'} to-transparent pointer-events-none z-10`}></div>
          <div className={`absolute top-0 right-0 w-32 h-full bg-gradient-to-l ${currentTheme === 'dark' ? 'from-slate-950' : 'from-white'} to-transparent pointer-events-none z-10`}></div>
        </div>

        {/* Bottom Row - 从右到左滚动 */}
        <div className="relative overflow-hidden">
          <div className="scroll-container-right">
            <div className="scroll-content">
              {bottomRowItems.map((item, index) => (
                <a
                  key={`bottom-${item.id}-${index}`}
                  href="https://www.producthunt.com/posts/altpage-ai?embed=true&utm_source=badge-top-post-badge&utm_medium=badge&utm_source=badge-altpage-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="testimonial-card cursor-pointer hover:scale-105 transition-transform duration-200"
                >
                  <div className="flex flex-col h-full justify-between">
                    <p className={`${pageTheme.contentSections.cardDescription} mb-4 text-sm leading-relaxed line-clamp-4 flex-1`}>{item.quote}</p>
                    <div className="flex items-center mt-auto">
                      <img 
                        src={item.avatar} 
                        alt={item.name} 
                        className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0"
                        onError={(e) => {(e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';}} 
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className={`${pageTheme.contentSections.cardTitle} font-medium text-sm truncate`}>{item.name}</h4>
                        <p className={`${currentTheme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'} text-xs truncate`}>{item.role}</p>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
          {/* 左右淡出遮罩 */}
          <div className={`absolute top-0 left-0 w-32 h-full bg-gradient-to-r ${currentTheme === 'dark' ? 'from-slate-950' : 'from-white'} to-transparent pointer-events-none z-10`}></div>
          <div className={`absolute top-0 right-0 w-32 h-full bg-gradient-to-l ${currentTheme === 'dark' ? 'from-slate-950' : 'from-white'} to-transparent pointer-events-none z-10`}></div>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
            .scroll-container-left,
            .scroll-container-right {
              overflow: hidden;
              white-space: nowrap;
            }

            .scroll-content {
              display: flex;
              gap: 1rem;
              animation-duration: 30s;
              animation-timing-function: linear;
              animation-iteration-count: infinite;
            }

            .scroll-container-left .scroll-content {
              animation-name: scrollLeft;
            }

            .scroll-container-right .scroll-content {
              animation-name: scrollRight;
            }

            .testimonial-card {
              flex-shrink: 0;
              background: ${currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)'};
              backdrop-filter: blur(4px);
              border-radius: 0.75rem;
              width: 24rem;
              height: 12rem;
              padding: 1.5rem;
              border: 1px solid ${currentTheme === 'dark' ? 'rgba(148, 163, 184, 0.3)' : 'rgba(148, 163, 184, 0.2)'};
              white-space: normal;
              text-decoration: none;
              display: block;
            }

            .testimonial-card:hover {
              background: ${currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)'};
              border-color: ${currentTheme === 'dark' ? 'rgba(34, 211, 238, 0.4)' : 'rgba(34, 211, 238, 0.6)'};
            }

            @keyframes scrollLeft {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-33.333%);
              }
            }

            @keyframes scrollRight {
              0% {
                transform: translateX(-33.333%);
              }
              100% {
                transform: translateX(0);
              }
            }

            .line-clamp-4 {
              display: -webkit-box;
              -webkit-line-clamp: 4;
              -webkit-box-orient: vertical;
              overflow: hidden;
              white-space: normal;
            }

            /* 暂停动画当鼠标悬停时 */
            .scroll-container-left:hover .scroll-content,
            .scroll-container-right:hover .scroll-content {
              animation-play-state: paused;
            }
          `
        }} />
      </div>
    </div>
  );
});

CustomizableResearchUI.displayName = 'CustomizableResearchUI';
export default CustomizableResearchUI; 