import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import { OverviewPage } from './components/overview/OverviewPage';
import { LiveSimulation } from './components/simulation/LiveSimulation';
import { BankNetworkGraph } from './components/network/BankNetworkGraph';
import { SmpcProtocolPage } from './components/smpc/SmpcProtocolPage';
import { DifferentialPrivacyView } from './components/novelties/DifferentialPrivacyView';
import { FraudAnalyticsDashboard } from './components/analytics/FraudAnalyticsDashboard';
import { PerformancePage } from './components/performance/PerformancePage';
import { BaselineComparison } from './components/performance/BaselineComparison';
import { SecurityCenter } from './components/security/SecurityCenter';
import { DataAnonymizationPage } from './components/research/DataAnonymizationPage';
import { PrivacyUtilityOptimization } from './components/privacy/PrivacyUtilityOptimization';
import { SecurityAnalytics } from './components/security/SecurityAnalytics';
import { PresentationMode } from './components/presentation/PresentationMode';
import { EngineMode, AuditEvent } from './types';
import { GENESIS_HASH } from './crypto-engine/auditChain';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [educationalDebugMode, setEducationalDebugMode] = useState<boolean>(false);
  const [engineMode, setEngineMode] = useState<EngineMode>('IN_BROWSER');
  const bankCount = 3;

  // Global Tamper-Evident Hash-Chain Audit State
  const [auditChain, setAuditChain] = useState<AuditEvent[]>([
    {
      eventId: 'EVT-0001',
      timestamp: '2026-08-19 18:21:00',
      roundId: 'SMPC-2026-0001',
      participantCount: 3,
      threshold: 2,
      shardCount: 1,
      protocolVersion: 'SMPC-FRAUD-v1.0',
      commitmentHash: 'a82f101c9428b12e',
      aggregationHash: 'e41c198a002bc45a',
      verificationStatus: 'PASSED',
      decision: 'FRAUD_ALERT',
      previousHash: GENESIS_HASH,
      currentHash: '3f8a921b7c4d0e12a95c8e2194b01df391a82e9471bc048291a0c9428b12e091',
    },
    {
      eventId: 'EVT-0002',
      timestamp: '2026-08-19 18:22:00',
      roundId: 'SMPC-2026-0002',
      participantCount: 3,
      threshold: 2,
      shardCount: 1,
      protocolVersion: 'SMPC-FRAUD-v1.0',
      commitmentHash: 'b94e202d8539c23f',
      aggregationHash: 'f52d209b113cd56b',
      verificationStatus: 'PASSED',
      decision: 'SAFE',
      previousHash: '3f8a921b7c4d0e12a95c8e2194b01df391a82e9471bc048291a0c9428b12e091',
      currentHash: '7a1d84920c5e3f19b84d9f3205c12ea402b93f0582cd159302b1d0539c23f102',
    },
    {
      eventId: 'EVT-0003',
      timestamp: '2026-08-19 18:23:00',
      roundId: 'SMPC-2026-0003',
      participantCount: 3,
      threshold: 2,
      shardCount: 1,
      protocolVersion: 'SMPC-FRAUD-v1.0',
      commitmentHash: 'c05f303e9640d34a',
      aggregationHash: 'a63e310c224de67c',
      verificationStatus: 'PASSED',
      decision: 'MANUAL_REVIEW',
      previousHash: '7a1d84920c5e3f19b84d9f3205c12ea402b93f0582cd159302b1d0539c23f102',
      currentHash: '9c2e75031d6f4a20c95e0a4316d23fb513c04a1693de260413c2e1640d34a213',
    },
  ]);

  const handleAppendAuditEvent = (newEvent: AuditEvent) => {
    setAuditChain((prev) => [...prev, newEvent]);
  };

  const handleToggleEngineMode = () => {
    setEngineMode((prev) => (prev === 'IN_BROWSER' ? 'FASTAPI_BACKEND' : 'IN_BROWSER'));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Presentation Mode Fullscreen Overlay */}
      {isPresentationMode && (
        <PresentationMode
          onExit={() => setIsPresentationMode(false)}
          onNavigateToLiveSimulation={() => {
            setIsPresentationMode(false);
            setActiveTab('simulation');
          }}
        />
      )}

      {/* Main App Layout */}
      {!isPresentationMode && (
        <>
          {/* Header */}
          <Header
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            isPresentationMode={isPresentationMode}
            onTogglePresentationMode={() => setIsPresentationMode(true)}
            educationalDebugMode={educationalDebugMode}
            onToggleDebugMode={() => setEducationalDebugMode(!educationalDebugMode)}
            engineMode={engineMode}
            onToggleEngineMode={handleToggleEngineMode}
            bankCount={bankCount}
          />

          {/* Navigation Bar */}
          <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />

          {/* Page Content Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {activeTab === 'overview' && (
              <OverviewPage
                onNavigateToSimulation={() => setActiveTab('simulation')}
                onNavigateToArchitecture={() => {
                  const elem = document.getElementById('architecture-section');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            {activeTab === 'simulation' && (
              <LiveSimulation
                educationalDebugMode={educationalDebugMode}
                onNewAuditEvent={handleAppendAuditEvent}
                existingAuditChain={auditChain}
                engineMode={engineMode}
              />
            )}

            {activeTab === 'network' && <BankNetworkGraph />}

            {activeTab === 'smpc-engine' && <SmpcProtocolPage />}

            {activeTab === 'privacy' && (
              <div className="space-y-6 pb-16">
                <DifferentialPrivacyView />
              </div>
            )}

            {activeTab === 'analytics' && <FraudAnalyticsDashboard />}

            {activeTab === 'performance' && <PerformancePage />}

            {activeTab === 'baselines' && (
              <div className="space-y-6 pb-16">
                <BaselineComparison />
              </div>
            )}

            {activeTab === 'security' && <SecurityCenter auditEvents={auditChain} />}

            {activeTab === 'dataset' && <DataAnonymizationPage />}

            {activeTab === 'privacy-utility' && <PrivacyUtilityOptimization />}

            {activeTab === 'security-analytics' && <SecurityAnalytics />}
          </main>

          {/* Persistent Footer */}
          <footer className="bg-slate-950 border-t border-slate-900 px-4 py-6 text-xs text-slate-500 font-mono">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <p className="text-slate-400 font-semibold">
                  Secure Multiparty Computation for Cross-Bank Fraud Score Aggregation
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Lightweight SMPC Research Protocol
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span>Semi-Honest Model</span>
                <span>•</span>
                <span>Near-Real-Time Target</span>
                <span>•</span>
                <span className="text-cyan-400">v1.0-RESEARCH</span>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};
