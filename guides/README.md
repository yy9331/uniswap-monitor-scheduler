# Uniswap Monitor Scheduler Guides

[English](README_EN.md) · [中文](README.md)

## 📚 指南文档

### 🚀 部署指南

- **[生产环境部署指南](PRODUCTION_DEPLOYMENT.md)** - 生产环境最佳实践和运行方式选择
- **[生产环境部署指南 (英文)](PRODUCTION_DEPLOYMENT_EN.md)** - Production environment deployment guide

### 🔄 迁移指南

- **[TypeScript 迁移指南](TYPESCRIPT_MIGRATION.md)** - 从 JavaScript 到 TypeScript 的完整迁移过程
- **[TypeScript 迁移指南 (英文)](TYPESCRIPT_MIGRATION_EN.md)** - Complete migration process from JavaScript to TypeScript

### 🚨 故障排除指南

- **[故障排除指南](TROUBLESHOOTING.md)** - 常见问题诊断和解决方案
- **[故障排除指南 (英文)](TROUBLESHOOTING_EN.md)** - Common issues diagnosis and solutions

### 📋 快速参考

#### 生产环境推荐流程

```bash
# 1. 首次部署
./setup-deployment.sh

# 2. 启动服务
./start.sh start background

# 3. 验证部署
./start.sh status
./start.sh logs 20
```

#### 日常管理命令

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

#### 高级管理 (PM2)

```bash
# 使用 PM2 管理
./start.sh start pm2

# 查看状态
pm2 status

# 查看日志
pm2 logs uniswap-monitor

# 重启服务
pm2 restart uniswap-monitor
```

## 🎯 不同场景的选择

| 场景 | 推荐方式 | 原因 |
|------|----------|------|
| **开发调试** | `npm run start` | 实时查看日志，方便调试 |
| **简单部署** | `./start.sh start background` | 后台运行，进程管理 |
| **生产环境** | PM2 管理 | 自动重启，监控完善 |

## 📊 文件说明

### 核心文件

- **`index.ts`** - 主程序文件，运行监控调度器
- **`setup-deployment.sh`** - 一次性部署脚本，用于首次部署
- **`start.sh`** - 启动脚本，用于日常管理

### 配置文件

- **`src/config.ts`** - 主配置文件
- **`ecosystem.config.js`** - PM2 配置文件

### 文档文件

- **`README.md`** - 项目主文档
- **`guides/`** - 指南文档目录

## 🔧 常见问题

### Q: 生产环境应该使用哪种方式运行？

**A: 推荐使用 `./start.sh start background` 或 PM2 管理**

- `./start.sh start background` - 简单可靠的后台运行
- PM2 管理 - 功能更完善，适合重要生产环境

### Q: `setup-deployment.sh` 和 `start.sh` 有什么区别？

**A: 职责不同**

- `setup-deployment.sh` - 一次性部署脚本，用于安装和配置
- `start.sh` - 日常管理脚本，用于启动、停止、重启服务

### Q: 如何查看服务状态？

**A: 使用以下命令**

```bash
# 查看状态
./start.sh status

# 查看日志
./start.sh logs 100

# 查看报告
./start.sh reports
```

### Q: 项目是如何从 JavaScript 迁移到 TypeScript 的？

**A: 查看迁移指南**

- 完整的迁移过程记录在 [TypeScript 迁移指南](TYPESCRIPT_MIGRATION.md)
- 包含详细的步骤、解决的问题和迁移效果

### Q: 如果执行两次 `./start.sh start background`，会不会重复执行两个相同的任务？

**A: 不会重复执行**

- **自动检测**: 脚本会自动检查是否已有进程在运行
- **防止重复**: 如果检测到服务已运行，会显示警告并退出
- **清理机制**: 会自动清理无效的 PID 文件
- **进程检查**: 支持检查后台进程和 PM2 进程

**示例输出:**
```bash
[2025-08-04 03:52:35] WARNING: 服务已在后台运行，PID: 608335
[2025-08-04 03:52:35] ERROR: 服务已在运行，请先停止现有服务: ./start.sh stop background
```

## 📞 获取帮助

- 查看 [生产环境部署指南](PRODUCTION_DEPLOYMENT.md) 获取详细说明
- 查看 [TypeScript 迁移指南](TYPESCRIPT_MIGRATION.md) 了解迁移过程
- 查看项目主文档 [README.md](../README.md) 了解完整功能
- 查看 [README.zh-CN.md](../README.zh-CN.md) 获取中文说明

---

**推荐：生产环境使用 `./start.sh start background` 或 PM2 管理，开发环境使用 `npm run start`** 