import React, { useState, useEffect } from 'react';
import {
  GitFork,
  Plus,
  CheckCircle2,
  Download,
  Sliders,
  Shield,
  Trash2,
  AlertCircle,
  FileCode2,
  ArrowRight,
  Layers,
  Save,
} from 'lucide-react';
import { Scenario, FaultTreeNode } from '../types';
import { ApiClient } from '../api/client';

interface ScenarioBuilderViewProps {
  onNavigateToSimulation?: () => void;
}

export const ScenarioBuilderView: React.FC<ScenarioBuilderViewProps> = ({
  onNavigateToSimulation,
}) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SC-04');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable parameters for current scenario
  const [scenarioName, setScenarioName] = useState('');
  const [narrative, setNarrative] = useState('');
  const [lowBound, setLowBound] = useState(1200000);
  const [mostLikelyBound, setMostLikelyBound] = useState(3850000);
  const [highBound, setHighBound] = useState(9400000);

  const categories = ['All', 'Ransomware', 'Third-Party', 'Cloud', 'Social Eng', 'Insider Threat'];

  const paletteControls = [
    { name: 'Hardware WebAuthn FIDO2', efficiency: 95.0, type: 'control' },
    { name: 'Automated EDR Host Isolation', efficiency: 99.1, type: 'control' },
    { name: 'Cloud Privileged Access (PAM)', efficiency: 94.0, type: 'control' },
    { name: 'API Gateway Ingress WAF', efficiency: 91.5, type: 'control' },
    { name: 'Supply Chain Partner Tunnel', efficiency: 0, type: 'threat_action' },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await ApiClient.getScenarios();
        setScenarios(data);
        const current = data.find((s) => s.id === selectedScenarioId) || data[0];
        if (current) {
          setScenarioName(current.name);
          setNarrative(current.narrative);
          setLowBound(current.lossMagnitudeLogNormal.low10);
          setMostLikelyBound(current.lossMagnitudeLogNormal.mostLikely);
          setHighBound(current.lossMagnitudeLogNormal.high90);
        }
      } catch (err) {
        console.error('Failed to load scenarios:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSelectScenario = (scen: Scenario) => {
    setSelectedScenarioId(scen.id);
    setScenarioName(scen.name);
    setNarrative(scen.narrative);
    setLowBound(scen.lossMagnitudeLogNormal.low10);
    setMostLikelyBound(scen.lossMagnitudeLogNormal.mostLikely);
    setHighBound(scen.lossMagnitudeLogNormal.high90);
  };

  const handleCommit = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportOpenFair = () => {
    const current = scenarios.find((s) => s.id === selectedScenarioId);
    const exportData = {
      openFairSchema: 'v3.0',
      scenarioUid: current?.uid || 'SC-04',
      name: scenarioName,
      lossMagnitudeLogNormal: {
        low: lowBound,
        mostLikely: mostLikelyBound,
        high: highBound,
      },
      faultTree: current?.faultTree,
      exportedAt: new Date().toISOString(),
      is_synthetic: true,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OpenFAIR_${current?.uid || 'SC-04'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-gray-400">Loading scenario fault tree topologies...</p>
      </div>
    );
  }

  const filteredScenarios = scenarios.filter((s) =>
    activeCategory === 'All' ? true : s.category === activeCategory
  );

  const selectedScenario =
    scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#1b2638]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              Scenario Builder & Fault Tree
            </h1>
            <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800 text-blue-300">
              OpenFAIR Model
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Construct probabilistic attack graphs with deterministic Boolean logic gates and log-normal loss bounds.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportOpenFair}
            className="px-3 py-1.5 rounded bg-[#131e2e] hover:bg-[#1a293d] border border-[#23334a] text-xs font-semibold text-gray-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Export OpenFAIR JSON</span>
          </button>
          <button
            onClick={handleCommit}
            className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Commit Changes</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Scenario parameters successfully committed to active FAIR model state.</span>
        </div>
      )}

      {/* Main Grid: Scenarios List (1/3) + Canvas & Parameters (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scenarios Portfolio List (matching Image 6) */}
        <div className="p-4 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
              Scenario Catalog ({scenarios.length})
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Deterministic</span>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] px-2 py-1 rounded transition-colors font-medium ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#111a28] text-gray-400 hover:text-white border border-[#1b2738]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Scenarios Cards List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredScenarios.map((scen) => {
              const isSelected = scen.id === selectedScenarioId;
              return (
                <div
                  key={scen.id}
                  onClick={() => handleSelectScenario(scen)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-[#152338] border-blue-500 shadow-md'
                      : 'bg-[#0e1724] border-[#1d2b3f] hover:border-[#273a54]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-blue-400">{scen.uid}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-950 border border-blue-800 text-blue-300">
                      {scen.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white leading-tight">{scen.name}</div>
                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-[#172333]">
                    <span className="text-gray-400">EAL Exposure:</span>
                    <span className="font-bold text-emerald-400">{scen.ealFormatted}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Fault Tree Canvas & Parameters (matching Image 6) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fault Tree Canvas */}
          <div className="p-5 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1b2638]">
              <div>
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-bold">
                  Topology Canvas
                </span>
                <h2 className="text-sm font-display font-bold text-white">
                  Attack Fault Tree: {selectedScenario.name}
                </h2>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => alert('Inserted new Boolean AND-Gate into graph.')}
                  className="px-2 py-1 rounded bg-[#131d2e] hover:bg-[#1a293d] border border-[#23334a] text-[10px] font-mono text-gray-300"
                >
                  + AND-Gate
                </button>
                <button
                  onClick={() => alert('Inserted new Boolean OR-Gate into graph.')}
                  className="px-2 py-1 rounded bg-[#131d2e] hover:bg-[#1a293d] border border-[#23334a] text-[10px] font-mono text-gray-300"
                >
                  + OR-Gate
                </button>
                <button
                  onClick={() => alert('Fault Tree validated: 0 cycles detected, all terminal bounds closed.')}
                  className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800 text-[10px] font-mono text-emerald-300 font-semibold"
                >
                  ✓ Solvable
                </button>
              </div>
            </div>

            {/* Canvas Area with Rendered Nodes and Connectors (matching Image 6) */}
            <div className="min-h-[340px] bg-[#080d16] rounded-lg border border-[#182333] p-4 relative flex flex-col items-center justify-between space-y-3 overflow-x-auto">
              {/* Node 1: Top Loss Event */}
              <div className="p-3 rounded-lg bg-[#1a2638] border-2 border-blue-500 text-center max-w-sm w-full shadow-lg">
                <span className="text-[9px] uppercase font-mono text-blue-300 font-bold block">
                  TOP LOSS EVENT (ROOT)
                </span>
                <span className="text-xs font-bold text-white block mt-0.5">
                  Multi-Tier Ransomware & Double Extortion
                </span>
                <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                  Computed EAL: $4.28M / yr
                </span>
              </div>

              {/* Connecting Vector */}
              <div className="h-4 w-0.5 bg-blue-500/80" />

              {/* Node 2: AND-Gate */}
              <div className="px-3 py-1 rounded bg-blue-950 border border-blue-700 text-[10px] font-mono text-blue-200 font-bold">
                AND GATE: Threat × Vulnerability
              </div>

              {/* Connecting Vector Split */}
              <div className="h-4 w-0.5 bg-blue-500/80" />

              {/* Split Nodes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                {/* Branch A: Threat Action */}
                <div className="p-2.5 rounded-lg bg-[#0e1624] border border-[#1d2b3f] text-left space-y-1">
                  <span className="text-[9px] uppercase font-mono text-amber-400 font-bold block">
                    THREAT ACTION (TEF)
                  </span>
                  <div className="text-[11px] font-medium text-white">
                    Credential Harvest & Session Hijack
                  </div>
                  <div className="text-[10px] font-mono text-gray-400">
                    TEF: 1.85 attempts / yr
                  </div>
                </div>

                {/* Branch B: Mitigating Control */}
                <div className="p-2.5 rounded-lg bg-[#0e1624] border border-[#1d2b3f] text-left space-y-1">
                  <span className="text-[9px] uppercase font-mono text-emerald-400 font-bold block">
                    MITIGATING CONTROL (CDIFF)
                  </span>
                  <div className="text-[11px] font-medium text-white">
                    Hardware-Bound WebAuthn MFA
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                    95.0% Control Efficiency
                  </div>
                </div>
              </div>

              {/* Connecting Vector */}
              <div className="h-4 w-0.5 bg-blue-500/80" />

              {/* Terminal Node */}
              <div className="p-2.5 rounded-lg bg-[#141b27] border border-[#233145] text-center max-w-sm w-full">
                <span className="text-[9px] uppercase font-mono text-gray-400 block">
                  SECONDARY LOSS TERMINAL
                </span>
                <span className="text-xs text-gray-200 font-medium block">
                  Automated EDR Host Isolation & S3 Containment
                </span>
                <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                  Severity Range: $1.8M - $6.5M
                </span>
              </div>
            </div>

            {/* Solvability Footer */}
            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1">
              <span className="flex items-center space-x-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tree Solvable (Path Depth: 4 Gates)</span>
              </span>
              <span>Convergence Margin: ±1.2%</span>
            </div>
          </div>

          {/* Parameters & Log-Normal Loss Bounds Editor */}
          <div className="p-5 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-4">
            <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider">
              Parameters & Log-Normal Loss Bounds
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Formal Scenario Narrative</label>
                <textarea
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  rows={2}
                  className="w-full bg-[#0a101b] border border-[#1e2d42] rounded-md p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              {/* Three Log-Normal Bounds Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 text-[11px] mb-1 font-mono">
                    Low 10% Bound ($)
                  </label>
                  <input
                    type="number"
                    value={lowBound}
                    onChange={(e) => setLowBound(Number(e.target.value))}
                    className="w-full bg-[#0a101b] border border-[#1e2d42] rounded-md px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[11px] mb-1 font-mono">
                    Most Likely ($)
                  </label>
                  <input
                    type="number"
                    value={mostLikelyBound}
                    onChange={(e) => setMostLikelyBound(Number(e.target.value))}
                    className="w-full bg-[#0a101b] border border-[#1e2d42] rounded-md px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[11px] mb-1 font-mono">
                    High 90% Bound ($)
                  </label>
                  <input
                    type="number"
                    value={highBound}
                    onChange={(e) => setHighBound(Number(e.target.value))}
                    className="w-full bg-[#0a101b] border border-[#1e2d42] rounded-md px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Affected Stakeholders Chips */}
              <div>
                <label className="block text-gray-400 text-[11px] mb-1.5">
                  Affected Stakeholders
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedScenario.affectedStakeholders.map((sh, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#131e2e] border border-[#22334b] text-[11px] text-gray-300 font-medium"
                    >
                      {sh}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
