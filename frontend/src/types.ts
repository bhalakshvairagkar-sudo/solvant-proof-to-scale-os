export interface WeeklyLog {
  week_number: number;
  date: string;
  active_users: number;
  tasks_started: number;
  tasks_completed: number;
  active_minutes_avg: number;
  ai_calls: number;
  successful_outputs: number;
  time_saved_pct: number;
  feedback_score: number;
}

export interface Account {
  id: string;
  name: string;
  industry: string;
  tier: string;
  pilot_start_date: string;
  pilot_days_elapsed: number;
  invited_users: number;
  activated_users: number;
  weekly_active_users: number;
  retained_30d_users: number;
  workflow_time_reduction_pct: number;
  monthly_verified_outputs: number;
  satisfaction_score: number;
  workflow_runs_monthly: number;
  weekly_wau_history: number[];
  stage: string;
  champion_name: string;
  champion_title: string;
  buyer_title: string;
  primary_workflow: string;
  recent_logs: WeeklyLog[];
}

export interface HealthScoreBreakdown {
  activation_score: number;
  activation_weight: number;
  activation_contribution: number;

  frequency_score: number;
  frequency_weight: number;
  frequency_contribution: number;

  retention_score: number;
  retention_weight: number;
  retention_contribution: number;

  outcome_score: number;
  outcome_weight: number;
  outcome_contribution: number;

  expansion_score: number;
  expansion_weight: number;
  expansion_contribution: number;

  raw_score: number;
  final_score: number;
  band: 'Expansion Ready' | 'Healthy but Watch' | 'At Risk';
  color: 'emerald' | 'amber' | 'rose';
  trend_slope: number;
  trend_direction: 'positive' | 'flat' | 'negative';
}

export interface ExpansionCriteriaStatus {
  consecutive_wau_met: boolean;
  consecutive_wau_values: number[];
  time_reduction_met: boolean;
  time_reduction_value: number;
  retention_met: boolean;
  retention_value: number;
  all_met: boolean;
  verdict: 'EXPAND' | 'HOLD' | 'INTERVENE';
}

export interface AccountItemResponse {
  account: Account;
  health: HealthScoreBreakdown;
  expansion: ExpansionCriteriaStatus;
  intervention_required: boolean;
  intervention_reason: string | null;
  estimated_arr: number;
  pilot_thresholds_met?: Record<string, boolean>;
}

export interface PortfolioSummary {
  total_accounts: number;
  expansion_ready_count: number;
  healthy_watch_count: number;
  at_risk_count: number;
  intervention_alerts_count: number;
  pipeline_arr: number;
  avg_health_score: number;
}

export interface AdoptionDoctorResponse {
  status: string;
  primary_issue: string;
  evidence: string[];
  recommended_actions: string[];
  expansion_recommendation: string;
  is_live_llm: boolean;
  model_used: string;
}

export interface PricingSimulationInput {
  pilot_price: number;
  pilot_users: number;
  expansion_wau_threshold: number;
  usage_credit_rate: number;
  full_price_per_user: number;
  pilot_to_expansion_conversion_pct: number;
  monthly_churn_pct: number;
  gross_margin_pct: number;
  new_pilots_per_month: number;
  workflow_runs_per_user_month: number;
  workflow_run_allowance: number;
  expansion_seat_multiplier: number;
}

export interface MonthlyProjection {
  month: number;
  active_customers: number;
  active_seats: number;
  base_mrr: number;
  overage_mrr: number;
  total_mrr: number;
  total_arr: number;
  gross_profit_mrr: number;
  cumulative_gross_profit: number;
}

export interface NorthBridgeShadowPoint {
  month: number;
  northbridge_licensed_seats: number;
  northbridge_effective_active_users: number;
  northbridge_billed_monthly: number;
  solvant_billed_monthly: number;
  customer_wasted_shelfware_spend: number;
}

export interface PricingSimulationOutput {
  arr_12m: number;
  arr_24m: number;
  active_seats_12m: number;
  active_seats_24m: number;
  active_customers_12m: number;
  active_customers_24m: number;
  gross_profit_12m: number;
  gross_profit_24m: number;
  nrr_pct: number;
  nrr_label?: string;
  effective_conversion_pct?: number;
  actual_wau_rate_applied?: number;
  eligible_expansion_accounts_count?: number;
  monthly_projections: MonthlyProjection[];
  northbridge_shadow: NorthBridgeShadowPoint[];
  cost_stack_breakdown: Record<string, number>;
  params: PricingSimulationInput;
}

export interface PricingStrategistResponse {
  summary: string;
  primary_tradeoff: string;
  strategic_implications: string[];
  cfo_soundbite: string;
  is_live_llm: boolean;
  model_used: string;
}

export interface OverclaimGuard {
  status: string;
  facts_grounded_count: number;
  verified_claims: string[];
  unsupported_or_limited_claims: string[];
}

export interface TrustCopilotResponse {
  step1_acknowledge: string;
  step2_clarify: string;
  step3_evidence: string;
  step4_claim_limits: string;
  step5_risk_reduction: string;
  overclaim_guard: OverclaimGuard;
  is_live_llm: boolean;
  model_used: string;
}

export interface TrustFactItem {
  id: string;
  category: string;
  title: string;
  status: string;
  detail: string;
  limits: string;
  evidence_source: string;
}
