# TypeScript 迁移指南

[English](TYPESCRIPT_MIGRATION_EN.md) · [中文](TYPESCRIPT_MIGRATION.md)

## 📋 迁移概述

本项目从简单的 JavaScript 文件成功迁移到完整的 TypeScript 项目，提供了更好的类型安全性、开发体验和代码质量。

### 🎯 迁移目标

- **类型安全**: 编译时错误检查
- **开发体验**: IDE 智能提示和自动补全
- **代码质量**: 严格的类型检查
- **维护性**: 更好的代码结构和文档

## 📊 迁移前后对比

### 项目结构变化

| 迁移前 (JavaScript) | 迁移后 (TypeScript) |
|---------------------|---------------------|
| `index.js` | `src/index.ts` |
| `monitor.js` | `src/monitor.ts` |
| `config.js` | `src/config.ts` |
| `config-helper.js` | `src/config-helper.ts` |
| `test.js` | `src/test.ts` |
| 无类型定义 | `src/types.ts` |
| 无配置文件 | `tsconfig.json` |

### 文件重命名和重构

```bash
# 迁移前的文件结构
├── index.js              # 主程序文件
├── monitor.js            # 监控逻辑
├── config.js             # 配置文件
├── config-helper.js      # 配置助手
└── test.js               # 测试文件

# 迁移后的文件结构
├── src/
│   ├── index.ts          # 主程序文件
│   ├── monitor.ts        # 监控逻辑
│   ├── config.ts         # 配置文件
│   ├── config-helper.ts  # 配置助手
│   ├── test.ts           # 测试文件
│   └── types.ts          # 类型定义
├── dist/                 # 编译输出目录
├── tsconfig.json         # TypeScript 配置
└── package.json          # 更新的依赖
```

## 🔧 详细迁移步骤

### 1. 创建 TypeScript 配置文件

**新增文件**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "logs",
    "reports"
  ],
  "ts-node": {
    "esm": false,
    "experimentalSpecifierResolution": "node"
  }
}
```

### 2. 更新 package.json

**主要变化**:

```json
{
  "name": "uniswap-monitor-scheduler",
  "version": "1.0.0",
  "description": "定时监控 Uniswap v2 子图扫链进度和数据库大小",
  "main": "dist/index.js",  // 从 index.js 改为 dist/index.js
  "scripts": {
    "build": "tsc",                    // 新增构建脚本
    "start": "npm run build && node dist/index.js",  // 更新启动脚本
    "dev": "ts-node src/index.ts",     // 新增开发模式
    "monitor": "npm run build && node dist/monitor.js",
    "monitor:dev": "ts-node src/monitor.ts",
    "test": "npm run build && node dist/test.js",
    "test:dev": "ts-node src/test.ts",
    "config": "ts-node src/config-helper.ts",
    "config:days": "ts-node src/config-helper.ts days",
    "config:schedule": "ts-node src/config-helper.ts schedule",
    "config:timezone": "ts-node src/config-helper.ts timezone",
    "config:timeout": "ts-node src/config-helper.ts timeout",
    "config:retries": "ts-node src/config-helper.ts retries",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "node-cron": "^3.0.3",
    "axios": "^1.6.0",
    "fs-extra": "^11.1.1",
    "moment": "^2.29.4",
    "nodemailer": "^6.9.7"
  },
  "devDependencies": {                 // 新增开发依赖
    "@types/node": "^20.0.0",
    "@types/node-cron": "^3.0.0",
    "@types/fs-extra": "^11.0.0",
    "@types/nodemailer": "^6.4.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.0"
  },
  "keywords": [
    "uniswap",
    "subgraph",
    "monitor",
    "scheduler",
    "typescript"                        // 新增关键字
  ]
}
```

### 3. 创建类型定义文件

**新增文件**: `src/types.ts`

```typescript
// 配置接口定义
export interface Config {
  // 监控周期设置
  MONITOR_DAYS: number;
  
  // 定时任务设置
  CRON_SCHEDULE: string;
  TIMEZONE: string;
  
  // 监控路径设置
  SUBGRAPH_PATH: string;
  GRAPHQL_ENDPOINT: string;
  
  // 以太坊设置
  ETHEREUM_RPC: string;
  UNISWAP_V2_START_BLOCK: number;
  
  // 数据库设置
  POSTGRES_CONTAINER: string;
  POSTGRES_USER: string;
  POSTGRES_DB: string;
  
  // Docker 设置
  DOCKER_FILTER: string;
  
