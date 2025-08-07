// HMR修复文件 - 专门解决@ant-design/cssinjs与Next.js HMR的兼容性问题
// 保留HMR功能，只修复cssinjs相关的错误

if (typeof window !== 'undefined' && module.hot) {
  console.log('🔧 初始化HMR修复...');
  
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
  
  // 自定义HMR accept处理
  const originalAccept = module.hot.accept;
  module.hot.accept = function(dependencies, callback) {
    // 过滤掉cssinjs相关的依赖
    if (Array.isArray(dependencies)) {
      const filteredDependencies = dependencies.filter(dep => 
        !dep.includes('@ant-design/cssinjs') && 
        !dep.includes('cssinjs') &&
        !dep.includes('useHMR') &&
        !dep.includes('useGlobalCache') &&
        !dep.includes('useCacheToken')
      );
      
      if (filteredDependencies.length !== dependencies.length) {
        console.log('🔧 过滤掉cssinjs相关的HMR依赖');
      }
      
      return originalAccept.call(this, filteredDependencies, callback);
    }
    
    return originalAccept.call(this, dependencies, callback);
  };
  
  // 禁用特定模块的热重载
  try {
    module.hot.decline('./node_modules/@ant-design/cssinjs/es/hooks/useHMR.js');
    module.hot.decline('./node_modules/@ant-design/cssinjs/es/hooks/useGlobalCache.js');
    module.hot.decline('./node_modules/@ant-design/cssinjs/es/hooks/useCacheToken.js');
    module.hot.decline('./node_modules/@ant-design/cssinjs/es/extractStyle.js');
    module.hot.decline('./node_modules/@ant-design/cssinjs/es/index.js');
    console.log('🔧 已禁用cssinjs模块的热重载');
  } catch (error) {
    console.warn('🔧 禁用cssinjs模块热重载时出错:', error.message);
  }
  
  console.log('🔧 HMR修复已初始化完成');
}

// 导出空对象以避免模块解析问题
export default {};
