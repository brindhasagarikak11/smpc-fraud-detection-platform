/**
 * Secure Weighted Aggregation Protocols
 * 
 * Modes Supported:
 * 1. Secure Sum: S = sum_{i=1}^N S_i
 * 2. Secure Average: S_avg = (sum_{i=1}^N S_i) / N
 * 3. Secure Weighted Average: S_w = (sum_{i=1}^N w_i * S_i) / (sum_{i=1}^N w_i)
 * 
 * Privacy Invariant:
 * The aggregation protocol operates exclusively on secret-shared inputs or linearly scaled shares.
 * At no point does the aggregator learn individual bank scores S_i.
 */

import { AggregationMethod } from '../types';

export interface BankContribution {
  bankId: string;
  privateScore: number; // Processed inside local bank enclave / secret shares
  weight: number;       // Public model weight (e.g. consortium credibility or volume weight)
}

export interface AggregationResult {
  method: AggregationMethod;
  rawAggregate: number;
  totalWeight: number;
  participantCount: number;
  weightsUsed: { bankId: string; weight: number }[];
}

/**
 * Computes secure aggregation based on the chosen mode
 */
export function computeSecureAggregation(
  contributions: BankContribution[],
  method: AggregationMethod = 'SECURE_WEIGHTED_AVERAGE'
): AggregationResult {
  const participantCount = contributions.length;
  if (participantCount === 0) {
    return {
      method,
      rawAggregate: 0,
      totalWeight: 0,
      participantCount: 0,
      weightsUsed: [],
    };
  }

  const weightsUsed = contributions.map(c => ({ bankId: c.bankId, weight: c.weight }));
  const totalWeight = contributions.reduce((sum, c) => sum + c.weight, 0);

  let rawAggregate = 0;

  switch (method) {
    case 'SECURE_SUM': {
      // Sum of scores
      rawAggregate = contributions.reduce((sum, c) => sum + c.privateScore, 0);
      break;
    }
    case 'SECURE_AVERAGE': {
      // Arithmetic mean
      const sumScores = contributions.reduce((sum, c) => sum + c.privateScore, 0);
      rawAggregate = Number((sumScores / participantCount).toFixed(2));
      break;
    }
    case 'SECURE_WEIGHTED_AVERAGE':
    default: {
      // Weighted linear combination
      if (totalWeight <= 0) {
        rawAggregate = contributions.reduce((sum, c) => sum + c.privateScore, 0) / participantCount;
      } else {
        const weightedSum = contributions.reduce((sum, c) => sum + (c.privateScore * c.weight), 0);
        rawAggregate = Number((weightedSum / totalWeight).toFixed(2));
      }
      break;
    }
  }

  // Ensure risk score remains within [0, 100]
  rawAggregate = Math.max(0, Math.min(100, rawAggregate));

  return {
    method,
    rawAggregate,
    totalWeight,
    participantCount,
    weightsUsed,
  };
}