  // 日志设置
  LOG_LEVEL: string;
  
  // 报告设置
  REPORT_FORMATS: string[];
  
  // 超时设置
  REQUEST_TIMEOUT: number;
  
  // 重试设置
  MAX_RETRIES: number;
  RETRY_DELAY: number;
  
  // 通知设置
  NOTIFICATIONS: {
    enabled: boolean;
    email: {
      enabled: boolean;
      smtp: string;
      user: string;
      pass: string;
      to: string;
    };
    webhook: {
      enabled: boolean;
      url: string;
    };
  };
}

// 监控报告接口
export interface MonitorReport {
  timestamp: string;
  currentBlock: number | null;
  subgraphBlock: number | null;
  databaseSize: string | null;
  progress: {
    totalBlocks: number;
    scannedBlocks: number;
    progress: number;
    remainingBlocks: number;
  } | null;
  databaseStats: Array<{
    table: string;
    count: number;
  }>;
  dockerStatus: {
    containers: Array<{
      name: string;
      status: string;
    }>;
  };
}

// 数据库统计项接口
export interface DatabaseStat {
  table: string;
  count: number;
}

// Docker容器状态接口
export interface DockerContainer {
  name: string;
  status: string;
}

// 进度信息接口
export interface ProgressInfo {
  totalBlocks: number;
  scannedBlocks: number;
  progress: number;
  remainingBlocks: number;
}
```

### 4. 迁移核心文件

#### 4.1 配置文件迁移 (`config.js` → `src/config.ts`)

**主要变化**:
- 添加类型导入
- 使用 ES6 模块语法
- 添加类型注解

```typescript
import { Config } from './types';

const config: Config = {
    // 监控周期设置
    MONITOR_DAYS: 10,
    
    // 定时任务设置
    CRON_SCHEDULE: '0 7 * * *',
    TIMEZONE: 'Asia/Shanghai',
    
    // ... 其他配置项
};

export default config;
```

#### 4.2 监控类迁移 (`monitor.js` → `src/monitor.ts`)

**主要变化**:
- 添加类型导入
- 为类属性添加类型注解
- 为方法参数和返回值添加类型
- 改进错误处理

```typescript
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import moment from 'moment';
import { exec } from 'child_process';
import { promisify } from 'util';
import config from './config';
import { MonitorReport, ProgressInfo } from './types';

const execAsync = promisify(exec);

class UniswapMonitor {
    private subgraphPath: string;
    private logPath: string;
    private reportPath: string;

    constructor() {
        this.subgraphPath = config.SUBGRAPH_PATH;
        this.logPath = path.join(__dirname, '..', 'logs');
        this.reportPath = path.join(__dirname, '..', 'reports');
        this.ensureDirectories();
    }

    private async ensureDirectories(): Promise<void> {
        await fs.ensureDir(this.logPath);
        await fs.ensureDir(this.reportPath);
    }

    async log(message: string): Promise<void> {
        // ... 实现
    }

    async getCurrentBlock(): Promise<number | null> {
        // ... 实现
    }

    // ... 其他方法
}

export default UniswapMonitor;
```

#### 4.3 主程序迁移 (`index.js` → `src/index.ts`)

**主要变化**:
- 添加类型注解
- 改进错误处理
- 修复路径引用

```typescript
import cron from 'node-cron';
import moment from 'moment';
import fs from 'fs-extra';
import path from 'path';
import config from './config';
import UniswapMonitor from './monitor';

class Scheduler {
    private monitor: UniswapMonitor;
    private startDate: moment.Moment;
    private endDate: moment.Moment;
    private isRunning: boolean = false;

    constructor() {
        this.monitor = new UniswapMonitor();
        this.startDate = moment();
        this.endDate = moment().add(config.MONITOR_DAYS, 'days');
    }

    async log(message: string): Promise<void> {
        // ... 实现
    }

    async start(): Promise<void> {
        // ... 实现
    }

    async stop(): Promise<void> {
        // ... 实现
    }
}

// 启动调度器
const scheduler = new Scheduler();
scheduler.start().catch(console.error);
```

#### 4.4 配置助手迁移 (`config-helper.js` → `src/config-helper.ts`)

**主要变化**:
- 添加类型注解
- 更新帮助信息
- 改进错误处理

```typescript
#!/usr/bin/env ts-node

import fs from 'fs-extra';
import path from 'path';
import config from './config';

