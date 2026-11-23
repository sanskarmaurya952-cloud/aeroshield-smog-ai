import type { AqiData, HouseholdProfile, VulnerabilityAnalysis, RoutinePlan, IaqHack, SustainableAlternative, ImpactMetrics, CommunityPledge } from '../types';

export interface RecommendationsResponse {
  timestamp: string;
  location: AqiData['location'];
  currentAqi: AqiData['current'];
  vulnerability: VulnerabilityAnalysis;
  routine: RoutinePlan;
  iaqHacks: IaqHack[];
  sustainableAlternatives: SustainableAlternative[];
  impactMetrics: ImpactMetrics;
}

export async function fetchAqi(city: string = 'delhi'): Promise<AqiData> {
  const res = await fetch(`/api/aqi?city=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error('Failed to fetch AQI data');
  return res.json();
}

export async function analyzeProfile(profile: HouseholdProfile): Promise<VulnerabilityAnalysis> {
  const res = await fetch('/api/profile/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  if (!res.ok) throw new Error('Failed to analyze profile');
  return res.json();
}

export async function fetchRecommendations(profile: HouseholdProfile, city: string = 'delhi'): Promise<RecommendationsResponse> {
  const res = await fetch('/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, city })
  });
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function sendChatMessage(params: {
  message: string;
  profile: HouseholdProfile;
  city: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}): Promise<{ reply: string; source: string; model: string }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function fetchCommunityPledges(): Promise<{
  pledges: CommunityPledge[];
  totalCommunityMembers: number;
  estimatedCo2eAvoidedKg: number;
  estimatedPmAvoidedGrams: number;
}> {
  const res = await fetch('/api/community');
  if (!res.ok) throw new Error('Failed to fetch community pledges');
  return res.json();
}

export async function joinPledge(pledgeId: string): Promise<{ success: boolean; message: string; updatedPledge: CommunityPledge }> {
  const res = await fetch('/api/community/pledge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pledgeId })
  });
  if (!res.ok) throw new Error('Failed to join pledge');
  return res.json();
}
