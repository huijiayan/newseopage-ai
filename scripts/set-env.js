#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envType = process.argv[2];

if (!envType || !['test', 'production'].includes(envType)) {
  console.log('❌ 请指定环境类型: test 或 production');
  console.log('使用方法: node scripts/set-env.js [test|production]');
  console.log('示例: node scripts/set-env.js test');
  process.exit(1);
}

const envConfigPath = path.join(__dirname, '..', 'env-config', `${envType}.env`);
const targetPath = path.join(__dirname, '..', '.env.local');

try {
  // 读取环境配置文件
  const envConfig = fs.readFileSync(envConfigPath, 'utf8');
  
  // 写入到 .env.local
  fs.writeFileSync(targetPath, envConfig);
  
  console.log(`✅ 环境配置已切换到: ${envType}`);
  console.log(`📁 配置文件: ${targetPath}`);
  console.log(`🔗 API地址: ${envType === 'test' ? 'https://api.zhuyuejoey.com/v1' : 'https://api.websitelm.com/v1'}`);
  
} catch (error) {
  console.error('❌ 环境配置切换失败:', error.message);
  process.exit(1);
}
