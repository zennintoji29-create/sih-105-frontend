import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Zap,
  Sliders,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  Download,
  Clock,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  X,
  FileText,
} from 'lucide-react';
import {
  DashboardResponse,
  Scenario,
  TelemetryShockType,
  NavigationPage,
} from '../types';
import { ApiClient } from '../api/client';

interface RiskDashboardViewProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenCopilot: () => void;
  isSyntheticDemo: boolean;
  onSelectScenarioForDetail?: (scenarioId: string) => void;
}

export const RiskDashboardView: React.FC<RiskDashboardViewProps> = ({
  onNavigate,
  onOpenCopilot,
  isSyntheticDemo,
  onSelectScenarioForDetail,
}) => {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SC-04');
  const [loading, setLoading] = useState(true);
  const [shockLoading, setShockLoading] = useState<TelemetryShockType | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [isMockResponse, setIsMockResponse] = useState(true);
  const [shockNotification, setShockNotification] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, scenRes] = await Promise.all([
        ApiClient.getDashboard('org-default'),
        ApiClient.getScenarios('org-default'),
      ]);
      setDashboard(dashRes.data);
      setIsMockResponse(dashRes.isMock);
      setScenarios(scenRes.data);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleTriggerShock = async (shockType: TelemetryShockType) => {
    setShockLoading(shockType);
    try {
      const { data } = await ApiClient.triggerTelemetryShock(shockType);
      setShockNotification(`Shock Injected: ${data.label} (${data.ealDeltaFormatted})`);
      // Refresh dashboard state
      const dashRes = await ApiClient.getDashboard();
      setDashboard(dashRes.data);
      setTimeout(() => setShockNotification(null), 5000);
    } catch (e) {
      console.error('Shock trigger failed:', e);
    } finally {
      setShockLoading(null);
    }
  };

  if (loading || !dashboard) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-gray-400">Loading FAIR quantification state & Monte Carlo quantiles...</p>
      </div>
    );
  }

  const selectedScenario =
    scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Telemetry Triggers Subheader */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#1b2638]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              Risk Dashboard
            </h1>
            <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800 text-blue-300">
              SYNTHETIC / DEMO
            </span>
            {isMockResponse && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-800 text-indigo-300">
                FAIR v3.2 In-Memory
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Continuous EAL quantification</span>
            <span>•</span>
            <span>FAIR + FABRICS loss exposure methodology</span>
          </p>
        </div>

        {/* 4 Telemetry Shock Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] uppercase font-mono font-bold text-gray-500 mr-1 hidden sm:inline">
            Shock Injection:
          </span>
          <button
            onClick={() => handleTriggerShock('phishing_click_rate')}
            disabled={shockLoading !== null}
            className="px-2.5 py-1.5 rounded bg-[#131e2e] hover:bg-[#1c2c42] border border-[#23334a] text-[11px] font-medium text-gray-200 hover:text-white flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Phishing click rate ↑</span>
          </button>
          <button
            onClick={() => handleTriggerShock('new_critical_cve')}
            disabled={shockLoading !== null}
            className="px-2.5 py-1.5 rounded bg-[#131e2e] hover:bg-[#1c2c42] border border-[#23334a] text-[11px] font-medium text-gray-200 hover:text-white flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-3 h-3 text-rose-400" />
            <span>New critical CVE</span>
          </button>
          <button
            onClick={() => handleTriggerShock('firewall_drift')}
            disabled={shockLoading !== null}
            className="px-2.5 py-1.5 rounded bg-[#131e2e] hover:bg-[#1c2c42] border border-[#23334a] text-[11px] font-medium text-gray-200 hover:text-white flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-3 h-3 text-blue-400" />
            <span>Firewall drift</span>
          </button>
          <button
            onClick={() => handleTriggerShock('mfa_coverage_drop')}
            disabled={shockLoading !== null}
            className="px-2.5 py-1.5 rounded bg-[#131e2e] hover:bg-[#1c2c42] border border-[#23334a] text-[11px] font-medium text-gray-200 hover:text-white flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-3 h-3 text-purple-400" />
            <span>MFA coverage drop</span>
          </button>
        </div>
      </div>

      {/* Dynamic Shock Notification Toast */}
      {shockNotification && (
        <div className="p-3 rounded-lg bg-blue-950/80 border border-blue-600 text-blue-200 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-300 animate-spin" />
            <span className="font-semibold">{shockNotification}</span>
            <span className="text-gray-300">— EAL and Attribution Feed recalculated.</span>
          </div>
          <button
            onClick={() => setShockNotification(null)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Simulation Ready Banner (matching Image 1) */}
      {!bannerDismissed && (
        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-[#111e30] via-[#142338] to-[#111e30] border border-blue-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="text-xs text-gray-300 leading-relaxed">
              <span className="text-white font-semibold">Simulation Ready:</span> Trigger simulation mode to test real-time control degradation effects on enterprise Expected Annualized Loss without persisting changes to baseline records.
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => onNavigate('simulation-sandbox')}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <span>LAUNCH SANDBOX</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="p-1 rounded text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 4 Top Hero Metric Cards (matching Image 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: TOTAL EAL */}
        <div className="p-4 rounded-xl bg-[#0e1624] border border-[#1f2d42] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-400">
              Total EAL (All Scenarios)
            </span>
            <span className="text-blue-400 text-xs">📈</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              {dashboard.totalEalFormatted}
            </div>
            <span
              className={`text-xs font-semibold font-mono ${
                dashboard.isEalDecreasing ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {dashboard.isEalDecreasing ? '↓' : '↑'} {Math.abs(dashboard.ealQuarterlyDeltaPct)}%
            </span>
          </div>
          <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1 border-t border-[#182333]">
            <span>vs prev quarter • Risk decreasing</span>
            <span className="font-mono text-gray-500">N=1M runs</span>
          </div>
        </div>

        {/* Metric 2: VAR 95% */}
        <div className="p-4 rounded-xl bg-[#0e1624] border border-[#1f2d42] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-400">
              VaR 95% (Tail Risk)
            </span>
            <span className="text-amber-400 text-xs">⚠️</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              {dashboard.var95Formatted}
            </div>
            <span className="text-xs font-semibold font-mono text-amber-400">
              ↑ {dashboard.varQuarterlyDeltaPct}%
            </span>
          </div>
          <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1 border-t border-[#182333]">
            <span>1-in-20 year worst-case loss</span>
            <span className="font-mono text-amber-400/80">95th %ile</span>
          </div>
        </div>

        {/* Metric 3: ACTIVE SCENARIOS */}
        <div className="p-4 rounded-xl bg-[#0e1624] border border-[#1f2d42] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-400">
              Active Scenarios
            </span>
            <span className="text-indigo-400 text-xs">🗂️</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              {dashboard.activeScenariosCount} Active
            </div>
            <span className="text-xs font-semibold font-mono text-gray-400">
              [stable]
            </span>
          </div>
          <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1 border-t border-[#182333]">
            <span>{dashboard.underReviewCount} under expert review</span>
            <span className="font-mono text-blue-400">{dashboard.certifiedPct}% certified</span>
          </div>
        </div>

        {/* Metric 4: LEF */}
        <div className="p-4 rounded-xl bg-[#0e1624] border border-[#1f2d42] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-400">
              LEF (Selected Scenario)
            </span>
            <span className="text-emerald-400 text-xs">📝</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              {dashboard.selectedScenarioLefFormatted}
            </div>
            <span className="text-xs font-semibold font-mono text-emerald-400">
              ↓ {Math.abs(dashboard.selectedScenarioLefDeltaPct)}%
            </span>
          </div>
          <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1 border-t border-[#182333]">
            <span>Loss Event Frequency delta</span>
            <span className="font-mono text-gray-400">1 evt / ~2.9 yrs</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Scenario Deep Dive (2/3) + Historical Trend & Change Attribution (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Granular Scenario Deep Dive */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2638]">
            <div>
              <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-blue-400">
                Granular Elicitation
              </div>
              <h2 className="text-lg font-display font-bold text-white">Scenario Deep Dive</h2>
            </div>

            {/* Scenario Dropdown */}
            <div className="relative">
              <select
                value={selectedScenarioId}
                onChange={(e) => {
                  setSelectedScenarioId(e.target.value);
                  if (onSelectScenarioForDetail) onSelectScenarioForDetail(e.target.value);
                }}
                className="bg-[#131d2e] border border-[#24344d] rounded-md px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500 font-medium pr-8 cursor-pointer"
              >
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.uid})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Three Key Scenario Metrics */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-[#111b2b] border border-[#1d2c42]">
            <div>
              <div className="text-[10px] uppercase font-mono text-gray-400">EAL Mean</div>
              <div className="text-lg font-bold font-mono text-white tabular-nums">
                {selectedScenario.ealFormatted}
              </div>
              <div className="text-[10px] text-gray-400">Expected value</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-gray-400">EAL Median (P50)</div>
              <div className="text-lg font-bold font-mono text-white tabular-nums">$3.15M</div>
              <div className="text-[10px] text-gray-400 font-mono">Skew delta: -$1.13M</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-gray-400">VaR 97.5 (P97.5)</div>
              <div className="text-lg font-bold font-mono text-rose-300 tabular-nums">$12.40M</div>
              <div className="text-[10px] text-gray-400">Tail solvency limit</div>
            </div>
          </div>

          {/* Interactive Monte Carlo Histogram & Density Curve */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">
                Loss Distribution (Monte Carlo Quantiles, 100k runs)
              </span>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="flex items-center space-x-1 text-gray-400">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-xs" />
                  <span>Mass</span>
                </span>
                <span className="flex items-center space-x-1 text-rose-300">
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs" />
                  <span>Tail VaR 95%+</span>
                </span>
              </div>
            </div>

            {/* Rendered Chart Canvas Container */}
            <div className="relative h-48 bg-[#09101b] rounded-lg p-3 border border-[#1a2638] flex items-end justify-between gap-1 overflow-hidden">
              {/* Dotted Vertical Threshold Line at VaR 95% ($10.0M) */}
              <div className="absolute right-[22%] top-0 bottom-6 border-l-2 border-dashed border-rose-500/70 z-10 flex flex-col items-center">
                <span className="text-[9px] font-mono text-rose-300 bg-rose-950/80 px-1 py-0.2 rounded border border-rose-800 -translate-x-1/2 whitespace-nowrap">
                  VaR 95% Cutoff $10.0M+
                </span>
              </div>

              {/* Histogram Bars */}
              {dashboard.histogram.map((bin, idx) => {
                const heightPct = Math.max(10, Math.round(bin.density * 320));
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 bg-[#131d2e] border border-[#24364e] p-1.5 rounded text-[10px] font-mono text-white whitespace-nowrap shadow-lg">
                      {bin.rangeLabel}: {bin.count.toLocaleString()} runs ({bin.density * 100}%)
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-xs transition-all ${
                        bin.isTail
                          ? 'bg-rose-600/80 group-hover:bg-rose-500'
                          : 'bg-blue-600/70 group-hover:bg-blue-500'
                      }`}
                    />
                    <span className="text-[8px] font-mono text-gray-500 mt-1 truncate max-w-[40px]">
                      {bin.rangeLabel.split(' - ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quantiles Bar (matching Image 1) */}
            <div className="grid grid-cols-6 gap-1.5 pt-2 text-center text-[10px] font-mono">
              <div className="p-1.5 rounded bg-[#111a28] border border-[#1d2a3e]">
                <div className="text-gray-400">P2.5</div>
                <div className="text-gray-200 font-bold">$820k</div>
              </div>
              <div className="p-1.5 rounded bg-[#111a28] border border-[#1d2a3e]">
                <div className="text-gray-400">P25</div>
                <div className="text-gray-200 font-bold">$1.94M</div>
              </div>
              <div className="p-1.5 rounded bg-[#142338] border border-blue-800">
                <div className="text-blue-300 font-semibold">MEDIAN</div>
                <div className="text-white font-bold">$3.15M</div>
              </div>
              <div className="p-1.5 rounded bg-[#111a28] border border-[#1d2a3e]">
                <div className="text-gray-400">P75</div>
                <div className="text-gray-200 font-bold">$5.80M</div>
              </div>
              <div className="p-1.5 rounded bg-[#211826] border border-rose-800">
                <div className="text-rose-300 font-semibold">VAR 95</div>
                <div className="text-white font-bold">$9.85M</div>
              </div>
              <div className="p-1.5 rounded bg-[#241525] border border-rose-900">
                <div className="text-rose-400 font-semibold">P97.5</div>
                <div className="text-white font-bold">$12.40M</div>
              </div>
            </div>
          </div>

          {/* Fat Tail Pareto Callout (matching Image 1) */}
          <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/50 flex items-start space-x-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-rose-200">
                Fat Tail Detected (Pareto Index α = {dashboard.gpdTailFit.paretoAlpha})
              </span>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Power-law distribution confirmed. High-impact catastrophic outages dominate aggregated portfolio volatility more than high-frequency minor events.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 text-gray-400 border-t border-[#182333]">
            <span className="font-mono text-[10px] text-gray-500">
              SYNTHETIC — ILLUSTRATIVE DATA ONLY
            </span>
            <button
              onClick={() => onNavigate('explainability')}
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
            >
              <span>View full quantile tables</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Historical Trend + Change Attribution Feed */}
        <div className="space-y-6">
          {/* Top Right: Historical Trend (12 Months) */}
          <div className="p-4 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-400">
                  Historical Trend
                </div>
                <div className="text-xs font-bold text-white">EAL Over Time (12 Months)</div>
              </div>
              <span className="text-[11px] font-mono font-semibold text-emerald-400">
                Net -32% YoY
              </span>
            </div>

            {/* SVG Trend Chart */}
            <div className="h-28 w-full bg-[#09101b] rounded-lg p-2 border border-[#182333] relative">
              <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                {/* Dotted Inherent Risk Line */}
                <path
                  d="M 10 20 L 60 22 L 110 24 L 160 25 L 210 26 L 260 27 L 290 28"
                  fill="none"
                  stroke="#4b5d78"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                {/* Solid Residual EAL Curve */}
                <path
                  d="M 10 38 Q 80 50 150 58 T 290 68"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                />
              </svg>
              <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 px-1 pt-1">
                <span>May 23 ($21.8M)</span>
                <span>Sep 23</span>
                <span>Jan 24</span>
                <span className="text-blue-400 font-bold">Apr 24 (Now $14.8M)</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-0.5 bg-blue-500" />
                <span>Residual EAL</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-0.5 border-b border-dashed border-gray-400" />
                <span>Inherent Exposure</span>
              </span>
            </div>
          </div>

          {/* Bottom Right: Change Attribution Feed */}
          <div className="p-4 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-400">
                  Variance Decomposition
                </div>
                <div className="text-xs font-bold text-white">Change Attribution Feed</div>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">
                Real-time
              </span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {dashboard.changeAttributionFeed.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-[#0e1624] border border-[#1c283a] hover:border-[#283b54] transition-colors space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-gray-200 font-medium leading-tight">
                      {item.title}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold shrink-0 ${
                        item.direction === 'down' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.deltaEalFormatted}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>{item.timeAgo}</span>
                    <span className="text-gray-400 italic">SHAP attribution</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenCopilot}
              className="w-full py-1.5 rounded-md bg-[#131e2e] hover:bg-[#1c2c42] border border-[#23334a] text-[11px] font-semibold text-blue-300 hover:text-white flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Query Copilot on Attributions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Portfolio Distribution: Scenario EAL Comparison (matching Image 1) */}
      <div className="p-5 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-blue-400">
              Portfolio Distribution
            </div>
            <h3 className="text-base font-display font-bold text-white">Scenario EAL Comparison</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('scenarios')}
              className="px-3 py-1.5 rounded-md bg-[#131d2e] hover:bg-[#1a293d] border border-[#23334a] text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
              Export FAIR Report
            </button>
            <button
              onClick={() => onNavigate('rosi')}
              className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
            >
              Simulate Controls
            </button>
          </div>
        </div>

        {/* Progress Bar Stack */}
        <div className="space-y-3">
          {dashboard.scenarioComparison.map((scen) => (
            <div key={scen.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-gray-400 font-semibold">{scen.uid}</span>
                  <span className="text-gray-200 font-medium">{scen.name}</span>
                </div>
                <div className="flex items-center space-x-3 font-mono">
                  <span className="text-gray-400">{scen.portfolioPct}% of total</span>
                  <span className="text-white font-bold">{scen.ealFormatted}</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-[#111a28] overflow-hidden">
                <div
                  style={{ width: `${scen.portfolioPct}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[#182333] flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-2">
          <span>
            Simulation Engine: <span className="text-gray-400">{dashboard.simulationEngine}</span> • Confidence: <span className="text-emerald-400 font-mono">99.4%</span>
          </span>
          <span className="font-mono">Next automated recalculation in 14m 20s</span>
        </div>
      </div>
    </div>
  );
};
