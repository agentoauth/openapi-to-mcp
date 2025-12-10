/**
 * Structured logger for MCP Hub
 * 
 * Provides JSON-structured logging for easy parsing and analysis.
 * Can be replaced with a proper logging service (Winston, Pino, etc.) later.
 */

export interface LogMetadata {
  [key: string]: any;
}

/**
 * Structured logger
 * 
 * Outputs JSON-structured logs to console.
 * Format: { level: "info"|"warn"|"error", msg: string, ...metadata }
 */
export const logger = {
  /**
   * Log info message
   */
  info: (meta: LogMetadata, msg: string) => {
    console.log(JSON.stringify({ level: "info", msg, ...meta }));
  },

  /**
   * Log warning message
   */
  warn: (meta: LogMetadata, msg: string) => {
    console.warn(JSON.stringify({ level: "warn", msg, ...meta }));
  },

  /**
   * Log error message
   */
  error: (meta: LogMetadata, msg: string) => {
    console.error(JSON.stringify({ level: "error", msg, ...meta }));
  },
};

