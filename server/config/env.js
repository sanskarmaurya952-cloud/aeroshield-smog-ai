/**
 * @file env.js
 * @description Centralized environment variable validation and typed configuration.
 *
 * Ensures all required runtime configurations exist with sensible defaults,
 * preventing unexpected runtime crashes due to undefined or malformed environment variables.
 */

import dotenv from 'dotenv';
dotenv.config();

/**
 * Validates and exposes application configuration.
 */
export const env = Object.freeze({
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  hasGeminiKey: Boolean(
    (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) &&
    process.env.GEMINI_API_KEY !== 'your_api_key_here'
  ),
  LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'error' : 'info'),
});

export default env;
