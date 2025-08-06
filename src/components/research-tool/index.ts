// 对应老代码的组件导出文件，方便在新项目中使用
// 统一导出所有研究工具相关的组件和工具

export { default as ResearchTool } from './ResearchTool';
export { TaskStatusBar } from './components/TaskStatusBar';
export { useResearchTool } from './hooks/useResearchTool';
export { useTheme } from './hooks/useTheme';
export { MessageHandler } from './utils/MessageHandler';
export * from './utils/research-tool-utils';
export * from '@/types/research-tool';

// 样式注入函数
export { injectResearchToolStyles } from './utils/research-tool-utils';

// 真实API客户端
export { default as apiClient } from './utils/mock-api';