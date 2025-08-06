#!/bin/bash

echo "🚀 开始重新部署到Vercel..."

# 清理缓存
echo "🧹 清理缓存..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .vercel

# 重新安装依赖
echo "📦 重新安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 部署到Vercel
echo "🚀 部署到Vercel..."
vercel --prod

echo "✅ 部署完成！"
echo "📝 请检查Vercel控制台获取新的部署URL" 