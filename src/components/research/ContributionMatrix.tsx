import React from 'react';
import { Sparkles, Users, Layers, Lock, ShieldCheck } from 'lucide-react';
import { NoveltyBadge } from '../common/NoveltyBadge';

export const ContributionMatrix: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      {/* Novelty 1 */}
      <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/60 space-y-2">
        <div className="flex items-center justify-between">
          <NoveltyBadge number={1} size="sm" />
          <Users className="w-4 h-4 text-cyan-400" />
        </div>
        <h4 className="text-xs font-bold text-white">Adaptive Threshold Secret Sharing</h4>
        <div className="text-[11px] text-slate-300 space-y-1">
          <p><strong>Problem Solved:</strong> Participant dropout tolerance & uninterrupted reconstruction.</p>
          <p className="text-cyan-300 font-mono">Metric: 100% availability up to 40% dropout rate.</p>
        </div>
      </div>

      {/* Novelty 2 */}
      <div className="p-4 rounded-xl bg-slate-950 border border-blue-900/60 space-y-2">
        <div className="flex items-center justify-between">
          <NoveltyBadge number={2} size="sm" />
          <Layers className="w-4 h-4 text-blue-400" />
        </div>
        <h4 className="text-xs font-bold text-white">Dynamic SMPC Sharding</h4>
        <div className="text-[11px] text-slate-300 space-y-1">
          <p><strong>Problem Solved:</strong> Quadratic communication coordination overhead in large consortiums.</p>
          <p className="text-blue-300 font-mono">Metric: 84.3% bandwidth reduction at 50 banks.</p>
        </div>
      </div>

      {/* Novelty 3 */}
      <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/60 space-y-2">
        <div className="flex items-center justify-between">
          <NoveltyBadge number={3} size="sm" />
          <Lock className="w-4 h-4 text-emerald-400" />
        </div>
        <h4 className="text-xs font-bold text-white">Adaptive Differential Privacy</h4>
        <div className="text-[11px] text-slate-300 space-y-1">
          <p><strong>Problem Solved:</strong> Aggregate-output residual leakage & privacy-utility trade-off.</p>
          <p className="text-emerald-300 font-mono">Metric: Mean score error of 1.12 pts at ε = 1.0 with 94.6% F1.</p>
        </div>
      </div>

      {/* Novelty 4 */}
      <div className="p-4 rounded-xl bg-slate-950 border border-purple-900/60 space-y-2">
        <div className="flex items-center justify-between">
          <NoveltyBadge number={4} size="sm" />
          <ShieldCheck className="w-4 h-4 text-purple-400" />
        </div>
        <h4 className="text-xs font-bold text-white">Verifiable Commitments</h4>
        <div className="text-[11px] text-slate-300 space-y-1">
          <p><strong>Problem Solved:</strong> Active in-flight share tampering & malicious Byzantine manipulation.</p>
          <p className="text-purple-300 font-mono">Metric: 100% tamper detection rate & instant round abortion.</p>
        </div>
      </div>
    </div>
  );
};
