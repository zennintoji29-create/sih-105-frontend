/**
 * CyberEAL - Unified API Client
 * Talks to external FastAPI backend (via VITE_API_BASE_URL) or delegates
 * to the rigorous mathematical MockService with clear `is_synthetic` flags.
 */

import { MockCyberEalApi } from './mockService';
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
} from '../types';

const STORAGE_KEY_API_URL = 'cybereal_api_base_url';
const STORAGE_KEY_USE_LIVE = 'cybereal_use_live_api';

export class ApiConfig {
  static getBaseUrl(): string {
    const fromStorage = localStorage.getItem(STORAGE_KEY_API_URL);
    if (fromStorage) return fromStorage;
    return (import.meta.env.VITE_API_BASE_URL as string) || '';
  }

  static setBaseUrl(url: string): void {
    localStorage.setItem(STORAGE_KEY_API_URL, url.trim());
  }

  static isLiveEnabled(): boolean {
    const flag = localStorage.getItem(STORAGE_KEY_USE_LIVE);
    if (flag !== null) return flag === 'true';
    return Boolean(import.meta.env.VITE_API_BASE_URL);
  }

  static setLiveEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEY_USE_LIVE, enabled ? 'true' : 'false');
  }
}

async function requestWithFallback<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackFn: () => Promise<T>
): Promise<{ data: T; isMock: boolean }> {
  const baseUrl = ApiConfig.getBaseUrl();
  const isLive = ApiConfig.isLiveEnabled();

  if (!isLive || !baseUrl) {
    const mockData = await fallbackFn();
    return { data: mockData, isMock: true };
  }

  try {
    const url = `${baseUrl.replace(/\/$/, '')}${endpoint}`;
    const token = localStorage.getItem('cybereal_token') || 'jwt_cybereal_token';
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!res.ok) {
      console.warn(`[CyberEAL API] ${res.status} on ${url}, falling back to local engine`);
      const mockData = await fallbackFn();
      return { data: mockData, isMock: true };
    }

    const json = await res.json();
    return { data: json, isMock: false };
  } catch (err) {
    console.warn(`[CyberEAL API] Network error connecting to ${baseUrl}, falling back to local engine:`, err);
    const mockData = await fallbackFn();
    return { data: mockData, isMock: true };
  }
}

