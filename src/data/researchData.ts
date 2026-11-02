/**
 * Academic Research Data, Threat Models, and Literature References
 */

import { ThreatActor } from '../types';

export const PROJECT_METADATA = {
  title: 'Secure Multiparty Computation for Cross-Bank Fraud Score Aggregation',
  subtitle: 'Toward Real-Time SMPC: A Lightweight Aggregation Protocol for Interbank Fraud Risk Scores',
  protocolVersion: 'SMPC-FRAUD-v1.0 Research Prototype',
  threatModelAssumptions: 'Semi-Honest Consortium with Commitment-Based Integrity Verification',
  team: [
    { name: 'Reshma G', role: 'Research & Protocol Design' },
    { name: 'Brindha Sagarika K', role: 'Cryptographic Implementation & UI' },
    { name: 'Akshaya G', role: 'Experimental Validation & Analytics' },
  ],
  researchObjective:
    'Design and evaluate a lightweight SMPC-based protocol that allows multiple banks to securely aggregate per-customer fraud-risk scores into a real-time interbank fraud signal without revealing individual bank inputs.',
};

export const THREAT_ACTORS: ThreatActor[] = [
  {
    id: 'ACTOR-1',
    name: 'Semi-Honest Participating Bank',
    role: 'Consortium Participant',
    description: 'Follows the cryptographic protocol correctly but attempts to passively infer customer risk scores of competitor banks from received messages.',
    allowedAccess: ['Own local transaction data', 'Own local model weights', 'Final released DP aggregate result'],
    prohibitedAccess: ['Peer banks local risk scores', 'Peer banks private dataset or raw customer identifiers', 'Unmasked intermediate peer shares'],
    mitigation: 'Additive & Shamir secret sharing guarantees that intermediate shares reveal zero information to any single party.',
  },
  {
    id: 'ACTOR-2',
    name: 'Semi-Honest Central Aggregator',
    role: 'Aggregation Coordinator',
    description: 'Executes the aggregation pipeline and coordination but is curious to inspect individual bank fraud models or scores.',
    allowedAccess: ['Pseudonymous customer tokens', 'Encrypted/blinded secret shares', 'Cryptographic commitment hashes'],
    prohibitedAccess: ['Individual bank local risk scores', 'Original customer identity / account numbers', 'Local ML feature vectors'],
    mitigation: 'Aggregator only receives blinded additive shares whose individual sums cancel out to reveal only the global aggregate.',
  },
  {
    id: 'ACTOR-3',
    name: 'Participant Dropout / Offline Node',
    role: 'Fault Scenario',
    description: 'A participating bank goes offline due to network timeout, cloud outage, or network partition during the aggregation round.',
    allowedAccess: ['None while offline'],
    prohibitedAccess: ['All in-flight communications'],
    mitigation: 'Adaptive (t, n) Threshold Secret Sharing continues seamlessly as long as active participants satisfy quorum t.',
  },
  {
    id: 'ACTOR-4',
    name: 'Malicious Tampering Attacker',
    role: 'Active Byzantine Adversary / MitM',
    description: 'Modifies secret shares in transit to manipulate fraud risk scores (e.g. attempting to lower a fraudulent score to allow a fraudulent transaction).',
    allowedAccess: ['Intercepted ciphertext packets'],
    prohibitedAccess: ['Ability to modify shares without detection'],
    mitigation: 'SHA-256 HMAC commitments bind shares before opening; any bit manipulation causes instant commitment mismatch and round abortion.',
  },
  {
    id: 'ACTOR-5',
    name: 'Invalid / Malformed Share Attacker',
    role: 'Active Adversary',
    description: 'Injects invalid numeric bounds, NaN payloads, or duplicate identities into the aggregation queue.',
    allowedAccess: ['Consortium queue access'],
    prohibitedAccess: ['Consortium state corruption'],
    mitigation: 'Strict type validation, score clipping bounds [0, 100], and duplicate participant rejection before shard dispatching.',
  },
  {
    id: 'ACTOR-6',
    name: 'Network Jitter & High Latency Adversary',
    role: 'Adverse Network Conditions',
    description: 'Introduces unpredictable network delay (50ms - 500ms) across cross-region WAN bank links.',
    allowedAccess: ['Network transmission latency'],
    prohibitedAccess: ['Data payload'],
    mitigation: 'Asynchronous shard pipelining and adaptive timeout thresholds prevent consortium-wide blocking.',
  },
];
