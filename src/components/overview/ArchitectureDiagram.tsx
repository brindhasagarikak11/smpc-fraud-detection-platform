import React, { useState } from 'react';
import { Layers, Shield, Cpu, Lock, CheckCircle2, ChevronRight, Server, FileText, Database } from 'lucide-react';

interface ArchitectureNode {
  id: string;
  label: string;
  category: string;
  description: string;
  role: string;
  privacyGuarantee: string;
}

const NODES: Record<string, ArchitectureNode> = {
  'CUSTOMER_TXN': {
    id: 'CUSTOMER_TXN',
    label: 'Customer Transaction & Tokenization',
    category: 'Input Layer',
    role: 'Originates payment request across merchant terminal.',
    description: 'Transaction details (Amount, Merchant, Location, Device) are broadcast. Customer identity is tokenized into a pseudonymous HMAC token so that raw customer PII is never transmitted to the consortium.',
    privacyGuarantee: 'HMAC Pseudonymization (Zero Raw Account Numbers / PAN shared)',
  },
  'LOCAL_BANK_ML': {
    id: 'LOCAL_BANK_ML',
    label: 'Local Bank Enclaves (Bank A, B, C)',
    category: 'Local Scoring Layer',
    role: 'Each bank independently evaluates risk using proprietary ML models.',
    description: 'Banks run Random Forest, Gradient Boosted Trees, or Deep Neural Networks on local customer history and transaction features. Local risk scores remain strictly within the bank firewall.',
    privacyGuarantee: 'Isolated Enclave Execution (Scores NEVER leave local perimeter)',
  },
  'PRIVACY_LAYER': {
    id: 'PRIVACY_LAYER',
    label: 'Privacy Layer (Secret Sharing & DP)',
    category: 'Cryptographic Privacy Layer',
    role: 'Converts private local scores into information-theoretically secure shares.',
    description: 'Scores are split into additive or (t, n) Shamir polynomial points. Random blinding masks ensure that individual shares carry zero mathematical information about the original score.',
    privacyGuarantee: 'Information-Theoretic Secrecy (Shamir / Additive Masking)',
  },
  'DYNAMIC_SHARDING': {
    id: 'DYNAMIC_SHARDING',
    label: 'Dynamic SMPC Sharding',
    category: 'Clustering & Routing Layer',
    role: 'Clusters large consortiums into balanced disjoint shards.',
    description: 'Partitions N banks into shards of size k (e.g. 3-5). Runs intra-shard parallel aggregation to collapse quadratic communication complexity into logarithmic scaling.',
    privacyGuarantee: 'Disjoint Clustered Compartmentalization',
  },
  'SMPC_ENGINE': {
    id: 'SMPC_ENGINE',
    label: 'SMPC Aggregation Engine',
    category: 'Secure Computation Layer',
    role: 'Aggregates blinded secret shares algebraically.',
    description: 'Performs modular arithmetic on shares to compute Secure Sum, Secure Average, or Secure Weighted Average without unmasking individual inputs.',
    privacyGuarantee: 'Output-Only Revelation (Zero intermediate visibility)',
  },
  'VERIFICATION': {
    id: 'VERIFICATION',
    label: 'SHA-256 HMAC Verifiable Commitments',
    category: 'Integrity & Byzantine Security',
    role: 'Verifies authentic share commitments before release.',
    description: 'Banks publish cryptographic commitments C_i = H(Share_i || Round || Salt) before opening shares. Mismatched commitments immediately trigger round abortion.',
    privacyGuarantee: 'Zero Forged or Tampered Aggregations',
  },
  'DECISION_ENGINE': {
    id: 'DECISION_ENGINE',
    label: 'Interbank Decision Engine & Alert',
    category: 'Final Decision Layer',
    role: 'Evaluates global fraud threshold and logs to hash-chain audit log.',
    description: 'Combines verified risk score with consortium risk policies to output SAFE (<=40), MANUAL REVIEW (41-69), or FRAUD ALERT (>=70). Immutably records round event in the audit chain.',
    privacyGuarantee: 'Tamper-Evident Hash-Chain Auditing',
  },
};

