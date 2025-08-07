# API CORS 问题修复说明

## 问题描述

在Vercel部署环境中，前端应用无法直接访问后端API，出现CORS（跨域资源共享）错误：

```
Access to XMLHttpRequest at 'https://api.websitelm.com/v1/login' from origin 'https://newseopage-ai.vercel.app' has been blocked by CORS policy
```

## 解决方案

### 1. Next.js 配置修改

在 `next.config.js` 中添加了API代理配置：

```javascript
// API代理配置 - 解决CORS问题
async rewrites() {
  return [
    {
      source: '/api/v1/:path*',
      destination: 'https://api.websitelm.com/v1/:path*',
    },
  ];
},
```

### 2. API客户端配置修改

在 `src/lib/api/index.ts` 中添加了Vercel环境检测：

```javascript
// 检测是否在Vercel环境中
const isVercel = typeof window !== 'undefined' && (
  window.location.hostname.includes('vercel.app') || 
  window.location.hostname.includes('newseopage-ai.vercel.app')
);

// API URL配置
const API_URL = isVercel ? '/api/v1' : (process.env.NEXT_PUBLIC_API_URL || 'https://api.websitelm.com/v1');
```

### 3. API代理路由

创建了 `src/app/api/v1/[...path]/route.ts` 来处理所有API代理请求，包括：

- GET 请求代理
- POST 请求代理  
- PUT 请求代理
- DELETE 请求代理
- OPTIONS 请求处理（CORS预检）

### 4. 测试页面

创建了 `/test-api` 页面来验证API代理是否正常工作。

## 修复效果

修复后，在Vercel环境中的API调用将：

1. **自动检测Vercel环境**：通过域名检测判断是否在Vercel部署
2. **使用代理路由**：所有API请求通过 `/api/v1/*` 代理到后端
3. **解决CORS问题**：服务器端代理避免了浏览器的CORS限制
4. **保持功能完整**：所有原有的登录、注册等功能保持不变

## 测试方法

1. 访问 `/test-api` 页面
2. 点击"开始测试"按钮
3. 查看测试结果，确认所有API都能正常访问

## 环境兼容性

- **本地开发**：直接使用原始API地址
- **Vercel部署**：自动使用代理路由
- **其他环境**：可通过环境变量配置

## 注意事项

1. 确保后端API服务器正常运行
2. 代理路由会转发所有请求头，包括认证信息
3. 错误处理已完善，会显示详细的错误信息
4. 调试信息会在控制台输出，方便排查问题
