import {
  PortfolioSummary,
  AccountItemResponse,
  AdoptionDoctorResponse,
  PricingSimulationInput,
  PricingSimulationOutput,
  PricingStrategistResponse,
  TrustCopilotResponse,
  TrustFactItem,
} from './types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<{
  status: string;
  has_groq_api_key: boolean;
  groq_model: string;
  golden_rule: string;
}> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function setGroqConfig(key: string, model?: string): Promise<{ success: boolean; has_groq_api_key: boolean; groq_model: string }> {
  const res = await fetch(`${API_BASE}/config/groq-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groq_api_key: key, groq_model: model }),
  });
  return res.json();
}

export async function fetchPortfolioSummary(): Promise<PortfolioSummary> {
  const res = await fetch(`${API_BASE}/portfolio`);
  return res.json();
}

export async function fetchAccounts(): Promise<AccountItemResponse[]> {
  const res = await fetch(`${API_BASE}/accounts`);
  return res.json();
}

export async function fetchAccountDetail(id: string): Promise<AccountItemResponse> {
  const res = await fetch(`${API_BASE}/accounts/${id}`);
  return res.json();
}

export async function simulateAccount(
  id: string,
  simulatedWauPct?: number,
  simulatedTimeReductionPct?: number,
  simulatedRetentionPct?: number
): Promise<AccountItemResponse> {
  const res = await fetch(`${API_BASE}/accounts/${id}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      simulated_wau_pct: simulatedWauPct,
      simulated_time_reduction_pct: simulatedTimeReductionPct,
      simulated_retention_pct: simulatedRetentionPct,
    }),
  });
  return res.json();
}

export async function resetAccounts(): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/accounts/reset`, { method: 'POST' });
  return res.json();
}

export async function fetchAdoptionDoctor(accountId: string): Promise<AdoptionDoctorResponse> {
  const res = await fetch(`${API_BASE}/groq/adoption-doctor/${accountId}`, {
    method: 'POST',
  });
  return res.json();
}

export async function runPricingSimulation(
  params: PricingSimulationInput
): Promise<PricingSimulationOutput> {
  const res = await fetch(`${API_BASE}/pricing/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function fetchPricingStrategist(
  output: PricingSimulationOutput
): Promise<PricingStrategistResponse> {
  const res = await fetch(`${API_BASE}/groq/pricing-strategist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(output),
  });
  return res.json();
}

export async function fetchTrustFactBase(): Promise<TrustFactItem[]> {
  const res = await fetch(`${API_BASE}/trust/fact-base`);
  return res.json();
}

export async function fetchTrustCopilot(question: string): Promise<TrustCopilotResponse> {
  const res = await fetch(`${API_BASE}/groq/trust-copilot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  return res.json();
}

export async function fetchCompetitorTeardowns(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/competitor-teardowns`);
  return res.json();
}

export async function fetchAdversarialCurveballs(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/adversarial-curveballs`);
  return res.json();
}

export async function fetchWedgeComparison(): Promise<any> {
  const res = await fetch(`${API_BASE}/wedge-comparison`);
  return res.json();
}

export async function fetchBuyerObjections(): Promise<any> {
  const res = await fetch(`${API_BASE}/buyer-objections`);
  return res.json();
}
