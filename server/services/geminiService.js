/**
 * @file geminiService.js
 * @description Google Gemini GenAI assistant with autonomous expert fallback.
 *
 *   Architecture:
 *   1. If GEMINI_API_KEY is present and valid → call Gemini 2.5 Flash
 *   2. On API failure or missing key → route to deterministic expert engine
 *
 *   The fallback engine ensures the app functions fully offline / without a
 *   key, satisfying the hackathon "autonomous fallback guaranteed" constraint.
 */

import { GoogleGenAI } from '@google/genai';

// ─── Client Initialisation ─────────────────────────────────────────────────────
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

/** @type {import('@google/genai').GoogleGenAI|null} */
let aiClient = null;

if (apiKey && apiKey !== 'your_api_key_here') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
    console.log('[Gemini Service] Client initialised successfully.');
  } catch (err) {
    console.warn('[Gemini Service] Initialisation warning:', err.message);
  }
} else {
  console.info('[Gemini Service] No API key detected — expert fallback engine will be used.');
}

// ─── Assistant Response ────────────────────────────────────────────────────────

/**
 * Generate an intelligent, context-aware answer to a user query.
 *
 * The function first attempts to call the Google Gemini API; on failure (or when
 * no API key is configured) it transparently falls back to the deterministic
 * expert reasoning engine — guaranteeing a response in every environment.
 *
 * @param {object}   params
 * @param {string}   params.message                User's question or request.
 * @param {object}   [params.profile={}]           Household profile context.
 * @param {object}   [params.aqiData={}]           Current AQI data context.
 * @param {Array}    [params.conversationHistory=[]] Prior conversation turns.
 * @returns {Promise<{ reply: string, source: string, model: string }>}
 */
export async function getAssistantResponse({
  message,
  profile = {},
  aqiData = {},
  conversationHistory = [],
}) {
  const currentAqi  = aqiData.current?.aqi  ?? 220;
  const currentPm25 = aqiData.current?.pm25 ?? 150;
  const cityName    = aqiData.location?.city ?? 'Your Area';

  const systemInstruction = buildSystemInstruction(cityName, currentAqi, currentPm25, aqiData, profile);

  // ── Try Gemini API ──
  if (aiClient && apiKey) {
    try {
      const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const prompt = `${systemInstruction}\n\nUser Question: ${message}\n\nPlease provide your expert, personalised recommendation:`;

      const response = await aiClient.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      if (response?.text) {
        return {
          reply:  response.text,
          source: 'Google Gemini 2.5 Flash GenAI Model',
          model:  modelName,
        };
      }
    } catch (err) {
      console.warn('[Gemini Service] API call failed, switching to expert engine:', err.message);
    }
  }

  // ── Expert Fallback ──
  const fallbackReply = generateExpertFallbackResponse(message, profile, aqiData);
  return {
    reply:  fallbackReply,
    source: 'AeroShield Expert Reasoning Engine (Autonomous Fallback)',
    model:  'aeroshield-inversion-expert-v1',
  };
}

// ─── Private Helpers ───────────────────────────────────────────────────────────

/**
 * Build the Gemini system instruction string from live context data.
 *
 * @param {string} cityName
 * @param {number} currentAqi
 * @param {number} currentPm25
 * @param {object} aqiData
 * @param {object} profile
 * @returns {string}
 */
function buildSystemInstruction(cityName, currentAqi, currentPm25, aqiData, profile) {
  return `You are AeroShield AI, an empathetic, highly specialised GenAI clean air and smog intelligence copilot designed for families and urban communities navigating severe winter smog and thermal inversions.

USER CONTEXT:
- Location: ${cityName}
- Current AQI: ${currentAqi} (Category: ${aqiData.current?.category ?? 'Hazardous'})
- PM2.5 Level: ${currentPm25} µg/m³
- Diurnal Inversion Intensity: ${aqiData.current?.inversionIntensity ?? 'High Cold Pool'}
- Optimal Micro-Ventilation Window: 1:00 PM – 3:15 PM
- Household Profile:
  * Children Under 5: ${profile.childrenUnder5 ?? 0}
  * School Children: ${profile.children5to12 ?? 0}
  * Elderly Members: ${profile.elderly ?? 0}
  * Diagnosed Asthma: ${profile.hasAsthma ? 'YES (High bronchial sensitivity)' : 'No'}
  * COPD/Heart Condition: ${profile.hasCopdOrHeart ? 'YES' : 'No'}
  * Pregnancy: ${profile.isPregnant ? 'YES' : 'No'}
  * Housing: ${profile.housingType ?? 'Apartment'}, Proximity: ${profile.roadProximity ?? 'Arterial Road'}
  * Current Air Filtration: ${profile.currentPurifier ?? 'None'}
  * Commute: ${profile.commuteMode ?? 'Two-wheeler'}
  * Routine: ${profile.outdoorHabits ?? 'Morning Jog'}

CORE INSTRUCTIONS:
1. Deliver practical, low-cost, real-world hacks (e.g. Corsi-Rosenthal boxes, wet-curtain particulate absorption, door draft sweeps, zero-VOC kitchen rules).
2. Clearly quantify and explain the direct physiological and environmental impact of your advice (avoided PM2.5 inhalation in µg, lung protection, and community emission reduction).
3. Be compassionate, empowering, scientifically accurate, and realistic for everyday households.
4. If an asthmatic child or vulnerable senior is present, emphasise immediate protective barriers (N95 mask fit check, avoiding early morning 6–9 AM inversion peaks, creating a clean air room).
5. Format response with clear markdown headings, bullet points, and highlighted takeaways.`;
}