export const ArchitectureDiagram: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode>(NODES['SMPC_ENGINE']);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 my-8">
      {/* Title */}
      <div className="mb-6">
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
          Interactive System Architecture
        </span>
        <h2 className="text-xl font-bold text-white">End-to-End Secure Multiparty Computation Pipeline</h2>
        <p className="text-xs text-slate-400 mt-1">
          Click any architectural block to inspect its role, cryptographic primitive, and privacy guarantee.
        </p>
      </div>

      {/* Grid: Interactive Diagram Left, Inspector Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Architecture Diagram Nodes */}
        <div className="lg:col-span-7 flex flex-col gap-3 font-mono text-xs">
          {/* Node 1: Customer Transaction */}
          <button
            onClick={() => setSelectedNode(NODES['CUSTOMER_TXN'])}
            className={`w-full p-3 rounded-xl border text-left transition-all ${
              selectedNode.id === 'CUSTOMER_TXN'
                ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                1. Customer Transaction & Tokenization
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                HMAC Pseudonym
              </span>
            </div>
          </button>

          <div className="flex justify-center text-cyan-500/60 text-xs">↓</div>

          {/* Node 2: Bank Enclaves */}
          <button
            onClick={() => setSelectedNode(NODES['LOCAL_BANK_ML'])}
            className={`w-full p-3 rounded-xl border text-left transition-all ${
              selectedNode.id === 'LOCAL_BANK_ML'
                ? 'bg-blue-500/20 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                2. Local Bank ML Scoring (Banks A, B, C)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                🔒 Scores Shielded
              </span>
            </div>
          </button>

          <div className="flex justify-center text-cyan-500/60 text-xs">↓</div>

          {/* Node 3: Privacy Layer */}
          <button
            onClick={() => setSelectedNode(NODES['PRIVACY_LAYER'])}
            className={`w-full p-3 rounded-xl border text-left transition-all ${
              selectedNode.id === 'PRIVACY_LAYER'
                ? 'bg-purple-500/20 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                3. Privacy Layer (Secret Sharing & DP)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                ★ Novelties 1 & 3
              </span>
            </div>
          </button>

          <div className="flex justify-center text-cyan-500/60 text-xs">↓</div>

          {/* Node 4: Dynamic Sharding */}
          <button
            onClick={() => setSelectedNode(NODES['DYNAMIC_SHARDING'])}
            className={`w-full p-3 rounded-xl border text-left transition-all ${
              selectedNode.id === 'DYNAMIC_SHARDING'
                ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                4. Dynamic SMPC Sharding
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                ★ Novelty 2
              </span>
            </div>
          </button>

          <div className="flex justify-center text-cyan-500/60 text-xs">↓</div>

          {/* Node 5: SMPC Engine */}
          <button
            onClick={() => setSelectedNode(NODES['SMPC_ENGINE'])}
            className={`w-full p-3 rounded-xl border text-left transition-all ${
              selectedNode.id === 'SMPC_ENGINE'
                ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                5. Secure Weighted Aggregator
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Linear Algebraic SMPC
              </span>
            </div>
          </button>

          <div className="flex justify-center text-cyan-500/60 text-xs">↓</div>

          {/* Node 6: Verification */}
          <button
            onClick={() => setSelectedNode(NODES['VERIFICATION'])}
            className={`w-full p-3 rounded-xl border text-left transition-all ${
              selectedNode.id === 'VERIFICATION'
                ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                6. Commitment Verification & Tamper Check
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                ★ Novelty 4
              </span>
            </div>
          </button>

          <div className="flex justify-center text-cyan-500/60 text-xs">↓</div>

          {/* Node 7: Decision Engine */}
          <button
            onClick={() => setSelectedNode(NODES['DECISION_ENGINE'])}
            className={`w-full p-3 rounded-xl border text-left transition-all ${
              selectedNode.id === 'DECISION_ENGINE'
                ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                7. Final Interbank Fraud Decision & Audit Log
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                🚨 Alert / 🛡 Safe
              </span>
            </div>
          </button>
        </div>

        {/* Right: Detailed Node Inspector */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-slate-950 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                {selectedNode.category}
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">{selectedNode.label}</h3>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="font-bold text-slate-300 block mb-1">Architectural Role:</span>
              <p className="text-slate-400 leading-relaxed">{selectedNode.role}</p>
            </div>

            <div>
              <span className="font-bold text-slate-300 block mb-1">Technical Implementation:</span>
              <p className="text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                {selectedNode.description}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/60">
              <span className="font-bold text-cyan-300 block mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                Privacy & Security Guarantee:
              </span>
              <span className="font-mono text-cyan-200">{selectedNode.privacyGuarantee}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
