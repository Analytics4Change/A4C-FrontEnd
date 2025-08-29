/**
 * FocusErrorLogger
 * 
 * Structured logging service for focus management errors
 * Provides comprehensive error tracking and debugging capabilities
 * 
 * @contract
 * Preconditions:
 * - Logger must be initialized with valid configuration
 * - Console or external logging service must be available
 * 
 * Postconditions:
 * - All errors are logged with full context
 * - Logs are structured and searchable
 * - Performance metrics are tracked
 * 
 * Invariants:
 * - Logging never throws errors
 * - Sensitive data is sanitized
 * - Log buffer size is bounded
 */

import { FocusErrorContext } from './FocusErrorBoundary';

/**
 * Log levels for categorization
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Log entry structure
 */
export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  error?: Error;
  context?: FocusErrorContext;
  metadata?: Record<string, any>;
  stackTrace?: string;
  performanceMetrics?: {
    renderTime?: number;
    focusTime?: number;
    memoryUsage?: number;
  };
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  enabled: boolean;
  logLevel: keyof typeof LogLevel;
  maxBufferSize?: number;
  persistLogs?: boolean;
  remoteEndpoint?: string;
  sanitizeData?: boolean;
  includePerformanceMetrics?: boolean;
}

/**
 * Error statistics for monitoring
 */
export interface ErrorStatistics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  averageRecoveryTime: number;
  lastErrorTimestamp: number;
  errorRate: number; // errors per minute
}

/**
 * FocusErrorLogger Class
 * 
 * Comprehensive logging service for focus management errors
 */
