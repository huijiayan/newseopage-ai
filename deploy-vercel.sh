#!/bin/bash

# Vercel部署优化脚本
echo "🚀 开始Vercel部署优化..."

# 清理缓存
echo "🧹 清理缓存..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .vercel/output

# 安装依赖
echo "📦 安装依赖..."
npm ci --production=false

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建结果
if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
else
    echo "❌ 构建失败！"
    exit 1
fi

# 部署到Vercel
echo "🚀 部署到Vercel..."
vercel --prod

echo "🎉 部署完成！"
echo "📝 请检查Vercel仪表板中的部署状态"
echo "🔗 如果仍有问题，请检查："
echo "   1. Vercel项目设置中的环境变量"
echo "   2. 生产环境的Framework Settings"
echo "   3. 函数超时设置" 