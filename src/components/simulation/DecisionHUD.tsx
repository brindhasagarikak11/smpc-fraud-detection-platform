import React from 'react';
import { ShieldCheck, ShieldAlert, AlertOctagon, CheckCircle2, Clock, Lock, Sparkles, Layers, Activity } from 'lucide-react';
import { SimulationResult } from '../../types';

interface DecisionHUDProps {
  result: SimulationResult;
}

export const DecisionHUD: React.FC<DecisionHUDProps> = ({ result }) => {
  const isCritical = result.riskLevel === 'CRITICAL';
  const isHigh = result.riskLevel === 'HIGH';
  const isMedium = result.riskLevel === 'MEDIUM';
  const isSafe = result.riskLevel === 'SAFE';

  const riskColor = isCritical
    ? 'text-red-400 bg-red-950/80 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
    : isHigh
    ? 'text-orange-400 bg-orange-950/80 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)]'
    : isMedium
    ? 'text-yellow-400 bg-yellow-950/80 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]'
    : 'text-emerald-400 bg-emerald-950/80 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]';

  const progressColor = isCritical
    ? 'bg-gradient-to-r from-orange-500 to-red-600'
    : isHigh
    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
    : isMedium
    ? 'bg-gradient-to-r from-teal-500 to-yellow-500'
    : 'bg-gradient-to-r from-cyan-500 to-emerald-500';

  return (
    <div className={`p-6 rounded-2xl border transition-all duration-500 ${riskColor} my-6`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Large Visual Score Meter */}
        <div className="lg:col-span-6 flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              AGGREGATED INTERBANK FRAUD RISK
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-cyan-300 border border-slate-700">
              HMAC Token: {result.customerToken}
            </span>
          </div>

          {/* Large Numerical Score */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white font-mono">
              {result.dpAggregateRisk.toFixed(2)}
            </span>
            <span className="text-xl text-slate-400 font-mono">/ 100</span>
          </div>

          {/* Score Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-800 mb-4">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${progressColor}`}
              style={{ width: `${Math.min(100, Math.max(5, result.dpAggregateRisk))}%` }}
            />
          </div>

          {/* Decision Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold text-sm sm:text-base ${
              result.decision === 'FRAUD_ALERT'
                ? 'bg-red-500 text-slate-950 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse'
                : result.decision === 'MANUAL_REVIEW'
                ? 'bg-yellow-500 text-slate-950 border-yellow-400'
                : 'bg-emerald-500 text-slate-950 border-emerald-400'
            }`}>
              {result.decision === 'FRAUD_ALERT' ? (
                <>
                  <ShieldAlert className="w-5 h-5 fill-current" />
                  <span>🚨 FRAUD ALERT — TRANSACTION BLOCKED</span>
                </>
              ) : result.decision === 'MANUAL_REVIEW' ? (
                <>
                  <AlertOctagon className="w-5 h-5 fill-current" />
                  <span>⚠ SUSPICIOUS — MANUAL REVIEW REQUIRED</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 fill-current" />
                  <span>🛡 SAFE TRANSACTION — AUTHORIZED</span>
                </>
              )}
            </div>

            <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              Confidence: <strong>{result.confidenceScore}%</strong>
            </span>
          </div>
        </div>

        {/* Right: Security Guarantees & Near-Real-Time Latency Breakdown */}
        <div className="lg:col-span-6 bg-slate-950/90 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              Measured Latency Breakdown
            </span>
            <span className="font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              Total: {result.latencyBreakdown.totalLatencyMs.toFixed(1)} ms
            </span>
          </div>

          {/* Latency Waterfall Items */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
            <div className="flex justify-between bg-slate-900/80 px-2 py-1 rounded">
              <span className="text-slate-400">Local Scoring:</span>
              <span className="text-cyan-300">{result.latencyBreakdown.localScoringMs.toFixed(1)} ms</span>
            </div>
            <div className="flex justify-between bg-slate-900/80 px-2 py-1 rounded">
              <span className="text-slate-400">Tokenization:</span>
              <span className="text-cyan-300">{result.latencyBreakdown.tokenizationMs.toFixed(1)} ms</span>
            </div>
            <div className="flex justify-between bg-slate-900/80 px-2 py-1 rounded">
              <span className="text-slate-400">Secret Sharing:</span>
              <span className="text-cyan-300">{result.latencyBreakdown.shareGenerationMs.toFixed(1)} ms</span>
            </div>
            <div className="flex justify-between bg-slate-900/80 px-2 py-1 rounded">
              <span className="text-slate-400">Sharding Coord:</span>
              <span className="text-cyan-300">{result.latencyBreakdown.shardingMs.toFixed(1)} ms</span>
            </div>
            <div className="flex justify-between bg-slate-900/80 px-2 py-1 rounded">
              <span className="text-slate-400">Communication:</span>
              <span className="text-cyan-300">{result.latencyBreakdown.communicationMs.toFixed(1)} ms</span>
            </div>
            <div className="flex justify-between bg-slate-900/80 px-2 py-1 rounded">
              <span className="text-slate-400">SMPC Aggregation:</span>
              <span className="text-cyan-300">{result.latencyBreakdown.secureAggregationMs.toFixed(1)} ms</span>
            </div>
            <div className="flex justify-between bg-slate-900/80 px-2 py-1 rounded">
              <span className="text-slate-400">Verification:</span>
              <span className="text-cyan-300">{result.latencyBreakdown.verificationMs.toFixed(1)} ms</span>
            </div>
            <div className="flex justify-between bg-slate-900/80 px-2 py-1 rounded">
              <span className="text-slate-400">DP Noise (ε):</span>
              <span className="text-cyan-300">{result.latencyBreakdown.dpPerturbationMs.toFixed(1)} ms</span>
            </div>
          </div>

          {/* Verification & Privacy Badges */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verification: {result.verificationPassed ? 'PASSED (Hash Authentic)' : 'FAILED (Tamper Detected)'}
            </span>
            <span className="flex items-center gap-1 text-cyan-400 font-semibold">
              <Lock className="w-3.5 h-3.5" />
              Score Privacy: ZERO RAW SCORES LEAKED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
