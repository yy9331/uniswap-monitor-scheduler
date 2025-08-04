# TypeScript Migration Guide

[English](TYPESCRIPT_MIGRATION_EN.md) · [中文](TYPESCRIPT_MIGRATION.md)

## 📋 Migration Overview

This project was successfully migrated from simple JavaScript files to a complete TypeScript project, providing better type safety, development experience, and code quality.

### 🎯 Migration Goals

- **Type Safety**: Compile-time error checking
- **Development Experience**: IDE intellisense and autocomplete
- **Code Quality**: Strict type checking
- **Maintainability**: Better code structure and documentation

## 📊 Before and After Comparison

### Project Structure Changes

| Before (JavaScript) | After (TypeScript) |
|---------------------|---------------------|
| `index.js` | `src/index.ts` |
| `monitor.js` | `src/monitor.ts` |
| `config.js` | `src/config.ts` |
| `config-helper.js` | `src/config-helper.ts` |
| `test.js` | `src/test.ts` |
| No type definitions | `src/types.ts` |
| No config file | `tsconfig.json` |

### File Renaming and Restructuring

```bash
# File structure before migration
├── index.js              # Main program file
├── monitor.js            # Monitoring logic
├── config.js             # Configuration file
├── config-helper.js      # Configuration helper
└── test.js               # Test file

# File structure after migration
├── src/
│   ├── index.ts          # Main program file
│   ├── monitor.ts        # Monitoring logic
│   ├── config.ts         # Configuration file
│   ├── config-helper.ts  # Configuration helper
│   ├── test.ts           # Test file
│   └── types.ts          # Type definitions
├── dist/                 # Compiled output directory
├── tsconfig.json         # TypeScript configuration
└── package.json          # Updated dependencies
```

## 🔧 Detailed Migration Steps

### 1. Create TypeScript Configuration File

**New file**: `tsconfig.json`

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

### 2. Update package.json

**Major changes**:

```json
{
  "name": "uniswap-monitor-scheduler",
  "version": "1.0.0",
  "description": "Scheduled monitoring of Uniswap v2 subgraph indexing progress and database size",
  "main": "dist/index.js",  // Changed from index.js to dist/index.js
  "scripts": {
    "build": "tsc",                    // New build script
    "start": "npm run build && node dist/index.js",  // Updated start script
    "dev": "ts-node src/index.ts",     // New development mode
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
  "devDependencies": {                 // New development dependencies
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
    "typescript"                        // New keyword
  ]
}
```

### 3. Create Type Definition File

**New file**: `src/types.ts`

```typescript
// Configuration interface definition
export interface Config {
  // Monitoring cycle settings
  MONITOR_DAYS: number;
  
  // Scheduled task settings
  CRON_SCHEDULE: string;
  TIMEZONE: string;
  
  // Monitoring path settings
  SUBGRAPH_PATH: string;
  GRAPHQL_ENDPOINT: string;
  
  // Ethereum settings
  ETHEREUM_RPC: string;
  UNISWAP_V2_START_BLOCK: number;
  
  // Database settings
  POSTGRES_CONTAINER: string;
  POSTGRES_USER: string;
  POSTGRES_DB: string;
  
  // Docker settings
  DOCKER_FILTER: string;
  
  // Log settings
  LOG_LEVEL: string;
  
  // Report settings
  REPORT_FORMATS: string[];
  
  // Timeout settings
  REQUEST_TIMEOUT: number;
  
  // Retry settings
  MAX_RETRIES: number;
  RETRY_DELAY: number;
  
  // Notification settings
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

// Monitoring report interface
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

// Database statistics item interface
export interface DatabaseStat {
  table: string;
  count: number;
}

// Docker container status interface
export interface DockerContainer {
  name: string;
  status: string;
}

// Progress information interface
export interface ProgressInfo {
  totalBlocks: number;
  scannedBlocks: number;
  progress: number;
  remainingBlocks: number;
}
```

### 4. Migrate Core Files

#### 4.1 Configuration File Migration (`config.js` → `src/config.ts`)

**Major changes**:
- Add type imports
- Use ES6 module syntax
- Add type annotations

```typescript
import { Config } from './types';

const config: Config = {
    // Monitoring cycle settings
    MONITOR_DAYS: 10,
    
    // Scheduled task settings
    CRON_SCHEDULE: '0 7 * * *',
    TIMEZONE: 'Asia/Shanghai',
    
    // ... other configuration items
};

export default config;
```

#### 4.2 Monitor Class Migration (`monitor.js` → `src/monitor.ts`)

**Major changes**:
- Add type imports
- Add type annotations for class properties
- Add types for method parameters and return values
- Improve error handling

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
        // ... implementation
    }

    async getCurrentBlock(): Promise<number | null> {
        // ... implementation
    }

    // ... other methods
}

