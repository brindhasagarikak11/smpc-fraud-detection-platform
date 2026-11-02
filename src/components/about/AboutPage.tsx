import React from 'react';
import { Users, Lock } from 'lucide-react';
import { PROJECT_METADATA } from '../../data/researchData';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-mono font-bold text-xs border border-cyan-800">
            PROJECT OVERVIEW
          </span>
          <span className="text-xs font-mono text-slate-400">RESEARCH TEAM ATTRIBUTION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {PROJECT_METADATA.title}
        </h1>
        <p className="text-sm font-mono text-cyan-300 mt-1">{PROJECT_METADATA.subtitle}</p>
        <p className="text-xs text-slate-400 mt-2 max-w-3xl leading-relaxed">
          {PROJECT_METADATA.researchObjective}
        </p>
      </div>

      {/* Team Members Grid */}
      <div>
        <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Research Project Team Members
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROJECT_METADATA.team.map((member, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all shadow-md space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold text-base mb-3">
                {member.name.charAt(0)}
              </div>
              <h4 className="text-base font-bold text-white">{member.name}</h4>
              <p className="text-xs text-cyan-300 font-mono">{member.role}</p>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-900 leading-relaxed">
                Core contributor to protocol formulation, cryptographic implementation, and experimental benchmark validation.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Project Threat Model & Disclaimer */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs leading-relaxed text-slate-300">
        <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Formal Research Threat Model & Compliance Disclaimer
        </h3>
        <p>
          <strong>Security Model:</strong> Semi-Honest Consortium with Commitment-Based Integrity Verification. Participating bank servers and the central aggregator are assumed to follow protocol rules while potentially analyzing received network traffic to infer competitor data.
        </p>
        <p className="text-slate-400">
          <strong>Research Disclaimer:</strong> This platform is an interactive research prototype designed to demonstrate and benchmark lightweight Secure Multiparty Computation, Shamir threshold secret sharing, dynamic sharding, and adaptive differential privacy. It does not claim production banking certification or full malicious-adversary zero-knowledge security without hardware enclave attestation.
        </p>
      </div>
    </div>
  );
};
