import React, { memo } from 'react';
import type { RoutinePlan } from '../types';
import { Clock, ShieldAlert, Sparkles, CheckCircle, Info } from 'lucide-react';

interface RoutineOptimizerProps {
  routine: RoutinePlan | null;
  onNavigateTab: (tab: string) => void;
}

const RoutineOptimizerComponent: React.FC<RoutineOptimizerProps> = ({ routine, onNavigateTab }) => {
  if (!routine) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Sparkles className="w-10 h-10 text-cyan-400 mx-auto mb-3 animate-bounce" />
        <p className="font-medium">No routine generated yet. Please complete your Household Profile first.</p>
        <button
          onClick={() => onNavigateTab('wizard')}
          className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
        >
          Go to Household Profile
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Target Summary */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              AI Inversion Adaptive Schedule
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1.5">{routine.summary}</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Synchronizes your family's activities with atmospheric boundary layer dynamics to avoid peak toxic inhalation.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Exposure Cap</span>
            <span className="text-xl font-black text-cyan-400 font-mono">~{routine.targetAqi} AQI</span>
          </div>
        </div>
      </div>

      {/* Emergency Guidance Alerts */}
      {routine.emergencyGuidelines.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 space-y-2">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase tracking-wide">
            <ShieldAlert className="w-4 h-4" />
            <span>High-Priority Family Safety Directives</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-rose-200">
            {routine.emergencyGuidelines.map((guide, idx) => (
              <li key={idx} className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/50 flex items-start space-x-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>{guide}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Routine Comparison Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Daily Timeline: Standard vs AI-Optimized Smog Schedule</span>
        </h3>

        <div className="space-y-4">
          {routine.schedule.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              {/* Header row: time, phase, smog level */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center space-x-2.5">
                  <span className="text-sm font-black font-mono text-cyan-300 px-2.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-800/50">
                    {item.time}
                  </span>
                  <span className="text-xs font-bold text-white">{item.period}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-semibold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/50">
                    {item.smogLevel}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                    {item.exposureReduction}
                  </span>
                </div>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Standard */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                    Standard Unshielded Routine
                  </span>
                  <p className="text-xs text-slate-300 line-through opacity-75">{item.standardActivity}</p>
                </div>

                {/* AI Optimized */}
                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/50">
                  <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider flex items-center space-x-1 mb-1">
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    <span>AeroShield Optimized Choice ({item.shiftType})</span>
                  </span>
                  <p className="text-xs font-semibold text-cyan-100">{item.optimizedActivity}</p>
                </div>
              </div>

              {/* Science Reasoning & Practical Tip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="flex items-start space-x-2 text-slate-400">
                  <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p><strong className="text-slate-300">Atmospheric Logic:</strong> {item.reasoning}</p>
                </div>
                <div className="flex items-start space-x-2 text-slate-300 bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p><strong className="text-emerald-300">Action Tip:</strong> {item.actionTip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const RoutineOptimizer = memo(RoutineOptimizerComponent);
export default RoutineOptimizer;
