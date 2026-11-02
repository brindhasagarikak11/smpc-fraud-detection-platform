import React from 'react';
import { Network, TrendingDown, Layers, ArrowDownUp } from 'lucide-react';
import { SCALABILITY_DATA } from '../../data/benchmarkResults';

export const CommunicationMetrics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-1">MESSAGES PER TXN</span>
          <span className="text-2xl font-bold text-cyan-300">12 msgs</span>
          <span className="text-[10px] text-slate-400 block mt-1">At N = 3 Banks</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-1">TOTAL BANDWIDTH / TXN</span>
          <span className="text-2xl font-bold text-white">2.25 KB</span>
          <span className="text-[10px] text-emerald-400 block mt-1">Lightweight Share Payload</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-1">AVERAGE MSG SIZE</span>
          <span className="text-2xl font-bold text-purple-300">192 Bytes</span>
          <span className="text-[10px] text-slate-400 block mt-1">128B Share + 64B HMAC</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-1">BANDWIDTH SAVING</span>
          <span className="text-2xl font-bold text-emerald-400">84.3%</span>
          <span className="text-[10px] text-slate-400 block mt-1">vs Naive SMPC at N=50</span>
        </div>
      </div>

      {/* Scalability Table: Banks vs Communication */}
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Participating Banks vs Communication Overhead (Experimental Benchmarks)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-2.5">Bank Count (N)</th>
                <th className="p-2.5">Naive All-to-All (KB)</th>
                <th className="p-2.5">Dynamic Sharded (KB)</th>
                <th className="p-2.5">Bandwidth Reduction</th>
                <th className="p-2.5">Sharded Latency (ms)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/60 text-slate-300">
              {SCALABILITY_DATA.map((row) => {
                const saving = ((row.naiveCommKb - row.shardedCommKb) / Math.max(1, row.naiveCommKb)) * 100;
                return (
                  <tr key={row.banks}>
                    <td className="p-2.5 font-bold text-white">{row.banks} Banks</td>
                    <td className="p-2.5 text-red-300">{row.naiveCommKb} KB</td>
                    <td className="p-2.5 text-emerald-300 font-bold">{row.shardedCommKb} KB</td>
                    <td className="p-2.5 text-cyan-400 font-bold">{saving.toFixed(1)}%</td>
                    <td className="p-2.5 text-purple-300">{row.shardedSmpcMs} ms</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
