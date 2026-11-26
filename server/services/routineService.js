/**
 * @file routineService.js
 * @description Generates personalized daily routines tailored to user lifestyle,
 * vulnerability factors, and diurnal winter smog inversion curves.
 *
 * Implements a 5-phase diurnal protection cycle:
 * 1. Early Morning (06:30 - 08:00): Nocturnal inversion peak mitigation
 * 2. Morning Rush (08:00 - 09:30): Shielded transit & internal air recirculation
 * 3. Early Afternoon (13:00 - 15:00): Solar boundary-layer convective ventilation window
 * 4. Evening Transition (17:30 - 19:30): Secondary inversion & cold-pool avoidance
 * 5. Night Wind-Down (20:30 - 22:30): Clean-air safe room & source control
 */

/**
 * @typedef {Object} RoutineItem
 * @property {string} time               Time span label
 * @property {string} period             Descriptive phase name
 * @property {string} smogLevel          Atmospheric condition during this phase
 * @property {string} standardActivity   Unshielded conventional behavior
 * @property {string} optimizedActivity  AeroShield recommended intervention
 * @property {string} shiftType          Classification of the shift
 * @property {string} exposureReduction  Quantified exposure benefit
 * @property {string} reasoning          Underlying atmospheric physics / physiological cause
 * @property {string} actionTip          Direct practical execution instruction
 */

/**
 * @typedef {Object} RoutinePlan
 * @property {string} summary            Overall protocol executive summary
 * @property {number} targetAqi          Post-intervention targeted indoor/exposure AQI
 * @property {RoutineItem[]} schedule    5-phase customized daily plan
 * @property {string[]} emergencyGuidelines Crucial medical/emergency action triggers
 */

/**
 * Generates an individualized daily smog management plan based on household characteristics
 * and atmospheric inversion conditions.
 *
 * @param {object} [profile={}]  Household demographics, habits, and housing factors.
 * @param {object} [aqiData={}]  Current atmospheric and diurnal AQI metrics.
 * @returns {RoutinePlan}
 */
