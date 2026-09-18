import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  SlidersHorizontal,
  Bell,
  Sparkles,
  Server,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { User, NavigationPage } from '../types';
import { ApiConfig } from '../api/client';

interface HeaderProps {
  currentUser?: User;
  currentEal?: string;
  ealDeltaPct?: number;
  activePage?: NavigationPage;
  onNavigate?: (page: NavigationPage) => void;
  onOpenCopilot: () => void;
  onOpenBackendSettings?: () => void;
  onOpenSettings?: () => void;
  onNavigateHome?: () => void;
  isSyntheticDemo?: boolean;
  onToggleSyntheticDemo?: (enabled: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser = {
    id: 'u-1',
    name: 'Marcus Vance',
    title: 'Chief Information Security Officer',
    email: 'm.vance@cybereal-enterprise.internal',
    role: 'CISO',
    orgId: 'org-default',
  },
  currentEal = '$14.82M',
  ealDeltaPct = -4.2,
  activePage = 'dashboard',
  onNavigate = () => {},
  onOpenCopilot,
  onOpenBackendSettings,
  onOpenSettings,
  onNavigateHome,
  isSyntheticDemo = true,
  onToggleSyntheticDemo = () => {},
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const isLiveConfigured = ApiConfig.isLiveEnabled() && Boolean(ApiConfig.getBaseUrl());

  const handleOpenSettings = onOpenSettings || onOpenBackendSettings || (() => {});
  const handleGoHome = onNavigateHome || (() => onNavigate('landing'));

  return (
    <header className="h-16 border-b border-[#1f2937] bg-[#0c131f] px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & Status */}
      <div className="flex items-center space-x-4 sm:space-x-6">
        <button
          onClick={handleGoHome}
          className="flex items-center space-x-2.5 text-left focus:outline-none group"
        >
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-bold text-lg text-white tracking-tight">
                Cyber<span className="text-blue-400">EAL</span>
              </span>
              <span className="text-[10px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-800 text-blue-300">
                Enterprise
              </span>
            </div>
          </div>
        </button>

        {/* Global EAL Pill */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#131d2e] border border-[#233147] text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-gray-400 font-medium">Portfolio EAL:</span>
          <span className="font-mono font-bold text-white tabular-nums">{currentEal}</span>
          <span
            className={`font-mono text-[11px] font-semibold ${
              ealDeltaPct <= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            ({ealDeltaPct <= 0 ? '' : '+'}{ealDeltaPct}%)
          </span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search telemetry, loss exceedance models, SPoF assets (⌘K)"
            className="w-full bg-[#111927] border border-[#223046] rounded-md pl-9 pr-12 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onOpenCopilot();
              }
            }}
          />
          <kbd className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1c2738] text-gray-400 border border-[#2a3b54]">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Synthetic vs Live Mode Toggle */}
        <div className="hidden sm:flex items-center bg-[#111927] border border-[#223046] p-0.5 rounded-md text-xs">
          <button
            onClick={() => onToggleSyntheticDemo(false)}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              !isSyntheticDemo
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Production
          </button>
          <button
            onClick={() => onToggleSyntheticDemo(true)}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              isSyntheticDemo
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Synthetic Demo
          </button>
        </div>

        {/* Backend API Status Pill */}
        <button
          onClick={handleOpenSettings}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-[#131d2e] border border-[#24334a] hover:border-blue-500/60 text-xs text-gray-300 transition-all cursor-pointer"
          title="Configure FastAPI Backend URL"
        >
          <Server className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden xl:inline font-mono">
            {isLiveConfigured ? 'FastAPI: Online' : 'Engine: Local MOCK'}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isLiveConfigured ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
        </button>

        {/* AI Copilot Quick Button */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-200 animate-pulse" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-md hover:bg-[#162233] text-gray-400 hover:text-gray-200 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#131d2e] border border-[#233147] rounded-lg shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#233147] mb-2">
                <span className="text-xs font-semibold text-white">Continuous Signals</span>
                <span className="text-[10px] text-gray-400">FAIR v3.2 Stream</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-[#0e1624] border border-[#1f2d42]">
                  <div className="flex items-center justify-between text-[11px] text-amber-400 font-medium">
                    <span>Firewall Rule Ingestion</span>
                    <span>12m ago</span>
                  </div>
                  <p className="text-gray-300 text-[11px] mt-0.5">
                    Perimeter ingress update shifted CDiff percentile (82nd → 81st).
                  </p>
                </div>
                <div className="p-2 rounded bg-[#0e1624] border border-[#1f2d42]">
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium">
                    <span>Review Queue Update</span>
                    <span>1h ago</span>
                  </div>
                  <p className="text-gray-300 text-[11px] mt-0.5">
                    Dr. Evelyn Chen submitted actuarial prior on SC-04 TEF parameter.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 pl-2 border-l border-[#1f2937] text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-500 border border-blue-400 flex items-center justify-center font-bold text-xs text-white">
              EV
            </div>
            <div className="hidden xl:block">
              <div className="text-xs font-semibold text-white leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-gray-400 leading-tight">{currentUser.title}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden xl:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#131d2e] border border-[#233147] rounded-lg shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-[#233147]">
                <div className="font-semibold text-white">{currentUser.name}</div>
                <div className="text-[11px] text-gray-400">{currentUser.email}</div>
                <div className="text-[10px] font-mono text-blue-400 mt-0.5">Role: {currentUser.role}</div>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('landing');
                }}
                className="w-full text-left px-3 py-2 text-gray-300 hover:bg-[#1c293d] hover:text-white"
              >
                Executive Overview (Landing)
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('demo');
                }}
                className="w-full text-left px-3 py-2 text-blue-400 hover:bg-[#1c293d] hover:text-blue-300 font-medium"
              >
                Launch Guided Demo Tour
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleOpenSettings();
                }}
                className="w-full text-left px-3 py-2 text-gray-300 hover:bg-[#1c293d] hover:text-white"
              >
                API Backend Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
