import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, Activity, Network } from 'lucide-react';

type SecurityData = { tampering:{attempts:number;detected:number;detection_rate_pct:number}; invalid_share:{cases:number;rejected:number;rejection_rate_pct:number}; duplicate_participant:{tests:number;rejected:number;rejection_rate_pct:number}; dropout:Array<{dropped:number;available:number;threshold:number;continues:boolean}>; network_jitter:Array<{jitter_ms:number;latency_ms:number;throughput_tps:number}>; note:string };
const API='http://127.0.0.1:8000';
export const SecurityAnalytics: React.FC = () => { const [d,setD]=useState<SecurityData|null>(null); useEffect(()=>{fetch(`${API}/api/research/security-metrics`).then(r=>r.json()).then(setD).catch(console.error)},[]); return <div className="space-y-6 pb-16 animate-fade-in">
 <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800"><span className="text-xs font-mono font-bold text-red-400">EMPIRICAL SECURITY ANALYSIS</span><h1 className="text-2xl font-bold text-white mt-1">Security & Resilience Metrics</h1><p className="text-sm text-slate-400 mt-1">Repeatable prototype tests for tampering, malformed shares, duplicate participants, dropout and network jitter.</p></div>
 {d && <>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Kpi title="Tamper detection" value={`${d.tampering.detection_rate_pct}%`} icon={<ShieldCheck/>}/><Kpi title="Invalid-share rejection" value={`${d.invalid_share.rejection_rate_pct}%`} icon={<AlertTriangle/>}/><Kpi title="Duplicate rejection" value={`${d.duplicate_participant.rejection_rate_pct}%`} icon={<ShieldCheck/>}/></div>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
   <section className="p-5 rounded-xl bg-slate-950 border border-slate-800"><h3 className="text-sm font-mono font-bold text-cyan-400 mb-4 flex gap-2"><Network className="w-4 h-4"/> Dropout tolerance (5 banks, t=3)</h3><div className="space-y-2">{d.dropout.map(x=><div key={x.dropped} className="flex justify-between text-xs font-mono border-b border-slate-900 pb-2"><span className="text-slate-400">Dropped {x.dropped} → {x.available} active</span><span className={x.continues?'text-emerald-400':'text-red-400'}>{x.continues?'AGGREGATION CONTINUES':'AGGREGATION BLOCKED'}</span></div>)}</div></section>
   <section className="p-5 rounded-xl bg-slate-950 border border-slate-800"><h3 className="text-sm font-mono font-bold text-cyan-400 mb-4 flex gap-2"><Activity className="w-4 h-4"/> Network jitter impact</h3><div className="space-y-2">{d.network_jitter.map(x=><div key={x.jitter_ms} className="flex justify-between text-xs font-mono border-b border-slate-900 pb-2"><span className="text-slate-400">+{x.jitter_ms} ms jitter</span><span className="text-white">{x.latency_ms} ms / {x.throughput_tps} TPS</span></div>)}</div></section>
  </div>
  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">{d.note}</div>
 </>}
 </div> };
const Kpi=({title,value,icon}:{title:string;value:string;icon:React.ReactNode})=><div className="p-4 rounded-xl bg-slate-950 border border-slate-800"><div className="flex gap-2 items-center text-[10px] font-mono text-slate-500">{icon}{title}</div><div className="text-2xl font-bold text-white mt-2">{value}</div></div>;
