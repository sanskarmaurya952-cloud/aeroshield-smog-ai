/**
 * @file communityService.test.js
 * @description Unit tests for community pledge recording and aggregated impact calculations.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCommunitySummary,
  recordPledge,
  resetPledges,
} from '../server/services/communityService.js';
import { NotFoundError } from '../server/utils/errors.js';

describe('Community Service & Collective Action', () => {
  beforeEach(() => {
    resetPledges();
  });

  it('retrieves active pledges and community impact totals', () => {
    const summary = getCommunitySummary();

    expect(summary.pledges.length).toBeGreaterThan(0);
    expect(summary.totalCommunityMembers).toBeGreaterThan(0);
    expect(summary.estimatedCo2eAvoidedKg).toBeGreaterThan(0);
    expect(summary.estimatedPmAvoidedGrams).toBeGreaterThan(0);
  });

  it('increments participant count when recording a pledge', () => {
    const initialSummary = getCommunitySummary();
    const targetPledge = initialSummary.pledges[0];
    const initialCount = targetPledge.participants;

    const result = recordPledge(targetPledge.id);

    expect(result.success).toBe(true);
    expect(result.updatedPledge.participants).toBe(initialCount + 1);

    const updatedSummary = getCommunitySummary();
    expect(updatedSummary.totalCommunityMembers).toBe(initialSummary.totalCommunityMembers + 1);
  });

  it('throws NotFoundError for non-existent pledge ID', () => {
    expect(() => recordPledge('non-existent-pledge-xyz')).toThrow(NotFoundError);
  });
});