/**
 * Deterministic expert reasoning engine — produces rich, context-aware responses
 * without requiring any external API call.
 *
 * Uses keyword matching on the query to route to the most relevant template.
 *
 * @param {string} message  Original user message.
 * @param {object} profile  Household profile context.
 * @param {object} aqiData  Current AQI data context.
 * @returns {string}  Markdown-formatted expert response.
 */
function generateExpertFallbackResponse(message, profile, aqiData) {
  const query      = message.toLowerCase();
  const currentAqi = aqiData.current?.aqi  ?? 220;
  const pm25       = aqiData.current?.pm25 ?? 150;
  const city       = aqiData.location?.city ?? 'your city';

  if (query.includes('diy') || query.includes('purifier') || query.includes('filter') || query.includes('hack')) {
    return buildDiyHacksResponse(city, currentAqi, pm25);
  }

  if (query.includes('child') || query.includes('kid') || query.includes('school')
      || query.includes('toddler') || query.includes('asthma')) {
    return buildPediatricResponse(currentAqi, aqiData);
  }

  if (query.includes('window') || query.includes('air out') || query.includes('ventilat') || query.includes('fresh air')) {
    return buildVentilationResponse();
  }

  if (query.includes('commute') || query.includes('routine') || query.includes('walk')
      || query.includes('exercise') || query.includes('jog')) {
    return buildRoutineResponse();
  }

  return buildGeneralResponse(city, currentAqi);
}

/**
 * @param {string} city
 * @param {number} aqi
 * @param {number} pm25
 * @returns {string}
 */
function buildDiyHacksResponse(city, aqi, pm25) {
  const cigarettesAvoided = Math.round(pm25 * 0.65 * 15 / 22);
  return `### 🛠️ Low-Cost DIY Air Purification & IAQ Hacks for ${city}

When outdoor AQI is at **${aqi}**, outdoor PM2.5 infiltrates into homes at rates between 60% and 85% if left unsealed. Here is the highest-impact, scientifically validated DIY solution:

1. **The Corsi-Rosenthal Box Air Scrubber ($20–$35)**
   - **How it works:** Tape one standard 20-inch box fan atop 2–4 furnace MERV-13 filters arranged in a cube with a cardboard bottom.
   - **Filtration Power:** Delivers a Clean Air Delivery Rate (CADR) of over 200 CFM — filtering 85–90% of PM2.5 and airborne soot at a fraction of commercial unit costs.
   - **Immediate Impact:** Reduces room particulate concentration by ~70% within 45 minutes of operation.

2. **The Wet Towel / Micro-Curtain Trap ($0 — Free)**
   - Hang clean, damp microfibre towels along drafty window frames. The surface tension of water traps hygroscopic winter aerosols and coarse soot particles before they enter your living space.

3. **Door Sweep Sealing**
   - Winter thermal inversions create a natural pressure differential that draws cold, smoggy street air through the gap under your entry door. Roll up a heavy towel or apply silicone weatherstripping to block this corridor immediately.

> **💡 Direct Impact:** Adopting these three hacks reduces your household's daily inhaled PM2.5 dose by **~65%**, sparing your lungs from approximately **${cigarettesAvoided} passive-cigarette equivalents** of toxic soot daily.`;
}

/**
 * @param {number} aqi
 * @param {object} aqiData
 * @returns {string}
 */
