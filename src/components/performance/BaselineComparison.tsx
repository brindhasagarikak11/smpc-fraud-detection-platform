import React from 'react';
import { Layers, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Info, Zap } from 'lucide-react';
import { BASELINE_METHODS } from '../../data/benchmarkResults';

export const BaselineComparison: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-white block mb-0.5">Fair Baseline Benchmark Protocol</span>
          <p className="text-slate-400">
            All 4 protocols evaluated under identical synthetic transactions, 3 participating banks, and same compute environment.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono font-semibold whitespace-nowrap">
          SIMULATED EXPERIMENTAL BENCHMARK
        </span>
      </div>

      {/* Comparative Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono text-left border border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-3">Method Name</th>
              <th className="p-3">Privacy Guarantee</th>
              <th className="p-3">Raw Scores Leaked</th>
              <th className="p-3">Latency (ms)</th>
              <th className="p-3">Bandwidth (KB)</th>
              <th className="p-3">Verification</th>
              <th className="p-3">Dropout Tolerance</th>
              <th className="p-3">F1-Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/60 text-slate-300">
            {BASELINE_METHODS.map((method) => {
              const isProposed = method.id === 'BASE-4';

              return (
                <tr
                  key={method.id}
                  className={`transition-colors ${
                    isProposed ? 'bg-cyan-950/40 text-cyan-200 font-semibold' : 'hover:bg-slate-900/40'
                  }`}
                >
                  <td className="p-3">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {isProposed && <Zap className="w-3.5 h-3.5 text-cyan-400 fill-current" />}
                      <span>{method.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">{method.category}</span>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        method.privacyScore > 90
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : method.privacyScore > 50
                          ? 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}
                    >
                      {method.privacyScore} / 100
                    </span>
                  </td>

                  <td className="p-3">
                    {method.individualScoreExposure > 0 ? (
                      <span className="text-red-400 font-bold">
                        ⚠ {method.individualScoreExposure} Scores Exposed
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold">✓ 0 Scores (Protected)</span>
                    )}
                  </td>

                  <td className="p-3">
                    <span
                      className={`font-bold ${
                        method.latencyMs < 50 ? 'text-emerald-400' : method.latencyMs < 100 ? 'text-yellow-400' : 'text-red-400'
                      }`}
                    >
                      {method.latencyMs} ms
                    </span>
                  </td>

                  <td className="p-3 text-slate-300">{method.communicationKb} KB</td>

                  <td className="p-3">
                    {method.verificationSupported ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Supported
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> None
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    {method.faultToleranceSupported ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> 0% (Fails)
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-cyan-300 font-bold">
                    {(method.f1Score * 100).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
