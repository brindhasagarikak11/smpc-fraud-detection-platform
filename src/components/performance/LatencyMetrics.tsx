import React from 'react';
import { Clock, Activity, Gauge, TrendingUp, CheckCircle } from 'lucide-react';

export const LatencyMetrics: React.FC = () => {
  const latencyStages = [
    { name: 'Local Bank Scoring (ML)', durationMs: 7.4, pct: 19.7, color: 'bg-cyan-500' },
    { name: 'HMAC Tokenization', durationMs: 1.2, pct: 3.2, color: 'bg-blue-400' },
    { name: 'Secret Share Generation', durationMs: 4.5, pct: 12.0, color: 'bg-indigo-500' },
    { name: 'Dynamic Sharding Routing', durationMs: 2.6, pct: 6.9, color: 'bg-purple-500' },
    { name: 'Encrypted WAN Transit', durationMs: 10.8, pct: 28.7, color: 'bg-emerald-500' },
    { name: 'SMPC Secure Aggregation', durationMs: 5.2, pct: 13.8, color: 'bg-teal-500' },
    { name: 'SHA-256 HMAC Verification', durationMs: 3.6, pct: 9.6, color: 'bg-amber-500' },
    { name: 'Adaptive DP Perturbation', durationMs: 1.5, pct: 4.0, color: 'bg-pink-500' },
    { name: 'Decision Engine & Audit', durationMs: 0.8, pct: 2.1, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Latency Percentiles Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-1">AVERAGE LATENCY</span>
          <span className="text-2xl font-bold text-cyan-300">36.8 ms</span>
          <span className="text-[10px] text-emerald-400 block mt-1">✓ Near-Real-Time Target Met</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-1">P50 MEDIAN LATENCY</span>
          <span className="text-2xl font-bold text-white">34.2 ms</span>
          <span className="text-[10px] text-slate-400 block mt-1">50th Percentile</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-1">P95 LATENCY</span>
          <span className="text-2xl font-bold text-cyan-300">48.5 ms</span>
          <span className="text-[10px] text-slate-400 block mt-1">95th Percentile</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-1">P99 TAIL LATENCY</span>
          <span className="text-2xl font-bold text-purple-300">62.1 ms</span>
          <span className="text-[10px] text-slate-400 block mt-1">99th Percentile SLA Bound</span>
        </div>
      </div>

      {/* Latency Waterfall Breakdown */}
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4" />
            End-to-End Latency Waterfall Breakdown (Total: 37.6 ms)
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Target: Near Real-Time Payment Auth</span>
        </div>

        <div className="space-y-2.5">
          {latencyStages.map((stage) => (
            <div key={stage.name} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">{stage.name}</span>
                <span className="text-white font-bold">
                  {stage.durationMs} ms ({stage.pct}%)
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full ${stage.color}`}
                  style={{ width: `${stage.pct * 2.5}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
