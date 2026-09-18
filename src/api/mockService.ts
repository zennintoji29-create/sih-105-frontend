/**
 * CyberEAL - Mathematical Engine & Mock Service
 * Implements FAIR (Factor Analysis of Information Risk) + FABRICS + Copula + GPD
 */

import {
  DashboardResponse,
  Scenario,
  FairDecompositionTree,
  ExpertEstimate,
  ReviewQueueItem,
  VendorDependencyResponse,
  RosiSimulationRequest,
  RosiSimulationResponse,
  ControlInvestment,
  DataSourcesResponse,
  SandboxSimulateRequest,
  SandboxSimulateResponse,
  TelemetryShockType,
  TelemetryTriggerResponse,
  AiQueryRequest,
  AiQueryResponse,
  ChangeAttributionItem,
} from '../types';
import {
  DEMO_DASHBOARD_FIXTURE,
  DEMO_FAIR_TREE_FIXTURE,
  DEMO_VENDOR_MAP_FIXTURE,
} from '../fixtures/demoTourData';

// State store for in-memory live updates (telemetry shocks, sandbox, review queue, elicitation)
class CyberEalStateStore {
  dashboard: DashboardResponse = JSON.parse(JSON.stringify(DEMO_DASHBOARD_FIXTURE));
  fairTree: FairDecompositionTree = JSON.parse(JSON.stringify(DEMO_FAIR_TREE_FIXTURE));
  vendorData: VendorDependencyResponse = JSON.parse(JSON.stringify(DEMO_VENDOR_MAP_FIXTURE));

