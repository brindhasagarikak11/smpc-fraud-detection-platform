import React, { useState } from 'react';
import { Lock, Sparkles, Sliders, Activity, Shield, Info, ArrowRight } from 'lucide-react';
import { applyAdaptiveDifferentialPrivacy } from '../../crypto-engine/differentialPrivacy';
import { DP_EPSILON_CURVE } from '../../data/benchmarkResults';

export const DifferentialPrivacyView: React.FC = () => {
  const [epsilon, setEpsilon] = useState<number>(1.0);
  const [rawScore, setRawScore] = useState<number>(82.41);
  const [bankCount, setBankCount] = useState<number>(3);

  const dpResult = applyAdaptiveDifferentialPrivacy(rawScore, bankCount, {
    epsilon,
    clippingBound: 100,
  });

  const absError = Math.abs(dpResult.dpProtectedScore - rawScore);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono font-bold text-xs">
              ★ NOVELTY 3
            </span>
            <span className="text-xs font-mono text-slate-400">OUTPUT PRIVACY & RESIDUAL SHIELDING</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Adaptive Differential Privacy (ε-Tradeoff)</h2>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-mono font-bold">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Laplace Noise Scale: b = {dpResult.noiseScale}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Privacy Budget (ε):</span>
            <span className="font-mono text-emerald-400 font-bold">{epsilon.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={epsilon}
            onChange={(e) => setEpsilon(Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>0.1 (Max Privacy)</span>
            <span>5.0 (Max Utility)</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Raw Secure Aggregate:</span>
            <span className="font-mono text-cyan-300 font-bold">{rawScore.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="10"
            max="95"
            step="0.5"
            value={rawScore}
            onChange={(e) => setRawScore(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Consortium Size (N):</span>
            <span className="font-mono text-purple-300 font-bold">{bankCount} Banks</span>
          </div>
          <input
            type="range"
            min="2"
            max="20"
            value={bankCount}
            onChange={(e) => setBankCount(Number(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Numerical Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-1">RAW SECURE AGGREGATE</span>
          <span className="text-2xl font-bold text-white">{rawScore.toFixed(2)}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Pre-DP exact mathematical mean</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-emerald-800/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <span className="text-emerald-400 block text-[11px] font-bold mb-1">DP PROTECTED RESULT</span>
          <span className="text-2xl font-bold text-emerald-300">{dpResult.dpProtectedScore.toFixed(2)}</span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Perturbation: {dpResult.noiseAdded >= 0 ? `+${dpResult.noiseAdded}` : dpResult.noiseAdded} pts
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-1">ABSOLUTE ERROR (|DP - Raw|)</span>
          <span className="text-2xl font-bold text-cyan-300">{absError.toFixed(2)}</span>
          <span className="text-[10px] text-slate-500 block mt-1">
            Sensitivity: Δf = {dpResult.sensitivity} (100 / {bankCount})
          </span>
        </div>
      </div>

      {/* Visual Metric Gauges */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        {/* Privacy Assurance Bar */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-emerald-400 font-bold">MATHEMATICAL PRIVACY ASSURANCE:</span>
            <span className="text-emerald-300 font-bold">{dpResult.privacyLevelScore}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${dpResult.privacyLevelScore}%` }}
            />
          </div>
        </div>

        {/* Utility Retention Bar */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-cyan-400 font-bold">FRAUD CLASSIFICATION UTILITY:</span>
            <span className="text-cyan-300 font-bold">{dpResult.utilityScore}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${dpResult.utilityScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Empirical Epsilon Sweep Table */}
      <div>
        <span className="text-xs font-mono font-bold text-slate-300 block mb-2">
          Empirical Epsilon Sweep Benchmarks:
        </span>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-2.5">Budget ε</th>
                <th className="p-2.5">Mean Score Error</th>
                <th className="p-2.5">Noise Std (b)</th>
                <th className="p-2.5">F1-Score</th>
                <th className="p-2.5">Privacy Assurance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/60 text-slate-300">
              {DP_EPSILON_CURVE.map((row) => (
                <tr key={row.epsilon} className={row.epsilon === epsilon ? 'bg-emerald-950/40 text-emerald-300 font-bold' : ''}>
                  <td className="p-2.5 font-bold">ε = {row.epsilon}</td>
                  <td className="p-2.5">{row.meanAbsoluteError} pts</td>
                  <td className="p-2.5">{row.noiseStd}</td>
                  <td className="p-2.5 text-cyan-300">{(row.f1Score * 100).toFixed(1)}%</td>
                  <td className="p-2.5 text-emerald-400">{row.privacyAssurance}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
