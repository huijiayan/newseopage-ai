# WebSocket异常断开解决方案

## 问题描述

WebSocket连接在以下情况下可能出现异常断开：

1. **网络波动**：网络不稳定导致连接中断
2. **服务器重启**：后端服务重启时连接丢失
3. **超时断开**：长时间无活动导致连接超时
4. **客户端切换**：用户切换网络或设备时连接中断
5. **浏览器限制**：浏览器对WebSocket连接的限制

## 解决方案

### 1. 自动重连机制

我们实现了智能的自动重连机制，包括：

- **指数退避策略**：重连间隔逐渐增加，避免频繁重连
- **最大重连次数限制**：防止无限重连
- **连接状态监控**：实时监控连接状态
- **智能重连触发**：只在异常断开时重连

### 2. 连接健康检查

- **心跳检测**：定期检查连接状态
- **超时监控**：监控连接超时情况
- **性能指标**：收集连接性能数据

### 3. 错误处理和诊断

- **详细错误日志**：记录所有连接相关错误
- **问题诊断**：自动诊断连接问题
- **解决建议**：提供针对性的解决建议

## 使用方法

### 基本使用

```tsx
import { WebSocketConnection } from '@/components/research-tool/components/WebSocketConnection';

function MyComponent() {
  const wsRef = useRef<WebSocketConnectionRef>(null);

  return (
    <WebSocketConnection
      ref={wsRef}
      conversationId="your-conversation-id"
      domain="your-domain.com"
      autoConnect={true}
      enableAutoReconnect={true}
      maxReconnectAttempts={5}
      reconnectDelay={2000}
      onMessage={(data) => console.log('收到消息:', data)}
      onError={(error) => console.error('连接错误:', error)}
      onClose={(event) => console.log('连接关闭:', event)}
      onOpen={() => console.log('连接成功')}
    />
  );
}
```

### 高级监控

```tsx
import { WebSocketStatusMonitor } from '@/components/research-tool/components/WebSocketStatusMonitor';

function WebSocketMonitor({ websocket, url }) {
  return (
    <WebSocketStatusMonitor
      websocket={websocket}
      url={url}
      showDetails={true}
      refreshInterval={1000}
      onReconnect={() => {
        // 手动重连逻辑
        console.log('手动重连');
      }}
    />
  );
}
```

### 手动控制

```tsx
// 获取连接状态
const isConnected = wsRef.current?.isConnected;
const connectionState = wsRef.current?.connectionState;

// 手动重连
wsRef.current?.reconnect();

// 发送消息
const success = wsRef.current?.sendMessage({
  type: 'message',
  content: 'Hello World'
});
```

## 配置选项

### WebSocketConnection 组件

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `conversationId` | string | - | 会话ID（必需） |
| `domain` | string | - | 域名参数 |
| `autoConnect` | boolean | false | 是否自动连接 |
| `enableAutoReconnect` | boolean | true | 是否启用自动重连 |
| `maxReconnectAttempts` | number | 5 | 最大重连次数 |
| `reconnectDelay` | number | 2000 | 重连延迟（毫秒） |

### WebSocketChatV2 类

```typescript
// 启用/禁用自动重连
service.enableAutoReconnect();
service.disableAutoReconnect();

// 设置重连参数
service.setMaxReconnectAttempts(10);
service.setReconnectDelay(5000);

// 手动重连
service.reconnect();

// 获取连接信息
const state = service.getConnectionState();
const attempts = service.getReconnectAttempts();
```

## 监控和诊断

### 实时状态监控

- **连接状态**：OPEN, CONNECTING, CLOSING, CLOSED
- **连接质量**：excellent, good, poor, disconnected
- **性能指标**：连接次数、成功率、平均连接时间
- **错误统计**：错误数量、错误类型

### 问题诊断

系统会自动检测以下问题：

1. **连接关闭**：检测到连接异常关闭
2. **连接超时**：连接建立时间过长
3. **连接质量差**：错误率过高
4. **长时间无消息**：可能连接已断开

### 诊断报告

生成详细的诊断报告，包括：

- 连接状态信息
- 性能指标
- 检测到的问题
- 解决建议
- 时间戳

## 最佳实践

### 1. 错误处理

```typescript
onError={(error) => {
  console.error('WebSocket错误:', error);
  // 记录错误日志
  // 显示用户友好的错误信息
  // 尝试恢复连接
}}
```

### 2. 重连策略

```typescript
// 推荐配置
enableAutoReconnect={true}
maxReconnectAttempts={5}
reconnectDelay={2000}

// 生产环境可以增加重连次数
maxReconnectAttempts={10}
reconnectDelay={1000}
```

### 3. 状态管理

```typescript
// 监听连接状态变化
useEffect(() => {
  if (wsRef.current?.isConnected) {
    // 连接成功后的处理
    console.log('WebSocket已连接');
  } else if (wsRef.current?.isConnecting) {
    // 连接中的处理
    console.log('WebSocket连接中...');
  } else {
    // 连接断开后的处理
    console.log('WebSocket已断开');
  }
}, [wsRef.current?.isConnected, wsRef.current?.isConnecting]);
```

### 4. 消息处理

```typescript
onMessage={(data) => {
  try {
    // 处理消息
    handleMessage(data);
  } catch (error) {
    console.error('消息处理错误:', error);
    // 错误处理逻辑
  }
}}
```

## 故障排除

### 常见问题

1. **连接频繁断开**
   - 检查网络稳定性
   - 增加重连延迟
   - 检查服务器配置

2. **重连失败**
   - 检查认证token是否有效
   - 确认服务器是否在线
   - 检查网络防火墙设置

3. **消息丢失**
   - 启用消息队列
   - 检查消息去重逻辑
   - 监控连接状态

### 调试技巧

1. **启用详细日志**
   ```typescript
   // 在开发环境下查看详细日志
   if (process.env.NODE_ENV === 'development') {
     console.log('WebSocket调试信息:', debugInfo);
   }
   ```

2. **使用状态监控组件**
   ```tsx
   <WebSocketStatusMonitor
     websocket={websocket}
     url={url}
     showDetails={true}
   />
   ```

3. **生成诊断报告**
   ```typescript
   const report = websocketDebugger.generateDiagnosticReport(websocket, url);
   console.log('诊断报告:', report);
   ```

## 性能优化

### 1. 连接池管理

- 避免创建过多连接
- 及时清理无用连接
- 使用连接复用

### 2. 消息优化

- 启用消息压缩
- 实现消息批处理
- 优化消息格式

### 3. 重连优化

- 智能重连间隔
- 避免重连风暴
- 连接状态缓存

## 总结

通过实现自动重连机制、连接健康检查和智能错误处理，我们大大提高了WebSocket连接的稳定性和可靠性。系统能够：

- 自动检测连接问题
- 智能重连恢复
- 提供详细的监控信息
- 生成诊断报告
- 给出解决建议

这些改进确保了WebSocket连接在各种网络环境下都能保持稳定，为用户提供更好的体验。
