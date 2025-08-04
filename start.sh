#!/bin/bash

# Uniswap 监控调度器启动脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/scheduler.log"
PID_FILE="$SCRIPT_DIR/scheduler.pid"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# 检查是否已经运行
check_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            return 0
        else
            rm -f "$PID_FILE"
        fi
    fi
    return 1
}

# 启动函数
start() {
    log "启动 Uniswap 监控调度器..."
    
    if check_running; then
        error "调度器已经在运行 (PID: $(cat $PID_FILE))"
        exit 1
    fi
    
    # 检查 Node.js 是否安装
    if ! command -v node &> /dev/null; then
        error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    # 检查依赖是否安装
    if [ ! -d "node_modules" ]; then
        log "安装依赖..."
        npm install
    fi
    
    # 构建 TypeScript 项目
    log "构建 TypeScript 项目..."
    if ! npm run build; then
        error "TypeScript 构建失败"
        exit 1
    fi
    
    # 启动调度器
    log "启动监控调度器..."
    nohup node dist/index.js > "$LOG_FILE" 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
    
    log "调度器已启动 (PID: $PID)"
    log "日志文件: $LOG_FILE"
    log "监控周期: 从配置文件读取"
    log "执行时间: 每天早上 7:00"
}

# 停止函数
stop() {
    log "停止 Uniswap 监控调度器..."
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            kill "$PID"
            rm -f "$PID_FILE"
            log "调度器已停止 (PID: $PID)"
        else
            error "进程不存在 (PID: $PID)"
            rm -f "$PID_FILE"
        fi
    else
        error "PID 文件不存在"
    fi
}

# 状态函数
status() {
    if check_running; then
        PID=$(cat "$PID_FILE")
        log "调度器正在运行 (PID: $PID)"
        
        # 显示最近的日志
        echo ""
        log "最近的日志:"
        tail -n 10 "$LOG_FILE" 2>/dev/null || echo "暂无日志"
        
        # 显示进程信息
        echo ""
        log "进程信息:"
        ps -p "$PID" -o pid,ppid,cmd,etime 2>/dev/null || echo "进程信息获取失败"
    else
        log "调度器未运行"
    fi
}

# 重启函数
restart() {
    log "重启 Uniswap 监控调度器..."
    stop
    sleep 2
    start
}

# 日志函数
logs() {
    if [ -f "$LOG_FILE" ]; then
        log "显示调度器日志:"
        tail -f "$LOG_FILE"
    else
        error "日志文件不存在: $LOG_FILE"
    fi
}

# 报告函数
reports() {
    REPORTS_DIR="$SCRIPT_DIR/reports"
    if [ -d "$REPORTS_DIR" ]; then
        log "最近的监控报告:"
        ls -la "$REPORTS_DIR" | head -10
    else
        error "报告目录不存在: $REPORTS_DIR"
    fi
}

# 开发模式启动
dev() {
    log "启动开发模式..."
    
    if check_running; then
        error "调度器已经在运行，请先停止"
        exit 1
    fi
    
    # 检查依赖是否安装
    if [ ! -d "node_modules" ]; then
        log "安装依赖..."
        npm install
    fi
    
    # 启动开发模式
    log "启动开发模式调度器..."
    nohup npm run dev > "$LOG_FILE" 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
    
    log "开发模式调度器已启动 (PID: $PID)"
    log "日志文件: $LOG_FILE"
}

# 测试函数
test() {
    log "运行测试..."
    npm run test
}

# 配置函数
config() {
    log "显示配置..."
    npm run config
}

# 帮助函数
help() {
    echo "Uniswap 监控调度器管理脚本"
    echo ""
    echo "用法: $0 {start|stop|restart|status|logs|reports|dev|test|config|help}"
    echo ""
    echo "命令:"
    echo "  start    启动调度器 (生产模式)"
    echo "  stop     停止调度器"
    echo "  restart  重启调度器"
    echo "  status   查看调度器状态"
    echo "  logs     查看实时日志"
    echo "  reports  查看监控报告"
    echo "  dev      启动开发模式"
    echo "  test     运行测试"
    echo "  config   显示配置"
    echo "  help     显示此帮助信息"
    echo ""
}

# 主函数
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    reports)
        reports
        ;;
    dev)
        dev
        ;;
    test)
        test
        ;;
    config)
        config
        ;;
    help|--help|-h)
        help
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status|logs|reports|dev|test|config|help}"
        exit 1
        ;;
esac

exit 0 