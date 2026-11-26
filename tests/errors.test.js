/**
 * @file errors.test.js
 * @description Unit tests for typed AppError hierarchy and HTTP serialization.
 */

import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ServiceUnavailableError,
  AuthorizationError,
} from '../server/utils/errors.js';

describe('Typed Error Hierarchy', () => {
  it('AppError serializes correctly with default status 500', () => {
    const err = new AppError('Database connection error');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('INTERNAL_ERROR');
    expect(err.isOperational).toBe(true);

    const json = err.toJSON();
    expect(json).toEqual({
      error: 'Database connection error',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    });
  });

  it('ValidationError produces 400 Bad Request and serializes fields', () => {
    const err = new ValidationError('Invalid email format', ['email']);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');

    const json = err.toJSON();
    expect(json.fields).toEqual(['email']);
    expect(json.statusCode).toBe(400);
  });

  it('NotFoundError produces 404 Not Found', () => {
    const err = new NotFoundError('Pledge');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toContain('Pledge not found');
  });

  it('RateLimitError produces 429 Too Many Requests', () => {
    const err = new RateLimitError();
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('ServiceUnavailableError produces 503 and preserves cause', () => {
    const cause = new Error('Socket timeout');
    const err = new ServiceUnavailableError('Open-Meteo API', cause);
    expect(err.statusCode).toBe(503);
    expect(err.code).toBe('SERVICE_UNAVAILABLE');
    expect(err.cause).toBe(cause);
  });

  it('AuthorizationError produces 403 Forbidden', () => {
    const err = new AuthorizationError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });
});
