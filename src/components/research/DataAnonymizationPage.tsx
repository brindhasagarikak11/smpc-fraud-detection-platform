import React, { useEffect, useState } from 'react';
import { Database, Upload, ShieldCheck, EyeOff, RefreshCw } from 'lucide-react';

type Evaluation = {
  dataset: { rows: number; columns: string[]; fraud_rows: number; source: string };
  anonymization: {
    strength: string; identifier_columns_pseudonymized: string[]; generalized_columns: string[];
    k: number; minimum_equivalence_class: number; rows_below_k: number; below_k_pct: number;
    unique_row_pct: number; privacy_proxy_score: number; privacy_metric_note: string;
  };
  utility: {
    raw: Record<string, number>; anonymized: Record<string, number>;
    f1_change_pp: number; roc_auc_change_pp: number; utility_retained_pct: number; model: string; note: string;
  };
  privacy_utility: { recommended_epsilon: number; recommended_balance_score: number; rows: Array<Record<string, number>>; mechanism: string; privacy_note: string };
};

const API = 'http://127.0.0.1:8000';

export const DataAnonymizationPage: React.FC = () => {
  const [strength, setStrength] = useState('MEDIUM');
  const [k, setK] = useState(5);
  const [data, setData] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadDemo = async () => {
    setLoading(true); setMessage('');
    try {
      const r = await fetch(`${API}/api/research/evaluation?strength=${strength}&k=${k}`);
      if (!r.ok) throw new Error((await r.json()).detail || 'Evaluation failed');
      setData(await r.json());
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Backend unavailable'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadDemo(); }, []);

  const upload = async (file: File) => {
    setLoading(true); setMessage('');
    const form = new FormData(); form.append('file', file);
    try {
      const r = await fetch(`${API}/api/research/evaluation?strength=${strength}&k=${k}`, { method: 'POST', body: form });
      if (!r.ok) throw new Error((await r.json()).detail || 'Upload evaluation failed');
      setData(await r.json());
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Upload failed'); }
    finally { setLoading(false); }
  };

  const metric = (key: string) => data ? `${(data.utility.raw[key] * 100).toFixed(1)}% → ${(data.utility.anonymized[key] * 100).toFixed(1)}%` : '—';

  return <div className="space-y-6 pb-16 animate-fade-in">
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div><span className="text-xs font-mono font-bold text-cyan-400">DATASET & PRIVACY PREPROCESSING</span>
          <h1 className="text-2xl font-bold text-white mt-1">Fraud Dataset Anonymization Lab</h1>
          <p className="text-sm text-slate-400 mt-1">Compare raw and anonymized fraud data before it enters the cross-bank SMPC pipeline.</p></div>
        <label className="cursor-pointer px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload CSV
          <input type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0])}/>
        </label>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800"><span className="text-[11px] text-slate-500 font-mono">ANONYMIZATION STRENGTH</span>
        <select value={strength} onChange={e => setStrength(e.target.value)} className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></div>
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800"><span className="text-[11px] text-slate-500 font-mono">TARGET K-ANONYMITY</span>
        <input type="range" min="2" max="10" value={k} onChange={e => setK(Number(e.target.value))} className="w-full mt-3 accent-cyan-400"/><div className="text-cyan-300 font-bold">k = {k}</div></div>
      <button onClick={loadDemo} disabled={loading} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left hover:border-cyan-700"><span className="text-[11px] text-slate-500 font-mono">RE-RUN EXPERIMENT</span><div className="mt-2 text-cyan-300 font-bold flex items-center gap-2"><RefreshCw className="w-4 h-4"/> {loading ? 'Running…' : 'Evaluate bundled dataset'}</div></button>
    </div>

    {message && <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs font-mono">{message}</div>}
    {data && <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Rows" value={data.dataset.rows.toLocaleString()} icon={<Database className="w-4 h-4"/>}/>
        <Kpi label="Fraud rows" value={data.dataset.fraud_rows.toLocaleString()} icon={<ShieldCheck className="w-4 h-4"/>}/>
        <Kpi label="Privacy proxy" value={`${data.anonymization.privacy_proxy_score}%`} icon={<EyeOff className="w-4 h-4"/>}/>
        <Kpi label="Utility retained" value={`${data.utility.utility_retained_pct}%`} icon={<ShieldCheck className="w-4 h-4"/>}/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-sm font-mono font-bold text-cyan-400">WHAT WAS ANONYMIZED?</h3>
          <InfoRow title="Pseudonymized identifiers" value={data.anonymization.identifier_columns_pseudonymized.join(', ') || 'None detected'}/>
          <InfoRow title="Generalized columns" value={data.anonymization.generalized_columns.join(', ') || 'None'}/>
          <InfoRow title="Minimum equivalence class" value={String(data.anonymization.minimum_equivalence_class)}/>
          <InfoRow title={`Rows below k=${data.anonymization.k}`} value={`${data.anonymization.rows_below_k} (${data.anonymization.below_k_pct}%)`}/>
          <p className="text-[11px] text-slate-500">{data.anonymization.privacy_metric_note}</p>
        </section>
        <section className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-sm font-mono font-bold text-cyan-400">RAW VS ANONYMIZED UTILITY</h3>
          {['accuracy','precision','recall','f1','roc_auc','pr_auc'].map(x => <InfoRow key={x} title={x.toUpperCase()} value={metric(x)}/>)}
          <p className="text-[11px] text-slate-500">{data.utility.note}</p>
        </section>
      </div>
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
        <h3 className="text-sm font-mono font-bold text-cyan-400 mb-3">PIPELINE</h3>
        <div className="flex flex-wrap gap-2 text-xs font-mono"><Step t="CSV Dataset"/><Arrow/><Step t="HMAC Pseudonymization"/><Arrow/><Step t="Generalization"/><Arrow/><Step t="Controlled Perturbation"/><Arrow/><Step t="Local ML"/><Arrow/><Step t="SMPC + DP"/></div>
      </div>
    </>}
  </div>;
};

const Kpi = ({label,value,icon}:{label:string;value:string;icon:React.ReactNode}) => <div className="p-4 rounded-xl bg-slate-950 border border-slate-800"><div className="flex items-center gap-2 text-slate-500 text-[10px] font-mono">{icon}{label}</div><div className="text-2xl font-bold text-white mt-2">{value}</div></div>;
const InfoRow = ({title,value}:{title:string;value:string}) => <div className="flex justify-between gap-4 border-b border-slate-900 pb-2 text-xs"><span className="text-slate-400">{title}</span><span className="text-slate-200 font-mono text-right max-w-[60%] break-words">{value}</span></div>;
const Step = ({t}:{t:string}) => <span className="px-3 py-2 rounded-lg bg-cyan-950/40 border border-cyan-900 text-cyan-300">{t}</span>;
const Arrow = () => <span className="text-slate-600 py-2">→</span>;
