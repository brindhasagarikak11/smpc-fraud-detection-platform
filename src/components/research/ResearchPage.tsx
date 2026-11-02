import React from 'react';
import { BookOpen, HelpCircle, Layers, CheckCircle2, Shield, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { GapNoveltyMatrix } from './GapNoveltyMatrix';
import { ContributionMatrix } from './ContributionMatrix';
import { PROJECT_METADATA, RESEARCH_REFERENCES } from '../../data/researchData';

export const ResearchPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Research Header */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-mono font-bold text-xs border border-cyan-800">
            ACADEMIC FOUNDATIONS
          </span>
          <span className="text-xs font-mono text-slate-400">REVIEW 1 PRESENTATION ALIGNMENT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {PROJECT_METADATA.title}
        </h1>
        <p className="text-sm font-mono text-cyan-300 mt-1">{PROJECT_METADATA.subtitle}</p>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          {PROJECT_METADATA.researchObjective}
        </p>
      </div>

      {/* Problem Statement Card */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs leading-relaxed">
        <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4" />
          The Core Research Problem: Fragmented Fraud vs Banking Confidentiality
        </h3>
        <p className="text-slate-300">
          Sophisticated financial fraudsters intentionally distribute small, suspicious transactions across multiple disparate banking institutions (e.g. Bank A, Bank B, Bank C) to avoid triggering single-bank anomaly detection thresholds. However, due to strict customer data privacy laws (GDPR, India DPDP Act), banking secrecy, and commercial competition, banks cannot centralize or pool raw customer transactions or private fraud scores.
        </p>
        <p className="text-slate-400">
          Our proposed system addresses this impasse through lightweight Secure Multiparty Computation (SMPC), permitting banks to collaboratively calculate the global interbank fraud risk without revealing any individual bank inputs.
        </p>
      </div>

      {/* Novelties Contribution Matrix */}
      <div>
        <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
          Our 4 Novel Contributions
        </h3>
        <ContributionMatrix />
      </div>

      {/* Research Gap Matrix */}
      <GapNoveltyMatrix />

      {/* Academic Literature References (From Review 1) */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Literature References (Review 1 Bibliography)
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Peer-Reviewed Citations</span>
        </div>

        <div className="space-y-3">
          {RESEARCH_REFERENCES.map((ref, idx) => (
            <div key={ref.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-cyan-400 font-bold">[{idx + 1}] {ref.category}</span>
                <span className="text-[10px] text-slate-500 font-mono">{ref.id}</span>
              </div>
              <p className="text-slate-200 font-serif italic">{ref.citation}</p>
              <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-900">
                <strong>Relevance:</strong> {ref.relevance}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
