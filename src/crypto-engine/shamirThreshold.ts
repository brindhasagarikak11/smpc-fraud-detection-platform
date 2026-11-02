/**
 * Shamir's (t, n) Threshold Secret Sharing
 * 
 * Mathematical Formulation:
 * A secret S is embedded as the constant term of a degree (t-1) polynomial over a prime field F_p:
 * f(x) = S + a_1 x + a_2 x^2 + ... + a_{t-1} x^{t-1} mod p
 * 
 * Each participant i receives share (x_i, y_i) where y_i = f(x_i) mod p.
 * 
 * Lagrange Reconstruction with any k >= t shares:
 * S = sum_{j=1}^k y_j * l_j(0) mod p
 * where l_j(0) = prod_{m != j} (0 - x_m) / (x_j - x_m) mod p
 * 
 * Fault Tolerance Property: Any subset of t or more shares can reconstruct the exact secret,
 * while any subset of t-1 or fewer shares reveals ZERO information about S.
 */

import { sha256Hex } from './tokenization';
import { SecretShare } from '../types';

export const SHAMIR_PRIME = 2147483647; // 2^31 - 1
export const SCORE_SCALE = 100;

// Modular arithmetic helpers
function mod(n: number, p: number): number {
  const res = n % p;
  return res >= 0 ? res : res + p;
}

// Extended Euclidean Algorithm for modular inverse: a * x === 1 (mod p)
function modInverse(a: number, p: number): number {
  let [old_r, r] = [a, p];
  let [old_s, s] = [1, 0];

  while (r !== 0) {
    const quotient = Math.floor(old_r / r);
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
  }

  return mod(old_s, p);
}

export interface PolynomialPoint {
  x: number; // 1-indexed participant index
  y: number; // Evaluated polynomial value
  participantId: string;
  salt: string;
  commitmentHash: string;
}

/**
 * Splits secret score into n shares with threshold t
 */
export function generateShamirShares(
  participantId: string,
  rawScore: number,
  t: number,
  n: number,
  prime: number = SHAMIR_PRIME
): PolynomialPoint[] {
  const secret = Math.round(Math.max(0, Math.min(100, rawScore)) * SCORE_SCALE);
  
  // Generate random coefficients a_1, ..., a_{t-1}
  const coefficients: number[] = [secret];
  for (let i = 1; i < t; i++) {
    coefficients.push(Math.floor(Math.random() * (prime / 4)) + 1);
  }

  const points: PolynomialPoint[] = [];
  for (let x = 1; x <= n; x++) {
    // Evaluate f(x) = sum_{k=0}^{t-1} a_k * x^k mod p
    let y = 0;
    let xPow = 1;
    for (let k = 0; k < t; k++) {
      y = mod(y + mod(coefficients[k] * xPow, prime), prime);
      xPow = mod(xPow * x, prime);
    }

    const salt = Math.random().toString(36).substring(2, 10);
    const commitmentHash = sha256Hex(`${participantId}:${x}:${y}:${salt}`);

    points.push({
      x,
      y,
      participantId,
      salt,
      commitmentHash,
    });
  }

  return points;
}

/**
 * Reconstructs secret score using Lagrange interpolation at x = 0
 * Requires at least t valid points
 */
export function reconstructShamirSecret(
  shares: PolynomialPoint[],
  threshold: number,
  prime: number = SHAMIR_PRIME
): { success: boolean; secret: number; error?: string } {
  if (shares.length < threshold) {
    return {
      success: false,
      secret: 0,
      error: `Insufficient shares: received ${shares.length}, threshold is ${threshold}`,
    };
  }

  // Use the first t shares for interpolation
  const activeShares = shares.slice(0, threshold);
  let reconstructed = 0;

  for (let j = 0; j < activeShares.length; j++) {
    const xj = activeShares[j].x;
    const yj = activeShares[j].y;

    // Compute Lagrange basis polynomial l_j(0) = prod_{m != j} (0 - x_m) / (x_j - x_m) mod p
    let num = 1;
    let den = 1;

    for (let m = 0; m < activeShares.length; m++) {
      if (m === j) continue;
      const xm = activeShares[m].x;
      num = mod(num * mod(-xm, prime), prime);
      den = mod(den * mod(xj - xm, prime), prime);
    }

    const basis = mod(num * modInverse(den, prime), prime);
    const term = mod(yj * basis, prime);
    reconstructed = mod(reconstructed + term, prime);
  }

  return {
    success: true,
    secret: reconstructed / SCORE_SCALE,
  };
}
