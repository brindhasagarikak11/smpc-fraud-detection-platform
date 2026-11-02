import React, { useState } from 'react';
import {
  Network,
  Shield,
  Cpu,
  Activity,
  Lock,
  Database,
  Radio,
  Server,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Globe,
  Sliders,
} from 'lucide-react';
import { INITIAL_BANKS } from '../../data/mockBanks';
import { BankNode } from '../../types';

export const BankNetworkGraph: React.FC = () => {
  const [selectedBank, setSelectedBank] = useState<BankNode>(INITIAL_BANKS[0]);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [activePacketAnimation, setActivePacketAnimation] = useState<boolean>(true);
  const [regionFilter, setRegionFilter] = useState<string>('ALL');

  // Consortium banks with enriched networking attributes
  const consortiumNodes = INITIAL_BANKS.map((b, idx) => ({
    ...b,
    ipEndpoint: `10.240.${idx + 1}.15:8443`,
    region: idx % 3 === 0 ? 'North Region' : idx % 3 === 1 ? 'West Region' : 'South Region',
    lastPingMs: (4.2 + (idx * 0.7)).toFixed(1),
    uptimePct: '99.98%',
  }));

  const filteredNodes = regionFilter === 'ALL'
    ? consortiumNodes
    : consortiumNodes.filter((n) => n.region === regionFilter);

  const handlePingAll = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-mono font-bold text-xs border border-cyan-800">
              CONSORTIUM MESH TOPOLOGY
            </span>
            <span className="text-xs font-mono text-emerald-400">● 9 NODES FULLY PEERED</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Interbank SMPC Network Topology</h1>
          <p className="text-xs text-slate-400 mt-1">
            Peer-to-peer encrypted mesh connecting autonomous bank nodes with the central aggregation coordinator.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePingAll}
            disabled={isPinging}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-mono font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? 'Pinging Mesh...' : 'Ping All Nodes'}</span>
          </button>

          <button
            onClick={() => setActivePacketAnimation(!activePacketAnimation)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all ${
              activePacketAnimation
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            Packet Animation: {activePacketAnimation ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Network KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-1">TOTAL PARTICIPATING BANKS</span>
          <span className="text-2xl font-bold text-cyan-300">9 Nodes</span>
          <span className="text-[10px] text-emerald-400 block mt-1">100% Consortium Quorum</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-1">TRANSPORT SECURITY</span>
          <span className="text-2xl font-bold text-white">TLS 1.3</span>
          <span className="text-[10px] text-slate-400 block mt-1">mTLS Mutual Auth Enforced</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-1">AVERAGE NETWORK RTT</span>
          <span className="text-2xl font-bold text-cyan-300">5.4 ms</span>
          <span className="text-[10px] text-emerald-400 block mt-1">Cross-Region Low Latency</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block text-[11px] mb-1">RAW SCORE EXPOSURE</span>
          <span className="text-2xl font-bold text-emerald-400">0.00%</span>
          <span className="text-[10px] text-slate-400 block mt-1">Information-Theoretically Private</span>
        </div>
      </div>

      {/* Main Interactive Stage: Visual Topological Graph (Left) & Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: SVG Network Mesh Graph */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden flex flex-col justify-between shadow-2xl min-h-[460px]">
          {/* Top Mesh Header */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-3 mb-4">
            <span className="flex items-center gap-2 text-cyan-400 font-bold">
              <Network className="w-4 h-4" />
              Live Consortium Mesh (Click any bank node to inspect)
            </span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Live Sockets Active
            </span>
          </div>

          {/* Center Coordinator Node */}
          <div className="relative flex flex-col items-center justify-center my-6">
            <div className="relative z-20 p-4 rounded-2xl bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 border-2 border-cyan-400/80 shadow-[0_0_40px_rgba(6,182,212,0.4)] text-center max-w-[200px]">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-1.5">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-xs font-mono font-bold text-white">SMPC Coordinator</h3>
              <span className="text-[10px] text-cyan-300 font-mono block">Semi-Honest Aggregator</span>
              <span className="text-[9px] text-slate-400 font-mono block mt-0.5">Enclave Memory: Isolated</span>
            </div>

            {/* Glowing Ring Animation */}
            {activePacketAnimation && (
              <div className="absolute w-44 h-44 rounded-full border border-cyan-500/30 animate-ping pointer-events-none" />
            )}
          </div>

          {/* Surrounding Bank Nodes Grid */}
          <div className="grid grid-cols-3 gap-3 z-10">
            {consortiumNodes.map((bank) => {
              const isSelected = selectedBank.id === bank.id;

              return (
                <button
                  key={bank.id}
                  onClick={() => setSelectedBank(bank)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 relative overflow-hidden ${
                    isSelected
                      ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-105 z-20'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{bank.avatar}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h4 className="text-xs font-bold truncate text-slate-100">{bank.name}</h4>
                  <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-cyan-400">
                    <span>{bank.id}</span>
                    <span className="text-slate-400">{bank.lastPingMs}ms</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Telemetry */}
          <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Encrypted Tunnel: mTLS ChaCha20-Poly1305</span>
            <span>Zero Raw Knowledge Guarantee: Enforced</span>
          </div>
        </div>

        {/* Right: Selected Bank Node Inspector */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-cyan-500/40 text-2xl flex items-center justify-center">
                {selectedBank.avatar}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{selectedBank.name}</h3>
                <span className="text-xs font-mono text-cyan-400">ID: {selectedBank.id}</span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-mono font-bold">
              ● {selectedBank.status}
            </span>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Internal ML Architecture:</span>
                <span className="font-mono text-cyan-300 font-semibold truncate max-w-[170px]">
                  {selectedBank.localModel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Local Classification Accuracy:</span>
                <span className="font-mono text-white font-bold">{selectedBank.localAccuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Local Scoring Latency:</span>
                <span className="font-mono text-white font-bold">{selectedBank.scoringLatencyMs} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Consortium Voting Weight:</span>
                <span className="font-mono text-cyan-400 font-bold">{selectedBank.weight}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Processed Txn Volume:</span>
                <span className="font-mono text-white">{selectedBank.transactionCount.toLocaleString()} txns</span>
              </div>
            </div>

            {/* Privacy Enclave Callout */}
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Zero-Knowledge Firewall Protection</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {selectedBank.name} maintains isolated transaction enclaves. When collaborating in interbank evaluations, only unrevealing blinded secret shares leave this node.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Consortium Peering Ledger Table */}
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4" />
            Consortium Nodes Peering Directory & Health Status
          </h3>
          <span className="text-[10px] font-mono text-slate-400">9 Authenticated Institutions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Node ID</th>
                <th className="p-3">Bank Name</th>
                <th className="p-3">Local Model</th>
                <th className="p-3">Accuracy</th>
                <th className="p-3">Consortium Weight</th>
                <th className="p-3">Network RTT</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/60 text-slate-300">
              {consortiumNodes.map((node) => {
                const isSelected = selectedBank.id === node.id;

                return (
                  <tr
                    key={node.id}
                    onClick={() => setSelectedBank(node)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-950/40 text-cyan-200' : 'hover:bg-slate-900/40'
                    }`}
                  >
                    <td className="p-3 font-bold text-cyan-400">{node.id}</td>
                    <td className="p-3 font-semibold text-white flex items-center gap-2">
                      <span>{node.avatar}</span>
                      <span>{node.name}</span>
                    </td>
                    <td className="p-3 text-slate-300 truncate max-w-[180px]">{node.localModel}</td>
                    <td className="p-3 text-white font-bold">{node.localAccuracy}%</td>
                    <td className="p-3 text-cyan-300 font-bold">{node.weight}x</td>
                    <td className="p-3 text-slate-400">{node.lastPingMs} ms</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold text-[10px]">
                        ● ONLINE
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
