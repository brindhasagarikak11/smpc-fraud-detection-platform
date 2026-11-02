import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Lock, Eye, EyeOff, Info, CheckCircle2, XCircle } from 'lucide-react';
import { THREAT_ACTORS } from '../../data/researchData';

export const ThreatModel: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Security Model Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/80 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Security Model Specification: Semi-Honest Consortium with Byzantine Verification</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          <strong>Research Disclaimer:</strong> This system operates under a semi-honest (honest-but-curious) threat model augmented with cryptographic commitment verification to detect active tampering and bit-flipping attacks. It does not claim full malicious-adversary zero-knowledge security.
        </p>
      </div>

      {/* Threat Access Matrix Table */}
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Entity Information Boundary Matrix
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Strict Data Segregation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Threat Actor / Entity</th>
                <th className="p-3 text-emerald-400">✓ Permitted Access (Can See)</th>
                <th className="p-3 text-red-400">✕ Strictly Protected (Must NOT See)</th>
                <th className="p-3">Cryptographic Mitigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/60 text-slate-300">
              {THREAT_ACTORS.map((actor) => (
                <tr key={actor.id} className="hover:bg-slate-900/30">
                  <td className="p-3 font-bold text-white">
                    <span>{actor.name}</span>
                    <span className="text-[10px] text-slate-500 block">{actor.role}</span>
                  </td>

                  <td className="p-3">
                    <ul className="space-y-1 text-[11px] text-emerald-300">
                      {actor.allowedAccess.map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td className="p-3">
                    <ul className="space-y-1 text-[11px] text-red-300">
                      {actor.prohibitedAccess.map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td className="p-3 text-slate-300 text-[11px] max-w-[240px]">
                    {actor.mitigation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
