# Uniswap V2 Subgraph Monitor Scheduler

[English](README.md) · [中文](README.zh-CN.md)

An automated monitoring system for Uniswap V2 subgraph indexing progress with scheduled monitoring, database tracking, and comprehensive reporting. **Now fully migrated to TypeScript for better type safety and development experience.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Required-blue.svg)](https://docker.com/)

## ✨ Features

- 🕐 **Scheduled Monitoring**: Automated daily monitoring at 7:00 AM
- 📊 **Progress Tracking**: Real-time subgraph indexing progress monitoring
- 💾 **Database Monitoring**: Track database size and record counts
- 🐳 **Docker Status**: Monitor container health and status
- 📈 **Comprehensive Reporting**: Generate detailed JSON and readable reports
- 📝 **Complete Logging**: Full operation logs with timestamps
- ⚙️ **Flexible Configuration**: Easy parameter modification via config files
- ⏰ **Auto-Stop**: Automatic shutdown after configured monitoring period
- 🔒 **Type Safety**: Full TypeScript support with strict type checking
- 🚀 **Easy Deployment**: One-click deployment script for production

## 🏗️ Project Structure

```
uniswap-monitor-scheduler/
├── src/                    # TypeScript source files
│   ├── types.ts           # Type definitions
│   ├── config.ts          # Configuration file
│   ├── monitor.ts         # Core monitoring logic
│   ├── index.ts           # Main scheduler
│   ├── test.ts            # Test script
│   └── config-helper.ts   # Configuration helper
├── dist/                   # Compiled JavaScript files
├── logs/                   # Log files
├── reports/                # Report files
├── package.json           # Project configuration
├── tsconfig.json          # TypeScript configuration
├── start.sh               # Startup script
├── deploy.sh              # Quick deployment script
├── README.md              # English documentation
├── README.zh-CN.md        # Chinese documentation
└── LICENSE                # MIT License
```

## 🚀 Quick Start

### 1. Quick Deployment (Recommended)

```bash
# Clone the project and run the deployment script
git clone <your-repository-url>
cd uniswap-monitor-scheduler
./deploy.sh
```

### 2. Manual Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test functionality
npm run test:dev

# Start the service
./start.sh start
```

### 3. Production Deployment

```bash
# Background run
nohup npm start > scheduler.log 2>&1 &

# Or using PM2
npm install -g pm2
pm2 start dist/index.js --name "uniswap-monitor"
```

## ⚙️ Configuration Management

### 📝 Configuration File (src/config.ts)

All monitoring parameters are centralized in `src/config.ts` for easy modification:

```typescript
const config: Config = {
    MONITOR_DAYS: 10,                    // Monitoring duration in days
    CRON_SCHEDULE: '0 7 * * *',         // Cron job expression
    TIMEZONE: 'Asia/Shanghai',           // Timezone setting
    SUBGRAPH_PATH: '/path/to/subgraph',  // Subgraph path
    GRAPHQL_ENDPOINT: 'http://...',      // GraphQL endpoint
    ETHEREUM_RPC: 'https://...',         // Ethereum RPC
    // ... more configuration items
};
```

### 🛠️ Configuration Helper

Use the config helper to easily view and modify settings:

```bash
# View current configuration
npm run config

# Modify monitoring duration
npm run config:days 15

# Modify cron schedule
npm run config:schedule "0 8 * * *"

# Modify timezone
npm run config:timezone "America/New_York"

# Modify timeout
npm run config:timeout 15000

# Modify retries
npm run config:retries 5
```

## 🛠️ Management Commands

### Service Management

```bash
./start.sh start     # Start service
./start.sh stop      # Stop service
./start.sh restart   # Restart service
./start.sh status    # Check status
./start.sh logs      # View logs
./start.sh reports   # View reports
./start.sh dev       # Start in development mode
./start.sh test      # Run tests
./start.sh config    # Show configuration
```

### Development Mode

```bash
npm run dev          # Run in development mode
npm run test:dev     # Run tests in development mode
npm run monitor:dev  # Run monitor in development mode
```

### Production Mode

```bash
npm run build        # Build project
npm start            # Run in production mode
npm run test         # Run tests in production mode
npm run monitor      # Run monitor in production mode
```

## 📊 Monitoring Content

### 📊 Block Progress Monitoring
- Current Ethereum latest block
- Subgraph scanned blocks
- Scanning progress percentage
- Remaining blocks to scan

### 💾 Database Monitoring
- PostgreSQL database size
- Record count statistics for each table
- Data growth trends

### 🐳 System Status Monitoring
- Docker container running status
- Graph node health status
- Network connection status

## 📋 Report Formats

### JSON Report
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

### Readable Report
```
=== Uniswap V2 Subgraph Monitoring Report ===
Generated: 2024-08-03 07:00:00

📊 Block Progress:
  Current Ethereum Block: 23,056,926
  Subgraph Scanned Block: 10,004,985
  Scanning Progress: 0.03%
  Scanned Blocks: 4,150
  Remaining Blocks: 13,047,791

💾 Database Information:
  Database Size: 718M

📈 Data Statistics:
  chain1.blocks: 2,840 records
  sgd1.pair: 0 records
  sgd1.swap: 0 records
```

## 🚀 Server Deployment

### Environment Requirements

- **OS**: Linux (Ubuntu 20.04+ / CentOS 7+)
- **Node.js**: 16.x or higher
- **Docker**: For running subgraph services
- **Memory**: At least 2GB RAM
- **Storage**: At least 10GB available space

### Quick Deployment

```bash
# 1. Install dependencies
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Clone and deploy
git clone <your-repository-url>
cd uniswap-monitor-scheduler
./deploy.sh
```

### System Service Configuration (Optional)

Create systemd service:

```bash
sudo nano /etc/systemd/system/uniswap-monitor.service
```

Add content:

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

Enable service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable uniswap-monitor
sudo systemctl start uniswap-monitor
sudo systemctl status uniswap-monitor
```

## 🔧 TypeScript Migration

### Migration Summary

The project has been successfully migrated from JavaScript to TypeScript, providing:

- **Type Safety**: Compile-time error checking
- **Better Error Handling**: Explicit error messages
- **Development Experience**: IDE intellisense and autocomplete
- **Code Quality**: Strict type checking

### Migration Details

- ✅ All JavaScript files migrated to TypeScript
- ✅ Complete type definitions added
- ✅ Strict TypeScript configuration
- ✅ Build system updated
- ✅ All compilation errors fixed
- ✅ Development and production modes supported

### New Project Structure

```
src/
├── types.ts           # Type definitions
├── config.ts          # Configuration
├── monitor.ts         # Core monitoring logic
├── index.ts           # Main scheduler
├── test.ts            # Test script
└── config-helper.ts   # Configuration helper
```

## 📁 Logs and Reports

### Log Files
- `logs/monitor-YYYY-MM-DD.log`: Monitoring task logs
- `logs/scheduler-YYYY-MM-DD.log`: Scheduler logs

### Report Files
- `reports/report-YYYY-MM-DD-HH-mm.json`: JSON format reports
- `reports/report-YYYY-MM-DD-HH-mm.txt`: Readable format reports

## ⚙️ Configuration

### Monitoring Paths
- Subgraph project path: `/home/code/uniswap-v2-monitor/uniswap-v2-monitor-subgraph`
- GraphQL endpoint: `http://localhost:8000/subgraphs/name/uni-swap-v2-monitor`

### Schedule Configuration
- Execution time: Daily at 7:00 AM
- Timezone: Asia/Shanghai
- Monitoring period: 10 days (configurable in src/config.ts)

### Configurable Parameters

| Parameter | Description | Default Value |
|-----------|-------------|---------------|
| `MONITOR_DAYS` | Monitoring duration in days | 10 |
| `CRON_SCHEDULE` | Cron job expression | `0 7 * * *` |
| `TIMEZONE` | Timezone | `Asia/Shanghai` |
| `SUBGRAPH_PATH` | Subgraph path | `/home/code/...` |
| `GRAPHQL_ENDPOINT` | GraphQL endpoint | `http://localhost:8000/...` |
| `ETHEREUM_RPC` | Ethereum RPC | `https://eth.llamarpc.com` |
| `REQUEST_TIMEOUT` | Request timeout | 10000ms |
| `MAX_RETRIES` | Maximum retry attempts | 3 |

## 🔧 Troubleshooting

### Common Issues

1. **Subgraph Service Not Running**
   ```bash
   # Check Docker container status
   docker ps --filter "name=uni-swap-v2-monitor"
   
   # Start subgraph service
   cd /home/code/uniswap-v2-monitor/uniswap-v2-monitor-subgraph
   docker-compose up -d
   ```

2. **Database Connection Failed**
   ```bash
   # Check PostgreSQL container
   docker logs uni-swap-v2-monitor_postgres_1
   
   # Restart database
   docker-compose restart postgres
   ```

3. **TypeScript Compilation Errors**
   ```bash
   # Check TypeScript configuration
   npm run type-check
   
   # Rebuild project
   npm run build
   ```

### Debug Mode

```bash
# Enable detailed logging
DEBUG=* npm start

# View real-time logs
tail -f logs/scheduler-$(date +%Y-%m-%d).log
```

## 📈 Performance Optimization

### System Optimization

```bash
# Increase file descriptor limits
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Optimize kernel parameters
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Monitoring Optimization

```bash
# Adjust monitoring frequency (reduce resource consumption)
npm run config:schedule "0 */6 * * *"  # Execute every 6 hours

# Adjust timeout time
# Edit REQUEST_TIMEOUT value in src/config.ts
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

## 🚀 Extensions

### Email Notifications
Add email notification functionality to send reports after monitoring tasks complete.

### WeChat/DingTalk Notifications
Integrate with WeChat or DingTalk bots to send monitoring notifications.

### Data Visualization
Import monitoring data into tools like Grafana for visual display.

### Web Interface
Add Express server to provide web interface for viewing monitoring results.

## 📄 License

[MIT License](LICENSE)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have any questions or issues, please [open an issue](https://github.com/yy9331/uniswap-monitor-scheduler/issues).

---

**Migration Complete!** 🎉

The project has been successfully migrated to TypeScript and is ready for production deployment with improved type safety and development experience. 