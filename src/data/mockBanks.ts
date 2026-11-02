/**
 * Participating Consortium Banks Definition
 */

import { BankNode } from '../types';

export const INITIAL_BANKS: BankNode[] = [
  {
    id: 'BANK-A',
    name: 'Apex Federal Bank',
    code: 'AFB',
    avatar: '🏦',
    status: 'ONLINE',
    localModel: 'Random Forest (Ensemble 100 trees)',
    localAccuracy: 94.8,
    scoringLatencyMs: 6.2,
    weight: 1.2,
    transactionCount: 14280,
    color: '#06b6d4', // Cyan
  },
  {
    id: 'BANK-B',
    name: 'Beacon Commercial Trust',
    code: 'BCT',
    avatar: '🏛️',
    status: 'ONLINE',
    localModel: 'Gradient Boosted Trees (XGBoost)',
    localAccuracy: 96.1,
    scoringLatencyMs: 7.8,
    weight: 1.0,
    transactionCount: 19540,
    color: '#3b82f6', // Blue
  },
  {
    id: 'BANK-C',
    name: 'Crestline National Bank',
    code: 'CNB',
    avatar: '🏢',
    status: 'ONLINE',
    localModel: 'Deep Multi-Layer Perceptron',
    localAccuracy: 93.4,
    scoringLatencyMs: 8.4,
    weight: 0.9,
    transactionCount: 8920,
    color: '#8b5cf6', // Violet
  },
  {
    id: 'BANK-D',
    name: 'Delta Merchant Union',
    code: 'DMU',
    avatar: '🏦',
    status: 'ONLINE',
    localModel: 'LightGBM Classifier',
    localAccuracy: 95.2,
    scoringLatencyMs: 5.9,
    weight: 1.1,
    transactionCount: 11430,
    color: '#10b981', // Emerald
  },
  {
    id: 'BANK-E',
    name: 'Evergreen Savings Group',
    code: 'ESG',
    avatar: '🌲',
    status: 'ONLINE',
    localModel: 'Regularized Logistic Regression',
    localAccuracy: 91.7,
    scoringLatencyMs: 4.1,
    weight: 0.8,
    transactionCount: 6510,
    color: '#f59e0b', // Amber
  },
  {
    id: 'BANK-F',
    name: 'Frontier Capital Corp',
    code: 'FCC',
    avatar: '⚡',
    status: 'ONLINE',
    localModel: 'Random Forest (150 trees)',
    localAccuracy: 94.5,
    scoringLatencyMs: 6.7,
    weight: 1.0,
    transactionCount: 13200,
    color: '#ec4899', // Pink
  },
  {
    id: 'BANK-G',
    name: 'Global Horizon Bank',
    code: 'GHB',
    avatar: '🌐',
    status: 'ONLINE',
    localModel: 'CatBoost Fraud Engine',
    localAccuracy: 95.8,
    scoringLatencyMs: 7.2,
    weight: 1.15,
    transactionCount: 17800,
    color: '#14b8a6', // Teal
  },
  {
    id: 'BANK-H',
    name: 'Heritage Security Trust',
    code: 'HST',
    avatar: '🛡️',
    status: 'ONLINE',
    localModel: 'Neural Network with Embeddings',
    localAccuracy: 93.9,
    scoringLatencyMs: 9.1,
    weight: 0.95,
    transactionCount: 9400,
    color: '#6366f1', // Indigo
  },
  {
    id: 'BANK-I',
    name: 'Imperial Reserve Bank',
    code: 'IRB',
    avatar: '👑',
    status: 'ONLINE',
    localModel: 'Random Forest + Isolation Forest',
    localAccuracy: 95.0,
    scoringLatencyMs: 6.5,
    weight: 1.05,
    transactionCount: 15600,
    color: '#eab308', // Yellow
  },
];

/**
 * Simulates a local bank ML scoring engine based on transaction features
 * Notice: This is calculated locally inside the bank enclave.
 */
export function calculateLocalBankScore(
  bank: BankNode,
  amount: number,
  merchantCategory: string,
  locationRisk: number,
  deviceRisk: number,
  velocity: string,
  accountAgeMonths: number
): number {
  // Base risk from transaction features
  let baseRisk = 20;

  // Amount factor
  if (amount > 100000) baseRisk += 28;
  else if (amount > 50000) baseRisk += 18;
  else if (amount > 15000) baseRisk += 8;

  // Merchant category factor
  const merchantWeights: Record<string, number> = {
    'Electronics': 16,
    'Gaming': 18,
    'Travel': 12,
    'Online Services': 10,
    'Fuel': 4,
    'Grocery': 2,
    'Healthcare': 3,
  };
  baseRisk += merchantWeights[merchantCategory] ?? 5;

  // Geolocation & Device risk
  baseRisk += locationRisk * 22;
  baseRisk += deviceRisk * 20;

  // Velocity
  const velocityWeights: Record<string, number> = {
    'LOW': 0,
    'MEDIUM': 8,
    'HIGH': 18,
    'CRITICAL': 26,
  };
  baseRisk += velocityWeights[velocity] ?? 5;

  // Account age mitigation
  if (accountAgeMonths < 3) baseRisk += 12;
  else if (accountAgeMonths > 24) baseRisk -= 10;

  // Local model idiosyncratic variance (simulates each bank's proprietary features/data view)
  const bankOffsetMap: Record<string, number> = {
    'BANK-A': 4,
    'BANK-B': -3,
    'BANK-C': 6,
    'BANK-D': -2,
    'BANK-E': -5,
    'BANK-F': 2,
    'BANK-G': -1,
    'BANK-H': 3,
    'BANK-I': -4,
  };

  const modelOffset = bankOffsetMap[bank.id] ?? 0;
  const finalScore = Math.max(5, Math.min(98, Math.round(baseRisk + modelOffset + (Math.random() * 4 - 2))));

  return finalScore;
}
