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
  
  // 磁盘空间监控设置
  DISK_MONITORING: {
    enabled: boolean;
    warning_threshold: number;  // 警告阈值 (百分比)
    critical_threshold: number; // 严重阈值 (百分比)
    check_paths: string[];      // 需要检查的路径
  };
  
  // 通知设置 (预留)
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

// 磁盘空间信息接口
export interface DiskSpaceInfo {
  filesystem: string;
  size: string;
  used: string;
  available: string;
  used_percentage: number;
  mountpoint: string;
  status: 'normal' | 'warning' | 'critical';
}

// 项目空间使用信息接口
export interface ProjectSpaceInfo {
  project_path: string;
  total_size: string;
  database_size: string;
  logs_size: string;
  reports_size: string;
  other_size: string;
  breakdown: {
    database: string;
    logs: string;
    reports: string;
    other: string;
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
  // 新增磁盘空间信息
  diskSpace: {
    system: DiskSpaceInfo[];
    project: ProjectSpaceInfo | null;
    warnings: string[];
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