export class FocusErrorLogger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private errorStats: ErrorStatistics;
  private logSequence: number = 0;
  private startTime: number;
  private errorTimestamps: number[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      enabled: true,
      logLevel: 'INFO',
      maxBufferSize: 100,
      persistLogs: false,
      sanitizeData: true,
      includePerformanceMetrics: true,
      ...config
    };

    this.startTime = Date.now();
    this.errorStats = this.initializeStats();
    
    // Load persisted logs if enabled
    if (this.config.persistLogs) {
      this.loadPersistedLogs();
    }

    // Set up global error handler integration
    this.setupGlobalErrorHandler();
  }

  /**
   * Initializes error statistics
   */
  private initializeStats(): ErrorStatistics {
    return {
      totalErrors: 0,
      errorsByType: {},
      errorsBySeverity: {},
      averageRecoveryTime: 0,
      lastErrorTimestamp: 0,
      errorRate: 0
    };
  }

  /**
   * Logs an error with full context
   * 
   * @contract
   * Precondition: error is valid Error object
   * Postcondition: Error is logged and statistics updated
   */
  public logError(error: Error, context?: FocusErrorContext): void {
    if (!this.config.enabled) return;

    const entry = this.createLogEntry(LogLevel.ERROR, error.message, error, context);
    this.addLogEntry(entry);
    this.updateStatistics(entry);
    
    // Console output
    this.outputToConsole(entry);
    
    // Remote logging if configured
    if (this.config.remoteEndpoint) {
      this.sendToRemote(entry);
    }

    // Trigger alerts for critical errors
    if (context?.severity === 'critical') {
      this.triggerCriticalAlert(error, context);
    }
  }

  /**
   * Logs an info message
   */
  public logInfo(message: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry = this.createLogEntry(LogLevel.INFO, message, undefined, undefined, metadata);
    this.addLogEntry(entry);
    this.outputToConsole(entry);
  }

  /**
   * Logs a warning message
   */
  public logWarn(message: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry = this.createLogEntry(LogLevel.WARN, message, undefined, undefined, metadata);
    this.addLogEntry(entry);
    this.outputToConsole(entry);
  }

  /**
   * Logs a debug message
   */
  public logDebug(message: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry = this.createLogEntry(LogLevel.DEBUG, message, undefined, undefined, metadata);
    this.addLogEntry(entry);
    this.outputToConsole(entry);
  }

  /**
   * Creates a structured log entry
   * 
   * @contract
   * Postcondition: Returns complete log entry with all available data
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    error?: Error,
    context?: FocusErrorContext,
    metadata?: Record<string, any>
  ): LogEntry {
    const entry: LogEntry = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      level,
      message: this.config.sanitizeData ? this.sanitizeMessage(message) : message,
      metadata
    };

    if (error) {
      entry.error = error;
      entry.stackTrace = error.stack;
    }

    if (context) {
      entry.context = this.config.sanitizeData ? this.sanitizeContext(context) : context;
    }

    if (this.config.includePerformanceMetrics) {
      entry.performanceMetrics = this.collectPerformanceMetrics();
    }

    return entry;
  }

  /**
   * Adds log entry to buffer with size management
   * 
   * @contract
   * Precondition: entry is valid
   * Postcondition: Entry is added, buffer size is maintained
   */
  private addLogEntry(entry: LogEntry): void {
    this.logBuffer.push(entry);
    
    // Maintain buffer size
    if (this.logBuffer.length > (this.config.maxBufferSize || 100)) {
      this.logBuffer.shift();
    }

    // Persist if enabled
    if (this.config.persistLogs) {
      this.persistLog(entry);
    }
  }

  /**
   * Updates error statistics
   */
  private updateStatistics(entry: LogEntry): void {
    if (entry.level !== LogLevel.ERROR && entry.level !== LogLevel.CRITICAL) {
      return;
    }

    this.errorStats.totalErrors++;
    this.errorStats.lastErrorTimestamp = entry.timestamp;

    // Track error types
    const errorType = entry.error?.name || 'Unknown';
    this.errorStats.errorsByType[errorType] = (this.errorStats.errorsByType[errorType] || 0) + 1;

    // Track severity
    const severity = entry.context?.severity || 'unknown';
    this.errorStats.errorsBySeverity[severity] = (this.errorStats.errorsBySeverity[severity] || 0) + 1;

    // Calculate error rate
    this.errorTimestamps.push(entry.timestamp);
    this.errorTimestamps = this.errorTimestamps.filter(
      ts => ts > Date.now() - 60000 // Keep last minute
    );
    this.errorStats.errorRate = this.errorTimestamps.length;
  }

  /**
   * Outputs log entry to console
   */
  private outputToConsole(entry: LogEntry): void {
    const consoleMethod = this.getConsoleMethod(entry.level);
    const formattedMessage = this.formatLogMessage(entry);
    
    console.groupCollapsed(`[FocusManager] ${entry.level.toUpperCase()}: ${entry.message}`);
    consoleMethod(formattedMessage);
    
    if (entry.error) {
      console.error('Error:', entry.error);
    }
    
    if (entry.context) {
      console.log('Context:', entry.context);
    }
    
    if (entry.performanceMetrics) {
      console.log('Performance:', entry.performanceMetrics);
    }
    
    console.groupEnd();
  }

  /**
   * Gets appropriate console method for log level
   */
  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Formats log message for output
   */
  private formatLogMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    return `[${timestamp}] [${entry.id}] ${entry.message}`;
  }

  /**
   * Checks if should log based on level
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    
    const levels = Object.values(LogLevel);
    const configuredLevel = levels.indexOf(this.config.logLevel as LogLevel);
    const messageLevel = levels.indexOf(level);
    
    return messageLevel >= configuredLevel;
  }

  /**
   * Sanitizes sensitive data from message
   */
  private sanitizeMessage(message: string): string {
    // Remove potential PII patterns
    return message
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
  }

  /**
   * Sanitizes context object
   */
  private sanitizeContext(context: FocusErrorContext): FocusErrorContext {
    const sanitized = { ...context };
    
    // Remove sensitive browser info
    if (sanitized.browserInfo) {
      sanitized.browserInfo = {
        ...sanitized.browserInfo,
        userAgent: sanitized.browserInfo.userAgent.substring(0, 50) + '...'
      };
    }
    
    return sanitized;
  }

  /**
   * Collects performance metrics
   */
  private collectPerformanceMetrics(): LogEntry['performanceMetrics'] {
    const metrics: LogEntry['performanceMetrics'] = {};
    
    // Collect performance timing if available
    if (performance && performance.now) {
      metrics.renderTime = performance.now();
    }
    
    // Collect memory usage if available
    if ((performance as any).memory) {
      metrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }
    
    return metrics;
  }

  /**
   * Generates unique log ID
   */
  private generateLogId(): string {
    return `focus-log-${Date.now()}-${++this.logSequence}`;
  }

  /**
   * Persists log to local storage
   */
  private persistLog(entry: LogEntry): void {
    try {
      const key = `focus-error-log-${entry.id}`;
      localStorage.setItem(key, JSON.stringify(entry));
      
      // Clean old logs
      this.cleanOldLogs();
    } catch (e) {
      // Silently fail if storage is full or unavailable
    }
  }

  /**
   * Loads persisted logs from storage
   */
  private loadPersistedLogs(): void {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('focus-error-log-'));
      
      keys.forEach(key => {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '');
          if (entry && this.isRecentLog(entry)) {
            this.logBuffer.push(entry);
          }
        } catch {
          // Skip invalid entries
        }
      });
    } catch {
      // Storage not available
    }
  }

  /**
   * Checks if log is recent (within 24 hours)
   */
  private isRecentLog(entry: LogEntry): boolean {
    return entry.timestamp > Date.now() - 86400000; // 24 hours
  }

  /**
   * Cleans old logs from storage
   */
  private cleanOldLogs(): void {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('focus-error-log-'));
      
      keys.forEach(key => {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '');
          if (!entry || !this.isRecentLog(entry)) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // Storage not available
    }
  }

  /**
   * Sends log to remote endpoint
   */
  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return;
    
    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });
    } catch {
      // Silently fail remote logging
    }
  }

  /**
   * Triggers alert for critical errors
   */
  private triggerCriticalAlert(error: Error, context: FocusErrorContext): void {
    // Dispatch custom event for critical errors
    const event = new CustomEvent('focus-critical-error', {
      detail: { error, context }
    });
    window.dispatchEvent(event);
    
    // Log to console with emphasis
    console.error(
      '%c⚠️ CRITICAL FOCUS ERROR',
      'background: red; color: white; font-size: 16px; padding: 4px;',
      error.message
    );
  }

  /**
   * Sets up global error handler integration
   */
  private setupGlobalErrorHandler(): void {
    // Store last focus event for context
    ['focus', 'blur', 'focusin', 'focusout'].forEach(eventType => {
      window.addEventListener(eventType, (event) => {
        (window as any).__lastFocusEvent = {
          type: event.type,
          target: event.target,
          timestamp: Date.now()
        };
      }, true);
    });
  }

  /**
   * Gets error statistics
   */
  public getStatistics(): ErrorStatistics {
    return { ...this.errorStats };
  }

  /**
   * Gets log buffer
   */
  public getLogs(filter?: { level?: LogLevel; since?: number }): LogEntry[] {
    let logs = [...this.logBuffer];
    
    if (filter?.level) {
      logs = logs.filter(log => log.level === filter.level);
    }
    
    if (filter?.since) {
      logs = logs.filter(log => log.timestamp >= filter.since);
    }
    
    return logs;
  }

  /**
   * Clears log buffer
   */
  public clearLogs(): void {
    this.logBuffer = [];
    this.errorStats = this.initializeStats();
    
    // Clear persisted logs if enabled
    if (this.config.persistLogs) {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('focus-error-log-'));
      keys.forEach(key => localStorage.removeItem(key));
    }
  }

  /**
   * Exports logs for debugging
   */
  public exportLogs(): string {
    return JSON.stringify({
      logs: this.logBuffer,
      statistics: this.errorStats,
      config: this.config,
      exportTime: Date.now()
    }, null, 2);
  }
}

export default FocusErrorLogger;