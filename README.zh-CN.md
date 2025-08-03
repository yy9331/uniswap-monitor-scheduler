# Uniswap V2 子图监控调度器

[English](README.md) · [中文](README.zh-CN.md)

这是一个用于定时监控 Uniswap V2 子图扫链进度和数据库大小的自动化工具。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Required-blue.svg)](https://docker.com/)

## ✨ 功能特性

- 🕐 **定时监控**: 每天早上 7:00 自动执行监控任务
- 📊 **进度跟踪**: 实时监控子图扫描进度
- 💾 **数据库监控**: 跟踪数据库大小和记录数量
- 🐳 **Docker 状态**: 监控容器运行状态
- 📈 **报告生成**: 生成详细的监控报告
- 📝 **日志记录**: 完整的操作日志记录
- ⚙️ **灵活配置**: 通过配置文件轻松修改监控参数
- ⏰ **自动停止**: 10天后自动停止监控

## 🏗️ 项目结构

```
uniswap-monitor-scheduler/
├── index.js          # 主程序 - 定时任务调度器
├── monitor.js        # 监控核心逻辑
├── config.js         # 配置文件 - 所有可配置参数
├── config-helper.js  # 配置助手 - 方便修改配置
├── test.js          # 测试脚本
├── start.sh         # 启动脚本
├── package.json     # 项目配置
├── README.md        # 英文文档
├── README.zh-CN.md  # 中文文档
├── logs/            # 日志目录
└── reports/         # 报告目录
```

## ⚙️ 配置管理

### 📝 配置文件 (config.js)

所有监控参数都集中在 `config.js` 文件中，方便修改：

```javascript
module.exports = {
    MONITOR_DAYS: 10,                    // 监控天数
    CRON_SCHEDULE: '0 7 * * *',         // 定时任务表达式
    TIMEZONE: 'Asia/Shanghai',           // 时区设置
    SUBGRAPH_PATH: '/path/to/subgraph',  // 子图路径
    GRAPHQL_ENDPOINT: 'http://...',      // GraphQL端点
    ETHEREUM_RPC: 'https://...',         // 以太坊RPC
    // ... 更多配置项
};
```

### 🛠️ 配置助手

使用配置助手可以轻松查看和修改配置：

```bash
# 查看当前配置
node config-helper.js

# 修改监控天数
node config-helper.js days 15

# 修改定时任务
node config-helper.js schedule "0 8 * * *"

# 修改时区
node config-helper.js timezone "America/New_York"

# 查看帮助
node config-helper.js help
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd /home/code/uniswap-v2-monitor/uniswap-monitor-scheduler
npm install
```

### 2. 查看和修改配置

```bash
# 查看当前配置
node config-helper.js

# 修改监控天数为15天
node config-helper.js days 15
```

### 3. 测试监控功能

```bash
# 运行测试脚本
npm run test
```

### 4. 启动监控调度器

```bash
# 启动定时监控
npm start
# 或者使用启动脚本
./start.sh start
```

## 📊 监控内容

### 📊 区块进度监控
- 当前以太坊最新区块
- 子图已扫描区块
- 扫描进度百分比
- 剩余待扫描区块数量

### 💾 数据库监控
- PostgreSQL 数据库大小
- 各表记录数量统计
- 数据增长趋势

### 🐳 系统状态监控
- Docker 容器运行状态
- Graph 节点健康状态
- 网络连接状态

## 📋 报告格式

### JSON 报告
```json
{
  "timestamp": "2024-08-03 07:00:00",
  "currentBlock": 23056926,
  "subgraphBlock": 10004985,
  "databaseSize": "718M",
  "progress": {
    "totalBlocks": 13051941,
    "scannedBlocks": 4150,
    "progress": 0.03,
    "remainingBlocks": 13047791
  },
  "databaseStats": [
    {"table": "chain1.blocks", "count": 2840},
    {"table": "sgd1.pair", "count": 0},
    {"table": "sgd1.swap", "count": 0}
  ]
}
```

### 可读报告
```
=== Uniswap V2 子图监控报告 ===
生成时间: 2024-08-03 07:00:00

📊 区块进度:
  当前以太坊区块: 23,056,926
  子图扫描区块: 10,004,985
  扫描进度: 0.03%
  已扫描区块: 4,150
  剩余区块: 13,047,791

💾 数据库信息:
  数据库大小: 718M

📈 数据统计:
  chain1.blocks: 2,840 条记录
  sgd1.pair: 0 条记录
  sgd1.swap: 0 条记录
```

## 🛠️ 使用方法

### 1. 手动执行监控

```bash
# 直接运行监控脚本
node monitor.js
```

### 2. 启动定时监控

```bash
# 启动调度器（每天早上7点执行）
npm start
# 或使用启动脚本
./start.sh start
```

### 3. 后台运行

```bash
# 使用 nohup 后台运行
nohup npm start > scheduler.log 2>&1 &

# 查看进程
ps aux | grep node

# 停止进程
pkill -f "node index.js"
```

### 4. 管理调度器

```bash
# 查看状态
./start.sh status

# 停止调度器
./start.sh stop

# 重启调度器
./start.sh restart

# 查看日志
./start.sh logs

# 查看报告
./start.sh reports
```

## 📁 日志和报告

### 日志文件
- `logs/monitor-YYYY-MM-DD.log`: 监控任务日志
- `logs/scheduler-YYYY-MM-DD.log`: 调度器日志

### 报告文件
- `reports/report-YYYY-MM-DD-HH-mm.json`: JSON 格式报告
- `reports/report-YYYY-MM-DD-HH-mm.txt`: 可读格式报告

## ⚙️ 配置说明

### 监控路径
- 子图项目路径: `/home/code/uniswap-v2-monitor/uniswap-v2-monitor-subgraph`
- GraphQL 端点: `http://localhost:8000/subgraphs/name/uni-swap-v2-monitor`

### 定时配置
- 执行时间: 每天早上 7:00
- 时区: Asia/Shanghai
- 监控周期: 10天 (可在 config.js 中修改)

### 可配置参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `MONITOR_DAYS` | 监控天数 | 10 |
| `CRON_SCHEDULE` | 定时任务表达式 | `0 7 * * *` |
| `TIMEZONE` | 时区 | `Asia/Shanghai` |
| `SUBGRAPH_PATH` | 子图路径 | `/home/code/...` |
| `GRAPHQL_ENDPOINT` | GraphQL端点 | `http://localhost:8000/...` |
| `ETHEREUM_RPC` | 以太坊RPC | `https://eth.llamarpc.com` |
| `REQUEST_TIMEOUT` | 请求超时时间 | 10000ms |
| `MAX_RETRIES` | 最大重试次数 | 3 |

## 🔧 故障排除

### 常见问题

1. **子图服务未启动**
   ```bash
   # 检查 Docker 容器状态
   docker ps --filter "name=uni-swap-v2-monitor"
   
   # 启动子图服务
   cd /home/code/uniswap-v2-monitor/uniswap-v2-monitor-subgraph
   docker-compose up -d
   ```

2. **数据库连接失败**
   ```bash
   # 检查 PostgreSQL 容器
   docker logs uni-swap-v2-monitor_postgres_1
   
   # 重启数据库
   docker-compose restart postgres
   ```

3. **权限问题**
   ```bash
   # 确保脚本有执行权限
   chmod +x monitor.js
   chmod +x index.js
   chmod +x config-helper.js
   ```

### 调试模式

```bash
# 启用详细日志
DEBUG=* npm start

# 查看实时日志
tail -f logs/scheduler-$(date +%Y-%m-%d).log
```

## 🚀 扩展功能

### 邮件通知
可以添加邮件通知功能，在监控任务完成后发送报告邮件。

### 微信/钉钉通知
可以集成企业微信或钉钉机器人，发送监控通知。

### 数据可视化
可以将监控数据导入到 Grafana 等工具进行可视化展示。

## 📄 许可证

[MIT License](LICENSE)

## 🤝 贡献

欢迎贡献代码！请随时提交 Pull Request。

## 📞 支持

如果您有任何问题或建议，请 [提交 Issue](https://github.com/yy9331/uniswap-monitor-scheduler/issues)。 