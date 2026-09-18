import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  Info,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Scenario, RosiSimulationResponse } from '../types';
import { ApiClient } from '../api/client';

export const RosiSimulatorView: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [targetScenarioId, setTargetScenarioId] = useState<string>('SC-04');
  const [controlName, setControlName] = useState('Hardware-Bound WebAuthn FIDO2 Keys');
  const [controlCost, setControlCost] = useState(320000);
  const [mitigationPct, setMitigationPct] = useState(45);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RosiSimulationResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await ApiClient.getScenarios();
        setScenarios(data);
        handleSimulate(data[0]?.id || 'SC-04');
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleSimulate = async (scenarioIdToUse?: string) => {
    setLoading(true);
    try {
      const res = await ApiClient.simulateRosi({
        controlId: 'ctrl-custom',
        controlName,
        controlCost,
        targetScenarioId: scenarioIdToUse || targetScenarioId,
        mitigationPct,
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const presetControls = [
    { name: 'Hardware-Bound WebAuthn FIDO2 Keys', cost: 320000, mitigation: 45 },
    { name: 'Automated EDR Host Isolation Hook', cost: 450000, mitigation: 38 },
    { name: 'Cloud Privileged Access Management (PAM)', cost: 500000, mitigation: 52 },
    { name: 'Supply Chain Vendor API Gateway Segregation', cost: 620000, mitigation: 60 },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#1b2638]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              ROSI Simulator (Return on Security Investment)
            </h1>
            <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300">
              Causal Counterfactuals
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Re-simulates the entire loss distribution to compute defensible EAL reduction and net return on security capital.
          </p>
        </div>

        <div className="text-right text-xs font-mono text-gray-400">
          <span>Formula: </span>
          <span className="text-emerald-400 font-bold">ROSI = (ΔEAL − Cost) / Cost</span>
        </div>
      </div>

      {/* Main Grid: Controls Input (1/2) + Re-Simulation Output (1/2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Configuration Inputs */}
        <div className="p-5 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-[#1b2638]">
            <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
              Control Investment Parameters
            </span>
            <span className="text-[10px] font-mono text-blue-400">Counterfactual Input</span>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-gray-400 font-medium">Quick Preset Templates:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {presetControls.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setControlName(p.name);
                    setControlCost(p.cost);
                    setMitigationPct(p.mitigation);
                  }}
                  className="p-2 rounded bg-[#111a28] hover:bg-[#19273c] border border-[#1d2a3e] text-left text-xs text-gray-300 transition-colors"
                >
                  <div className="font-semibold text-white truncate">{p.name}</div>
                  <div className="text-[10px] font-mono text-gray-400">
                    ${(p.cost / 1000).toFixed(0)}k • {p.mitigation}% mitigation
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1 font-medium">Control Name</label>
              <input
                type="text"
                value={controlName}
                onChange={(e) => setControlName(e.target.value)}
                className="w-full bg-[#080d16] border border-[#1e2d42] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-xs mb-1 font-medium">
                  Annual Capital / OpEx Cost ($)
                </label>
                <input
                  type="number"
                  value={controlCost}
                  onChange={(e) => setControlCost(Number(e.target.value))}
                  className="w-full bg-[#080d16] border border-[#1e2d42] rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1 font-medium">
                  Target Scenario
                </label>
                <select
                  value={targetScenarioId}
                  onChange={(e) => setTargetScenarioId(e.target.value)}
                  className="w-full bg-[#080d16] border border-[#1e2d42] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {scenarios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.ealFormatted})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400 font-medium">Vulnerability Mitigation Factor (%):</span>
                <span className="font-mono font-bold text-emerald-400">{mitigationPct}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={mitigationPct}
                onChange={(e) => setMitigationPct(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-0.5">
                <span>Minor Hardening (5%)</span>
                <span>Substantial Mitigation (50%)</span>
                <span>Near-Complete Neutralization (95%)</span>
              </div>
            </div>

            <button
              onClick={() => handleSimulate()}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sliders className="w-4 h-4" />
              )}
              <span>Run Counterfactual Re-Simulation</span>
            </button>
          </div>
        </div>

        {/* Right: Counterfactual Output Results */}
        <div className="p-5 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b2638]">
              <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
                Counterfactual Simulation Output
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Monte Carlo Verified</span>
            </div>

            {result ? (
              <div className="space-y-4">
                {/* 3 Metric Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-[#0e1724] border border-[#1d2b3f] text-center">
                    <div className="text-[10px] uppercase font-mono text-gray-400">Before EAL</div>
                    <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">
                      ${(result.beforeEal / 1000000).toFixed(2)}M
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0e1724] border border-emerald-800 text-center">
                    <div className="text-[10px] uppercase font-mono text-emerald-400">After EAL</div>
                    <div className="text-base sm:text-lg font-bold font-mono text-emerald-300 mt-0.5">
                      ${(result.afterEal / 1000000).toFixed(2)}M
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#14221a] border border-emerald-700 text-center">
                    <div className="text-[10px] uppercase font-mono text-emerald-400">Net ROSI</div>
                    <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-0.5">
                      +{result.rosiPct}%
                    </div>
                  </div>
                </div>

                {/* 90% Confidence Interval */}
                <div className="p-3 rounded-lg bg-[#101928] border border-[#1e2d42] flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400">90% Confidence Interval:</span>
                  <span className="font-bold text-white">
                    [{result.confidenceInterval90[0]}%, {result.confidenceInterval90[1]}%]
                  </span>
                </div>

                {/* Strictly Causal Statement (Honoring Principle 3) */}
                <div className="p-4 rounded-xl bg-[#0b1320] border border-blue-900/60 text-xs text-gray-200 leading-relaxed space-y-1.5">
                  <div className="flex items-center space-x-2 text-blue-400 font-semibold font-mono text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>STRICTLY CAUSAL COUNTERFACTUAL SPECIFICATION:</span>
                  </div>
                  <p className="font-medium text-gray-200">
                    {result.causalExplanation}
                  </p>
                </div>

                {/* Visual Before vs After Bar */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-gray-400">Residual Exposure Retained:</span>
                    <span className="text-white font-bold">
                      {100 - result.mitigationPct}% of baseline
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#152233] overflow-hidden flex">
                    <div
                      style={{ width: `${100 - result.mitigationPct}%` }}
                      className="bg-blue-600 h-full"
                    />
                    <div
                      style={{ width: `${result.mitigationPct}%` }}
                      className="bg-emerald-500 h-full opacity-70"
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-gray-500">
                    <span>■ Retained EAL (${(result.afterEal / 1000000).toFixed(2)}M)</span>
                    <span className="text-emerald-400">■ Mitigated EAL (${(result.ealReduction / 1000000).toFixed(2)}M)</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="text-[10px] font-mono text-gray-500 text-center pt-2 border-t border-[#182333]">
            Solvency II Actuarial Review Protocol • Continuous Re-Simulation Active
          </div>
        </div>
      </div>
    </div>
  );
};
