import { describe, it, expect } from 'vitest';
import { getAqiCategory, calculateDiurnalInversionCurve, getAqiData } from '../server/services/aqiService.js';

describe('AQI Service & Atmospheric Inversion Model', () => {
  it('correctly maps numeric AQI values to standardized EPA categories', () => {
    expect(getAqiCategory(25).label).toBe('Good');
    expect(getAqiCategory(75).label).toBe('Moderate');
    expect(getAqiCategory(125).label).toBe('Unhealthy for Sensitive Groups');
    expect(getAqiCategory(175).label).toBe('Unhealthy');
    expect(getAqiCategory(250).label).toBe('Very Unhealthy');
    expect(getAqiCategory(380).label).toBe('Hazardous (Severe Smog)');
  });

  it('generates a 24-hour diurnal thermal inversion curve with correct peak and ventilation windows', () => {
    const curve = calculateDiurnalInversionCurve(200, 140);
    expect(curve).toHaveLength(24);

    // Morning rush hour / thermal inversion peak (07:00) should have high AQI
    const peakHourSlot = curve.find(slot => slot.hour === 7);
    expect(peakHourSlot).toBeDefined();
    expect(peakHourSlot.status).toBe('Hazardous Spike');
    expect(peakHourSlot.aqi).toBeGreaterThan(200);

    // Afternoon convective mixing window (14:00) should be marked as ventilation window
    const safeSlot = curve.find(slot => slot.hour === 14);
    expect(safeSlot).toBeDefined();
    expect(safeSlot.isVentilationWindow).toBe(true);
    expect(safeSlot.aqi).toBeLessThan(200);
    expect(safeSlot.mixingLayerMeters).toBeGreaterThan(peakHourSlot.mixingLayerMeters);
  });

  it('retrieves preset city winter smog data correctly', async () => {
    const delhiData = await getAqiData('delhi');
    expect(delhiData.location.city).toBe('Delhi NCR');
    expect(delhiData.current.aqi).toBeGreaterThanOrEqual(150);
    expect(delhiData.optimalVentilationWindow).toBeDefined();
    expect(delhiData.optimalVentilationWindow.start).toBe('13:00');
  });

  it('handles unknown or custom city queries gracefully with fallback modeling', async () => {
    const customData = await getAqiData('atlantis');
    expect(customData.location.city).toBe('Atlantis');
    expect(customData.current.aqi).toBeGreaterThan(0);
    expect(customData.forecast24h).toHaveLength(24);
  });
});
