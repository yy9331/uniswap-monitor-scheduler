# Uniswap Monitor Scheduler Guides

[English](README_EN.md) · [中文](README.md)

## 📚 Guide Documents

### 🚀 Deployment Guides

- **[Production Environment Deployment Guide](PRODUCTION_DEPLOYMENT_EN.md)** - Production environment best practices and running method selection
- **[Production Environment Deployment Guide (Chinese)](PRODUCTION_DEPLOYMENT.md)** - 生产环境部署指南

### 📋 Quick Reference

#### Production Environment Recommended Process

```bash
# 1. Initial deployment
./deploy.sh

# 2. Start service
./start.sh start background

# 3. Verify deployment
./start.sh status
./start.sh logs 20
```

#### Daily Management Commands

```bash
# Start service
./start.sh start background

# Check status
./start.sh status

# View logs
./start.sh logs 100

# Restart service
./start.sh restart background

# Stop service
./start.sh stop background
```

#### Advanced Management (PM2)

```bash
# Use PM2 management
./start.sh start pm2

# Check status
pm2 status

# View logs
pm2 logs uniswap-monitor

# Restart service
pm2 restart uniswap-monitor
```

## 🎯 Selection for Different Scenarios

| Scenario | Recommended Method | Reason |
|----------|-------------------|--------|
| **Development Debugging** | `npm run start` | Real-time log viewing, convenient debugging |
| **Simple Deployment** | `./start.sh start background` | Background running, process management |
| **Production Environment** | PM2 Management | Auto restart, comprehensive monitoring |

## 📊 File Descriptions

### Core Files

- **`index.ts`** - Main program file, runs monitoring scheduler
- **`deploy.sh`** - Deployment script, for initial deployment
- **`start.sh`** - Start script, for daily management

### Configuration Files

- **`src/config.ts`** - Main configuration file
- **`ecosystem.config.js`** - PM2 configuration file

### Documentation Files

- **`README.md`** - Main project documentation
- **`guides/`** - Guide documentation directory

## 🔧 Frequently Asked Questions

### Q: Which method should be used for production environment?

**A: Recommend using `./start.sh start background` or PM2 management**

- `./start.sh start background` - Simple and reliable background running
- PM2 management - More comprehensive features, suitable for important production environments

### Q: What's the difference between `deploy.sh` and `start.sh`?

**A: Different responsibilities**

- `deploy.sh` - One-time deployment script, for installation and configuration
- `start.sh` - Daily management script, for starting, stopping, restarting services

### Q: How to check service status?

**A: Use the following commands**

```bash
# Check status
./start.sh status

# View logs
./start.sh logs 100

# View reports
./start.sh reports
```

## 📞 Get Help

- View [Production Environment Deployment Guide](PRODUCTION_DEPLOYMENT_EN.md) for detailed instructions
- View main project documentation [README.md](../README.md) to understand complete functionality
- View [README.zh-CN.md](../README.zh-CN.md) for Chinese instructions

---

**Recommendation: Use `./start.sh start background` or PM2 management for production environment, use `npm run start` for development environment** 