export default UniswapMonitor;
```

#### 4.3 Main Program Migration (`index.js` → `src/index.ts`)

**Major changes**:
- Add type annotations
- Improve error handling
- Fix path references

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
        // ... implementation
    }

    async start(): Promise<void> {
        // ... implementation
    }

    async stop(): Promise<void> {
        // ... implementation
    }
}

// Start scheduler
const scheduler = new Scheduler();
scheduler.start().catch(console.error);
```

#### 4.4 Configuration Helper Migration (`config-helper.js` → `src/config-helper.ts`)

**Major changes**:
- Add type annotations
- Update help information
- Improve error handling

```typescript
#!/usr/bin/env ts-node

import fs from 'fs-extra';
import path from 'path';
import config from './config';

// Color definitions
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
    // ... implementation
}

function updateConfig(key: string, value: string | number): void {
    // ... implementation
}

function showHelp(): void {
    // ... implementation
}

// Main function
async function main(): Promise<void> {
    // ... implementation
}

// Run main function
main().catch(console.error);
```

### 5. Update Start Script

**File**: `start.sh`

**Major changes**:
- Add TypeScript build step
- Update path references
- Add development mode support

```bash
# Build TypeScript project
log "Building TypeScript project..."
if ! npm run build; then
    error "TypeScript build failed"
    exit 1
fi

# Start scheduler
log "Starting monitoring scheduler..."
nohup node dist/index.js > "$LOG_FILE" 2>&1 &
```

### 6. Update .gitignore

**New content**:
```
dist/
*.tsbuildinfo
```

## 🔍 Issues Resolved During Migration

### 1. Type Error Fixes

**Issue**: Type errors in TypeScript strict mode
**Solution**: Add appropriate type annotations and null checks

```typescript
// Before fix
const [table, count] = line.split('|');
return { table: table.trim(), count: parseInt(count) || 0 };

// After fix
const parts = line.split('|');
const table = parts[0];
const count = parts[1];
return { 
    table: table?.trim() || 'unknown', 
    count: parseInt(count || '0') || 0 
};
```

### 2. Path Reference Fixes

**Issue**: Incorrect file path references
**Solution**: Update path references to adapt to new directory structure

```typescript
// Before fix
const logFile = path.join(__dirname, 'logs', `scheduler-${moment().format('YYYY-MM-DD')}.log`);

// After fix
const logFile = path.join(__dirname, '..', 'logs', `scheduler-${moment().format('YYYY-MM-DD')}.log`);
```

### 3. Error Handling Improvements

**Issue**: Unclear error object types
**Solution**: Add type checks

```typescript
// Before fix
await this.log(`Failed to get current block: ${error.message}`);

// After fix
await this.log(`Failed to get current block: ${error instanceof Error ? error.message : 'Unknown error'}`);
```

## 📈 Migration Results

### Code Quality Improvements

- **Type Safety**: Compile-time error checking, reducing runtime errors
- **Code Readability**: Clear type definitions improve code readability
- **Maintainability**: Better IDE support and refactoring capabilities
- **Documentation**: Type definitions serve as code documentation

### Development Experience Improvements

- **Intellisense**: IDE provides accurate code completion
- **Error Detection**: Real-time error prompts and fix suggestions
- **Refactoring Support**: Safe code refactoring
- **Debugging Capabilities**: Better debugging support

### Performance Optimizations

- **Compilation Optimization**: TypeScript compiler optimization
- **Runtime Performance**: Type information is removed at compile time, not affecting runtime performance
- **Build Optimization**: Support for incremental compilation

## 🚀 Usage After Migration

### Development Mode

```bash
# Run in development mode
npm run dev

# Test in development mode
npm run test:dev

# Monitor in development mode
npm run monitor:dev
```

### Production Mode

```bash
# Build project
npm run build

# Run in production mode
npm start

# Test in production mode
npm run test

# Monitor in production mode
npm run monitor
```

### Type Checking

```bash
# Type checking
npm run type-check

# Clean build files
npm run clean
```

## 📋 Migration Checklist

- [x] Create `tsconfig.json` configuration file
- [x] Update `package.json` dependencies and scripts
- [x] Create `src/types.ts` type definition file
- [x] Migrate `config.js` → `src/config.ts`
- [x] Migrate `monitor.js` → `src/monitor.ts`
- [x] Migrate `index.js` → `src/index.ts`
- [x] Migrate `config-helper.js` → `src/config-helper.ts`
- [x] Migrate `test.js` → `src/test.ts`
- [x] Update `start.sh` start script
- [x] Update `.gitignore` file
- [x] Fix all type errors
- [x] Test all functionality
- [x] Update documentation

## 🎉 Migration Complete

The project has been successfully migrated from JavaScript to TypeScript, gaining:

- ✅ **Complete type safety**
- ✅ **Better development experience**
- ✅ **Higher code quality**
- ✅ **Stronger maintainability**

The migrated project maintains all original functionality while providing better type safety and development experience.

---

**Migration Date**: August 4, 2024  
**Migration Version**: From JavaScript to TypeScript 5.0+  
**Migration Status**: ✅ Complete 