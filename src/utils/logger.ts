/**
 * Centralized logging utility for BETZ Sportsbook
 *
 * Provides consistent logging across the application with environment-aware behavior.
 * In development, all logs are shown to console. In production, only errors and warnings
 * are logged to prevent performance impact and information leakage.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
  timestamp?: string;
  context?: string;
  [key: string]: unknown;
}

const isDev = import.meta.env.DEV;
const isTest = import.meta.env.MODE === 'test';

// In-memory log buffer for error reporting (last 100 entries)
const logBuffer: Array<{ level: LogLevel; message: string; meta: LogMeta; timestamp: string }> = [];
const MAX_BUFFER_SIZE = 100;

function addToBuffer(level: LogLevel, message: string, meta: LogMeta = {}) {
  logBuffer.push({
    level,
    message,
    meta,
    timestamp: new Date().toISOString(),
  });
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.shift();
  }
}

function formatMessage(level: LogLevel, message: string, meta: LogMeta = {}): string {
  const timestamp = new Date().toISOString().split('T')[1]?.split('.')[0] ?? '00:00:00';
  const context = meta.context ? `[${meta.context}] ` : '';
  return `${timestamp} [${level.toUpperCase()}] ${context}${message}`;
}

export const logger = {
  /**
   * Debug level logging - only shown in development/test environments
   * Use for detailed troubleshooting information during development
   */
  debug: (message: string, meta: LogMeta = {}) => {
    if (isDev || isTest) {
      const formatted = formatMessage('debug', message, meta);
      console.debug(formatted, meta);
      addToBuffer('debug', message, meta);
    }
  },

  /**
   * Info level logging - only shown in development/test environments
   * Use for general information about application state changes
   */
  info: (message: string, meta: LogMeta = {}) => {
    if (isDev || isTest) {
      const formatted = formatMessage('info', message, meta);
      console.info(formatted, meta);
      addToBuffer('info', message, meta);
    }
  },

  /**
   * Warning level logging - shown in all environments
   * Use for deprecation warnings, unexpected but recoverable conditions
   */
  warn: (message: string, meta: LogMeta = {}) => {
    const formatted = formatMessage('warn', message, meta);
    console.warn(formatted, meta);
    addToBuffer('warn', message, meta);
  },

  /**
   * Error level logging - shown in all environments
   * Use for errors that affect functionality but don't crash the app
   */
  error: (message: string, error?: unknown, meta: LogMeta = {}) => {
    const formatted = formatMessage('error', message, meta);
    const errorMeta = {
      ...meta,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    };
    console.error(formatted, errorMeta);
    addToBuffer('error', message, errorMeta);
  },

  /**
   * Get recent logs for error reporting or debugging
   */
  getRecentLogs: (count = 50) => {
    return logBuffer.slice(-count);
  },

  /**
   * Clear the log buffer
   */
  clearLogs: () => {
    logBuffer.length = 0;
  },
};

/**
 * Utility to log errors with try-catch wrapper
 * Automatically logs errors and returns a fallback value
 */
export function logAsyncErrors<T>(
  fn: () => Promise<T>,
  fallback: T,
  context = 'async-operation'
): Promise<T> {
  return fn().catch((error) => {
    logger.error(`Async error in ${context}`, error, { context });
    return fallback;
  });
}

/**
 * Wraps a function with error logging
 */
export function withErrorLogging<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context = fn.name || 'anonymous-function'
): T {
  return ((...args: unknown[]) => {
    try {
      return fn(...args);
    } catch (error) {
      logger.error(`Error in ${context}`, error, { context });
      throw error; // Re-throw for error boundaries
    }
  }) as T;
}
