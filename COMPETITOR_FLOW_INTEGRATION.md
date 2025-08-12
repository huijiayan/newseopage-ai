# 竞争对手搜索流程集成指南

本文档描述了如何将**竞争对手搜索 → 域名匹配 → WebSocket连接**的完整流程集成到您的项目中，替代原有的SSE（Server-Sent Events）实现。

## 🏗️ 架构概览

新的集成方案包含以下核心组件：

```
├── src/services/
│   ├── competitorSearchService.ts    # 竞争对手搜索服务
│   └── webSocketService.ts           # WebSocket连接服务
├── src/hooks/
│   └── useCompetitorFlow.ts          # 完整流程管理Hook
├── src/components/
│   ├── CompetitorFlow.tsx            # 完整UI演示组件
│   └── research-tool/
│       └── CompetitorSearchIntegration.tsx  # 无UI集成组件
└── src/examples/
    └── ResearchToolIntegrationExample.tsx   # 集成示例
```

## 🔄 完整流程

1. **域名处理与验证** - 用户输入域名，系统验证格式并标准化
2. **竞争对手搜索** - 调用API搜索相关竞争对手
3. **域名匹配** - 并行查找websiteId以获取网站信息
4. **WebSocket连接** - 建立实时连接以接收后续处理消息
5. **消息处理** - 处理各种类型的WebSocket消息（替代原有SSE）

## 🚀 快速开始

### 1. 基础使用

```tsx
import { useCompetitorFlow } from '@/hooks/useCompetitorFlow';

function MyComponent() {
  const competitorFlow = useCompetitorFlow({
    conversationId: 'your-conversation-id',
    onCompetitorsFound: (competitors, websiteId) => {
      console.log('找到竞争对手:', competitors);
    },
    onWebSocketMessage: (message) => {
      console.log('收到消息:', message);
    },
    onWebSocketConnected: () => {
      console.log('WebSocket已连接');
    }
  });

  const handleStart = async () => {
    try {
      const result = await competitorFlow.executeFullFlow(
        'seopage.ai', 
        'conversation-123'
      );
      console.log('流程完成:', result);
    } catch (error) {
      console.error('流程失败:', error);
    }
  };

  return (
    <div>
      <button onClick={handleStart}>开始流程</button>
      <div>状态: {competitorFlow.isWebSocketConnected ? '已连接' : '未连接'}</div>
    </div>
  );
}
```

### 2. 集成到现有ResearchTool

```tsx
import { useCompetitorSearchIntegration } from '@/components/research-tool/CompetitorSearchIntegration';

function ExistingResearchTool() {
  const competitorIntegration = useCompetitorSearchIntegration({
    conversationId: yourConversationId,
    domain: userInputDomain,
    onWebSocketMessage: (message) => {
      // 替代原有的SSE消息处理逻辑
      handleWebSocketMessage(message);
    },
    onCompetitorsFound: (competitors, websiteId) => {
      // 更新UI显示竞争对手列表
      setCompetitors(competitors);
      setWebsiteId(websiteId);
    },
    onWebSocketConnected: () => {
      // WebSocket连接成功，可以开始发送消息
      setIsConnected(true);
    }
  });

  // 启动完整流程
  const startFlow = async (domain: string) => {
    await competitorIntegration.startFlow(domain, conversationId);
  };

  return (
    // 您的现有UI组件
    <YourExistingUI onDomainSubmit={startFlow} />
  );
}
```

## 🔧 API参考

### useCompetitorFlow Hook

```tsx
interface CompetitorFlowConfig {
  conversationId?: string | null;
  onCompetitorsFound?: (competitors: string[], websiteId?: string) => void;
  onWebsiteIdFound?: (websiteId: string, matchedWebsite?: any) => void;
  onWebSocketMessage?: (message: WebSocketMessage) => void;
  onWebSocketConnected?: () => void;
  onError?: (error: string) => void;
}

const {
  // 状态
  isSearching,
  isMatchingDomain,
  isConnectingWebSocket,
  isWebSocketConnected,
  competitors,
  websiteId,
  
  // 方法
  searchCompetitors,
  findWebsiteId,
  connectWebSocket,
  sendWebSocketMessage,
  executeFullFlow,
  resetFlow
} = useCompetitorFlow(config);
```

