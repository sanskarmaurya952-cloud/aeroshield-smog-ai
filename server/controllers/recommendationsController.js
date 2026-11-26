/**
 * @file recommendationsController.js
 * @description Controller for assembling the comprehensive clean-air recommendation suite.
 */

import { getAqiData } from '../services/aqiService.js';
import { calculateHouseholdVulnerability } from '../services/vulnerabilityService.js';
import { generateDailyRoutine } from '../services/routineService.js';
import { calculateImpact } from '../services/impactService.js';
import { IAQ_HACKS, SUSTAINABLE_ALTERNATIVES } from '../data/knowledgeBase.js';
import { validateCity } from '../utils/validators.js';
import { ValidationError } from '../utils/errors.js';

/**
 * Builds personalized 5-phase routine, IAQ hacks, and impact metrics.
 * POST /api/recommendations
 */
export async function getRecommendations(req, res) {
  const { profile = {}, city = 'delhi' } = req.body;

  const cityValidation = validateCity(String(city));
  if (!cityValidation.valid) {
    throw new ValidationError(cityValidation.errors.join(' '), ['city']);
  }

  const [aqiData, vulnerability] = await Promise.all([
    getAqiData(city),
    Promise.resolve(calculateHouseholdVulnerability(profile)),
  ]);

  const routine = generateDailyRoutine(profile, aqiData);
  const impact = calculateImpact(profile, aqiData.current?.aqi, aqiData.current?.pm25);

  // Prioritise low-cost DIY hacks when no filtration equipment is in place
  const tailoredHacks =
    profile.currentPurifier === 'none'
      ? [...IAQ_HACKS].sort((a) => (a.id === 'corsi-rosenthal' ? -1 : 0))
      : [...IAQ_HACKS];

  res.json({
    timestamp: new Date().toISOString(),
    location: aqiData.location,
    currentAqi: aqiData.current,
    vulnerability,
    routine,
    iaqHacks: tailoredHacks,
    sustainableAlternatives: SUSTAINABLE_ALTERNATIVES,
    impactMetrics: impact,
  });
}
