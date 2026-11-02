/**
 * Dynamic SMPC Sharding Protocol
 * 
 * Mathematical Formulation & Architectural Novelty:
 * In naive all-to-all SMPC, communication complexity scales as O(N^2), creating an unacceptable
 * communication bottleneck for large banking consortiums (e.g. N = 20-100 banks).
 * 
 * Dynamic Sharding partitions N banks into S = ceil(N / k) balanced disjoint shards of max size k (default k = 3-5).
 * 1. Intra-Shard Aggregation: Each shard s_i securely aggregates its subset of bank scores using lightweight SMPC.
 * 2. Inter-Shard Aggregation: Shard leaders / coordinators execute a hierarchical secure aggregation on the partial sums.
 * 
 * Communication Complexity: Reduced from O(N^2) to O(S * k^2 + S^2) ~= O(N * k).
 * Latency Reduction: Parallelized intra-shard execution yields near-constant execution latency.
 */

import { ShardGroup, BankNode } from '../types';

export interface ShardingPlan {
  totalBanks: number;
  targetShardSize: number;
  numShards: number;
  shards: ShardGroup[];
  estimatedLatencyMs: number;
  estimatedCommunicationKb: number;
  naiveAllToAllCommunicationKb: number;
  bandwidthSavingPercentage: number;
}

/**
 * Creates dynamic shards for a given set of active bank participants
 */
export function computeDynamicSharding(
  banks: BankNode[],
  targetShardSize: number = 3
): ShardingPlan {
  const totalBanks = banks.length;
  const numShards = Math.max(1, Math.ceil(totalBanks / targetShardSize));
  const shards: ShardGroup[] = [];

  for (let i = 0; i < numShards; i++) {
    shards.push({
      shardId: `SHARD-${i + 1}`,
      name: `Shard Cluster ${String.fromCharCode(65 + i)}`,
      participantIds: [],
      status: 'PENDING',
      latencyMs: 0,
    });
  }

  // Round-robin assignment for optimal balance
  banks.forEach((bank, idx) => {
    const shardIdx = idx % numShards;
    shards[shardIdx].participantIds.push(bank.id);
  });

  // Calculate communication models (experimental formulas calibrated to network packet payload)
  // Per-message secret share payload ~ 128 bytes + 64 bytes HMAC header = 192 bytes
  const bytesPerMessage = 192;
  
  // Naive all-to-all: N * (N - 1) messages
  const naiveMessages = totalBanks * (totalBanks - 1);
  const naiveAllToAllCommunicationKb = Number(((naiveMessages * bytesPerMessage) / 1024).toFixed(2));

  // Sharded messages: Sum of (k_i * (k_i - 1)) + S * (S - 1) inter-shard messages
  let shardedMessages = 0;
  shards.forEach(s => {
    const size = s.participantIds.length;
    shardedMessages += size * (size - 1);
  });
  shardedMessages += numShards * (numShards - 1); // Inter-shard coordination

  const estimatedCommunicationKb = Number(((shardedMessages * bytesPerMessage) / 1024).toFixed(2));
  
  // Latency estimation: Max intra-shard latency + inter-shard aggregation latency
  // Intra-shard aggregation runs concurrently in parallel
  const baseCryptoLatencyMs = 6.5;
  const networkHopLatencyMs = 3.2;
  const estimatedLatencyMs = Number((baseCryptoLatencyMs + (Math.log2(numShards + 1) * networkHopLatencyMs) + 4.0).toFixed(2));

  const savingPct = naiveAllToAllCommunicationKb > 0 
    ? Math.max(0, Number((((naiveAllToAllCommunicationKb - estimatedCommunicationKb) / naiveAllToAllCommunicationKb) * 100).toFixed(1)))
    : 0;

  return {
    totalBanks,
    targetShardSize,
    numShards,
    shards,
    estimatedLatencyMs,
    estimatedCommunicationKb,
    naiveAllToAllCommunicationKb,
    bandwidthSavingPercentage: savingPct,
  };
}
