import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { ControlInvestment } from '../types';
import { ApiClient } from '../api/client';

export const InvestmentTrackerView: React.FC = () => {
  const [investments, setInvestments] = useState<ControlInvestment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await ApiClient.getInvestments();
        setInvestments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalCost = investments.reduce((acc, i) => acc + i.annualCost, 0);
  const totalPredictedEalReduction = investments.reduce(
    (acc, i) => acc + i.predictedEalReduction,
    0
  );
  const totalActualEalReduction = investments.reduce(
    (acc, i) => acc + (i.actualEalReduction || 0),
    0
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#1b2638]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              Security Capital Investment Tracker
            </h1>
            <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300">
              ROSI Post-Mortem Audit
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Tracking predicted vs realized EAL reductions to validate control investments against board promises.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => alert('Add investment dialog opened')}
            className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deployed Control</span>
          </button>
        </div>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0c1421] border border-[#1f2d42]">
          <div className="text-[10px] uppercase font-mono text-gray-400">Total Capital Deployed</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            ${(totalCost / 1000000).toFixed(2)}M / yr
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Across 4 core programs</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c1421] border border-[#1f2d42]">
          <div className="text-[10px] uppercase font-mono text-gray-400">Realized EAL Reduction</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            ${(totalActualEalReduction / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            Target was ${(totalPredictedEalReduction / 1000000).toFixed(2)}M (94% accuracy)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c1421] border border-[#1f2d42]">
          <div className="text-[10px] uppercase font-mono text-gray-400">Portfolio Net ROSI</div>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
            +212.5%
          </div>
          <div className="text-[11px] text-emerald-400 mt-0.5">
            Positive risk mitigation alpha
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-5 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
            Active Control Deployments
          </span>
          <span className="text-[10px] font-mono text-gray-400">FAIR Post-Implementation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1f2f45] text-gray-400 text-[10px] font-mono">
                <th className="pb-2 font-medium">Control Name</th>
                <th className="pb-2 font-medium">Target Scenario</th>
                <th className="pb-2 font-medium">Annual Cost</th>
                <th className="pb-2 font-medium">Predicted EAL Δ</th>
                <th className="pb-2 font-medium">Actual EAL Δ</th>
                <th className="pb-2 font-medium">Variance</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172233] font-mono text-[11px]">
              {investments.map((inv) => {
                const variance =
                  inv.actualEalReduction != null
                    ? inv.actualEalReduction - inv.predictedEalReduction
                    : 0;
                return (
                  <tr key={inv.id} className="hover:bg-[#0e1724] transition-colors">
                    <td className="py-3 font-sans font-semibold text-white">
                      {inv.controlName}
                    </td>
                    <td className="py-3 text-blue-300 font-sans">{inv.category}</td>
                    <td className="py-3 text-gray-300 font-bold">${inv.annualCost.toLocaleString()}</td>
                    <td className="py-3 text-emerald-400">${inv.predictedEalReduction.toLocaleString()}</td>
                    <td className="py-3 font-bold text-white">
                      {inv.actualEalReduction
                        ? `$${inv.actualEalReduction.toLocaleString()}`
                        : 'Tracking (30d)'}
                    </td>
                    <td className="py-3">
                      {inv.actualEalReduction ? (
                        <span className={variance >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                          {variance >= 0 ? '+' : ''}${variance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
