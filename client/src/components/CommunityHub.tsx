import React, { useState, useEffect } from 'react';
import type { SustainableAlternative, CommunityPledge } from '../types';
import { fetchCommunityPledges, joinPledge } from '../services/api';
import { Users, Car, Check, ShieldAlert, Sparkles } from 'lucide-react';

interface CommunityHubProps {
  alternatives: SustainableAlternative[];
}

export const CommunityHub: React.FC<CommunityHubProps> = ({ alternatives }) => {
  const [pledges, setPledges] = useState<CommunityPledge[]>([]);
  const [totalMembers, setTotalMembers] = useState<number>(510);
  const [co2Saved, setCo2Saved] = useState<number>(7395);
  const [pmSaved, setPmSaved] = useState<number>(19380);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunityPledges()
      .then((data) => {
        setPledges(data.pledges);
        setTotalMembers(data.totalCommunityMembers);
        setCo2Saved(data.estimatedCo2eAvoidedKg);
        setPmSaved(data.estimatedPmAvoidedGrams);
      })
      .catch((err) => console.warn('Could not load community pledges:', err));
  }, []);

  const handleJoinPledge = async (id: string) => {
    if (joinedIds.has(id)) return;
    setJoiningId(id);

    try {
      const res = await joinPledge(id);
      if (res.success) {
        setPledges((prev) =>
          prev.map((p) => (p.id === id ? { ...p, participants: p.participants + 1 } : p))
        );
        setJoinedIds((prev) => new Set(prev).add(id));
        setTotalMembers((prev) => prev + 1);
        setToastMessage(`Pledge confirmed! You joined "${res.updatedPledge.title}".`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-cyan-950 border border-cyan-500 text-cyan-200 text-xs font-semibold flex items-center space-x-2 animate-fade-in shadow-lg shadow-cyan-950/50">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <span>Community Clean Air Shield & Sustainable Alternatives</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Severe winter smog cannot be solved by individual filters alone. Collective community action drives systemic emission reduction.
        </p>
      </div>

      {/* Community Impact Board */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-3">
          <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Active Community Defenders</span>
          <div className="text-4xl font-black text-cyan-400 font-mono mt-1">{totalMembers}</div>
          <span className="text-[11px] text-slate-400">Households Pledged</span>
        </div>
        <div className="p-3 sm:border-x border-slate-800">
          <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Collective CO₂e Prevented</span>
          <div className="text-4xl font-black text-emerald-400 font-mono mt-1">{co2Saved.toLocaleString()} <span className="text-sm font-normal">kg</span></div>
          <span className="text-[11px] text-slate-400">Weekly Carbon Reduction</span>
        </div>
        <div className="p-3">
          <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Direct Toxic Soot Stopped</span>
          <div className="text-4xl font-black text-amber-400 font-mono mt-1">{pmSaved.toLocaleString()} <span className="text-sm font-normal">g</span></div>
          <span className="text-[11px] text-slate-400">Ground-level Particulate</span>
        </div>
      </div>

      {/* Community Pledges Action Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span>Collective Action Pledges for Your Neighborhood</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pledges.map((pledge) => {
            const hasJoined = joinedIds.has(pledge.id);
            const progress = Math.min(100, Math.round((pledge.participants / pledge.target) * 100));

            return (
              <div
                key={pledge.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                      {pledge.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {pledge.participants} / {pledge.target} pledged
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mt-2">{pledge.title}</h4>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-950 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleJoinPledge(pledge.id)}
                  disabled={hasJoined || joiningId === pledge.id}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    hasJoined
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 cursor-default'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950/40'
                  }`}
                >
                  {hasJoined ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Pledge Active (Household Joined)</span>
                    </>
                  ) : joiningId === pledge.id ? (
                    <span>Joining...</span>
                  ) : (
                    <span>Take Household Pledge</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sustainable Lifestyle Alternatives Catalog */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <Car className="w-4 h-4 text-cyan-400" />
          <span>Low-Emission Lifestyle & Transit Alternatives</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alternatives.map((alt) => (
            <div
              key={alt.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                  {alt.category}
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 font-mono">
                  -{alt.co2SavedPerWeek}
                </span>
              </div>

              <h4 className="text-base font-bold text-white">{alt.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{alt.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/80">
                <div className="p-2 rounded-lg bg-slate-950/60 text-slate-300">
                  <strong className="text-cyan-300 block mb-0.5">Family Benefit:</strong>
                  <span>{alt.individualBenefit}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 text-slate-300">
                  <strong className="text-emerald-300 block mb-0.5">Community Ripple:</strong>
                  <span>{alt.communityImpact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
