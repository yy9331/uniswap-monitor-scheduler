# Uniswap V2 子图监控调度器

[English](README.md) · [中文](README.zh-CN.md)

这是一个用于定时监控 Uniswap V2 子图扫链进度和数据库大小的自动化工具。**现已完全迁移到 TypeScript，提供更好的类型安全性和开发体验。**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Required-blue.svg)](https://docker.com/)

## 📚 快速导航

- **[🚀 生产环境部署指南](guides/PRODUCTION_DEPLOYMENT.md)** - 生产环境最佳实践
- **[📋 快速开始](#-快速开始)** - 快速上手
- **[⚙️ 配置管理](#-配置管理)** - 配置监控参数
- **[🛠️ 管理命令](#-管理命令)** - 服务管理命令

## ✨ 功能特性

- 🕐 **定时监控**: 每天早上 7:00 自动执行监控任务
- 📊 **进度跟踪**: 实时监控子图扫描进度
- 💾 **数据库监控**: 跟踪数据库大小和记录数量
- 🐳 **Docker 状态**: 监控容器运行状态
- 📈 **报告生成**: 生成详细的监控报告
- 📝 **日志记录**: 完整的操作日志记录
- ⚙️ **灵活配置**: 通过配置文件轻松修改监控参数
- ⏰ **自动停止**: 10天后自动停止监控
- 🔒 **类型安全**: 完整的 TypeScript 支持，严格类型检查
- 🚀 **一键部署**: 生产环境一键部署脚本
- 💽 **磁盘空间监控**: 监控服务器磁盘空间和项目使用情况，提供早期预警

## 🏗️ 项目结构

```
uniswap-monitor-scheduler/
├── src/                    # TypeScript 源文件
│   ├── types.ts           # 类型定义
│   ├── config.ts          # 配置文件
│   ├── monitor.ts         # 监控核心逻辑
│   ├── index.ts           # 主调度器
│   ├── test.ts            # 测试脚本
│   └── config-helper.ts   # 配置助手
├── dist/                   # 编译后的 JavaScript 文件
├── logs/                   # 日志文件
├── reports/                # 报告文件
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── start.sh               # 启动脚本
├── setup-deployment.sh    # 一次性部署脚本
├── README.md              # 英文文档
├── README.zh-CN.md        # 中文文档
└── LICENSE                # MIT 许可证
```

## 🚀 快速开始

### 1. 快速部署 (推荐)

```bash
# 克隆项目并运行部署脚本
git clone <your-repository-url>
cd uniswap-monitor-scheduler
./setup-deployment.sh
```

### 2. 手动安装

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 测试功能
npm run test:dev

# 启动服务
./start.sh start
```

### 3. 生产环境部署

```bash
# 后台运行
nohup npm start > scheduler.log 2>&1 &

# 或使用 PM2
npm install -g pm2
pm2 start dist/index.js --name "uniswap-monitor"
```

## ⚙️ 配置管理

### 📝 配置文件 (src/config.ts)

所有监控参数都集中在 `src/config.ts` 文件中，方便修改：

```typescript
const config: Config = {
    MONITOR_DAYS: 10,                    // 监控天数
    CRON_SCHEDULE: '0 7 * * *',         // 定时任务表达式
    TIMEZONE: 'Asia/Shanghai',           // 时区设置
    SUBGRAPH_PATH: '/path/to/subgraph',  // 子图路径
    GRAPHQL_ENDPOINT: 'http://...',      // GraphQL端点
    ETHEREUM_RPC: 'https://...',         // 以太坊RPC
    
    // 磁盘空间监控
    DISK_MONITORING: {
        enabled: true,                    // 启用磁盘空间监控
        warning_threshold: 80,            // 警告阈值 (80%)
        critical_threshold: 90,           // 严重阈值 (90%)
        check_paths: ['/', '/home', '/var', '/tmp']  // 监控路径
    }
    // ... 更多配置项
};
```

### 🛠️ 配置助手

使用配置助手可以轻松查看和修改配置：

```bash
# 查看当前配置
npm run config

# 修改监控天数
npm run config:days 15

# 修改定时任务
npm run config:schedule "0 8 * * *"

# 修改时区
npm run config:timezone "America/New_York"

# 修改超时时间
npm run config:timeout 15000

# 修改重试次数
npm run config:retries 5

# 磁盘空间监控配置
npm run config:disk-enabled true
npm run config:disk-warning 85
npm run config:disk-critical 95
```

## 🛠️ 管理命令

### 服务管理

```bash
./start.sh start     # 启动服务
./start.sh stop      # 停止服务
./start.sh restart   # 重启服务
./start.sh status    # 查看状态
./start.sh logs      # 查看日志
./start.sh reports   # 查看报告
./start.sh dev       # 开发模式启动
./start.sh test      # 运行测试
./start.sh config    # 显示配置
```

### 开发模式

```bash
npm run dev          # 开发模式运行
npm run test:dev     # 开发模式测试
npm run monitor:dev  # 开发模式监控
```

### 生产模式

```bash
npm run build        # 构建项目
npm start            # 生产模式运行
npm run test         # 生产模式测试
npm run monitor      # 生产模式监控
```

## 📊 监控内容

### 📊 区块进度监控
- 当前以太坊最新区块
- 子图扫描区块
- 扫描进度百分比
- 剩余扫描区块

### 💾 数据库监控
- PostgreSQL 数据库大小
- 各表记录数量统计
- 数据增长趋势

### 🐳 系统状态监控
- Docker 容器运行状态
- Graph Node 健康状态
- 网络连接状态

### 💽 磁盘空间监控
- **系统磁盘空间**: 监控所有挂载的文件系统
- **项目使用情况**: 跟踪项目目录空间使用
- **数据库大小**: 监控 PostgreSQL 数据库增长
- **早期预警**: 当磁盘使用率超过阈值时发出警报
- **空间分解**: 按组件详细分解空间使用情况

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
  ],
  "diskSpace": {
    "system": [
      {
        "filesystem": "/dev/sda1",
        "size": "49G",
        "used": "8.0G",
        "available": "41G",
        "used_percentage": 17,
        "mountpoint": "/",
        "status": "normal"
      }
    ],
    "project": {
      "project_path": "/path/to/project",
      "total_size": "41M",
      "database_size": "1.3G",
      "logs_size": "20K",
      "reports_size": "92K",
      "other_size": "41M"
    },
    "warnings": []
  }
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

💽 磁盘空间监控:
  系统磁盘空间:
    🟢 /: 8.0G/49G (17%)
    🟢 /home: 2.1G/49G (4%)
  项目空间使用:
    总大小: 41M
    数据库: 1.3G
    日志: 20K
    报告: 92K
    其他: 41M

🐳 Docker 状态:
[容器状态信息]
```

## 🚀 服务器部署

### 环境要求

- **操作系统**: Linux (Ubuntu 20.04+ / CentOS 7+)
- **Node.js**: 16.x 或更高版本
- **Docker**: 用于运行子图服务
- **内存**: 至少 2GB RAM
- **存储**: 至少 10GB 可用空间

### 快速部署

```bash
# 1. 安装依赖
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. 克隆并部署
git clone <your-repository-url>
cd uniswap-monitor-scheduler
./setup-deployment.sh
```

### 系统服务配置 (可选)

创建 systemd 服务：

```bash
sudo nano /etc/systemd/system/uniswap-monitor.service
```

添加内容：

```ini
[Unit]
Description=Uniswap Monitor Scheduler
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/uniswap-monitor-scheduler
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

启用服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable uniswap-monitor
sudo systemctl start uniswap-monitor
sudo systemctl status uniswap-monitor
```

## 🔧 TypeScript 迁移

### 迁移总结

项目已成功从 JavaScript 迁移到 TypeScript，提供：

- **类型安全**: 编译时错误检查
- **更好的错误处理**: 明确的错误信息
- **开发体验**: IDE 智能提示和自动补全
- **代码质量**: 严格的类型检查

### 迁移详情

- ✅ 所有 JavaScript 文件迁移到 TypeScript
- ✅ 添加完整的类型定义
- ✅ 严格的 TypeScript 配置
- ✅ 更新构建系统
- ✅ 修复所有编译错误
- ✅ 支持开发和生产模式

### 新的项目结构

```
src/
├── types.ts           # 类型定义
├── config.ts          # 配置
├── monitor.ts         # 监控核心逻辑
├── index.ts           # 主调度器
├── test.ts            # 测试脚本
└── config-helper.ts   # 配置助手
```

## 📁 日志和报告

### 日志文件
- `logs/monitor-YYYY-MM-DD.log`: 监控任务日志
- `logs/scheduler-YYYY-MM-DD.log`: 调度器日志

### 报告文件
- `reports/report-YYYY-MM-DD-HH-mm.json`: JSON 格式报告
- `reports/report-YYYY-MM-DD-HH-mm.txt`: 可读格式报告

## ⚙️ 配置

### 监控路径
- 子图项目路径: `/home/code/uniswap-v2-monitor/uniswap-v2-monitor-subgraph`
- GraphQL 端点: `http://localhost:8000/subgraphs/name/uni-swap-v2-monitor`

### 调度配置
- 执行时间: 每天早上 7:00
- 时区: Asia/Shanghai
- 监控周期: 10 天 (可在 src/config.ts 中配置)

### 可配置参数

| 参数 | 描述 | 默认值 |
|------|------|--------|
| `MONITOR_DAYS` | 监控天数 | 10 |
| `CRON_SCHEDULE` | Cron 任务表达式 | `0 7 * * *` |
| `TIMEZONE` | 时区 | `Asia/Shanghai` |
| `SUBGRAPH_PATH` | 子图路径 | `/home/code/...` |
| `GRAPHQL_ENDPOINT` | GraphQL 端点 | `http://localhost:8000/...` |
| `ETHEREUM_RPC` | 以太坊 RPC | `https://eth.llamarpc.com` |
| `REQUEST_TIMEOUT` | 请求超时 | 10000ms |
| `MAX_RETRIES` | 最大重试次数 | 3 |
| `DISK_MONITORING.enabled` | 启用磁盘空间监控 | true |
| `DISK_MONITORING.warning_threshold` | 磁盘警告阈值 | 80% |
| `DISK_MONITORING.critical_threshold` | 磁盘严重阈值 | 90% |

## 🔧 故障排除

### 常见问题

1. **子图服务未运行**
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

3. **TypeScript 编译错误**
   ```bash
   # 检查 TypeScript 配置
   npm run type-check
   
   # 重新构建项目
   npm run build
   ```

4. **磁盘空间警告**
   ```bash
   # 手动检查磁盘空间
   df -h
   
   # 清理旧日志和报告
   find logs/ -name "*.log" -mtime +30 -delete
   find reports/ -name "*.json" -mtime +30 -delete
   ```

### 调试模式

```bash
# 启用详细日志
DEBUG=* npm start

# 查看实时日志
tail -f logs/scheduler-$(date +%Y-%m-%d).log
```

## 📈 性能优化

### 系统优化

```bash
# 增加文件描述符限制
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# 优化内核参数
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 监控优化

```bash
# 调整监控频率 (减少资源消耗)
npm run config:schedule "0 */6 * * *"  # 每6小时执行一次

# 调整超时时间
# 编辑 src/config.ts 中的 REQUEST_TIMEOUT 值

# 调整磁盘空间监控阈值
npm run config:disk-warning 85  # 设置警告阈值为 85%
npm run config:disk-critical 95 # 设置严重阈值为 95%
```

## 🔒 安全建议

### 网络安全

```bash
# 配置防火墙
sudo ufw allow 22/tcp
sudo ufw allow 8000/tcp  # Graph Node
sudo ufw allow 5432/tcp  # PostgreSQL
sudo ufw enable
```

### 访问控制

```bash
# 限制文件访问权限
chmod 600 src/config.ts
chmod 700 logs/ reports/

# 使用非 root 用户运行
sudo useradd -m -s /bin/bash uniswap-monitor
sudo chown -R uniswap-monitor:uniswap-monitor /path/to/uniswap-monitor-scheduler
```

## 🚀 扩展功能

### 邮件通知
添加邮件通知功能，在监控任务完成后发送报告。

### 微信/钉钉通知
集成微信或钉钉机器人发送监控通知。

### 数据可视化
将监控数据导入 Grafana 等工具进行可视化显示。

### Web 界面
添加 Express 服务器提供 Web 界面查看监控结果。

### 高级磁盘监控
- 设置自动磁盘清理脚本
- 配置磁盘空间警报（邮件/SMS）
- 实现磁盘使用趋势分析

## 📄 许可证

[MIT 许可证](LICENSE)

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📞 支持

如果你有任何问题或问题，请[提交 issue](https://github.com/yy9331/uniswap-monitor-scheduler/issues)。

---

**迁移完成！** 🎉

项目已成功迁移到 TypeScript，并准备好用于生产环境部署，提供改进的类型安全性和开发体验。 