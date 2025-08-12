# 环境配置说明

本项目支持测试环境和生产环境的配置切换。

## 环境地址

- **测试环境**: `https://api.zhuyuejoey.com/v1`
- **生产环境**: `https://api.websitelm.com/v1`

## 快速切换环境

### 方法1: 使用npm脚本（推荐）

```bash
# 切换到测试环境
npm run env:test

# 切换到生产环境
npm run env:production
```

### 方法2: 手动设置环境变量

```bash
# 测试环境
export NODE_ENV=test
export NEXT_PUBLIC_API_URL=https://api.zhuyuejoey.com/v1

# 生产环境
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://api.websitelm.com/v1
```

## 开发命令

### 测试环境开发
```bash
npm run dev:test
```

### 生产环境开发
```bash
npm run dev
```

## 构建命令

### 测试环境构建
```bash
npm run build:test
```

### 生产环境构建
```bash
npm run build
```

## 部署命令

### 测试环境部署
```bash
cd deploy-package
./deploy.sh test
```

### 生产环境部署
```bash
cd deploy-package
./deploy.sh production
```

## PM2 管理

### 启动应用
```bash
# 启动测试环境
pm2 start ecosystem.config.js --only newseopage-ai-test

# 启动生产环境
pm2 start ecosystem.config.js --only newseopage-ai
```

### 查看状态
```bash
# 查看所有应用状态
pm2 status

# 查看测试环境状态
pm2 status newseopage-ai-test

# 查看生产环境状态
pm2 status newseopage-ai
```

### 查看日志
```bash
# 查看测试环境日志
pm2 logs newseopage-ai-test

# 查看生产环境日志
pm2 logs newseopage-ai
```

### 重启应用
```bash
# 重启测试环境
pm2 restart newseopage-ai-test

# 重启生产环境
pm2 restart newseopage-ai
```

## 环境配置文件

- `env-config/test.env` - 测试环境配置
- `env-config/production.env` - 生产环境配置
- `scripts/set-env.js` - 环境切换脚本

## 注意事项

1. 切换环境后需要重启开发服务器
2. 生产环境使用 `api.websitelm.com`
3. 测试环境使用 `api.zhuyuejoey.com`
4. 聊天服务地址保持不变：`agents.zhuyuejoey.com`

## 验证环境配置

切换环境后，可以在浏览器控制台查看API配置信息：

```
🌐 API配置信息:
- 当前域名: localhost:3000
- 是否Vercel环境: false
- API URL: https://api.zhuyuejoey.com/v1 (测试环境)
```

或者在Next.js启动日志中查看：

```
🔧 Next.js API代理配置: 测试环境
🔗 API地址: https://api.zhuyuejoey.com/v1
```
