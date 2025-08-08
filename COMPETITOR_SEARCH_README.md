# 竞品搜索功能实现

## 功能概述

本功能实现了在建立WebSocket连接之前先调用竞品搜索API，并在搜索完成后检查sitemap状态的功能。

## 主要功能

### 1. 竞品搜索启动
- **API调用**: `apiClient.searchCompetitor(tempConversationId, formattedInput)`
- **功能**: 开始搜索竞争对手
- **响应处理**: 
  - 检查任务状态 (sitemapStatus)
  - 处理各种错误码 (1075, 1058, 13002)

### 2. Sitemap状态检查
- **功能**: 搜索完成之后，检查sitemapstatus网站地图的处理
- **数据流**: 这些数据通过实时聊天将后端的数据推到前端

## 实现文件

### 1. 服务层
- `src/services/chatRoomService.ts` - 增强的聊天室服务
  - 新增 `startCompetitorSearch()` 方法
  - 新增 `checkSitemapStatus()` 方法

### 2. Hook层
- `src/hooks/useChatRoom.ts` - 增强的聊天室Hook
  - 新增竞品搜索状态管理
  - 新增sitemap状态管理

### 3. 组件层
- `src/components/research-tool/utils/MessageHandler.ts` - 增强的消息处理器
  - 新增竞品搜索状态处理
  - 新增sitemap状态处理
  - 新增WebSocket消息处理

- `src/components/research-tool/components/CompetitorSearchStatusBar.tsx` - 竞品搜索状态栏
  - 显示竞品搜索进度
  - 显示sitemap处理进度
  - 实时状态更新

- `src/components/research-tool/ResearchTool.tsx` - 主研究工具组件
  - 集成竞品搜索功能
  - 集成状态栏显示

## 使用流程

1. **用户输入域名**
2. **启动竞品搜索**
   - 调用 `apiClient.searchCompetitor()`
   - 处理各种响应状态
3. **检查Sitemap状态**
   - 调用 `apiClient.getWebsiteSitemap()`
   - 实时更新处理进度
4. **WebSocket连接**
   - 建立实时通信连接
   - 接收后端推送的状态更新

## 错误处理

### 错误码说明
- **1075**: There is a task in progress. Please select from the left chat list
- **1058**: Encountered a network error. Please try again.
- **13002**: Please subscribe before starting a task.

### 状态处理
- **竞品搜索状态**: started → processing → completed/failed
- **Sitemap状态**: processing → completed/failed

## WebSocket消息类型

### 竞品搜索消息
```json
{
  "type": "competitor_search",
  "status": "started|processing|completed|failed",
  "progress": 50,
  "competitorsCount": 5,
  "error": "错误信息"
}
```

### Sitemap状态消息
```json
{
  "type": "sitemap_status",
  "status": "processing|completed|failed",
  "progress": 75,
  "message": "处理中...",
  "error": "错误信息"
}
```

### 任务状态消息
```json
{
  "type": "task_status",
  "status": "started|processing|completed|failed",
  "progress": 60,
  "error": "错误信息"
}
```

## 状态栏功能

### 竞品搜索状态栏
- 显示当前搜索进度
- 显示找到的竞争对手数量
- 显示错误信息
- 可展开查看详细信息

### 集成位置
- 位于聊天输入框上方
- 与任务状态栏并列显示
- 支持展开/收起功能

## 技术特点

1. **实时更新**: 通过WebSocket接收后端推送的状态更新
2. **错误处理**: 完善的错误码处理和用户提示
3. **状态管理**: 统一的状态管理和UI更新
4. **用户体验**: 清晰的状态显示和进度指示
5. **可扩展性**: 模块化设计，易于扩展新功能

## 测试

可以通过以下方式测试功能：

1. 输入域名启动竞品搜索
2. 观察状态栏的进度更新
3. 检查WebSocket消息的接收
4. 验证错误处理机制

## 注意事项

1. 确保API端点正确配置
2. WebSocket连接需要正确的认证
3. 错误处理要考虑网络异常情况
4. 状态更新要考虑并发情况
