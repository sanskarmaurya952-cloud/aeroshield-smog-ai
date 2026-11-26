/**
 * @file profileController.js
 * @description Controller for analyzing household vulnerability to winter smog.
 */

import { calculateHouseholdVulnerability } from '../services/vulnerabilityService.js';
import { validateProfile } from '../utils/validators.js';
import { ValidationError } from '../utils/errors.js';

/**
 * Calculates Household Inversion Vulnerability Index (HIVI).
 * POST /api/profile/analyze
 */
export function analyzeProfile(req, res) {
  const validation = validateProfile(req.body);

  if (!validation.valid) {
    throw new ValidationError(validation.errors.join(' '), validation.errors.map(() => 'profile'));
  }

  const result = calculateHouseholdVulnerability(req.body);
  res.json(result);
}