export const ApiClient = {
  // GET /api/orgs/{org_id}/dashboard
  getDashboard: async (orgId: string = 'org-default'): Promise<{ data: DashboardResponse; isMock: boolean }> => {
    return requestWithFallback(
      `/api/orgs/${orgId}/dashboard`,
      { method: 'GET' },
      () => MockCyberEalApi.getDashboard(orgId)
    );
  },

  // GET /api/scenarios?org_id=...
  getScenarios: async (orgId: string = 'org-default'): Promise<{ data: Scenario[]; isMock: boolean }> => {
    return requestWithFallback(
      `/api/scenarios?org_id=${orgId}`,
      { method: 'GET' },
      () => MockCyberEalApi.getScenarios(orgId)
    );
  },

  // GET /api/scenarios/{id}/simulation
  getScenarioSimulation: async (scenarioId: string) => {
    return requestWithFallback(
      `/api/scenarios/${scenarioId}/simulation`,
      { method: 'GET' },
      () => MockCyberEalApi.getScenarioSimulation(scenarioId)
    );
  },

  // GET /api/scenarios/{id}/explainability
  getScenarioExplainability: async (scenarioId: string): Promise<{ data: FairDecompositionTree; isMock: boolean }> => {
    return requestWithFallback(
      `/api/scenarios/${scenarioId}/explainability`,
      { method: 'GET' },
      () => MockCyberEalApi.getScenarioExplainability(scenarioId)
    );
  },

  // POST /api/elicitation/estimates
  submitEstimate: async (estimate: Partial<ExpertEstimate>): Promise<{ data: ExpertEstimate; isMock: boolean }> => {
    return requestWithFallback(
      '/api/elicitation/estimates',
      { method: 'POST', body: JSON.stringify(estimate) },
      () => MockCyberEalApi.submitEstimate(estimate)
    );
  },

  // GET /api/elicitation/{target_id}/status
  getElicitationStatus: async (targetId: string) => {
    return requestWithFallback(
      `/api/elicitation/${targetId}/status`,
      { method: 'GET' },
      () => MockCyberEalApi.getElicitationStatus(targetId)
    );
  },

  // POST /api/elicitation/{target_id}/close
  closeElicitationSession: async (targetId: string) => {
    return requestWithFallback(
      `/api/elicitation/${targetId}/close`,
      { method: 'POST' },
      () => MockCyberEalApi.closeElicitationSession(targetId)
    );
  },

  // GET /api/review-queue
  getReviewQueue: async (): Promise<{ data: ReviewQueueItem[]; isMock: boolean }> => {
    return requestWithFallback(
      '/api/review-queue',
      { method: 'GET' },
      () => MockCyberEalApi.getReviewQueue()
    );
  },

  // POST /api/review-queue/{id}/approve
  approveReviewQueueItem: async (id: string, reviewer?: string) => {
    return requestWithFallback(
      `/api/review-queue/${id}/approve`,
      { method: 'POST', body: JSON.stringify({ reviewer }) },
      () => MockCyberEalApi.approveReviewQueueItem(id, reviewer)
    );
  },

  // GET /api/vendors?org_id=...
  getVendors: async (orgId: string = 'org-default') => {
    return requestWithFallback(
      `/api/vendors?org_id=${orgId}`,
      { method: 'GET' },
      () => MockCyberEalApi.getVendors(orgId)
    );
  },

  // GET /api/vendors/dependencies?org_id=...
  getVendorDependencies: async (orgId: string = 'org-default'): Promise<{ data: VendorDependencyResponse; isMock: boolean }> => {
    return requestWithFallback(
      `/api/vendors/dependencies?org_id=${orgId}`,
      { method: 'GET' },
      () => MockCyberEalApi.getVendorDependencies(orgId)
    );
  },

  // POST /api/rosi/simulate
  simulateRosi: async (req: RosiSimulationRequest): Promise<{ data: RosiSimulationResponse; isMock: boolean }> => {
    return requestWithFallback(
      '/api/rosi/simulate',
      { method: 'POST', body: JSON.stringify(req) },
      () => MockCyberEalApi.simulateRosi(req)
    );
  },

  // GET /api/investments?org_id=...
  getInvestments: async (orgId: string = 'org-default'): Promise<{ data: ControlInvestment[]; isMock: boolean }> => {
    return requestWithFallback(
      `/api/investments?org_id=${orgId}`,
      { method: 'GET' },
      () => MockCyberEalApi.getInvestments(orgId)
    );
  },

  // GET /api/data-sources?org_id=...
  getDataSources: async (orgId: string = 'org-default'): Promise<{ data: DataSourcesResponse; isMock: boolean }> => {
    return requestWithFallback(
      `/api/data-sources?org_id=${orgId}`,
      { method: 'GET' },
      () => MockCyberEalApi.getDataSources(orgId)
    );
  },

  // POST /api/simulate/sandbox
  simulateSandbox: async (req: SandboxSimulateRequest): Promise<{ data: SandboxSimulateResponse; isMock: boolean }> => {
    return requestWithFallback(
      '/api/simulate/sandbox',
      { method: 'POST', body: JSON.stringify(req) },
      () => MockCyberEalApi.simulateSandbox(req)
    );
  },

  // POST /api/telemetry/trigger
  triggerTelemetryShock: async (shockType: TelemetryShockType): Promise<{ data: TelemetryTriggerResponse; isMock: boolean }> => {
    return requestWithFallback(
      '/api/telemetry/trigger',
      { method: 'POST', body: JSON.stringify({ shock_type: shockType }) },
      () => MockCyberEalApi.triggerTelemetryShock(shockType)
    );
  },

  // POST /api/ai/query
  queryAiCopilot: async (req: AiQueryRequest): Promise<{ data: AiQueryResponse; isMock: boolean }> => {
    return requestWithFallback(
      '/api/ai/query',
      { method: 'POST', body: JSON.stringify(req) },
      () => MockCyberEalApi.queryAiCopilot(req)
    );
  },

  // POST /api/auth/login
  login: async (email?: string, password?: string) => {
    return requestWithFallback(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      () => MockCyberEalApi.login(email, password)
    );
  },
};
