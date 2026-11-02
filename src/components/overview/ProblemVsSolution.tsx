import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, ShieldAlert, ShieldCheck, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';

export const ProblemVsSolution: React.FC = () => {
  const [viewMode, setViewMode] = useState<'SIDE_BY_SIDE' | 'TRADITIONAL' | 'PROPOSED'>('SIDE_BY_SIDE');

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 my-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Comparative Problem Analysis
          </span>
          <h2 className="text-xl font-bold text-white">Traditional Centralized Pooling vs Proposed SMPC Protocol</h2>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('SIDE_BY_SIDE')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              viewMode === 'SIDE_BY_SIDE' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setViewMode('TRADITIONAL')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              viewMode === 'TRADITIONAL' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Traditional
          </button>
          <button
            onClick={() => setViewMode('PROPOSED')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              viewMode === 'PROPOSED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Proposed SMPC
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className={`grid gap-6 ${viewMode === 'SIDE_BY_SIDE' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Traditional Approach Panel */}
        {(viewMode === 'SIDE_BY_SIDE' || viewMode === 'TRADITIONAL') && (
          <div className="p-5 rounded-xl bg-red-950/20 border border-red-900/50 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-red-950 text-red-400 border-b border-l border-red-800/60 text-[10px] font-mono font-bold rounded-bl-lg">
              INSECURE BASELINE
            </div>

            <div>
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-3">
                <ShieldAlert className="w-5 h-5" />
                <span>Traditional Centralized Data Pooling</span>
              </div>

              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Banks upload raw customer IDs and localized fraud scores directly to a central cloud server. A single data breach exposes all participant data.
              </p>

              {/* Visual Flow diagram */}
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-red-900/40 font-mono text-xs text-slate-300 space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-red-300">Bank A (Score: 84)</span>
                  <span className="text-red-400">─── Raw Score ───&gt;</span>
                  <span className="text-red-400 font-bold">[Central DB]</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-300">Bank B (Score: 78)</span>
                  <span className="text-red-400">─── Raw Score ───&gt;</span>
                  <span className="text-red-400 font-bold">[Central DB]</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-300">Bank C (Score: 92)</span>
                  <span className="text-red-400">─── Raw Score ───&gt;</span>
                  <span className="text-red-400 font-bold">[Central DB]</span>
                </div>
              </div>

              {/* Warning Tags */}
              <div className="space-y-1.5 text-xs text-red-300">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span><strong>High Privacy Risk:</strong> 100% raw scores exposed to third party</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span><strong>Regulatory Violation:</strong> Violates GDPR, DPDP Act & Banking secrecy</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span><strong>Commercial Risk:</strong> Reveals proprietary fraud model capabilities</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-red-900/40 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Raw Scores Exposed:</span>
              <span className="px-2 py-0.5 rounded bg-red-900/60 text-red-300 font-bold">3 / 3 (100% Leaked)</span>
            </div>
          </div>
        )}

        {/* Proposed SMPC Protocol Panel */}
        {(viewMode === 'SIDE_BY_SIDE' || viewMode === 'PROPOSED') && (
          <div className="p-5 rounded-xl bg-cyan-950/20 border border-cyan-800/60 flex flex-col justify-between relative overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-950 text-cyan-400 border-b border-l border-cyan-700/60 text-[10px] font-mono font-bold rounded-bl-lg">
              PROPOSED NOVEL SMPC
            </div>

            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span>Our Proposed SMPC Aggregation Protocol</span>
              </div>

              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Banks convert private local scores into secret shares. Aggregator securely combines blinded shares without ever learning individual bank inputs.
              </p>

              {/* Visual Flow diagram */}
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-cyan-900/40 font-mono text-xs text-slate-300 space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300">Bank A [🔒 HIDDEN]</span>
                  <span className="text-cyan-400">─── 🔐 Share A ───&gt;</span>
                  <span className="text-cyan-400 font-bold">[SMPC Engine]</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300">Bank B [🔒 HIDDEN]</span>
                  <span className="text-cyan-400">─── 🔐 Share B ───&gt;</span>
                  <span className="text-cyan-400 font-bold">[SMPC Engine]</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300">Bank C [🔒 HIDDEN]</span>
                  <span className="text-cyan-400">─── 🔐 Share C ───&gt;</span>
                  <span className="text-cyan-400 font-bold">[SMPC Engine]</span>
                </div>
              </div>

              {/* Benefit Tags */}
              <div className="space-y-1.5 text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>Zero Raw Score Sharing:</strong> Information-theoretically private</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>Interbank Intelligence:</strong> Detects distributed multi-bank fraud patterns</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>Near-Real-Time Execution:</strong> Sub-second payment authorization compatibility</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-cyan-900/40 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Raw Scores Exposed:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-bold">
                0 / 3 (0% Leaked - Protected)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
