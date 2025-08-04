import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import moment from 'moment';
import { exec } from 'child_process';
import { promisify } from 'util';
import config from './config';
import { MonitorReport, ProgressInfo, DiskSpaceInfo, ProjectSpaceInfo, SubgraphHealthInfo } from './types';

const execAsync = promisify(exec);

class UniswapMonitor {
    private subgraphPath: string;
    private logPath: string;
    private reportPath: string;

    constructor() {
        this.subgraphPath = config.SUBGRAPH_PATH;
        this.logPath = path.join(__dirname, '..', 'logs');
        this.reportPath = path.join(__dirname, '..', 'reports');
        this.ensureDirectories();
    }

    private async ensureDirectories(): Promise<void> {
        await fs.ensureDir(this.logPath);
        await fs.ensureDir(this.reportPath);
    }

    async log(message: string): Promise<void> {
        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        
        const logFile = path.join(this.logPath, `monitor-${moment().format('YYYY-MM-DD')}.log`);
        await fs.appendFile(logFile, logMessage + '\n');
    }

    async getCurrentBlock(): Promise<number | null> {
        try {
            const response = await axios.post(config.ETHEREUM_RPC, {
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 1
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: config.REQUEST_TIMEOUT
            });
            
            if (response.data && response.data.result) {
                return parseInt(response.data.result, 16);
            }
            return null;
        } catch (error) {
            await this.log(`获取当前区块失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return null;
        }
    }

    async getSubgraphProgress(): Promise<number | null> {
        try {
            const response = await axios.post(config.GRAPHQL_ENDPOINT, {
                query: '{ _meta { block { number } } }'
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: config.REQUEST_TIMEOUT
            });
            
            if (response.data.data && response.data.data._meta) {
                return response.data.data._meta.block.number;
            }
            return null;
        } catch (error) {
            await this.log(`获取子图进度失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return null;
        }
    }

    async getDatabaseSize(): Promise<string> {
        try {
            const { stdout } = await execAsync(`du -sh ${this.subgraphPath}/data/postgres/`);
            return stdout.trim();
        } catch (error) {
            await this.log(`获取数据库大小失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return 'Unknown';
        }
    }

    async getDatabaseStats(): Promise<string[]> {
        try {
            const { stdout } = await execAsync(`
                docker exec ${config.POSTGRES_CONTAINER} psql -U ${config.POSTGRES_USER} -d ${config.POSTGRES_DB} -c "
                SELECT 
                    'chain1.blocks' as table_name, COUNT(*) as count FROM chain1.blocks
                    UNION ALL
                    SELECT 'sgd1.pair' as table_name, COUNT(*) as count FROM sgd1.pair
                    UNION ALL
                    SELECT 'sgd1.swap' as table_name, COUNT(*) as count FROM sgd1.swap
                    UNION ALL
                    SELECT 'sgd1.mint' as table_name, COUNT(*) as count FROM sgd1.mint
                    UNION ALL
                    SELECT 'sgd1.burn' as table_name, COUNT(*) as count FROM sgd1.burn
                    UNION ALL
                    SELECT 'sgd1.pair_created' as table_name, COUNT(*) as count FROM sgd1.pair_created
                    UNION ALL
                    SELECT 'sgd1.token' as table_name, COUNT(*) as count FROM sgd1.token;
                " -t -A
            `);
            return stdout.trim().split('\n').filter(line => line.trim().length > 0);
        } catch (error) {
            await this.log(`获取数据库统计失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return [];
        }
    }

    async getDockerStatus(): Promise<string> {
        try {
            const { stdout } = await execAsync(`docker ps --filter "${config.DOCKER_FILTER}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"`);
            return stdout.trim();
        } catch (error) {
            await this.log(`获取Docker状态失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return 'Unknown';
        }
    }

    async getDiskSpace(): Promise<{ system: DiskSpaceInfo[], project: ProjectSpaceInfo | null, warnings: string[] }> {
        const warnings: string[] = [];
        const system: DiskSpaceInfo[] = [];
        let project: ProjectSpaceInfo | null = null;

        try {
            // 获取系统磁盘空间信息
            const { stdout } = await execAsync('df -h');
            const lines = stdout.trim().split('\n').slice(1); // 跳过标题行

            for (const line of lines) {
                const parts = line.split(/\s+/);
                if (parts.length >= 6) {
                    const filesystem = parts[0] || '';
                    const size = parts[1] || '';
                    const used = parts[2] || '';
                    const available = parts[3] || '';
                    const usedPercent = parseInt(parts[4]?.replace('%', '') || '0');
                    const mountpoint = parts[5] || '';

                    // 检查是否在监控路径中
                    const isMonitored = config.DISK_MONITORING.check_paths.some(checkPath => 
                        mountpoint === checkPath || mountpoint.startsWith(checkPath + '/')
                    );

                    if (isMonitored) {
                        let status: 'normal' | 'warning' | 'critical' = 'normal';
                        
                        if (usedPercent >= config.DISK_MONITORING.critical_threshold) {
                            status = 'critical';
                            warnings.push(`严重警告: ${mountpoint} 磁盘使用率 ${usedPercent}%`);
                        } else if (usedPercent >= config.DISK_MONITORING.warning_threshold) {
                            status = 'warning';
                            warnings.push(`警告: ${mountpoint} 磁盘使用率 ${usedPercent}%`);
                        }

                        system.push({
                            filesystem,
                            size,
                            used,
                            available,
                            used_percentage: usedPercent,
                            mountpoint,
                            status
                        });
                    }
                }
            }

            // 获取项目空间使用情况
            project = await this.getProjectSpaceUsage();

            await this.log(`磁盘空间监控完成: 检查了 ${system.length} 个分区，发现 ${warnings.length} 个警告`);

        } catch (error) {
            await this.log(`获取磁盘空间信息失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
            warnings.push('磁盘空间监控失败');
        }

        return { system, project, warnings };
    }

    async getProjectSpaceUsage(): Promise<ProjectSpaceInfo | null> {
        try {
            const projectRoot = path.join(__dirname, '..');
            const subgraphPath = config.SUBGRAPH_PATH;

            // 获取项目总大小
            const { stdout: totalSize } = await execAsync(`du -sh "${projectRoot}"`);
            
            // 获取数据库大小
            const { stdout: dbSize } = await execAsync(`du -sh "${subgraphPath}/data/postgres/" 2>/dev/null || echo "0"`);
            
            // 获取日志大小
            const { stdout: logsSize } = await execAsync(`du -sh "${projectRoot}/logs/" 2>/dev/null || echo "0"`);
            
            // 获取报告大小
            const { stdout: reportsSize } = await execAsync(`du -sh "${projectRoot}/reports/" 2>/dev/null || echo "0"`);
            
            // 获取其他文件大小 (排除数据库、日志、报告)
            const { stdout: otherSize } = await execAsync(`
                du -sh "${projectRoot}" --exclude="${subgraphPath}/data/postgres" --exclude="${projectRoot}/logs" --exclude="${projectRoot}/reports" 2>/dev/null || echo "0"
            `);

            return {
                project_path: projectRoot,
                total_size: totalSize.trim(),
                database_size: dbSize.trim(),
                logs_size: logsSize.trim(),
                reports_size: reportsSize.trim(),
                other_size: otherSize.trim(),
                breakdown: {
                    database: dbSize.trim(),
                    logs: logsSize.trim(),
                    reports: reportsSize.trim(),
                    other: otherSize.trim()
                }
            };

        } catch (error) {
            await this.log(`获取项目空间使用情况失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return null;
        }
    }

    async getSubgraphHealth(): Promise<SubgraphHealthInfo> {
        try {
            // 检查 Graph Node 错误日志
            const { stdout: errorLogs } = await execAsync(`
                docker logs uniswap-v2-monitor-subgraph_graph-node_1 2>&1 | grep -i error | tail -5
            `);
            
            const errors = errorLogs.trim().split('\n').filter(line => line.length > 0);
            const hasErrors = errors.length > 0;
            
            // 检查重试次数
            const retryCount = errors.filter(error => error.includes('retry')).length;
            
            // 检查最后错误时间
            const lastErrorTime = hasErrors ? moment().format('YYYY-MM-DD HH:mm:ss') : null;
            
            // 检查是否卡住（通过比较历史进度）
            const currentBlock = await this.getSubgraphProgress();
            const isStuck = await this.checkIfStuck(currentBlock);
            const stuckDuration = isStuck ? await this.getStuckDuration() : null;
            
            return {
                isHealthy: !hasErrors && !isStuck,
                errors,
                lastErrorTime,
                retryCount,
                isStuck,
                stuckDuration
            };
        } catch (error) {
            await this.log(`获取子图健康状态失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                isHealthy: false,
                errors: [`获取健康状态失败: ${error instanceof Error ? error.message : 'Unknown error'}`],
                lastErrorTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                retryCount: 0,
                isStuck: false,
                stuckDuration: null
            };
        }
    }

    private async checkIfStuck(currentBlock: number | null): Promise<boolean> {
        try {
            // 读取历史进度文件
            const historyFile = path.join(this.reportPath, 'progress_history.json');
            
            if (await fs.pathExists(historyFile)) {
                const historyData = await fs.readJson(historyFile);
                const lastBlock = historyData.lastBlock || 0;
                const lastCheckTime = historyData.lastCheckTime || 0;
                
                // 如果区块号没有变化且超过1小时，认为卡住了
                if (currentBlock === lastBlock && 
                    moment().diff(moment(lastCheckTime), 'hours') >= 1) {
                    return true;
                }
            }
            
            // 保存当前进度
            await fs.writeJson(historyFile, {
                lastBlock: currentBlock,
                lastCheckTime: moment().toISOString()
            });
            
            return false;
        } catch (error) {
            await this.log(`检查卡住状态失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }

    private async getStuckDuration(): Promise<string> {
        try {
            const historyFile = path.join(this.reportPath, 'progress_history.json');
            
            if (await fs.pathExists(historyFile)) {
                const historyData = await fs.readJson(historyFile);
                const lastCheckTime = historyData.lastCheckTime || 0;
                
                if (lastCheckTime) {
                    const duration = moment.duration(moment().diff(moment(lastCheckTime)));
                    return `${duration.hours()}小时${duration.minutes()}分钟`;
                }
            }
            
            return '未知';
        } catch (error) {
            return '未知';
        }
    }

    async calculateProgress(currentBlock: number | null, subgraphBlock: number | null): Promise<ProgressInfo | null> {
        if (!currentBlock || !subgraphBlock) return null;
        
        const startBlock = config.UNISWAP_V2_START_BLOCK; // Uniswap V2 起始区块
        const totalBlocks = currentBlock - startBlock;
        const scannedBlocks = subgraphBlock - startBlock;
        const progress = (scannedBlocks / totalBlocks * 100).toFixed(2);
        
        return {
            totalBlocks,
            scannedBlocks,
            progress: parseFloat(progress),
            remainingBlocks: totalBlocks - scannedBlocks
        };
    }

    async generateReport(): Promise<MonitorReport> {
        await this.log('开始生成监控报告...');
        
        const currentBlock = await this.getCurrentBlock();
        const subgraphBlock = await this.getSubgraphProgress();
        const databaseSize = await this.getDatabaseSize();
        const databaseStats = await this.getDatabaseStats();
        const dockerStatus = await this.getDockerStatus();
        const progress = await this.calculateProgress(currentBlock, subgraphBlock);
        
        // 获取磁盘空间信息
        const diskSpace = await this.getDiskSpace();
        
        // 获取子图健康状态
        const subgraphHealth = await this.getSubgraphHealth();
        
        const report: MonitorReport = {
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
            currentBlock,
            subgraphBlock,
            databaseSize,
            dockerStatus: {
                containers: [] // 这里可以解析dockerStatus字符串为结构化数据
            },
            progress,
            databaseStats: databaseStats.map(line => {
                const parts = line.split('|');
                const table = parts[0];
                const count = parts[1];
                return { 
                    table: table?.trim() || 'unknown', 
                    count: parseInt(count || '0') || 0 
                };
            }),
            diskSpace,
            subgraphHealth
        };
        
        const reportFile = path.join(this.reportPath, `report-${moment().format('YYYY-MM-DD-HH-mm')}.json`);
        await fs.writeJson(reportFile, report, { spaces: 2 });
        
        await this.log(`报告已保存到: ${reportFile}`);
        
        // 生成可读的报告
        const readableReport = this.generateReadableReport(report, dockerStatus);
        const readableFile = path.join(this.reportPath, `report-${moment().format('YYYY-MM-DD-HH-mm')}.txt`);
        await fs.writeFile(readableFile, readableReport);
        
        await this.log(`可读报告已保存到: ${readableFile}`);
        
        return report;
    }

    private generateReadableReport(report: MonitorReport, dockerStatus: string): string {
        let reportText = `=== Uniswap V2 子图监控报告 ===\n`;
        reportText += `生成时间: ${report.timestamp}\n\n`;
        
        reportText += `📊 区块进度:\n`;
        reportText += `  当前以太坊区块: ${report.currentBlock?.toLocaleString() || 'Unknown'}\n`;
        reportText += `  子图扫描区块: ${report.subgraphBlock?.toLocaleString() || 'Unknown'}\n`;
        
        if (report.progress) {
            reportText += `  扫描进度: ${report.progress.progress}%\n`;
            reportText += `  已扫描区块: ${report.progress.scannedBlocks.toLocaleString()}\n`;
            reportText += `  剩余区块: ${report.progress.remainingBlocks.toLocaleString()}\n`;
        }
        
        reportText += `\n💾 数据库信息:\n`;
        reportText += `  数据库大小: ${report.databaseSize}\n`;
        
        reportText += `\n📈 数据统计:\n`;
        report.databaseStats.forEach(stat => {
            reportText += `  ${stat.table}: ${stat.count.toLocaleString()} 条记录\n`;
        });
        
        // 添加磁盘空间信息
        reportText += `\n💽 磁盘空间监控:\n`;
        
        if (report.diskSpace.system.length > 0) {
            reportText += `  系统磁盘空间:\n`;
            report.diskSpace.system.forEach(disk => {
                const statusIcon = disk.status === 'critical' ? '🔴' : disk.status === 'warning' ? '🟡' : '🟢';
                reportText += `    ${statusIcon} ${disk.mountpoint}: ${disk.used}/${disk.size} (${disk.used_percentage}%)\n`;
            });
        }
        
        if (report.diskSpace.project) {
            const proj = report.diskSpace.project;
            reportText += `  项目空间使用:\n`;
            reportText += `    总大小: ${proj.total_size}\n`;
            reportText += `    数据库: ${proj.database_size}\n`;
            reportText += `    日志: ${proj.logs_size}\n`;
            reportText += `    报告: ${proj.reports_size}\n`;
            reportText += `    其他: ${proj.other_size}\n`;
        }
        
        if (report.diskSpace.warnings.length > 0) {
            reportText += `\n⚠️ 磁盘空间警告:\n`;
            report.diskSpace.warnings.forEach(warning => {
                reportText += `  ${warning}\n`;
            });
        }
        
        reportText += `\n🐳 Docker 状态:\n`;
        reportText += dockerStatus;
        
        // 添加子图健康状态信息
        reportText += `\n🏥 子图健康状态:\n`;
        const health = report.subgraphHealth;
        const healthIcon = health.isHealthy ? '🟢' : '🔴';
        reportText += `  ${healthIcon} 健康状态: ${health.isHealthy ? '正常' : '异常'}\n`;
        
        if (health.isStuck) {
            reportText += `  ⚠️ 扫描卡住: 是 (${health.stuckDuration})\n`;
        }
        
        if (health.retryCount > 0) {
            reportText += `  🔄 重试次数: ${health.retryCount}\n`;
        }
        
        if (health.lastErrorTime) {
            reportText += `  ⏰ 最后错误时间: ${health.lastErrorTime}\n`;
        }
        
        if (health.errors.length > 0) {
            reportText += `  ❌ 错误信息:\n`;
            health.errors.forEach(error => {
                reportText += `    ${error}\n`;
            });
        }
        
        return reportText;
    }

    async run(): Promise<MonitorReport> {
        await this.log('开始执行监控任务...');
        
        try {
            const report = await this.generateReport();
            await this.log('监控任务完成');
            return report;
        } catch (error) {
            await this.log(`监控任务失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
}

export default UniswapMonitor;

// 如果直接运行此文件
if (require.main === module) {
    const monitor = new UniswapMonitor();
    monitor.run().catch(console.error);
} 