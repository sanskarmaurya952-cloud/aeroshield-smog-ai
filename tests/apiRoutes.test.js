import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';

describe('AeroShield API Integration Endpoints', () => {
  it('GET /api/health returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toContain('AeroShield');
  });

  it('GET /api/cities returns preset cities', async () => {
    const res = await request(app).get('/api/cities');
    expect(res.status).toBe(200);
    expect(res.body.presets.length).toBeGreaterThan(3);
    const delhi = res.body.presets.find((c) => c.key === 'delhi');
    expect(delhi).toBeDefined();
    expect(delhi.name).toBe('Delhi NCR');
  });

  it('GET /api/aqi returns AQI data and diurnal forecast', async () => {
    const res = await request(app).get('/api/aqi?city=delhi');
    expect(res.status).toBe(200);
    expect(res.body.location.city).toBe('Delhi NCR');
    expect(res.body.current.aqi).toBeGreaterThan(0);
    expect(res.body.forecast24h).toHaveLength(24);
    expect(res.body.optimalVentilationWindow).toBeDefined();
  });

  it('POST /api/profile/analyze computes vulnerability metrics', async () => {
    const payload = {
      childrenUnder5: 2,
      hasAsthma: true,
      commuteMode: 'two-wheeler'
    };
    const res = await request(app).post('/api/profile/analyze').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.score).toBeGreaterThanOrEqual(60);
    expect(res.body.priorityFlags).toContain('PEDIATRIC_DEFENSE_REQUIRED');
  });

  it('POST /api/recommendations returns complete intelligence package', async () => {
    const payload = {
      city: 'delhi',
      profile: {
        childrenUnder5: 1,
        hasAsthma: true,
        commuteMode: 'two-wheeler',
        currentPurifier: 'none'
      }
    };
    const res = await request(app).post('/api/recommendations').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.vulnerability).toBeDefined();
    expect(res.body.routine.schedule).toHaveLength(5);
    expect(res.body.iaqHacks.length).toBeGreaterThan(0);
    expect(res.body.sustainableAlternatives.length).toBeGreaterThan(0);
    expect(res.body.impactMetrics.personalExposure.lungProtectionScore).toBeGreaterThan(0);
  });

  it('POST /api/chat returns context-aware AI reasoning', async () => {
    const payload = {
      message: 'What is the best time to open windows to air out my room today?',
      city: 'delhi',
      profile: { hasAsthma: true }
    };
    const res = await request(app).post('/api/chat').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.reply).toContain('1:00 PM');
    expect(res.body.source).toBeDefined();
  });

  it('GET /api/community and POST /api/community/pledge records community action', async () => {
    const initial = await request(app).get('/api/community');
    expect(initial.status).toBe(200);
    const initialParticipants = initial.body.pledges[0].participants;
    const pledgeId = initial.body.pledges[0].id;

    const joinRes = await request(app).post('/api/community/pledge').send({ pledgeId });
    expect(joinRes.status).toBe(200);
    expect(joinRes.body.success).toBe(true);
    expect(joinRes.body.updatedPledge.participants).toBe(initialParticipants + 1);
  });
});
