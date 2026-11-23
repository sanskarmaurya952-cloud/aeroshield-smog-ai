export interface AqiSlot {
  hour: number;
  timeLabel: string;
  aqi: number;
  pm25: number;
  category: string;
  color: string;
  status: string;
  isVentilationWindow: boolean;
  inversionIntensity: string;
  mixingLayerMeters: number;
}

export interface AqiData {
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    source: string;
  };
  current: {
    aqi: number;
    pm25: number;
    pm10: number;
    no2: number;
    category: string;
    color: string;
    advice: string;
    inversionIntensity: string;
    mixingLayerMeters: number;
    timestamp: string;
  };
  forecast24h: AqiSlot[];
  optimalVentilationWindow: {
    start: string;
    end: string;
    expectedAqi: number;
    notes: string;
  };
}

export interface HouseholdProfile {
  childrenUnder5: number;
  children5to12: number;
  elderly: number;
  hasAsthma: boolean;
  hasCopdOrHeart: boolean;
  isPregnant: boolean;
  hasPets: boolean;
  housingType: 'ground-floor' | 'apartment-mid' | 'top-floor' | 'independent-house';
  roadProximity: 'arterial' | 'residential-lane' | 'suburban';
  currentPurifier: 'none' | 'diy-fan' | 'hepa-single' | 'hepa-wholehome';
  windowSealing: 'drafty' | 'standard' | 'sealed';
  commuteMode: 'two-wheeler' | 'walking' | 'bus' | 'car-ac' | 'metro' | 'remote';
  outdoorHabits: 'morning-jog' | 'afternoon-walk' | 'evening-stroll' | 'indoor-only';
}

export interface VulnerabilityAnalysis {
  score: number;
  riskTier: string;
  badgeColor: string;
  summary: string;
  riskFactors: string[];
  priorityFlags: string[];
  profileSummary: {
    totalVulnerableMembers: number;
    commuteMode: string;
    housingType: string;
    currentPurifier: string;
  };
}

export interface RoutineItem {
  time: string;
  period: string;
  smogLevel: string;
  standardActivity: string;
  optimizedActivity: string;
  shiftType: string;
  exposureReduction: string;
  reasoning: string;
  actionTip: string;
}

export interface RoutinePlan {
  summary: string;
  targetAqi: number;
  schedule: RoutineItem[];
  emergencyGuidelines: string[];
}

export interface IaqHack {
  id: string;
  title: string;
  category: string;
  cost: string;
  effort: string;
  effectiveness: string;
  description: string;
  scientificBacking: string;
  materials: string[];
  instructions: string[];
}

export interface SustainableAlternative {
  id: string;
  title: string;
  category: string;
  individualBenefit: string;
  communityImpact: string;
  co2SavedPerWeek: string;
  pmSavedPerWeek: string;
  description: string;
}

export interface ImpactMetrics {
  personalExposure: {
    baselineIntakeUgd: number;
    optimizedIntakeUgd: number;
    avoidedIntakeUgd: number;
    householdAvoidedTotalUgd: number;
    exposureReductionPercent: number;
    equivalentCigarettesAvoidedPerDay: number;
    lungProtectionScore: number;
  };
  communityImpact: {
    co2eSavedPerWeekKg: number;
    pmEmissionsPreventedGrams: number;
    cleanAirHoursGainedWeekly: number;
    neighborhoodProtectionIndex: string;
  };
  scientificExplanation: string;
}

export interface CommunityPledge {
  id: string;
  title: string;
  participants: number;
  target: number;
  category: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
  model?: string;
}
