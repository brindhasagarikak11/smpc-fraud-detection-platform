import React from 'react';
import {
  Home,
  PlayCircle,
  Network,
  Cpu,
  Lock,
  BarChart3,
  Gauge,
  ShieldAlert,
  Layers,
  Database,
  Scale,
  ShieldCheck,
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'simulation', label: 'Live Simulation', icon: PlayCircle, highlight: true },
  { id: 'network', label: 'Bank Network', icon: Network, highlight: true },
  { id: 'smpc-engine', label: 'SMPC Protocol', icon: Cpu },
  { id: 'privacy', label: 'Privacy & DP', icon: Lock },
  { id: 'analytics', label: 'Fraud Analytics', icon: BarChart3 },
  { id: 'performance', label: 'Performance & Latency', icon: Gauge },
  { id: 'baselines', label: 'Baselines & Ablation', icon: Layers },
  { id: 'security', label: 'Security & Audit', icon: ShieldAlert },
  { id: 'dataset', label: 'Dataset & Anonymization', icon: Database, highlight: true },
  { id: 'privacy-utility', label: 'Privacy–Utility', icon: Scale, highlight: true },
  { id: 'security-analytics', label: 'Security Analytics', icon: ShieldCheck },
];

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav className="bg-slate-950/80 border-b border-slate-800/80 px-4 overflow-x-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 relative ${
                isActive
                  ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              } ${item.highlight && !isActive ? 'text-cyan-400 font-semibold' : ''}`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
