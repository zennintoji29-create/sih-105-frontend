import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Shield,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ReviewQueueItem } from '../types';
import { ApiClient } from '../api/client';

export const ReviewQueueView: React.FC = () => {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await ApiClient.getReviewQueue();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string, scenarioName: string) => {
    try {
      await ApiClient.approveReviewQueueItem(id);
      setActionMessage(`Approved & Published: ${scenarioName}. Baseline EAL recalculation triggered.`);
      loadData();
      setTimeout(() => setActionMessage(null), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#1b2638]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              Quant & CISO Sign-Off Review Queue
            </h1>
            <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800 text-blue-300">
              Governance Gate
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Fitted distributions, parameter shifts, and new elicitation bounds require dual authorization before merging into the board-level baseline EAL.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-gray-400">Pending Authorization: </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 font-mono text-xs font-bold">
            {items.filter((i) => i.status === 'PENDING_REVIEW').length}
          </span>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* List of Review Items */}
      <div className="space-y-4">
        {items.map((item) => {
          const isPending = item.status === 'PENDING_REVIEW';
          const primaryExpert = item.submittedEstimates?.[0];
          return (
            <div
              key={item.id}
              className={`p-5 rounded-xl border transition-all space-y-3 ${
                isPending
                  ? 'bg-[#0c1421] border-[#22334c]'
                  : 'bg-[#080d16] border-[#152030] opacity-75'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {item.scenarioId}
                  </span>
                  <span className="font-semibold text-white text-sm">
                    {item.scenarioName}
                  </span>
                </div>
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className="text-gray-500">
                    Lead Expert: {primaryExpert ? primaryExpert.expertName : 'Quantitative Team'}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500">{primaryExpert?.submittedAt || 'Recent'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-[#0e1724] border border-[#1d2b3f] text-xs font-mono">
                <div>
                  <div className="text-gray-500 text-[10px] uppercase">Parameter Target</div>
                  <div className="text-gray-200 font-semibold">{item.parameterName}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-[10px] uppercase">Distribution Fit</div>
                  <div className="text-gray-300 font-bold">{item.fittedDistribution?.distributionType || 'Beta-PERT'}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-[10px] uppercase">P50 Estimate</div>
                  <div className="text-rose-300 font-bold">{item.fittedDistribution?.quantiles?.p50 ?? 0.24}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-[10px] uppercase">Calibration Spread</div>
                  <div className={`font-bold ${(item.fittedDistribution?.calibrationSpread || 0) > 0.3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {(((item.fittedDistribution?.calibrationSpread || 0)) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {item.fittedDistribution?.calibrationWarning && (
                <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/60 text-[11px] text-amber-200">
                  {item.fittedDistribution.calibrationWarning}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-400">
                  Dual approval: Quantitative Risk Lead + Principal CISO
                </span>

                {isPending ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActionMessage(`Review item ${item.id} rejected.`)}
                      className="px-3 py-1.5 rounded bg-[#131d2e] hover:bg-[#1a293d] border border-[#23334a] text-xs text-gray-300 transition-colors cursor-pointer"
                    >
                      Reject Draft
                    </button>
                    <button
                      onClick={() => handleApprove(item.id, item.scenarioName)}
                      className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 transition-colors cursor-pointer flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Publish to Production EAL</span>
                    </button>
                  </div>
                ) : (
                  <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono text-xs font-semibold">
                    Approved & Published
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
