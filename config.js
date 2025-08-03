/**
 * Uniswap 监控调度器配置文件
 * 在这里可以修改各种监控参数
 */

module.exports = {
    // 监控周期设置
    MONITOR_DAYS: 10,                    // 监控天数 (修改这个值来改变监控周期)
    
    // 定时任务设置
    CRON_SCHEDULE: '0 7 * * *',         // 每天早上 7:00 执行
    TIMEZONE: 'Asia/Shanghai',           // 时区设置
    
    // 监控路径设置
    SUBGRAPH_PATH: '/home/code/uniswap-v2-monitor/uniswap-v2-monitor-subgraph',
    GRAPHQL_ENDPOINT: 'http://localhost:8000/subgraphs/name/uni-swap-v2-monitor',
    
    // 以太坊设置
    ETHEREUM_RPC: 'https://eth.llamarpc.com',
    UNISWAP_V2_START_BLOCK: 10000835,   // Uniswap V2 起始区块
    
    // 数据库设置
    POSTGRES_CONTAINER: 'uni-swap-v2-monitor_postgres_1',
    POSTGRES_USER: 'graph-node',
    POSTGRES_DB: 'graph-node',
    
    // Docker 设置
    DOCKER_FILTER: 'name=uni-swap-v2-monitor',
    
    // 日志设置
    LOG_LEVEL: 'info',
    
    // 报告设置
    REPORT_FORMATS: ['json', 'txt'],
    
    // 超时设置
    REQUEST_TIMEOUT: 10000,              // API 请求超时时间 (毫秒)
    
    // 重试设置
    MAX_RETRIES: 3,                      // 最大重试次数
    RETRY_DELAY: 1000,                   // 重试延迟 (毫秒)
    
    // 通知设置 (预留)
    NOTIFICATIONS: {
        enabled: false,
        email: {
            enabled: false,
            smtp: '',
            user: '',
            pass: '',
            to: ''
        },
        webhook: {
            enabled: false,
            url: ''
        }
    }
}; 