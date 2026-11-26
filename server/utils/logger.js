/**
 * @file logger.js
 * @description Enterprise-grade structured logging utility.
 *
 * Provides leveled logging (debug, info, warn, error) with ISO timestamps,
 * contextual prefixes, and automatic suppression during unit test execution
 * to ensure clean test runner outputs.
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'error' : 'info');

function shouldLog(level) {
  return LOG_LEVELS[level] >= (LOG_LEVELS[currentLevel] ?? LOG_LEVELS.info);
}

function formatMessage(level, prefix, message, meta) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] [${prefix}] ${message}${metaStr}`;
}

export const logger = {
  /**
   * Log an informational message.
   * @param {string} prefix  Component/module name (e.g. 'AeroShield', 'AQI Service').
   * @param {string} message Primary log message.
   * @param {any}    [meta]   Optional metadata or payload.
   */
  info(prefix, message, meta) {
    if (shouldLog('info')) {
      console.log(formatMessage('info', prefix, message, meta));
    }
  },

  /**
   * Log a warning message.
   * @param {string} prefix  Component/module name.
   * @param {string} message Warning details.
   * @param {any}    [meta]   Optional metadata.
   */
  warn(prefix, message, meta) {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', prefix, message, meta));
    }
  },

  /**
   * Log an error message with stack or context.
   * @param {string} prefix  Component/module name.
   * @param {string} message Error details.
   * @param {any}    [error] Error instance or metadata.
   */
  error(prefix, message, error) {
    if (shouldLog('error')) {
      const errDetail = error instanceof Error ? (error.stack || error.message) : error;
      console.error(formatMessage('error', prefix, message, errDetail));
    }
  },

  /**
   * Log a debug trace.
   * @param {string} prefix  Component/module name.
   * @param {string} message Trace message.
   * @param {any}    [meta]   Optional metadata.
   */
  debug(prefix, message, meta) {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', prefix, message, meta));
    }
  },
};

export default logger;
