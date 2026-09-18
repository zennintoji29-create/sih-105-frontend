/**
 * CyberEAL - Domain Data Types & API Contract Interfaces
 * FAIR (Factor Analysis of Information Risk) + FABRICS Loss Exposure Methodology
 */

export type NavigationPage =
  | 'landing'
  | 'dashboard'
  | 'scenarios'
  | 'elicitation'
  | 'review-queue'
  | 'explainability'
  | 'vendors'
  | 'rosi'
  | 'investments'
  | 'data-sources'
  | 'simulation-sandbox'
  | 'demo';

export interface User {
  id: string;
  name: string;
  title: string;
  email: string;
  role: 'CISO' | 'RiskQuant' | 'Auditor' | 'Executive';
  avatarUrl?: string;
  orgId: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  annualRevenue: number;
  totalAssetsValuation: number;
  currency: string;
}

// -------------------------------------------------------------
// FAIR Decomposition & Parameters
// -------------------------------------------------------------

export interface FairParameterNode {
  id: string;
  label: string;
  type: 'product' | 'sum' | 'leaf';
  valueFormatted: string;
  numericValue: number;
  unit: string;
  confidenceInterval90?: [number, number];
  sourceMethod?: string;
  children?: FairParameterNode[];
  description?: string;
}

export interface FairDecompositionTree {
  scenarioId: string;
  scenarioName: string;
  eal: number;
  lef: number;
  tef: number;
  vulnerabilityPct: number;
  tcapPercentile: number;
  cdiffPercentile: number;
  plmMean: number;
  primaryLossDirect: {
    incidentResponse: number;
    productivityLoss: number;
    assetReplacement: number;
    total: number;
  };
  secondaryLossExternal: {
    secondaryEventFrequencyPct: number;
    regulatoryFines: number;
    reputationDamage3yrNPV: number;
    legalDefenseForensics: number;
    total: number;
  };
  provenanceHash: string;
}

// -------------------------------------------------------------
// Scenarios & Simulation
// -------------------------------------------------------------

export interface QuantileFigures {
  p2_5: number;
  p25: number;
  p50: number; // Median
  p75: number;
  p90: number;
  p95: number; // VaR 95%
  p97_5: number; // VaR 97.5%
  p99: number; // Tail extreme
}

export interface HistogramBin {
  rangeLabel: string;
  minVal: number;
  maxVal: number;
  count: number;
  density: number;
  isTail: boolean;
}

export interface GpdTailFit {
  shapeXi: number; // ξ (>0 indicates fat tail)
  scaleSigma: number; // σ
  thresholdU: number; // loss threshold u
  andersonDarlingA2: number;
  goodnessOfFitVerdict: string;
  fatTailDetected: boolean;
  paretoAlpha: number;
  tailPoints: Array<{ loss: number; empiricalDensity: number; gpdDensity: number }>;
}

export interface Scenario {
  id: string;
  uid: string;
  name: string;
  category: 'Ransomware' | 'Third-Party' | 'Cloud' | 'Social Eng' | 'Insider Threat';
  status: 'PUBLISHED' | 'SYNTHETIC' | 'DRAFT';
  eal: number;
  ealFormatted: string;
  portfolioPct: number;
  var95: number;
  var97_5: number;
  lef: number;
  narrative: string;
  affectedStakeholders: string[];
  lossMagnitudeLogNormal: {
    low10: number;
    mostLikely: number;
    high90: number;
    confidence: number;
  };
  faultTree: FaultTreeModel;
  is_synthetic: boolean;
}

export interface FaultTreeNode {
  id: string;
  name: string;
  type: 'top_event' | 'and_gate' | 'or_gate' | 'threat_action' | 'control' | 'terminal';
  parameters?: Record<string, any>;
  efficiencyPct?: number;
  calculatedProbability?: number;
  boundsFormatted?: string;
  position?: { x: number; y: number };
}

export interface FaultTreeModel {
  nodes: FaultTreeNode[];
  edges: Array<{ from: string; to: string; label?: string }>;
  deterministic: boolean;
  solvable: boolean;
  pathDepth: number;
  convergenceMarginPct: number;
}

// -------------------------------------------------------------
// Dashboard API Types
// -------------------------------------------------------------

