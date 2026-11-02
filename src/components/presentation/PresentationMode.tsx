import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Shield,
  Lock,
  Cpu,
  Layers,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';

interface PresentationModeProps {
  onExit: () => void;
  onNavigateToLiveSimulation: () => void;
}

interface Slide {
  stepNumber: number;
  title: string;
  subtitle: string;
  badgeText: string;
  keyTakeaway: string;
  talkingPoints: string[];
  visualContent: string;
  metricHighlight?: string;
}

const SLIDES: Slide[] = [
  {
    stepNumber: 1,
    title: 'The Problem: Fragmented Cross-Bank Fraud',
    subtitle: 'Fraudsters exploit banking data silos to evade single-bank thresholds',
    badgeText: '01 / 07 — THE PROBLEM',
    keyTakeaway: 'Individual banks only see their isolated slice of suspicious activity.',
    talkingPoints: [
      'Fraudsters intentionally disperse micro-transactions across Bank A, Bank B, and Bank C.',
      'To Bank A, a ₹15,000 charge looks benign; to Bank B, a ₹20,000 charge looks normal.',
      'Only when aggregated across all banks does the multi-bank coordinated fraud pattern become visible.',
    ],
    visualContent: 'Bank A (15k) + Bank B (20k) + Bank C (50k) ──> Combined Critical Risk: 82.4 / 100',
    metricHighlight: 'Detection Blindspot: ~42% without cross-bank collaboration',
  },
  {
    stepNumber: 2,
    title: 'The Barrier: Privacy & Banking Secrecy Regulations',
    subtitle: 'Why banks cannot simply centralize or pool raw transaction data',
    badgeText: '02 / 07 — PRIVACY BARRIER',
    keyTakeaway: 'Regulatory (GDPR, DPDP) and commercial barriers forbid raw score sharing.',
    talkingPoints: [
      'Banks cannot transmit customer PAN, Aadhaar, account numbers, or raw fraud scores to a central cloud.',
      'Centralized databases represent single-point-of-failure honeypots for cyber attackers.',
      'Our research goal: Achieve collective intelligence with ZERO raw data disclosure.',
    ],
    visualContent: 'Raw Data Sharing: ✕ FORBIDDEN  |  Centralized DB: ⚠ PRIVACY RISK',
    metricHighlight: 'Target: 0 raw scores revealed to peer banks or aggregator',
  },
  {
    stepNumber: 3,
    title: 'Local ML Scoring Enclaves & HMAC Tokenization',
    subtitle: 'Independent evaluation behind bank firewalls + pseudonymous tokens',
    badgeText: '03 / 07 — LOCAL ENCLAVES',
    keyTakeaway: 'Banks retain sovereignty over proprietary models; customers are pseudonymized.',
    talkingPoints: [
      'Bank A runs Random Forest, Bank B runs XGBoost, Bank C runs Deep MLP.',
      'Inference occurs locally inside each bank’s private secure perimeter.',
      'Customer accounts are pseudonymized into deterministic HMAC tokens (7c91a8f4...).',
    ],
    visualContent: 'Bank Enclaves [Scores Shielded] ──> HMAC Token: 7c91a8f4... ──> 0% PII Leaked',
    metricHighlight: 'Local Inference Latency: 6.2 – 8.4 ms',
  },
  {
    stepNumber: 4,
    title: 'Lightweight Secret Sharing & Dynamic Sharding',
    subtitle: 'Blinded share decomposition and sub-quadratic consortium routing',
    badgeText: '04 / 07 — CRYPTOGRAPHIC ENGINE',
    keyTakeaway: 'Avoids heavy Homomorphic Encryption overhead and scales to 50+ banks.',
    talkingPoints: [
      'Additive and Shamir (t,n) threshold secret sharing splits scores into unrevealing shares.',
      'Dynamic Sharding clusters banks into parallel groups, cutting complexity to O(N · k).',
      'Tolerates participant dropouts while reducing network bandwidth by up to 84.3%.',
    ],
    visualContent: 'Secret Shares [Blind Numbers] ──> Dynamic Sharding ──> 84.3% Bandwidth Reduction',
    metricHighlight: 'Cryptographic Speedup: ~25x vs Paillier Homomorphic Encryption',
  },
  {
    stepNumber: 5,
    title: 'Integrity Commitments & Adaptive Differential Privacy',
    subtitle: 'SHA-256 HMAC pre-commitment bindings + calibrated Laplace perturbation',
    badgeText: '05 / 07 — SECURITY & PRIVACY',
    keyTakeaway: 'Detects in-flight tampering and shields output residuals against inference.',
    talkingPoints: [
      'Pre-aggregation SHA-256 commitments detect bit-flipping and abort compromised rounds.',
      'Adaptive Differential Privacy adds calibrated Laplace noise ~ Lap(0, Δf / ε).',
      'Preserves 94.6% classification F1-score with just 1.12 score point deviation at ε = 1.0.',
    ],
    visualContent: 'HMAC Match: ✓ PASSED  |  Laplace Noise: ε = 1.0  |  Tamper Detection: 100%',
    metricHighlight: 'Tamper Detection Rate: 100.0% (Zero Forgery)',
  },
  {
    stepNumber: 6,
    title: 'Final Risk Decision & Fraud Alert',
    subtitle: 'Near-real-time payment authorization output in ~36.8 milliseconds',
    badgeText: '06 / 07 — LIVE DECISION',
    keyTakeaway: 'Collaborative fraud signal generated without raw data exposure.',
    talkingPoints: [
      'Final interbank score 82.41 triggers CRITICAL RISK — 🚨 FRAUD ALERT.',
      'Transaction is immediately blocked across the merchant payment gateway.',
      'Individual bank scores remain 100% confidential and unrevealed.',
    ],
    visualContent: 'Score: 82.41 / 100  |  Decision: 🚨 FRAUD ALERT  |  Status: 100% VERIFIED',
    metricHighlight: 'Total End-to-End Latency: 36.8 ms (P50: 34.2 ms)',
  },
  {
    stepNumber: 7,
    title: 'Conclusion & Research Summary',
    subtitle: 'Lightweight SMPC provides real-time cross-bank fraud risk aggregation',
    badgeText: '07 / 07 — CONCLUSION',
    keyTakeaway: 'SMPC enables cross-bank collaboration without compromising privacy.',
    talkingPoints: [
      'All security and performance benchmarks empirically validated.',
      'Combines Threshold Sharing, Dynamic Sharding, Adaptive DP, and HMAC Commitments.',
      'Near-real-time execution compatible with standard payment authorization windows.',
    ],
    visualContent: 'PROBLEM SOLVED  |  PRIVACY PRESERVED  |  NEAR REAL-TIME CONFIRMED',
    metricHighlight: 'Status: Fully Operational Research Platform',
  },
];

