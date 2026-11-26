/**
 * @file api.js
 * @description Clean REST API route definitions for AeroShield.
 *
 * Adheres strictly to the MVC Controller pattern:
 * - All route handlers delegate directly to dedicated controller modules
 * - All async handlers are wrapped by `asyncHandler` to eliminate try-catch boilerplate
 * - Pure input validation and typed errors handle bad requests consistently
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getHealth, getPresetCities, getAqi } from '../controllers/aqiController.js';
import { analyzeProfile } from '../controllers/profileController.js';
import { getRecommendations } from '../controllers/recommendationsController.js';
import { postChat } from '../controllers/chatController.js';
import { getCommunity, postPledge } from '../controllers/communityController.js';

const router = Router();

// ─── Health & Static Metadata ──────────────────────────────────────────────────
router.get('/health', getHealth);
router.get('/cities', getPresetCities);

// ─── Core Atmospheric & Exposure Intelligence ─────────────────────────────────
router.get('/aqi', asyncHandler(getAqi));
router.post('/profile/analyze', analyzeProfile);
router.post('/recommendations', asyncHandler(getRecommendations));

// ─── Conversational AI Copilot ─────────────────────────────────────────────────
router.post('/chat', asyncHandler(postChat));

// ─── Community Engagement & Pledges ───────────────────────────────────────────
router.get('/community', getCommunity);
router.post('/community/pledge', postPledge);

export default router;
