import React from 'react';
import { HelpCircle, CheckCircle2, FlaskConical, BookOpen, ArrowRight } from 'lucide-react';
import { RESEARCH_QUESTIONS } from '../../data/researchData';

export const ResearchQuestions: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
          Scientific Rigor
        </span>
        <h1 className="text-2xl font-bold text-white mt-1">
          Research Questions & Empirical Findings (RQ1 – RQ7)
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Formal evaluation of the 7 core hypotheses guiding the lightweight interbank SMPC fraud aggregation framework.
        </p>
      </div>

      {/* RQs List */}
      <div className="space-y-4">
        {RESEARCH_QUESTIONS.map((rq) => (
          <div
            key={rq.id}
            className="p-5 rounded-xl bg-slate-950 border border-slate-800 shadow-md space-y-3"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-md bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono font-bold text-xs">
                  {rq.code}
                </span>
                <h3 className="text-sm font-bold text-white">{rq.question}</h3>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono font-semibold text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {rq.status}
              </span>
            </div>

            {/* Experiment & Metric Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">EXPERIMENT</span>
                <span className="text-cyan-300 font-semibold">{rq.experimentName}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PRIMARY METRIC</span>
                <span className="text-purple-300 font-semibold">{rq.primaryMetric}</span>
              </div>
            </div>

            {/* Empirical Result & Interpretation */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-900/60 text-cyan-200">
                <strong className="text-cyan-300 block mb-0.5 font-mono uppercase tracking-wider text-[10px]">
                  Empirical Result:
                </strong>
                <p className="leading-relaxed">{rq.empiricalResult}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                <strong className="text-slate-400 block mb-0.5 font-mono uppercase tracking-wider text-[10px]">
                  Scientific Interpretation:
                </strong>
                <p className="leading-relaxed">{rq.scientificInterpretation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