### WebSocket消息类型

系统支持以下WebSocket消息类型（替代原有SSE）：

```tsx
interface WebSocketMessage {
  id?: string;
  type: 'Info' | 'Agent' | 'Error' | 'Html' | 'Codes' | 'Crawler_Images' | 'Crawler_Headers' | 'Crawler_Footers';
  content: any;
  step?: string;
  timestamp?: string;
  status?: string;
}
```

## 🔄 迁移指南

### 从SSE迁移到WebSocket

1. **替换连接逻辑**
   ```tsx
   // 旧的SSE代码
   const connectSSE = () => {
     eventSource = new EventSource(sseUrl);
     eventSource.onmessage = handleMessage;
   };

   // 新的WebSocket代码
   const { connectWebSocket } = useCompetitorFlow({
     onWebSocketMessage: handleMessage
   });
   await connectWebSocket(conversationId);
   ```

2. **消息处理统一**
   ```tsx
   // 统一的消息处理函数
   const handleWebSocketMessage = (message: WebSocketMessage) => {
     switch (message.type) {
       case 'Info':
         // 处理信息消息
         break;
       case 'Agent':
         // 处理Agent消息
         break;
       case 'Error':
         // 处理错误消息
         break;
       case 'Html':
         // 处理HTML流式内容
         break;
       case 'Codes':
         // 处理代码生成完成
         break;
       // ... 其他类型
     }
   };
   ```

### 关键改进点

1. **去除SSE依赖** - 完全移除EventSource相关代码
2. **统一消息格式** - 标准化WebSocket消息结构
3. **更好的错误处理** - 统一的错误处理和重连机制
4. **状态管理** - 更清晰的状态管理和生命周期控制

## 🎯 集成示例

### 完整集成示例

查看 `src/examples/ResearchToolIntegrationExample.tsx` 了解完整的集成示例，包括：

- ✅ 域名输入和验证
- ✅ 竞争对手搜索
- ✅ WebSocket连接管理
- ✅ 消息处理和UI更新
- ✅ 错误处理和状态管理

### 演示组件

查看 `src/components/CompetitorFlow.tsx` 了解完整的UI演示组件，包括：

- 🎨 完整的用户界面
- 📊 实时状态显示
- 📝 详细的执行日志
- 🔧 调试和测试功能

## 🐛 故障排除

### 常见问题

1. **WebSocket连接失败**
   - 检查token是否有效
   - 确认conversationId格式正确
   - 检查网络连接

2. **竞争对手搜索失败**
   - 验证域名格式
   - 检查API限制
   - 确认订阅状态

3. **域名匹配失败**
   - 检查域名是否存在于系统中
   - 尝试不同的域名格式

### 调试技巧

1. **启用详细日志**
   ```tsx
   const competitorFlow = useCompetitorFlow({
     // ... 其他配置
     onError: (error) => {
       console.error('Flow error:', error);
     }
   });
   ```

2. **检查连接状态**
   ```tsx
   console.log('WebSocket状态:', competitorFlow.getConnectionState());
   console.log('是否已连接:', competitorFlow.isWebSocketConnected);
   ```

## 📚 相关文档

- [WebSocket API文档](src/lib/api/websocket-chat-v2.ts)
- [竞争对手搜索API](src/lib/api/index.ts)
- [研究工具组件](src/components/research-tool/)

## 🤝 贡献

如果您发现问题或有改进建议，请：

1. 检查现有的issues
2. 创建详细的bug报告或功能请求
3. 提交PR并包含测试用例

---

## 📄 许可证

本项目遵循与主项目相同的许可证。
