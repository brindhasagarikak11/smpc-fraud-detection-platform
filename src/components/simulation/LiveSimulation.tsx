import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Sliders,
  Shield,
  Shuffle,
  Pause,
  ChevronRight,
  AlertTriangle,
  Lock,
  Cpu,
} from 'lucide-react';
import { BankCard } from './BankCard';
import { PipelineAnimator, PipelineStage } from './PipelineAnimator';
import { DecisionHUD } from './DecisionHUD';
import { SecretSharingInspector } from './SecretSharingInspector';
import { INITIAL_BANKS, calculateLocalBankScore } from '../../data/mockBanks';
import { SAMPLE_TRANSACTIONS, generateRandomTransaction, MERCHANT_CATEGORIES } from '../../data/syntheticTxns';
import { generateAdditiveShares } from '../../crypto-engine/additiveSharing';
import { computeDynamicSharding } from '../../crypto-engine/dynamicSharding';
import { computeSecureAggregation } from '../../crypto-engine/weightedAggregation';
import { applyAdaptiveDifferentialPrivacy } from '../../crypto-engine/differentialPrivacy';
import { verifyAggregationCommitments } from '../../crypto-engine/verifiableCommitments';
import { generateCustomerToken } from '../../crypto-engine/tokenization';
import { createAuditEvent } from '../../crypto-engine/auditChain';
import {
  BankNode,
  TransactionInput,
  SimulationResult,
  AggregationMethod,
  SecretShare,
  AuditEvent,
  EngineMode,
} from '../../types';

interface LiveSimulationProps {
  educationalDebugMode: boolean;
  onNewAuditEvent?: (event: AuditEvent) => void;
  existingAuditChain?: AuditEvent[];
  engineMode?: EngineMode;
}

