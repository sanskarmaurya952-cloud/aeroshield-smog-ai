/**
 * @file communityController.js
 * @description Controller for community pledges and collective environmental impact.
 */

import { getCommunitySummary, recordPledge } from '../services/communityService.js';
import { ValidationError } from '../utils/errors.js';

/**
 * Returns active pledges and collective community metrics.
 * GET /api/community
 */
export function getCommunity(req, res) {
  res.json(getCommunitySummary());
}

/**
 * Commits a user to a specific collective clean air action.
 * POST /api/community/pledge
 */
export function postPledge(req, res) {
  const { pledgeId } = req.body;

  if (!pledgeId || typeof pledgeId !== 'string') {
    throw new ValidationError('pledgeId is required and must be a string.', ['pledgeId']);
  }

  const result = recordPledge(pledgeId);
  res.json(result);
}
