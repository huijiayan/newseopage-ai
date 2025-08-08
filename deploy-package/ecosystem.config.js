module.exports = {
  apps: [{
    name: 'newseopage-ai',
    script: 'npm',
    args: 'start',
    cwd: './',
    env: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'https://api.websitelm.com/v1',
      NEXT_PUBLIC_CHAT_API_URL: 'https://agents.zhuyuejoey.com',
      NEXT_PUBLIC_CHAT_WS_URL: 'wss://agents.zhuyuejoey.com',
      NEXT_TELEMETRY_DISABLED: '1'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}; 