/**
 * @file validators.js
 * @description Pure input-validation functions used by API route handlers.
 *
 *   Each function returns a plain result object:
 *     { valid: boolean, errors: string[] }
 *
 *   This keeps validation logic completely decoupled from HTTP handling,
 *   making it trivially unit-testable and reusable.
 */

import {
  CITY_NAME_MIN_LENGTH,
  CITY_NAME_MAX_LENGTH,
  CHAT_MESSAGE_MAX_LENGTH,
  HOUSEHOLD_SIZE_MIN,
  HOUSEHOLD_SIZE_MAX,
  VALID_COMMUTE_TYPES,
  VALID_HEATING_TYPES,
} from '../config/constants.js';

/** @typedef {{ valid: boolean, errors: string[] }} ValidationResult */

// ─── City Validation ───────────────────────────────────────────────────────────

/**
 * Validate a city name query parameter.
 *
 * Rules:
 *  - Must be a non-empty string
 *  - Length between CITY_NAME_MIN_LENGTH and CITY_NAME_MAX_LENGTH
 *  - Only alphanumeric characters, spaces, hyphens, and apostrophes
 *
 * @param {unknown} city  Raw value from req.query or req.body.
 * @returns {ValidationResult}
 */
export function validateCity(city) {
  const errors = [];

  if (typeof city !== 'string' || city.trim().length === 0) {
    errors.push('city is required and must be a non-empty string.');
    return { valid: false, errors };
  }

  const trimmed = city.trim();

  if (trimmed.length < CITY_NAME_MIN_LENGTH) {
    errors.push(`city must be at least ${CITY_NAME_MIN_LENGTH} characters.`);
  }

  if (trimmed.length > CITY_NAME_MAX_LENGTH) {
    errors.push(`city must not exceed ${CITY_NAME_MAX_LENGTH} characters.`);
  }

  // Only allow safe characters — no HTML/SQL injection vectors
  if (!/^[\p{L}\p{N}\s'\-,.]+$/u.test(trimmed)) {
    errors.push('city contains invalid characters.');
  }

  return { valid: errors.length === 0, errors };
}

// ─── Household Profile Validation ──────────────────────────────────────────────

/**
 * Validate a household profile object from the request body.
 *
 * @param {unknown} profile  Raw request body value.
 * @returns {ValidationResult}
 */
export function validateProfile(profile) {
  const errors = [];

  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    errors.push('profile must be a non-null object.');
    return { valid: false, errors };
  }

  // --- city (optional) ---
  if (profile.city !== undefined && profile.city !== null) {
    const cityResult = validateCity(profile.city);
    if (!cityResult.valid) {
      errors.push(...cityResult.errors.map((e) => `profile.city: ${e}`));
    }
  }

  // --- householdSize ---
  if (profile.householdSize !== undefined) {
    const size = Number(profile.householdSize);
    if (!Number.isInteger(size) || size < HOUSEHOLD_SIZE_MIN || size > HOUSEHOLD_SIZE_MAX) {
      errors.push(
        `profile.householdSize must be an integer between ${HOUSEHOLD_SIZE_MIN} and ${HOUSEHOLD_SIZE_MAX}.`
      );
    }
  }

  // --- hasChildren / hasElderly / hasPets (optional booleans) ---
  for (const boolField of ['hasChildren', 'hasElderly', 'hasPets', 'hasRespiratoryConditions']) {
    if (profile[boolField] !== undefined && typeof profile[boolField] !== 'boolean') {
      errors.push(`profile.${boolField} must be a boolean.`);
    }
  }

  // --- commuteType ---
  if (profile.commuteType !== undefined && !VALID_COMMUTE_TYPES.includes(profile.commuteType)) {
    errors.push(`profile.commuteType must be one of: ${VALID_COMMUTE_TYPES.join(', ')}.`);
  }

  // --- heatingType ---
  if (profile.heatingType !== undefined && !VALID_HEATING_TYPES.includes(profile.heatingType)) {
    errors.push(`profile.heatingType must be one of: ${VALID_HEATING_TYPES.join(', ')}.`);
  }

  return { valid: errors.length === 0, errors };
}

// ─── Chat Message Validation ───────────────────────────────────────────────────

/**
 * Validate a chat message payload.
 *
 * @param {unknown} body  Raw request body value.
 * @returns {ValidationResult}
 */
export function validateChatMessage(body) {
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    errors.push('Request body must be a non-null object.');
    return { valid: false, errors };
  }

  const { message, context } = body;

  // --- message ---
  if (typeof message !== 'string' || message.trim().length === 0) {
    errors.push('message is required and must be a non-empty string.');
  } else if (message.length > CHAT_MESSAGE_MAX_LENGTH) {
    errors.push(`message must not exceed ${CHAT_MESSAGE_MAX_LENGTH} characters.`);
  }

  // --- context (optional object) ---
  if (context !== undefined && (typeof context !== 'object' || Array.isArray(context) || context === null)) {
    errors.push('context must be a plain object when provided.');
  }

  return { valid: errors.length === 0, errors };
}
