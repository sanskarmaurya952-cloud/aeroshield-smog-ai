import { describe, it, expect } from 'vitest';
import { calculateImpact } from '../server/services/impactService.js';
import { generateDailyRoutine } from '../server/services/routineService.js';

describe('Impact Service', () => {
  it('quantifies PM2.5 avoidance, lung mitigation, and passive cigarette equivalence', () => {
    const profile = {
      childrenUnder5: 1,
      elderly: 1,
      hasAsthma: true,
      commuteMode: 'two-wheeler',
      currentPurifier: 'none',
      outdoorHabits: 'morning-jog'
    };

    const impact = calculateImpact(profile, 280, 190);

    expect(impact.personalExposure.baselineIntakeUgd).toBeGreaterThan(impact.personalExposure.optimizedIntakeUgd);
    expect(impact.personalExposure.avoidedIntakeUgd).toBeGreaterThan(0);
    expect(impact.personalExposure.exposureReductionPercent).toBeGreaterThan(50);
    expect(impact.personalExposure.equivalentCigarettesAvoidedPerDay).toBeGreaterThan(0);
    expect(impact.personalExposure.lungProtectionScore).toBeGreaterThan(60);

    expect(impact.communityImpact.co2eSavedPerWeekKg).toBeGreaterThan(10);
    expect(impact.communityImpact.pmEmissionsPreventedGrams).toBeGreaterThan(50);
    expect(impact.scientificExplanation).toContain('µg/day');
  });
});

describe('Routine Service', () => {
  it('generates a 5-phase schedule that optimizes peak morning exposure', () => {
    const profile = {
      childrenUnder5: 1,
      hasAsthma: true,
      commuteMode: 'two-wheeler',
      outdoorHabits: 'morning-jog'
    };

    const aqiData = {
      current: { aqi: 310 }
    };

    const routine = generateDailyRoutine(profile, aqiData);

    expect(routine.schedule).toHaveLength(5);
    expect(routine.targetAqi).toBeLessThan(310);

    // Early morning slot should shift workout indoors
    const morningSlot = routine.schedule[0];
    expect(morningSlot.optimizedActivity).toContain('Indoor');
    expect(morningSlot.shiftType).toContain('Indoor Swap');

    // Emergency directives should be triggered for asthma + toddlers + AQI > 300
    expect(routine.emergencyGuidelines.length).toBeGreaterThan(0);
  });
});
