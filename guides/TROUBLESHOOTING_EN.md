# Troubleshooting Guide

[English](TROUBLESHOOTING_EN.md) · [中文](TROUBLESHOOTING.md)

## 📋 Overview

This guide documents common issues encountered in the project and their solutions, particularly the subgraph scanning stuck problem.

## 🚨 Subgraph Scanning Stuck Issue

### Problem Description

Subgraph scanning progress stalled at 0.05%, with scanning blocks stuck at a specific position, unable to continue.

### Symptoms

1. **Scanning Progress Stalled**
   - Subgraph scanning block: 10,007,351
   - Current Ethereum block: 23,065,170
   - Scanning progress: 0.05% (unchanged for long time)

2. **Error Logs**
   ```
   Subgraph failed with non-deterministic error: 
   failed to process trigger: block #10008355
   Entity Token[0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2]: 
   missing value for non-nullable field `totalSupply`
   ```

3. **Retry Failures**
   - Error retry count: 21 times
   - Retry delay: 3000+ seconds
   - Problem persists

### Root Cause Analysis

#### 1. **Non-deterministic Error**
- **Error Type**: `non-deterministic error`
- **Specific Location**: Block #10008355
- **Involved Token**: WETH (0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2)
- **Missing Field**: `totalSupply`

#### 2. **Possible Causes**
- **Data Source Issue**: Incomplete or corrupted Ethereum node data
- **Contract State Issue**: WETH contract state abnormal at specific block
- **Subgraph Mapping Logic**: Missing required fields when processing WETH token
- **Network Connection Issue**: RPC node response abnormal

#### 3. **Impact Scope**
- Subgraph scanning completely stopped
- Unable to process subsequent blocks
- Monitoring reports show stalled progress

## 🛠️ Solution

### Step 1: Check Current Status

```bash
# Check monitoring scheduler status
./start.sh status

# Check Docker container status
docker ps --filter "name=uniswap-v2-monitor" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check subgraph scanning progress
curl -s -X POST http://localhost:8000/subgraphs/name/uni-swap-v2-monitor \
  -H "Content-Type: application/json" \
  -d '{"query": "{ _meta { block { number } } }"}'

# Check Graph Node error logs
docker logs uniswap-v2-monitor-subgraph_graph-node_1 2>&1 | grep -i error | tail -10
```

### Step 2: Stop All Services

```bash
# Stop monitoring scheduler
./start.sh stop background

# Stop subgraph services
cd ../uniswap-v2-monitor-subgraph
docker-compose down

# Check and clean up residual containers
docker ps | grep -E "(5432|5001|8000)"
docker stop <container_id> && docker rm <container_id>
```

### Step 3: Restart Subgraph Services

```bash
# Restart subgraph services
docker-compose up -d

# Wait for services to start
sleep 30

# Verify service status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Step 4: Update Configuration File

**Problem**: Container name changes causing configuration mismatch

**Solution**: Update container names in `src/config.ts`

```typescript
// Before update
POSTGRES_CONTAINER: 'uni-swap-v2-monitor_postgres_1',
DOCKER_FILTER: 'name=uni-swap-v2-monitor',

// After update
POSTGRES_CONTAINER: 'uniswap-v2-monitor-subgraph_postgres_1',
DOCKER_FILTER: 'name=uniswap-v2-monitor-subgraph',
```

### Step 5: Restart Monitoring Scheduler

```bash
# Rebuild project
npm run build

# Restart monitoring scheduler
./start.sh restart background

# Verify service status
./start.sh status
```

### Step 6: Verify Fix Effect

```bash
# Check monitoring scheduler status
./start.sh status

# Check latest report
cat reports/report-$(date +%Y-%m-%d)*.txt | tail -1

# Check subgraph scanning progress
curl -s -X POST http://localhost:8000/subgraphs/name/uni-swap-v2-monitor \
  -H "Content-Type: application/json" \
  -d '{"query": "{ _meta { block { number } } }"}'

# Check Graph Node logs
docker logs uniswap-v2-monitor-subgraph_graph-node_1 --tail 10
```

## 📊 Fix Effect Verification

### Before Fix Status
- ❌ Subgraph scanning stuck at block 10,008,355
- ❌ Error retry failed 21 times
- ❌ Scanning progress stalled at 0.05%
- ❌ Container name configuration error

### After Fix Status
- ✅ Subgraph scanning resumed normally
- ✅ Error logs disappeared
- ✅ Scanning progress started growing
- ✅ Container configuration correct
- ✅ Monitoring scheduler running normally

## 🔍 Preventive Measures

### 1. **Regular Monitoring**
```bash
# Daily status check
./start.sh status

# View error logs
docker logs uniswap-v2-monitor-subgraph_graph-node_1 2>&1 | grep -i error

# Check scanning progress
curl -s -X POST http://localhost:8000/subgraphs/name/uni-swap-v2-monitor \
  -H "Content-Type: application/json" \
  -d '{"query": "{ _meta { block { number } } }"}'
```

### 2. **Configuration Check**
- Ensure container name configuration is correct
- Check Docker network settings
- Verify port mapping

### 3. **Log Monitoring**
- Regularly check Graph Node error logs
- Monitor retry count and delay
- Pay attention to non-deterministic errors

### 4. **Backup Strategy**
- Regularly backup database
- Save configuration files
- Record fix steps

## 🚨 Common Errors and Solutions

### Error 1: Container Name Mismatch
```
Error response from daemon: No such container: uni-swap-v2-monitor_postgres_1
```

**Solution**: Update container names in `src/config.ts`

### Error 2: Port Already in Use
```
Bind for 0.0.0.0:5432 failed: port is already allocated
```

**Solution**: 
```bash
# Find containers using ports
docker ps | grep -E "(5432|5001|8000)"

# Stop and remove containers
docker stop <container_id> && docker rm <container_id>
```

### Error 3: Subgraph Scanning Stuck
```
Subgraph failed with non-deterministic error
```

**Solution**: Restart subgraph services
```bash
cd ../uniswap-v2-monitor-subgraph
docker-compose down
docker-compose up -d
```

## 📞 Get Help

If you encounter other issues:

1. **View logs**: `./start.sh logs 100`
2. **Check status**: `./start.sh status`
3. **View reports**: `./start.sh reports`
4. **Restart service**: `./start.sh restart background`

## 📋 Troubleshooting Checklist

- [ ] Check monitoring scheduler status
- [ ] Check Docker container status
- [ ] Check subgraph scanning progress
- [ ] View error logs
- [ ] Verify configuration files
- [ ] Restart related services
- [ ] Verify fix effect
- [ ] Update documentation

---

**Last Updated**: August 4, 2025  
**Issue Type**: Subgraph scanning stuck  
**Resolution Status**: ✅ Resolved 