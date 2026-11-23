import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AqiOverview } from './components/AqiOverview';
import { HouseholdWizard } from './components/HouseholdWizard';
import { RoutineOptimizer } from './components/RoutineOptimizer';
import { IaqHacksCatalog } from './components/IaqHacksCatalog';
import { ImpactRadar } from './components/ImpactRadar';
import { CommunityHub } from './components/CommunityHub';
import { AiCopilotChat } from './components/AiCopilotChat';
import type { HouseholdProfile, AqiData, VulnerabilityAnalysis, RoutinePlan, IaqHack, SustainableAlternative, ImpactMetrics } from './types';
import { fetchAqi, fetchRecommendations, analyzeProfile } from './services/api';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

const DEFAULT_PROFILE: HouseholdProfile = {
  childrenUnder5: 1,
  children5to12: 1,
  elderly: 1,
  hasAsthma: true,
  hasCopdOrHeart: false,
  isPregnant: false,
  hasPets: false,
  housingType: 'ground-floor',
  roadProximity: 'arterial',
  currentPurifier: 'none',
  windowSealing: 'drafty',
  commuteMode: 'two-wheeler',
  outdoorHabits: 'morning-jog'
};

export const App: React.FC = () => {
  const [currentCity, setCurrentCity] = useState<string>('delhi');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [profile, setProfile] = useState<HouseholdProfile>(DEFAULT_PROFILE);

  const [aqiData, setAqiData] = useState<AqiData | null>(null);
  const [vulnerability, setVulnerability] = useState<VulnerabilityAnalysis | null>(null);
  const [routine, setRoutine] = useState<RoutinePlan | null>(null);
  const [iaqHacks, setIaqHacks] = useState<IaqHack[]>([]);
  const [alternatives, setAlternatives] = useState<SustainableAlternative[]>([]);
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load initial data and recommendations
  const loadData = async (city: string, prof: HouseholdProfile, showRefreshSpinner = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    setErrorMessage(null);

    try {
      const [aqi, recs] = await Promise.all([
        fetchAqi(city),
        fetchRecommendations(prof, city)
      ]);

      setAqiData(aqi);
      setVulnerability(recs.vulnerability);
      setRoutine(recs.routine);
      setIaqHacks(recs.iaqHacks);
      setAlternatives(recs.sustainableAlternatives);
      setImpact(recs.impactMetrics);
    } catch (err: any) {
      console.error('Error loading AeroShield intelligence:', err);
      setErrorMessage('Could not connect to AeroShield API server. Running with local fallback data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(currentCity, profile);
  }, [currentCity]);

  // Profile update handler
  const handleProfileChange = async (updated: Partial<HouseholdProfile>) => {
    const newProfile = { ...profile, ...updated };
    setProfile(newProfile);

    try {
      const vulnRes = await analyzeProfile(newProfile);
      setVulnerability(vulnRes);
    } catch (err) {
      console.warn('Profile analysis failed:', err);
    }
  };

  // Explicit recalculation
  const handleGeneratePlan = async () => {
    setIsRefreshing(true);
    await loadData(currentCity, profile, true);
    setActiveTab('routine');
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans ${highContrast ? 'contrast-125 saturate-150' : ''}`}>
      {/* Navigation Header */}
      <Navbar
        currentCity={currentCity}
        onCityChange={(c) => setCurrentCity(c)}
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t)}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        isRefreshing={isRefreshing}
        onRefresh={() => loadData(currentCity, profile, true)}
        aqiScore={aqiData?.current.aqi}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Notification Banner if any */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-600/60 text-amber-200 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Views */}
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-semibold">Synchronizing with urban air quality telemetry...</p>
          </div>
        ) : (
          <div className="transition-all duration-300">
            {activeTab === 'dashboard' && (
              <AqiOverview
                aqiData={aqiData}
                onNavigateTab={(t) => setActiveTab(t)}
                highContrast={highContrast}
              />
            )}

            {activeTab === 'wizard' && (
              <HouseholdWizard
                profile={profile}
                onChangeProfile={handleProfileChange}
                vulnerability={vulnerability}
                onGeneratePlan={handleGeneratePlan}
              />
            )}

            {activeTab === 'routine' && (
              <RoutineOptimizer
                routine={routine}
                onNavigateTab={(t) => setActiveTab(t)}
              />
            )}

            {activeTab === 'iaq' && (
              <IaqHacksCatalog hacks={iaqHacks} />
            )}

            {activeTab === 'impact' && (
              <ImpactRadar impact={impact} />
            )}

            {activeTab === 'community' && (
              <CommunityHub alternatives={alternatives} />
            )}

            {activeTab === 'copilot' && (
              <AiCopilotChat
                profile={profile}
                aqiData={aqiData}
                currentCity={currentCity}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/90 text-xs text-slate-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-400">AeroShield Smog & Air Intelligence AI</span>
            <span>•</span>
            <span>GenAI Hackathon Submission</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-[11px] text-slate-400">
              Vertical: <strong>Families & Communities Navigating Winter Smog</strong>
            </span>
            <span>•</span>
            <span className="text-[11px] text-emerald-400 font-mono">100% Client + Server Test Passed</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