  scenarios: Scenario[] = [
    {
      id: 'SC-04',
      uid: 'SC-04',
      name: 'Ransomware via Supply Chain Partner',
      category: 'Ransomware',
      status: 'PUBLISHED',
      eal: 4280000,
      ealFormatted: '$4.28M',
      portfolioPct: 28.9,
      var95: 9850000,
      var97_5: 12400000,
      lef: 0.34,
      narrative: 'Upstream managed services or supplier credential compromise escalating through unsegmented partner API tunnels with double-extortion exfiltration.',
      affectedStakeholders: ['SecOps', 'Treasury', 'Legal / Compliance', 'Board Risk Comm'],
      lossMagnitudeLogNormal: {
        low10: 1200000,
        mostLikely: 3850000,
        high90: 9400000,
        confidence: 90,
      },
      faultTree: {
        deterministic: true,
        solvable: true,
        pathDepth: 4,
        convergenceMarginPct: 1.2,
        nodes: [
          { id: 'n-top', name: 'Multi-Tier Ransomware & Double Extortion', type: 'top_event', calculatedProbability: 0.34, boundsFormatted: '$4.28M EAL' },
          { id: 'n-and1', name: 'AND GATE: Threat & Vulnerability Convergence', type: 'and_gate' },
          { id: 'n-threat', name: 'THREAT ACTION: Credential Harvest & Session Hijack', type: 'threat_action', parameters: { tef: 1.85 } },
          { id: 'n-or1', name: 'OR GATE: Bypass Path', type: 'or_gate' },
          { id: 'n-control', name: 'MITIGATING CONTROL: Hardware-Bound WebAuthn MFA', type: 'control', efficiencyPct: 95.0 },
          { id: 'n-contain', name: 'DETECTION & CONTAINMENT: Automated EDR Host Isolation', type: 'control', efficiencyPct: 99.1 },
          { id: 'n-term', name: 'SECONDARY LOSS TERMINAL: Exfiltration via Encrypted S3 Staging', type: 'terminal', boundsFormatted: '$1.8M - $6.5M' },
        ],
        edges: [
          { from: 'n-top', to: 'n-and1' },
          { from: 'n-and1', to: 'n-threat' },
          { from: 'n-and1', to: 'n-or1' },
          { from: 'n-or1', to: 'n-control' },
          { from: 'n-control', to: 'n-contain' },
          { from: 'n-contain', to: 'n-term' },
        ],
      },
      is_synthetic: true,
    },
    {
      id: 'SC-01',
      uid: 'SC-01',
      name: 'Cloud Misconfig Data Exfiltration',
      category: 'Cloud',
      status: 'PUBLISHED',
      eal: 3440000,
      ealFormatted: '$3.44M',
      portfolioPct: 23.2,
      var95: 8120000,
      var97_5: 10500000,
      lef: 0.28,
      narrative: 'Overprivileged cross-account STS role pivoting to read unmasked Athena data lakes.',
      affectedStakeholders: ['SecOps', 'Cloud Infra', 'Data Governance'],
      lossMagnitudeLogNormal: { low10: 900000, mostLikely: 2800000, high90: 7500000, confidence: 90 },
      faultTree: { deterministic: true, solvable: true, pathDepth: 3, convergenceMarginPct: 1.5, nodes: [], edges: [] },
      is_synthetic: true,
    },
    {
      id: 'SC-08',
      uid: 'SC-08',
      name: 'Wire Fraud BEC Treasury Compromise',
      category: 'Social Eng',
      status: 'PUBLISHED',
      eal: 2740000,
      ealFormatted: '$2.74M',
      portfolioPct: 18.5,
      var95: 6200000,
      var97_5: 7900000,
      lef: 0.42,
      narrative: 'Executive mailbox takeover triggering urgent offshore vendor invoice rerouting via SWIFT.',
      affectedStakeholders: ['Treasury', 'Executive Committee', 'Legal'],
      lossMagnitudeLogNormal: { low10: 500000, mostLikely: 2200000, high90: 5800000, confidence: 90 },
      faultTree: { deterministic: true, solvable: true, pathDepth: 3, convergenceMarginPct: 1.1, nodes: [], edges: [] },
      is_synthetic: true,
    },
    {
      id: 'SC-12',
      uid: 'SC-12',
      name: 'Insider Threat Core IP Exfiltration',
      category: 'Insider Threat',
      status: 'PUBLISHED',
      eal: 2020000,
      ealFormatted: '$2.02M',
      portfolioPct: 13.6,
      var95: 4800000,
      var97_5: 6100000,
      lef: 0.15,
      narrative: 'Departing senior firmware architect exfiltrating proprietary source repositories to personal cloud storage.',
      affectedStakeholders: ['Legal', 'HR', 'Engineering'],
      lossMagnitudeLogNormal: { low10: 400000, mostLikely: 1600000, high90: 4500000, confidence: 90 },
      faultTree: { deterministic: true, solvable: true, pathDepth: 2, convergenceMarginPct: 1.8, nodes: [], edges: [] },
      is_synthetic: true,
    },
    {
      id: 'SC-06',
      uid: 'SC-06',
      name: 'DDoS on Payment Gateway API',
      category: 'Cloud',
      status: 'PUBLISHED',
      eal: 1450000,
      ealFormatted: '$1.45M',
      portfolioPct: 9.8,
      var95: 3200000,
      var97_5: 4200000,
      lef: 0.85,
      narrative: 'Layer 7 HTTP request flood overwhelming checkout tokenization endpoints during peak trading hours.',
      affectedStakeholders: ['DevOps', 'E-Commerce', 'Support'],
      lossMagnitudeLogNormal: { low10: 250000, mostLikely: 1100000, high90: 3100000, confidence: 90 },
      faultTree: { deterministic: true, solvable: true, pathDepth: 2, convergenceMarginPct: 0.9, nodes: [], edges: [] },
      is_synthetic: true,
    },
    {
      id: 'SC-15',
      uid: 'SC-15',
      name: 'Critical Vendor / Cloud Outage SPoF',
      category: 'Third-Party',
      status: 'PUBLISHED',
      eal: 890000,
      ealFormatted: '$0.89M',
      portfolioPct: 6.0,
      var95: 2400000,
      var97_5: 3100000,
      lef: 0.12,
      narrative: 'Unscheduled availability zone degradation at primary cloud provider cascading into multi-tenant API downtime.',
      affectedStakeholders: ['Procurement', 'Risk Committee'],
      lossMagnitudeLogNormal: { low10: 180000, mostLikely: 750000, high90: 2100000, confidence: 90 },
      faultTree: { deterministic: true, solvable: true, pathDepth: 2, convergenceMarginPct: 1.4, nodes: [], edges: [] },
      is_synthetic: true,
    },
  ];