export interface ChangeAttributionItem {
  id: string;
  title: string;
  timeAgo: string;
  category: string;
  deltaEal: number;
  deltaEalFormatted: string;
  percentageChange?: number;
  direction: 'up' | 'down';
  contributingFactor: string; // "contributed to prediction"
  is_synthetic: boolean;
}

export interface HistoricalEalPoint {
  date: string;
  residualEal: number;
  inherentRisk: number;
}

export interface DashboardResponse {
  totalEal: number;
  totalEalFormatted: string;
  ealQuarterlyDeltaPct: number;
  isEalDecreasing: boolean;
  var95: number;
  var95Formatted: string;
  varQuarterlyDeltaPct: number;
  activeScenariosCount: number;
  underReviewCount: number;
  certifiedPct: number;
  selectedScenarioId: string;
  selectedScenarioName: string;
  selectedScenarioLef: number;
  selectedScenarioLefFormatted: string;
  selectedScenarioLefDeltaPct: number;
  quantiles: QuantileFigures;
  histogram: HistogramBin[];
  gpdTailFit: GpdTailFit;
  historicalTrend: HistoricalEalPoint[];
  changeAttributionFeed: ChangeAttributionItem[];
  scenarioComparison: Array<{
    id: string;
    name: string;
    uid: string;
    portfolioPct: number;
    eal: number;
    ealFormatted: string;
  }>;
  simulationEngine: string;
  monteCarloRuns: number;
  convergenceConfPct: number;
  is_synthetic: boolean;
}

// -------------------------------------------------------------
// Expert Elicitation & Review Queue (FABRICS/CLUE Method)
// -------------------------------------------------------------

export interface ExpertEstimate {
  id: string;
  targetId: string;
  expertName: string;
  expertTitle: string;
  estimateType: 'point' | 'qualitative' | 'triangular';
  rawPointValue?: number;
  qualitativeScale?: 'Rarely' | 'Less likely' | 'Possibly' | 'Likely' | 'Very likely';
  derivedAnnualRateLambda?: number;
  annualProbability?: number;
  lowBound?: number;
  highBound?: number;
  confidenceScore: number;
  submittedAt: string;
  rationale: string;
  is_synthetic: boolean;
}

export interface FittedDistribution {
  targetId: string;
  parameterName: string;
  distributionType: 'Beta' | 'Gamma' | 'KDE_Multimodal';
  isUnimodal: boolean;
  kdeCurve: Array<{ x: number; density: number }>;
  betaParameters?: { alpha: number; beta: number };
  gammaParameters?: { k: number; theta: number };
  calibrationSpread: number; // High spread triggers warning
  calibrationWarning?: string;
  quantiles: {
    p10: number;
    p50: number;
    p90: number;
  };
  recommendedPrior: string;
  is_synthetic: boolean;
}

export interface ReviewQueueItem {
  id: string;
  targetId: string;
  scenarioId: string;
  scenarioName: string;
  parameterName: string;
  parameterType: 'TEF' | 'Vulnerability' | 'Control_Effectiveness' | 'PLM';
  submittedEstimates: ExpertEstimate[];
  fittedDistribution: FittedDistribution;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  reviewer?: string;
  reviewedAt?: string;
  is_synthetic: boolean;
}

// -------------------------------------------------------------
// Vendor & SPoF Dependency Map
// -------------------------------------------------------------

export interface VendorNode {
  id: string;
  name: string;
  category: string;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  isSpof: boolean;
  spofScore: number; // e.g. 0.94
  riskScore: number; // e.g. 8.8
  breachedEal: number;
  breachedEalFormatted: string;
  description: string;
  position: { x: number; y: number };
  tier: number;
  status: 'active' | 'degraded' | 'resilient';
  is_synthetic: boolean;
}

export interface VendorDependencyEdge {
  id: string;
  source: string;
  target: string;
  correlation: number; // e.g. 0.85
  vectorType: 'Authentication (SAML)' | 'Infrastructure Flow' | 'Direct Data API';
  isSharedUpstream: boolean;
  is_synthetic: boolean;
}

export interface VendorDependencyResponse {
  vendors: VendorNode[];
  edges: VendorDependencyEdge[];
  aggregateSpofLoad: number;
  aggregateSpofLoadFormatted: string;
  copulaDegreaseTau: number; // 0.82
  copulaModel: string; // "Clayton Tail Copula"
  downstreamBlastRadius: {
    immediateBlackoutCount: number;
    degradedSessionCount: number;
    cachedTokenCount: number;
    totalSaasOutageProjections: number;
  };
  is_synthetic: boolean;
}

