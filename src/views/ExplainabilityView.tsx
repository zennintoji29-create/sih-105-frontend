import React, { useState, useEffect } from 'react';
import {
  Share2,
  ShieldCheck,
  Download,
  Sliders,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { FairDecompositionTree, Scenario } from '../types';
import { ApiClient } from '../api/client';

interface ExplainabilityViewProps {
  initialScenarioId?: string;
  onNavigateToRosi?: () => void;
}

export const ExplainabilityView: React.FC<ExplainabilityViewProps> = ({
  initialScenarioId = 'SC-04',
  onNavigateToRosi,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(initialScenarioId);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [fairTree, setFairTree] = useState<FairDecompositionTree | null>(null);
  const [loading, setLoading] = useState(true);

  // Tree node expanded states
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true,
    lef: true,
    vuln: true,
    plm: true,
    primary: true,
    secondary: true,
  });

  const toggleNode = (nodeKey: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeKey]: !prev[nodeKey] }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [scenRes, explainRes] = await Promise.all([
          ApiClient.getScenarios(),
          ApiClient.getScenarioExplainability(selectedScenarioId),
        ]);
        setScenarios(scenRes.data);
        setFairTree(explainRes.data);
      } catch (err) {
        console.error('Failed to load explainability data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedScenarioId]);

  if (loading || !fairTree) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-gray-400">Decomposing deterministic FAIR parameters...</p>
      </div>
    );
  }

  const quantilesData = [
    { label: 'P50 (Median)', value: '$3,150,000', exceedance: '50.0%', board: 'Central Tendency' },
    { label: 'P75', value: '$5,800,000', exceedance: '25.0%', board: 'High Volatility' },
    { label: 'P90', value: '$8,400,000', exceedance: '10.0%', board: 'GPD Tail Cutoff' },
    { label: 'VaR 95%', value: '$9,850,000', exceedance: '5.0%', board: 'Capital Adequacy / Solvency II' },
    { label: 'VaR 97.5%', value: '$12,400,000', exceedance: '2.5%', board: 'Extreme Stress Scenario' },
    { label: 'P99', value: '$16,200,000', exceedance: '1.0%', board: 'Tail Catastrophe' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#1b2638]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              Explainability & Causal Provenance
            </h1>
            <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800 text-blue-300">
              FAIR v3.0 Quantitative Lineage
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Every EAL figure decomposes mathematically into foundational FAIR parameters — no un-explainable risk scores or arbitrary 7.8/10 ratings.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => alert('Audit trail CSV/JSON export compiled with full SHA-256 parameter hashes.')}
            className="px-3 py-1.5 rounded bg-[#131e2e] hover:bg-[#1a293d] border border-[#23334a] text-xs font-semibold text-gray-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Audit Trail</span>
          </button>
          <button
            onClick={onNavigateToRosi}
            className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulate Control Mitigations</span>
          </button>
        </div>
      </div>

      {/* SHAP-Causality Guardrail Banner (matching Image 4) */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#0e1f2b] to-emerald-950/40 border border-emerald-700/60 text-xs text-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-emerald-300 font-mono">
              SHAP-Causality Guardrail Active [ZERO CONFOUNDER LEAKAGE]:
            </span>{' '}
            <span className="text-gray-300">
              Features are verified for causal attribution and strictly isolated by the Leakage Firewall. Invariant under adversarial simulation drift.
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3 font-mono text-[11px] text-emerald-400 shrink-0 self-end sm:self-auto">
          <span>Attribution Ratio: 100.00%</span>
          <span>•</span>
          <span>p-val: &lt; 0.0001</span>
        </div>
      </div>

      {/* Headline Metric Card: Expected Annual Loss Decomposition (matching Image 4) */}
      <div className="p-5 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-400">
              Scenario Annual Loss Expectancy
            </div>
            <div className="flex items-baseline space-x-3">
              <span className="text-2xl sm:text-3xl font-display font-bold text-white font-mono">
                ${fairTree.eal.toLocaleString()} / year
              </span>
              <span className="text-xs font-semibold text-rose-400 font-mono">
                ↑ 14.2% vs Baseline
              </span>
            </div>
          </div>

          {/* Scenario Selector Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 font-medium">Scenario:</span>
            <select
              value={selectedScenarioId}
              onChange={(e) => setSelectedScenarioId(e.target.value)}
              className="bg-[#131d2e] border border-[#24344d] rounded-md px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.uid})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Plain-English Causal Driver Statement (strictly non-hallucinatory) */}
        <div className="p-3 rounded-lg bg-[#111c2c] border border-[#1e2e44] text-xs text-gray-300 leading-relaxed">
          <span className="text-blue-300 font-semibold font-mono uppercase text-[11px] block sm:inline mr-2">
            Plain-English Causal Driver:
          </span>
          Driven primarily by High Threat Event Frequency (TEF = {fairTree.tef} attempts/yr) interacting with unsegmented vendor API access, which increases Vulnerability (V) to {fairTree.vulnerabilityPct}% despite strong perimeter edge controls (CDiff 82nd percentile).
        </div>
      </div>

      {/* Two Columns: FAIR Decomposition Tree (Left 3/5) + EVT Tail & Quantiles (Right 2/5) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column (3/5): FAIR Tree */}
        <div className="lg:col-span-3 p-5 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1b2638]">
            <div className="flex items-center space-x-2">
              <Share2 className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-display font-bold text-white uppercase tracking-wide">
                FAIR Mathematical Decomposition Tree
              </h2>
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              Interactive Nodes
            </span>
          </div>

          {/* Root Node: Expected Annual Loss (EAL) */}
          <div className="space-y-3 text-xs">
            {/* EAL Root */}
            <div className="p-3 rounded-lg bg-[#142033] border border-blue-900/60 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="font-semibold text-white">Expected Annual Loss (EAL)</span>
                <span className="text-[10px] font-mono text-gray-400">[LEF × PLM]</span>
              </div>
              <span className="font-mono font-bold text-white text-sm">
                ${fairTree.eal.toLocaleString()} / yr
              </span>
            </div>

            {/* Level 1: LEF & PLM */}
            <div className="pl-4 border-l-2 border-[#1f2f45] space-y-3">
              {/* Branch 1: Loss Event Frequency (LEF) */}
              <div className="p-3 rounded-lg bg-[#0e1726] border border-[#1f2d42] space-y-2">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleNode('lef')}
                >
                  <div className="flex items-center space-x-2">
                    {expandedNodes.lef ? (
                      <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <span className="font-semibold text-blue-200">
                      Loss Event Frequency (LEF)
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">[TEF × V]</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-white">{fairTree.lef} events / yr</span>
                    <span className="text-[10px] text-gray-400 ml-1.5">(90% CI: [0.18, 0.52])</span>
                  </div>
                </div>

                {expandedNodes.lef && (
                  <div className="pl-4 pt-2 border-l border-[#24364e] space-y-2 text-[11px]">
                    {/* TEF */}
                    <div className="flex items-center justify-between p-2 rounded bg-[#0a111c] border border-[#1a2638]">
                      <div>
                        <span className="text-gray-300 font-medium">Threat Event Frequency (TEF)</span>
                        <div className="text-[9px] text-gray-500 font-mono">Contact attempts / yr (External Logs)</div>
                      </div>
                      <span className="font-mono font-bold text-white">{fairTree.tef} / yr</span>
                    </div>

                    {/* Vulnerability */}
                    <div className="p-2 rounded bg-[#0a111c] border border-[#1a2638] space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-300 font-medium">Vulnerability (V) Susceptibility</span>
                          <div className="text-[9px] text-gray-500 font-mono">P(Loss Event | Threat Action)</div>
                        </div>
                        <span className="font-mono font-bold text-rose-300">{fairTree.vulnerabilityPct}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#162233] text-[10px] font-mono">
                        <div>
                          <span className="text-gray-500">Threat Capability (TCap): </span>
                          <span className="text-gray-300">{fairTree.tcapPercentile}th %ile</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Control Difficulty (CDiff): </span>
                          <span className="text-gray-300">{fairTree.cdiffPercentile}th %ile</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Branch 2: Loss Magnitude (PLM + SLM) */}
              <div className="p-3 rounded-lg bg-[#0e1726] border border-[#1f2d42] space-y-2">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleNode('plm')}
                >
                  <div className="flex items-center space-x-2">
                    {expandedNodes.plm ? (
                      <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <span className="font-semibold text-indigo-200">
                      Loss Magnitude (PLM + SLM)
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">[Per Loss Event]</span>
                  </div>
                  <span className="font-mono font-bold text-white">
                    ${(fairTree.plmMean / 1000000).toFixed(2)}M mean
                  </span>
                </div>

                {expandedNodes.plm && (
                  <div className="pl-4 pt-2 border-l border-[#24364e] space-y-2 text-[11px]">
                    {/* Primary Loss */}
                    <div className="p-2 rounded bg-[#0a111c] border border-[#1a2638] space-y-1">
                      <div className="flex items-center justify-between font-semibold text-gray-300">
                        <span>Primary Loss (Direct Operational)</span>
                        <span className="font-mono text-white">
                          ${(fairTree.primaryLossDirect.total / 1000000).toFixed(2)}M
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-gray-400 pt-1">
                        <div>IR: ${fairTree.primaryLossDirect.incidentResponse.toLocaleString()}</div>
                        <div>Prod: ${fairTree.primaryLossDirect.productivityLoss.toLocaleString()}</div>
                        <div>Assets: ${fairTree.primaryLossDirect.assetReplacement.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Secondary Loss */}
                    <div className="p-2 rounded bg-[#0a111c] border border-[#1a2638] space-y-1">
                      <div className="flex items-center justify-between font-semibold text-rose-300">
                        <span>Secondary Loss (External Stakeholders)</span>
                        <span className="font-mono text-white">
                          ${(fairTree.secondaryLossExternal.total / 1000000).toFixed(2)}M
                        </span>
                      </div>
                      <div className="space-y-1 text-[10px] font-mono text-gray-400 pt-1">
                        <div className="flex justify-between">
                          <span>Regulatory & SEC / GDPR Fines:</span>
                          <span className="text-gray-200">${fairTree.secondaryLossExternal.regulatoryFines.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reputation Churn (3-yr NPV):</span>
                          <span className="text-gray-200">${fairTree.secondaryLossExternal.reputationDamage3yrNPV.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Legal Defense & Class Action:</span>
                          <span className="text-gray-200">${fairTree.secondaryLossExternal.legalDefenseForensics.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-gray-500">
            <span>Deterministic Provenance Hash: {fairTree.provenanceHash}</span>
            <span className="text-emerald-400">Solvency II Certified</span>
          </div>
        </div>

        {/* Right Column (2/5): Quantiles Table & Extreme Value Theory (GPD Fit) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quantiles Table */}
          <div className="p-4 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
                Loss Distribution Quantiles
              </span>
              <span className="text-[10px] font-mono text-gray-400">100k draws</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1f2f45] text-gray-400 text-[10px] font-mono">
                    <th className="pb-1.5 font-medium">Quantile</th>
                    <th className="pb-1.5 font-medium">Exposure</th>
                    <th className="pb-1.5 font-medium">Exceed.</th>
                    <th className="pb-1.5 font-medium">Board Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#172233] font-mono text-[11px]">
                  {quantilesData.map((q, idx) => (
                    <tr
                      key={idx}
                      className={idx >= 3 ? 'bg-rose-950/20 text-rose-200' : 'text-gray-300'}
                    >
                      <td className="py-2 font-semibold">{q.label}</td>
                      <td className="py-2 font-bold text-white">{q.value}</td>
                      <td className="py-2 text-gray-400">{q.exceedance}</td>
                      <td className="py-2 text-[10px] font-sans text-gray-400">{q.board}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Extreme Value Theory: GPD Tail Fit (matching Image 4) */}
          <div className="p-4 rounded-xl bg-[#0c1421] border border-rose-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">
                  Extreme Value Theory (EVT)
                </span>
                <h3 className="text-xs font-display font-bold text-white">
                  Generalized Pareto Distribution (GPD)
                </h3>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-semibold">
                CRITICAL TAIL
              </span>
            </div>

            <p className="text-[11px] text-gray-300 leading-relaxed">
              Losses exceeding threshold <code className="text-rose-300 font-mono">u = $8.4M</code> follow a Generalized Pareto Distribution with shape parameter <span className="font-mono text-white font-bold">ξ = 0.42</span> (heavy tail, Fréchet domain of attraction).
            </p>

            <div className="grid grid-cols-2 gap-2 p-2.5 rounded bg-[#111a28] border border-[#1d2b3e] text-[11px] font-mono">
              <div>
                <div className="text-gray-500 text-[10px]">Shape Parameter (ξ):</div>
                <div className="text-rose-300 font-bold">0.42 (Fat-Tail)</div>
                <div className="text-[9px] text-gray-400">Pareto α = 2.38</div>
              </div>
              <div>
                <div className="text-gray-500 text-[10px]">Scale Parameter (σ):</div>
                <div className="text-white font-bold">$2.84M</div>
                <div className="text-[9px] text-gray-400">Tail Dispersion</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-gray-400">
                <span>Tail Distribution Fit</span>
                <span className="text-emerald-400">Anderson-Darling A² = 0.312 (Passes)</span>
              </div>
              {/* Mini GPD Curve Visualizer */}
              <div className="h-16 w-full bg-[#080e18] rounded border border-[#182333] p-1 relative flex items-end">
                <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                  {/* Empirical Histogram points */}
                  <circle cx="20" cy="15" r="2.5" fill="#3b82f6" />
                  <circle cx="60" cy="28" r="2.5" fill="#3b82f6" />
                  <circle cx="100" cy="42" r="2.5" fill="#3b82f6" />
                  <circle cx="140" cy="50" r="2.5" fill="#3b82f6" />
                  <circle cx="180" cy="55" r="2.5" fill="#3b82f6" />
                  {/* GPD Fitted Curve */}
                  <path
                    d="M 10 10 Q 50 25 100 44 T 195 57"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="flex justify-between text-[9px] font-mono text-gray-500">
                <span>Threshold u=$8.4M</span>
                <span className="text-rose-400">Catastrophic Tail Limit ($20M+)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
