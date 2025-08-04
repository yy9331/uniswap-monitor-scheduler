import cron from 'node-cron';
import moment from 'moment';
import fs from 'fs-extra';
import path from 'path';
import config from './config';
import UniswapMonitor from './monitor';

class Scheduler {
    private monitor: UniswapMonitor;
    private startDate: moment.Moment;
    private endDate: moment.Moment;
    private isRunning: boolean = false;

    constructor() {
        this.monitor = new UniswapMonitor();
        this.startDate = moment();
        this.endDate = moment().add(config.MONITOR_DAYS, 'days');
    }

    async log(message: string): Promise<void> {
        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        
        const logFile = path.join(__dirname, '..', 'logs', `scheduler-${moment().format('YYYY-MM-DD')}.log`);
        await fs.ensureDir(path.dirname(logFile));
        await fs.appendFile(logFile, logMessage + '\n');
    }

    async start(): Promise<void> {
        await this.log('启动 Uniswap 监控调度器...');
        await this.log(`监控开始时间: ${this.startDate.format('YYYY-MM-DD HH:mm:ss')}`);
        await this.log(`监控结束时间: ${this.endDate.format('YYYY-MM-DD HH:mm:ss')}`);
        await this.log(`监控周期: ${config.MONITOR_DAYS}天`);
        await this.log(`定时任务: ${config.CRON_SCHEDULE} 执行监控`);
        
        // 设置定时任务
        cron.schedule(config.CRON_SCHEDULE, async () => {
            if (this.isRunning) {
                await this.log('上一个监控任务还在运行，跳过本次执行');
                return;
            }
            
            this.isRunning = true;
            await this.log('开始执行定时监控任务...');
            
            try {
                await this.monitor.run();
                await this.log('定时监控任务完成');
                
                // 检查是否超过监控周期
                if (moment().isAfter(this.endDate)) {
                    await this.log(`监控周期已结束 (${config.MONITOR_DAYS}天)，停止调度器`);
                    process.exit(0);
                }
            } catch (error) {
                await this.log(`定时监控任务失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
                this.isRunning = false;
            }
        }, {
            scheduled: true,
            timezone: config.TIMEZONE
        });
        
        await this.log('调度器已启动，等待定时任务执行...');
        
        // 立即执行一次监控任务
        await this.log('执行初始监控任务...');
        try {
            await this.monitor.run();
            await this.log('初始监控任务完成');
        } catch (error) {
            await this.log(`初始监控任务失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async stop(): Promise<void> {
        await this.log('停止调度器...');
        process.exit(0);
    }
}

// 处理进程信号
process.on('SIGINT', async () => {
    console.log('\n收到中断信号，正在停止调度器...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n收到终止信号，正在停止调度器...');
    process.exit(0);
});

// 启动调度器
const scheduler = new Scheduler();
scheduler.start().catch(console.error); 