// -------------------------------------------------------------
// ROSI & Investments
// -------------------------------------------------------------

export interface RosiSimulationRequest {
  controlId: string;
  controlName: string;
  controlCost: number;
  targetScenarioId: string;
  mitigationPct: number;
}

export interface RosiSimulationResponse {
  controlName: string;
  controlCost: number;
  beforeEal: number;
  afterEal: number;
  ealReduction: number;
  mitigationPct: number;
  rosiPct: number;
  confidenceInterval90: [number, number];
  causalExplanation: string; // Strictly causal phrased: "Investing $X reduces EAL by $Y"
  is_synthetic: boolean;
}

export interface ControlInvestment {
  id: string;
  controlName: string;
  category: string;
  annualCost: number;
  predictedEalReduction: number;
  actualEalReduction: number;
  variance: number;
  implementationDate: string;
  status: 'VERIFIED' | 'UNDER_EVALUATION' | 'PLANNED';
  is_synthetic: boolean;
}

// -------------------------------------------------------------
// Data Sources, Provenance & Leakage Firewall
// -------------------------------------------------------------

export interface MlFeatureManifestItem {
  featureName: string;
  featureGroup: string;
  availableAtTimestamp: string;
  relativeToPredictionTarget: string; // e.g. "-24h before event"
  isPostIncidentLeaker: boolean; // Flagged by firewall
  firewallVerdict: 'APPROVED_PREDICTOR' | 'REJECTED_POST_INCIDENT_LEAKER';
  validationRule: string;
}

export interface ProvenanceAuditItem {
  recordId: string;
  metric: string;
  dataSource: string;
  extractionTimestamp: string;
  integrityHash: string;
  verifiedBy: string;
  is_synthetic: boolean;
}

export interface DataSourcesResponse {
  provenanceList: ProvenanceAuditItem[];
  featureManifest: MlFeatureManifestItem[];
  leakageFirewallStats: {
    activeRulesCount: number;
    featuresAuditedCount: number;
    rejectedLeakersCount: number;
    attributionRatioPct: number;
    pValue: number;
  };
  is_synthetic: boolean;
}

// -------------------------------------------------------------
// Telemetry Shocks & Simulation Sandbox
// -------------------------------------------------------------

export type TelemetryShockType =
  | 'phishing_click_rate'
  | 'new_critical_cve'
  | 'firewall_drift'
  | 'mfa_coverage_drop';

export interface TelemetryTriggerResponse {
  shockType: TelemetryShockType;
  label: string;
  previousTotalEal: number;
  newTotalEal: number;
  ealDelta: number;
  ealDeltaFormatted: string;
  attributionItemAdded: ChangeAttributionItem;
  message: string;
  is_synthetic: boolean;
}

export interface SandboxSimulateRequest {
  controlsDegraded: Array<{ controlId: string; degradationPct: number }>;
  threatIncreasePct: number;
}

export interface SandboxSimulateResponse {
  sandbox: true;
  beforeEal: number;
  afterEal: number;
  ealDelta: number;
  rosi: number;
  degradedScenarios: Array<{
    scenarioId: string;
    name: string;
    beforeEal: number;
    afterEal: number;
    shiftPct: number;
  }>;
  confidenceInterval: [number, number];
  notice: string; // "Simulation mode results are strictly ephemeral and never persisted."
  is_synthetic: boolean;
}

// -------------------------------------------------------------
// AI Copilot Query Contract
// -------------------------------------------------------------

export type AllowedCopilotIntent =
  | 'EAL_LOOKUP'
  | 'CHANGE_ATTRIBUTION'
  | 'SPOF_LOOKUP'
  | 'COUNTERFACTUAL_INVESTMENT'
  | 'PORTFOLIO_OPTIMIZATION'
  | 'VENDOR_PROFILE';

export interface AiQueryRequest {
  query: string;
  page: NavigationPage;
  scenario_id?: string;
}

export interface AiQueryResponse {
  intent: AllowedCopilotIntent | 'FALLBACK_UNSUPPORTED';
  answer_text: string;
  data?: Record<string, any>;
  citations: string[];
  is_fallback: boolean;
  is_synthetic: boolean;
}
