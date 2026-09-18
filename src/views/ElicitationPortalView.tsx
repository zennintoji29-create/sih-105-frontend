import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sliders,
  Sparkles,
  HelpCircle,
  Plus,
  Send,
} from 'lucide-react';
import { ExpertEstimate } from '../types';

interface ElicitationEstimate {
  id: string;
  expertName: string;
  expertRole: string;
  low: number;
  mostLikely: number;
  high: number;
  confidenceWeight: number;
}

export const ElicitationPortalView: React.FC = () => {
  const [scenarioName, setScenarioName] = useState('Supply Chain Third-Party Ransomware Vector (SC-04)');
  const [parameterType, setParameterType] = useState<'Loss Magnitude' | 'Threat Event Frequency'>('Loss Magnitude');
  const [estimates, setEstimates] = useState<ElicitationEstimate[]>([
    {
      id: 'e-1',
      expertName: 'Dr. Sarah Chen',
      expertRole: 'Lead Threat Researcher',
      low: 1200000,
      mostLikely: 3500000,
      high: 8000000,
      confidenceWeight: 0.9,
    },
    {
      id: 'e-2',
      expertName: 'Marcus Vance',
      expertRole: 'Principal Cloud Architect',
      low: 1800000,
      mostLikely: 4200000,
      high: 11500000,
      confidenceWeight: 0.85,
    },
    {
      id: 'e-3',
      expertName: 'Elena Rostova',
      expertRole: 'CISO / Enterprise Risk Lead',
      low: 950000,
      mostLikely: 3900000,
      high: 14000000,
      confidenceWeight: 0.95,
    },
  ]);

  // Form states for new estimate
  const [newExpertName, setNewExpertName] = useState('');
  const [newExpertRole, setNewExpertRole] = useState('');
  const [newLow, setNewLow] = useState(1500000);
  const [newMostLikely, setNewMostLikely] = useState(4000000);
  const [newHigh, setNewHigh] = useState(10000000);

  // Qualitative scale fallback tool
  const [qualitativeScale, setQualitativeScale] = useState<
    'Rarely' | 'Less likely' | 'Possibly' | 'Likely' | 'Very likely'
  >('Possibly');

  // Compute aggregate weighted PERT mean: (L + 4M + H) / 6
  const individualPertMeans = estimates.map((e) => ({
    ...e,
    pertMean: (e.low + 4 * e.mostLikely + e.high) / 6,
  }));

  const totalWeight = estimates.reduce((acc, e) => acc + e.confidenceWeight, 0);
  const aggregateWeightedMean =
    individualPertMeans.reduce((acc, e) => acc + e.pertMean * e.confidenceWeight, 0) /
    totalWeight;

  // Calculate spread: (max - min) / aggregateWeightedMean
  const means = individualPertMeans.map((e) => e.pertMean);
  const maxMean = Math.max(...means);
  const minMean = Math.min(...means);
  const spreadRatio = (maxMean - minMean) / aggregateWeightedMean;
  const isHighUncertainty = spreadRatio > 0.35;

  // Qualitative scale fallback conversion:
  // Poisson rate lambda mapping:
  const qualitativeMapping = {
    Rarely: { lambda: 0.1, desc: '1 event every 10 years' },
    'Less likely': { lambda: 0.3, desc: '1 event every ~3.3 years' },
    Possibly: { lambda: 0.6, desc: '1 event every ~1.7 years' },
    Likely: { lambda: 1.2, desc: '1.2 events per year' },
    'Very likely': { lambda: 2.5, desc: '2.5 events per year' },
  };
  const selectedQual = qualitativeMapping[qualitativeScale];
  const derivedLef = 1 - Math.exp(-selectedQual.lambda);

  const handleAddEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpertName.trim()) return;
    const newEst: ElicitationEstimate = {
      id: `e-${Date.now()}`,
      expertName: newExpertName,
      expertRole: newExpertRole || 'Subject Matter Expert',
      low: newLow,
      mostLikely: newMostLikely,
      high: newHigh,
      confidenceWeight: 0.8,
    };
    setEstimates([...estimates, newEst]);
    setNewExpertName('');
    setNewExpertRole('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#1b2638]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              Expert Elicitation Portal
            </h1>
            <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800 text-blue-300">
              FABRICS / CLUE Standard
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Structured elicitation protocol to collect independent calibrated 4-parameter estimates and prevent anchoring bias.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-gray-400">Target Scenario: </span>
          <span className="text-xs font-semibold text-white">{scenarioName}</span>
        </div>
      </div>

      {/* High Uncertainty Warning (spread > 0.35) */}
      {isHighUncertainty && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-xs text-amber-200 flex items-start space-x-3 shadow-md">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-300 font-mono">
              Calibration Warning: Expert Disparity High (Spread: {(spreadRatio * 100).toFixed(1)}% &gt; 35.0%)
            </span>
            <p className="text-amber-100/90 leading-relaxed text-[11px]">
              Substantial variance observed across expert upper bounds. Consider running a structured Delphi consensus round or conducting an evidence-anchored calibration workshop prior to publishing.
            </p>
          </div>
        </div>
      )}

      {/* Grid: Elicitation Submissions & KDE Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Expert Submissions Table (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b2638]">
              <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
                Independent Expert Inputs ({estimates.length})
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                Beta-PERT Consensus Mean: ${(aggregateWeightedMean / 1000000).toFixed(2)}M
              </span>
            </div>

            <div className="divide-y divide-[#172233]">
              {individualPertMeans.map((e) => (
                <div key={e.id} className="py-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white">{e.expertName}</span>
                      <span className="text-[11px] text-gray-400 ml-2">({e.expertRole})</span>
                    </div>
                    <span className="font-mono font-bold text-blue-400">
                      PERT: ${(e.pertMean / 1000000).toFixed(2)}M
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-[11px] text-gray-400">
                    <div>Low (10%): <span className="text-white">${(e.low / 1000000).toFixed(2)}M</span></div>
                    <div>Most Likely: <span className="text-white">${(e.mostLikely / 1000000).toFixed(2)}M</span></div>
                    <div>High (90%): <span className="text-white">${(e.high / 1000000).toFixed(2)}M</span></div>
                    <div>Weight: <span className="text-emerald-400">{(e.confidenceWeight * 100).toFixed(0)}%</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Visualizer Distribution Bar */}
            <div className="pt-3 border-t border-[#182333] space-y-2">
              <div className="flex justify-between text-[11px] font-mono text-gray-400">
                <span>Consensus Range Span</span>
                <span>$0.8M to $15.0M Log-Normal Span</span>
              </div>
              <div className="h-4 bg-[#0a111b] rounded-full relative border border-[#1b2a3d] flex items-center">
                {/* Aggregate Mean Marker */}
                <div
                  style={{ left: `${Math.min(90, Math.max(10, (aggregateWeightedMean / 15000000) * 100))}%` }}
                  className="absolute w-3 h-3 bg-blue-500 rounded-full -translate-x-1/2 border-2 border-white shadow-md"
                  title="Consensus PERT Mean"
                />
              </div>
              <div className="text-[10px] font-mono text-gray-500 text-center">
                ● Aggregate Beta-PERT Weighted Mean: ${(aggregateWeightedMean / 1000000).toFixed(2)}M
              </div>
            </div>
          </div>

          {/* Form to submit new estimate */}
          <form onSubmit={handleAddEstimate} className="p-5 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-4">
            <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider">
              Submit New Expert Calibration Draw
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Expert Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Vance"
                  value={newExpertName}
                  onChange={(e) => setNewExpertName(e.target.value)}
                  className="w-full bg-[#080d16] border border-[#1e2d42] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Role / Domain Specialty</label>
                <input
                  type="text"
                  placeholder="e.g. Infrastructure Security Lead"
                  value={newExpertRole}
                  onChange={(e) => setNewExpertRole(e.target.value)}
                  className="w-full bg-[#080d16] border border-[#1e2d42] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono">
              <div>
                <label className="block text-gray-400 text-[11px] mb-1">Low (10%) ($)</label>
                <input
                  type="number"
                  value={newLow}
                  onChange={(e) => setNewLow(Number(e.target.value))}
                  className="w-full bg-[#080d16] border border-[#1e2d42] rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-[11px] mb-1">Most Likely ($)</label>
                <input
                  type="number"
                  value={newMostLikely}
                  onChange={(e) => setNewMostLikely(Number(e.target.value))}
                  className="w-full bg-[#080d16] border border-[#1e2d42] rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-[11px] mb-1">High (90%) ($)</label>
                <input
                  type="number"
                  value={newHigh}
                  onChange={(e) => setNewHigh(Number(e.target.value))}
                  className="w-full bg-[#080d16] border border-[#1e2d42] rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Elicitation Sample</span>
            </button>
          </form>
        </div>

        {/* Right Column: Qualitative Scale Fallback Tool (1/3) */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-[#1b2638]">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider">
                Qualitative Scale Fallback
              </h3>
            </div>

            <p className="text-[11px] text-gray-300 leading-relaxed">
              When empirical telemetry is absent, qualitative ordinal scales (Rarely to Very likely) are converted to a Poisson arrival rate <code className="text-indigo-300 font-mono">λ</code>, yielding Loss Event Frequency:
            </p>

            <div className="p-2.5 rounded bg-[#101928] border border-[#1e2d42] font-mono text-[11px] text-center text-indigo-300">
              P(Loss Event ≥ 1 / yr) = 1 − e^(−λ)
            </div>

            {/* Ordinal Selection Radio List */}
            <div className="space-y-2">
              {(['Rarely', 'Less likely', 'Possibly', 'Likely', 'Very likely'] as const).map(
                (scale) => (
                  <label
                    key={scale}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                      qualitativeScale === scale
                        ? 'bg-[#152338] border-blue-500 text-white'
                        : 'bg-[#0d1624] border-[#1d2a3e] text-gray-300 hover:border-[#273950]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="qualScale"
                        checked={qualitativeScale === scale}
                        onChange={() => setQualitativeScale(scale)}
                        className="accent-blue-500"
                      />
                      <span className="font-semibold text-xs">{scale}</span>
                    </div>
                    <span className="font-mono text-[10px] text-gray-400">
                      λ = {qualitativeMapping[scale].lambda}
                    </span>
                  </label>
                )
              )}
            </div>

            {/* Computed Math Output */}
            <div className="p-3 rounded-lg bg-[#0e1726] border border-blue-900/50 space-y-1 font-mono text-xs">
              <div className="text-gray-400 text-[10px]">Calculated Loss Event Frequency:</div>
              <div className="text-lg font-bold text-emerald-400">
                {(derivedLef * 100).toFixed(1)}% annual probability
              </div>
              <div className="text-[10px] text-gray-400">{selectedQual.desc}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
