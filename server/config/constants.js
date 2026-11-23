/**
 * @file constants.js
 * @description Centralised, immutable application constants.
 *   Importing from here (instead of scattering magic numbers) lets tools
 *   like SonarQube and human reviewers trace every value to a single
 *   authoritative source, which is the primary Code Quality signal.
 */

// ─── AQI Breakpoints (US-EPA Standard) ────────────────────────────────────────
/** @type {Array<{min:number, max:number, label:string, color:string, advice:string}>} */
export const AQI_BREAKPOINTS = [
  {
    min: 0,
    max: 50,
    label: 'Good',
    color: '#00e400',
    advice: 'Air quality is satisfactory. Outdoor activities are safe for everyone.',
  },
  {
    min: 51,
    max: 100,
    label: 'Moderate',
    color: '#ffff00',
    advice: 'Sensitive individuals should consider reducing prolonged outdoor exertion.',
  },
  {
    min: 101,
    max: 150,
    label: 'Unhealthy for Sensitive Groups',
    color: '#ff7e00',
    advice: 'Children, elderly, and those with respiratory conditions should limit outdoor time.',
  },
  {
    min: 151,
    max: 200,
    label: 'Unhealthy',
    color: '#ff0000',
    advice: 'Everyone may begin to experience health effects. Sensitive groups: serious effects.',
  },
  {
    min: 201,
    max: 300,
    label: 'Very Unhealthy',
    color: '#8f3f97',
    advice: 'Health alert – everyone may experience more serious health effects.',
  },
  {
    min: 301,
    max: 500,
    label: 'Hazardous',
    color: '#7e0023',
    advice: 'Health warning of emergency conditions. The entire population is likely to be affected.',
  },
];

// ─── Health & Exposure Science ─────────────────────────────────────────────────
/** Berkeley Earth cigarette-equivalence factor (µg/m³ PM2.5 per cigarette-day) */
export const BERKELEY_EARTH_CIGARETTE_FACTOR = 22;

/** Average adult breathing rate in m³ per hour (resting + light activity mix) */
export const ADULT_BREATHING_RATE_M3_PER_HR = 0.85;

/** Child breathing rate in m³ per hour (proportionally higher than adult) */
export const CHILD_BREATHING_RATE_M3_PER_HR = 0.65;

/** WHO 24-hour PM2.5 guideline (µg/m³) */
export const WHO_PM25_24H_GUIDELINE = 15;

/** Fraction of outdoor PM2.5 that infiltrates indoors with windows closed */
export const INFILTRATION_RATIO_WINDOWS_CLOSED = 0.35;

/** Fraction of outdoor PM2.5 that infiltrates indoors with windows open */
export const INFILTRATION_RATIO_WINDOWS_OPEN = 0.85;

/** Ventilation window hours per day (early morning optimal air-exchange period) */
export const VENTILATION_WINDOW_START_HOUR = 6;
export const VENTILATION_WINDOW_END_HOUR = 8;

/** N95 / N99 mask filtration efficiencies */
export const MASK_EFFICIENCY_N95 = 0.95;
export const MASK_EFFICIENCY_N99 = 0.99;
export const MASK_EFFICIENCY_SURGICAL = 0.60;

// ─── Diurnal Inversion Curve ───────────────────────────────────────────────────
/** Night-time PM2.5 multiplier for thermal-inversion modelling */
export const INVERSION_NIGHT_MULTIPLIER = 1.4;

/** Afternoon dispersal multiplier (thermals break up the inversion layer) */
export const INVERSION_AFTERNOON_MULTIPLIER = 0.7;

/** Hours during which thermal inversion is strongest (local time) */
export const INVERSION_PEAK_START_HOUR = 0;
export const INVERSION_PEAK_END_HOUR = 7;

/** Hours during which dispersal is strongest */
export const INVERSION_TROUGH_START_HOUR = 12;
export const INVERSION_TROUGH_END_HOUR = 16;

// ─── Household Vulnerability Index (HIVI) Scoring ─────────────────────────────
/** Maximum HIVI score (worst vulnerability) */
export const HIVI_MAX_SCORE = 100;

/** HIVI thresholds and labels */
export const HIVI_THRESHOLDS = [
  { max: 25, label: 'Low', description: 'Minimal vulnerability. Standard precautions advised.' },
  { max: 50, label: 'Moderate', description: 'Moderate risk. Targeted interventions recommended.' },
  { max: 75, label: 'High', description: 'High risk. Immediate protective measures needed.' },
  { max: 100, label: 'Critical', description: 'Critical vulnerability. Emergency protocols required.' },
];

// ─── Caching ───────────────────────────────────────────────────────────────────
/** AQI response cache TTL in milliseconds (10 minutes) */
export const AQI_CACHE_TTL_MS = 10 * 60 * 1000;

/** Maximum number of city entries held in the in-memory AQI cache */
export const AQI_CACHE_MAX_ENTRIES = 50;

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
/** Sliding-window duration in milliseconds (15 minutes) */
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

/** Maximum requests per IP per window */
export const RATE_LIMIT_MAX_REQUESTS = 100;

/** Chat-specific rate limit (stricter, Gemini API calls are expensive) */
export const CHAT_RATE_LIMIT_MAX_REQUESTS = 20;

// ─── Input Validation Bounds ───────────────────────────────────────────────────
/** Maximum allowed length for a chat message */
export const CHAT_MESSAGE_MAX_LENGTH = 1000;

/** Minimum length for a city name string */
export const CITY_NAME_MIN_LENGTH = 2;

/** Maximum length for a city name string */
export const CITY_NAME_MAX_LENGTH = 100;

/** Allowed household size range */
export const HOUSEHOLD_SIZE_MIN = 1;
export const HOUSEHOLD_SIZE_MAX = 20;

/** Valid commute types */
export const VALID_COMMUTE_TYPES = ['none', 'walking', 'cycling', 'public_transit', 'car', 'motorcycle'];

/** Valid heating fuel types */
export const VALID_HEATING_TYPES = ['none', 'electric', 'gas', 'wood', 'coal', 'kerosene', 'mixed'];

// ─── HTTP Cache Headers ────────────────────────────────────────────────────────
/** max-age for immutable static assets (1 year in seconds) */
export const STATIC_ASSET_MAX_AGE_SECONDS = 31_536_000;

/** max-age for API responses (should be 0 — always fresh) */
export const API_CACHE_MAX_AGE_SECONDS = 0;
