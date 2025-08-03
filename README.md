# Uniswap V2 Subgraph Monitor Scheduler

[English](README.md) · [中文](README.zh-CN.md)

An automated monitoring system for Uniswap V2 subgraph indexing progress with scheduled monitoring, database tracking, and comprehensive reporting.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
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

## 🏗️ Project Structure

```
uniswap-monitor-scheduler/
├── index.js          # Main scheduler - cron job manager
├── monitor.js        # Core monitoring logic
├── config.js         # Configuration file - all configurable parameters
├── config-helper.js  # Config helper - easy parameter modification
├── test.js          # Test script
├── start.sh         # Startup script
├── package.json     # Project configuration
├── README.md        # English documentation
├── README.zh-CN.md  # Chinese documentation
├── logs/            # Log directory
└── reports/         # Report directory
```

## ⚙️ Configuration Management

### 📝 Configuration File (config.js)

All monitoring parameters are centralized in `config.js` for easy modification:

```javascript
module.exports = {
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
node config-helper.js

# Modify monitoring duration
node config-helper.js days 15

# Modify cron schedule
node config-helper.js schedule "0 8 * * *"

# Modify timezone
node config-helper.js timezone "America/New_York"

# View help
node config-helper.js help
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /home/code/uniswap-v2-monitor/uniswap-monitor-scheduler
npm install
```

### 2. View and Modify Configuration

```bash
# View current configuration
node config-helper.js

# Modify monitoring duration to 15 days
node config-helper.js days 15
```

### 3. Test Monitoring Functionality

```bash
# Run test script
npm run test
```

### 4. Start Monitoring Scheduler

```bash
# Start scheduled monitoring
npm start
# Or use startup script
./start.sh start
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

## 🛠️ Usage

### 1. Manual Monitoring Execution

```bash
# Run monitoring script directly
node monitor.js
```

### 2. Start Scheduled Monitoring

```bash
# Start scheduler (executes daily at 7 AM)
npm start
# Or use startup script
./start.sh start
```

### 3. Background Operation

```bash
# Run in background with nohup
nohup npm start > scheduler.log 2>&1 &

# Check process
ps aux | grep node

# Stop process
pkill -f "node index.js"
```

### 4. Scheduler Management

```bash
# Check status
./start.sh status

# Stop scheduler
./start.sh stop

# Restart scheduler
./start.sh restart

# View logs
./start.sh logs

# View reports
./start.sh reports
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
- Monitoring period: 10 days (configurable in config.js)

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

3. **Permission Issues**
   ```bash
   # Ensure scripts have execution permissions
   chmod +x monitor.js
   chmod +x index.js
   chmod +x config-helper.js
   ```

### Debug Mode

```bash
# Enable detailed logging
DEBUG=* npm start

# View real-time logs
tail -f logs/scheduler-$(date +%Y-%m-%d).log
```

## 🚀 Extensions

### Email Notifications
Add email notification functionality to send reports after monitoring tasks complete.

### WeChat/DingTalk Notifications
Integrate with WeChat or DingTalk bots to send monitoring notifications.

### Data Visualization
Import monitoring data into tools like Grafana for visual display.

## 📄 License

[MIT License](LICENSE)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have any questions or issues, please [open an issue](https://github.com/yy9331/uniswap-monitor-scheduler/issues). 