#!/bin/bash

# newseopage.ai 快速部署脚本

# 获取部署环境参数
ENV=${1:-production}

if [[ "$ENV" != "production" && "$ENV" != "test" ]]; then
    echo "❌ 无效的环境参数: $ENV"
    echo "使用方法: ./deploy.sh [production|test]"
    echo "示例: ./deploy.sh test"
    exit 1
fi

echo "🚀 开始部署 newseopage.ai (环境: $ENV)..."

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
node --version
npm --version

# 安装依赖
echo "📦 安装依赖..."
npm ci --only=production

# 根据环境设置API地址
if [[ "$ENV" == "test" ]]; then
    API_URL="https://api.zhuyuejoey.com/v1"
    echo "🔧 设置测试环境API地址: $API_URL"
else
    API_URL="https://api.websitelm.com/v1"
    echo "🔧 设置生产环境API地址: $API_URL"
fi

# 创建环境变量文件
echo "🔧 设置环境变量..."
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=$API_URL
NEXT_PUBLIC_CHAT_API_URL=https://agents.zhuyuejoey.com
NEXT_PUBLIC_CHAT_WS_URL=wss://agents.zhuyuejoey.com
NODE_ENV=$ENV
NEXT_TELEMETRY_DISABLED=1
EOF

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装 PM2..."
    npm install -g pm2
fi

# 启动应用
echo "🚀 启动应用..."
if [[ "$ENV" == "test" ]]; then
    pm2 start ecosystem.config.js --only newseopage-ai-test
    echo "📊 查看测试环境状态: pm2 status newseopage-ai-test"
    echo "📝 查看测试环境日志: pm2 logs newseopage-ai-test"
    echo "🔄 重启测试环境: pm2 restart newseopage-ai-test"
else
    pm2 start ecosystem.config.js --only newseopage-ai
    echo "📊 查看生产环境状态: pm2 status newseopage-ai"
    echo "📝 查看生产环境日志: pm2 logs newseopage-ai"
    echo "🔄 重启生产环境: pm2 restart newseopage-ai"
fi

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup

echo "✅ 部署完成！"
echo "🌍 当前环境: $ENV"
echo "🔗 API地址: $API_URL" 