#!/bin/bash

# newseopage.ai 快速部署脚本

echo "🚀 开始部署 newseopage.ai..."

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
node --version
npm --version

# 安装依赖
echo "📦 安装依赖..."
npm ci --only=production

# 创建环境变量文件
echo "🔧 设置环境变量..."
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://api.websitelm.com/v1
NEXT_PUBLIC_CHAT_API_URL=https://agents.zhuyuejoey.com
NEXT_PUBLIC_CHAT_WS_URL=wss://agents.zhuyuejoey.com
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
EOF

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装 PM2..."
    npm install -g pm2
fi

# 启动应用
echo "🚀 启动应用..."
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup

echo "✅ 部署完成！"
echo "📊 查看应用状态: pm2 status"
echo "📝 查看日志: pm2 logs newseopage-ai"
echo "🔄 重启应用: pm2 restart newseopage-ai" 