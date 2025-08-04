#!/bin/bash

# Uniswap 监控调度器快速部署脚本

set -e

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

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

# 检查系统要求
check_requirements() {
    log "检查系统要求..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js 未安装，请先安装 Node.js 16.x 或更高版本"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        error "Node.js 版本过低，需要 16.x 或更高版本"
        exit 1
    fi
    
    log "Node.js 版本: $(node --version)"
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        error "npm 未安装"
        exit 1
    fi
    
    log "npm 版本: $(npm --version)"
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        warning "Docker 未安装，监控功能可能无法正常工作"
    else
        log "Docker 版本: $(docker --version)"
    fi
    
    # 检查 Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        warning "Docker Compose 未安装，子图服务可能无法启动"
    else
        log "Docker Compose 版本: $(docker-compose --version)"
    fi
}

# 安装依赖
install_dependencies() {
    log "安装项目依赖..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        log "依赖安装完成"
    else
        log "依赖已存在，跳过安装"
    fi
}

# 构建项目
build_project() {
    log "构建 TypeScript 项目..."
    
    if npm run build; then
        log "项目构建成功"
    else
        error "项目构建失败"
        exit 1
    fi
}

# 测试项目
test_project() {
    log "运行项目测试..."
    
    if npm run test:dev; then
        log "项目测试通过"
    else
        warning "项目测试失败，但继续部署"
    fi
}

# 配置项目
configure_project() {
    log "配置项目..."
    
    # 显示当前配置
    npm run config
    
    echo ""
    read -p "是否要修改配置？(y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "可用的配置命令："
        echo "  npm run config:days <天数>      # 设置监控天数"
        echo "  npm run config:schedule <cron>  # 设置定时任务"
        echo "  npm run config:timezone <时区>  # 设置时区"
        echo ""
        echo "示例："
        echo "  npm run config:days 30"
        echo "  npm run config:schedule \"0 7 * * *\""
        echo "  npm run config:timezone \"Asia/Shanghai\""
        echo ""
        echo "配置完成后，请重新运行此脚本"
        exit 0
    fi
}

# 启动子图服务
start_subgraph() {
    log "检查子图服务..."
    
    if [ -d "../uniswap-v2-monitor-subgraph" ]; then
        cd ../uniswap-v2-monitor-subgraph
        
        if command -v docker-compose &> /dev/null; then
            log "启动子图服务..."
            docker-compose up -d
            
            # 等待服务启动
            log "等待子图服务启动..."
            sleep 10
            
            # 检查服务状态
            if docker ps --filter "name=uni-swap-v2-monitor" | grep -q "Up"; then
                log "子图服务启动成功"
            else
                warning "子图服务可能未正常启动，请检查 Docker 状态"
            fi
        else
            warning "Docker Compose 未安装，跳过子图服务启动"
        fi
        
        cd ../uniswap-monitor-scheduler
    else
        warning "子图项目目录不存在，跳过子图服务启动"
    fi
}

# 启动监控服务
start_monitor() {
    log "启动监控服务..."
    
    # 检查是否已经在运行
    if [ -f "scheduler.pid" ]; then
        PID=$(cat scheduler.pid)
        if ps -p "$PID" > /dev/null 2>&1; then
            warning "监控服务已在运行 (PID: $PID)"
            read -p "是否要重启服务？(y/N): " -n 1 -r
            echo ""
            
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                ./start.sh stop
                sleep 2
            else
                log "服务已在运行，部署完成"
                return
            fi
        fi
    fi
    
    # 启动服务
    ./start.sh start
    
    # 等待服务启动
    sleep 3
    
    # 检查服务状态
    if ./start.sh status | grep -q "正在运行"; then
        log "监控服务启动成功"
    else
        error "监控服务启动失败"
        exit 1
    fi
}

# 显示部署信息
show_deployment_info() {
    echo ""
    log "🎉 部署完成！"
    echo ""
    echo "📋 部署信息："
    echo "  - 项目目录: $(pwd)"
    echo "  - 日志目录: $(pwd)/logs"
    echo "  - 报告目录: $(pwd)/reports"
    echo ""
    echo "🛠️ 管理命令："
    echo "  ./start.sh start     # 启动服务"
    echo "  ./start.sh stop      # 停止服务"
    echo "  ./start.sh restart   # 重启服务"
    echo "  ./start.sh status    # 查看状态"
    echo "  ./start.sh logs      # 查看日志"
    echo "  ./start.sh reports   # 查看报告"
    echo ""
    echo "📊 监控信息："
    echo "  - 监控周期: $(npm run config 2>/dev/null | grep "监控天数" | cut -d':' -f2 | xargs)"
    echo "  - 执行时间: $(npm run config 2>/dev/null | grep "定时任务" | cut -d':' -f2 | xargs)"
    echo "  - 时区设置: $(npm run config 2>/dev/null | grep "时区" | cut -d':' -f2 | xargs)"
    echo ""
    echo "📞 故障排除："
    echo "  - 查看日志: tail -f logs/scheduler-$(date +%Y-%m-%d).log"
    echo "  - 运行测试: npm run test:dev"
    echo "  - 查看配置: npm run config"
    echo ""
    echo "📚 更多信息请查看："
    echo "  - SERVER_DEPLOYMENT.md  # 服务器部署指南"
    echo "  - MIGRATION.md          # TypeScript 迁移说明"
    echo "  - README.md             # 项目文档"
    echo ""
}

# 主函数
main() {
    echo "🚀 Uniswap 监控调度器部署脚本"
    echo "=================================="
    echo ""
    
    check_requirements
    install_dependencies
    build_project
    test_project
    configure_project
    start_subgraph
    start_monitor
    show_deployment_info
}

# 运行主函数
main "$@" 