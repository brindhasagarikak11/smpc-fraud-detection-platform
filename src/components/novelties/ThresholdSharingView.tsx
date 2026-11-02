import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Users, Sliders, CheckCircle2, XCircle, Sparkles, RefreshCw } from 'lucide-react';
import { generateShamirShares, reconstructShamirSecret } from '../../crypto-engine/shamirThreshold';

export const ThresholdSharingView: React.FC = () => {
  const [totalBanks, setTotalBanks] = useState<number>(5);
  const [threshold, setThreshold] = useState<number>(3);
  const [secretScore, setSecretScore] = useState<number>(82.5);
  const [droppedBankIndices, setDroppedBankIndices] = useState<number[]>([3, 4]); // 2 banks dropped by default

  // Generate polynomial points
  const shares = generateShamirShares('BANK-A', secretScore, threshold, totalBanks);
  const activeShares = shares.filter((_, idx) => !droppedBankIndices.includes(idx));
  const reconstruction = reconstructShamirSecret(activeShares, threshold);
  const isQuorumSatisfied = activeShares.length >= threshold;

  const toggleBankDropout = (idx: number) => {
    if (droppedBankIndices.includes(idx)) {
      setDroppedBankIndices(droppedBankIndices.filter((i) => i !== idx));
    } else {
      setDroppedBankIndices([...droppedBankIndices, idx]);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono font-bold text-xs">
              ★ NOVELTY 1
            </span>
            <span className="text-xs font-mono text-slate-400">FAULT TOLERANCE & RECONSTRUCTION</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Adaptive (t, n) Threshold Secret Sharing</h2>
        </div>

        <div className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-2 ${
          isQuorumSatisfied
            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            : 'bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
        }`}>
          {isQuorumSatisfied ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>✓ THRESHOLD SATISFIED ({activeShares.length} / {threshold} required)</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-red-400" />
              <span>✕ AGGREGATION BLOCKED ({activeShares.length} &lt; {threshold})</span>
            </>
          )}
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Total Participants (n):</span>
            <span className="font-mono text-cyan-300 font-bold">{totalBanks} Banks</span>
          </div>
          <input
            type="range"
            min="3"
            max="10"
            value={totalBanks}
            onChange={(e) => {
              const val = Number(e.target.value);
              setTotalBanks(val);
              if (threshold > val) setThreshold(val);
            }}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Quorum Threshold (t):</span>
            <span className="font-mono text-cyan-300 font-bold">{threshold} Shares</span>
          </div>
          <input
            type="range"
            min="2"
            max={totalBanks}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Secret Score Value:</span>
            <span className="font-mono text-cyan-300 font-bold">{secretScore.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="10"
            max="95"
            step="0.5"
            value={secretScore}
            onChange={(e) => setSecretScore(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Bank Nodes Dropout Interactive Grid */}
      <div>
        <span className="text-xs font-mono font-bold text-slate-300 block mb-3">
          Interactive Participant Grid (Click any bank to toggle online/offline state):
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {shares.map((share, idx) => {
            const isDropped = droppedBankIndices.includes(idx);
            const bankLetter = String.fromCharCode(65 + idx);

            return (
              <button
                key={idx}
                onClick={() => toggleBankDropout(idx)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isDropped
                    ? 'bg-slate-950 border-red-900/60 opacity-60 text-slate-500 hover:border-red-600'
                    : 'bg-slate-950 border-cyan-500/40 text-slate-200 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:border-cyan-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs">Bank {bankLetter}</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isDropped ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'
                  }`}>
                    {isDropped ? 'OFFLINE' : 'ONLINE'}
                  </span>
                </div>

                <div className="text-[11px] font-mono space-y-1">
                  <div className="text-slate-400">Share (x, y):</div>
                  <div className="text-cyan-300 truncate">
                    ({share.x}, {isDropped ? 'DROPPED' : share.y})
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secret Reconstruction Output Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono ${
        isQuorumSatisfied
          ? 'bg-cyan-950/40 border-cyan-800 text-cyan-200'
          : 'bg-red-950/40 border-red-900 text-red-200'
      }`}>
        <div>
          <span className="font-bold block text-sm">
            {isQuorumSatisfied ? '✓ Polynomial Reconstruction Success' : '✕ Aggregation Blocked (Quorum Not Met)'}
          </span>
          <span className="text-slate-400 text-xs">
            {isQuorumSatisfied
              ? `Reconstructed with ${activeShares.length} shares via Lagrange polynomial interpolation at x = 0`
              : `Received ${activeShares.length} shares, but minimum required quorum is ${threshold}`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">RECONSTRUCTED SCORE</span>
            <span className="text-lg font-bold text-white font-mono">
              {isQuorumSatisfied ? reconstruction.secret.toFixed(2) : 'BLOCKED'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
