/**
 * Production-safe logging utility
 * Logs to console in development, structured logs in production
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

/**
 * Check if we're in production
 */
const isProduction = process.env.NODE_ENV === "production";

/**
 * Log a message with context
 */
function log(level: LogLevel, message: string, context?: LogContext): void {
  if (!isProduction) {
    // Development: simple console logging
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    console[level](`[${level.toUpperCase()}] ${message}${contextStr}`);
    return;
  }

  // Production: structured logging (can be extended to send to logging service)
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  // In production, only log errors and warnings to console
  if (level === "error" || level === "warn") {
    console[level](JSON.stringify(logEntry));
  }

  // TODO: Send to logging service (e.g., Logtail, Datadog, etc.)
  // if (process.env.LOGTAIL_SOURCE_TOKEN) {
  //   fetch("https://in.logtail.com", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(logEntry),
  //   }).catch(() => {}); // Fail silently
  // }
}

/**
 * Log an info message
 */
export function logInfo(message: string, context?: LogContext): void {
  log("info", message, context);
}

/**
 * Log a warning
 */
export function logWarn(message: string, context?: LogContext): void {
  log("warn", message, context);
}

/**
 * Log an error
 */
export function logError(message: string, error?: Error | unknown, context?: LogContext): void {
  const errorContext: LogContext = {
    ...context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : String(error),
  };
  log("error", message, errorContext);
}

/**
 * Log debug information (only in development)
 */
export function logDebug(message: string, context?: LogContext): void {
  if (!isProduction) {
    log("debug", message, context);
  }
}

