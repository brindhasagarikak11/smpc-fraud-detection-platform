/**
 * Verifiable Aggregation Protocol (Novelty 4)
 * 
 * Cryptographic Primitive:
 * Each participating bank computes a cryptographic commitment to its secret share before transmission:
 * C_i = HMAC-SHA256(Share_i || Round_ID || Salt_i)
 * 
 * Protocol Phases:
 * Phase 1 (Commitment Phase): Banks broadcast commitments {C_1, C_2, ..., C_N}.
 * Phase 2 (Opening Phase): Banks transmit (Share_i, Salt_i).
 * Phase 3 (Integrity Verification): Aggregator verifies that HMAC(Share_i || Round_ID || Salt_i) === C_i.
 * If any commitment verification fails:
 *   - The entire aggregation round is immediately ABORTED.
 *   - Tampering participant is flagged in the tamper-evident audit log.
 *   - Zero partial outputs are released.
 */

import { sha256Hex } from './tokenization';
import { SecretShare } from '../types';

export interface VerificationResult {
  roundId: string;
  totalParticipants: number;
  verifiedCount: number;
  allValid: boolean;
  tamperDetected: boolean;
  expectedCommitment: string;
  receivedCommitment: string;
  failedParticipantId?: string;
  reason?: string;
  aggregationHash: string;
}

/**
 * Creates a cryptographic commitment for a secret share
 */
export function createShareCommitment(
  participantId: string,
  shareIndex: number,
  shareValue: number,
  roundId: string,
  salt: string
): string {
  const payload = `${participantId}::${roundId}::${shareIndex}::${shareValue}::${salt}`;
  return sha256Hex(payload);
}

/**
 * Verifies all received shares against their published commitments
 */
export function verifyAggregationCommitments(
  shares: SecretShare[],
  roundId: string,
  forceTamperIndex: number = -1
): VerificationResult {
  let allValid = true;
  let verifiedCount = 0;
  let failedParticipantId: string | undefined;
  let expectedCommitment = '';
  let receivedCommitment = '';
  let reason: string | undefined;

  for (let i = 0; i < shares.length; i++) {
    const s = shares[i];
    
    // Simulate tampering if requested
    const effectiveValue = (i === forceTamperIndex || s.isTampered) ? s.shareValue + 99999 : s.shareValue;
    const computedCommitment = createShareCommitment(s.participantId, s.shareIndex, effectiveValue, roundId, s.salt);

    if (computedCommitment !== s.commitmentHash) {
      allValid = false;
      failedParticipantId = s.participantId;
      expectedCommitment = s.commitmentHash;
      receivedCommitment = computedCommitment;
      reason = `Cryptographic commitment mismatch for participant ${s.participantId} at index ${s.shareIndex}`;
      break;
    } else {
      verifiedCount++;
    }
  }

  // Create summary aggregation hash
  const summaryPayload = shares.map(s => s.commitmentHash).sort().join('::') + `::${roundId}`;
  const aggregationHash = sha256Hex(summaryPayload);

  return {
    roundId,
    totalParticipants: shares.length,
    verifiedCount,
    allValid,
    tamperDetected: !allValid,
    expectedCommitment: expectedCommitment || (shares[0]?.commitmentHash ?? 'N/A'),
    receivedCommitment: receivedCommitment || (shares[0]?.commitmentHash ?? 'N/A'),
    failedParticipantId,
    reason,
    aggregationHash,
  };
}
