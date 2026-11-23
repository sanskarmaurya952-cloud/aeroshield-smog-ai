import React from 'react';
import type { ImpactMetrics } from '../types';
import { Award, HeartPulse, Flame, Trees, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ImpactRadarProps {
  impact: ImpactMetrics | null;
}

export const ImpactRadar: React.FC<ImpactRadarProps> = ({ impact }) => {
  if (!impact) {
    return (
      <div className="py-20 text-center text-slate-400">
        <HeartPulse className="w-10 h-10 text-cyan-400 mx-auto mb-3 animate-pulse" />
        <p className="font-medium">Calculating physiological and environmental impact metrics...</p>
      </div>
    );
  }

  const { personalExposure, communityImpact, scientificExplanation } = impact;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Award className="w-5 h-5 text-cyan-400" />
          <span>Quantified Impact Assessment</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          AeroShield transparently measures both your family's biological protection and your direct contribution to cleaner community air.
        </p>
      </div>

      {/* Top Impact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lung Protection Score */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-800/40 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Deep Lung Protection</span>
              <HeartPulse className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-5xl font-black text-white">{personalExposure.lungProtectionScore}%</span>
              <span className="text-xs text-cyan-300 font-semibold">Mitigation</span>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Reduces deep alveolar particulate penetration by shifting outdoor hours and sealing draft corridors.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-cyan-900/40 text-[11px] text-cyan-300 flex items-center space-x-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Avoids {personalExposure.avoidedIntakeUgd.toLocaleString()} µg PM2.5/person/day</span>
          </div>
        </div>

        {/* Cigarette Equivalence (Berkeley Earth Formula) */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-amber-800/40 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Passive Cigarettes Spared</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-5xl font-black text-amber-300">{personalExposure.equivalentCigarettesAvoidedPerDay}</span>
              <span className="text-xs text-amber-400/80 font-semibold">Cigs / Household / Day</span>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Equivalent toxic smoke mass kept out of your family's respiratory tract based on Berkeley Earth empirical conversion.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-900/40 text-[11px] text-amber-300 flex items-center space-x-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Children & Seniors Spared Maximum Toxic Dose</span>
          </div>
        </div>

        {/* Community Emission Savings */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 border border-emerald-800/40 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Direct Emissions Avoided</span>
              <Trees className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-5xl font-black text-emerald-300">{communityImpact.co2eSavedPerWeekKg}</span>
              <span className="text-xs text-emerald-400/80 font-semibold">kg CO₂e / Week</span>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Direct vehicle and heating greenhouse gas emissions eliminated through carpooling and zero-idling choices.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-900/40 text-[11px] text-emerald-300 flex items-center space-x-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Prevents {communityImpact.pmEmissionsPreventedGrams}g direct PM from entering community air</span>
          </div>
        </div>
      </div>

      {/* Detailed Scientific Report Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Biological Exposure Differential Analysis
          </h3>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          {scientificExplanation}
        </p>

        {/* Side-by-side Intake Comparison Table */}
        <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-900/40">
            <span className="text-slate-400 block mb-1">Standard Unshielded Daily Dose</span>
            <div className="text-2xl font-bold text-rose-400 font-mono">
              {personalExposure.baselineIntakeUgd.toLocaleString()} <span className="text-xs text-slate-500 font-normal">µg PM2.5/day</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">High outdoor morning exposure + unfiltered indoor air infiltration.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-900/40">
            <span className="text-slate-400 block mb-1">AeroShield AI-Optimized Daily Dose</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {personalExposure.optimizedIntakeUgd.toLocaleString()} <span className="text-xs text-slate-500 font-normal">µg PM2.5/day</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Protected by {personalExposure.exposureReductionPercent}% through timing shift, N95 transit & DIY room scrubber.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
