/**
 * Type Definitions for Secure Multiparty Computation Cross-Bank Fraud Aggregation Platform
 */

export type RiskLevel = 'SAFE' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FraudDecision = 'SAFE' | 'MANUAL_REVIEW' | 'FRAUD_ALERT';
export type AggregationMethod = 'SECURE_SUM' | 'SECURE_AVERAGE' | 'SECURE_WEIGHTED_AVERAGE';
export type EngineMode = 'IN_BROWSER' | 'FASTAPI_BACKEND';
export type ThreatActorType = 
  | 'SEMI_HONEST_BANK'
  | 'SEMI_HONEST_AGGREGATOR'
  | 'PARTICIPANT_DROPOUT'
  | 'TAMPERING_ATTACKER'
  | 'INVALID_SHARE_ATTACKER'
  | 'NETWORK_ADVERSARY';

export interface BankNode {
  id: string;
  name: string;
  code: string;
  avatar: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'DROPPED_OUT';
  localModel: string;
  localAccuracy: number; // e.g. 94.8%
  scoringLatencyMs: number;
  weight: number; // For weighted aggregation
  transactionCount: number;
  privateScore?: number;
  color: string;
  ipEndpoint?: string;
  region?: string;
}

export interface TransactionInput {
  id: string;
  rawCustomerId?: string;
  customerToken: string;
  amount: number;
  merchantCategory: string;
  locationRisk: number;
  deviceRisk: number;
  velocity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  accountAgeMonths: number;
  amountDeviationZ: number;
  timestamp: string;
}

export interface SecretShare {
  participantId: string;
  shareIndex: number;
  shareValue: number;
  salt: string;
  commitmentHash: string;
  isTampered?: boolean;
}

export interface ShardGroup {
  shardId: string;
  name: string;
  participantIds: string[];
  shardAggregate?: number;
  status: 'PENDING' | 'AGGREGATING' | 'COMPLETED' | 'FAILED';
  latencyMs: number;
}

export interface DPConfig {
  enabled: boolean;
  epsilon: number;
  delta?: number;
  sensitivity: number;
  clippingBound: number;
  mechanism: 'LAPLACE' | 'GAUSSIAN';
}

export interface LatencyBreakdown {
  localScoringMs: number;
  tokenizationMs: number;
  shareGenerationMs: number;
  shardingMs: number;
  communicationMs: number;
  secureAggregationMs: number;
  verificationMs: number;
  dpPerturbationMs: number;
  decisionEngineMs: number;
  totalLatencyMs: number;
}

export interface CommunicationMetrics {
  messagesSent: number;
  messagesReceived: number;
  bytesSent: number;
  bytesReceived: number;
  totalBytes: number;
  bytesPerTransaction: number;
  averageMessageSizeBytes: number;
}

export interface LatencyPercentiles {
  averageMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  minMs: number;
  maxMs: number;
}

export interface SimulationResult {
  transactionId: string;
  customerToken: string;
  participants: number;
  threshold: number;
  thresholdSatisfied: boolean;
  shardsCount: number;
  aggregationMethod: AggregationMethod;
  rawAggregateRisk: number;
  dpAggregateRisk: number;
  dpNoiseAdded: number;
  riskLevel: RiskLevel;
  decision: FraudDecision;
  confidenceScore: number;
  verificationPassed: boolean;
  tamperDetected: boolean;
  latencyBreakdown: LatencyBreakdown;
  communicationMetrics: CommunicationMetrics;
  auditEventId: string;
  sharesBreakdown: SecretShare[];
  timestamp: string;
}

export interface AuditEvent {
  eventId: string;
  timestamp: string;
  roundId: string;
  participantCount: number;
  threshold: number;
  shardCount: number;
  protocolVersion: string;
  commitmentHash: string;
  aggregationHash: string;
  verificationStatus: 'PASSED' | 'FAILED' | 'REJECTED';
  decision: FraudDecision;
  previousHash: string;
  currentHash: string;
  isTampered?: boolean;
}

export interface ThreatActor {
  id: string;
  name: string;
  role: string;
  description: string;
  allowedAccess: string[];
  prohibitedAccess: string[];
  mitigation: string;
}

export interface AblationConfig {
  id: 'CONFIG_A' | 'CONFIG_B' | 'CONFIG_C' | 'CONFIG_D';
  name: string;
  description: string;
  hasSMPC: boolean;
  hasSharding: boolean;
  hasDP: boolean;
  hasVerification: boolean;
  latencyMs: number;
  communicationKb: number;
  privacyGuarantee: string;
  accuracyF1: number;
  availabilityPct: number;
  integrityVerified: boolean;
}

export interface BaselineMethod {
  id: string;
  name: string;
  category: string;
  privacyScore: number;
  latencyMs: number;
  communicationKb: number;
  scalabilityScore: number;
  verificationSupported: boolean;
  faultToleranceSupported: boolean;
  individualScoreExposure: number;
  f1Score: number;
  description: string;
}
