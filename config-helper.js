#!/usr/bin/env node

/**
 * 配置助手脚本
 * 用于查看和修改监控配置
 */

const fs = require('fs-extra');
const path = require('path');
const config = require('./config');

// 颜色定义
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function showConfig() {
    log('\n=== Uniswap 监控调度器配置 ===', 'cyan');
    log(`监控天数: ${config.MONITOR_DAYS} 天`, 'green');
    log(`定时任务: ${config.CRON_SCHEDULE}`, 'green');
    log(`时区: ${config.TIMEZONE}`, 'green');
    log(`子图路径: ${config.SUBGRAPH_PATH}`, 'green');
    log(`GraphQL端点: ${config.GRAPHQL_ENDPOINT}`, 'green');
    log(`以太坊RPC: ${config.ETHEREUM_RPC}`, 'green');
    log(`数据库容器: ${config.POSTGRES_CONTAINER}`, 'green');
    log(`请求超时: ${config.REQUEST_TIMEOUT}ms`, 'green');
    log(`最大重试: ${config.MAX_RETRIES}次`, 'green');
    log('================================\n', 'cyan');
}

function updateConfig(key, value) {
    const configPath = path.join(__dirname, 'config.js');
    
    try {
        let configContent = fs.readFileSync(configPath, 'utf8');
        
        // 更新配置值
        const regex = new RegExp(`(${key}:\\s*)\\d+`, 'g');
        configContent = configContent.replace(regex, `$1${value}`);
        
        fs.writeFileSync(configPath, configContent);
        
        log(`✅ 配置已更新: ${key} = ${value}`, 'green');
        log('请重启调度器以应用新配置: ./start.sh restart', 'yellow');
        
    } catch (error) {
        log(`❌ 更新配置失败: ${error.message}`, 'red');
    }
}

function showHelp() {
    log('\n=== 配置助手使用说明 ===', 'cyan');
    log('查看当前配置:', 'yellow');
    log('  node config-helper.js', 'green');
    log('', 'reset');
    log('修改监控天数:', 'yellow');
    log('  node config-helper.js days 15', 'green');
    log('', 'reset');
    log('修改定时任务:', 'yellow');
    log('  node config-helper.js schedule "0 8 * * *"', 'green');
    log('', 'reset');
    log('修改时区:', 'yellow');
    log('  node config-helper.js timezone "America/New_York"', 'green');
    log('', 'reset');
    log('可用的配置项:', 'yellow');
    log('  days      - 监控天数', 'green');
    log('  schedule  - 定时任务表达式', 'green');
    log('  timezone  - 时区设置', 'green');
    log('  timeout   - 请求超时时间(毫秒)', 'green');
    log('  retries   - 最大重试次数', 'green');
    log('================================\n', 'cyan');
}

// 主函数
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        showConfig();
        return;
    }
    
    if (args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
        showHelp();
        return;
    }
    
    const [action, value] = args;
    
    if (!value) {
        log('❌ 请提供要修改的值', 'red');
        showHelp();
        return;
    }
    
    switch (action) {
        case 'days':
            updateConfig('MONITOR_DAYS', parseInt(value));
            break;
        case 'schedule':
            updateConfig('CRON_SCHEDULE', `'${value}'`);
            break;
        case 'timezone':
            updateConfig('TIMEZONE', `'${value}'`);
            break;
        case 'timeout':
            updateConfig('REQUEST_TIMEOUT', parseInt(value));
            break;
        case 'retries':
            updateConfig('MAX_RETRIES', parseInt(value));
            break;
        default:
            log(`❌ 未知的配置项: ${action}`, 'red');
            showHelp();
    }
}

// 运行主函数
main().catch(console.error); 