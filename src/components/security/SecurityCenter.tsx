import React, { useState } from 'react';
import { ShieldAlert, Lock, Terminal, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ThreatModel } from './ThreatModel';
import { AttackSimulator } from './AttackSimulator';
import { AuditChain } from './AuditChain';
import { AuditEvent } from '../../types';

interface SecurityCenterProps {
  auditEvents: AuditEvent[];
}

export const SecurityCenter: React.FC<SecurityCenterProps> = ({ auditEvents }) => {
  const [subTab, setSubTab] = useState<'THREAT_MODEL' | 'ATTACKS' | 'AUDIT_LOG'>('THREAT_MODEL');

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-mono font-bold text-xs border border-cyan-800">
              SECURITY CENTER
            </span>
            <span className="text-xs font-mono text-emerald-400">● 6 ACTIVE DEFENSE LAYERS</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Cybersecurity, Threat Model & Byzantine Auditing
          </h1>
        </div>

        {/* Subtab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setSubTab('THREAT_MODEL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              subTab === 'THREAT_MODEL'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Threat Model
          </button>
          <button
            onClick={() => setSubTab('ATTACKS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              subTab === 'ATTACKS'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Attack Simulator
          </button>
          <button
            onClick={() => setSubTab('AUDIT_LOG')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              subTab === 'AUDIT_LOG'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Chain
          </button>
        </div>
      </div>

      {/* Subtab Views */}
      {subTab === 'THREAT_MODEL' && <ThreatModel />}
      {subTab === 'ATTACKS' && <AttackSimulator />}
      {subTab === 'AUDIT_LOG' && <AuditChain auditEvents={auditEvents} />}
    </div>
  );
};