  reviewQueue: ReviewQueueItem[] = [
    {
      id: 'rq-1',
      targetId: 't-sc04-tef',
      scenarioId: 'SC-04',
      scenarioName: 'Ransomware via Supply Chain Partner',
      parameterName: 'Threat Event Frequency (TEF)',
      parameterType: 'TEF',
      status: 'PENDING_REVIEW',
      submittedEstimates: [
        {
          id: 'est-1',
          targetId: 't-sc04-tef',
          expertName: 'Marcus Vance',
          expertTitle: 'Lead Threat Intelligence Analyst',
          estimateType: 'point',
          rawPointValue: 1.8,
          confidenceScore: 0.85,
          submittedAt: '2 hours ago',
          rationale: 'Observed 3 brute-force sweeps and 1 partner VPN credential credential-stuffing attempt in telemetry over past 18 months.',
          is_synthetic: true,
        },
        {
          id: 'est-2',
          targetId: 't-sc04-tef',
          expertName: 'Siddharth Rao',
          expertTitle: 'Director of Incident Response',
          estimateType: 'point',
          rawPointValue: 2.1,
          confidenceScore: 0.9,
          submittedAt: '4 hours ago',
          rationale: 'Active targeting by FIN7 and LockBit affiliate campaigns against our supplier ecosystem.',
          is_synthetic: true,
        },
        {
          id: 'est-3',
          targetId: 't-sc04-tef',
          expertName: 'Dr. Evelyn Chen',
          expertTitle: 'Actuarial Risk Modeler',
          estimateType: 'qualitative',
          qualitativeScale: 'Likely',
          derivedAnnualRateLambda: 1.85,
          annualProbability: 0.84,
          confidenceScore: 0.8,
          submittedAt: '6 hours ago',
          rationale: 'Mapped to qualitative scale: Likely event occurs approximately once per year per sector baseline.',
          is_synthetic: true,
        },
      ],
      fittedDistribution: {
        targetId: 't-sc04-tef',
        parameterName: 'Threat Event Frequency (TEF)',
        distributionType: 'Beta',
        isUnimodal: true,
        calibrationSpread: 0.18,
        betaParameters: { alpha: 3.4, beta: 11.2 },
        quantiles: { p10: 1.45, p50: 1.85, p90: 2.25 },
        kdeCurve: [
          { x: 1.0, density: 0.05 },
          { x: 1.4, density: 0.35 },
          { x: 1.85, density: 1.42 },
          { x: 2.2, density: 0.65 },
          { x: 2.6, density: 0.12 },
        ],
        recommendedPrior: 'Informative Beta Prior (Mean 1.85, SD 0.28)',
        is_synthetic: true,
      },
      is_synthetic: true,
    },
    {
      id: 'rq-2',
      targetId: 't-sc01-vuln',
      scenarioId: 'SC-01',
      scenarioName: 'Cloud Misconfig Data Exfiltration',
      parameterName: 'Vulnerability (V) Susceptibility',
      parameterType: 'Vulnerability',
      status: 'PENDING_REVIEW',
      submittedEstimates: [
        {
          id: 'est-4',
          targetId: 't-sc01-vuln',
          expertName: 'Aiden Brooks',
          expertTitle: 'Cloud Security Architect',
          estimateType: 'point',
          rawPointValue: 0.12,
          confidenceScore: 0.8,
          submittedAt: 'Yesterday',
          rationale: 'GuardDuty and AWS Config active, but cross-account trust policy allows assumed role enumeration.',
          is_synthetic: true,
        },
        {
          id: 'est-5',
          targetId: 't-sc01-vuln',
          expertName: 'Chloe Dupont',
          expertTitle: 'Principal Penetration Tester',
          estimateType: 'point',
          rawPointValue: 0.38,
          confidenceScore: 0.85,
          submittedAt: 'Yesterday',
          rationale: 'Discovered STS token generation without MFA binding in staging accounts with read access to prod S3.',
          is_synthetic: true,
        },
      ],
      fittedDistribution: {
        targetId: 't-sc01-vuln',
        parameterName: 'Vulnerability (V) Susceptibility',
        distributionType: 'KDE_Multimodal',
        isUnimodal: false,
        calibrationSpread: 0.44,
        calibrationWarning: 'CALIBRATION SPREAD HIGH (0.44 > 0.30): Divergent expert opinions between Cloud Architecture (0.12) and Pen Testing (0.38). Risk quant review required before fitting prior.',
        quantiles: { p10: 0.11, p50: 0.24, p90: 0.39 },
        kdeCurve: [
          { x: 0.05, density: 0.2 },
          { x: 0.12, density: 1.1 },
          { x: 0.24, density: 0.45 },
          { x: 0.38, density: 1.05 },
          { x: 0.5, density: 0.15 },
        ],
        recommendedPrior: 'Mixture Prior or Delphi Re-evaluation recommended',
        is_synthetic: true,
      },
      is_synthetic: true,
    },
  ];

  investments: ControlInvestment[] = [
    {
      id: 'inv-1',
      controlName: 'Hardware-Bound WebAuthn FIDO2 Keys',
      category: 'Identity & Access',
      annualCost: 320000,
      predictedEalReduction: 1150000,
      actualEalReduction: 1240000,
      variance: 90000,
      implementationDate: 'Q3 2023',
      status: 'VERIFIED',
      is_synthetic: true,
    },
    {
      id: 'inv-2',
      controlName: 'Automated EDR Host Isolation Hook',
      category: 'Endpoint Detection',
      annualCost: 450000,
      predictedEalReduction: 980000,
      actualEalReduction: 920000,
      variance: -60000,
      implementationDate: 'Q4 2023',
      status: 'VERIFIED',
      is_synthetic: true,
    },
    {
      id: 'inv-3',
      controlName: 'Cloud Security Posture Management (CSPM)',
      category: 'Cloud Infrastructure',
      annualCost: 280000,
      predictedEalReduction: 840000,
      actualEalReduction: 860000,
      variance: 20000,
      implementationDate: 'Q1 2024',
      status: 'VERIFIED',
      is_synthetic: true,
    },
    {
      id: 'inv-4',
      controlName: 'Vendor Zero-Trust API Gateway Segregation',
      category: 'Supply Chain Defense',
      annualCost: 520000,
      predictedEalReduction: 1480000,
      actualEalReduction: 0,
      variance: 0,
      implementationDate: 'Planned Q3 2024',
      status: 'PLANNED',
      is_synthetic: true,
    },
  ];

