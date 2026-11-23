import React, { useState } from 'react';
import type { IaqHack } from '../types';
import { Wrench, CheckCircle, ChevronDown, ChevronUp, DollarSign, Award, FlaskConical } from 'lucide-react';

interface IaqHacksCatalogProps {
  hacks: IaqHack[];
}

export const IaqHacksCatalog: React.FC<IaqHacksCatalogProps> = ({ hacks }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(hacks[0]?.id || null);

  const categories = ['All', 'Filtration', 'DIY Moisture & Capture', 'Ventilation', 'Source Control', 'Biophilic', 'Envelope Sealing'];

  const filteredHacks = selectedCategory === 'All'
    ? hacks
    : hacks.filter(h => h.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Wrench className="w-5 h-5 text-cyan-400" />
          <span>Indoor Air Quality (IAQ) Hacks Lab</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Scientifically backed, low-cost and zero-cost household interventions to slash indoor PM2.5 and volatile toxins.
        </p>
      </div>

      {/* Category Pills Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Hacks Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHacks.map((hack) => {
          const isExpanded = expandedId === hack.id;

          return (
            <div
              key={hack.id}
              className={`p-5 rounded-2xl border transition-all ${
                isExpanded
                  ? 'bg-slate-900 border-cyan-500/40 shadow-lg shadow-cyan-950/20'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                      {hack.category}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center space-x-1">
                      <DollarSign className="w-3 h-3" />
                      <span>{hack.cost}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-amber-400 flex items-center space-x-1">
                      <Award className="w-3 h-3" />
                      <span>{hack.effort}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{hack.title}</h3>
                </div>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : hack.id)}
                  aria-label={isExpanded ? "Collapse hack instructions" : "Expand hack instructions"}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {hack.description}
              </p>

              <div className="mt-3 py-1.5 px-2.5 rounded-lg bg-slate-950/70 border border-slate-800/70 text-[11px] text-cyan-300 flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span><strong>Efficiency:</strong> {hack.effectiveness}</span>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3.5 text-xs">
                  {/* Scientific Backing */}
                  <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-cyan-100 flex items-start space-x-2">
                    <FlaskConical className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-cyan-300 block mb-0.5">Scientific Validation:</strong>
                      <span className="text-slate-300 text-[11px] leading-relaxed">{hack.scientificBacking}</span>
                    </div>
                  </div>

                  {/* Materials */}
                  <div>
                    <strong className="text-slate-200 block mb-1 font-semibold">Materials Needed:</strong>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-400 text-[11px]">
                      {hack.materials.map((mat, i) => (
                        <li key={i} className="flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>{mat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Step by Step Instructions */}
                  <div>
                    <strong className="text-slate-200 block mb-1.5 font-semibold">Step-by-Step Instructions:</strong>
                    <ol className="space-y-1.5 text-slate-300 text-[11px]">
                      {hack.instructions.map((step, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="font-bold text-cyan-400 font-mono">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
