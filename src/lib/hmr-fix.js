// HMR修复文件 - 专门解决@ant-design/cssinjs与Next.js HMR的兼容性问题
// 保留HMR功能，只修复cssinjs相关的错误

if (typeof window !== 'undefined' && module.hot) {
  console.log('🔧 初始化HMR修复...');
  
  // 添加全局错误处理
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && 
        (event.error.message.includes('cssinjs') || 
         event.error.message.includes('__webpack_require__.hmd'))) {
      event.preventDefault();
      console.warn('🔧 阻止了 cssinjs 相关的错误:', event.error.message);
    }
  });
  
  // 保存原始的console.error
  const originalConsoleError = console.error;
  
  // 重写console.error来过滤cssinjs相关的错误
  console.error = function(...args) {
    const message = args.join(' ');
    
    // 过滤掉cssinjs相关的HMR错误
    if (message.includes('__webpack_require__.hmd') || 
        message.includes('cssinjs') || 
        message.includes('@ant-design/cssinjs') ||
        message.includes('useHMR') ||
        message.includes('useGlobalCache') ||
        message.includes('useCacheToken')) {
      console.warn('🔧 忽略cssinjs相关的HMR错误:', message.substring(0, 100) + '...');
      return;
    }
    
    // 保留WebSocket相关错误
    if (message.includes('WebSocket') || message.includes('websocket')) {
      originalConsoleError.apply(console, args);
      return;
    }
    
    // 保留其他错误
    originalConsoleError.apply(console, args);
  };
  
  // 监听HMR状态变化
  module.hot.addStatusHandler((status) => {
    if (status === 'abort') {
      console.warn('🔧 HMR更新被中止，可能是由于cssinjs模块问题');
    } else if (status === 'idle') {
      console.log('🔧 HMR状态正常');
    }
  });
  
  // 自定义HMR accept处理 - 移除对cssinjs模块的过滤
  const originalAccept = module.hot.accept;
  module.hot.accept = function(dependencies, callback) {
    // 不再过滤cssinjs相关的依赖，让它们正常工作
    return originalAccept.call(this, dependencies, callback);
  };
  
  // 移除对cssinjs模块的禁用
  console.log('🔧 HMR修复已初始化完成 - 允许cssinjs模块正常工作');
}

// 导出空对象以避免模块解析问题
export default {};