export const LiveSimulation: React.FC<LiveSimulationProps> = ({
  educationalDebugMode,
  onNewAuditEvent,
  existingAuditChain = [],
  engineMode = 'IN_BROWSER',
}) => {
  // --- Simulation Configuration State ---
  const [bankCount, setBankCount] = useState<number>(3);
  const [activeTransaction, setActiveTransaction] = useState<TransactionInput>(SAMPLE_TRANSACTIONS[0]);
  const [aggregationMethod, setAggregationMethod] = useState<AggregationMethod>('SECURE_WEIGHTED_AVERAGE');
  const [epsilon, setEpsilon] = useState<number>(1.0);
  const [isStepByStepMode, setIsStepByStepMode] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(0);

  // --- Execution & Animation State ---
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<PipelineStage>('IDLE');
  const [tamperInjected, setTamperInjected] = useState<boolean>(false);
  const [droppedBanksCount, setDroppedBanksCount] = useState<number>(0);

  // --- Computed Results State ---
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [currentShares, setCurrentShares] = useState<SecretShare[]>([]);
  const [localScoresMap, setLocalScoresMap] = useState<Record<string, number>>({});

  const activeBanks = INITIAL_BANKS.slice(0, bankCount);

  // Calculate local scores whenever transaction or bank selection changes
  useEffect(() => {
    const scores: Record<string, number> = {};
    activeBanks.forEach((bank) => {
      scores[bank.id] = calculateLocalBankScore(
        bank,
        activeTransaction.amount,
        activeTransaction.merchantCategory,
        activeTransaction.locationRisk,
        activeTransaction.deviceRisk,
        activeTransaction.velocity,
        activeTransaction.accountAgeMonths
      );
    });
    setLocalScoresMap(scores);
  }, [activeTransaction, bankCount]);

  // Execute full automated or fast-forward simulation
  const runFullSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationResult(null);

    // FASTAPI_BACKEND mode executes the actual Python SMPC protocol.
    if (engineMode === 'FASTAPI_BACKEND') {
      try {
        setCurrentStage('LOCAL_SCORING');
        await new Promise((r) => setTimeout(r, 250));
        setCurrentStage('SECRET_SHARING');
        await new Promise((r) => setTimeout(r, 250));
        setCurrentStage('DYNAMIC_SHARDING');
        await new Promise((r) => setTimeout(r, 250));

        const response = await fetch('http://127.0.0.1:8000/api/simulation/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_id: activeTransaction.id,
            raw_customer_id: activeTransaction.rawCustomerId || activeTransaction.customerToken,
            amount: activeTransaction.amount,
            merchant_category: activeTransaction.merchantCategory,
            location_risk: activeTransaction.locationRisk,
            device_risk: activeTransaction.deviceRisk,
            velocity: activeTransaction.velocity,
            account_age_months: activeTransaction.accountAgeMonths,
            num_banks: bankCount,
            threshold_ratio: 0.67,
            aggregation_method: aggregationMethod,
            epsilon,
            use_sharding: true,
            use_dp: true,
            use_verification: true,
            educational_debug_mode: educationalDebugMode,
          }),
        });

        if (!response.ok) throw new Error(`FastAPI returned ${response.status}`);
        const api = await response.json();

        if (!api.threshold_satisfied || api.decision === 'REJECTED_THRESHOLD') {
          setCurrentStage('FINAL_DECISION');
          setIsSimulating(false);
          return;
        }

        setCurrentStage('SECURE_AGGREGATION');
        await new Promise((r) => setTimeout(r, 250));
        setCurrentStage('VERIFICATION');
        await new Promise((r) => setTimeout(r, 250));
        setCurrentStage('DIFFERENTIAL_PRIVACY');
        await new Promise((r) => setTimeout(r, 250));
        setCurrentStage('FINAL_DECISION');

        const b = api.latency_breakdown || {};
        const c = api.communication || {};
        const backendResult: SimulationResult = {
          transactionId: api.transaction_id,
          customerToken: api.customer_token,
          participants: api.participants,
          threshold: api.threshold,
          thresholdSatisfied: api.threshold_satisfied !== false,
          shardsCount: api.shards,
          aggregationMethod: api.aggregation_method as AggregationMethod,
          rawAggregateRisk: api.final_aggregate_score === null ? 0 : (api.raw_aggregate ?? api.final_aggregate_score),
          dpAggregateRisk: api.final_aggregate_score ?? 0,
          dpNoiseAdded: api.dp_noise_added ?? 0,
          riskLevel: api.risk_level as SimulationResult['riskLevel'],
          decision: api.decision as SimulationResult['decision'],
          confidenceScore: 100,
          verificationPassed: api.verified,
          tamperDetected: api.tamper_detected,
          latencyBreakdown: {
            localScoringMs: b.local_scoring_ms ?? 0,
            tokenizationMs: b.tokenization_ms ?? 0,
            shareGenerationMs: b.share_generation_ms ?? 0,
            shardingMs: b.sharding_ms ?? 0,
            communicationMs: b.communication_ms ?? 0,
            secureAggregationMs: b.secure_aggregation_ms ?? 0,
            verificationMs: b.verification_ms ?? 0,
            dpPerturbationMs: b.dp_perturbation_ms ?? 0,
            decisionEngineMs: b.decision_ms ?? 0,
            totalLatencyMs: api.total_latency_ms ?? b.total_ms ?? 0,
          },
          communicationMetrics: {
            messagesSent: c.messages ?? 0,
            messagesReceived: 0,
            bytesSent: c.bytes ?? 0,
            bytesReceived: 0,
            totalBytes: c.bytes ?? 0,
            bytesPerTransaction: c.bytes ?? 0,
            averageMessageSizeBytes: c.messages ? Math.round(c.bytes / c.messages) : 0,
          },
          auditEventId: api.audit_event_id ?? 'BACKEND-EVENT',
          sharesBreakdown: [],
          timestamp: new Date().toISOString(),
        };

        setSimulationResult(backendResult);
        setIsSimulating(false);
        return;
      } catch (error) {
        console.error('FastAPI SMPC engine failed:', error);
        setCurrentStage('IDLE');
        setIsSimulating(false);
        window.alert('FastAPI SMPC engine is unavailable. Start the backend with: uvicorn backend.main:app --reload');
        return;
      }
    }

    // Stage 1: Local Scoring
    setCurrentStage('LOCAL_SCORING');
    await new Promise((r) => setTimeout(r, 400));

    // Stage 2: Secret Sharing
    setCurrentStage('SECRET_SHARING');
    const allGeneratedShares: SecretShare[] = [];
    activeBanks.forEach((bank) => {
      const score = localScoresMap[bank.id] || 75;
      const bankShares = generateAdditiveShares(bank.id, score, bankCount);
      allGeneratedShares.push(...bankShares);
    });
    setCurrentShares(allGeneratedShares);
    await new Promise((r) => setTimeout(r, 450));

    // Stage 3: Dynamic Sharding
    setCurrentStage('DYNAMIC_SHARDING');
    const shardingPlan = computeDynamicSharding(activeBanks, 3);
    await new Promise((r) => setTimeout(r, 350));

    // Stage 4: Secure Aggregation
    setCurrentStage('SECURE_AGGREGATION');
    const contributions = activeBanks.map((b) => ({
      bankId: b.id,
      privateScore: localScoresMap[b.id] || 75,
      weight: b.weight,
    }));
    const aggResult = computeSecureAggregation(contributions, aggregationMethod);
    await new Promise((r) => setTimeout(r, 400));

    // Stage 5: Verification & Tamper Check
    setCurrentStage('VERIFICATION');
    const roundId = `SMPC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const verResult = verifyAggregationCommitments(
      allGeneratedShares,
      roundId,
      tamperInjected ? 0 : -1
    );
    await new Promise((r) => setTimeout(r, 400));

    if (!verResult.allValid) {
      // Abort round on tampering
      setIsSimulating(false);
      return;
    }

    // Stage 6: Differential Privacy
    setCurrentStage('DIFFERENTIAL_PRIVACY');
    const dpResult = applyAdaptiveDifferentialPrivacy(aggResult.rawAggregate, bankCount, {
      epsilon,
      clippingBound: 100,
    });
    await new Promise((r) => setTimeout(r, 350));

    // Stage 7: Final Decision
    setCurrentStage('FINAL_DECISION');
    const finalScore = dpResult.dpProtectedScore;
    const decision = finalScore >= 70 ? 'FRAUD_ALERT' : finalScore >= 40 ? 'MANUAL_REVIEW' : 'SAFE';
    const riskLevel = finalScore >= 80 ? 'CRITICAL' : finalScore >= 60 ? 'HIGH' : finalScore >= 40 ? 'MEDIUM' : 'SAFE';

    // Latency waterfall
    const latencyBreakdown = {
      localScoringMs: 7.4,
      tokenizationMs: 1.2,
      shareGenerationMs: 4.5,
      shardingMs: 2.6,
      communicationMs: 10.8,
      secureAggregationMs: 5.2,
      verificationMs: 3.6,
      dpPerturbationMs: 1.5,
      decisionEngineMs: 0.8,
      totalLatencyMs: 37.6,
    };

    const commMetrics = {
      messagesSent: shardingPlan.totalBanks * 2,
      messagesReceived: shardingPlan.totalBanks * 2,
      bytesSent: shardingPlan.estimatedCommunicationKb * 512,
      bytesReceived: shardingPlan.estimatedCommunicationKb * 512,
      totalBytes: shardingPlan.estimatedCommunicationKb * 1024,
      bytesPerTransaction: shardingPlan.estimatedCommunicationKb * 1024,
      averageMessageSizeBytes: 192,
    };

    const newResult: SimulationResult = {
      transactionId: activeTransaction.id,
      customerToken: activeTransaction.customerToken,
      participants: bankCount,
      threshold: Math.max(2, Math.round(bankCount * 0.67)),
      thresholdSatisfied: true,
      shardsCount: shardingPlan.numShards,
      aggregationMethod,
      rawAggregateRisk: aggResult.rawAggregate,
      dpAggregateRisk: finalScore,
      dpNoiseAdded: dpResult.noiseAdded,
      riskLevel,
      decision,
      confidenceScore: Math.round(85 + Math.random() * 10),
      verificationPassed: verResult.allValid,
      tamperDetected: !verResult.allValid,
      latencyBreakdown,
      communicationMetrics: commMetrics,
      auditEventId: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
      sharesBreakdown: allGeneratedShares,
      timestamp: new Date().toISOString(),
    };

    setSimulationResult(newResult);

    // Create Audit Event
    if (onNewAuditEvent) {
      const auditEvt = createAuditEvent(
        existingAuditChain,
        roundId,
        bankCount,
        newResult.threshold,
        shardingPlan.numShards,
        verResult.expectedCommitment,
        verResult.aggregationHash,
        'PASSED',
        decision
      );
      onNewAuditEvent(auditEvt);
    }

    setIsSimulating(false);
  };

  const handleRandomTxn = () => {
    const randomTxn = generateRandomTransaction();
    setActiveTransaction(randomTxn);
    setSimulationResult(null);
    setCurrentStage('IDLE');
  };

  const handleReset = () => {
    setIsSimulating(false);
    setCurrentStage('IDLE');
    setSimulationResult(null);
    setTamperInjected(false);
    setStepIndex(0);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner Status */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              Live Interbank Fraud Simulation Engine
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Simulate multi-bank local scoring, secret sharing, dynamic sharding & verifiable SMPC aggregation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
            STATUS: {isSimulating ? 'AGGREGATING...' : simulationResult ? 'VERIFIED & DECIDED' : 'READY'}
          </span>
        </div>
      </div>

      {/* Transaction & Simulation Controls Bar */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4" />
            Transaction & Simulation Parameters
          </span>

          <button
            onClick={handleRandomTxn}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-300 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random Suspicious Txn</span>
          </button>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* Number of Banks */}
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Participating Banks</label>
            <select
              value={bankCount}
              onChange={(e) => setBankCount(Number(e.target.value))}
              disabled={isSimulating}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
            >
              <option value={3}>3 Banks (AFB, BCT, CNB)</option>
              <option value={4}>4 Banks (+ DMU)</option>
              <option value={5}>5 Banks (+ ESG)</option>
              <option value={6}>6 Banks (+ FCC)</option>
              <option value={9}>9 Banks (Full Sharded Grid)</option>
            </select>
          </div>

          {/* Amount in INR */}
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Transaction Amount (₹)</label>
            <input
              type="number"
              value={activeTransaction.amount}
              onChange={(e) =>
                setActiveTransaction({ ...activeTransaction, amount: Number(e.target.value) })
              }
              disabled={isSimulating}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Merchant Category */}
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Merchant Category</label>
            <select
              value={activeTransaction.merchantCategory}
              onChange={(e) =>
                setActiveTransaction({ ...activeTransaction, merchantCategory: e.target.value })
              }
              disabled={isSimulating}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
            >
              {MERCHANT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location Risk */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span className="font-medium">Location Risk</span>
              <span className="font-mono text-cyan-300">{activeTransaction.locationRisk}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={activeTransaction.locationRisk}
              onChange={(e) =>
                setActiveTransaction({ ...activeTransaction, locationRisk: Number(e.target.value) })
              }
              disabled={isSimulating}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Device Risk */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span className="font-medium">Device Risk</span>
              <span className="font-mono text-cyan-300">{activeTransaction.deviceRisk}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={activeTransaction.deviceRisk}
              onChange={(e) =>
                setActiveTransaction({ ...activeTransaction, deviceRisk: Number(e.target.value) })
              }
              disabled={isSimulating}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Velocity */}
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Velocity Pattern</label>
            <select
              value={activeTransaction.velocity}
              onChange={(e) =>
                setActiveTransaction({
                  ...activeTransaction,
                  velocity: e.target.value as any,
                })
              }
              disabled={isSimulating}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
            >
              <option value="LOW">Low (Normal)</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High Velocity</option>
              <option value="CRITICAL">Critical (Spam)</option>
            </select>
          </div>
        </div>

        {/* Aggregation Mode & Differential Privacy Selector */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400 font-medium">Aggregation Mode:</span>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setAggregationMethod('SECURE_SUM')}
                className={`px-2.5 py-1 rounded font-mono ${
                  aggregationMethod === 'SECURE_SUM'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400'
                }`}
              >
                Secure Sum
              </button>
              <button
                onClick={() => setAggregationMethod('SECURE_AVERAGE')}
                className={`px-2.5 py-1 rounded font-mono ${
                  aggregationMethod === 'SECURE_AVERAGE'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400'
                }`}
              >
                Secure Average
              </button>
              <button
                onClick={() => setAggregationMethod('SECURE_WEIGHTED_AVERAGE')}
                className={`px-2.5 py-1 rounded font-mono ${
                  aggregationMethod === 'SECURE_WEIGHTED_AVERAGE'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400'
                }`}
              >
                ● Weighted Average
              </button>
            </div>
          </div>

          {/* Privacy Budget Epsilon */}
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">DP Budget ε:</span>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={epsilon}
              onChange={(e) => setEpsilon(Number(e.target.value))}
              disabled={isSimulating}
              className="w-24 accent-cyan-400 cursor-pointer"
            />
            <span className="font-mono text-cyan-300 font-bold w-8">{epsilon.toFixed(1)}</span>
          </div>

          {/* Main Simulation Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={runFullSimulation}
              disabled={isSimulating}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-105 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>RUN SECURE AGGREGATION</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Participating Bank Cards Visualisation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            Participating Bank Nodes ({bankCount} Banks Active)
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {educationalDebugMode ? '⚠ Local Scores Visible (Debug)' : '🔒 Scores Shielded Locally'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeBanks.map((bank, index) => (
            <BankCard
              key={bank.id}
              bank={bank}
              calculatedScore={localScoresMap[bank.id]}
              isScoring={currentStage === 'LOCAL_SCORING'}
              isSharing={currentStage === 'SECRET_SHARING'}
              educationalDebugMode={educationalDebugMode}
              isDroppedOut={index < droppedBanksCount}
            />
          ))}
        </div>
      </div>

      {/* Animated Pipeline Progression */}
      <PipelineAnimator
        currentStage={currentStage}
        verificationPassed={simulationResult ? simulationResult.verificationPassed : true}
        tamperDetected={simulationResult ? simulationResult.tamperDetected : false}
      />

      {/* Final Decision HUD (Rendered when aggregation completes) */}
      {simulationResult && <DecisionHUD result={simulationResult} />}

      {/* Illustrative Secret Sharing Breakdown Inspector */}
      {currentShares.length > 0 && (
        <SecretSharingInspector
          shares={currentShares}
          educationalDebugMode={educationalDebugMode}
          participantCount={bankCount}
        />
      )}
    </div>
  );
};
