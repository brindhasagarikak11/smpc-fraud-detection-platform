import React, { useState } from 'react';
import { Sparkles, Users, Layers, Lock, ShieldCheck } from 'lucide-react';
import { ThresholdSharingView } from './ThresholdSharingView';
import { DynamicShardingView } from './DynamicShardingView';
import { DifferentialPrivacyView } from './DifferentialPrivacyView';
import { VerifiableAggregationView } from './VerifiableAggregationView';
import { NoveltyBadge } from '../common/NoveltyBadge';

export const NoveltiesHub: React.FC = () => {
  const [activeNovelty, setActiveNovelty] = useState<number>(1);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-mono font-bold text-xs border border-cyan-800">
              CORE CONTRIBUTIONS
            </span>
            <span className="text-xs font-mono text-slate-400">REVIEW 1 ALIGNMENT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            The 4 Novel Research Contributions
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Addressing the 5 fundamental gaps in interbank fraud scoring: communication explosion, heavy cryptographic latency, scalability bottlenecks, output leakage, and lack of Byzantine integrity verification.
          </p>
        </div>

        {/* Tab Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <button
            onClick={() => setActiveNovelty(1)}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeNovelty === 1
                ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold text-cyan-400">★ NOVELTY 1</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-200">Adaptive Threshold Sharing</h3>
            <span className="text-[10px] text-slate-400">Quorum Fault Tolerance</span>
          </button>

          <button
            onClick={() => setActiveNovelty(2)}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeNovelty === 2
                ? 'bg-blue-500/20 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold text-blue-400">★ NOVELTY 2</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-200">Dynamic SMPC Sharding</h3>
            <span className="text-[10px] text-slate-400">O(N·k) Communication</span>
          </button>

          <button
            onClick={() => setActiveNovelty(3)}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeNovelty === 3
                ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold text-emerald-400">★ NOVELTY 3</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-200">Adaptive Differential Privacy</h3>
            <span className="text-[10px] text-slate-400">Calibrated Laplace Noise</span>
          </button>

          <button
            onClick={() => setActiveNovelty(4)}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeNovelty === 4
                ? 'bg-purple-500/20 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold text-purple-400">★ NOVELTY 4</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-200">Verifiable Commitments</h3>
            <span className="text-[10px] text-slate-400">HMAC Tamper Detection</span>
          </button>
        </div>
      </div>

      {/* Selected Novelty Component View */}
      {activeNovelty === 1 && <ThresholdSharingView />}
      {activeNovelty === 2 && <DynamicShardingView />}
      {activeNovelty === 3 && <DifferentialPrivacyView />}
      {activeNovelty === 4 && <VerifiableAggregationView />}
    </div>
  );
};