export function generateDailyRoutine(profile = {}, aqiData = {}) {
  const {
    outdoorHabits = 'morning-jog',
    commuteMode = 'two-wheeler',
    hasAsthma = false,
    childrenUnder5 = 0,
    elderly = 0,
  } = profile;

  const currentAqi = aqiData.current?.aqi ?? 220;

  const routineItems = [
    {
      time: '06:30 - 08:00',
      period: 'Early Morning',
      smogLevel: 'Severe Inversion Peak',
      standardActivity:
        outdoorHabits === 'morning-jog'
          ? 'Outdoor Jogging / Brisk Walk'
          : 'Unsealed Morning Routine & Newspaper Reading on Balcony',
      optimizedActivity: 'Indoor Yoga/Cardio with Air Scrubber Active; Keep All Balcony Doors Sealed',
      shiftType: 'Rescheduled / Indoor Swap',
      exposureReduction: 'Cuts inhaled PM2.5 by ~78%',
      reasoning:
        'Winter cold air pool traps ground emissions at maximum density before sunrise. Strenuous outdoor breathing during this hour forces toxic PM2.5 deep into bronchial alveoli.',
      actionTip:
        'Do not open windows for morning freshness. Perform low-impact indoor workout near your DIY Corsi-Rosenthal box or HEPA filter.',
    },
    {
      time: '08:00 - 09:30',
      period: 'Morning School & Work Rush',
      smogLevel: 'Peak Inversion + Vehicular Exhaust',
      standardActivity:
        commuteMode === 'two-wheeler'
          ? 'Open Motorcycle / Scooter Commute'
          : commuteMode === 'walking'
            ? 'Walking along Arterial Road'
            : 'Solo Car Drive with Fresh Air AC Mode',
      optimizedActivity:
        commuteMode === 'two-wheeler' || commuteMode === 'walking'
          ? 'Shift to Metro / Shared Carpool with N95 Mask Fitted; Recirculation AC Mode On'
          : 'Carpool Ring with Internal Cabin Air Recirculation (Recirc Mode) ON',
      shiftType: 'Shielded Transit Swap',
      exposureReduction: 'Cuts in-transit exposure by 70-85%',
      reasoning:
        'Cold-start traffic emissions get trapped under low 150m boundary lid. Switching vehicle AC to internal recirculation prevents sucking roadside exhaust into the cabin.',
      actionTip:
        'Ensure N95/FFP2 mask has no nose-bridge leaks. Children must wear pediatric-sized snug masks.',
    },
    {
      time: '13:00 - 15:00',
      period: 'Early Afternoon',
      smogLevel: 'Diurnal Minimum Smog (Mixing Layer Open)',
      standardActivity: 'Windows Kept Closed All Day; Feeling Stagnant / High Indoor CO2',
      optimizedActivity:
        'Strategic Micro-Ventilation (15-20 mins) + Safe Outdoor Errands & School Pickup',
      shiftType: 'Optimal Exposure Window',
      exposureReduction: 'Safest window of the 24h cycle',
      reasoning:
        'Solar radiation creates thermal buoyancy, lifting the mixing layer to 800+ meters and diluting ground-level particulate by 40-60%.',
      actionTip:
        'Crack windows on the courtyard/lee side (away from traffic) for 20 mins to purge stale CO2. Run air scrubbers on boost immediately afterward.',
    },
    {
      time: '17:30 - 19:30',
      period: 'Evening Commute & Market',
      smogLevel: 'Secondary Inversion Setting In',
      standardActivity: 'Extended Outdoor Shopping & Evening Stroll along Main Street',
      optimizedActivity:
        'Consolidate Grocery Runs Indoors or Use Neighborhood Walking Paths Away from Traffic Arteries',
      shiftType: 'Rerouting & Timing',
      exposureReduction: 'Cuts localized diesel particulate exposure by 60%',
      reasoning:
        'As surface temperatures rapidly drop after sunset, the inversion layer snaps back down to 200m, trapping evening vehicular and cooking smoke at head height.',
      actionTip:
        'Avoid street-side open food stalls and main road intersections where idling buses concentrate ultra-fine particles.',
    },
    {
      time: '20:30 - 22:30',
      period: 'Night Wind-Down',
      smogLevel: 'Night Stagnation Cold Layer',
      standardActivity: 'Burning Mosquito Coils, Scented Candles, or Fireplace for Ambience',
      optimizedActivity:
        'Zero-Combustion Heating + Bedroom Air Scrubber on Low White Noise + CAM Botanical Shield',
      shiftType: 'Source Control',
      exposureReduction: 'Eliminates 90% of indoor VOCs and ultrafine soot',
      reasoning:
        'Burning a single mosquito coil or incense stick inside a sealed bedroom produces as much particulate matter as 75-100 burning cigarettes in a confined space.',
      actionTip:
        'Deploy electric radiant warmers or hot water bottles instead of open flames. Check door sweep seal before sleep.',
    },
  ];

  const emergencyGuidelines = [];
  if (hasAsthma) {
    emergencyGuidelines.push('BRONCHIAL SENSITIVITY: Keep rescue inhalers/bronchodilators within immediate reach at all times.');
  }
  if (childrenUnder5 > 0) {
    emergencyGuidelines.push('PEDIATRIC PROTOCOL: Eliminate all outdoor physical education, outdoor sports, or unshielded playground time.');
  }
  if (elderly > 0) {
    emergencyGuidelines.push('GERIATRIC ALERT: Monitor resting oxygen saturation (SpO2) and avoid cold early-morning ambient exposure.');
  }
  if (currentAqi > 300) {
    emergencyGuidelines.push('HAZARDOUS INVERSION ALERT: Maintain at least one completely sealed "Clean Air Safe Room" with continuous active filtration.');
  }

  return {
    summary: `Tailored 5-Phase Clean Air Daily Protocol for ${
      currentAqi > 250 ? 'Severe Winter Smog Alert' : 'Elevated Winter Pollution'
    }`,
    targetAqi: Math.round(currentAqi * 0.45),
    schedule: routineItems,
    emergencyGuidelines,
  };
}

export default generateDailyRoutine;
