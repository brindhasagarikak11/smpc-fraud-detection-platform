import React, { useState } from 'react';
import { Layers, Network, ArrowRight, Gauge, Database, Sparkles, TrendingDown } from 'lucide-react';
import { computeDynamicSharding } from '../../crypto-engine/dynamicSharding';
import { BankNode } from '../../types';

export const DynamicShardingView: React.FC = () => {
  const [bankCount, setBankCount] = useState<number>(9);
  const [targetShardSize, setTargetShardSize] = useState<number>(3);

  // Generate synthetic bank nodes
  const banks: BankNode[] = Array.from({ length: bankCount }, (_, i) => ({
    id: `BANK-${String.fromCharCode(65 + (i % 26))}${i >= 26 ? i : ''}`,
    name: `Bank ${String.fromCharCode(65 + (i % 26))}`,
    code: `B${i + 1}`,
    avatar: '🏦',
    status: 'ONLINE',
    localModel: 'Random Forest',
    localAccuracy: 94.5,
    scoringLatencyMs: 6.5,
    weight: 1.0,
    transactionCount: 12000,
    color: '#06b6d4',
  }));

  const shardingPlan = computeDynamicSharding(banks, targetShardSize);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-950 border border-blue-800 text-blue-400 font-mono font-bold text-xs">
              ★ NOVELTY 2
            </span>
            <span className="text-xs font-mono text-slate-400">SCALABILITY & COMMUNICATION OPTIMIZATION</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Dynamic SMPC Sharding Protocol</h2>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/80 border border-blue-600 text-blue-300 text-xs font-mono font-bold">
          <TrendingDown className="w-4 h-4 text-cyan-400" />
          <span>Bandwidth Saved: {shardingPlan.bandwidthSavingPercentage}%</span>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Participating Banks:</span>
            <span className="font-mono text-cyan-300 font-bold">{bankCount} Institutions</span>
          </div>
          <input
            type="range"
            min="2"
            max="50"
            value={bankCount}
            onChange={(e) => setBankCount(Number(e.target.value))}
            className="w-full accent-blue-400 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Target Shard Cluster Size:</span>
            <span className="font-mono text-cyan-300 font-bold">{targetShardSize} Banks / Shard</span>
          </div>
          <input
            type="range"
            min="2"
            max="6"
            value={targetShardSize}
            onChange={(e) => setTargetShardSize(Number(e.target.value))}
            className="w-full accent-blue-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Dynamic Shards Cluster Visualizer */}
      <div>
        <span className="text-xs font-mono font-bold text-slate-300 block mb-3">
          Dynamic Shard Partitioning & Inter-Shard Tree Aggregation ({shardingPlan.numShards} Disjoint Shards):
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {shardingPlan.shards.map((shard, idx) => (
            <div
              key={shard.shardId}
              className="p-4 rounded-xl bg-slate-950 border border-cyan-900/60 shadow-[0_0_15px_rgba(6,182,212,0.1)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="font-bold text-xs text-cyan-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  {shard.shardId} ({shard.name})
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {shard.participantIds.length} Nodes
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {shard.participantIds.map((pId) => (
                  <span
                    key={pId}
                    className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300"
                  >
                    🏦 {pId}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Intra-Shard SMPC:</span>
                <span className="text-emerald-400 font-bold">PARALLELIZED</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison: Without Sharding vs With Dynamic Sharding */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
        <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
          Communication Overhead Comparison (N = {bankCount} Banks)
        </h4>

        {/* Without Sharding Bar */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-red-400 font-bold">WITHOUT SHARDING (Naive All-to-All SMPC - O(N²)):</span>
            <span className="text-red-300 font-bold">{shardingPlan.naiveAllToAllCommunicationKb} KB</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
            <div className="bg-red-500 h-full rounded-full w-full" />
          </div>
        </div>

        {/* With Dynamic Sharding Bar */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-emerald-400 font-bold">WITH DYNAMIC SHARDING (Proposed Hierarchical - O(N·k)):</span>
            <span className="text-emerald-300 font-bold">{shardingPlan.estimatedCommunicationKb} KB</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(5, (shardingPlan.estimatedCommunicationKb / Math.max(1, shardingPlan.naiveAllToAllCommunicationKb)) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono text-slate-300 border-t border-slate-800">
          <div>
            <span className="text-slate-500 block text-[10px]">CURRENT SHARDS</span>
            <span className="font-bold text-white text-sm">{shardingPlan.numShards}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">ESTIMATED LATENCY</span>
            <span className="font-bold text-cyan-300 text-sm">{shardingPlan.estimatedLatencyMs} ms</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">BANDWIDTH SAVING</span>
            <span className="font-bold text-emerald-400 text-sm">{shardingPlan.bandwidthSavingPercentage}%</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">COMPLEXITY CLASS</span>
            <span className="font-bold text-purple-300 text-sm">O(N · k)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
