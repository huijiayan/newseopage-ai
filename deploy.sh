#!/bin/bash

# 部署脚本
set -e

echo "🚀 开始部署 newseopage.ai 到生产环境..."

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
node --version
npm --version

# 安装依赖
echo "📦 安装依赖..."
npm ci

# 运行测试（如果有的话）
echo "🧪 运行测试..."
npm run lint

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建结果
if [ -d ".next" ]; then
    echo "✅ 构建成功！"
else
    echo "❌ 构建失败！"
    exit 1
fi

echo "🎉 部署准备完成！"

# 部署选项
echo ""
echo "请选择部署方式："
echo "1. Vercel 部署（推荐）"
echo "2. Docker 部署"
echo "3. 传统服务器部署"
echo "4. 仅构建"

read -p "请输入选择 (1-4): " choice

case $choice in
    1)
        echo "🚀 部署到 Vercel..."
        echo "请确保已安装 Vercel CLI: npm i -g vercel"
        echo "然后运行: vercel --prod"
        ;;
    2)
        echo "🐳 构建 Docker 镜像..."
        docker build -t newseopage-ai .
        echo "✅ Docker 镜像构建完成！"
        echo "运行命令: docker run -p 3000:3000 newseopage-ai"
        ;;
    3)
        echo "🖥️  传统服务器部署..."
        echo "请将以下文件上传到服务器："
        echo "- .next/"
        echo "- public/"
        echo "- package.json"
        echo "- package-lock.json"
        echo ""
        echo "然后在服务器上运行："
        echo "npm ci --only=production"
        echo "npm start"
        ;;
    4)
        echo "✅ 构建完成！"
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo "🎉 部署流程完成！" 