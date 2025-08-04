# 故障排除指南

[English](TROUBLESHOOTING_EN.md) · [中文](TROUBLESHOOTING.md)

## 📋 概述

本指南记录了项目中遇到的常见问题和解决方案，特别是子图扫描卡住的问题。

## 🚨 子图扫描卡住问题

### 问题描述

子图扫描进度停滞在 0.05%，扫描区块卡在特定位置，无法继续前进。

### 症状表现

1. **扫描进度停滞**
   - 子图扫描区块：10,007,351
   - 当前以太坊区块：23,065,170
   - 扫描进度：0.05% (长期不变)

2. **错误日志**
   ```
   Subgraph failed with non-deterministic error: 
   failed to process trigger: block #10008355
   Entity Token[0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2]: 
   missing value for non-nullable field `totalSupply`
   ```

3. **重试失败**
   - 错误重试次数：21次
   - 重试延迟：3000+秒
   - 问题依然存在

### 问题原因分析

#### 1. **非确定性错误**
- **错误类型**: `non-deterministic error`
- **具体位置**: 区块 #10008355
- **涉及代币**: WETH (0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2)
- **缺失字段**: `totalSupply`

#### 2. **可能的原因**
- **数据源问题**: 以太坊节点数据不完整或损坏
- **合约状态问题**: WETH 合约在特定区块状态异常
- **子图映射逻辑**: 处理 WETH 代币时缺少必需字段
- **网络连接问题**: RPC 节点响应异常

#### 3. **影响范围**
- 子图扫描完全停止
- 无法处理后续区块
- 监控报告显示进度停滞

## 🛠️ 解决方案

### 步骤 1: 检查当前状态

```bash
# 检查监控调度器状态
./start.sh status

# 检查 Docker 容器状态
docker ps --filter "name=uniswap-v2-monitor" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 检查子图扫描进度
curl -s -X POST http://localhost:8000/subgraphs/name/uni-swap-v2-monitor \
  -H "Content-Type: application/json" \
  -d '{"query": "{ _meta { block { number } } }"}'

# 检查 Graph Node 错误日志
docker logs uniswap-v2-monitor-subgraph_graph-node_1 2>&1 | grep -i error | tail -10
```

### 步骤 2: 停止所有服务

```bash
# 停止监控调度器
./start.sh stop background

# 停止子图服务
cd ../uniswap-v2-monitor-subgraph
docker-compose down

# 检查并清理残留容器
docker ps | grep -E "(5432|5001|8000)"
docker stop <container_id> && docker rm <container_id>
```

### 步骤 3: 重新启动子图服务

```bash
# 重新启动子图服务
docker-compose up -d

# 等待服务启动
sleep 30

# 验证服务状态
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### 步骤 4: 更新配置文件

**问题**: 容器名称变更导致配置不匹配

**解决方案**: 更新 `src/config.ts` 中的容器名称

```typescript
// 更新前
POSTGRES_CONTAINER: 'uni-swap-v2-monitor_postgres_1',
DOCKER_FILTER: 'name=uni-swap-v2-monitor',

// 更新后
POSTGRES_CONTAINER: 'uniswap-v2-monitor-subgraph_postgres_1',
DOCKER_FILTER: 'name=uniswap-v2-monitor-subgraph',
```

### 步骤 5: 重启监控调度器

```bash
# 重新构建项目
npm run build

# 重启监控调度器
./start.sh restart background

# 验证服务状态
./start.sh status
```

### 步骤 6: 验证修复效果

```bash
# 检查监控调度器状态
./start.sh status

# 检查最新报告
cat reports/report-$(date +%Y-%m-%d)*.txt | tail -1

# 检查子图扫描进度
curl -s -X POST http://localhost:8000/subgraphs/name/uni-swap-v2-monitor \
  -H "Content-Type: application/json" \
  -d '{"query": "{ _meta { block { number } } }"}'

# 检查 Graph Node 日志
docker logs uniswap-v2-monitor-subgraph_graph-node_1 --tail 10
```

## 📊 修复效果验证

### 修复前状态
- ❌ 子图扫描卡在区块 10,008,355
- ❌ 错误重试 21 次失败
- ❌ 扫描进度 0.05% 停滞
- ❌ 容器名称配置错误

### 修复后状态
- ✅ 子图扫描恢复正常
- ✅ 错误日志消失
- ✅ 扫描进度开始增长
- ✅ 容器配置正确
- ✅ 监控调度器正常运行

## 🔍 预防措施

### 1. **定期监控**
```bash
# 每日检查状态
./start.sh status

# 查看错误日志
docker logs uniswap-v2-monitor-subgraph_graph-node_1 2>&1 | grep -i error

# 检查扫描进度
curl -s -X POST http://localhost:8000/subgraphs/name/uni-swap-v2-monitor \
  -H "Content-Type: application/json" \
  -d '{"query": "{ _meta { block { number } } }"}'
```

### 2. **配置检查**
- 确保容器名称配置正确
- 检查 Docker 网络设置
- 验证端口映射

### 3. **日志监控**
- 定期检查 Graph Node 错误日志
- 监控重试次数和延迟
- 关注非确定性错误

### 4. **备份策略**
- 定期备份数据库
- 保存配置文件
- 记录修复步骤

## 🚨 常见错误及解决方案

### 错误 1: 容器名称不匹配
```
Error response from daemon: No such container: uni-swap-v2-monitor_postgres_1
```

**解决方案**: 更新 `src/config.ts` 中的容器名称

### 错误 2: 端口被占用
```
Bind for 0.0.0.0:5432 failed: port is already allocated
```

**解决方案**: 
```bash
# 查找占用端口的容器
docker ps | grep -E "(5432|5001|8000)"

# 停止并删除容器
docker stop <container_id> && docker rm <container_id>
```

### 错误 3: 子图扫描卡住
```
Subgraph failed with non-deterministic error
```

**解决方案**: 重启子图服务
```bash
cd ../uniswap-v2-monitor-subgraph
docker-compose down
docker-compose up -d
```

## 📞 获取帮助

如果遇到其他问题：

1. **查看日志**: `./start.sh logs 100`
2. **检查状态**: `./start.sh status`
3. **查看报告**: `./start.sh reports`
4. **重启服务**: `./start.sh restart background`

## 📋 故障排除检查清单

- [ ] 检查监控调度器状态
- [ ] 检查 Docker 容器状态
- [ ] 检查子图扫描进度
- [ ] 查看错误日志
- [ ] 验证配置文件
- [ ] 重启相关服务
- [ ] 验证修复效果
- [ ] 更新文档记录

---

**最后更新**: 2025年8月4日  
**问题类型**: 子图扫描卡住  
**解决状态**: ✅ 已解决 