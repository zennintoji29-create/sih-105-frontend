import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Sparkles,
  TrendingDown,
  Lock,
  Layers,
  Activity,
  CheckCircle2,
  FileCheck,
  Compass,
  Cpu,
  BarChart3,
  Server,
} from 'lucide-react';
import { NavigationPage } from '../types';

interface LandingPageProps {
  onEnterApp: () => void;
  onLaunchDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onLaunchDemo }) => {
  return (
    <div className="min-h-screen bg-[#070c14] text-[#d9e3f5] flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <nav className="border-b border-[#182333] bg-[#0a121e]/90 backdrop-blur-md px-6 py-4 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldAlert className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white tracking-tight">
            Cyber<span className="text-blue-400">EAL</span>
          </span>
          <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800 text-blue-300">
            FAIR v3.2 Quantitative SaaS
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onLaunchDemo}
            className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#142033] hover:bg-[#1d2d47] border border-[#243754] text-blue-300 hover:text-white transition-all flex items-center space-x-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive Demo Tour</span>
          </button>
          <button
            onClick={onEnterApp}
            className="px-4 py-1.5 rounded-md text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-800/80 text-blue-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Beyond Qualitative 1–10 Risk Heatmaps</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.15]">
            Continuous Cyber-Risk Quantification in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-200">Dollars & Probabilities</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-300 leading-relaxed font-sans max-w-2xl mx-auto">
            CyberEAL replaces arbitrary subjective risk scores with rigorous mathematical loss modeling.
            Built on OpenFAIR, FABRICS elicitation, and 1,000,000 Monte Carlo draws to give CISOs and CFOs
            defensible Expected Annualized Loss (EAL) and 95% Tail Value at Risk (VaR).
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <span>Enter Active Quantification Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLaunchDemo}
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold bg-[#121c2c] hover:bg-[#1b2a42] border border-[#233550] text-gray-200 hover:text-white flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-blue-400" />
              <span>Offline Guided Demo Tour</span>
            </button>
          </div>

          {/* Quick Stats Pill Line */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-lg bg-[#0e1624] border border-[#1d2b3f]">
              <div className="text-[10px] uppercase font-mono text-gray-400">Enterprise EAL</div>
              <div className="text-lg font-bold text-white font-mono mt-0.5">$14.82M / yr</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">↓ 4.2% Quarterly Drift</div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#0e1624] border border-[#1d2b3f]">
              <div className="text-[10px] uppercase font-mono text-gray-400">VaR 95% (Tail Risk)</div>
              <div className="text-lg font-bold text-white font-mono mt-0.5">$42.15M</div>
              <div className="text-[10px] text-amber-400 mt-0.5">1-in-20 yr Loss Event</div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#0e1624] border border-[#1d2b3f]">
              <div className="text-[10px] uppercase font-mono text-gray-400">Monte Carlo Fidelity</div>
              <div className="text-lg font-bold text-white font-mono mt-0.5">1,000,000</div>
              <div className="text-[10px] text-blue-400 mt-0.5">99.4% Convergence Conf</div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#0e1624] border border-[#1d2b3f]">
              <div className="text-[10px] uppercase font-mono text-gray-400">Fat Tail Parameter</div>
              <div className="text-lg font-bold text-white font-mono mt-0.5">ξ = 0.42</div>
              <div className="text-[10px] text-rose-400 mt-0.5">GPD Heavy Tail Model</div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-display font-bold text-white">
              Deterministic Mathematical Architecture
            </h2>
            <p className="text-xs text-gray-400">
              Designed for SEC Item 106 compliance, Solvency II balance sheet tests, and CISO capital allocation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-[#0c1421] border border-[#1d2a3e] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Dynamic Telemetry Shocks</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Ingests real-time signals: phishing simulation drift, perimeter firewall edits, and CVSS 9.8 zero-days to immediately re-calculate Threat Event Frequency and Vulnerability.
              </p>
              <div className="text-[10px] font-mono text-blue-400 bg-[#121d2c] p-2 rounded border border-[#1d2b3e]">
                LEF = TEF × V × (1 − Control_Eff)
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#0c1421] border border-[#1d2a3e] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">GPD Extreme Value Theory</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Standard Gaussian bell curves dangerously underestimate tail cyber risk. CyberEAL fits Generalized Pareto Distributions to exceedances, capturing catastrophic power-law losses.
              </p>
              <div className="text-[10px] font-mono text-indigo-400 bg-[#121d2c] p-2 rounded border border-[#1d2b3e]">
                GPD Shape ξ=0.42 (Fat-Tail Verified)
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#0c1421] border border-[#1d2a3e] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Causal ROSI Counterfactuals</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Re-simulates the entire loss distribution to verify how a specific capital allocation reduces residual EAL, yielding defensible Return on Security Investment with 90% confidence intervals.
              </p>
              <div className="text-[10px] font-mono text-emerald-400 bg-[#121d2c] p-2 rounded border border-[#1d2b3e]">
                ROSI = (ΔEAL − Control_Cost) / Cost
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#0c1421] border border-[#1d2a3e] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">SPoF Copula Concentration</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Models systemic dependency concentration. When multiple vendors rely on common identity providers (Okta) or infrastructure (AWS us-east-1), failure probabilities are correlated via Clayton tail copulas.
              </p>
              <div className="text-[10px] font-mono text-rose-400 bg-[#121d2c] p-2 rounded border border-[#1d2b3e]">
                Clayton Tail Copula (τ = 0.82)
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#0c1421] border border-[#1d2a3e] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">ML Leakage Firewall</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Automated leakage testing that guarantees all predictive telemetry is verified prior to loss events, actively barring post-incident confounders like forensic spend or containment duration.
              </p>
              <div className="text-[10px] font-mono text-cyan-400 bg-[#121d2c] p-2 rounded border border-[#1d2b3e]">
                Attribution Ratio: 100.0% (p &lt; 0.0001)
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#0c1421] border border-[#1d2a3e] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Deterministic AI Copilot</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Restricted to a strict whitelist of 6 quantitative intents. Pulls mathematical proofs and parameter tables directly from the FAIR state machine without model hallucination.
              </p>
              <div className="text-[10px] font-mono text-purple-400 bg-[#121d2c] p-2 rounded border border-[#1d2b3e]">
                Audited Intent Whitelist
              </div>
            </div>
          </div>
        </div>

        {/* CISO & Board Value Callout */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-[#0d1624] to-[#121c2e] border border-[#213149] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl font-display font-bold text-white">
              Ready for Boardroom & Audit Committee Scrutiny
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Equip your executive leadership with the numbers that matter: Expected Loss, VaR 95%, SPoF blast radius, and defensible control budgets. Compatible with NIST CSF 2.0 and SEC Cyber Disclosure requirements.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onEnterApp}
              className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Open Risk Dashboard
            </button>
            <button
              onClick={onLaunchDemo}
              className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#1a2638] hover:bg-[#23334c] text-blue-300 border border-blue-900/50 transition-all cursor-pointer"
            >
              View Demo Tour
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#16202f] bg-[#070b12] px-6 py-6 text-center text-xs text-gray-500">
        <p className="font-mono">
          CyberEAL Enterprise v4.8.2 • FAIR (Factor Analysis of Information Risk) Standard v3.2 Compliance • FABRICS Loss Exposure Engine
        </p>
      </footer>
    </div>
  );
};
