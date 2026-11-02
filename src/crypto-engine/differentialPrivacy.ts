/**
 * Adaptive Differential Privacy Protocol
 * 
 * Mathematical Formulation & Assumptions:
 * Output perturbation via the classical Laplace Mechanism:
 * M(D) = f(D) + Lap(0, Delta f / epsilon)
 * 
 * Sensitivity Analysis:
 * For an aggregate average score f(D) = (1/N) * sum_{i=1}^N S_i with score clipping bound B = 100:
 * The global sensitivity for neighbor dataset differing in one bank contribution is:
 * Delta f = B / N (where N is the number of participating banks)
 * 
 * Noise Scale:
 * b = Delta f / epsilon = (B / N) / epsilon
 * 
 * Adaptive Property:
 * The noise scale automatically adapts to the number of participants N and user-configured epsilon budget.
 * Larger consortium sizes naturally reduce per-bank sensitivity, allowing tighter utility preservation
 * under the same epsilon guarantee.
 */

import { DPConfig } from '../types';

export interface DPResult {
  rawScore: number;
  clippedScore: number;
  dpProtectedScore: number;
  noiseAdded: number;
  sensitivity: number;
  noiseScale: number;
  epsilon: number;
  clippingBound: number;
  utilityScore: number; // 0-100% utility index
  privacyLevelScore: number; // 0-100% privacy assurance index
}

/**
 * Generates zero-mean Laplace distributed random noise using inverse CDF sampling
 * CDF: F(x) = 0.5 * (1 + sgn(x) * (1 - exp(-|x| / b)))
 * Inverse CDF: x = -b * sgn(u - 0.5) * ln(1 - 2 * |u - 0.5|) where u ~ Uniform(0, 1)
 */
export function sampleLaplaceNoise(scale: number): number {
  if (scale <= 0) return 0;
  const u = Math.random();
  const sign = u < 0.5 ? -1 : 1;
  const noise = -scale * sign * Math.log(1 - 2 * Math.abs(u - 0.5) + 1e-12);
  return noise;
}

/**
 * Applies Adaptive Differential Privacy to an aggregated risk score
 */
export function applyAdaptiveDifferentialPrivacy(
  rawAggregate: number,
  participantCount: number = 3,
  config: Partial<DPConfig> = {}
): DPResult {
  const epsilon = config.epsilon ?? 1.0;
  const clippingBound = config.clippingBound ?? 100.0;
  const enabled = config.enabled ?? true;

  // 1. Enforce score clipping bound [0, B]
  const clippedScore = Math.max(0, Math.min(clippingBound, rawAggregate));

  if (!enabled || epsilon <= 0) {
    return {
      rawScore: rawAggregate,
      clippedScore,
      dpProtectedScore: clippedScore,
      noiseAdded: 0,
      sensitivity: 0,
      noiseScale: 0,
      epsilon,
      clippingBound,
      utilityScore: 100,
      privacyLevelScore: 0,
    };
  }

  // 2. Compute Global Sensitivity: Delta f = clippingBound / N
  const sensitivity = Number((clippingBound / Math.max(1, participantCount)).toFixed(3));

  // 3. Compute Laplace Scale parameter b = Delta f / epsilon
  const noiseScale = Number((sensitivity / epsilon).toFixed(3));

  // 4. Sample and add noise
  const rawNoise = sampleLaplaceNoise(noiseScale);
  const noiseAdded = Number(rawNoise.toFixed(2));

  // 5. Post-process to maintain valid fraud risk score domain [0, 100]
  const dpScoreCandidate = clippedScore + noiseAdded;
  const dpProtectedScore = Number(Math.max(0, Math.min(100, dpScoreCandidate)).toFixed(2));

  // 6. Calculate Utility and Privacy Assurance indices for researcher visualization
  // Privacy assurance increases as epsilon decreases: Assure = (5.0 - eps) / 5.0 * 100
  const privacyLevelScore = Math.max(5, Math.min(99, Math.round(((5.0 - Math.min(5.0, epsilon)) / 4.9) * 94 + 5)));
  
  // Utility index decreases as noise scale increases
  const absoluteError = Math.abs(dpProtectedScore - rawAggregate);
  const utilityScore = Math.max(10, Math.min(100, Math.round(100 - (absoluteError * 2.5))));

  return {
    rawScore: rawAggregate,
    clippedScore,
    dpProtectedScore,
    noiseAdded,
    sensitivity,
    noiseScale,
    epsilon,
    clippingBound,
    utilityScore,
    privacyLevelScore,
  };
}
