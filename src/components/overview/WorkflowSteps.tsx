import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Lock, Layers, Cpu, ShieldCheck, AlertCircle } from 'lucide-react';

interface Step {
  num: string;
  title: string;
  summary: string;
  details: string;
  icon: any;
  metric: string;
}

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Customer Transaction & Pseudonymization',
    summary: 'A cardholder executes a high-value payment. The system converts raw customer ID into an HMAC token.',
    details: 'The merchant terminal captures transaction parameters (₹ Amount, Merchant Category, Location Geolocation, Device Fingerprint, Velocity). The raw customer account is securely pseudonymized so that consortium banks and the aggregator only observe a deterministic HMAC token.',
    icon: Lock,
    metric: 'PII Exposure: 0%',
  },
  {
    num: '02',
    title: 'Local Bank Fraud Scoring',
    summary: 'Participating banks independently evaluate risk using local ML models behind their firewall.',
    details: 'Bank A (Random Forest), Bank B (Gradient Boosted Trees), and Bank C (Deep MLP) score the transaction against their internal transaction history. Local risk scores (e.g. 84, 79, 91) remain strictly inside the local bank secure enclave and are never transmitted.',
    icon: Cpu,
    metric: 'Local Latency: 6.2 - 8.4 ms',
  },
  {
    num: '03',
    title: 'Secret Sharing & Masking',
    summary: 'Local scores are split into additive or polynomial shares with cryptographic commitments.',
    details: 'Each bank splits its local integer score S_i into N shares such that individual shares are uniform random numbers. Pre-aggregation SHA-256 HMAC commitments C_i are broadcast to bind shares before opening.',
    icon: Lock,
    metric: 'Security: Information-Theoretic',
  },
  {
    num: '04',
    title: 'Dynamic Sharding',
    summary: 'Consortium banks are partitioned into balanced shards to prevent O(N^2) communication bottleneck.',
    details: 'When consortium size exceeds 3-5 institutions, the dynamic sharder clusters nodes into disjoint groups. Intra-shard aggregation runs concurrently in parallel, reducing network bandwidth by up to 84.3%.',
    icon: Layers,
    metric: 'Complexity: O(N * k)',
  },
  {
    num: '05',
    title: 'Secure Aggregation + Verification',
    summary: 'Aggregator linearly combines blinded shares and verifies commitment authenticity.',
    details: 'The aggregator computes Secure Weighted Average on the secret shares. Received shares are checked against published commitments. If any bit manipulation or tampering occurs, the round is immediately aborted.',
    icon: ShieldCheck,
    metric: 'Tamper Detection: 100%',
  },
  {
    num: '06',
    title: 'Adaptive DP & Final Decision',
    summary: 'Calibrated Laplace noise is added, producing the final risk score and fraud decision.',
    details: 'Differential Privacy noise calibrated to global sensitivity Delta f is added to the aggregate score. The decision engine evaluates the final score against interbank risk thresholds (SAFE vs FRAUD ALERT) and logs the event to the hash-chain audit log.',
    icon: CheckCircle,
    metric: 'Target: Near Real-Time (~36.8 ms)',
  },
];

export const WorkflowSteps: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleStep = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 my-8">
      <div className="mb-6">
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
          How It Works
        </span>
        <h2 className="text-xl font-bold text-white">6-Step Interbank Fraud Aggregation Workflow</h2>
        <p className="text-xs text-slate-400 mt-1">
          Click any step to expand the cryptographic protocol mechanics.
        </p>
      </div>

      <div className="space-y-3">
        {STEPS.map((step, idx) => {
          const isExpanded = expandedIndex === idx;
          const Icon = step.icon;

          return (
            <div
              key={step.num}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'bg-slate-950/90 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => toggleStep(idx)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-mono font-bold text-xs ${
                    isExpanded ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-cyan-400 border border-cyan-800/40'
                  }`}>
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{step.title}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{step.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-block text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                    {step.metric}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed animate-fade-in">
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                    {step.details}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