function buildPediatricResponse(aqi, aqiData) {
  return `### 🛡️ Urgent Pediatric & Respiratory Shield Protocol

With current air quality at **AQI ${aqi}** (${aqiData.current?.category ?? 'Hazardous'}), children and individuals with asthma are under extreme respiratory stress because:
- Children breathe **2× more air per kilogram of body weight** than adults.
- Their airways are narrower, making inflammation trigger wheezing and bronchospasms rapidly.

**Recommended Actions for Your Family:**
1. **School & Outdoor Transit Modification:**
   - Eliminate open two-wheeler / walking transit between **7:30 AM and 9:30 AM**, which is the peak diurnal smog inversion window.
   - Coordinate a **sealed vehicle carpool** with neighbouring families, keeping the car's AC strictly set to **Internal Air Recirculation** mode.
2. **Proper Pediatric Masking:**
   - Cloth masks and surgical masks offer less than 20% protection against sub-micron PM2.5 soot. Use certified **KN95 / FFP2 masks with adjustable nose clips** sized specifically for pediatric faces.
3. **Establish a "Clean Air Safe Bedroom":**
   - Choose the bedroom where your children sleep, seal the door bottom, keep windows locked, and run your air scrubber continuously on low speed.

> **💡 Health Impact:** Shielding transit and creating a safe room lowers pediatric alveolar particle deposition by **over 80%**, drastically reducing the frequency of nighttime coughing and bronchial flare-ups.`;
}

/** @returns {string} */
function buildVentilationResponse() {
  return `### 🪟 Smart Ventilation Timing: Navigating the Thermal Inversion

Opening windows at the wrong hour during winter smog can fill your home with concentrated toxic vehicle exhaust and cold stagnant soot.

**The Golden Window:**
- **Best Time:** **1:00 PM – 3:15 PM**
- **Why this works:** Solar heating warms the ground by early afternoon, causing the atmospheric boundary layer to expand upward from ~150 metres to over 800 metres. This vertical thermal lift dilutes ground-level PM2.5 by **40% to 60%**.
- **Execution:** Open windows on the lee side (away from the busy road) for just **15–20 minutes** to purge accumulated indoor CO₂, then seal windows and run indoor filtration on high for 30 minutes.

**Hours of Total Lockdown:**
- Strictly keep windows and balconies **sealed between 6:00 AM – 10:00 AM** and **6:00 PM – 10:00 PM**, when the thermal inversion ceiling drops closest to ground level.`;
}

/** @returns {string} */
function buildRoutineResponse() {
  return `### 🏃 Routine & Commute Optimisation for Winter Smog

Exercising outdoors during winter smog forces heavy volumes of ultra-fine particulate (PM0.1 and PM2.5) directly past upper nasal cilia deep into the vascular bloodstream.

**Strategic Daily Adjustments:**
1. **Move Morning Workouts Indoors:**
   - Shift outdoor running or cycling to indoor resistance bands, bodyweight circuits, or treadmill workouts in a filtered room.
2. **Shift Commute Timing or Route:**
   - Commuting along heavy arterial roads during the 8:00 AM rush hour exposes you to intense localised "street canyon" traps.
   - Utilise underground rail/metro where possible, or carpool via less congested residential bypasses.
3. **Vehicular Cabin Protection:**
   - In private cars or taxis, always press the **Air Recirculation button** to avoid sucking diesel particulate directly into your breathing zone.

> **🌱 Community & Environmental Impact:** Organising a neighbourhood carpool saves approximately **18 kg of CO₂e** and prevents **42 grams of direct PM emissions** weekly in your local community!`;
}

/**
 * @param {string} city
 * @param {number} aqi
 * @returns {string}
 */
function buildGeneralResponse(city, aqi) {
  return `### 🌬️ AeroShield Strategic Action Plan for ${city} (AQI: ${aqi})

Navigating severe winter smog requires a dual approach: **individual biological shielding** and **community emission reduction**.

1. **Immediate Indoor Protection:**
   - Keep entry doors sealed with draft stoppers.
   - Run a DIY Corsi-Rosenthal box or HEPA filter in high-occupancy rooms.
   - Maintain a zero-indoor-combustion rule (no incense, no aerosol sprays, and always cook with tight pot lids).
2. **Diurnal Schedule Synchronisation:**
   - Avoid outdoor exertion during the **morning inversion spike (6:30 AM – 9:30 AM)**.
   - Restrict household air-exchange to the **1:00 PM – 3:00 PM** convective mixing window.
3. **Community & Commute Action:**
   - Join your local school or office carpool ring to cut vehicular cold-starts.
   - Advocate for electric heating support for building guards and outdoor workers to prevent nighttime biomass burning.

> **Direct Impact Summary:** Combining these measures reduces your personal toxic particulate exposure by **up to 75%** while directly contributing to cleaner neighbourhood air.`;
}
