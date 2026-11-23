import { GoogleGenAI } from '@google/genai';

/**
 * Gemini GenAI Assistant Service
 * Provides context-aware reasoning for families navigating severe winter smog.
 */

// Initialize GoogleGenAI client if API key is provided
let aiClient = null;
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

if (apiKey && apiKey !== 'your_api_key_here') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('[Gemini Service] Initialization warning:', err.message);
  }
}

/**
 * Generates an intelligent, tailored answer to user queries
 */
export async function getAssistantResponse({ message, profile = {}, aqiData = {}, conversationHistory = [] }) {
  const currentAqi = aqiData.current?.aqi || 220;
  const currentPm25 = aqiData.current?.pm25 || 150;
  const cityName = aqiData.location?.city || 'Your Area';

  // System instruction detailing the persona, vertical logic, and safety guardrails
  const systemInstruction = `You are AeroShield AI, an empathetic, highly specialized GenAI clean air and smog intelligence copilot designed for families and urban communities navigating severe winter smog and thermal inversions.

USER CONTEXT:
- Location: ${cityName}
- Current AQI: ${currentAqi} (Category: ${aqiData.current?.category || 'Hazardous'})
- PM2.5 Level: ${currentPm25} µg/m³
- Diurnal Inversion Intensity: ${aqiData.current?.inversionIntensity || 'High Cold Pool'}
- Optimal Micro-Ventilation Window: 1:00 PM - 3:15 PM
- Household Profile:
  * Children Under 5: ${profile.childrenUnder5 || 0}
  * School Children: ${profile.children5to12 || 0}
  * Elderly Members: ${profile.elderly || 0}
  * Diagnosed Asthma: ${profile.hasAsthma ? 'YES (High bronchial sensitivity)' : 'No'}
  * COPD/Heart Condition: ${profile.hasCopdOrHeart ? 'YES' : 'No'}
  * Pregnancy: ${profile.isPregnant ? 'YES' : 'No'}
  * Housing: ${profile.housingType || 'Apartment'}, Proximity: ${profile.roadProximity || 'Arterial Road'}
  * Current Air Filtration: ${profile.currentPurifier || 'None'}
  * Commute: ${profile.commuteMode || 'Two-wheeler'}
  * Routine: ${profile.outdoorHabits || 'Morning Jog'}

CORE INSTRUCTIONS:
1. Deliver practical, low-cost, real-world hacks (e.g. Corsi-Rosenthal boxes, wet-curtain particulate absorption, door draft sweeps, zero-VOC kitchen rules).
2. Clearly quantify and explain the direct physiological and environmental impact of your advice (mention avoided PM2.5 inhalation in µg, lung protection, and community emission reduction).
3. Be compassionate, empowering, scientifically accurate, and realistic for everyday households.
4. If an asthmatic child or vulnerable senior is present, emphasize immediate protective barriers (N95 mask fit check, avoiding early morning 6-9 AM inversion peaks, creating a clean air room).
5. Format response with clear markdown headings, bullet points, and highlighted takeaways.`;

  // Try calling real Gemini API if client is available
  if (aiClient && apiKey) {
    try {
      const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const prompt = `${systemInstruction}\n\nUser Question: ${message}\n\nPlease provide your expert, personalized recommendation:`;

      const response = await aiClient.models.generateContent({
        model: modelName,
        contents: prompt
      });

      if (response && response.text) {
        return {
          reply: response.text,
          source: 'Google Gemini 2.5 Flash GenAI Model',
          model: modelName
        };
      }
    } catch (err) {
      console.warn('[Gemini Service] API call failed, switching to AeroShield Expert Reasoning Engine:', err.message);
    }
  }

  // Graceful, intelligent rule-based expert GenAI reasoning fallback
  const fallbackReply = generateExpertFallbackResponse(message, profile, aqiData);
  return {
    reply: fallbackReply,
    source: 'AeroShield Expert Reasoning Engine (Autonomous Fallback)',
    model: 'aeroshield-inversion-expert-v1'
  };
}

/**
 * Deterministic expert reasoning engine for instant, reliable fallback responses
 */
