#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 环境配置测试脚本');
console.log('==================');

// 检查环境配置文件
const envConfigDir = path.join(__dirname, '..', 'env-config');
const testEnvPath = path.join(envConfigDir, 'test.env');
const productionEnvPath = path.join(envConfigDir, 'production.env');

console.log('\n📁 环境配置文件检查:');
if (fs.existsSync(testEnvPath)) {
  console.log('✅ 测试环境配置: env-config/test.env');
  const testConfig = fs.readFileSync(testEnvPath, 'utf8');
  const apiUrl = testConfig.match(/NEXT_PUBLIC_API_URL=(.+)/)?.[1];
  console.log(`   API地址: ${apiUrl}`);
} else {
  console.log('❌ 测试环境配置缺失: env-config/test.env');
}

if (fs.existsSync(productionEnvPath)) {
  console.log('✅ 生产环境配置: env-config/production.env');
  const productionConfig = fs.readFileSync(productionEnvPath, 'utf8');
  const apiUrl = productionConfig.match(/NEXT_PUBLIC_API_URL=(.+)/)?.[1];
  console.log(`   API地址: ${apiUrl}`);
} else {
  console.log('❌ 生产环境配置缺失: env-config/production.env');
}

// 检查package.json脚本
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log('\n📦 Package.json脚本检查:');
  
  const scripts = packageJson.scripts || {};
  if (scripts['env:test']) {
    console.log('✅ 测试环境切换脚本: npm run env:test');
  } else {
    console.log('❌ 测试环境切换脚本缺失');
  }
  
  if (scripts['env:production']) {
    console.log('✅ 生产环境切换脚本: npm run env:production');
  } else {
    console.log('❌ 生产环境切换脚本缺失');
  }
  
  if (scripts['dev:test']) {
    console.log('✅ 测试环境开发脚本: npm run dev:test');
  } else {
    console.log('❌ 测试环境开发脚本缺失');
  }
}

// 检查Next.js配置
const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  console.log('\n⚙️  Next.js配置检查:');
  
  if (nextConfig.includes('api.zhuyuejoey.com')) {
    console.log('✅ 测试环境API地址已配置');
  } else {
    console.log('❌ 测试环境API地址未配置');
  }
  
  if (nextConfig.includes('api.websitelm.com')) {
    console.log('✅ 生产环境API地址已配置');
  } else {
    console.log('❌ 生产环境API地址未配置');
  }
  
  if (nextConfig.includes('NODE_ENV === \'test\'')) {
    console.log('✅ 环境检测逻辑已配置');
  } else {
    console.log('❌ 环境检测逻辑未配置');
  }
}

// 检查部署配置
const ecosystemPath = path.join(__dirname, '..', 'deploy-package', 'ecosystem.config.js');
if (fs.existsSync(ecosystemPath)) {
  const ecosystem = fs.readFileSync(ecosystemPath, 'utf8');
  console.log('\n🚀 PM2部署配置检查:');
  
  if (ecosystem.includes('newseopage-ai-test')) {
    console.log('✅ 测试环境PM2配置已添加');
  } else {
    console.log('❌ 测试环境PM2配置缺失');
  }
  
  if (ecosystem.includes('api.zhuyuejoey.com')) {
    console.log('✅ 测试环境API地址已配置');
  } else {
    console.log('❌ 测试环境API地址未配置');
  }
}

console.log('\n🎯 使用说明:');
console.log('1. 切换到测试环境: npm run env:test');
console.log('2. 启动测试环境开发: npm run dev:test');
console.log('3. 切换到生产环境: npm run env:production');
console.log('4. 启动生产环境开发: npm run dev');
console.log('\n📚 详细说明请查看: ENVIRONMENT_SETUP.md');
