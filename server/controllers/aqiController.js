/**
 * @file aqiController.js
 * @description Controller for AQI retrieval, presets, and service health checks.
 */

import { getAqiData } from '../services/aqiService.js';
import { PRESET_CITIES } from '../data/knowledgeBase.js';
import { validateCity } from '../utils/validators.js';
import { ValidationError } from '../utils/errors.js';
import { env } from '../config/env.js';

/**
 * Health check handler.
 * GET /api/health
 */
export function getHealth(req, res) {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AeroShield Clean Air & Winter Smog API',
    geminiConfigured: env.hasGeminiKey,
  });
}

/**
 * Preset cities list handler.
 * GET /api/cities
 */
export function getPresetCities(req, res) {
  const presets = Object.entries(PRESET_CITIES).map(([key, city]) => ({
    key,
    name: city.name,
    country: city.country,
    baseAqi: city.baseAqi,
  }));
  res.json({ presets });
}

/**
 * Real-time / modeled AQI data handler.
 * GET /api/aqi?city=<name>
 */
export async function getAqi(req, res) {
  const cityParam = req.query.city ?? 'delhi';
  const validation = validateCity(String(cityParam));

  if (!validation.valid) {
    throw new ValidationError(validation.errors.join(' '), ['city']);
  }

  const data = await getAqiData(String(cityParam));
  res.json(data);
}
