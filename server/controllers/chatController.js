/**
 * @file chatController.js
 * @description Controller for the conversational AI Clean Air Copilot.
 */

import { getAqiData } from '../services/aqiService.js';
import { getAssistantResponse } from '../services/geminiService.js';
import { validateChatMessage } from '../utils/validators.js';
import { ValidationError } from '../utils/errors.js';

/**
 * Handles multi-turn questions via Gemini 2.5 Flash / Expert Fallback engine.
 * POST /api/chat
 */
export async function postChat(req, res) {
  const msgValidation = validateChatMessage(req.body);
  if (!msgValidation.valid) {
    throw new ValidationError(msgValidation.errors.join(' '), ['message']);
  }

  const { message, profile = {}, city = 'delhi', conversationHistory = [] } = req.body;

  const aqiData = await getAqiData(city);
  const response = await getAssistantResponse({ message, profile, aqiData, conversationHistory });

  res.json(response);
}
