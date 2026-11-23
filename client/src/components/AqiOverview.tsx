import React from 'react';
import type { AqiData } from '../types';
import { Wind, AlertTriangle, ShieldCheck, Sun, ArrowUpRight, Clock, HelpCircle, Activity } from 'lucide-react';

interface AqiOverviewProps {
  aqiData: AqiData | null;
  onNavigateTab: (tab: string) => void;
  highContrast: boolean;
}

export const AqiOverview: React.FC<AqiOverviewProps> = ({ aqiData, onNavigateTab, highContrast }) => {
  if (!aqiData) {
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 font-medium">Scanning atmospheric microclimate sensors...</p>
      </div>
    );
  }

  const { current, location, forecast24h, optimalVentilationWindow } = aqiData;

  // Determine severity tier styling
  const getBadgeStyle = (aqi: number) => {
    if (highContrast) {
      return 'bg-black text-white border-2 border-white font-extrabold';
    }
    if (aqi <= 50) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (aqi <= 100) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    if (aqi <= 150) return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    if (aqi <= 200) return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    if (aqi <= 300) return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    return 'bg-red-950/40 text-red-400 border-red-700/60 shadow-lg shadow-red-950/50';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      <div className={`p-4 rounded-2xl border transition-all ${
        current.aqi > 250
          ? 'bg-gradient-to-r from-red-950/50 via-slate-900 to-red-950/30 border-red-800/60'
          : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${current.aqi > 250 ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30' : 'bg-cyan-500/20 text-cyan-400'}`}>
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-white">
                  Winter Thermal Inversion Alert: {location.city}
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {current.inversionIntensity}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {current.advice}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <button
              onClick={() => onNavigateTab('wizard')}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-cyan-900/30 flex items-center space-x-1.5 transition-all"
            >
              <span>Shield My Household</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Big AQI Dial Card */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between ${getBadgeStyle(current.aqi)}`}>
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase font-extrabold tracking-wider opacity-80">Air Quality Index (AQI)</span>
              <Activity className="w-4 h-4 opacity-75" />
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-5xl sm:text-6xl font-black tracking-tight">{current.aqi}</span>
              <span className="text-xs uppercase font-bold opacity-75">US-AQI</span>
            </div>
            <div className="mt-2 text-sm font-extrabold tracking-wide">
              {current.category}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-current/20 text-[11px] opacity-80 flex justify-between">
            <span>Mixing Layer: {current.mixingLayerMeters}m</span>
            <span>Trap: Severe</span>
          </div>
        </div>

        {/* PM2.5 Micro-Particulate Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase text-slate-400">PM2.5 (Fine Soot)</span>
              <Wind className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-3 flex items-baseline space-x-1.5">
              <span className="text-3xl font-extrabold text-white">{current.pm25}</span>
              <span className="text-xs text-slate-400 font-mono">µg/m³</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              <strong className="text-rose-400 font-semibold">{Math.round((current.pm25 / 15) * 10) / 10}x</strong> above WHO safe annual ceiling (15 µg/m³).
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Alveolar Penetration: <strong className="text-red-400">Deep</strong></span>
            <span title="Particles <2.5 micrometers translocate into bloodstream.">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            </span>
          </div>
        </div>

        {/* Optimal Ventilation Window Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-800/40 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase text-cyan-400">Optimal Air Window</span>
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3 flex items-baseline space-x-1.5">
              <span className="text-3xl font-extrabold text-cyan-300">
                {optimalVentilationWindow.start} - {optimalVentilationWindow.end}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Safe 15-min air exchange window. Convective lift dilutes ground soot to ~<strong className="text-emerald-400">{optimalVentilationWindow.expectedAqi} AQI</strong>.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-cyan-400 flex items-center space-x-1.5 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Keep windows locked outside this time</span>
          </div>
        </div>

        {/* Secondary Pollutants Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase text-slate-400">Co-Pollutants</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 font-mono">PM10 (Coarse)</span>
                <p className="text-lg font-bold text-slate-200">{current.pm10} <span className="text-[10px] text-slate-500">µg</span></p>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 font-mono">NO2 (Vehicular)</span>
                <p className="text-lg font-bold text-slate-200">{current.no2} <span className="text-[10px] text-slate-500">µg</span></p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Sensor Source:</span>
            <span className="text-slate-300 font-medium truncate max-w-[120px]">{location.source}</span>
          </div>
        </div>
      </div>

      {/* 24-Hour Diurnal Thermal Inversion Smog Forecast Chart */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Diurnal Winter Thermal Inversion Curve (24-Hour Cycle)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Shows how cold ground trapping creates severe morning spikes and safe afternoon ventilation windows.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Inversion Peak (Stay Indoors)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Micro-Ventilation Window</span>
            </span>
          </div>
        </div>

        {/* Visual Inversion Bar Chart */}
        <div className="pt-4 overflow-x-auto scrollbar-none">
          <div className="min-w-[650px] flex items-end gap-1.5 h-48 border-b border-slate-800 pb-2">
            {forecast24h.map((slot) => {
              const heightPercent = Math.min(100, Math.max(15, Math.round((slot.aqi / 500) * 100)));
              const isPeak = slot.hour >= 6 && slot.hour <= 9;
              const isSafe = slot.isVentilationWindow;

              return (
                <div key={slot.hour} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                    <div className="bg-slate-950 text-white text-[11px] py-1.5 px-2.5 rounded-lg border border-slate-700 shadow-xl whitespace-nowrap text-center">
                      <div className="font-bold text-cyan-300">{slot.timeLabel}</div>
                      <div>AQI: <strong style={{ color: slot.color }}>{slot.aqi}</strong></div>
                      <div>PM2.5: {slot.pm25} µg/m³</div>
                      <div className="text-[10px] text-slate-400">{slot.status}</div>
                    </div>
                    <div className="w-2 h-2 bg-slate-950 rotate-45 border-r border-b border-slate-700 -mt-1" />
                  </div>

                  {/* Bar */}
                  <div className="w-full flex items-end justify-center h-40">
                    <div
                      style={{ height: `${heightPercent}%`, backgroundColor: slot.color }}
                      className={`w-full max-w-[18px] rounded-t-sm transition-all duration-300 group-hover:brightness-125 ${
                        isSafe ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900' : ''
                      } ${isPeak ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-slate-900' : ''}`}
                    />
                  </div>

                  {/* Hour label */}
                  <span className={`text-[10px] mt-2 font-mono ${
                    isSafe ? 'text-emerald-400 font-bold' : isPeak ? 'text-red-400 font-bold' : 'text-slate-500'
                  }`}>
                    {slot.hour}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contextual Science Box */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-start space-x-2.5">
          <Sun className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-200">Atmospheric Science Principle:</strong> Winter nocturnal radiational cooling cools the ground faster than upper air, trapping a dense 150m cold smog pool during morning hours (6:00-9:30 AM). In early afternoon (1:00-3:00 PM), ground warming triggers convective thermals that lift the smog ceiling to 800m, providing the only safe diurnal micro-ventilation window.
          </p>
        </div>
      </div>
    </div>
  );
};
