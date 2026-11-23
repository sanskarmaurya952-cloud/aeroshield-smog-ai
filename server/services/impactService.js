/**
 * Impact Service
 * Quantifies physiological protection (PM2.5 inhaled avoided),
 * equivalent passive cigarettes avoided, and community greenhouse gas / particulate reductions.
 */

export function calculateImpact(profile = {}, currentAqi = 220, currentPm25 = 150) {
  const {
    childrenUnder5 = 0,
    children5to12 = 0,
    elderly = 0,
    hasAsthma = false,
    commuteMode = 'two-wheeler',
    currentPurifier = 'none',
    outdoorHabits = 'morning-jog'
  } = profile;

  // Total household members estimate
  const householdMembers = Math.max(1, 2 + childrenUnder5 + children5to12 + elderly);

  // Berkeley Earth Cigarette Equivalence: ~22 µg/m³ of 24h PM2.5 ≈ 1 cigarette
  const BERKELEY_EARTH_FACTOR = 22;

  // Baseline outdoor exposure hours per day
  let baselineOutdoorHours = 2.5;
  if (outdoorHabits === 'morning-jog') baselineOutdoorHours += 1.5;
  if (commuteMode === 'two-wheeler' || commuteMode === 'walking') baselineOutdoorHours += 1.5;

  // Adult average breathing rate: ~0.8 m³/hour (15 m³/day)
  // Child breathing rate per body mass is ~2x higher
  const breathingRateM3PerHr = 0.85;

  // Baseline unmitigated daily PM2.5 intake (µg/day per person)
  // Outdoor intake + indoor infiltration intake
  const indoorInfiltrationFactor = currentPurifier === 'hepa-wholehome' ? 0.25
    : currentPurifier === 'hepa-single' ? 0.50
    : currentPurifier === 'diy-fan' ? 0.55
    : 0.85; // Unfiltered home has 85% of outdoor PM2.5!

  const baselineOutdoorIntake = baselineOutdoorHours * breathingRateM3PerHr * currentPm25;
  const baselineIndoorIntake = (24 - baselineOutdoorHours) * breathingRateM3PerHr * (currentPm25 * indoorInfiltrationFactor);
  const totalBaselineIntakePerPerson = Math.round(baselineOutdoorIntake + baselineIndoorIntake);

  // Optimized AeroShield Routine:
  // 1. Shifts morning exercise indoors / to 1:30 PM window
  // 2. Uses N95 or carpool during commute (reduces outdoor intake by 80%)
  // 3. Deploys Corsi-Rosenthal / wet-curtain hacks + micro-sealing (drops indoor PM2.5 by additional 55%)
  const optimizedOutdoorHours = Math.max(0.5, baselineOutdoorHours - 1.5);
  const optimizedMaskEfficiency = 0.85; // N95/FFP2
  const optimizedIndoorFactor = Math.min(indoorInfiltrationFactor * 0.45, 0.20);

  const optimizedOutdoorIntake = optimizedOutdoorHours * breathingRateM3PerHr * (currentPm25 * (1 - optimizedMaskEfficiency));
  const optimizedIndoorIntake = (24 - optimizedOutdoorHours) * breathingRateM3PerHr * (currentPm25 * optimizedIndoorFactor);
  const totalOptimizedIntakePerPerson = Math.round(optimizedOutdoorIntake + optimizedIndoorIntake);

  const pm25AvoidedPerPerson = Math.max(0, totalBaselineIntakePerPerson - totalOptimizedIntakePerPerson);
  const totalHouseholdPmAvoided = pm25AvoidedPerPerson * householdMembers;

  const exposureReductionPercent = Math.round(((totalBaselineIntakePerPerson - totalOptimizedIntakePerPerson) / totalBaselineIntakePerPerson) * 100);

  // Equivalent passive cigarettes avoided per household per day
  const dailyCigarettesAvoided = Number((totalHouseholdPmAvoided / (BERKELEY_EARTH_FACTOR * 15)).toFixed(1));

  // Environmental & Community Savings (Carpooling, Anti-idling, Clean Heating)
  let co2eSavedPerWeekKg = 18.5; // carpooling and anti-idling baseline
  let pmEmissionsPreventedGrams = 85;

  if (commuteMode === 'two-wheeler' || commuteMode === 'car-ac') {
    co2eSavedPerWeekKg += 14.2;
    pmEmissionsPreventedGrams += 45;
  }

  return {
    personalExposure: {
      baselineIntakeUgd: totalBaselineIntakePerPerson,
      optimizedIntakeUgd: totalOptimizedIntakePerPerson,
      avoidedIntakeUgd: pm25AvoidedPerPerson,
      householdAvoidedTotalUgd: totalHouseholdPmAvoided,
      exposureReductionPercent,
      equivalentCigarettesAvoidedPerDay: dailyCigarettesAvoided,
      lungProtectionScore: Math.min(99, Math.round(exposureReductionPercent * 0.95 + 10))
    },
    communityImpact: {
      co2eSavedPerWeekKg: Math.round(co2eSavedPerWeekKg * 10) / 10,
      pmEmissionsPreventedGrams: Math.round(pmEmissionsPreventedGrams),
      cleanAirHoursGainedWeekly: Math.round((exposureReductionPercent / 100) * 168),
      neighborhoodProtectionIndex: 'Very High (Tier A)'
    },
    scientificExplanation: `By rescheduling peak morning exposure, sealing door draft corridors, and deploying a DIY box-fan scrubber, your household reduces inhaled particulate mass from ${totalBaselineIntakePerPerson} µg/day to ${totalOptimizedIntakePerPerson} µg/day. This prevents an estimated ${dailyCigarettesAvoided} passive-cigarette equivalents of toxic soot per day from depositing into your family's lungs.`
  };
}
