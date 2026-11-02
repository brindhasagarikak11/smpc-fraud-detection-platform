/**
 * Tamper-Evident Hash-Chain Audit Log
 * 
 * Cryptographic Architecture:
 * Every fraud risk aggregation round generates an immutable audit record linked to the previous
 * record via SHA-256 hash chaining:
 * H_k = SHA256(H_{k-1} || Event_ID || Round_ID || Participants || Aggregation_Hash || Decision || Timestamp)
 * 
 * Verification:
 * An auditor can verify the entire log linearly from the Genesis block to the latest entry.
 * Any retroactively modified field breaks the cryptographic linkage at the exact index of tampering.
 * 
 * DISCLAIMER:
 * This is a Tamper-Evident Hash-Chain Audit Log for research integrity verification,
 * NOT a decentralized blockchain consensus mechanism.
 */

import { sha256Hex } from './tokenization';
import { AuditEvent, FraudDecision } from '../types';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Computes the hash of an audit event linked to previous hash
 */
export function computeEventHash(
  previousHash: string,
  eventId: string,
  roundId: string,
  participantCount: number,
  threshold: number,
  shardCount: number,
  protocolVersion: string,
  commitmentHash: string,
  aggregationHash: string,
  verificationStatus: string,
  decision: string,
  timestamp: string
): string {
  const payload = [
    previousHash,
    eventId,
    roundId,
    participantCount.toString(),
    threshold.toString(),
    shardCount.toString(),
    protocolVersion,
    commitmentHash,
    aggregationHash,
    verificationStatus,
    decision,
    timestamp,
  ].join('|');

  return sha256Hex(payload);
}

/**
 * Creates a new audit event and appends to the chain
 */
export function createAuditEvent(
  existingChain: AuditEvent[],
  roundId: string,
  participantCount: number,
  threshold: number,
  shardCount: number,
  commitmentHash: string,
  aggregationHash: string,
  verificationStatus: 'PASSED' | 'FAILED' | 'REJECTED',
  decision: FraudDecision,
  timestamp: string = new Date().toISOString()
): AuditEvent {
  const previousHash = existingChain.length > 0 
    ? existingChain[existingChain.length - 1].currentHash 
    : GENESIS_HASH;

  const eventIndex = existingChain.length + 1;
  const eventId = `EVT-${String(eventIndex).padStart(4, '0')}`;
  const protocolVersion = 'SMPC-FRAUD-v1.0';

  const currentHash = computeEventHash(
    previousHash,
    eventId,
    roundId,
    participantCount,
    threshold,
    shardCount,
    protocolVersion,
    commitmentHash,
    aggregationHash,
    verificationStatus,
    decision,
    timestamp
  );

  return {
    eventId,
    timestamp,
    roundId,
    participantCount,
    threshold,
    shardCount,
    protocolVersion,
    commitmentHash,
    aggregationHash,
    verificationStatus,
    decision,
    previousHash,
    currentHash,
  };
}

export interface ChainVerificationResult {
  isValid: boolean;
  totalEvents: number;
  brokenLinkIndex?: number;
  compromisedEventId?: string;
  expectedHash?: string;
  actualHash?: string;
  message: string;
}

/**
 * Validates cryptographic integrity of the entire audit chain
 */
export function verifyAuditChain(chain: AuditEvent[]): ChainVerificationResult {
  if (chain.length === 0) {
    return {
      isValid: true,
      totalEvents: 0,
      message: 'Audit chain is empty.',
    };
  }

  let prevHash = GENESIS_HASH;

  for (let i = 0; i < chain.length; i++) {
    const event = chain[i];

    // Check previous hash linkage
    if (event.previousHash !== prevHash) {
      return {
        isValid: false,
        totalEvents: chain.length,
        brokenLinkIndex: i,
        compromisedEventId: event.eventId,
        expectedHash: prevHash,
        actualHash: event.previousHash,
        message: `Broken cryptographic link at Event ${event.eventId} (Index ${i}): previousHash mismatch.`,
      };
    }

    // Recompute current hash
    const expectedCurrentHash = computeEventHash(
      event.previousHash,
      event.eventId,
      event.roundId,
      event.participantCount,
      event.threshold,
      event.shardCount,
      event.protocolVersion,
      event.commitmentHash,
      event.aggregationHash,
      event.verificationStatus,
      event.decision,
      event.timestamp
    );

    if (event.currentHash !== expectedCurrentHash) {
      return {
        isValid: false,
        totalEvents: chain.length,
        brokenLinkIndex: i,
        compromisedEventId: event.eventId,
        expectedHash: expectedCurrentHash,
        actualHash: event.currentHash,
        message: `Tampered payload detected in Event ${event.eventId} (Index ${i}): hash recomputation failed.`,
      };
    }

    prevHash = event.currentHash;
  }

  return {
    isValid: true,
    totalEvents: chain.length,
    message: `All ${chain.length} audit chain events verified successfully with zero tampering detected.`,
  };
}

/**
 * Exports audit log to CSV format
 */
export function exportAuditLogToCSV(chain: AuditEvent[]): string {
  const headers = [
    'Event ID',
    'Timestamp',
    'Round ID',
    'Participants',
    'Threshold',
    'Shards',
    'Protocol',
    'Commitment Hash',
    'Aggregation Hash',
    'Verification Status',
    'Decision',
    'Previous Hash',
    'Current Hash'
  ];

  const rows = chain.map(e => [
    e.eventId,
    e.timestamp,
    e.roundId,
    e.participantCount,
    e.threshold,
    e.shardCount,
    e.protocolVersion,
    e.commitmentHash,
    e.aggregationHash,
    e.verificationStatus,
    e.decision,
    e.previousHash,
    e.currentHash
  ]);

  return [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');
}
