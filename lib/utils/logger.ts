/**
 * Structured logging utility for the application.
 * Provides consistent logging format across all modules with
 * different log levels and optional context/metadata.
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Formats log entry as JSON for structured logging.
 * In production, this could be sent to a logging service.
 */
function formatLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error,
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (context && Object.keys(context).length > 0) {
    entry.context = context;
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return entry;
}

/**
 * Logs a debug message (only in development)
 */
export function logDebug(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === 'development') {
    const entry = formatLogEntry(LogLevel.DEBUG, message, context);
    console.debug(JSON.stringify(entry));
  }
}

/**
 * Logs an info message
 */
export function logInfo(message: string, context?: LogContext): void {
  const entry = formatLogEntry(LogLevel.INFO, message, context);
  console.log(JSON.stringify(entry));
}

/**
 * Logs a warning message
 */
export function logWarn(message: string, context?: LogContext): void {
  const entry = formatLogEntry(LogLevel.WARN, message, context);
  console.warn(JSON.stringify(entry));
}

/**
 * Logs an error message with optional error object
 */
export function logError(
  message: string,
  error?: Error,
  context?: LogContext,
): void {
  const entry = formatLogEntry(LogLevel.ERROR, message, context, error);
  console.error(JSON.stringify(entry));
}

/**
 * Creates a logger instance with a default context that will be
 * included in all log calls. Useful for request-scoped logging.
 */
export function createLogger(defaultContext: LogContext) {
  return {
    debug: (message: string, context?: LogContext) =>
      logDebug(message, { ...defaultContext, ...context }),
    info: (message: string, context?: LogContext) =>
      logInfo(message, { ...defaultContext, ...context }),
    warn: (message: string, context?: LogContext) =>
      logWarn(message, { ...defaultContext, ...context }),
    error: (message: string, error?: Error, context?: LogContext) =>
      logError(message, error, { ...defaultContext, ...context }),
  };
}
