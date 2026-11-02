import React from 'react';
import { CheckCircle2, Loader2, Lock, Cpu, Layers, ShieldCheck, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

export type PipelineStage = 
  | 'IDLE'
  | 'LOCAL_SCORING'
  | 'SECRET_SHARING'
  | 'DYNAMIC_SHARDING'
  | 'SECURE_AGGREGATION'
  | 'VERIFICATION'
  | 'DIFFERENTIAL_PRIVACY'
  | 'FINAL_DECISION';

interface PipelineAnimatorProps {
  currentStage: PipelineStage;
  verificationPassed?: boolean;
  tamperDetected?: boolean;
}

const STAGES: { id: PipelineStage; label: string; icon: any; order: number }[] = [
  { id: 'LOCAL_SCORING', label: '1. Local ML Scoring', icon: Cpu, order: 1 },
  { id: 'SECRET_SHARING', label: '2. Secret Sharing', icon: Lock, order: 2 },
  { id: 'DYNAMIC_SHARDING', label: '3. Dynamic Sharding', icon: Layers, order: 3 },
  { id: 'SECURE_AGGREGATION', label: '4. SMPC Aggregation', icon: Cpu, order: 4 },
  { id: 'VERIFICATION', label: '5. SHA-256 Verification', icon: ShieldCheck, order: 5 },
  { id: 'DIFFERENTIAL_PRIVACY', label: '6. Adaptive DP', icon: Sparkles, order: 6 },
  { id: 'FINAL_DECISION', label: '7. Fraud Alert Decision', icon: CheckCircle2, order: 7 },
];

export const PipelineAnimator: React.FC<PipelineAnimatorProps> = ({
  currentStage,
  verificationPassed = true,
  tamperDetected = false,
}) => {
  const getStageOrder = (stage: PipelineStage): number => {
    switch (stage) {
      case 'LOCAL_SCORING': return 1;
      case 'SECRET_SHARING': return 2;
      case 'DYNAMIC_SHARDING': return 3;
      case 'SECURE_AGGREGATION': return 4;
      case 'VERIFICATION': return 5;
      case 'DIFFERENTIAL_PRIVACY': return 6;
      case 'FINAL_DECISION': return 7;
      default: return 0;
    }
  };

  const currentOrder = getStageOrder(currentStage);

  return (
    <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-900/40 my-4 shadow-inner">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Live SMPC Cryptographic Pipeline
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          Stage {currentOrder} / 7: {currentStage.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Pipeline Stepper Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
        {STAGES.map((s) => {
          const Icon = s.icon;
          const isCompleted = currentOrder > s.order;
          const isCurrent = currentOrder === s.order;
          const isFailed = isCurrent && s.id === 'VERIFICATION' && tamperDetected;

          return (
            <div
              key={s.id}
              className={`p-2.5 rounded-lg border flex flex-col items-center text-center transition-all duration-300 ${
                isFailed
                  ? 'bg-red-950/80 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-shake'
                  : isCurrent
                  ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : isCompleted
                  ? 'bg-slate-900/90 border-emerald-800/60 text-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <div className="mb-1.5">
                {isFailed ? (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Icon className="w-4 h-4 text-slate-500" />
                )}
              </div>

              <span className="text-[10px] font-semibold tracking-tight leading-tight">
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
