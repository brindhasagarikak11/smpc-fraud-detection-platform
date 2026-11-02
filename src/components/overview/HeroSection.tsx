import React from 'react';
import { Play, Layers, ShieldCheck, Lock, Cpu, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  onLaunchSimulation: () => void;
  onExploreArchitecture: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onLaunchSimulation,
  onExploreArchitecture,
}) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-12">
      {/* Background subtle grid and cyber glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950/80 to-slate-950 pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="relative max-w-5xl mx-auto text-center px-4">
        {/* Top Protocol Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-400 text-xs font-mono mb-6 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>REAL-TIME INTERBANK SMPC PROTOCOL</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Cross-Bank Fraud Detection <br />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
            Without Sharing Sensitive Data
          </span>
        </h1>

        {/* Subheading */}
        <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          A lightweight <strong>Secure Multiparty Computation (SMPC)</strong> framework enabling financial institutions to securely aggregate fraud risk scores in <strong>near-real-time</strong> while preserving strict bank confidentiality and zero raw score leakage.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button
            onClick={onLaunchSimulation}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all hover:scale-105"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Live Simulation</span>
          </button>

          <button
            onClick={onExploreArchitecture}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-all hover:border-cyan-500/60"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Explore Architecture</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* 4 Feature Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 text-left">
          {/* Card 1 */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-3">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Privacy-Preserving</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Individual bank fraud scores and customer PII are NEVER exposed to peer banks or the central aggregator.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400 mb-3">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Lightweight SMPC</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lightweight modular secret sharing avoids heavy Homomorphic Encryption overhead, engineered for near-real-time execution.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Dynamic Sharding</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clusters consortium banks into balanced shards, reducing quadratic communication complexity down to sub-linear overhead.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-400 mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Verifiable Decisions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              SHA-256 HMAC commitments detect share tampering in flight, aborting compromised rounds before releasing any fraud decisions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
