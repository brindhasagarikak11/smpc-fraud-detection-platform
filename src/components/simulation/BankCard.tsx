import React from 'react';
import { Shield, Lock, Cpu, Activity, Eye, AlertTriangle } from 'lucide-react';
import { BankNode } from '../../types';

interface BankCardProps {
  bank: BankNode;
  calculatedScore?: number;
  isScoring: boolean;
  isSharing: boolean;
  educationalDebugMode: boolean;
  isDroppedOut?: boolean;
}

export const BankCard: React.FC<BankCardProps> = ({
  bank,
  calculatedScore = 75,
  isScoring,
  isSharing,
  educationalDebugMode,
  isDroppedOut = false,
}) => {
  return (
    <div
      className={`relative p-4 rounded-xl border transition-all duration-300 ${
        isDroppedOut
          ? 'bg-slate-950/60 border-red-900/60 opacity-60'
          : isSharing
          ? 'bg-cyan-950/30 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
          : isScoring
          ? 'bg-blue-950/30 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{bank.avatar}</span>
          <div>
            <h4 className="text-xs font-bold text-white">{bank.name}</h4>
            <span className="text-[10px] font-mono text-slate-400">Node: {bank.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isDroppedOut
                ? 'bg-red-500'
                : bank.status === 'ONLINE'
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-amber-400'
            }`}
          />
          <span className="text-[10px] font-mono font-semibold text-slate-300">
            {isDroppedOut ? 'DROPPED' : bank.status}
          </span>
        </div>
      </div>

      {/* Model Information */}
      <div className="space-y-1.5 text-[11px] mb-3 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
        <div className="flex justify-between text-slate-400">
          <span>Local ML Model:</span>
          <span className="font-mono text-cyan-300 font-medium truncate max-w-[130px]">{bank.localModel}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Accuracy / Latency:</span>
          <span className="font-mono text-slate-200">{bank.localAccuracy}% / {bank.scoringLatencyMs}ms</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Consortium Weight:</span>
          <span className="font-mono text-cyan-400 font-bold">{bank.weight}x</span>
        </div>
      </div>

      {/* Privacy Score Protection Section */}
      <div className="pt-2 border-t border-slate-800">
        {educationalDebugMode ? (
          // Insecure Debug Mode Display
          <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-500/60 text-amber-200">
            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <AlertTriangle className="w-3 h-3" />
                DEBUG LOCAL SCORE:
              </span>
              <span className="font-bold text-amber-300">{calculatedScore} / 100</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${calculatedScore}%` }}
              />
            </div>
            <span className="text-[9px] text-amber-400/80 block mt-1">
              ⚠ Visible in debug mode only
            </span>
          </div>
        ) : (
          // Strict Privacy-Preserving Display
          <div className="p-2.5 rounded-lg bg-slate-950/90 border border-cyan-900/60 text-center">
            <div className="flex items-center justify-center gap-1.5 text-cyan-400 text-xs font-mono font-bold mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>SCORE PROTECTED</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Evaluated locally. Zero raw score transmitted to aggregator or peers.
            </p>
          </div>
        )}
      </div>

      {/* Animated Sending Shares Overlay */}
      {isSharing && (
        <div className="absolute inset-0 bg-cyan-950/80 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-3 text-cyan-300 text-xs font-mono animate-fade-in border border-cyan-400">
          <Lock className="w-5 h-5 mb-1 text-cyan-400 animate-bounce" />
          <span className="font-bold">🔐 Secret Share Generated</span>
          <span className="text-[10px] text-slate-300 mt-1">Dispatched to SMPC coordinator</span>
        </div>
      )}
    </div>
  );
};
