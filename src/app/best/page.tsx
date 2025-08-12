"use client";

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Hero } from "@/components/ui/Hero";
import { ResearchTool, injectResearchToolStyles } from '@/components/research-tool';

function BestPageContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversationId');
  

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
