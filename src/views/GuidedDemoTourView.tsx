import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Layers,
  BarChart3,
  TrendingDown,
  Lock,
  Share2,
  X,
} from 'lucide-react';
import { DEMO_TOUR_STEPS } from '../fixtures/demoTourData';
import { NavigationPage } from '../types';

interface GuidedDemoTourViewProps {
  onExitTour: () => void;
  onNavigateToView: (view: NavigationPage) => void;
}

export const GuidedDemoTourView: React.FC<GuidedDemoTourViewProps> = ({
  onExitTour,
  onNavigateToView,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const step = DEMO_TOUR_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < DEMO_TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onExitTour();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Tour Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0e1625] border border-blue-900/60 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-display font-bold text-white">
                Interactive Guided Tour
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 font-semibold">
                Step {currentStepIndex + 1} of {DEMO_TOUR_STEPS.length}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Offline Mode Active • Zero backend required • Bundled actuarial fixtures
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={onExitTour}
            className="px-3 py-1.5 rounded text-xs text-gray-400 hover:text-white transition-colors"
          >
            Exit Tour
          </button>
          <button
            onClick={() => onNavigateToView(step.targetView as NavigationPage)}
            className="px-3 py-1.5 rounded bg-[#162338] hover:bg-[#20314d] border border-[#2b3f5c] text-xs font-semibold text-blue-300 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <span>Jump to View</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-5 gap-2">
        {DEMO_TOUR_STEPS.map((s, idx) => (
          <button
            key={s.step}
            onClick={() => setCurrentStepIndex(idx)}
            className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
              idx === currentStepIndex
                ? 'bg-[#152438] border-blue-500 shadow-sm'
                : idx < currentStepIndex
                ? 'bg-[#0b121e] border-emerald-900/60 text-emerald-400'
                : 'bg-[#080d16] border-[#182333] text-gray-500'
            }`}
          >
            <div className="text-[9px] font-mono font-bold uppercase">
              Step 0{s.step}
            </div>
            <div className="text-[11px] font-semibold text-gray-200 truncate mt-0.5">
              {s.title}
            </div>
          </button>
        ))}
      </div>

      {/* Step Detail Card */}
      <div className="p-6 rounded-xl bg-[#0c1421] border border-[#1f2d42] space-y-6 shadow-xl">
        <div className="space-y-2">
          <div className="text-xs uppercase font-mono font-bold text-blue-400">
            {step.subtitle}
          </div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">
            {step.title}
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">
            {step.narrative}
          </p>
        </div>

        {/* Key Metric & Audit Proof Callout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-[#080e18] border border-[#182538]">
          <div className="p-3 rounded bg-[#0d1624] border border-[#1c2a3d]">
            <div className="text-[10px] font-mono text-gray-400 uppercase font-semibold">
              {step.keyMetric.label}
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {step.keyMetric.value}
            </div>
            <div className="text-xs font-mono text-blue-400 mt-0.5">
              {step.keyMetric.badge}
            </div>
          </div>
          <div className="p-3 rounded bg-[#0d1624] border border-[#1c2a3d] flex flex-col justify-between">
            <div className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
              MATHEMATICAL PROVENANCE
            </div>
            <div className="text-xs font-mono text-gray-300 mt-1 leading-relaxed">
              {step.auditProof}
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#182333]">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 rounded-lg bg-[#111c2c] hover:bg-[#1a293d] border border-[#203147] text-xs font-semibold text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Step</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigateToView(step.targetView as NavigationPage)}
              className="px-4 py-2 rounded-lg bg-[#142236] hover:bg-[#1e314d] border border-[#283e5c] text-xs font-semibold text-blue-300 transition-colors cursor-pointer"
            >
              Open Active Interface
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <span>{currentStepIndex === DEMO_TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
