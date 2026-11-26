/**
 * @file routineService.test.js
 * @description Unit tests for diurnal routine generation and emergency guidelines.
 */

import { describe, it, expect } from 'vitest';
import { generateDailyRoutine } from '../server/services/routineService.js';

describe('Routine Service & Diurnal Optimizer', () => {
  it('generates a 5-phase customized daily routine', () => {
    const routine = generateDailyRoutine({ outdoorHabits: 'morning-jog', commuteMode: 'two-wheeler' });

    expect(routine).toBeDefined();
    expect(routine.schedule).toHaveLength(5);

    const periods = routine.schedule.map((s) => s.period);
    expect(periods).toEqual([
      'Early Morning',
      'Morning School & Work Rush',
      'Early Afternoon',
      'Evening Commute & Market',
      'Night Wind-Down',
    ]);
  });

  it('shifts morning jog to indoor cardio during inversion peak', () => {
    const routine = generateDailyRoutine({ outdoorHabits: 'morning-jog' });
    const earlyMorning = routine.schedule[0];

    expect(earlyMorning.standardActivity).toContain('Outdoor Jogging');
    expect(earlyMorning.optimizedActivity).toContain('Indoor Yoga/Cardio');
    expect(earlyMorning.exposureReduction).toContain('78%');
  });

  it('triggers emergency guidelines for asthmatic households', () => {
    const routine = generateDailyRoutine({ hasAsthma: true });

    expect(routine.emergencyGuidelines.length).toBeGreaterThan(0);
    expect(routine.emergencyGuidelines.some((g) => g.includes('BRONCHIAL SENSITIVITY'))).toBe(true);
  });

  it('triggers pediatric protection guidelines when toddlers are present', () => {
    const routine = generateDailyRoutine({ childrenUnder5: 1 });

    expect(routine.emergencyGuidelines.some((g) => g.includes('PEDIATRIC PROTOCOL'))).toBe(true);
  });

  it('triggers hazardous inversion alert for extreme AQI > 300', () => {
    const routine = generateDailyRoutine({}, { current: { aqi: 380 } });

    expect(routine.summary).toContain('Severe Winter Smog Alert');
    expect(routine.emergencyGuidelines.some((g) => g.includes('HAZARDOUS INVERSION ALERT'))).toBe(true);
    expect(routine.targetAqi).toBeLessThan(380);
  });
});
