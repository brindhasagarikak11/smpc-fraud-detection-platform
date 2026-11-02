import React from 'react';
import { Layers, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { RESEARCH_GAPS } from '../../data/researchData';

interface GapNoveltyMatrixProps {
  onNavigateToPage?: (page: string) => void;
}

export const GapNoveltyMatrix: React.FC<GapNoveltyMatrixProps> = ({ onNavigateToPage }) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 my-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Review 1 Research Alignment
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Research Gap → Proposed Novelty → Experimental Metric Matrix
          </h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono text-left border border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-3">Identified Research Gap (Review 1)</th>
              <th className="p-3 text-red-400">Traditional Limitation</th>
              <th className="p-3 text-cyan-300">Our Proposed Novel Response</th>
              <th className="p-3 text-emerald-400">Target Experimental Metric</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/60 text-slate-300">
            {RESEARCH_GAPS.map((gap) => (
              <tr key={gap.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="p-3 font-bold text-white">
                  <span className="text-cyan-400 block text-[10px]">{gap.id}</span>
                  <span>{gap.gapName}</span>
                </td>
                <td className="p-3 text-red-300/90 leading-relaxed max-w-[220px]">
                  {gap.traditionalLimitation}
                </td>
                <td className="p-3 text-cyan-200 leading-relaxed max-w-[240px]">
                  {gap.ourNovelResponse}
                </td>
                <td className="p-3 text-emerald-300 font-semibold max-w-[200px]">
                  {gap.experimentalMetric}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
