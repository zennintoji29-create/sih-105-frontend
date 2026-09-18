import React from 'react';
import {
  LayoutDashboard,
  GitFork,
  CheckSquare,
  FileCheck2,
  Share2,
  Network,
  TrendingUp,
  Target,
  Database,
  Sliders,
  Compass,
  Zap,
} from 'lucide-react';
import { NavigationPage } from '../types';

interface SidebarProps {
  activePage?: NavigationPage;
  currentPage?: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  reviewQueuePendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  currentPage,
  onNavigate,
  reviewQueuePendingCount = 2,
}) => {
  const current = activePage || currentPage || 'dashboard';
  const engineNavItems = [
    {
      id: 'dashboard' as NavigationPage,
      label: 'Risk Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'scenarios' as NavigationPage,
      label: 'Scenario Builder',
      icon: GitFork,
      badge: '18',
    },
    {
      id: 'elicitation' as NavigationPage,
      label: 'Elicitation Portal',
      icon: CheckSquare,
      badge: 'CLUE',
    },
    {
      id: 'review-queue' as NavigationPage,
      label: 'Review Queue',
      icon: FileCheck2,
      badge: reviewQueuePendingCount > 0 ? `${reviewQueuePendingCount} pending` : null,
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    },
    {
      id: 'explainability' as NavigationPage,
      label: 'Explainability',
      icon: Share2,
      badge: 'FAIR',
    },
  ];

  const exposureNavItems = [
    {
      id: 'vendors' as NavigationPage,
      label: 'Vendor / SPoF Map',
      icon: Network,
      badge: '2 SPoF',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
    },
    {
      id: 'rosi' as NavigationPage,
      label: 'ROSI Simulator',
      icon: TrendingUp,
      badge: null,
    },
    {
      id: 'investments' as NavigationPage,
      label: 'Investment Tracker',
      icon: Target,
      badge: null,
    },
    {
      id: 'data-sources' as NavigationPage,
      label: 'Data Sources & Provenance',
      icon: Database,
      badge: 'Firewall',
    },
    {
      id: 'simulation-sandbox' as NavigationPage,
      label: 'Simulation Mode',
      icon: Sliders,
      badge: 'Sandbox',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    },
  ];

  return (
    <aside className="w-64 bg-[#09101a] border-r border-[#1a2536] flex flex-col justify-between select-none shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Tour Banner */}
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-950/60 to-indigo-950/60 border border-blue-800/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
              Executive Walkthrough
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-900/80 text-blue-300 font-mono">
              Offline
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">
            Experience the complete 10-step quantification tour with zero network calls.
          </p>
          <button
            onClick={() => onNavigate('demo')}
            className={`w-full py-1.5 px-2.5 rounded text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              current === 'demo'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-[#152336] text-blue-300 hover:bg-[#1f314c] border border-blue-800/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Launch Guided Demo Tour</span>
          </button>
        </div>

        {/* Section 1: Engine */}
        <div className="space-y-1">
          <div className="px-3 py-1 flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-500">
              Quantification Engine
            </span>
            <span className="text-[9px] font-mono text-gray-500">v4.8.2</span>
          </div>
          {engineNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#152338] text-white border-l-2 border-blue-500 font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#0e1724]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${
                      item.badgeColor || 'bg-[#142030] text-gray-400 border-[#233147]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section 2: Exposure & Capital */}
        <div className="space-y-1">
          <div className="px-3 py-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-500">
              Exposure & Capital
            </span>
          </div>
          {exposureNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#152338] text-white border-l-2 border-blue-500 font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#0e1724]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${
                      item.badgeColor || 'bg-[#142030] text-gray-400 border-[#233147]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="p-4 border-t border-[#1a2536] bg-[#070d16] space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-gray-500 flex items-center space-x-1">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>Monte Carlo</span>
          </span>
          <span className="font-mono text-gray-300 font-semibold">1,000,000 runs</span>
        </div>
        <div className="w-full bg-[#131d2e] rounded-full h-1 overflow-hidden">
          <div className="bg-emerald-500 h-full w-[99.4%]" />
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span>Convergence Conf:</span>
          <span className="text-emerald-400 font-bold">99.4%</span>
        </div>
      </div>
    </aside>
  );
};