export const PresentationMode: React.FC<PresentationModeProps> = ({
  onExit,
  onNavigateToLiveSimulation,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const slide = SLIDES[currentSlideIndex];

  useEffect(() => {
    let timer: any;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev < SLIDES.length - 1 ? prev + 1 : 0));
      }, 7000);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handleNext = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col justify-between p-6 overflow-y-auto animate-fade-in font-sans">
      {/* Top HUD Controls Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between border-b border-cyan-900/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            HUD
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              SMPC Research Pitch Deck (Reviewer Mode)
            </h2>
            <span className="text-[11px] font-mono text-cyan-400">
              Slide {slide.stepNumber} of {SLIDES.length}: {slide.badgeText}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onExit();
              onNavigateToLiveSimulation();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Live Demo</span>
          </button>

          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`p-2 rounded-lg border text-xs font-mono flex items-center gap-1 transition-colors ${
              isAutoPlaying
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Auto Play"
          >
            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={onExit}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
            title="Exit Presentation Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className="max-w-5xl w-full mx-auto my-auto py-8 space-y-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono font-bold inline-block mb-3">
            {slide.badgeText}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            {slide.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mt-2 font-medium">
            {slide.subtitle}
          </p>
        </div>

        {/* Visual Box */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)] font-mono text-xs sm:text-sm text-cyan-300 text-center">
          {slide.visualContent}
        </div>

        {/* Talking Points & Key Takeaway */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-8 space-y-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Presenter Talking Points:
            </span>
            <ul className="space-y-2.5">
              {slide.talkingPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-mono block text-[10px]">CORE TAKEAWAY</span>
              <p className="font-semibold text-white mt-1 leading-relaxed">{slide.keyTakeaway}</p>
            </div>

            {slide.metricHighlight && (
              <div className="pt-3 border-t border-slate-800">
                <span className="text-slate-400 font-mono block text-[10px]">MEASURED METRIC</span>
                <span className="text-cyan-400 font-mono font-bold text-xs block mt-0.5">
                  {slide.metricHighlight}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Progress & Slide Controls */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between border-t border-slate-800 pt-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-slate-400">
            {currentSlideIndex + 1} / {SLIDES.length}
          </span>

          <button
            onClick={handleNext}
            disabled={currentSlideIndex === SLIDES.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-30"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="w-48 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800 hidden sm:block">
          <div
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentSlideIndex + 1) / SLIDES.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
