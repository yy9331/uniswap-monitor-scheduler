# Uniswap V2 监控调度器

[English](README_EN.md) · [中文](README.md)

监控 Uniswap V2 子图扫链进度的自动化工具，已配置为使用本地 RPC 节点。

## 🚀 快速开始

### 安装和启动
```bash
cd /home/code/uniswap-v2-monitor/uniswap-monitor-scheduler
npm install && npm run build
npm run start
```

### 实时查看状态
```bash
./realtime-monitor.sh
```

### 立即生成报告
```bash
npm run monitor:dev
```

## 📊 当前状态

### 以太坊同步进度
- **当前区块**: 4,777,814
- **目标区块**: 10,000,835 (Uniswap V2 Factory)
- **同步进度**: 48%
- **预计时间**: 约 4-5 小时

### 服务状态
- ✅ Graph Node: 运行中
- ✅ PostgreSQL: 运行中
- ✅ IPFS: 运行中
- ❌ 子图: 等待部署 (需要等区块同步完成)

## 🛠️ 常用命令

```bash
# 实时状态
./realtime-monitor.sh

# 立即生成报告
npm run monitor:dev

# 测试功能
npm run test:dev

# 查看日志
tail -f scheduler.log

# 查看报告
ls -la reports/ | tail -5
cat reports/report-$(date +%Y-%m-%d)*.txt
```

## ⚙️ 配置说明

### 主要配置 (src/config.ts)
- `ETHEREUM_RPC`: `http://localhost:8545` (本地节点)
- `POSTGRES_CONTAINER`: `uniswap-v2-monitor-subgraph_postgres_1`
- `MONITOR_DAYS`: 10 天
- `CRON_SCHEDULES`: 每天 7:00 和 19:00

### 快速配置修改
```bash
# 查看当前配置
npm run config

# 修改监控天数
npm run config:days

# 修改定时任务
npm run config:schedule
```

## 📈 监控内容

### 自动监控指标
- ✅ 以太坊区块同步进度
- ✅ 子图扫描进度
- ✅ 数据库大小和记录数
- ✅ Docker 容器状态
- ✅ 磁盘空间使用情况
- ✅ 系统资源使用情况

### 报告格式
- **JSON**: `reports/report-YYYY-MM-DD-HH-MM.json`
- **可读**: `reports/report-YYYY-MM-DD-HH-MM.txt`

## 🔧 故障排除

### 常见问题
1. **RPC 连接失败**: 检查 Ethereum Node 是否运行
2. **数据库连接失败**: 检查 PostgreSQL 容器状态
3. **报告生成失败**: 检查磁盘空间

### 调试命令
```bash
# 测试 RPC 连接
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545

# 测试数据库连接
docker exec uniswap-v2-monitor-subgraph_postgres_1 psql -U graph-node -d graph-node -c "SELECT COUNT(*) FROM ethereum_blocks;"

# 检查服务状态
docker-compose ps
```

## 📁 项目结构

```
uniswap-monitor-scheduler/
├── README.md              # 中文操作指南
├── README_EN.md           # 英文操作指南
├── realtime-monitor.sh    # 实时监控脚本
├── start.sh              # 服务启动脚本
├── setup-deployment.sh    # 部署脚本
├── clean-reports.sh       # 清理报告脚本
├── ecosystem.config.js    # PM2 配置文件
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── src/                  # TypeScript 源代码
│   ├── index.ts          # 主程序入口
│   ├── monitor.ts        # 监控核心逻辑
│   ├── config.ts         # 配置文件
│   ├── types.ts          # 类型定义
│   ├── test.ts           # 测试脚本
│   └── config-helper.ts  # 配置助手
├── dist/                 # 编译后的 JavaScript 文件
├── logs/                 # 日志文件目录
├── reports/              # 监控报告目录
└── node_modules/         # Node.js 依赖包
```

### 📋 主要文件说明

#### 脚本文件
- `realtime-monitor.sh` - 实时监控脚本，一键查看所有状态
- `start.sh` - 服务启动脚本，支持多种运行模式
- `setup-deployment.sh` - 部署脚本，自动化安装和配置
- `clean-reports.sh` - 清理旧报告脚本

#### 配置文件
- `package.json` - 项目配置和依赖管理
- `tsconfig.json` - TypeScript 编译配置
- `ecosystem.config.js` - PM2 进程管理配置
- `src/config.ts` - 监控参数配置

#### 源代码
- `src/index.ts` - 主程序入口，调度器核心
- `src/monitor.ts` - 监控逻辑，包含所有监控功能
- `src/config.ts` - 配置文件，集中管理所有参数
- `src/types.ts` - TypeScript 类型定义
- `src/test.ts` - 测试脚本，验证功能
- `src/config-helper.ts` - 配置助手，交互式配置

#### 输出目录
- `dist/` - 编译后的 JavaScript 文件，用于生产环境
- `logs/` - 日志文件，记录运行状态和错误信息
- `reports/` - 监控报告，JSON 和可读格式

## 📞 快速帮助

```bash
# 一键检查所有状态
./realtime-monitor.sh

# 立即生成报告
npm run monitor:dev

# 启动监控服务
npm run start

# 查看文档
cat README.md          # 中文版
cat README_EN.md       # 英文版
```

---

**注意**: 所有配置已优化为使用本地 RPC 节点，无需额外配置。 