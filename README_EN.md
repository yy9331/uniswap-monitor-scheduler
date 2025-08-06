# Uniswap V2 Monitor Scheduler

[English](README_EN.md) · [中文](README.md)

An automated monitoring tool for Uniswap V2 subgraph indexing progress, configured to use local RPC node.

## 🚀 Quick Start

### Installation and Startup
```bash
cd /home/code/uniswap-v2-monitor/uniswap-monitor-scheduler
npm install && npm run build
npm run start
```

### Real-time Status Check
```bash
./realtime-monitor.sh
```

### Generate Report Immediately
```bash
npm run monitor:dev
```

## 📊 Current Status

### Ethereum Sync Progress
- **Current Block**: 4,777,814
- **Target Block**: 10,000,835 (Uniswap V2 Factory)
- **Sync Progress**: 48%
- **Estimated Time**: ~4-5 hours

### Service Status
- ✅ Graph Node: Running
- ✅ PostgreSQL: Running
- ✅ IPFS: Running
- ❌ Subgraph: Waiting for deployment (needs block sync completion)

## 🛠️ Common Commands

```bash
# Real-time status
./realtime-monitor.sh

# Generate report immediately
npm run monitor:dev

# Test functionality
npm run test:dev

# View logs
tail -f scheduler.log

# View reports
ls -la reports/ | tail -5
cat reports/report-$(date +%Y-%m-%d)*.txt
```

## ⚙️ Configuration

### Main Configuration (src/config.ts)
- `ETHEREUM_RPC`: `http://localhost:8545` (local node)
- `POSTGRES_CONTAINER`: `uniswap-v2-monitor-subgraph_postgres_1`
- `MONITOR_DAYS`: 10 days
- `CRON_SCHEDULES`: Daily at 7:00 and 19:00

### Quick Configuration Changes
```bash
# View current configuration
npm run config

# Modify monitoring days
npm run config:days

# Modify scheduled tasks
npm run config:schedule
```

## 📈 Monitoring Content

### Auto-monitoring Metrics
- ✅ Ethereum block sync progress
- ✅ Subgraph scanning progress
- ✅ Database size and record count
- ✅ Docker container status
- ✅ Disk space usage
- ✅ System resource usage

### Report Formats
- **JSON**: `reports/report-YYYY-MM-DD-HH-MM.json`
- **Readable**: `reports/report-YYYY-MM-DD-HH-MM.txt`

## 🔧 Troubleshooting

### Common Issues
1. **RPC Connection Failed**: Check if Ethereum Node is running
2. **Database Connection Failed**: Check PostgreSQL container status
3. **Report Generation Failed**: Check disk space

### Debug Commands
```bash
# Test RPC connection
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545

# Test database connection
docker exec uniswap-v2-monitor-subgraph_postgres_1 psql -U graph-node -d graph-node -c "SELECT COUNT(*) FROM ethereum_blocks;"

# Check service status
docker-compose ps
```

## 📁 Project Structure

```
uniswap-monitor-scheduler/
├── README.md              # Chinese operation guide
├── README_EN.md           # English operation guide
├── realtime-monitor.sh    # Real-time monitoring script
├── start.sh              # Service startup script
├── setup-deployment.sh    # Deployment script
├── clean-reports.sh       # Clean reports script
├── ecosystem.config.js    # PM2 configuration file
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
├── src/                  # TypeScript source code
│   ├── index.ts          # Main program entry
│   ├── monitor.ts        # Monitoring core logic
│   ├── config.ts         # Configuration file
│   ├── types.ts          # Type definitions
│   ├── test.ts           # Test script
│   └── config-helper.ts  # Configuration helper
├── dist/                 # Compiled JavaScript files
├── logs/                 # Log files directory
├── reports/              # Monitoring reports directory
└── node_modules/         # Node.js dependencies
```

### 📋 Main File Descriptions

#### Script Files
- `realtime-monitor.sh` - Real-time monitoring script, one-click status check
- `start.sh` - Service startup script, supports multiple running modes
- `setup-deployment.sh` - Deployment script, automated installation and configuration
- `clean-reports.sh` - Clean old reports script

#### Configuration Files
- `package.json` - Project configuration and dependency management
- `tsconfig.json` - TypeScript compilation configuration
- `ecosystem.config.js` - PM2 process management configuration
- `src/config.ts` - Monitoring parameter configuration

#### Source Code
- `src/index.ts` - Main program entry, scheduler core
- `src/monitor.ts` - Monitoring logic, contains all monitoring functions
- `src/config.ts` - Configuration file, centralized parameter management
- `src/types.ts` - TypeScript type definitions
- `src/test.ts` - Test script, verify functionality
- `src/config-helper.ts` - Configuration helper, interactive configuration

#### Output Directories
- `dist/` - Compiled JavaScript files for production environment
- `logs/` - Log files, record running status and error information
- `reports/` - Monitoring reports, JSON and readable formats

## 📞 Quick Help

```bash
# One-click status check
./realtime-monitor.sh

# Generate report immediately
npm run monitor:dev

# Start monitoring service
npm run start

# View documentation
cat README.md          # Chinese version
cat README_EN.md       # English version
```

---

**Note**: All configurations have been optimized for local RPC node usage, no additional configuration needed. 