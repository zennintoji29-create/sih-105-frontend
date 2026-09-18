import React, { useState, useEffect } from 'react';
import {
  Sliders,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Send,
  CheckCircle2,
  X,
} from 'lucide-react';
import { SandboxSimulateResponse, NavigationPage } from '../types';
import { ApiClient } from '../api/client';

interface SimulationSandboxViewProps {
  onExitSimulation: () => void;
  onNavigateToReviewQueue: () => void;
}

export const SimulationSandboxView: React.FC<SimulationSandboxViewProps> = ({
  onExitSimulation,
  onNavigateToReviewQueue,
}) => {
  const [mfaCoverage, setMfaCoverage] = useState(95);
  const [patchLagDays, setPatchLagDays] = useState(7);
  const [phishingClickRate, setPhishingClickRate] = useState(3.2);
  const [vendorUnsegmentedApis, setVendorUnsegmentedApis] = useState(2);
  const [simResult, setSimResult] = useState<SandboxSimulateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [promotedMessage, setPromotedMessage] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const degradation = Math.max(0, 95 - mfaCoverage) + Math.max(0, patchLagDays - 7) * 2;
      const res = await ApiClient.simulateSandbox({
        controlsDegraded: [
          { controlId: 'ctrl-mfa', degradationPct: Math.max(0, 95 - mfaCoverage) },
          { controlId: 'ctrl-patch', degradationPct: Math.max(0, patchLagDays - 7) },
        ],
        threatIncreasePct: Math.max(0, phishingClickRate - 3.2) * 5 + vendorUnsegmentedApis * 4,
      });
      setSimResult(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [mfaCoverage, patchLagDays, phishingClickRate, vendorUnsegmentedApis]);

  const handleReset = () => {
    setMfaCoverage(95);
    setPatchLagDays(7);
    setPhishingClickRate(3.2);
    setVendorUnsegmentedApis(2);
  };

  const handlePromote = () => {
    setPromotedMessage(true);
    setTimeout(() => {
      onNavigateToReviewQueue();
    }, 1500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Ephemeral Simulation Banner (Amber Background, strictly requested) */}
      <div className="p-4 rounded-xl bg-amber-950/80 border-2 border-amber-600/90 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-amber-100 font-mono text-sm block">
              Simulation mode active — changes are ephemeral and will not affect published EAL
            </span>
            <span className="text-amber-300 text-xs">
              Sandbox re-simulation engine active. Alter parameters below to observe real-time portfolio volatility.
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded bg-amber-900/60 hover:bg-amber-900 border border-amber-700 text-xs font-semibold text-amber-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
          <button
            onClick={onExitSimulation}
            className="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit Simulation</span>
          </button>
        </div>
      </div>

      {promotedMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/90 border border-emerald-600 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Simulation draft promoted! Redirecting to CISO Review Queue for sign-off...</span>
        </div>
      )}

      {/* Grid: Sliders Controls (1/2) + Instant Before/After Metrics (1/2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Degradation Sliders */}
        <div className="p-5 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-[#1b2638]">
            <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
              Control Degradation & Stress Sliders
            </span>
            <span className="text-[10px] font-mono text-amber-400">Stress Testing</span>
          </div>

          <div className="space-y-4">
            {/* Slider 1: MFA Coverage */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 font-medium">MFA Coverage (%):</span>
                <span className={`font-mono font-bold ${mfaCoverage < 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {mfaCoverage}% {mfaCoverage < 95 && `(↓ ${95 - mfaCoverage}%)`}
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={mfaCoverage}
                onChange={(e) => setMfaCoverage(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-500">
                <span>Severe Drop (40%)</span>
                <span>Baseline (95%)</span>
                <span>Enforced (100%)</span>
              </div>
            </div>

            {/* Slider 2: Patching Lag Days */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 font-medium">Mean Patching Lag (Days):</span>
                <span className={`font-mono font-bold ${patchLagDays > 14 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {patchLagDays} days {patchLagDays > 7 && `(↑ ${patchLagDays - 7}d delay)`}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                value={patchLagDays}
                onChange={(e) => setPatchLagDays(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-500">
                <span>Rapid (1d)</span>
                <span>Baseline (7d)</span>
                <span>Dangerous Lag (60d)</span>
              </div>
            </div>

            {/* Slider 3: Phishing Click Rate */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 font-medium">Phishing Campaign Click Rate (%):</span>
                <span className={`font-mono font-bold ${phishingClickRate > 6 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {phishingClickRate}%
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={phishingClickRate}
                onChange={(e) => setPhishingClickRate(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-500">
                <span>Hardened (1%)</span>
                <span>Baseline (3.2%)</span>
                <span>Compromised (25%)</span>
              </div>
            </div>

            {/* Slider 4: Unsegmented Vendor APIs */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 font-medium">Unsegmented Vendor Ingress APIs:</span>
                <span className={`font-mono font-bold ${vendorUnsegmentedApis > 3 ? 'text-rose-400' : 'text-blue-400'}`}>
                  {vendorUnsegmentedApis} endpoints
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={vendorUnsegmentedApis}
                onChange={(e) => setVendorUnsegmentedApis(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-500">
                <span>Zero Trust (0)</span>
                <span>Baseline (2)</span>
                <span>Wide Ingress (10)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#182333] flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              Ready to submit this stress test scenario to leadership?
            </span>
            <button
              onClick={handlePromote}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Promote to Review Queue</span>
            </button>
          </div>
        </div>

        {/* Right: Instant Before / After Metrics */}
        <div className="p-5 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b2638]">
              <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
                Stress Impact on Portfolio EAL
              </span>
              <span className="text-[10px] font-mono text-rose-400 font-bold">
                Live Re-calculated
              </span>
            </div>

            {simResult && (
              <div className="space-y-4">
                {/* 3 Metrics comparison */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-[#0e1724] border border-[#1d2b3f] text-center">
                    <div className="text-[10px] uppercase font-mono text-gray-400">Baseline EAL</div>
                    <div className="text-lg font-bold font-mono text-white mt-0.5">
                      ${(simResult.beforeEal / 1000000).toFixed(2)}M
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#181522] border border-rose-800 text-center">
                    <div className="text-[10px] uppercase font-mono text-rose-400">Simulated EAL</div>
                    <div className="text-lg font-bold font-mono text-rose-300 mt-0.5">
                      ${(simResult.afterEal / 1000000).toFixed(2)}M
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#1c121e] border border-rose-700 text-center">
                    <div className="text-[10px] uppercase font-mono text-rose-400">Net Delta</div>
                    <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">
                      +${(simResult.ealDelta / 1000000).toFixed(2)}M
                    </div>
                  </div>
                </div>

                {/* 90% Confidence Interval */}
                <div className="p-3.5 rounded-lg bg-[#101826] border border-[#1f2f45] flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400">90% Confidence Interval (P10 - P90):</span>
                  <span className="font-bold text-rose-300">
                    ${(simResult.confidenceInterval[0] / 1000000).toFixed(2)}M – $
                    {(simResult.confidenceInterval[1] / 1000000).toFixed(2)}M
                  </span>
                </div>

                {/* Stress Explanation */}
                <div className="p-3.5 rounded-lg bg-[#0e1625] border border-amber-900/60 text-xs text-gray-200 leading-relaxed">
                  <span className="text-amber-300 font-semibold block mb-1 font-mono text-[11px]">
                    PORTFOLIO ATTRIBUTION:
                  </span>
                  Control degradation shifts the Loss Event Frequency (LEF) upward by{' '}
                  <span className="font-mono text-white font-bold">
                    +{((simResult.ealDelta / simResult.beforeEal) * 100).toFixed(1)}%
                  </span>
                  . Higher vulnerability in edge and identity layers compounds catastrophic tail risk under GPD extreme value modeling.
                </div>
              </div>
            )}
          </div>

          <div className="text-[10px] font-mono text-gray-500 text-center pt-2 border-t border-[#182333]">
            Changes are completely in-memory and will disappear when navigating away or clicking Exit.
          </div>
        </div>
      </div>
    </div>
  );
};
