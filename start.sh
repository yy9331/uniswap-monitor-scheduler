#!/bin/bash

# Uniswap 监控调度器启动脚本
# 支持多种运行模式：前台、后台、PM2

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

# 检查依赖
check_dependencies() {
    if ! command -v node &> /dev/null; then
        error "Node.js 未安装"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm 未安装"
        exit 1
    fi
    
    log "依赖检查通过"
}

# 构建项目
build_project() {
    log "构建项目..."
    if npm run build; then
        log "项目构建成功"
    else
        error "项目构建失败"
        exit 1
    fi
}

# 启动服务
start_service() {
    local mode=$1
    
    case $mode in
        "foreground"|"fg")
            log "前台模式启动..."
            npm start
            ;;
        "background"|"bg")
            log "后台模式启动..."
            nohup npm start > scheduler.log 2>&1 &
            local pid=$!
            echo $pid > scheduler.pid
            log "服务已在后台启动，PID: $pid"
            log "日志文件: scheduler.log"
            ;;
        "pm2")
            log "PM2 模式启动..."
            if command -v pm2 &> /dev/null; then
                pm2 start ecosystem.config.js
                log "PM2 服务已启动"
                pm2 status
            else
                error "PM2 未安装，请先运行: npm install -g pm2"
                exit 1
            fi
            ;;
        *)
            error "未知的运行模式: $mode"
            echo "可用模式: foreground(fg), background(bg), pm2"
            exit 1
            ;;
    esac
}

# 停止服务
stop_service() {
    local mode=$1
    
    case $mode in
        "background"|"bg")
            if [ -f scheduler.pid ]; then
                local pid=$(cat scheduler.pid)
                if ps -p $pid > /dev/null 2>&1; then
                    log "停止后台进程 PID: $pid"
                    kill $pid
                    rm scheduler.pid
                else
                    warn "进程 $pid 不存在"
                    rm -f scheduler.pid
                fi
            else
                warn "未找到 PID 文件"
                pkill -f "npm start"
            fi
            ;;
        "pm2")
            if command -v pm2 &> /dev/null; then
                log "停止 PM2 服务..."
                pm2 stop uniswap-monitor
                pm2 delete uniswap-monitor
            else
                error "PM2 未安装"
            fi
            ;;
        *)
            error "未知的停止模式: $mode"
            ;;
    esac
}

# 查看状态
show_status() {
    log "检查服务状态..."
    
    # 检查后台进程
    if [ -f scheduler.pid ]; then
        local pid=$(cat scheduler.pid)
        if ps -p $pid > /dev/null 2>&1; then
            log "后台进程运行中，PID: $pid"
            ps -p $pid -o pid,ppid,cmd,etime
        else
            warn "后台进程不存在"
            rm -f scheduler.pid
        fi
    fi
    
    # 检查 PM2 进程
    if command -v pm2 &> /dev/null; then
        pm2 status
    fi
    
    # 检查日志文件
    if [ -f scheduler.log ]; then
        log "最新日志 (最后10行):"
        tail -10 scheduler.log
    fi
}

# 查看日志
show_logs() {
    local lines=${1:-50}
    
    if [ -f scheduler.log ]; then
        log "显示最后 $lines 行日志:"
        tail -n $lines scheduler.log
    else
        warn "未找到日志文件"
    fi
}

# 查看报告
show_reports() {
    if [ -d reports ]; then
        log "最新报告文件:"
        ls -la reports/ | head -10
        echo ""
        log "最新报告内容:"
        if [ -f reports/report-$(date +%Y-%m-%d)*.txt ]; then
            ls -t reports/report-$(date +%Y-%m-%d)*.txt | head -1 | xargs cat
        else
            warn "今天没有生成报告"
        fi
    else
        warn "报告目录不存在"
    fi
}

# 开发模式
dev_mode() {
    log "开发模式启动..."
    npm run dev
}

# 测试模式
test_mode() {
    log "测试模式启动..."
    npm run test:dev
}

# 配置模式
config_mode() {
    log "显示配置信息..."
    npm run config
}

# 主函数
main() {
    local action=$1
    local mode=$2
    
    check_dependencies
    
    case $action in
        "start")
            build_project
            start_service ${mode:-"background"}
            ;;
        "stop")
            stop_service ${mode:-"background"}
            ;;
        "restart")
            stop_service ${mode:-"background"}
            sleep 2
            build_project
            start_service ${mode:-"background"}
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs $2
            ;;
        "reports")
            show_reports
            ;;
        "dev")
            dev_mode
            ;;
        "test")
            test_mode
            ;;
        "config")
            config_mode
            ;;
        "help"|"--help"|"-h")
            echo "Uniswap 监控调度器管理脚本"
            echo ""
            echo "用法: $0 <action> [mode]"
            echo ""
            echo "Actions:"
            echo "  start    启动服务"
            echo "  stop     停止服务"
            echo "  restart  重启服务"
            echo "  status   查看状态"
            echo "  logs     查看日志"
            echo "  reports  查看报告"
            echo "  dev      开发模式"
            echo "  test     测试模式"
            echo "  config   显示配置"
            echo "  help     显示帮助"
            echo ""
            echo "Modes:"
            echo "  foreground(fg)  前台运行"
            echo "  background(bg)   后台运行 (默认)"
            echo "  pm2              PM2 运行"
            echo ""
            echo "示例:"
            echo "  $0 start              # 后台启动"
            echo "  $0 start foreground   # 前台启动"
            echo "  $0 start pm2          # PM2 启动"
            echo "  $0 stop               # 停止服务"
            echo "  $0 logs 100           # 查看最后100行日志"
            ;;
        *)
            error "未知操作: $action"
            echo "使用 '$0 help' 查看帮助"
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@" 