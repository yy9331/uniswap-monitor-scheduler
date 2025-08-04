#!/usr/bin/env ts-node

/**
 * 配置助手脚本
 * 用于查看和修改监控配置
 */

import fs from 'fs-extra';
import path from 'path';
import config from './config';

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

function log(message: string, color: keyof typeof colors = 'reset'): void {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function showConfig(): void {
    log('\n=== Uniswap 监控调度器配置 ===', 'cyan');
    log(`监控天数: ${config.MONITOR_DAYS} 天`, 'green');
    log(`项目下线时间: ${config.PROJECT_SHUTDOWN_DAYS === 0 ? '永不停止' : config.PROJECT_SHUTDOWN_DAYS + '天后自动停止'}`, 'green');
    log(`定时任务: ${config.CRON_SCHEDULE}`, 'green');
    log(`时区: ${config.TIMEZONE}`, 'green');
    log(`子图路径: ${config.SUBGRAPH_PATH}`, 'green');
    log(`GraphQL端点: ${config.GRAPHQL_ENDPOINT}`, 'green');
    log(`以太坊RPC: ${config.ETHEREUM_RPC}`, 'green');
    log(`数据库容器: ${config.POSTGRES_CONTAINER}`, 'green');
    log(`请求超时: ${config.REQUEST_TIMEOUT}ms`, 'green');
    log(`最大重试: ${config.MAX_RETRIES}次`, 'green');
    
    // 磁盘空间监控配置
    log(`\n💽 磁盘空间监控:`, 'cyan');
    log(`  启用状态: ${config.DISK_MONITORING.enabled ? '启用' : '禁用'}`, 'green');
    log(`  警告阈值: ${config.DISK_MONITORING.warning_threshold}%`, 'green');
    log(`  严重阈值: ${config.DISK_MONITORING.critical_threshold}%`, 'green');
    log(`  监控路径: ${config.DISK_MONITORING.check_paths.join(', ')}`, 'green');
    
    log('================================\n', 'cyan');
}

function updateConfig(key: string, value: string | number): void {
    const configPath = path.join(__dirname, 'config.ts');
    
    try {
        let configContent = fs.readFileSync(configPath, 'utf8');
        
        // 更新配置值
        const regex = new RegExp(`(${key}:\\s*)\\d+`, 'g');
        configContent = configContent.replace(regex, `$1${value}`);
        
        fs.writeFileSync(configPath, configContent);
        
        log(`✅ 配置已更新: ${key} = ${value}`, 'green');
        log('请重启调度器以应用新配置: ./start.sh restart', 'yellow');
        
    } catch (error) {
        log(`❌ 更新配置失败: ${error instanceof Error ? error.message : 'Unknown error'}`, 'red');
    }
}

function updateDiskMonitoring(key: string, value: string | number | boolean): void {
    const configPath = path.join(__dirname, 'config.ts');
    
    try {
        let configContent = fs.readFileSync(configPath, 'utf8');
        
        // 更新磁盘监控配置
        const regex = new RegExp(`(${key}:\\s*)[^,]+`, 'g');
        const newValue = typeof value === 'string' ? `'${value}'` : value;
        configContent = configContent.replace(regex, `$1${newValue}`);
        
        fs.writeFileSync(configPath, configContent);
        
        log(`✅ 磁盘监控配置已更新: ${key} = ${value}`, 'green');
        log('请重启调度器以应用新配置: ./start.sh restart', 'yellow');
        
    } catch (error) {
        log(`❌ 更新磁盘监控配置失败: ${error instanceof Error ? error.message : 'Unknown error'}`, 'red');
    }
}

function showHelp(): void {
    log('\n=== 配置助手使用说明 ===', 'cyan');
    log('查看当前配置:', 'yellow');
    log('  npm run config', 'green');
    log('', 'reset');
    log('修改监控天数:', 'yellow');
    log('  npm run config:days 15', 'green');
    log('', 'reset');
    log('修改定时任务:', 'yellow');
    log('  npm run config:schedule "0 8 * * *"', 'green');
    log('', 'reset');
    log('修改时区:', 'yellow');
    log('  npm run config:timezone "America/New_York"', 'green');
    log('', 'reset');
    log('修改超时时间:', 'yellow');
    log('  npm run config:timeout 15000', 'green');
    log('', 'reset');
    log('修改重试次数:', 'yellow');
    log('  npm run config:retries 5', 'green');
    log('', 'reset');
    log('修改项目下线时间:', 'yellow');
    log('  npm run config:shutdown 0    # 永不停止', 'green');
    log('  npm run config:shutdown 30   # 30天后停止', 'green');
    log('', 'reset');
    log('磁盘空间监控配置:', 'yellow');
    log('  npm run config:disk-enabled true', 'green');
    log('  npm run config:disk-warning 85', 'green');
    log('  npm run config:disk-critical 95', 'green');
    log('', 'reset');
    log('可用的配置项:', 'yellow');
    log('  days      - 监控天数', 'green');
    log('  shutdown  - 项目下线时间(0=永不停止, >0=指定天数后停止)', 'green');
    log('  schedule  - 定时任务表达式', 'green');
    log('  timezone  - 时区设置', 'green');
    log('  timeout   - 请求超时时间(毫秒)', 'green');
    log('  retries   - 最大重试次数', 'green');
    log('  disk-enabled   - 启用磁盘空间监控', 'green');
    log('  disk-warning   - 磁盘警告阈值(%)', 'green');
    log('  disk-critical  - 磁盘严重阈值(%)', 'green');
    log('================================\n', 'cyan');
}

// 主函数
async function main(): Promise<void> {
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
        case 'shutdown':
            updateConfig('PROJECT_SHUTDOWN_DAYS', parseInt(value));
            break;
        case 'disk-enabled':
            updateDiskMonitoring('enabled', value === 'true');
            break;
        case 'disk-warning':
            updateDiskMonitoring('warning_threshold', parseInt(value));
            break;
        case 'disk-critical':
            updateDiskMonitoring('critical_threshold', parseInt(value));
            break;
        default:
            log(`❌ 未知的配置项: ${action}`, 'red');
            showHelp();
    }
}

// 运行主函数
main().catch(console.error); 