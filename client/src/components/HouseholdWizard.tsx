import React from 'react';
import type { HouseholdProfile, VulnerabilityAnalysis } from '../types';
import { Users, AlertCircle, Home, Navigation, Activity, CheckCircle2, ShieldAlert } from 'lucide-react';

interface HouseholdWizardProps {
  profile: HouseholdProfile;
  onChangeProfile: (updated: Partial<HouseholdProfile>) => void;
  vulnerability: VulnerabilityAnalysis | null;
  onGeneratePlan: () => void;
}

export const HouseholdWizard: React.FC<HouseholdWizardProps> = ({
  profile,
  onChangeProfile,
  vulnerability,
  onGeneratePlan
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          <span>Household Vulnerability & Lifestyle Profile</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          AeroShield customizes your smog defense based on physiological sensitivity, housing structural infiltration, and commute exposure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Family Demographics & Health */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2 uppercase tracking-wide">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>1. Family Demographics & Respiratory Risk</span>
            </h3>

            {/* Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-300 block">Toddlers (&lt;5 yrs)</span>
                  <span className="text-[10px] text-slate-500">2x respiration volume/kg</span>
                </div>
                <div className="flex items-center space-x-3 mt-3">
                  <button
                    type="button"
                    onClick={() => onChangeProfile({ childrenUnder5: Math.max(0, profile.childrenUnder5 - 1) })}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm"
                  >-</button>
                  <span className="text-base font-bold text-white font-mono">{profile.childrenUnder5}</span>
                  <button
                    type="button"
                    onClick={() => onChangeProfile({ childrenUnder5: profile.childrenUnder5 + 1 })}
                    className="w-7 h-7 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm"
                  >+</button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-300 block">Children (5-12 yrs)</span>
                  <span className="text-[10px] text-slate-500">School transit exposure</span>
                </div>
                <div className="flex items-center space-x-3 mt-3">
                  <button
                    type="button"
                    onClick={() => onChangeProfile({ children5to12: Math.max(0, profile.children5to12 - 1) })}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm"
                  >-</button>
                  <span className="text-base font-bold text-white font-mono">{profile.children5to12}</span>
                  <button
                    type="button"
                    onClick={() => onChangeProfile({ children5to12: profile.children5to12 + 1 })}
                    className="w-7 h-7 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm"
                  >+</button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-300 block">Seniors (&gt;65 yrs)</span>
                  <span className="text-[10px] text-slate-500">Vascular sensitivity</span>
                </div>
                <div className="flex items-center space-x-3 mt-3">
                  <button
                    type="button"
                    onClick={() => onChangeProfile({ elderly: Math.max(0, profile.elderly - 1) })}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm"
                  >-</button>
                  <span className="text-base font-bold text-white font-mono">{profile.elderly}</span>
                  <button
                    type="button"
                    onClick={() => onChangeProfile({ elderly: profile.elderly + 1 })}
                    className="w-7 h-7 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm"
                  >+</button>
                </div>
              </div>
            </div>

            {/* Health Checklist */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label className={`p-2.5 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition-all ${
                profile.hasAsthma ? 'bg-rose-950/40 border-rose-600/60 text-rose-300 font-semibold' : 'bg-slate-950/50 border-slate-800 text-slate-400'
              }`}>
                <input
                  type="checkbox"
                  checked={profile.hasAsthma}
                  onChange={(e) => onChangeProfile({ hasAsthma: e.target.checked })}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                <span>Diagnosed Asthma</span>
              </label>

              <label className={`p-2.5 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition-all ${
                profile.hasCopdOrHeart ? 'bg-rose-950/40 border-rose-600/60 text-rose-300 font-semibold' : 'bg-slate-950/50 border-slate-800 text-slate-400'
              }`}>
                <input
                  type="checkbox"
                  checked={profile.hasCopdOrHeart}
                  onChange={(e) => onChangeProfile({ hasCopdOrHeart: e.target.checked })}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                <span>COPD / Cardiac</span>
              </label>

              <label className={`p-2.5 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition-all ${
                profile.isPregnant ? 'bg-amber-950/40 border-amber-600/60 text-amber-300 font-semibold' : 'bg-slate-950/50 border-slate-800 text-slate-400'
              }`}>
                <input
                  type="checkbox"
                  checked={profile.isPregnant}
                  onChange={(e) => onChangeProfile({ isPregnant: e.target.checked })}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                <span>Expectant Mother</span>
              </label>
            </div>
          </div>

          {/* Card 2: Housing & Indoor Barriers */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2 uppercase tracking-wide">
              <Home className="w-4 h-4 text-cyan-400" />
              <span>2. Home Infiltration & Active Protection</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Dwelling Elevation</label>
                <select
                  value={profile.housingType}
                  onChange={(e) => onChangeProfile({ housingType: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="ground-floor">Ground Floor (Heavy Stagnant Smog Trap)</option>
                  <option value="apartment-mid">Mid-Floor Apartment (Standard Infiltration)</option>
                  <option value="top-floor">Top Floor / High Rise (Wind-driven Infiltration)</option>
                  <option value="independent-house">Independent House (Multi-exposure)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Road Proximity</label>
                <select
                  value={profile.roadProximity}
                  onChange={(e) => onChangeProfile({ roadProximity: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="arterial">Near Main Arterial Road (&lt;100m) - Heavy Exhaust</option>
                  <option value="residential-lane">Residential Inner Lane (Moderate Traffic)</option>
                  <option value="suburban">Leafy / Suburban Corridor</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Existing Air Purifier Equipment</label>
                <select
                  value={profile.currentPurifier}
                  onChange={(e) => onChangeProfile({ currentPurifier: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="none">No Air Purifier (High Infiltration)</option>
                  <option value="diy-fan">DIY Box Fan / Filter Scrubber</option>
                  <option value="hepa-single">HEPA Unit (Single Room Only)</option>
                  <option value="hepa-wholehome">HEPA Units in All Rooms / HVAC</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Window & Door Weather-Sealing</label>
                <select
                  value={profile.windowSealing}
                  onChange={(e) => onChangeProfile({ windowSealing: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="drafty">Drafty Gaps under Doors / Old Windows</option>
                  <option value="standard">Standard Fitted Windows</option>
                  <option value="sealed">Silicone Weather-stripped & Sealed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: Commute & Daily Routine */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2 uppercase tracking-wide">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>3. Commute Style & Outdoor Routine</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Primary Commute Mode</label>
                <select
                  value={profile.commuteMode}
                  onChange={(e) => onChangeProfile({ commuteMode: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="two-wheeler">Motorcycle / Scooter (Unshielded Exposure)</option>
                  <option value="walking">Walking / Cycling along Arterial Roads</option>
                  <option value="bus">Public Bus (Partial Shield)</option>
                  <option value="car-ac">Car with Cabin AC (Filtered)</option>
                  <option value="metro">Underground / Sealed Metro Rail</option>
                  <option value="remote">Work from Home (Zero Commute)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Current Exercise & Walking Habit</label>
                <select
                  value={profile.outdoorHabits}
                  onChange={(e) => onChangeProfile({ outdoorHabits: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="morning-jog">Outdoor Morning Jog / Walk (6:00 - 8:30 AM)</option>
                  <option value="afternoon-walk">Afternoon Errands (1:00 - 3:00 PM)</option>
                  <option value="evening-stroll">Evening Stroll / Market Run (6:30 - 8:30 PM)</option>
                  <option value="indoor-only">Strictly Indoors</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Live Vulnerability Radar Assessment (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 sticky top-24 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                Household Inversion Vulnerability (HIVI)
              </span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>

            {/* Score Big Display */}
            {vulnerability && (
              <div>
                <div className="flex items-baseline space-x-3">
                  <span
                    className="text-6xl font-black tracking-tight"
                    style={{ color: vulnerability.badgeColor }}
                  >
                    {vulnerability.score}
                  </span>
                  <span className="text-xs uppercase font-bold text-slate-500 font-mono">/ 100 Index</span>
                </div>
                <div
                  className="mt-1 text-sm font-extrabold uppercase tracking-wide"
                  style={{ color: vulnerability.badgeColor }}
                >
                  {vulnerability.riskTier}
                </div>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  {vulnerability.summary}
                </p>
              </div>
            )}

            {/* Diagnosed Risk Factors */}
            {vulnerability && vulnerability.riskFactors.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Key Exposure Factors Detected:</span>
                </span>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {vulnerability.riskFactors.map((factor, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Priority Flags */}
            {vulnerability && vulnerability.priorityFlags.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AeroShield Action Directives:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {vulnerability.priorityFlags.map((flag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-800/60"
                    >
                      {flag.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={onGeneratePlan}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Generate Tailored Routine & Shield</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
