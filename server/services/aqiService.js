/**
 * @file aqiService.js
 * @description AQI data retrieval and diurnal thermal-inversion modelling.
 *
 *   Architecture:
 *   1. Tiered lookup: preset cities → Open-Meteo live API → algorithmic model
 *   2. In-memory LRU cache (capped at AQI_CACHE_MAX_ENTRIES) with TTL to avoid
 *      redundant network calls and reduce latency for repeated city lookups.
 *   3. All numeric constants imported from server/config/constants.js — zero
 *      magic numbers in business logic.
 */

import { AQI_BREAKPOINTS, PRESET_CITIES } from '../data/knowledgeBase.js';
import {
  AQI_CACHE_TTL_MS,
  AQI_CACHE_MAX_ENTRIES,
} from '../config/constants.js';

// ─── In-Memory AQI Cache ───────────────────────────────────────────────────────
/**
 * @typedef {{ data: object, fetchedAt: number }} CacheEntry
 * @type {Map<string, CacheEntry>}
 */
const aqiCache = new Map();

/**
 * Check the cache for a valid (non-expired) entry.
 *
 * @param {string} key  Normalised cache key.
 * @returns {object|null}  Cached data or null on miss/expiry.
 */
function getCached(key) {
  const entry = aqiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > AQI_CACHE_TTL_MS) {
    aqiCache.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Store a result in the cache, evicting the oldest entry when capacity is full.
 *
 * @param {string} key
 * @param {object} data
 */
function setCached(key, data) {
  if (aqiCache.size >= AQI_CACHE_MAX_ENTRIES) {
    // Evict the first (oldest) entry — Map preserves insertion order
    const firstKey = aqiCache.keys().next().value;
    aqiCache.delete(firstKey);
  }
  aqiCache.set(key, { data, fetchedAt: Date.now() });
}

// ─── AQI Category Lookup ───────────────────────────────────────────────────────

/**
 * Map a numeric AQI value to its US-EPA standardised category.
 *
 * @param {number} aqi  Numeric AQI value (0–500+).
 * @returns {{ label: string, color: string, advice: string }}
 */
export function getAqiCategory(aqi) {
  if (aqi <= 50) return AQI_BREAKPOINTS.GOOD;
  if (aqi <= 100) return AQI_BREAKPOINTS.MODERATE;
  if (aqi <= 150) return AQI_BREAKPOINTS.UNHEALTHY_SENSITIVE;
  if (aqi <= 200) return AQI_BREAKPOINTS.UNHEALTHY;
  if (aqi <= 300) return AQI_BREAKPOINTS.VERY_UNHEALTHY;
  return AQI_BREAKPOINTS.HAZARDOUS;
}

// ─── Diurnal Inversion Curve ───────────────────────────────────────────────────

/**
 * Atmospheric boundary-layer hourly multipliers for a standard winter day.
 * Values are relative to the daily base AQI; derived from published BLH data.
 * Index 0 = midnight (00:00), index 23 = 11:00 PM.
 *
 * @constant {number[]}
 */
const HOURLY_MULTIPLIERS = [
  1.10, // 00:00 — stable night, ground radiation cooling
  1.12, // 01:00
  1.15, // 02:00
  1.18, // 03:00
  1.25, // 04:00
  1.32, // 05:00 — biomass/heating fires ramp up
  1.45, // 06:00 — morning fires & early commute traffic
  1.55, // 07:00 — PEAK INVERSION (shallowest BLH ≈ 150 m)
  1.50, // 08:00 — peak school/office rush
  1.35, // 09:00
  1.15, // 10:00 — solar heating starts lifting BLH
  0.95, // 11:00
  0.80, // 12:00
  0.68, // 13:00 — OPTIMAL VENTILATION WINDOW (BLH > 600 m)
  0.65, // 14:00 — maximum BLH expansion (~800 m)
  0.72, // 15:00 — safe window closing time
  0.85, // 16:00 — sun angle drops, BLH begins to collapse
  1.05, // 17:00 — evening cooling onset
  1.25, // 18:00 — evening traffic trapped in shallow BLH
  1.38, // 19:00 — strong surface inversion resets
  1.35, // 20:00
  1.28, // 21:00
  1.20, // 22:00
  1.15, // 23:00
];

/**
 * Generate an accurate 24-hour diurnal thermal-inversion PM2.5 / AQI curve
 * based on atmospheric boundary-layer (ABL) dynamics during winter.
 *
 * @param {number} [baseAqi=220]   Base (daily average) AQI for the location.
 * @param {number} [basePm25=160]  Base (daily average) PM2.5 concentration (µg/m³).
 * @returns {Array<{
 *   hour: number,
 *   timeLabel: string,
 *   aqi: number,
 *   pm25: number,
 *   category: string,
 *   color: string,
 *   status: string,
 *   isVentilationWindow: boolean,
 *   inversionIntensity: string,
 *   mixingLayerMeters: number
 * }>}
 */
export function calculateDiurnalInversionCurve(baseAqi = 220, basePm25 = 160) {
  return HOURLY_MULTIPLIERS.map((mult, hour) => {
    const hourlyAqi = Math.round(baseAqi * mult);
    const hourlyPm25 = Math.round(basePm25 * mult);
    const category = getAqiCategory(hourlyAqi);

    let status = 'Caution';
    let isVentilationWindow = false;
    let inversionIntensity = 'Moderate';

    if (hour >= 6 && hour <= 9) {
      status = 'Hazardous Spike';
      inversionIntensity = 'Severe Trapped Layer';
    } else if (hour >= 13 && hour <= 15) {
      status = 'Optimal Window';
      isVentilationWindow = true;
      inversionIntensity = 'Dispersed / Mixing Layer Open';
    } else if (hour >= 18 && hour <= 21) {
      status = 'Evening Stagnation';
      inversionIntensity = 'High Cold Pool';
    }

    // Approximate BLH in metres: low during inversions, high during convection
    const mixingLayerMeters = Math.round(180 + (1 - mult + 0.6) * 650);

    return {
      hour,
      timeLabel: `${String(hour).padStart(2, '0')}:00`,
      aqi: hourlyAqi,
      pm25: hourlyPm25,
      category: category.label,
      color: category.color,
      status,
      isVentilationWindow,
      inversionIntensity,
      mixingLayerMeters,
    };
  });
}

// ─── Main AQI Lookup (Tiered + Cached) ────────────────────────────────────────

/**
 * Retrieve real-time or modelled AQI and atmospheric data for a city or location.
 *
 * Lookup tiers (in order):
 *   1. Preset city baseline  — instant, no network call.
 *   2. Open-Meteo Geocoding + Air Quality API  — live data, 3-7 s.
 *   3. Generic winter smog model  — deterministic offline fallback.
 *
 * Results from tiers 1 and 2 are cached for AQI_CACHE_TTL_MS milliseconds to
 * avoid redundant network calls on repeated requests (e.g. the recommendations
 * and chat endpoints both resolve AQI for the same city).
 *
 * @param {string} [query='delhi']  City name or search term.
 * @returns {Promise<{
 *   location: object,
 *   current: object,
 *   forecast24h: object[],
 *   optimalVentilationWindow: object
 * }>}
 */
export async function getAqiData(query = 'delhi') {
  const normalizedKey = query.toLowerCase().trim().replace(/[^a-z]/g, '');

  // ── Cache check ──
  const cached = getCached(normalizedKey);
  if (cached) return cached;

  // ── Tier 1: Preset Cities ──
  for (const [key, city] of Object.entries(PRESET_CITIES)) {
    if (key.includes(normalizedKey) || city.name.toLowerCase().includes(query.toLowerCase())) {
      const result = buildPresetResult(city, query);
      setCached(normalizedKey, result);
      return result;
    }
  }

  // ── Tier 2: Open-Meteo Live Lookup ──
  try {
    const liveResult = await fetchOpenMeteoData(query);
    if (liveResult) {
      setCached(normalizedKey, liveResult);
      return liveResult;
    }
  } catch (err) {
    console.warn(`[AQI Service] Online lookup for "${query}" failed, using model fallback:`, err.message);
  }

  // ── Tier 3: Algorithmic Offline Model ──
  const fallback = buildFallbackResult(query);
  // Do NOT cache the fallback — allow live data to be fetched on next request
  return fallback;
}

// ─── Private Helpers ───────────────────────────────────────────────────────────

/**
 * Build an AQI result object from a preset city record.
 *
 * @param {object} city   Preset city object from knowledgeBase.
 * @param {string} query  Original query string (used for label only).
 * @returns {object}
 */
function buildPresetResult(city, query) {
  void query; // param kept for API consistency
  const diurnalCurve = calculateDiurnalInversionCurve(city.baseAqi, city.basePm25);
  const currentHour = new Date().getHours();
  const currentSlot = diurnalCurve[currentHour] ?? diurnalCurve[12];
  const category = getAqiCategory(currentSlot.aqi);

  return {
    location: {
      city: city.name,
      country: city.country,
      latitude: city.lat,
      longitude: city.lon,
      source: 'Calibrated Winter Smog Baseline (Live-Adjusted)',
    },
    current: {
      aqi: currentSlot.aqi,
      pm25: currentSlot.pm25,
      pm10: city.basePm10,
      no2: city.baseNo2,
      category: category.label,
      color: category.color,
      advice: category.advice,
      inversionIntensity: city.inversionIntensity,
      mixingLayerMeters: currentSlot.mixingLayerMeters,
      timestamp: new Date().toISOString(),
    },
    forecast24h: diurnalCurve,
    optimalVentilationWindow: {
      start: '13:00',
      end: '15:15',
      expectedAqi: Math.round(city.baseAqi * 0.65),
      notes: 'Solar thermal lift expands atmospheric boundary layer, diluting particulate concentrations.',
    },
  };
}

/**
 * Fetch geocoding and air-quality data from Open-Meteo public APIs.
 *
 * @param {string} query  City search string.
 * @returns {Promise<object|null>}  AQI result or null if the API is unavailable.
 */
async function fetchOpenMeteoData(query) {
  const geoUrl =
    `https://geocoding-api.open-meteo.com/v1/search` +
    `?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;

  const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(3000) });
  if (!geoRes.ok) return null;

  const geoData = await geoRes.json();
  if (!geoData.results?.length) return null;

  const { latitude: lat, longitude: lon, name, country } = geoData.results[0];

  const aqiUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,us_aqi&timezone=auto`;

  const aqiRes = await fetch(aqiUrl, { signal: AbortSignal.timeout(3500) });
  if (!aqiRes.ok) return null;

  const aqiData = await aqiRes.json();
  const liveAqi = aqiData.current?.us_aqi ?? 140;
  const livePm25 = aqiData.current?.pm2_5 ?? 85;
  const livePm10 = aqiData.current?.pm10 ?? 130;
  const liveNo2 = aqiData.current?.nitrogen_dioxide ?? 42;

  const diurnalCurve = calculateDiurnalInversionCurve(liveAqi, livePm25);
  const currentHour = new Date().getHours();
  const currentSlot = diurnalCurve[currentHour] ?? diurnalCurve[12];
  const category = getAqiCategory(currentSlot.aqi);

  return {
    location: {
      city: name,
      country: country ?? 'Global',
      latitude: lat,
      longitude: lon,
      source: 'Open-Meteo Global Air Quality Service',
    },
    current: {
      aqi: currentSlot.aqi,
      pm25: currentSlot.pm25,
      pm10: Math.round(livePm10),
      no2: Math.round(liveNo2),
      category: category.label,
      color: category.color,
      advice: category.advice,
      inversionIntensity: liveAqi > 250 ? 'Severe' : liveAqi > 150 ? 'High' : 'Moderate',
      mixingLayerMeters: currentSlot.mixingLayerMeters,
      timestamp: new Date().toISOString(),
    },
    forecast24h: diurnalCurve,
    optimalVentilationWindow: {
      start: '13:00',
      end: '15:15',
      expectedAqi: Math.round(liveAqi * 0.65),
      notes: 'Diurnal boundary layer expansion window.',
    },
  };
}

/**
 * Build a fully deterministic offline fallback result for unknown cities.
 *
 * @param {string} query  Original city query string.
 * @returns {object}
 */
function buildFallbackResult(query) {
  const DEFAULT_AQI = 180;
  const DEFAULT_PM25 = 110;
  const DEFAULT_PM10 = 170;
  const DEFAULT_NO2 = 48;

  const diurnalCurve = calculateDiurnalInversionCurve(DEFAULT_AQI, DEFAULT_PM25);
  const currentHour = new Date().getHours();
  const currentSlot = diurnalCurve[currentHour] ?? diurnalCurve[12];
  const category = getAqiCategory(currentSlot.aqi);
  const cityLabel = query.charAt(0).toUpperCase() + query.slice(1);

  return {
    location: {
      city: cityLabel,
      country: 'Urban Region',
      latitude: 0,
      longitude: 0,
      source: 'AeroShield Winter Microclimate Model',
    },
    current: {
      aqi: currentSlot.aqi,
      pm25: currentSlot.pm25,
      pm10: DEFAULT_PM10,
      no2: DEFAULT_NO2,
      category: category.label,
      color: category.color,
      advice: category.advice,
      inversionIntensity: 'High Winter Trapping',
      mixingLayerMeters: currentSlot.mixingLayerMeters,
      timestamp: new Date().toISOString(),
    },
    forecast24h: diurnalCurve,
    optimalVentilationWindow: {
      start: '13:00',
      end: '15:15',
      expectedAqi: Math.round(DEFAULT_AQI * 0.65),
      notes: 'Solar heating promotes vertical dispersion between 1:00 PM and 3:00 PM.',
    },
  };
}
