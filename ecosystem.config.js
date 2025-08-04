module.exports = {
  apps: [{
    name: 'uniswap-monitor',
    script: 'dist/index.js',
    cwd: '/home/code/uniswap-v2-monitor/uniswap-monitor-scheduler',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    log_file: './logs/pm2.log',
    out_file: './logs/pm2-out.log',
    error_file: './logs/pm2-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }]
}; 