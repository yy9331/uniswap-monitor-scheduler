import moment from 'moment';
import UniswapMonitor from './monitor';

async function testMonitor(): Promise<void> {
    console.log('=== 测试 Uniswap 监控功能 ===');
    console.log(`测试时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n`);
    
    const monitor = new UniswapMonitor();
    
    try {
        console.log('1. 测试获取当前以太坊区块...');
        const currentBlock = await monitor.getCurrentBlock();
        console.log(`   当前区块: ${currentBlock?.toLocaleString() || 'Unknown'}\n`);
        
        console.log('2. 测试获取子图进度...');
        const subgraphBlock = await monitor.getSubgraphProgress();
        console.log(`   子图区块: ${subgraphBlock?.toLocaleString() || 'Unknown'}\n`);
        
        console.log('3. 测试获取数据库大小...');
        const dbSize = await monitor.getDatabaseSize();
        console.log(`   数据库大小: ${dbSize}\n`);
        
        console.log('4. 测试获取数据库统计...');
        const dbStats = await monitor.getDatabaseStats();
        console.log('   数据库统计:');
        dbStats.forEach(stat => {
            const parts = stat.split('|');
            const table = parts[0];
            const count = parts[1];
            console.log(`     ${table?.trim() || 'unknown'}: ${parseInt(count || '0')?.toLocaleString() || 0} 条记录`);
        });
        console.log();
        
        console.log('5. 测试获取Docker状态...');
        const dockerStatus = await monitor.getDockerStatus();
        console.log('   Docker状态:');
        console.log(dockerStatus);
        console.log();
        
        console.log('6. 测试生成完整报告...');
        const report = await monitor.generateReport();
        console.log('   报告生成完成');
        console.log(`   时间戳: ${report.timestamp}`);
        console.log(`   当前区块: ${report.currentBlock?.toLocaleString() || 'Unknown'}`);
        console.log(`   子图区块: ${report.subgraphBlock?.toLocaleString() || 'Unknown'}`);
        console.log(`   数据库大小: ${report.databaseSize}`);
        
        if (report.progress) {
            console.log(`   扫描进度: ${report.progress.progress}%`);
            console.log(`   已扫描区块: ${report.progress.scannedBlocks.toLocaleString()}`);
            console.log(`   剩余区块: ${report.progress.remainingBlocks.toLocaleString()}`);
        }
        
        console.log('\n=== 测试完成 ===');
        
    } catch (error) {
        console.error('测试过程中发生错误:', error instanceof Error ? error.message : 'Unknown error');
    }
}

// 如果直接运行此文件
if (require.main === module) {
    testMonitor().catch(console.error);
}

export default testMonitor; 