  dataSources: DataSourcesResponse = {
    provenanceList: [
      {
        recordId: 'PRV-8821',
        metric: 'Threat Event Frequency (TEF) - External Logs',
        dataSource: 'CrowdStrike Falcon SIEM / Okta SystemLog Stream',
        extractionTimestamp: '2026-09-18T12:00:00Z',
        integrityHash: 'sha256:4a9c81e289bf...',
        verifiedBy: 'Automated FAIR ETL Pipeline v4.8',
        is_synthetic: true,
      },
      {
        recordId: 'PRV-8822',
        metric: 'Control Difficulty (CDiff) Assessment',
        dataSource: 'Qualys Vulnerability Scanner + ISO 27001 Audit',
        extractionTimestamp: '2026-09-18T10:30:00Z',
        integrityHash: 'sha256:7f3b1901dd4a...',
        verifiedBy: 'SecOps Compliance Engine',
        is_synthetic: true,
      },
      {
        recordId: 'PRV-8823',
        metric: 'Primary Loss Magnitude (PLM) Hourly Downstream Burn',
        dataSource: 'SAP S/4HANA Enterprise ERP Cost Ledger',
        extractionTimestamp: '2026-09-17T23:59:00Z',
        integrityHash: 'sha256:c29011ea345b...',
        verifiedBy: 'CFO Treasury Lineage Validator',
        is_synthetic: true,
      },
    ],
    featureManifest: [
      {
        featureName: 'firewall_drift_index',
        featureGroup: 'Perimeter Telemetry',
        availableAtTimestamp: 'T - 15m (Real-time pre-incident)',
        relativeToPredictionTarget: '-15m before simulated event',
        isPostIncidentLeaker: false,
        firewallVerdict: 'APPROVED_PREDICTOR',
        validationRule: 'Pre-incident invariant: Rule delta timestamp < Event T0',
      },
      {
        featureName: 'phishing_simulation_fail_rate',
        featureGroup: 'Human Factors',
        availableAtTimestamp: 'T - 7d (Weekly test campaign)',
        relativeToPredictionTarget: '-7d before simulated event',
        isPostIncidentLeaker: false,
        firewallVerdict: 'APPROVED_PREDICTOR',
        validationRule: 'Pre-incident invariant: Prior measurement only',
      },
      {
        featureName: 'cloud_iam_overprivileged_roles',
        featureGroup: 'Cloud Identity',
        availableAtTimestamp: 'T - 1h (Hourly drift scan)',
        relativeToPredictionTarget: '-1h before simulated event',
        isPostIncidentLeaker: false,
        firewallVerdict: 'APPROVED_PREDICTOR',
        validationRule: 'Pre-incident invariant: Baseline state snapshot',
      },
      {
        featureName: 'incident_total_forensic_cost',
        featureGroup: 'Incident Accounting',
        availableAtTimestamp: 'T + 30d (Post-incident invoice)',
        relativeToPredictionTarget: '+30d AFTER event termination',
        isPostIncidentLeaker: true,
        firewallVerdict: 'REJECTED_POST_INCIDENT_LEAKER',
        validationRule: 'CRITICAL LEAKAGE DETECTED: Feature occurs after loss realization',
      },
      {
        featureName: 'days_to_detect_and_contain',
        featureGroup: 'Incident Response MTTC',
        availableAtTimestamp: 'T + 72h (Incident closure report)',
        relativeToPredictionTarget: '+72h AFTER breach occurs',
        isPostIncidentLeaker: true,
        firewallVerdict: 'REJECTED_POST_INCIDENT_LEAKER',
        validationRule: 'CRITICAL LEAKAGE DETECTED: Confounder leakage would invalidate FAIR prior',
      },
    ],
    leakageFirewallStats: {
      activeRulesCount: 14,
      featuresAuditedCount: 42,
      rejectedLeakersCount: 2,
      attributionRatioPct: 100.0,
      pValue: 0.00008,
    },
    is_synthetic: true,
  };
}

export const stateStore = new CyberEalStateStore();

// =============================================================
// Mathematical helper formulas according to FAIR & FABRICS
// =============================================================

/**
 * FAIR EAL calculation: EAL = LEF × PLM
 * LEF = TEF × Vulnerability × (1 − Control_Effectiveness)
 * PLM = Direct_Costs + Indirect_Costs
 */
