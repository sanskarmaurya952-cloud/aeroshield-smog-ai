/**
 * @file validators.test.js
 * @description Unit tests for input validation routines (server/utils/validators.js).
 *   Ensures edge-case and malicious input detection works cleanly.
 */

import { describe, it, expect } from 'vitest';
import {
  validateCity,
  validateProfile,
  validateChatMessage,
} from '../server/utils/validators.js';

describe('Input Validation Suite', () => {
  describe('validateCity', () => {
    it('accepts valid city names', () => {
      expect(validateCity('Delhi').valid).toBe(true);
      expect(validateCity('Salt Lake City').valid).toBe(true);
      expect(validateCity('Beijing-North').valid).toBe(true);
    });

    it('rejects empty or whitespace-only city names', () => {
      expect(validateCity('').valid).toBe(false);
      expect(validateCity('   ').valid).toBe(false);
      expect(validateCity(null).valid).toBe(false);
      expect(validateCity(undefined).valid).toBe(false);
    });

    it('rejects city names that are too short', () => {
      const result = validateCity('A');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('rejects city names with injection characters', () => {
      expect(validateCity('<script>alert(1)</script>').valid).toBe(false);
      expect(validateCity('delhi; DROP TABLE cities;--').valid).toBe(false);
    });
  });

  describe('validateProfile', () => {
    it('accepts valid household profiles', () => {
      const profile = {
        city: 'Delhi',
        householdSize: 4,
        hasChildren: true,
        hasElderly: false,
        commuteType: 'public_transit',
        heatingType: 'electric',
      };
      const result = validateProfile(profile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects non-object profiles', () => {
      expect(validateProfile(null).valid).toBe(false);
      expect(validateProfile('not-an-object').valid).toBe(false);
      expect(validateProfile([1, 2, 3]).valid).toBe(false);
    });

    it('validates household size bounds', () => {
      expect(validateProfile({ city: 'Delhi', householdSize: 0 }).valid).toBe(false);
      expect(validateProfile({ city: 'Delhi', householdSize: 25 }).valid).toBe(false);
      expect(validateProfile({ city: 'Delhi', householdSize: 3.5 }).valid).toBe(false);
    });

    it('validates commute type enum', () => {
      expect(validateProfile({ city: 'Delhi', commuteType: 'rocket' }).valid).toBe(false);
      expect(validateProfile({ city: 'Delhi', commuteType: 'cycling' }).valid).toBe(true);
    });

    it('validates heating type enum', () => {
      expect(validateProfile({ city: 'Delhi', heatingType: 'nuclear' }).valid).toBe(false);
      expect(validateProfile({ city: 'Delhi', heatingType: 'gas' }).valid).toBe(true);
    });
  });

  describe('validateChatMessage', () => {
    it('accepts valid chat messages', () => {
      const result = validateChatMessage({
        message: 'How can I protect my toddler during peak winter smog?',
      });
      expect(result.valid).toBe(true);
    });

    it('rejects empty or non-string messages', () => {
      expect(validateChatMessage({ message: '' }).valid).toBe(false);
      expect(validateChatMessage({ message: '   ' }).valid).toBe(false);
      expect(validateChatMessage({ message: 12345 }).valid).toBe(false);
      expect(validateChatMessage(null).valid).toBe(false);
    });

    it('rejects excessively long messages (over 1000 chars)', () => {
      const longMessage = 'a'.repeat(1001);
      const result = validateChatMessage({ message: longMessage });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('1000'))).toBe(true);
    });

    it('validates context object if provided', () => {
      expect(validateChatMessage({ message: 'Help', context: 'not-an-object' }).valid).toBe(false);
      expect(validateChatMessage({ message: 'Help', context: { city: 'Delhi' } }).valid).toBe(true);
    });
  });
});
