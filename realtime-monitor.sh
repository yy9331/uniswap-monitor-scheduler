#!/bin/bash
echo "=== 实时监控状态 ==="
echo "时间: $(date)"
echo ""

# 获取当前区块
echo "1. 以太坊区块状态:"
CURRENT_BLOCK=$(curl -s -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
  http://localhost:8545 | grep -o '"currentBlock":"[^"]*"' | cut -d'"' -f4)

if [ -n "$CURRENT_BLOCK" ]; then
    BLOCK_DEC=$(printf "%d" $CURRENT_BLOCK)
    TARGET_BLOCK=10000835
    PROGRESS=$((BLOCK_DEC * 100 / TARGET_BLOCK))
    echo "   当前区块: $BLOCK_DEC"
    echo "   目标区块: $TARGET_BLOCK"
    echo "   同步进度: $PROGRESS%"
    
    if [ $BLOCK_DEC -ge $TARGET_BLOCK ]; then
        echo "   ✅ 已达到目标区块！可以部署子图"
    else
        REMAINING=$((TARGET_BLOCK - BLOCK_DEC))
        echo "   ⏳ 还需同步: $REMAINING 个区块"
    fi
else
    echo "   ❌ 无法获取区块信息"
fi

echo ""
echo "2. 子图服务状态:"
cd /home/code/uniswap-v2-monitor/uniswap-v2-monitor-subgraph
docker-compose ps | grep -E "(graph|postgres|ipfs)" | while read line; do
    echo "   $line"
done

echo ""
echo "3. 数据库状态:"
DB_SIZE=$(du -sh data/postgres/ 2>/dev/null | cut -f1)
echo "   数据库大小: $DB_SIZE"

# 检查数据库表
echo "   数据库表状态:"
DB_TABLES=$(docker exec uniswap-v2-monitor-subgraph_postgres_1 psql -U graph-node -d graph-node -c "SELECT COUNT(*) FROM ethereum_blocks;" 2>/dev/null | tail -n 1)
if [ -n "$DB_TABLES" ] && [ "$DB_TABLES" != "count" ]; then
    echo "   ethereum_blocks: $DB_TABLES 条记录"
else
    echo "   ethereum_blocks: 0 条记录 (数据库可能为空)"
fi

echo ""
echo "4. 最新监控报告:"
LATEST_REPORT=$(ls -t /home/code/uniswap-v2-monitor/uniswap-monitor-scheduler/reports/*.txt 2>/dev/null | head -1)
if [ -n "$LATEST_REPORT" ]; then
    echo "   最新报告: $(basename $LATEST_REPORT)"
    echo "   报告时间: $(stat -c %y $LATEST_REPORT | cut -d' ' -f1,2)"
    echo "   报告内容:"
    tail -5 "$LATEST_REPORT" | sed 's/^/   /'
else
    echo "   ❌ 未找到监控报告"
fi

echo ""
echo "5. 系统资源状态:"
echo "   磁盘使用: $(df -h / | tail -1 | awk '{print $5}')"
echo "   内存使用: $(free -h | grep Mem | awk '{print $3"/"$2}')"

echo ""
echo "6. 监控服务状态:"
if pgrep -f "uniswap-monitor" > /dev/null; then
    echo "   ✅ 监控服务正在运行"
else
    echo "   ❌ 监控服务未运行"
fi

echo ""
echo "=== 监控完成 ==="
echo ""
echo "快速操作:"
echo "  立即生成报告: npm run monitor:dev"
echo "  查看详细日志: tail -f scheduler.log"
echo "  启动监控服务: npm run start" 