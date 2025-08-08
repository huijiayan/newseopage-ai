/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生产环境优化
  output: 'standalone',
  
  // 图片优化
  images: {
    domains: ['api.websitelm.com', 'agents.zhuyuejoey.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 压缩配置
  compress: true,
  
  // Webpack配置 - 解决HMR问题
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 配置HMR选项，避免cssinjs问题
      config.resolve.alias = {
        ...config.resolve.alias,
        // 禁用 Ant Design CSS-in-JS 的 HMR
        '@ant-design/cssinjs': false,
      };
      
      // 添加HMR错误处理
      config.plugins.push(
        new (require('webpack')).DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
          // 禁用 CSS-in-JS HMR
          'process.env.DISABLE_CSSINJS_HMR': JSON.stringify('true'),
        })
      );
      
      // 配置HMR选项
      config.devServer = {
        ...config.devServer,
        hot: true,
        liveReload: false,
      };
      
      // 添加HMR忽略规则 - 更精确的匹配
      config.module.rules.push({
        test: /node_modules\/@ant-design\/cssinjs\/es\/hooks\/(useHMR|useGlobalCache|useCacheToken)\.js$/,
        use: 'ignore-loader',
      });
      
      // 添加HMR忽略规则 - extractStyle和index
      config.module.rules.push({
        test: /node_modules\/@ant-design\/cssinjs\/es\/(extractStyle|index)\.js$/,
        use: 'ignore-loader',
      });
      
      // 添加 ignore-loader 到 webpack 配置
      config.module.rules.push({
        test: /node_modules\/@ant-design\/cssinjs/,
        use: 'ignore-loader',
      });
      
      // 禁用 CSS-in-JS 的 HMR
      config.plugins.push(
        new (require('webpack')).IgnorePlugin({
          resourceRegExp: /@ant-design\/cssinjs/,
          contextRegExp: /node_modules/,
        })
      );
    }
    
    return config;
  },
  
  // 实验性功能 - 禁用某些HMR功能
  experimental: {
    // 禁用某些可能导致HMR问题的功能
    optimizePackageImports: ['antd'],
    // 禁用HMR中的某些功能
    turbo: {
      rules: {
        '*.css': {
          loaders: ['css-loader'],
          as: '*.css',
        },
      },
    },
  },
  
  // 安全头
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // 重定向配置
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // API代理配置 - 解决CORS问题
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.websitelm.com/v1/:path*',
      },
    ];
  },
};
 
module.exports = nextConfig; 