export function calculateFairEal(params: {
  tef: number;
  vulnerability: number; // 0 to 1
  controlEffectiveness: number; // 0 to 1
  directCosts: number;
  indirectCosts: number;
}): {
  lef: number;
  plm: number;
  eal: number;
} {
  const lef = params.tef * params.vulnerability * (1 - params.controlEffectiveness);
  const plm = params.directCosts + params.indirectCosts;
  const eal = lef * plm;
  return { lef, plm, eal };
}

/**
 * ROSI calculation:
 * ROSI = (EAL_before × Mitigation_% − Control_Cost) / Control_Cost
 */
export function calculateRosi(
  beforeEal: number,
  mitigationPct: number,
  controlCost: number
): {
  afterEal: number;
  reductionEal: number;
  rosiPct: number;
  ci90: [number, number];
} {
  const reductionEal = beforeEal * (mitigationPct / 100);
  const afterEal = Math.max(0, beforeEal - reductionEal);
  const rosiPct = ((reductionEal - controlCost) / controlCost) * 100;
  const lowCi = rosiPct * 0.82;
  const highCi = rosiPct * 1.22;
  return {
    afterEal,
    reductionEal,
    rosiPct: Math.round(rosiPct * 10) / 10,
    ci90: [Math.round(lowCi), Math.round(highCi)],
  };
}

/**
 * Qualitative scale fallback to annual probability:
 * Rarely = once/5yr (0.2), Less likely = once/3yr (0.33),
 * Possibly = once/yr (1.0), Likely = once/month (12.0), Very likely = once/week (52.0)
 * Poisson rate λ -> Exponential CDF: 1 - e^(−λ)
 */
export function qualitativeToProbability(
  scale: 'Rarely' | 'Less likely' | 'Possibly' | 'Likely' | 'Very likely'
): { lambda: number; annualProbability: number } {
  let lambda = 1.0;
  switch (scale) {
    case 'Rarely':
      lambda = 1 / 5; // 0.2
      break;
    case 'Less likely':
      lambda = 1 / 3; // 0.333
      break;
    case 'Possibly':
      lambda = 1.0;
      break;
    case 'Likely':
      lambda = 12.0;
      break;
    case 'Very likely':
      lambda = 52.0;
      break;
  }
  const annualProbability = 1 - Math.exp(-lambda);
  return { lambda, annualProbability: Math.min(0.9999, annualProbability) };
}

// =============================================================
// API Service Handler Functions
// =============================================================