function generateExpertFallbackResponse(message, profile, aqiData) {
  const query = message.toLowerCase();
  const currentAqi = aqiData.current?.aqi || 220;
  const pm25 = aqiData.current?.pm25 || 150;
  const city = aqiData.location?.city || 'your city';
  const hasAsthma = profile.hasAsthma;
  const hasKids = (profile.childrenUnder5 || 0) + (profile.children5to12 || 0) > 0;

  if (query.includes('diy') || query.includes('purifier') || query.includes('filter') || query.includes('hack')) {
    return `### 🛠️ Low-Cost DIY Air Purification & IAQ Hacks for ${city}

When outdoor AQI is at **${currentAqi}**, outdoor PM2.5 infiltrates into homes at rates between 60% and 85% if left unsealed. Here is the highest-impact, scientifically validated DIY solution:

1. **The Corsi-Rosenthal Box Air Scrubber ($20 - $35)**
   - **How it works:** Tape one standard 20-inch box fan atop 2 to 4 furnace MERV-13 filters arranged in a cube with a cardboard bottom.
   - **Filtration Power:** Delivers a Clean Air Delivery Rate (CADR) of over 200 CFM—filtering 85-90% of PM2.5 and airborne soot at a fraction of commercial unit costs.
   - **Immediate Impact:** Reduces room particulate concentration by ~70% within 45 minutes of operation.

2. **The Wet Towel / Micro-Curtain Trap ($0 - Free)**
   - Hang clean, damp microfiber towels along drafty window frames. The surface tension of water traps hygroscopic winter aerosols and coarse soot particles before they enter your living space.

3. **Door Sweep Sealing**
   - Winter thermal inversions create a natural pressure differential that draws cold, smoggy street air through the gap under your entry door. Roll up a heavy towel or apply silicone weatherstripping to block this corridor immediately.

> **💡 Direct Impact:** Adopting these three hacks reduces your household's daily inhaled PM2.5 dose by **~65%**, sparing your lungs from approximately **${Math.round(pm25 * 0.65 * 15 / 22)} passive-cigarette equivalents** of toxic soot daily.`;
  }

  if (query.includes('child') || query.includes('kid') || query.includes('school') || query.includes('toddler') || query.includes('asthma')) {
    return `### 🛡️ Urgent Pediatric & Respiratory Shield Protocol

With current air quality at **AQI ${currentAqi}** (${aqiData.current?.category || 'Hazardous'}), children and individuals with asthma are under extreme respiratory stress because:
- Children breathe **2x more air per kilogram of body weight** than adults.
- Their airways are narrower, making inflammation trigger wheezing and bronchospasms rapidly.

**Recommended Actions for Your Family:**
1. **School & Outdoor Transit Modification:**
   - Eliminate open two-wheeler / walking transit between **7:30 AM and 9:30 AM**, which is the peak diurnal smog inversion window.
   - Coordinate a **sealed vehicle carpool** with neighboring families, keeping the car's AC strictly set to **Internal Air Recirculation** mode.
2. **Proper Pediatric Masking:**
   - Cloth masks and surgical masks offer less than 20% protection against sub-micron PM2.5 soot. Use certified **KN95 / FFP2 masks with adjustable nose clips** sized specifically for pediatric faces.
3. **Establish a "Clean Air Safe Bedroom":**
   - Choose the bedroom where your children sleep, seal the door bottom, keep windows locked, and run your air scrubber continuously on low speed.

> **💡 Health Impact:** Shielding transit and creating a safe room lowers pediatric alveolar particle deposition by **over 80%**, drastically reducing the frequency of nighttime coughing and bronchial flare-ups.`;
  }

  if (query.includes('window') || query.includes('air out') || query.includes('ventilat') || query.includes('fresh air')) {
    return `### 🪟 Smart Ventilation Timing: Navigating the Thermal Inversion

Opening windows at the wrong hour during winter smog can fill your home with concentrated toxic vehicle exhaust and cold stagnant soot.

**The Golden Window:**
- **Best Time:** **1:00 PM – 3:15 PM**
- **Why this works:** Solar heating warms the ground by early afternoon, causing the atmospheric boundary layer to expand upward from ~150 meters to over 800 meters. This vertical thermal lift dilutes ground-level PM2.5 by **40% to 60%**.
- **Execution:** Open windows on the lee side (away from the busy road) for just **15 to 20 minutes** to purge accumulated indoor carbon dioxide (CO2), then seal windows and run indoor filtration on high for 30 minutes.

**Hours of Total Lockdown:**
- Strictly keep windows and balconies **sealed between 6:00 AM – 10:00 AM** and **6:00 PM – 10:00 PM**, when the thermal inversion ceiling drops closest to ground level.`;
  }

  if (query.includes('commute') || query.includes('routine') || query.includes('walk') || query.includes('exercise') || query.includes('jog')) {
    return `### 🏃 Routine & Commute Optimization for Winter Smog

Exercising outdoors during winter smog forces heavy volumes of ultra-fine particulate (PM0.1 and PM2.5) directly past upper nasal cilia deep into the vascular bloodstream.

**Strategic Daily Adjustments:**
1. **Move Morning Workouts Indoors:**
   - Shift outdoor running or cycling to indoor resistance bands, bodyweight circuits, or treadmill workouts in a filtered room.
2. **Shift Commute Timing or Route:**
   - Commuting along heavy arterial roads during the 8:00 AM rush hour exposes you to intense localized "street canyon" traps.
   - Utilize underground rail/metro where possible, or carpool via less congested residential bypasses.
3. **Vehicular Cabin Protection:**
   - In private cars or taxis, always press the **Air Recirculation button** to avoid sucking diesel particulate directly into your breathing zone.

> **🌱 Community & Environmental Impact:** Organizing a neighborhood carpool saves approximately **18 kg of CO2e** and prevents **42 grams of direct PM emissions** weekly in your local community!`;
  }

  // General comprehensive response
  return `### 🌬️ AeroShield Strategic Action Plan for ${city} (AQI: ${currentAqi})

Navigating severe winter smog requires a dual approach: **individual biological shielding** and **community emission reduction**.

1. **Immediate Indoor Protection:**
   - Keep entry doors sealed with draft stoppers.
   - Run a DIY Corsi-Rosenthal box or HEPA filter in high-occupancy rooms.
   - Maintain a zero-indoor-combustion rule (no incense, no aerosol sprays, and always cook with tight pot lids).
2. **Diurnal Schedule Synchronization:**
   - Avoid outdoor exertion during the **morning inversion spike (6:30 AM – 9:30 AM)**.
   - Restrict household air-exchange to the **1:00 PM – 3:00 PM** convective mixing window.
3. **Community & Commute Action:**
   - Join your local school or office carpool ring to cut vehicular cold-starts.
   - Advocate for electric heating support for building guards and outdoor workers to prevent nighttime biomass burning.

> **Direct Impact Summary:** Combining these measures reduces your personal toxic particulate exposure by **up to 75%** while directly contributing to cleaner neighborhood air.`;
}
