import React, { useState } from 'react';
import { Gauge, Clock, Network, Layers, BarChart2 } from 'lucide-react';
import { LatencyMetrics } from './LatencyMetrics';
import { CommunicationMetrics } from './CommunicationMetrics';
import { BaselineComparison } from './BaselineComparison';
import { AblationStudy } from './AblationStudy';

export const PerformancePage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'LATENCY' | 'COMMUNICATION' | 'BASELINES' | 'ABLATION'>('LATENCY');

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Research Evaluation & Benchmarks
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">
            System Performance & Comparative Baselines
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Empirical latency distributions, bandwidth scaling models, baseline comparisons, and ablation analyses.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('LATENCY')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'LATENCY'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Latency (P50/P95)
          </button>
          <button
            onClick={() => setActiveSubTab('COMMUNICATION')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'COMMUNICATION'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Communication
          </button>
          <button
            onClick={() => setActiveSubTab('BASELINES')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'BASELINES'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Baselines (HE vs SMPC)
          </button>
          <button
            onClick={() => setActiveSubTab('ABLATION')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'ABLATION'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ablation Study
          </button>
        </div>
      </div>

      {/* Subtab Views */}
      {activeSubTab === 'LATENCY' && <LatencyMetrics />}
      {activeSubTab === 'COMMUNICATION' && <CommunicationMetrics />}
      {activeSubTab === 'BASELINES' && <BaselineComparison />}
      {activeSubTab === 'ABLATION' && <AblationStudy />}
    </div>
  );
};
