# 生产环境部署指南

[English](PRODUCTION_DEPLOYMENT_EN.md) · [中文](PRODUCTION_DEPLOYMENT.md)

## 🎯 生产环境运行方式选择

### 📊 三种运行方式对比

| 方式 | 适用场景 | 优点 | 缺点 | 推荐指数 |
|------|----------|------|------|----------|
| `./start.sh start background` | **生产环境** | 后台运行、进程管理、日志记录 | 需要脚本文件 | ⭐⭐⭐⭐⭐ |
| `npm run start` | 开发调试 | 简单直接、实时日志 | 前台运行、终端关闭会停止 | ⭐⭐⭐ |
| `./setup-deployment.sh` | 首次部署 | 完整部署流程 | 一次性脚本、不适合日常运行 | ⭐⭐ |

## 🚀 推荐方案：使用启动脚本

### 生产环境最佳实践

```bash
# 1. 首次部署
./setup-deployment.sh

# 2. 部署完成后，使用启动脚本管理
./start.sh start background

# 3. 验证服务状态
./start.sh status

# 4. 查看初始日志
./start.sh logs 20
```

### 日常管理命令

```bash
# 启动服务
./start.sh start background

# 查看状态
./start.sh status

# 查看日志
./start.sh logs 100

# 重启服务
./start.sh restart background

# 停止服务
./start.sh stop background
```

## 🛠️ 高级生产环境管理（PM2）

### 使用 PM2 的优势

- **自动重启**: 进程崩溃时自动重启
- **开机自启**: 服务器重启后自动启动
- **监控面板**: 实时监控 CPU、内存使用
- **日志管理**: 完善的日志轮转
- **集群模式**: 支持多实例运行

### PM2 部署流程

```bash
# 1. 安装 PM2
npm install -g pm2

# 2. 使用 PM2 启动
./start.sh start pm2

# 3. 设置开机自启
pm2 startup
pm2 save

# 4. 监控服务
pm2 monit
```

### PM2 管理命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs uniswap-monitor

# 重启服务
pm2 restart uniswap-monitor

# 停止服务
pm2 stop uniswap-monitor

# 删除服务
pm2 delete uniswap-monitor

# 监控面板
pm2 monit
```

## 📋 各方式详细说明

### 1. `./start.sh start background` (推荐)

**优点：**
- 自动后台运行
- 完整的进程管理
- 日志记录到文件
- 支持状态检查
- 支持重启和停止
- **防止重复启动** - 自动检测已运行的进程

**使用场景：**
- 生产环境部署
- 需要稳定运行的服务
- 需要进程管理功能

**命令示例：**
```bash
# 启动
./start.sh start background

# 查看状态
./start.sh status

# 查看日志
./start.sh logs 100

# 重启
./start.sh restart background

# 停止
./start.sh stop background
```

### 2. `npm run start` (开发用)

**优点：**
- 简单直接
- 实时查看日志
- 适合调试

**缺点：**
- 前台运行，终端关闭会停止
- 没有进程管理功能

**使用场景：**
- 开发调试
- 测试功能
- 查看实时日志

**命令示例：**
```bash
# 启动
npm run start

# 停止
Ctrl+C
```

### 3. `./setup-deployment.sh` (部署用)

**优点：**
- 完整的部署流程
- 环境检查
- 依赖安装
- 配置管理

**缺点：**
- 一次性脚本
- 不适合日常运行
- 每次运行都会重新部署

**使用场景：**
- 首次部署
- 重新部署
- 环境迁移

**命令示例：**
```bash
# 运行部署脚本
./setup-deployment.sh
```

## 🔧 部署流程详解

### 首次部署流程

```bash
# 1. 克隆项目
git clone <repository-url>
cd uniswap-monitor-scheduler

# 2. 运行部署脚本
./setup-deployment.sh

# 3. 部署完成后，启动服务
./start.sh start background

# 4. 验证部署
./start.sh status
./start.sh logs 20
```

### 日常管理流程

```bash
# 启动服务
./start.sh start background

# 查看状态
./start.sh status

# 查看日志
./start.sh logs 50

# 查看报告
./start.sh reports

# 重启服务
./start.sh restart background

# 停止服务
./start.sh stop background
```

### 配置管理

```bash
# 查看配置
./start.sh config

# 修改配置
npm run config:days 30
npm run config:schedule "0 8 * * *"
npm run config:timezone "Asia/Shanghai"
npm run config:disk-warning 85
npm run config:disk-critical 95
```

## 📊 监控和维护

### 服务监控

```bash
# 查看服务状态
./start.sh status

# 查看实时日志
tail -f scheduler.log

# 查看今日日志
./start.sh logs 100

# 查看报告
./start.sh reports
```

### 故障排除

```bash
# 检查进程状态
ps aux | grep "npm start"

# 检查端口占用
netstat -tlnp | grep :8000

# 检查磁盘空间
df -h

# 检查内存使用
free -h

# 检查日志文件
ls -la logs/
```

### 性能优化

```bash
# 系统优化
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# 内核参数优化
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
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

## 📈 最佳实践

### 1. 选择合适的方式

- **开发调试**: 使用 `npm run start`
- **简单部署**: 使用 `./start.sh start background`
- **生产环境**: 使用 PM2 管理

### 2. 监控和告警

- 定期检查服务状态
- 设置磁盘空间监控
- 配置日志轮转
- 设置进程监控告警

### 3. 备份和恢复

- 定期备份配置文件
- 备份日志和报告
- 制定恢复计划

### 4. 更新和维护

- 定期更新依赖
- 清理旧日志和报告
- 监控系统资源使用

## 🎯 最终建议

**对于生产环境，强烈推荐使用：**

```bash
# 1. 首次部署
./setup-deployment.sh

# 2. 日常管理使用启动脚本
./start.sh start background    # 启动
./start.sh status             # 查看状态
./start.sh logs 100           # 查看日志
./start.sh restart background  # 重启
./start.sh stop background     # 停止
```

**或者使用 PM2（更高级的生产环境管理）：**

```bash
# 使用 PM2 管理
./start.sh start pm2
pm2 status
pm2 logs uniswap-monitor
pm2 restart uniswap-monitor
```

这样既保证了服务的稳定性，又提供了完整的管理功能！

---

**总结：生产环境推荐使用 `./start.sh start background` 或 PM2 管理，避免使用 `npm run start` 和 `./setup-deployment.sh` 进行日常运行。** 