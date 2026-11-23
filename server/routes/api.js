import { Router } from 'express';
import { getAqiData } from '../services/aqiService.js';
import { calculateHouseholdVulnerability } from '../services/vulnerabilityService.js';
import { generateDailyRoutine } from '../services/routineService.js';
import { calculateImpact } from '../services/impactService.js';
import { getAssistantResponse } from '../services/geminiService.js';
import { IAQ_HACKS, SUSTAINABLE_ALTERNATIVES, COMMUNITY_PLEDGES, PRESET_CITIES } from '../data/knowledgeBase.js';

const router = Router();

// In-memory pledges store for community engagement
let pledgesState = [...COMMUNITY_PLEDGES];

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AeroShield Clean Air & Winter Smog API',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here')
  });
});

/**
 * Get available preset cities
 */
router.get('/cities', (req, res) => {
  res.json({
    presets: Object.keys(PRESET_CITIES).map(k => ({
      key: k,
      name: PRESET_CITIES[k].name,
      country: PRESET_CITIES[k].country,
      baseAqi: PRESET_CITIES[k].baseAqi
    }))
  });
});

/**
 * Get AQI data and diurnal inversion curve
 */
router.get('/aqi', async (req, res) => {
  try {
    const city = req.query.city || 'delhi';
    const data = await getAqiData(city);
    res.json(data);
  } catch (error) {
    console.error('Error fetching AQI:', error);
    res.status(500).json({ error: 'Failed to retrieve air quality data', details: error.message });
  }
});

/**
 * Analyze household vulnerability
 */
router.post('/profile/analyze', (req, res) => {
  try {
    const profile = req.body || {};
    const result = calculateHouseholdVulnerability(profile);
    res.json(result);
  } catch (error) {
    console.error('Error analyzing profile:', error);
    res.status(400).json({ error: 'Failed to analyze household profile', details: error.message });
  }
});

/**
 * Generate full personalized recommendations suite
 */
router.post('/recommendations', async (req, res) => {
  try {
    const { profile = {}, city = 'delhi' } = req.body;
    const aqiData = await getAqiData(city);
    const vulnerability = calculateHouseholdVulnerability(profile);
    const routine = generateDailyRoutine(profile, aqiData);
    const impact = calculateImpact(profile, aqiData.current?.aqi, aqiData.current?.pm25);

    // Filter relevant IAQ hacks based on user's current situation
    let tailoredHacks = [...IAQ_HACKS];
    if (profile.currentPurifier === 'none') {
      // Prioritize DIY Corsi-Rosenthal and Wet Screen
      tailoredHacks.sort((a, b) => (a.id === 'corsi-rosenthal' ? -1 : 1));
    }

    res.json({
      timestamp: new Date().toISOString(),
      location: aqiData.location,
      currentAqi: aqiData.current,
      vulnerability,
      routine,
      iaqHacks: tailoredHacks,
      sustainableAlternatives: SUSTAINABLE_ALTERNATIVES,
      impactMetrics: impact
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations', details: error.message });
  }
});

/**
 * Conversational AI Assistant
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, profile = {}, city = 'delhi', conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A valid message string is required.' });
    }

    const aqiData = await getAqiData(city);
    const response = await getAssistantResponse({
      message,
      profile,
      aqiData,
      conversationHistory
    });

    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat assistant error', details: error.message });
  }
});

/**
 * Community Pledges
 */
router.get('/community', (req, res) => {
  const totalPledged = pledgesState.reduce((acc, curr) => acc + curr.participants, 0);
  res.json({
    pledges: pledgesState,
    totalCommunityMembers: totalPledged,
    estimatedCo2eAvoidedKg: Math.round(totalPledged * 14.5),
    estimatedPmAvoidedGrams: Math.round(totalPledged * 38)
  });
});

router.post('/community/pledge', (req, res) => {
  const { pledgeId } = req.body;
  const target = pledgesState.find(p => p.id === pledgeId);

  if (target) {
    target.participants += 1;
    res.json({
      success: true,
      message: `Successfully joined ${target.title}!`,
      updatedPledge: target
    });
  } else {
    res.status(404).json({ error: 'Pledge ID not found' });
  }
});

export default router;
