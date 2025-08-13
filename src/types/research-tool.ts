// 对应老代码的完整类型定义文件
// 保持与原始代码100%一致的数据结构

export interface ConversationMessage {
  id?: string;
  source?: 'user' | 'system' | 'agent';
  content: string;
  timestamp?: string;
  createdAt?: string;
  type?: string;
  isThinking?: boolean;
  showLoading?: boolean;
  logType?: string;
  step?: string;
  originalLogId?: string;
  hubPageId?: string;
  items?: any[];
  pages?: PageData[];
  pageType?: string;
  onGenerate?: () => void;
  onConfirm?: () => void;
  answer?: string;
  message?: string;
}

export interface PageData {
  hubPageId: string;
  pageTitle: string;
  description: string;
  relatedKeywords: string[];
  trafficPotential: string | number;
  difficulty: string | number;
  competitors?: string[];
  isPageGenerated: boolean;
  generatedPageId: string;
  pageType: string;
  source?: string;
  pageCategory?: string[];
  logo?: string;
}

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
}

export interface TaskStep {
  id: number;
  name: string;
  gradient: string;
  borderColor: string;
  shadowColor: string;
}

export interface LogData {
  id: string;
  type: string;
  content: any;
  step?: string;
  timestamp: string;
  currentStep?: number;
  logType?: string;
  originalLogId?: string;
  hubPageId?: string;
  earliestTimestamp?: string;
  items?: LogData[];
  isGroup?: boolean;
  originalLogIds?: string[];
}

export interface ThemeStyles {
  background?: string;
  taskStatusBar?: {
    background: string;
    currentStepText: string;
    expandedContent: {
      stepItem: {
        activeText: string;
        inactiveText: string;
        timeActiveText: string;
        timeInactiveText: string;
      };
      indicator: {
        completed: string;
        current: string;
        pending: string;
      };
      summary: {
        text: string;
        countText: string;
      };
    };
  };
  inputArea?: {
    borderRadius: string;
    background: string;
    boxShadow: string;
    text: string;
    placeholder: string;
    caretColor: string;
  };
  sendButton?: {
    borderRadius: string;
    background: string;
    border: string;
    shadow: string;
  };
  rightPanel?: {
    container: {
      border: string;
      background: string;
      borderBottom: string;
    };
    mainTabs: {
      active: {
        background: string;
        text: string;
        border: string;
      };
      inactive: {
        background: string;
        text: string;
      };
    };
  };
  apiDetailModal?: {
    background: string;
    border: string;
    borderRadius: string;
    backdropFilter: string;
    boxShadow: string;
    header: {
      borderBottom: string;
      title: string;
      closeButton: string;
    };
    statusBar: {
      background: string;
      borderBottom: string;
      text: string;
    };
    content: {
      text: string;
      scrollbarColor: string;
    };
    codeBlock: {
      background: string;
      border: string;
      text: string;
    };
  };
  agentProcessing?: {
    background: string;
    border: string;
    titleText: string;
  };
  agentMessage?: {
    text: string;
    loadingDots: string;
  };
  systemMessage?: {
    background: string;
    text: string;
    shadow: string;
    border: string;
    hoverShadow: string;
    iconColor: string;
    timestampColor: string;
  };
  userMessage?: {
    text: string;
    background: string;
  };
  successMessage?: {
    border: string;
    background: string;
    text: string;
    iconBackground: string;
    buttonBackground: string;
    buttonText: string;
    buttonHoverBackground: string;
    buttonHoverText: string;
  };
  sitemapButton?: {
    background: string;
    backgroundClass: string;
    hoverBackgroundClass: string;
    text: string;
    shadow: string;
  };
  messageCollapse?: {
    gradientOverlay: string;
    borderRadius: string;
  };
  pagesGrid?: {
    title: {
      text: string;
      background: string;
      border: string;
      highlight: string;
    };
    pageCard: {
      borderRadius: string;
      border: string;
      borderSelected: string;
      borderHover: string;
      background: string;
    };
    checkbox: {
      accentColor: string;
    };
    pageTitle: {
      text: string;
    };
    pageDescription: {
      text: string;
    };
    tdkLabel: {
      text: string;
    };
    keywordTag: {
      borderRadius: string;
      background: string;
      text: string;
    };
    competitorTag: {
      borderRadius: string;
      background: string;
      text: string;
    };
    metrics: {
      label: string;
      value: string;
    };
    viewButton: {
      borderRadius: string;
      background: string;
      boxShadow: string;
      text: string;
    };
    pageLimitNotice: {
      background: string;
      border: string;
      text: string;
      button: {
        shadow: string;
        background: string;
        backgroundHover: string;
        text: string;
        border: string;
        scale: string;
      };
    };
  };
  setBrandColorButton?: {
    background: string;
    text: string;
  };
}

export interface ApiDetailModal {
  visible: boolean;
  data: LogData | null;
}

export interface DeletePageConfirm {
  open: boolean;
  resultId: string | null;
  generatedPageId: string | null;
}

export interface ErrorModal {
  visible: boolean;
  message: string;
}

export interface ChatHistory {
  data: Array<{
    id?: string;
    message?: string;
    answer?: string;
    createdAt: string;
  }>;
}

export interface ResearchToolProps {
  conversationId?: string | null;

}

// 对应老代码中的TAG_FILTERS常量
export const TAG_FILTERS = {
  '\\[URL_GET\\]': '',  
  '\\[COMPETITOR_SELECTED\\]': '',  
  '\\[PAGES_GENERATED\\]': '',  
  // Runtime message replacements for agent processing panel text → pipeline node names
  'Finding competitors\\.\\.\\.': 'competitor_retriever',
  'Validating competitors\\.\\.\\.': 'competitor_validator',
  'Finding website sitemap\\.\\.\\.': 'generate_sitemap_planning',
} as const;

// 对应老代码中的任务时间估算
export const TASK_TIME_ESTIMATES = {
  0: { name: 'Waiting for input of URL', time: 'please make your input', tip: "Please input the url like seopage.ai"},
  1: { name: "competitor_retriever", time: "1-3 mins", tip: "Fetching competitor data" },
  2: { name: "competitor_validator", time: "1-2 mins", tip: "Validating inputs" },
  3: { name: "generate_sitemap_planning", time: "2-3 mins", tip: "Planning sitemap" },
} as const;

// 对应老代码中的默认任务步骤
export const DEFAULT_TASK_STEPS: TaskStep[] = [
  { id: 1, name: "competitor_retriever", gradient: "from-blue-500/40 to-cyan-500/40", borderColor: "border-blue-500/60", shadowColor: "shadow-blue-500/20" },
  { id: 2, name: "competitor_validator", gradient: "from-cyan-500/40 to-teal-500/40", borderColor: "border-cyan-500/60", shadowColor: "shadow-cyan-500/20" },
  { id: 3, name: "generate_sitemap_planning", gradient: "from-teal-500/40 to-green-500/40", borderColor: "border-teal-500/60", shadowColor: "shadow-teal-500/20" },
];