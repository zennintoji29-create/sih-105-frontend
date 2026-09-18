import React, { useState, useEffect } from 'react';
import {
  Network,
  AlertTriangle,
  Layers,
  Shield,
  ExternalLink,
  Info,
  Server,
  Key,
  Database,
  Cloud,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { VendorNode, VendorDependencyResponse } from '../types';
import { ApiClient } from '../api/client';

export const VendorSpofMapView: React.FC = () => {
  const [data, setData] = useState<VendorDependencyResponse | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('v-1');
  const [activeTier, setActiveTier] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await ApiClient.getVendorDependencies();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load vendor map data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-gray-400">Computing graph-theoretic copula concentration matrix...</p>
      </div>
    );
  }

  const selectedVendor =
    data.vendors.find((v) => v.id === selectedVendorId) || data.vendors[0];

  const connectedEdges = data.edges.filter(
    (e) => e.source === selectedVendorId || e.target === selectedVendorId
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#1b2638]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              Vendor & SPoF Dependency Map
            </h1>
            <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300">
              Graph-Theoretic Exposure
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Concentration risk analysis powered by Clayton Tail Copulas to prevent naive linear risk summation.
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="p-2 rounded bg-[#0e1624] border border-[#1e2e42] text-right">
            <div className="text-[10px] text-gray-400 uppercase">Aggregate SPoF Load</div>
            <div className="text-sm font-bold text-rose-300 tabular-nums">
              {data.aggregateSpofLoadFormatted}
            </div>
          </div>
          <div className="p-2 rounded bg-[#0e1624] border border-[#1e2e42] text-right">
            <div className="text-[10px] text-gray-400 uppercase">Copula Degrease</div>
            <div className="text-sm font-bold text-blue-400 tabular-nums">
              {data.copulaDegreaseTau} τ
            </div>
          </div>
        </div>
      </div>

      {/* Copula Banner (matching Image 8) */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/30 via-[#161220] to-rose-950/30 border border-rose-800/60 text-xs text-gray-200 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-rose-200 font-mono">
              Anti-Naive-Weighting Active [Clayton Tail Copula]:
            </span>{' '}
            <span className="text-gray-300">
              Correlated vendor failures and multi-vendor common dependencies are modeled via copula tail dependence (correlation coefficient 0.85).
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Graph Canvas (3/5) + If Breached Impact Table & Blast Radius (2/5) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column (3/5): Graph Canvas (matching Image 8) */}
        <div className="lg:col-span-3 p-5 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1b2638]">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-bold">
                2 SPoFs Detected
              </span>
              <span className="text-xs text-gray-400">Click node to inspect blast radius</span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1 text-[10px]">
              {['All', 'Tier-1', 'Cloud', 'SaaS', 'Auth Providers'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveTier(f)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    activeTier === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#111a28] text-gray-400 hover:text-white border border-[#1b2738]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Graph Stage */}
          <div className="relative min-h-[460px] bg-[#070d16] rounded-xl border border-[#182538] overflow-hidden p-4">
            {/* SVG Connecting Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {data.edges.map((edge) => {
                const src = data.vendors.find((v) => v.id === edge.source);
                const tgt = data.vendors.find((v) => v.id === edge.target);
                if (!src || !tgt) return null;
                const isHighlighted =
                  edge.source === selectedVendorId || edge.target === selectedVendorId;
                return (
                  <g key={edge.id}>
                    <line
                      x1={src.position.x}
                      y1={src.position.y}
                      x2={tgt.position.x}
                      y2={tgt.position.y}
                      stroke={
                        isHighlighted
                          ? '#ef4444'
                          : edge.isSharedUpstream
                          ? '#3b82f6'
                          : '#25354e'
                      }
                      strokeWidth={isHighlighted ? 2.5 : 1.5}
                      strokeDasharray={edge.isSharedUpstream ? '4 2' : 'none'}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Interactive Vendor Nodes */}
            {data.vendors.map((vendor) => {
              const isSelected = vendor.id === selectedVendorId;
              return (
                <div
                  key={vendor.id}
                  onClick={() => setSelectedVendorId(vendor.id)}
                  style={{
                    left: `${vendor.position.x - 70}px`,
                    top: `${vendor.position.y - 35}px`,
                  }}
                  className={`absolute w-36 p-2 rounded-lg border transition-all cursor-pointer select-none text-center shadow-lg ${
                    isSelected
                      ? 'bg-[#1c293e] border-blue-400 ring-2 ring-blue-500/40 z-20 scale-105'
                      : vendor.isSpof
                      ? 'bg-[#181522] border-rose-700/80 hover:border-rose-500 z-10'
                      : 'bg-[#0f1725] border-[#1f2f45] hover:border-[#2f4666]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span
                      className={`font-bold ${
                        vendor.isSpof ? 'text-rose-400' : 'text-gray-400'
                      }`}
                    >
                      {vendor.isSpof ? 'CRITICAL SPoF' : `Tier ${vendor.tier}`}
                    </span>
                    <span className="text-gray-400">
                      {vendor.isSpof ? vendor.spofScore : `R ${vendor.riskScore}`}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5 truncate">
                    {vendor.name}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold mt-0.5">
                    {vendor.breachedEalFormatted}
                  </div>
                </div>
              );
            })}

            {/* Legend Bottom Bar */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-gray-400 bg-[#0c1421]/90 backdrop-blur-xs p-2 rounded border border-[#1b2738]">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-600" />
                  <span>Single Point of Failure (SPoF)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
                  <span>Standard Dependency</span>
                </span>
              </div>
              <span className="text-blue-400">Clayton Tail Copula: r = 0.85</span>
            </div>
          </div>
        </div>

        {/* Right Column (2/5): Ranked "If Breached" Impact Table + Blast Radius Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* If Breached Impact Ranking Table (matching Image 8) */}
          <div className="p-4 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
                Ranked "If Breached" EAL Impact
              </span>
              <span className="text-[10px] font-mono text-gray-400">Exposure</span>
            </div>

            <div className="divide-y divide-[#182436] text-xs">
              {data.vendors
                .sort((a, b) => b.breachedEal - a.breachedEal)
                .map((vendor, rank) => {
                  const isSelected = vendor.id === selectedVendorId;
                  return (
                    <div
                      key={vendor.id}
                      onClick={() => setSelectedVendorId(vendor.id)}
                      className={`py-2 px-1 flex items-center justify-between cursor-pointer rounded transition-colors ${
                        isSelected ? 'bg-[#142032]' : 'hover:bg-[#0e1624]'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] text-gray-500 w-4">
                          0{rank + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-white flex items-center space-x-1.5">
                            <span>{vendor.name}</span>
                            {vendor.isSpof && (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400">{vendor.category}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-white">{vendor.breachedEalFormatted}</div>
                        <div className="text-[10px] text-gray-400">
                          SPoF: <span className="text-rose-400">{vendor.spofScore}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Selected Vendor Blast Radius Card */}
          <div className="p-4 rounded-xl bg-[#0c1421] border border-blue-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display font-bold text-white">
                Downstream SAML Blast Radius
              </span>
              <span className="text-[10px] font-mono text-blue-400">{selectedVendor.name}</span>
            </div>

            <p className="text-[11px] text-gray-300 leading-relaxed">
              {selectedVendor.description}
            </p>

            {/* Blast Breakdown Bar */}
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between text-gray-300">
                <span>Immediate SaaS Blackout:</span>
                <span className="font-bold text-rose-400">
                  {data.downstreamBlastRadius.immediateBlackoutCount} systems
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Degraded Auth Session:</span>
                <span className="font-bold text-amber-400">
                  {data.downstreamBlastRadius.degradedSessionCount} systems
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Cached Token Persistence:</span>
                <span className="font-bold text-blue-400">
                  {data.downstreamBlastRadius.cachedTokenCount} systems
                </span>
              </div>

              <div className="pt-2 border-t border-[#182333] flex justify-between font-bold text-white text-xs">
                <span>Total Outage Projection:</span>
                <span className="text-rose-300">
                  {data.downstreamBlastRadius.totalSaasOutageProjections} SaaS Tools
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
