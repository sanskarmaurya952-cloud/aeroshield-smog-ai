/**
 * @file communityService.js
 * @description Manages community pledge actions and collective environmental impact aggregation.
 */

import { COMMUNITY_PLEDGES } from '../data/knowledgeBase.js';
import { NotFoundError } from '../utils/errors.js';

// In-memory pledges store initialized from knowledgeBase
let pledgesState = COMMUNITY_PLEDGES.map((p) => ({ ...p }));

/**
 * Retrieves all active community pledges and aggregated collective impact statistics.
 *
 * @returns {{
 *   pledges: Array<{ id: string, title: string, participants: number, impactTag: string, icon: string }>,
 *   totalCommunityMembers: number,
 *   estimatedCo2eAvoidedKg: number,
 *   estimatedPmAvoidedGrams: number
 * }}
 */
export function getCommunitySummary() {
  const totalPledged = pledgesState.reduce((sum, p) => sum + p.participants, 0);

  return {
    pledges: pledgesState,
    totalCommunityMembers: totalPledged,
    estimatedCo2eAvoidedKg: Math.round(totalPledged * 14.5),
    estimatedPmAvoidedGrams: Math.round(totalPledged * 38),
  };
}

/**
 * Registers an individual commitment to a designated community smog reduction pledge.
 *
 * @param {string} pledgeId  Unique identifier of the target pledge.
 * @returns {{ success: boolean, message: string, updatedPledge: object }}
 * @throws {NotFoundError} If the pledgeId does not match any registered pledge.
 */
export function recordPledge(pledgeId) {
  const target = pledgesState.find((p) => p.id === pledgeId);

  if (!target) {
    throw new NotFoundError(`Community pledge with id '${pledgeId}'`);
  }

  target.participants += 1;

  return {
    success: true,
    message: `Successfully joined ${target.title}!`,
    updatedPledge: target,
  };
}

/**
 * Resets pledges to baseline state (used primarily in test setups).
 */
export function resetPledges() {
  pledgesState = COMMUNITY_PLEDGES.map((p) => ({ ...p }));
}
