import React, { useState } from 'react';
import { NavigationPage } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AiCopilotDrawer } from './components/AiCopilotDrawer';
import { BackendSettingsModal } from './components/BackendSettingsModal';

import { LandingPage } from './views/LandingPage';
import { RiskDashboardView } from './views/RiskDashboardView';
import { ExplainabilityView } from './views/ExplainabilityView';
import { ScenarioBuilderView } from './views/ScenarioBuilderView';
import { VendorSpofMapView } from './views/VendorSpofMapView';
import { RosiSimulatorView } from './views/RosiSimulatorView';
import { InvestmentTrackerView } from './views/InvestmentTrackerView';
import { ElicitationPortalView } from './views/ElicitationPortalView';
import { ReviewQueueView } from './views/ReviewQueueView';
import { DataSourcesProvenanceView } from './views/DataSourcesProvenanceView';
import { SimulationSandboxView } from './views/SimulationSandboxView';
import { GuidedDemoTourView } from './views/GuidedDemoTourView';
import { ApiConfig } from './api/client';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedScenarioForDetail, setSelectedScenarioForDetail] = useState<string>('SC-04');
  const [refreshKey, setRefreshKey] = useState(0);

  const isLiveEnabled = ApiConfig.isLiveEnabled();

  const handleNavigate = (page: NavigationPage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If on landing page, render standalone landing without enterprise sidebar
  if (currentPage === 'landing') {
    return (
      <LandingPage
        onEnterApp={() => handleNavigate('dashboard')}
        onLaunchDemo={() => handleNavigate('demo')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070c14] text-[#d9e3f5] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Global Top Header Bar */}
      <Header
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNavigateHome={() => handleNavigate('landing')}
        isSyntheticDemo={!isLiveEnabled}
      />

      {/* Main Container: Sidebar + Page View Content */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Navigation Sidebar */}
        <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

        {/* Dynamic Route View Stage */}
        <main className="flex-1 overflow-y-auto bg-[#080d16] min-h-[calc(100vh-56px)] pb-12">
          {currentPage === 'dashboard' && (
            <RiskDashboardView
              key={refreshKey}
              onNavigate={handleNavigate}
              onOpenCopilot={() => setIsCopilotOpen(true)}
              isSyntheticDemo={!isLiveEnabled}
              onSelectScenarioForDetail={(scenId) => {
                setSelectedScenarioForDetail(scenId);
              }}
            />
          )}

          {currentPage === 'explainability' && (
            <ExplainabilityView
              initialScenarioId={selectedScenarioForDetail}
              onNavigateToRosi={() => handleNavigate('rosi')}
            />
          )}

          {currentPage === 'scenarios' && (
            <ScenarioBuilderView
              onNavigateToSimulation={() => handleNavigate('simulation-sandbox')}
            />
          )}

          {currentPage === 'vendors' && <VendorSpofMapView />}

          {currentPage === 'rosi' && <RosiSimulatorView />}

          {currentPage === 'investments' && <InvestmentTrackerView />}

          {currentPage === 'elicitation' && <ElicitationPortalView />}

          {currentPage === 'review-queue' && <ReviewQueueView />}

          {currentPage === 'data-sources' && <DataSourcesProvenanceView />}

          {currentPage === 'simulation-sandbox' && (
            <SimulationSandboxView
              onExitSimulation={() => handleNavigate('dashboard')}
              onNavigateToReviewQueue={() => handleNavigate('review-queue')}
            />
          )}

          {currentPage === 'demo' && (
            <GuidedDemoTourView
              onExitTour={() => handleNavigate('dashboard')}
              onNavigateToView={(view) => handleNavigate(view)}
            />
          )}
        </main>
      </div>

      {/* Global AI Copilot Drawer (Openable from any screen) */}
      <AiCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        activePage={currentPage}
        activeScenarioId={selectedScenarioForDetail}
      />

      {/* Backend Settings & FastAPI Connectivity Modal */}
      <BackendSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRefreshData={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}

