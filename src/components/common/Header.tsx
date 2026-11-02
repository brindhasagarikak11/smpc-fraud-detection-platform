import React from 'react';
import { ShieldCheck, Cpu, Database, Activity, Eye, EyeOff, Play, Terminal } from 'lucide-react';
import { EngineMode } from '../../types';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
  educationalDebugMode: boolean;
  onToggleDebugMode: () => void;
  engineMode: EngineMode;
  onToggleEngineMode: () => void;
  bankCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  isPresentationMode,
  onTogglePresentationMode,
  educationalDebugMode,
  onToggleDebugMode,
  engineMode,
  onToggleEngineMode,
  bankCount,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-cyan-900/40 px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Project Branding */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('overview')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-bold tracking-wide bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                SMPC Interbank Fraud Network
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                v1.0-RESEARCH
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Secure Multiparty Computation for Cross-Bank Risk Aggregation
            </p>
          </div>
        </div>

        {/* Center: Live Telemetry & Health Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="font-semibold">SYSTEM ONLINE</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Banks: <strong className="text-cyan-400">{bankCount}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>SMPC: <strong className="text-blue-400">READY</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Security: <strong className="text-emerald-400">SEMI-HONEST</strong></span>
          </div>
        </div>

        {/* Right: Controls & Presentation Trigger */}
        <div className="flex items-center gap-2">
          {/* Educational Debug Toggle */}
          <button
            onClick={onToggleDebugMode}
            title="Toggle Educational Debug Mode (Demonstration only)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              educationalDebugMode
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {educationalDebugMode ? (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Debug: ON</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Debug: OFF</span>
              </>
            )}
          </button>

          {/* Engine Mode Toggle */}
          <button
            onClick={onToggleEngineMode}
            title="Toggle Execution Engine (Browser WebCrypto / FastAPI Backend)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-cyan-800 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Engine:</span>
            <span className="text-cyan-400 font-mono font-semibold">
              {engineMode === 'IN_BROWSER' ? 'WebCrypto' : 'FastAPI'}
            </span>
          </button>

          {/* Presentation Mode Button */}
          <button
            onClick={onTogglePresentationMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border shadow-sm transition-all ${
              isPresentationMode
                ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-cyan-400/40 text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPresentationMode ? 'Exit Deck' : 'Presentation Mode'}</span>
          </button>
        </div>
      </div>

      {/* Prominent Educational Debug Mode Warning Banner */}
      {educationalDebugMode && (
        <div className="mt-2 py-1 px-3 rounded-md bg-amber-950/90 border border-amber-600/70 text-amber-200 text-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="font-bold">⚠ EDUCATIONAL DEBUG MODE ACTIVE:</span>
            <span>Individual local scores are visible for classroom explanation only. This mode is NOT privacy-preserving.</span>
          </div>
          <button
            onClick={onToggleDebugMode}
            className="underline font-semibold hover:text-white"
          >
            Restore Privacy Mode
          </button>
        </div>
      )}
    </header>
  );
};
