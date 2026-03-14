/**
 * Centralized logging system with multiple log levels
 * Supports filtering sensitive data and remote logging in production
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

interface LoggerConfig {
  minLevel: LogLevel;
  enableRemoteLogging: boolean;
  enableConsoleLogging: boolean;
  sensitiveFields: string[];
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOGS_STORAGE_KEY = '@app_logs_queue';
const MAX_QUEUE_SIZE = 100;

class Logger {
  private config: LoggerConfig = {
    minLevel: __DEV__ ? 'debug' : 'info',
    enableRemoteLogging: !__DEV__,
    enableConsoleLogging: true,
    sensitiveFields: [
      'password',
      'token',
      'access_token',
      'refresh_token',
      'api_key',
      'secret',
      'authorization',
      'email',
      'phone',
    ],
  };

  private logQueue: LogEntry[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (this.config.enableRemoteLogging) {
      this.startFlushInterval();
    }
  }

  /**
   * Configure logger settings
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.config.enableRemoteLogging && !this.flushInterval) {
      this.startFlushInterval();
    } else if (!this.config.enableRemoteLogging && this.flushInterval) {
      this.stopFlushInterval();
    }
  }

  /**
   * Log debug message
   */
  public debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  /**
   * Log info message
   */
  public info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   */
  public warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Log error message
   */
  public error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.log('error', message, { ...context, error: errorObj });
  }

  /**
   * Filter sensitive data from context
   */
  private filterSensitiveData(context: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
    if (!context) return undefined;

    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(context)) {
      if (this.config.sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        filtered[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        filtered[key] = this.filterSensitiveData(value as Record<string, unknown>);
      } else {
        filtered[key] = value;
      }
    }
    return filtered;
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.config.minLevel]) {
      return;
    }

    const filteredContext = this.filterSensitiveData(context);

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: filteredContext,
    };

    if (this.config.enableConsoleLogging) {
      this.logToConsole(entry);
    }

    if (this.config.enableRemoteLogging && level !== 'debug') {
      this.queueLog(entry);
    }
  }

  /**
   * Log to console with appropriate method
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.level.toUpperCase()}]`;
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();

    switch (entry.level) {
      case 'debug':
        console.log(`[${timestamp}] ${prefix}`, entry.message, entry.context || '');
        break;
      case 'info':
        console.info(`[${timestamp}] ${prefix}`, entry.message, entry.context || '');
        break;
      case 'warn':
        console.warn(`[${timestamp}] ${prefix}`, entry.message, entry.context || '');
        break;
      case 'error':
        console.error(`[${timestamp}] ${prefix}`, entry.message, entry.context || '');
        break;
    }
  }

  /**
   * Add log entry to queue for remote logging
   */
  private queueLog(entry: LogEntry): void {
    this.logQueue.push(entry);

    if (this.logQueue.length >= MAX_QUEUE_SIZE) {
      this.flush();
    }
  }

  /**
   * Start interval to flush logs periodically
   */
  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000); // Flush every 30 seconds
  }

  /**
   * Stop flush interval
   */
  private stopFlushInterval(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Flush logs to Supabase
   */
  public async flush(): Promise<void> {
    if (this.logQueue.length === 0) return;

    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    try {
      // Get stored logs
      const storedLogs = await AsyncStorage.getItem(LOGS_STORAGE_KEY);
      const allLogs = storedLogs ? [...JSON.parse(storedLogs), ...logsToSend] : logsToSend;

      // Keep only recent logs if queue gets too large
      if (allLogs.length > MAX_QUEUE_SIZE) {
        allLogs.splice(0, allLogs.length - MAX_QUEUE_SIZE);
      }

      // Try to send logs to Supabase
      if (supabase && this.config.enableRemoteLogging) {
        const { error } = await supabase.from('app_logs').insert(
          logsToSend.map(log => ({
            level: log.level,
            message: log.message,
            context: log.context,
            created_at: log.timestamp,
          }))
        );

        if (error) {
          // Store logs locally if remote fails
          await AsyncStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(allLogs));
          if (__DEV__) {
            console.warn('Failed to send logs to Supabase:', error);
          }
        } else {
          // Clear stored logs on success
          await AsyncStorage.removeItem(LOGS_STORAGE_KEY);
        }
      } else {
        await AsyncStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(allLogs));
      }
    } catch (err) {
      // Put logs back in queue
      this.logQueue = [...logsToSend, ...this.logQueue].slice(0, MAX_QUEUE_SIZE);
      if (__DEV__) {
        console.warn('Error flushing logs:', err);
      }
    }
  }

  /**
   * Get current log queue (for debugging)
   */
  public getLogQueue(): LogEntry[] {
    return [...this.logQueue];
  }

  /**
   * Clear all queued logs
   */
  public clearQueue(): void {
    this.logQueue = [];
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience exports for direct import
export const logDebug = (message: string, context?: Record<string, unknown>) =>
  logger.debug(message, context);
export const logInfo = (message: string, context?: Record<string, unknown>) =>
  logger.info(message, context);
export const logWarn = (message: string, context?: Record<string, unknown>) =>
  logger.warn(message, context);
export const logError = (message: string, error?: Error | unknown, context?: Record<string, unknown>) =>
  logger.error(message, error, context);

export default logger;
