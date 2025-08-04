import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import moment from 'moment';
import { exec } from 'child_process';
import { promisify } from 'util';
import config from './config';
import { MonitorReport, ProgressInfo } from './types';

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
                " --csv --no-align --tuples-only
            `);
            return stdout.trim().split('\n');
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
            })
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
        
        reportText += `\n🐳 Docker 状态:\n`;
        reportText += dockerStatus;
        
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