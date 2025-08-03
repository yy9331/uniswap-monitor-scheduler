const UniswapMonitor = require('./monitor');
const moment = require('moment');

async function testMonitor() {
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
            const [table, count] = stat.split('|');
            console.log(`     ${table.trim()}: ${parseInt(count)?.toLocaleString() || 0} 条记录`);
        });
        console.log();
        
        console.log('5. 测试获取Docker状态...');
        const dockerStatus = await monitor.getDockerStatus();
        console.log(`   Docker状态:\n${dockerStatus}\n`);
        
        console.log('6. 测试计算进度...');
        const progress = await monitor.calculateProgress(currentBlock, subgraphBlock);
        if (progress) {
            console.log(`   扫描进度: ${progress.progress}%`);
            console.log(`   已扫描: ${progress.scannedBlocks.toLocaleString()} 区块`);
            console.log(`   剩余: ${progress.remainingBlocks.toLocaleString()} 区块\n`);
        }
        
        console.log('7. 测试生成完整报告...');
        const report = await monitor.generateReport();
        console.log('   报告生成完成！');
        console.log(`   报告时间: ${report.timestamp}`);
        console.log(`   进度: ${report.progress?.progress || 0}%`);
        console.log(`   数据库大小: ${report.databaseSize}\n`);
        
        console.log('✅ 所有测试通过！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        process.exit(1);
    }
}

// 运行测试
testMonitor().catch(console.error); 