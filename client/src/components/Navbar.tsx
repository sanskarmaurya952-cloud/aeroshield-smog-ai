import React from 'react';
import { Wind, ShieldAlert, Sparkles, Eye, MapPin, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentCity: string;
  onCityChange: (city: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  aqiScore?: number;
}

const PRESET_OPTIONS = [
  { value: 'delhi', label: 'Delhi NCR (Severe Inversion)' },
  { value: 'beijing', label: 'Beijing (Winter Smog)' },
  { value: 'lahore', label: 'Lahore (Dense Smog)' },
  { value: 'saltlake', label: 'Salt Lake City (Valley Stagnation)' },
  { value: 'london', label: 'London (Roadside Stagnation)' },
  { value: 'mumbai', label: 'Mumbai (Coastal Haze)' }
];

export const Navbar: React.FC<NavbarProps> = ({
  currentCity,
  onCityChange,
  activeTab,
  onTabChange,
  highContrast,
  onToggleHighContrast,
  isRefreshing,
  onRefresh,
  aqiScore
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Air Radar', icon: Wind },
    { id: 'wizard', label: 'Family Profile', icon: ShieldAlert },
    { id: 'routine', label: 'Routine Optimizer', icon: Sparkles },
    { id: 'iaq', label: 'IAQ Hacks Lab', icon: Wind },
    { id: 'impact', label: 'Impact Radar', icon: Sparkles },
    { id: 'community', label: 'Community Action', icon: ShieldAlert },
    { id: 'copilot', label: 'AI Copilot', icon: Sparkles }
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/85 border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
              <Wind className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                  AeroShield
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  GenAI Smog Defense
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Family & Community Winter Smog Copilot</p>
            </div>
          </div>

          {/* City Selector & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 pointer-events-none" aria-hidden="true" />
              <select
                value={currentCity}
                onChange={(e) => onCityChange(e.target.value)}
                aria-label="Select Target City"
                className="pl-9 pr-8 py-1.5 text-xs sm:text-sm rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer font-medium hover:border-slate-600 transition-all"
              >
                {PRESET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh live air data"
              title="Refresh live air data"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {/* High Contrast / Smog Accessibility Mode */}
            <button
              onClick={onToggleHighContrast}
              aria-label={highContrast ? "Disable high contrast mode" : "Enable high contrast mode for severe smog visibility"}
              title={highContrast ? "High Contrast Mode Active" : "Toggle WCAG High-Contrast Smog Mode"}
              className={`p-2 rounded-lg border transition-colors flex items-center space-x-1.5 text-xs font-semibold ${
                highContrast
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden md:inline">{highContrast ? 'High Contrast ON' : 'A11y'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60" aria-label="Main Navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.id === 'wizard' && aqiScore && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-1" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
