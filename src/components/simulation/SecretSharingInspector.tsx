import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Key, Shield, HelpCircle, Sparkles } from 'lucide-react';
import { SecretShare } from '../../types';

interface SecretSharingInspectorProps {
  shares: SecretShare[];
  educationalDebugMode: boolean;
  participantCount: number;
}

export const SecretSharingInspector: React.FC<SecretSharingInspectorProps> = ({
  shares,
  educationalDebugMode,
  participantCount,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 my-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Cryptographic Secret Shares Breakdown
            </span>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Illustrative Secret Shares
            </span>
          </div>
          <h3 className="text-sm font-bold text-white mt-0.5">
            Information-Theoretic Secret Decomposition
          </h3>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>{showExplanation ? 'Hide Math' : 'How Shares Work'}</span>
        </button>
      </div>

      {/* Educational Explanation Banner */}
      {showExplanation && (
        <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-800/60 text-xs text-slate-300 mb-4 animate-fade-in space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Mathematical Invariant: Zero Knowledge per Single Share</span>
          </div>
          <p className="leading-relaxed">
            A score S in a prime field is represented as S = (r₁ + r₂ + … + rₙ) mod p. Each random share is independently generated. With all but the final share available, the missing share is still required to reconstruct S.
          </p>
          <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-cyan-200 border border-slate-800">
            Reconstruction Invariant: Σ Shareᵢ ≡ Scaled Aggregate Score (mod 2³¹ − 1)
          </div>
        </div>
      )}

      {/* Shares Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
        {shares.map((s, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                Share {idx + 1} ({s.participantId})
              </span>
              <span className="text-[10px] text-slate-400">Idx: #{s.shareIndex}</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Numeric Share:</span>
                <span className="text-white font-bold">{s.shareValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Commitment Hash:</span>
                <span className="text-cyan-300 truncate max-w-[110px]" title={s.commitmentHash}>
                  {s.commitmentHash.substring(0, 8)}...{s.commitmentHash.substring(56)}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                <span>Information Leakage:</span>
                <span className="text-emerald-400 font-semibold">0 bits (Uniform Random)</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Note */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          Individual share values independently cannot reveal the underlying bank score.
        </span>
        <span className="text-cyan-400 font-mono text-[11px]">
          Total Shares in Transit: {shares.length}
        </span>
      </div>
    </div>
  );
};
