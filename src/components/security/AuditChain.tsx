import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Download, CheckCircle2, XCircle, FileText, Lock } from 'lucide-react';
import { AuditEvent } from '../../types';
import { verifyAuditChain, exportAuditLogToCSV } from '../../crypto-engine/auditChain';

interface AuditChainProps {
  auditEvents: AuditEvent[];
}

export const AuditChain: React.FC<AuditChainProps> = ({ auditEvents }) => {
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const handleVerifyChain = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const res = verifyAuditChain(auditEvents);
      setVerificationStatus(res.message);
      setIsVerifying(false);
    }, 400);
  };

  const handleExportCSV = () => {
    const csv = exportAuditLogToCSV(auditEvents);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SMPC_Audit_Log_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(auditEvents, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SMPC_Audit_Log_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-white block mb-0.5">
            Tamper-Evident Hash-Chain Audit Trail
          </span>
          <p className="text-slate-400">
            Immutable SHA-256 hash linkage (\( H_k = \text{SHA256}(H_{k-1} \parallel \text{Payload}) \)) guarantees zero retroactive modification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-mono font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all hover:scale-105"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isVerifying ? 'Verifying...' : 'Verify Entire Audit Chain'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono flex items-center gap-1"
            title="Export as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono flex items-center gap-1"
            title="Export as JSON"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Verification Alert Banner */}
      {verificationStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-mono flex items-center gap-2 animate-fade-in shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{verificationStatus}</span>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono text-left border border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-2.5">Event ID</th>
              <th className="p-2.5">Timestamp</th>
              <th className="p-2.5">Round ID</th>
              <th className="p-2.5">Participants</th>
              <th className="p-2.5">Commitment Hash</th>
              <th className="p-2.5">Status</th>
              <th className="p-2.5">Decision</th>
              <th className="p-2.5">Current Hash (SHA-256)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/60 text-slate-300">
            {auditEvents.map((evt) => (
              <tr key={evt.eventId} className="hover:bg-slate-900/40">
                <td className="p-2.5 font-bold text-cyan-300">{evt.eventId}</td>
                <td className="p-2.5 text-slate-400">{evt.timestamp.substring(11, 19)}</td>
                <td className="p-2.5 text-white">{evt.roundId}</td>
                <td className="p-2.5">{evt.participantCount} Banks</td>
                <td className="p-2.5 text-slate-400 truncate max-w-[90px]" title={evt.commitmentHash}>
                  {evt.commitmentHash.substring(0, 10)}...
                </td>
                <td className="p-2.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">
                    ✓ {evt.verificationStatus}
                  </span>
                </td>
                <td className="p-2.5">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    evt.decision === 'FRAUD_ALERT'
                      ? 'bg-red-950 text-red-300'
                      : evt.decision === 'MANUAL_REVIEW'
                      ? 'bg-yellow-950 text-yellow-300'
                      : 'bg-emerald-950 text-emerald-300'
                  }`}>
                    {evt.decision}
                  </span>
                </td>
                <td className="p-2.5 text-cyan-400 truncate max-w-[110px]" title={evt.currentHash}>
                  {evt.currentHash.substring(0, 12)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-900 pt-2">
        <span>Total Immutable Records: {auditEvents.length}</span>
        <span>Cryptographic Hash Algorithm: SHA-256 (256-bit)</span>
      </div>
    </div>
  );
};