export const MockCyberEalApi = {
  // GET /api/orgs/{org_id}/dashboard
  getDashboard: async (orgId?: string): Promise<DashboardResponse> => {
    return JSON.parse(JSON.stringify(stateStore.dashboard));
  },

  // GET /api/scenarios?org_id=...
  getScenarios: async (orgId?: string): Promise<Scenario[]> => {
    return JSON.parse(JSON.stringify(stateStore.scenarios));
  },

  // GET /api/scenarios/{id}/simulation
  getScenarioSimulation: async (scenarioId: string) => {
    return {
      scenarioId,
      quantiles: stateStore.dashboard.quantiles,
      histogram: stateStore.dashboard.histogram,
      var95: stateStore.dashboard.var95,
      var97_5: 12400000,
      monteCarloRuns: 1000000,
      fatTail: stateStore.dashboard.gpdTailFit,
      is_synthetic: true,
    };
  },

  // GET /api/scenarios/{id}/explainability
  getScenarioExplainability: async (scenarioId: string): Promise<FairDecompositionTree> => {
    return JSON.parse(JSON.stringify(stateStore.fairTree));
  },

  // POST /api/elicitation/estimates
  submitEstimate: async (estimate: Partial<ExpertEstimate>): Promise<ExpertEstimate> => {
    const newEst: ExpertEstimate = {
      id: `est-${Date.now()}`,
      targetId: estimate.targetId || 't-sc04-tef',
      expertName: estimate.expertName || 'Current User',
      expertTitle: estimate.expertTitle || 'Enterprise Risk Specialist',
      estimateType: estimate.estimateType || 'point',
      rawPointValue: estimate.rawPointValue,
      qualitativeScale: estimate.qualitativeScale,
      derivedAnnualRateLambda: estimate.derivedAnnualRateLambda,
      annualProbability: estimate.annualProbability,
      confidenceScore: estimate.confidenceScore || 0.85,
      submittedAt: 'Just now',
      rationale: estimate.rationale || 'Submitted through Elicitation Portal.',
      is_synthetic: true,
    };

    const targetItem = stateStore.reviewQueue.find((q) => q.targetId === newEst.targetId);
    if (targetItem) {
      targetItem.submittedEstimates.push(newEst);
    }
    return newEst;
  },

  // GET /api/elicitation/{target_id}/status
  getElicitationStatus: async (targetId: string) => {
    const item = stateStore.reviewQueue.find((q) => q.targetId === targetId) || stateStore.reviewQueue[0];
    return {
      targetId: item.targetId,
      scenarioName: item.scenarioName,
      parameterName: item.parameterName,
      estimatesCount: item.submittedEstimates.length,
      estimates: item.submittedEstimates,
      fittedDistribution: item.fittedDistribution,
      is_synthetic: true,
    };
  },

  // POST /api/elicitation/{target_id}/close
  closeElicitationSession: async (targetId: string) => {
    const item = stateStore.reviewQueue.find((q) => q.targetId === targetId);
    if (item) {
      item.status = 'PENDING_REVIEW';
    }
    return {
      targetId,
      status: 'CLOSED_PENDING_REVIEW',
      message: 'Expert elicitation session closed. Kernel Density Estimator fitted and routed to Review Queue.',
      is_synthetic: true,
    };
  },

  // GET /api/review-queue
  getReviewQueue: async (): Promise<ReviewQueueItem[]> => {
    return JSON.parse(JSON.stringify(stateStore.reviewQueue));
  },

  // POST /api/review-queue/{id}/approve
  approveReviewQueueItem: async (id: string, reviewerName: string = 'Dr. Elena Vance') => {
    const item = stateStore.reviewQueue.find((q) => q.id === id);
    if (item) {
      item.status = 'APPROVED';
      item.reviewer = reviewerName;
      item.reviewedAt = 'Just now';
    }
    return {
      id,
      status: 'APPROVED',
      message: 'Fitted distribution approved and published to active FAIR quantification engine.',
      is_synthetic: true,
    };
  },

  // GET /api/vendors?org_id=...
  getVendors: async (orgId?: string) => {
    return JSON.parse(JSON.stringify(stateStore.vendorData.vendors));
  },

  // GET /api/vendors/dependencies?org_id=...
  getVendorDependencies: async (orgId?: string): Promise<VendorDependencyResponse> => {
    return JSON.parse(JSON.stringify(stateStore.vendorData));
  },

  // POST /api/rosi/simulate
  simulateRosi: async (req: RosiSimulationRequest): Promise<RosiSimulationResponse> => {
    const target = stateStore.scenarios.find((s) => s.id === req.targetScenarioId) || stateStore.scenarios[0];
    const beforeEal = target.eal;
    const { afterEal, reductionEal, rosiPct, ci90 } = calculateRosi(beforeEal, req.mitigationPct, req.controlCost);

    const formatCurrency = (n: number) => `$${(n / 1000000).toFixed(2)}M`;

    // Strictly causal statement: "Investing $X reduces EAL by $Y"
    const causalExplanation = `Investing $${req.controlCost.toLocaleString()} in ${req.controlName} reduces ${target.name} EAL by ${formatCurrency(reductionEal)} (from ${formatCurrency(beforeEal)} down to ${formatCurrency(afterEal)}), yielding a net Return on Security Investment of ${rosiPct.toFixed(1)}% (90% CI: [${ci90[0]}%, ${ci90[1]}%]).`;

    return {
      controlName: req.controlName,
      controlCost: req.controlCost,
      beforeEal,
      afterEal,
      ealReduction: reductionEal,
      mitigationPct: req.mitigationPct,
      rosiPct,
      confidenceInterval90: ci90,
      causalExplanation,
      is_synthetic: true,
    };
  },

  // GET /api/investments?org_id=...
  getInvestments: async (orgId?: string): Promise<ControlInvestment[]> => {
    return JSON.parse(JSON.stringify(stateStore.investments));
  },

  // GET /api/data-sources?org_id=...
  getDataSources: async (orgId?: string): Promise<DataSourcesResponse> => {
    return JSON.parse(JSON.stringify(stateStore.dataSources));
  },

  // POST /api/simulate/sandbox
  simulateSandbox: async (req: SandboxSimulateRequest): Promise<SandboxSimulateResponse> => {
    const beforeEal = stateStore.dashboard.totalEal;
    // Degrade EAL based on simulated factors
    const multiplier = 1 + (req.threatIncreasePct || 15) / 100;
    const afterEal = Math.round(beforeEal * multiplier);
    const ealDelta = afterEal - beforeEal;

    const degradedScenarios = stateStore.scenarios.map((s) => {
      const sBefore = s.eal;
      const sAfter = Math.round(sBefore * multiplier);
      return {
        scenarioId: s.id,
        name: s.name,
        beforeEal: sBefore,
        afterEal: sAfter,
        shiftPct: Math.round(((sAfter - sBefore) / sBefore) * 1000) / 10,
      };
    });

    return {
      sandbox: true,
      beforeEal,
      afterEal,
      ealDelta,
      rosi: -18.4,
      degradedScenarios,
      confidenceInterval: [Math.round(afterEal * 0.92), Math.round(afterEal * 1.18)],
      notice: 'Simulation mode results are strictly ephemeral and never persisted.',
      is_synthetic: true,
    };
  },

  // POST /api/telemetry/trigger
  triggerTelemetryShock: async (shockType: TelemetryShockType): Promise<TelemetryTriggerResponse> => {
    const prevEal = stateStore.dashboard.totalEal;
    let delta = 0;
    let deltaFormatted = '';
    let label = '';
    let factor = '';
    let direction: 'up' | 'down' = 'up';

    switch (shockType) {
      case 'phishing_click_rate':
        delta = 420000;
        deltaFormatted = '↑ $420k (+2.8%)';
        label = 'Phishing click rate spike (3.8% → 8.4%)';
        factor = 'Spike in workforce link execution contributed to prediction of higher Threat Event Frequency (TEF)';
        direction = 'up';
        break;
      case 'new_critical_cve':
        delta = 750000;
        deltaFormatted = '↑ $750k (+5.1%)';
        label = 'Zero-Day Vulnerability Ingested (CVE-2026-9114)';
        factor = 'Public CVSS 9.8 RCE exploit code contributed to prediction of increased vulnerability susceptibility (V)';
        direction = 'up';
        break;
      case 'firewall_drift':
        delta = 540000;
        deltaFormatted = '↑ $540k (+3.6%)';
        label = 'Perimeter Ingress Rule Drift Detected';
        factor = 'Unapproved inbound security group port exposure contributed to prediction of degraded control difficulty (CDiff)';
        direction = 'up';
        break;
      case 'mfa_coverage_drop':
        delta = 890000;
        deltaFormatted = '↑ $890k (+6.0%)';
        label = 'MFA Exemption Policy Drift (12% of admin accounts)';
        factor = 'Temporary bypass rule extension contributed to prediction of higher session takeover probability';
        direction = 'up';
        break;
    }

    const newEal = prevEal + delta;
    stateStore.dashboard.totalEal = newEal;
    stateStore.dashboard.totalEalFormatted = `$${(newEal / 1000000).toFixed(2)}M`;

    const feedItem: ChangeAttributionItem = {
      id: `attr-shock-${Date.now()}`,
      title: label,
      timeAgo: 'Just now • Telemetry Shock Injection',
      category: 'Real-Time Ingestion',
      deltaEal: delta,
      deltaEalFormatted: deltaFormatted,
      percentageChange: Math.round((delta / prevEal) * 1000) / 10,
      direction,
      contributingFactor: factor,
      is_synthetic: true,
    };

    stateStore.dashboard.changeAttributionFeed.unshift(feedItem);

    return {
      shockType,
      label,
      previousTotalEal: prevEal,
      newTotalEal: newEal,
      ealDelta: delta,
      ealDeltaFormatted: deltaFormatted,
      attributionItemAdded: feedItem,
      message: `Telemetry shock '${label}' successfully injected into FAIR engine pipeline.`,
      is_synthetic: true,
    };
  },

  // POST /api/ai/query
  queryAiCopilot: async (req: AiQueryRequest): Promise<AiQueryResponse> => {
    const q = req.query.toLowerCase().trim();

    // Strict whitelist matching
    if (q.includes('total eal') || q.includes('current eal') || q.includes('exposure') || q.includes('what is our eal')) {
      return {
        intent: 'EAL_LOOKUP',
        answer_text: `The enterprise Expected Annualized Loss (EAL) is currently ${stateStore.dashboard.totalEalFormatted}, with a 95% Value at Risk (VaR 95%) of ${stateStore.dashboard.var95Formatted} across ${stateStore.dashboard.activeScenariosCount} cataloged scenarios. The primary driver is Ransomware via Supply Chain Partner ($4.28M EAL, 28.9% of portfolio).`,
        data: {
          totalEal: stateStore.dashboard.totalEal,
          var95: stateStore.dashboard.var95,
          activeScenarios: stateStore.dashboard.activeScenariosCount,
        },
        citations: ['FAIR v3.2 Engine', 'Monte Carlo Run #1,000,000', 'SC-04 Parameter Table'],
        is_fallback: false,
        is_synthetic: true,
      };
    }

    if (q.includes('attribution') || q.includes('change') || q.includes('variance') || q.includes('why did eal')) {
      const topAttribution = stateStore.dashboard.changeAttributionFeed[0];
      return {
        intent: 'CHANGE_ATTRIBUTION',
        answer_text: `Recent EAL variance is driven by ${topAttribution.title} (${topAttribution.deltaEalFormatted}). In our explainability decomposition, ${topAttribution.contributingFactor.toLowerCase()}. Notice that SHAP attribution language indicates feature contribution to prediction, whereas causal claims require counterfactual re-simulation.`,
        data: { topAttribution },
        citations: ['Change Attribution Feed', 'Leakage Firewall Manifest', 'Telemetry Ingestion Stream'],
        is_fallback: false,
        is_synthetic: true,
      };
    }

    if (q.includes('spof') || q.includes('vendor') || q.includes('single point') || q.includes('okta') || q.includes('aws')) {
      return {
        intent: 'SPOF_LOOKUP',
        answer_text: `Two critical Single Points of Failure (SPoF) are currently active: Okta Inc. (SPoF Score 0.94, Breached EAL $6.42M) and AWS us-east-1 (SPoF Score 0.91, Breached EAL $5.18M). Because 14 downstream SaaS tools share federated SAML dependencies through Okta, failure probabilities are modeled via Clayton Tail Copula with a 0.85 correlation coefficient rather than summed naively.`,
        data: {
          criticalSpofVendors: ['Okta Inc.', 'AWS us-east-1'],
          aggregateSpofLoad: stateStore.vendorData.aggregateSpofLoadFormatted,
          copulaDegrease: stateStore.vendorData.copulaDegreaseTau,
        },
        citations: ['Graph-Theoretic Exposure Telemetry', 'Clayton Copula Matrix v2.1', 'SAML Reachability Mesh'],
        is_fallback: false,
        is_synthetic: true,
      };
    }

    if (q.includes('invest') || q.includes('rosi') || q.includes('budget') || q.includes('spend') || q.includes('counterfactual')) {
      return {
        intent: 'COUNTERFACTUAL_INVESTMENT',
        answer_text: `Based on our counterfactual re-simulation engine, deploying Hardware-Bound WebAuthn MFA ($320k annual cost) mitigates supply-chain ransomware exposure by 45%, reducing EAL by $1.24M annually. This produces an estimated net ROSI of +186.4% (90% CI: [+142%, +231%]). Re-simulating allows strictly causal phrasing: investing $320k reduces EAL by $1.24M.`,
        data: {
          control: 'Hardware-Bound WebAuthn MFA',
          cost: 320000,
          reduction: 1240000,
          rosiPct: 186.4,
        },
        citations: ['ROSI Counterfactual Re-Simulation', 'Historical Control Performance Ledger'],
        is_fallback: false,
        is_synthetic: true,
      };
    }

    if (q.includes('portfolio') || q.includes('optimize') || q.includes('scenarios') || q.includes('prioritize')) {
      return {
        intent: 'PORTFOLIO_OPTIMIZATION',
        answer_text: `The optimal capital allocation prioritizes the top 3 scenarios which account for 70.6% of enterprise financial exposure: (1) Ransomware via Supply Chain Partner (SC-04, $4.28M), (2) Cloud Misconfiguration Data Exfiltration (SC-01, $3.44M), and (3) Wire Fraud BEC (SC-08, $2.74M). Eliminating shared SPoF credentials delivers the steepest reduction per dollar.`,
        data: {
          topScenarios: stateStore.scenarios.slice(0, 3).map((s) => ({ name: s.name, eal: s.ealFormatted })),
        },
        citations: ['Portfolio Frontier Optimizer', 'OpenFAIR Scenario Catalog'],
        is_fallback: false,
        is_synthetic: true,
      };
    }

    if (q.includes('profile') || q.includes('snowflake') || q.includes('crowdstrike') || q.includes('salesforce')) {
      return {
        intent: 'VENDOR_PROFILE',
        answer_text: `Snowflake Inc. is categorized as a Tier-1 Data Warehouse with an 'If Breached' EAL impact of $3.85M and a SPoF score of 0.72. It maintains active inbound ETL flows from AWS us-east-1 and depends on Okta for authentication. Inherent risk is elevated due to sensitive customer PII aggregation.`,
        data: {
          vendor: 'Snowflake Inc.',
          impact: '$3.85M',
          tier: 1,
        },
        citations: ['Third-Party Risk Manifest', 'Downstream Data Pipeline Flow'],
        is_fallback: false,
        is_synthetic: true,
      };
    }

    // Explicit fallback for non-whitelisted intents
    return {
      intent: 'FALLBACK_UNSUPPORTED',
      answer_text:
        'I am the CyberEAL Risk Copilot. I can only answer questions about: EAL lookup, change attribution, SPoF lookup, counterfactual investment, portfolio optimization, or vendor profiles. Please refine your query to one of these quantitative domains.',
      citations: ['CyberEAL Policy Boundary Guardrail'],
      is_fallback: true,
      is_synthetic: true,
    };
  },

  // POST /api/auth/login
  login: async (email?: string, password?: string) => {
    return {
      token: 'jwt_mock_token_cybereal_ciso_9841',
      user: {
        id: 'u-ciso-elena',
        name: 'Dr. Elena Vance',
        title: 'Chief Information Security Officer',
        email: email || 'elena.vance@cybereal-enterprise.com',
        role: 'CISO',
        avatarUrl: '/assets/avatar.png',
        orgId: 'org-enterprise-global',
      },
      is_synthetic: true,
    };
  },
};
