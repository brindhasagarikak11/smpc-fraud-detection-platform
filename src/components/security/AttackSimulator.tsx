import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Play, RefreshCw, XCircle, CheckCircle2, WifiOff, Terminal } from 'lucide-react';

export const AttackSimulator: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<'DROPOUT' | 'TAMPER' | 'INVALID' | 'DUPLICATE' | 'JITTER'>('TAMPER');

  // Attack parameters state
  const [droppedCount, setDroppedCount] = useState<number>(2);
  const [totalNodes, setTotalNodes] = useState<number>(5);
  const [threshold, setThreshold] = useState<number>(3);
  const [tamperedValue, setTamperedValue] = useState<number>(99999);
  const [jitterMs, setJitterMs] = useState<number>(150);

  // Computed results
  const isDropoutPassed = (totalNodes - droppedCount) >= threshold;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
        <span className="font-bold text-white block mb-0.5">
          Adversarial Sandbox & Attack Simulator
        </span>
        <p className="text-slate-400">
          Inject malicious payloads, network partitions, or Byzantine manipulations to evaluate protocol defenses and automated abort mechanisms.
        </p>
      </div>

      {/* Scenario Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
        <button
          onClick={() => setActiveScenario('TAMPER')}
          className={`p-2.5 rounded-lg border text-left font-bold transition-all ${
            activeScenario === 'TAMPER'
              ? 'bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          1. Share Tampering
        </button>

        <button
          onClick={() => setActiveScenario('DROPOUT')}
          className={`p-2.5 rounded-lg border text-left font-bold transition-all ${
            activeScenario === 'DROPOUT'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          2. Bank Dropout
        </button>

        <button
          onClick={() => setActiveScenario('INVALID')}
          className={`p-2.5 rounded-lg border text-left font-bold transition-all ${
            activeScenario === 'INVALID'
              ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          3. Invalid Share
        </button>

        <button
          onClick={() => setActiveScenario('DUPLICATE')}
          className={`p-2.5 rounded-lg border text-left font-bold transition-all ${
            activeScenario === 'DUPLICATE'
              ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          4. Duplicate Node
        </button>

        <button
          onClick={() => setActiveScenario('JITTER')}
          className={`p-2.5 rounded-lg border text-left font-bold transition-all ${
            activeScenario === 'JITTER'
              ? 'bg-blue-950/80 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          5. Network Jitter
        </button>
      </div>

      {/* Scenario Execution Body */}
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
        {/* Scenario 1: Tampering */}
        {activeScenario === 'TAMPER' && (
          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Attack Scenario: In-Flight Bit Manipulation / Score Forgery
              </span>
              <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                Active MitM Adversary
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-slate-400 block font-bold">Injected Malicious Value:</span>
                <input
                  type="number"
                  value={tamperedValue}
                  onChange={(e) => setTamperedValue(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500">
                  Adversary attempts to modify secret share to deflate risk score
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-600 space-y-2 text-red-200">
                <div className="flex items-center gap-1.5 font-bold text-red-400">
                  <XCircle className="w-4 h-4" />
                  <span>Defensive Response: ROUND ABORTED</span>
                </div>
                <div className="text-[11px] space-y-1">
                  <div>Expected Commitment: <span className="text-cyan-300">a82f91a0c9428b12</span></div>
                  <div>Received Commitment: <span className="text-red-300">b73d81aa440192e1</span></div>
                  <div className="text-white font-bold pt-1">✕ Cryptographic Verification Failed. Zero Score Released.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scenario 2: Dropout */}
        {activeScenario === 'DROPOUT' && (
          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <WifiOff className="w-4 h-4" />
                Attack Scenario: Bank Node Dropout / Cloud Failure
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Quorum Evaluation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block mb-1">Total Bank Nodes: {totalNodes}</span>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={totalNodes}
                  onChange={(e) => setTotalNodes(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Required Quorum (t): {threshold}</span>
                <input
                  type="range"
                  min="2"
                  max={totalNodes}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Dropped Nodes: {droppedCount}</span>
                <input
                  type="range"
                  min="0"
                  max={totalNodes}
                  value={droppedCount}
                  onChange={(e) => setDroppedCount(Number(e.target.value))}
                  className="w-full accent-red-400 cursor-pointer"
                />
              </div>
            </div>

            <div className={`p-3.5 rounded-lg border font-bold flex items-center justify-between ${
              isDropoutPassed
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                : 'bg-red-950/60 border-red-500 text-red-300'
            }`}>
              <span>
                {isDropoutPassed
                  ? `✓ Quorum Satisfied (${totalNodes - droppedCount} / ${threshold} online). Aggregation Proceeds.`
                  : `✕ Quorum Broken (${totalNodes - droppedCount} < ${threshold} required). Aggregation Safely Blocked.`}
              </span>
              <span>{isDropoutPassed ? 'SUCCESS' : 'HALTED'}</span>
            </div>
          </div>
        )}

        {/* Scenario 3: Invalid Share */}
        {activeScenario === 'INVALID' && (
          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Attack Scenario: Malformed Float / NaN Payload Injection
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-600 text-amber-200">
              <span className="font-bold block mb-1">Sanitization Defense:</span>
              <p>Type coercion and finite field domain checks reject NaN, Infinity, and out-of-range floats before sharder dispatching.</p>
            </div>
          </div>
        )}

        {/* Scenario 4: Duplicate */}
        {activeScenario === 'DUPLICATE' && (
          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-purple-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Attack Scenario: Sybil / Duplicate Share Submission
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-purple-950/40 border border-purple-600 text-purple-200">
              <span className="font-bold block mb-1">Sybil Defense:</span>
              <p>Consortium participant whitelist validates single contribution per authenticated participant ID per round.</p>
            </div>
          </div>
        )}

        {/* Scenario 5: Jitter */}
        {activeScenario === 'JITTER' && (
          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-blue-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                Attack Scenario: WAN Network Jitter & Delay Simulation
              </span>
            </div>
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Injected Network Delay:</span>
                <span className="text-cyan-300 font-bold">+{jitterMs} ms</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={jitterMs}
                onChange={(e) => setJitterMs(Number(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer"
              />
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex justify-between">
              <span>Total Simulated Aggregation Latency:</span>
              <span className="font-bold text-white">{(36.8 + jitterMs).toFixed(1)} ms</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
