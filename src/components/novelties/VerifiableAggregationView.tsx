import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Play, RefreshCw, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { createShareCommitment, verifyAggregationCommitments } from '../../crypto-engine/verifiableCommitments';
import { SecretShare } from '../../types';

export const VerifiableAggregationView: React.FC = () => {
  const [isTampered, setIsTampered] = useState<boolean>(false);

  // Generate 3 sample shares
  const roundId = 'SMPC-2026-001';
  const initialShares: SecretShare[] = [
    {
      participantId: 'BANK-A',
      shareIndex: 0,
      shareValue: 4829102,
      salt: 'salt8012',
      commitmentHash: createShareCommitment('BANK-A', 0, 4829102, roundId, 'salt8012'),
    },
    {
      participantId: 'BANK-B',
      shareIndex: 1,
      shareValue: 1948201,
      salt: 'salt9941',
      commitmentHash: createShareCommitment('BANK-B', 1, 1948201, roundId, 'salt9941'),
    },
    {
      participantId: 'BANK-C',
      shareIndex: 2,
      shareValue: 7183920,
      salt: 'salt3319',
      commitmentHash: createShareCommitment('BANK-C', 2, 7183920, roundId, 'salt3319'),
    },
  ];

  const verificationResult = verifyAggregationCommitments(
    initialShares,
    roundId,
    isTampered ? 0 : -1
  );

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-950 border border-purple-800 text-purple-400 font-mono font-bold text-xs">
              ★ NOVELTY 4
            </span>
            <span className="text-xs font-mono text-slate-400">BYZANTINE INTEGRITY & TAMPER DETECTION</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Verifiable Aggregation Commitments</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTampered(!isTampered)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-xs border transition-all ${
              isTampered
                ? 'bg-red-500 text-slate-950 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-cyan-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isTampered ? 'Reset Genuine State' : 'Simulate Share Tampering'}</span>
          </button>
        </div>
      </div>

      {/* Visual Verification Pipeline Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono text-center">
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block mb-1">1. Bank Contributions</span>
          <span className="font-bold text-white">3 Secret Shares</span>
        </div>
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block mb-1">2. Published Commitments</span>
          <span className="font-bold text-cyan-300">HMAC-SHA256</span>
        </div>
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block mb-1">3. SMPC Aggregation</span>
          <span className="font-bold text-blue-300">Summed in Enclave</span>
        </div>
        <div className={`p-3 rounded-lg border font-bold ${
          verificationResult.allValid
            ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            : 'bg-red-950 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-shake'
        }`}>
          <span className="block mb-1">4. Verification Result</span>
          <span>{verificationResult.allValid ? '✓ PASSED' : '✕ REJECTED'}</span>
        </div>
      </div>

      {/* Verification Status Card */}
      <div className={`p-5 rounded-xl border font-mono text-xs space-y-3 ${
        verificationResult.allValid
          ? 'bg-emerald-950/20 border-emerald-800/60 text-slate-300'
          : 'bg-red-950/40 border-red-600 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            {verificationResult.allValid ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-400" />
            )}
            <span className="font-bold text-sm text-white">
              {verificationResult.allValid
                ? 'Cryptographic Commitment Verification: SUCCESS'
                : '⚠ SECURITY ALERT: MESSAGE TAMPERING DETECTED'}
            </span>
          </div>

          <span className={`px-2.5 py-1 rounded font-bold ${
            verificationResult.allValid ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
          }`}>
            {verificationResult.allValid ? 'VERIFIED' : 'ROUND ABORTED'}
          </span>
        </div>

        {/* Hashes Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
          <div>
            <span className="text-slate-400 block mb-0.5">Expected Commitment Hash:</span>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 font-bold text-cyan-300 truncate">
              {verificationResult.expectedCommitment}
            </div>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Received / Computed Hash:</span>
            <div className={`p-2 rounded border font-bold truncate ${
              verificationResult.allValid
                ? 'bg-slate-950 border-slate-800 text-cyan-300'
                : 'bg-red-950 border-red-600 text-red-300'
            }`}>
              {verificationResult.receivedCommitment}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
          <span>Round ID: <strong className="text-white">{roundId}</strong></span>
          <span>Verified Participants: <strong className="text-white">{verificationResult.verifiedCount} / 3</strong></span>
          <span>Aggregation Hash: <strong className="text-cyan-300">{verificationResult.aggregationHash.substring(0, 16)}...</strong></span>
        </div>
      </div>
    </div>
  );
};
