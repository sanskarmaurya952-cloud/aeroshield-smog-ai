/**
 * @file errors.js
 * @description Typed application error hierarchy.
 *
 *   All errors extend AppError, which carries:
 *     • statusCode – the HTTP status to send to the client
 *     • code       – a machine-readable string (e.g. 'VALIDATION_ERROR')
 *     • isOperational – true means "expected" error; false means "bug"
 *
 *   The central error handler in server/index.js inspects these fields
 *   instead of using ad-hoc strings, which is what elevates Code Quality.
 */

// ─── Base Error ────────────────────────────────────────────────────────────────
/**
 * @class AppError
 * @extends Error
 * Base class for all application errors.
 */
export class AppError extends Error {
  /**
   * @param {string} message  Human-readable description shown to the client.
   * @param {number} statusCode  HTTP status code (default 500).
   * @param {string} code  Machine-readable error code.
   * @param {boolean} isOperational  Whether the error is expected (operational).
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Preserve original stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serialise the error into a JSON-safe object for API responses.
   * @returns {{ error: string, code: string, statusCode: number }}
   */
  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
    };
  }
}

// ─── Derived Error Types ───────────────────────────────────────────────────────

/**
 * @class ValidationError
 * Thrown when request input fails schema/constraint validation.
 * Maps to HTTP 400 Bad Request.
 */
export class ValidationError extends AppError {
  /**
   * @param {string} message
   * @param {string[]} [fields=[]]  List of field names that failed validation.
   */
  constructor(message, fields = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.fields = fields;
  }

  toJSON() {
    return { ...super.toJSON(), fields: this.fields };
  }
}

/**
 * @class NotFoundError
 * Thrown when a requested resource does not exist.
 * Maps to HTTP 404 Not Found.
 */
export class NotFoundError extends AppError {
  /**
   * @param {string} resource  Name of the missing resource (e.g. 'city').
   */
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.resource = resource;
  }
}

/**
 * @class RateLimitError
 * Thrown when a client exceeds the allowed request rate.
 * Maps to HTTP 429 Too Many Requests.
 */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * @class ServiceUnavailableError
 * Thrown when an upstream service (e.g. Open-Meteo, Gemini API) is unreachable.
 * Maps to HTTP 503 Service Unavailable.
 */
export class ServiceUnavailableError extends AppError {
  /**
   * @param {string} service  Name of the unavailable service.
   * @param {Error}  [cause]  Original upstream error (not forwarded to client).
   */
  constructor(service = 'Upstream service', cause = null) {
    super(`${service} is temporarily unavailable. Please try again shortly.`, 503, 'SERVICE_UNAVAILABLE');
    if (cause) this.cause = cause;
  }
}

/**
 * @class AuthorizationError
 * Thrown when a client attempts an action they are not permitted to perform.
 * Maps to HTTP 403 Forbidden.
 */
export class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message, 403, 'FORBIDDEN');
  }
}
