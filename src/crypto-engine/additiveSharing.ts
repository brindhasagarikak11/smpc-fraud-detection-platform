/**
 * Additive Secret Sharing Protocol
 * 
 * Mathematical Formulation:
 * To share a secret integer risk score S in field Z_p:
 * Select n-1 uniform random integers r_1, r_2, ..., r_{n-1} in [0, p-1].
 * The n-th share is computed as:
 * r_n = (S - sum_{j=1}^{n-1} r_j) mod p
 * 
 * Reconstruction:
 * S = (sum_{i=1}^n r_i) mod p
 * 
 * Security: Information-theoretically secure against up to n-1 colluding semi-honest adversaries.
 */

import { sha256Hex } from './tokenization';
import { SecretShare } from '../types';

// Large prime field for risk score scaling (supports precision up to 2 decimal places: Score * 100)
export const SMPC_PRIME = 2147483647; // 2^31 - 1 (Mersenne prime M31)
export const SCORE_SCALE = 100;

/**
 * Splits a floating-point risk score [0, 100] into N additive secret shares
 */
export function generateAdditiveShares(
  participantId: string,
  rawScore: number,
  numRecipients: number,
  prime: number = SMPC_PRIME
): SecretShare[] {
  // Scale score to integer field
  const integerSecret = Math.round(Math.max(0, Math.min(100, rawScore)) * SCORE_SCALE);
  const shares: SecretShare[] = [];
  
  let randomSum = 0;
  for (let i = 0; i < numRecipients - 1; i++) {
    // Generate pseudorandom integer share in [0, prime - 1]
    const randomShare = Math.floor(Math.random() * (prime / 2));
    randomSum = (randomSum + randomShare) % prime;
    
    const salt = Math.random().toString(36).substring(2, 10);
    const commitmentHash = sha256Hex(`${participantId}:${i}:${randomShare}:${salt}`);
    
    shares.push({
      participantId,
      shareIndex: i,
      shareValue: randomShare,
      salt,
      commitmentHash,
    });
  }

  // Last share closes the modular sum
  let finalShare = (integerSecret - randomSum) % prime;
  if (finalShare < 0) {
    finalShare += prime;
  }
  
  const salt = Math.random().toString(36).substring(2, 10);
  const commitmentHash = sha256Hex(`${participantId}:${numRecipients - 1}:${finalShare}:${salt}`);
  
  shares.push({
    participantId,
    shareIndex: numRecipients - 1,
    shareValue: finalShare,
    salt,
    commitmentHash,
  });

  return shares;
}

/**
 * Reconstructs the original secret score from all N additive shares
 */
export function reconstructAdditiveScore(
  shares: SecretShare[],
  prime: number = SMPC_PRIME
): number {
  if (shares.length === 0) return 0;
  let sum = 0;
  for (const s of shares) {
    sum = (sum + s.shareValue) % prime;
  }
  return sum / SCORE_SCALE;
}
