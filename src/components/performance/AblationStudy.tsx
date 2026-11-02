import React, { useState } from 'react';
import { Layers, Sparkles, CheckCircle2, XCircle, ArrowRight, Gauge } from 'lucide-react';
import { ABLATION_CONFIGS } from '../../data/benchmarkResults';
import { AblationConfig } from '../../types';

export const AblationStudy: React.FC = () => {
  const [selectedConfigId, setSelectedConfigId] = useState<string>('CONFIG_D');
  const selectedConfig = ABLATION_CONFIGS.find((c) => c.id === selectedConfigId) || ABLATION_CONFIGS[3];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
        <span className="font-bold text-white block mb-0.5">
          Ablation Study: What Does Each Research Novelty Contribute?
        </span>
        <p className="text-slate-400">
          Systematically activating each novelty module isolates its impact on latency, communication load, fault tolerance, and cryptographic verification.
        </p>
      </div>

      {/* Selectable Configuration Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {ABLATION_CONFIGS.map((config) => {
          const isSelected = selectedConfig.id === config.id;

          return (
            <button
              key={config.id}
              onClick={() => setSelectedConfigId(config.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-cyan-950 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-cyan-400">{config.id.replace('_', ' ')}</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
              </div>

              <h4 className="font-bold text-xs text-slate-100 mb-1">{config.name}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">{config.description}</p>
            </button>
          );
        })}
      </div>

      {/* Deep-Dive Inspector for Selected Configuration */}
      <div className="p-5 rounded-xl bg-slate-950 border border-cyan-900/60 shadow-[0_0_20px_rgba(6,182,212,0.1)] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
              Active Configuration Metrics
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">{selectedConfig.name}</h3>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            Latency: {selectedConfig.latencyMs} ms
          </span>
        </div>

        {/* Feature Matrix Checkmarks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className={`p-3 rounded-lg border flex items-center gap-2 ${
            selectedConfig.hasSMPC ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}>
            {selectedConfig.hasSMPC ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4" />}
            <span>SMPC Secret Sharing</span>
          </div>

          <div className={`p-3 rounded-lg border flex items-center gap-2 ${
            selectedConfig.hasSharding ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}>
            {selectedConfig.hasSharding ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4" />}
            <span>Dynamic Sharding</span>
          </div>

          <div className={`p-3 rounded-lg border flex items-center gap-2 ${
            selectedConfig.hasDP ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}>
            {selectedConfig.hasDP ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4" />}
            <span>Adaptive DP (ε)</span>
          </div>

          <div className={`p-3 rounded-lg border flex items-center gap-2 ${
            selectedConfig.hasVerification ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}>
            {selectedConfig.hasVerification ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4" />}
            <span>HMAC Verification</span>
          </div>
        </div>

        {/* Empirical Measurements Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono text-slate-300 border-t border-slate-800">
          <div>
            <span className="text-slate-500 block text-[10px]">BANDWIDTH (KB)</span>
            <span className="font-bold text-white text-sm">{selectedConfig.communicationKb} KB</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">AVAILABILITY</span>
            <span className="font-bold text-emerald-400 text-sm">{selectedConfig.availabilityPct}%</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">F1-SCORE</span>
            <span className="font-bold text-cyan-300 text-sm">{(selectedConfig.accuracyF1 * 100).toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">INTEGRITY CHECK</span>
            <span className={`font-bold text-sm ${selectedConfig.integrityVerified ? 'text-emerald-400' : 'text-slate-500'}`}>
              {selectedConfig.integrityVerified ? 'VERIFIED' : 'NONE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
