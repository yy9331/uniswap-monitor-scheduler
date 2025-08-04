# Production Environment Deployment Guide

[English](PRODUCTION_DEPLOYMENT_EN.md) · [中文](PRODUCTION_DEPLOYMENT.md)

## 🎯 Production Environment Running Method Selection

### 📊 Comparison of Three Running Methods

| Method | Use Case | Advantages | Disadvantages | Recommendation |
|--------|----------|------------|---------------|----------------|
| `./start.sh start background` | **Production Environment** | Background running, process management, log recording | Requires script file | ⭐⭐⭐⭐⭐ |
| `npm run start` | Development debugging | Simple and direct, real-time logs | Foreground running, stops when terminal closes | ⭐⭐⭐ |
| `./setup-deployment.sh` | Initial deployment | Complete deployment process | One-time script, not suitable for daily running | ⭐⭐ |

## 🚀 Recommended Solution: Using Start Script

### Production Environment Best Practices

```bash
# 1. Initial deployment
./setup-deployment.sh

# 2. After deployment, use start script for management
./start.sh start background

# 3. Verify service status
./start.sh status

# 4. View initial logs
./start.sh logs 20
```

### Daily Management Commands

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

## 🛠️ Advanced Production Environment Management (PM2)

### Advantages of Using PM2

- **Auto Restart**: Automatically restarts when process crashes
- **Boot Auto-start**: Automatically starts after server reboot
- **Monitoring Dashboard**: Real-time CPU and memory monitoring
- **Log Management**: Comprehensive log rotation
- **Cluster Mode**: Support for multiple instances

### PM2 Deployment Process

```bash
# 1. Install PM2
npm install -g pm2

# 2. Start with PM2
./start.sh start pm2

# 3. Set auto-start on boot
pm2 startup
pm2 save

# 4. Monitor service
pm2 monit
```

### PM2 Management Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs uniswap-monitor

# Restart service
pm2 restart uniswap-monitor

# Stop service
pm2 stop uniswap-monitor

# Delete service
pm2 delete uniswap-monitor

# Monitoring dashboard
pm2 monit
```

## 📋 Detailed Explanation of Each Method

### 1. `./start.sh start background` (Recommended)

**Advantages:**
- Automatic background running
- Complete process management
- Log recording to files
- Status checking support
- Restart and stop support
- **Prevent duplicate startup** - Automatically detect running processes

**Use Cases:**
- Production environment deployment
- Services requiring stable operation
- Services requiring process management

**Command Examples:**
```bash
# Start
./start.sh start background

# Check status
./start.sh status

# View logs
./start.sh logs 100

# Restart
./start.sh restart background

# Stop
./start.sh stop background
```

### 2. `npm run start` (For Development)

**Advantages:**
- Simple and direct
- Real-time log viewing
- Suitable for debugging

**Disadvantages:**
- Foreground running, stops when terminal closes
- No process management features

**Use Cases:**
- Development debugging
- Feature testing
- Real-time log viewing

**Command Examples:**
```bash
# Start
npm run start

# Stop
Ctrl+C
```

### 3. `./setup-deployment.sh` (For Deployment)

**Advantages:**
- Complete deployment process
- Environment checking
- Dependency installation
- Configuration management

**Disadvantages:**
- One-time script
- Not suitable for daily running
- Re-deploys every time it runs

**Use Cases:**
- Initial deployment
- Re-deployment
- Environment migration

**Command Examples:**
```bash
# Run deployment script
./setup-deployment.sh
```

## 🔧 Detailed Deployment Process

### Initial Deployment Process

```bash
# 1. Clone project
git clone <repository-url>
cd uniswap-monitor-scheduler

# 2. Run deployment script
./setup-deployment.sh

# 3. After deployment, start service
./start.sh start background

# 4. Verify deployment
./start.sh status
./start.sh logs 20
```

### Daily Management Process

```bash
# Start service
./start.sh start background

# Check status
./start.sh status

# View logs
./start.sh logs 50

# View reports
./start.sh reports

# Restart service
./start.sh restart background

# Stop service
./start.sh stop background
```

### Configuration Management

```bash
# View configuration
./start.sh config

# Modify configuration
npm run config:days 30
npm run config:schedule "0 8 * * *"
npm run config:timezone "Asia/Shanghai"
npm run config:disk-warning 85
npm run config:disk-critical 95
```

## 📊 Monitoring and Maintenance

### Service Monitoring

```bash
# Check service status
./start.sh status

# View real-time logs
tail -f scheduler.log

# View today's logs
./start.sh logs 100

# View reports
./start.sh reports
```

### Troubleshooting

```bash
# Check process status
ps aux | grep "npm start"

# Check port usage
netstat -tlnp | grep :8000

# Check disk space
df -h

# Check memory usage
free -h

# Check log files
ls -la logs/
```

### Performance Optimization

```bash
# System optimization
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Kernel parameter optimization
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 🔒 Security Recommendations

### Network Security

```bash
# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 8000/tcp  # Graph Node
sudo ufw allow 5432/tcp  # PostgreSQL
sudo ufw enable
```

### Access Control

```bash
# Restrict file access permissions
chmod 600 src/config.ts
chmod 700 logs/ reports/

# Run with non-root user
sudo useradd -m -s /bin/bash uniswap-monitor
sudo chown -R uniswap-monitor:uniswap-monitor /path/to/uniswap-monitor-scheduler
```

## 📈 Best Practices

### 1. Choose Appropriate Method

- **Development debugging**: Use `npm run start`
- **Simple deployment**: Use `./start.sh start background`
- **Production environment**: Use PM2 management

### 2. Monitoring and Alerts

- Regularly check service status
- Set up disk space monitoring
- Configure log rotation
- Set up process monitoring alerts

### 3. Backup and Recovery

- Regularly backup configuration files
- Backup logs and reports
- Develop recovery plans

### 4. Updates and Maintenance

- Regularly update dependencies
- Clean up old logs and reports
- Monitor system resource usage

## 🎯 Final Recommendations

**For production environment, strongly recommend using:**

```bash
# 1. Initial deployment
./setup-deployment.sh

# 2. Daily management using start script
./start.sh start background    # Start
./start.sh status             # Check status
./start.sh logs 100           # View logs
./start.sh restart background  # Restart
./start.sh stop background     # Stop
```

**Or use PM2 (Advanced production environment management):**

```bash
# Use PM2 management
./start.sh start pm2
pm2 status
pm2 logs uniswap-monitor
pm2 restart uniswap-monitor
```

This ensures service stability while providing complete management functionality!

---

**Summary: For production environment, recommend using `./start.sh start background` or PM2 management, avoid using `npm run start` and `./setup-deployment.sh` for daily operation.** 