// 颜色定义
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message: string, color: keyof typeof colors = 'reset'): void {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function showConfig(): void {
    // ... 实现
}

function updateConfig(key: string, value: string | number): void {
    // ... 实现
}

function showHelp(): void {
    // ... 实现
}

// 主函数
async function main(): Promise<void> {
    // ... 实现
}

// 运行主函数
main().catch(console.error);
```

### 5. 更新启动脚本

**文件**: `start.sh`

**主要变化**:
- 添加 TypeScript 构建步骤
- 更新路径引用
- 添加开发模式支持

```bash
# 构建 TypeScript 项目
log "构建 TypeScript 项目..."
if ! npm run build; then
    error "TypeScript 构建失败"
    exit 1
fi

# 启动调度器
log "启动监控调度器..."
nohup node dist/index.js > "$LOG_FILE" 2>&1 &
```

### 6. 更新 .gitignore

**新增内容**:
```
dist/
*.tsbuildinfo
```

## 🔍 迁移过程中解决的问题

### 1. 类型错误修复

**问题**: TypeScript 严格模式下的类型错误
**解决方案**: 添加适当的类型注解和空值检查

```typescript
// 修复前
const [table, count] = line.split('|');
return { table: table.trim(), count: parseInt(count) || 0 };

// 修复后
const parts = line.split('|');
const table = parts[0];
const count = parts[1];
return { 
    table: table?.trim() || 'unknown', 
    count: parseInt(count || '0') || 0 
};
```

### 2. 路径引用修复

**问题**: 文件路径引用错误
**解决方案**: 更新路径引用以适配新的目录结构

```typescript
// 修复前
const logFile = path.join(__dirname, 'logs', `scheduler-${moment().format('YYYY-MM-DD')}.log`);

// 修复后
const logFile = path.join(__dirname, '..', 'logs', `scheduler-${moment().format('YYYY-MM-DD')}.log`);
```

### 3. 错误处理改进

**问题**: 错误对象类型不明确
**解决方案**: 添加类型检查

```typescript
// 修复前
await this.log(`获取当前区块失败: ${error.message}`);

// 修复后
await this.log(`获取当前区块失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
```

## 📈 迁移效果

### 代码质量提升

- **类型安全**: 编译时错误检查，减少运行时错误
- **代码可读性**: 明确的类型定义提高代码可读性
- **维护性**: 更好的 IDE 支持和重构能力
- **文档性**: 类型定义作为代码文档

### 开发体验改善

- **智能提示**: IDE 提供准确的代码补全
- **错误检测**: 实时错误提示和修复建议
- **重构支持**: 安全的代码重构
- **调试能力**: 更好的调试支持

### 性能优化

- **编译优化**: TypeScript 编译器优化
- **运行时性能**: 类型信息在编译时被移除，不影响运行时性能
- **构建优化**: 支持增量编译

## 🚀 迁移后的使用

### 开发模式

```bash
# 开发模式运行
npm run dev

# 开发模式测试
npm run test:dev

# 开发模式监控
npm run monitor:dev
```

### 生产模式

```bash
# 构建项目
npm run build

# 生产模式运行
npm start

# 生产模式测试
npm run test

# 生产模式监控
npm run monitor
```

### 类型检查

```bash
# 类型检查
npm run type-check

# 清理构建文件
npm run clean
```

## 📋 迁移检查清单

- [x] 创建 `tsconfig.json` 配置文件
- [x] 更新 `package.json` 依赖和脚本
- [x] 创建 `src/types.ts` 类型定义文件
- [x] 迁移 `config.js` → `src/config.ts`
- [x] 迁移 `monitor.js` → `src/monitor.ts`
- [x] 迁移 `index.js` → `src/index.ts`
- [x] 迁移 `config-helper.js` → `src/config-helper.ts`
- [x] 迁移 `test.js` → `src/test.ts`
- [x] 更新 `start.sh` 启动脚本
- [x] 更新 `.gitignore` 文件
- [x] 修复所有类型错误
- [x] 测试所有功能
- [x] 更新文档

## 🎉 迁移完成

项目已成功从 JavaScript 迁移到 TypeScript，获得了：

- ✅ **完整的类型安全**
- ✅ **更好的开发体验**
- ✅ **更高的代码质量**
- ✅ **更强的维护能力**

迁移后的项目保持了所有原有功能，同时提供了更好的类型安全性和开发体验。

---

**迁移时间**: 2024年8月4日  
**迁移版本**: 从 JavaScript 到 TypeScript 5.0+  
**迁移状态**: ✅ 完成 