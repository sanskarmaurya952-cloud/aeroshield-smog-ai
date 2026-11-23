/**
 * @file api.js
 * @description REST API route handlers for AeroShield.
 *
 *   All routes:
 *   - Validate inputs using server/utils/validators.js (pure functions, no side-effects)
 *   - Throw typed errors (server/utils/errors.js) instead of inline res.status() calls
 *   - Delegate business logic entirely to service modules
 *   - Use next(err) for all error propagation so the central handler in
 *     server/index.js produces consistent, structured JSON error responses
 */

import { Router }                                 from 'express';
import { getAqiData }                             from '../services/aqiService.js';
import { calculateHouseholdVulnerability }        from '../services/vulnerabilityService.js';
import { generateDailyRoutine }                   from '../services/routineService.js';
import { calculateImpact }                        from '../services/impactService.js';
import { getAssistantResponse }                   from '../services/geminiService.js';
import { IAQ_HACKS, SUSTAINABLE_ALTERNATIVES,
         COMMUNITY_PLEDGES, PRESET_CITIES }       from '../data/knowledgeBase.js';
import { validateCity, validateProfile,
         validateChatMessage }                    from '../utils/validators.js';
import { ValidationError, NotFoundError }         from '../utils/errors.js';

const router = Router();

// In-memory pledges store (community engagement, ephemeral by design)
let pledgesState = [...COMMUNITY_PLEDGES];

// ─── Health Check ──────────────────────────────────────────────────────────────

/**
 * GET /api/health
 * Returns service liveness status and configuration summary.
 */
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AeroShield Clean Air & Winter Smog API',
    geminiConfigured: Boolean(
      process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here'
    ),
  });
});

// ─── Preset Cities ─────────────────────────────────────────────────────────────

/**
 * GET /api/cities
 * Returns the list of built-in calibrated preset cities.
 */
router.get('/cities', (_req, res) => {
  const presets = Object.entries(PRESET_CITIES).map(([key, city]) => ({
    key,
    name:    city.name,
    country: city.country,
    baseAqi: city.baseAqi,
  }));
  res.json({ presets });
});

// ─── AQI Data ──────────────────────────────────────────────────────────────────

/**
 * GET /api/aqi?city=<name>
 * Returns current AQI, PM2.5, 24-hour diurnal inversion forecast,
 * and optimal ventilation window for the requested city.
 *
 * @throws {ValidationError}  When the city query parameter fails validation.
 */
router.get('/aqi', async (req, res, next) => {
  try {
    const cityParam = req.query.city ?? 'delhi';
    const validation = validateCity(String(cityParam));
    if (!validation.valid) {
      throw new ValidationError(validation.errors.join(' '), ['city']);
    }

    const data = await getAqiData(cityParam);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── Household Vulnerability ───────────────────────────────────────────────────

/**
 * POST /api/profile/analyze
 * Calculates the Household Inversion Vulnerability Index (HIVI) from a profile.
 *
 * @throws {ValidationError}  When the profile body fails validation.
 */
router.post('/profile/analyze', (req, res, next) => {
  try {
    const validation = validateProfile(req.body);
    if (!validation.valid) {
      throw new ValidationError(validation.errors.join(' '), validation.errors.map(() => 'profile'));
    }

    const result = calculateHouseholdVulnerability(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── Full Recommendations Suite ────────────────────────────────────────────────

/**
 * POST /api/recommendations
 * Returns a consolidated recommendations package:
 *   AQI data · vulnerability analysis · daily routine · IAQ hacks · impact metrics
 *
 * @throws {ValidationError}  When the city field fails validation.
 */
router.post('/recommendations', async (req, res, next) => {
  try {
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
    const impact  = calculateImpact(profile, aqiData.current?.aqi, aqiData.current?.pm25);

    // Prioritise DIY hacks when no purifier is in use
    const tailoredHacks = profile.currentPurifier === 'none'
      ? [...IAQ_HACKS].sort((a) => (a.id === 'corsi-rosenthal' ? -1 : 0))
      : [...IAQ_HACKS];

    res.json({
      timestamp:              new Date().toISOString(),
      location:               aqiData.location,
      currentAqi:             aqiData.current,
      vulnerability,
      routine,
      iaqHacks:               tailoredHacks,
      sustainableAlternatives: SUSTAINABLE_ALTERNATIVES,
      impactMetrics:          impact,
    });
  } catch (err) {
    next(err);
  }
});

// ─── AI Chat ───────────────────────────────────────────────────────────────────

/**
 * POST /api/chat
 * Routes a user message through the Gemini assistant (or expert fallback).
 *
 * @throws {ValidationError}  When message or context fails validation.
 */
router.post('/chat', async (req, res, next) => {
  try {
    const msgValidation = validateChatMessage(req.body);
    if (!msgValidation.valid) {
      throw new ValidationError(msgValidation.errors.join(' '), ['message']);
    }

    const { message, profile = {}, city = 'delhi', conversationHistory = [] } = req.body;

    const aqiData = await getAqiData(city);
    const response = await getAssistantResponse({ message, profile, aqiData, conversationHistory });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

// ─── Community Pledges ─────────────────────────────────────────────────────────

/**
 * GET /api/community
 * Returns all community pledges and aggregated impact statistics.
 */
router.get('/community', (_req, res) => {
  const totalPledged = pledgesState.reduce((sum, p) => sum + p.participants, 0);
  res.json({
    pledges:                   pledgesState,
    totalCommunityMembers:     totalPledged,
    estimatedCo2eAvoidedKg:   Math.round(totalPledged * 14.5),
    estimatedPmAvoidedGrams:  Math.round(totalPledged * 38),
  });
});

/**
 * POST /api/community/pledge
 * Increments the participant count for the specified pledge.
 *
 * @throws {ValidationError}  When pledgeId is missing.
 * @throws {NotFoundError}    When pledgeId does not match any pledge.
 */
router.post('/community/pledge', (req, res, next) => {
  try {
    const { pledgeId } = req.body;

    if (!pledgeId || typeof pledgeId !== 'string') {
      throw new ValidationError('pledgeId is required and must be a string.', ['pledgeId']);
    }

    const target = pledgesState.find((p) => p.id === pledgeId);
    if (!target) {
      throw new NotFoundError('Pledge');
    }

    target.participants += 1;
    res.json({
      success:       true,
      message:       `Successfully joined ${target.title}!`,
      updatedPledge: target,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
