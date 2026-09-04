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

export interface StakeholderRole {
  role: string; // "Economic Buyer", "Executive Sponsor", "Workflow Owner", "IT/Security Owner", "End-User Champion"
  name: string;
  title: string;
  identified: boolean;
  notes?: string;
}

export interface InterventionHistoryItem {
  day: number;
  date: string;
  event_type: string;
  description: string;
  impact_summary?: string;
  status: string;
}

export interface Day60StallAssessment {
  status: 'HEALTHY' | 'AT RISK' | 'STALLED' | string;
  is_stalled: boolean;
  stall_risk_score: number;
  failing_indicators: string[];
  healthy_indicators: string[];
  stall_reason: string;
}

export interface RootCauseDiagnosis {
  primary_cause: string;
  category: 'GTM-CONTROLLABLE' | 'PARTIALLY CONTROLLABLE' | 'ORGANIZATIONAL / EXTERNAL' | string;
  controllability_score_pct: number;
  contributing_factors: string[];
  prescribed_intervention: string;
  action_plan_steps: string[];
  remeasurement_target: string;
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
  stakeholders?: StakeholderRole[];
  stakeholder_alignment_score?: number;
  roi_multiplier?: number;
  workflow_completion_rate?: number;
  error_reduction_pct?: number;
  day_60_status?: string;
  intervention_history?: InterventionHistoryItem[];
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
  components?: Record<string, number>;
}

export interface ExpansionCriteriaStatus {
  consecutive_wau_met: boolean;
  consecutive_wau_values: number[];
  expansion_wau_threshold_applied?: number;
  time_reduction_met: boolean;
  time_reduction_value: number;
  retention_met: boolean;
  retention_value: number;
  all_met: boolean;
  verdict: 'EXPAND' | 'HOLD' | 'INTERVENE' | 'STOP / REASSESS' | string;
  failed_conditions?: string[];
  passed_conditions?: string[];
  trigger_status?: Record<string, boolean>;
  decision_reason?: string;
  roi_multiplier_met?: boolean;
  roi_multiplier_value?: number;
  workflow_completion_met?: boolean;
  workflow_completion_value?: number;
  evidence_bullets?: string[];
  traceability_chain?: Record<string, any>;
}

export interface AccountItemResponse {
  account: Account;
  health: HealthScoreBreakdown;
  expansion: ExpansionCriteriaStatus;
  intervention_required: boolean;
  intervention_reason: string | null;
  estimated_arr: number;
  active_billable_users?: number;
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
  expansion_wau_threshold_applied?: number;
  active_billable_users_per_account?: number;
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

export interface PilotUnitEconomics {
  revenue: number;
  delivery_cost: number;
  ai_inference_cost: number;
  customer_success_cost: number;
  cloud_hosting_cost: number;
  other_delivery_cost: number;
  contribution: number;
  margin_pct: number;
  is_profitable: boolean;
  status_label: string;
}

export interface CohortNRRBreakdown {
  starting_mrr: number;
  expansion_mrr: number;
  contraction_mrr: number;
  churn_mrr: number;
  ending_mrr: number;
  net_change_mrr: number;
  nrr_pct: number;
  grr_pct: number;
  excludes_new_logos: boolean;
  formula_definition: string;
}

export interface ChurnRiskAssessment {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  risk_score: number;
  annualized_churn_pct: number;
  churned_customers_12m: number;
  churned_customers_24m: number;
  revenue_lost_to_churn_12m: number;
  revenue_lost_to_churn_24m: number;
  key_drivers: string[];
}

export interface TimeToFullPriceComparisonPoint {
  horizon_months: number;
  revenue_12m: number;
  revenue_24m: number;
  gross_margin_pct: number;
  full_price_start_month: number;
  active_customers_12m: number;
  active_customers_24m: number;
}

export interface PerAccountPricingBreakdown {
  licensed_users: number;
  activated_users: number;
  weekly_active_users: number;
  weekly_active_rate: number;
  billable_active_users: number;
  unbilled_inactive_users: number;
  base_mrr: number;
  usage_overage_mrr: number;
  total_mrr: number;
  shelfware_savings_statement: string;
}

export interface PricingSimulationInput {
  pilot_price: number;
  pilot_duration_months?: number;
  pilot_users: number;
  expansion_wau_threshold: number;
  usage_credit_rate: number;
  workflow_run_allowance: number;
  time_to_full_price_months?: number;
  expansion_seat_multiplier: number;
  pilot_to_expansion_conversion_pct: number;
  monthly_churn_pct: number;
  ai_cost_per_run?: number;
  cs_cost_per_customer_month?: number;
  cloud_cost_per_customer_month?: number;
  other_delivery_cost_per_customer_month?: number;
  full_price_per_user: number;
  gross_margin_pct: number;
  new_pilots_per_month: number;
  workflow_runs_per_user_month: number;
  time_to_full_price_days?: number;
  pilot_duration_days?: number;
}

export interface MonthlyProjection {
  month: number;
  active_customers: number;
  active_seats: number;
  billable_active_users?: number;
  licensed_seats?: number;
  pilot_revenue?: number;
  transition_revenue?: number;
  expansion_base_revenue?: number;
  usage_overage_revenue?: number;
  base_mrr: number;
  overage_mrr: number;
  total_mrr: number;
  total_arr: number;
  dynamic_ai_cost?: number;
  total_delivery_cost_mrr?: number;
  gross_profit_mrr: number;
  cumulative_revenue?: number;
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
  revenue_12m?: number;
  revenue_24m?: number;
  pilot_revenue_total_12m?: number;
  transition_revenue_total_12m?: number;
  expansion_revenue_total_12m?: number;
  usage_revenue_total_12m?: number;
  revenue_growth_y2_vs_y1?: number;
  active_seats_12m: number;
  active_seats_24m: number;
  active_customers_12m: number;
  active_customers_24m: number;
  gross_profit_12m: number;
  gross_profit_24m: number;
  gross_margin_pct?: number;
  nrr_pct: number;
  grr_pct?: number;
  nrr_label?: string;
  nrr_explanation?: string;
  cohort_nrr_proxy_pct?: number;
  effective_conversion_pct?: number;
  actual_wau_rate_applied?: number;
  eligible_expansion_accounts_count?: number;
  pilot_days?: number;
  full_price_start_month?: number;
  months_at_full_price_12m?: number;
  months_at_full_price_24m?: number;
  total_ai_infrastructure_cost_12m?: number;
  total_ai_infrastructure_cost_24m?: number;
  total_delivery_cost_12m?: number;
  total_delivery_cost_24m?: number;
  pilot_economics?: PilotUnitEconomics;
  cohort_nrr?: CohortNRRBreakdown;
  churn_risk?: ChurnRiskAssessment;
  time_to_full_price_comparison?: TimeToFullPriceComparisonPoint[];
  causal_change_explanation?: string;
  per_account_sample?: PerAccountPricingBreakdown;
  monthly_projections: MonthlyProjection[];
  northbridge_shadow: NorthBridgeShadowPoint[];
  cost_stack_breakdown: Record<string, number>;
  model_assumptions?: Record<string, any>;
  known_simplifications?: string[];
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
  validation_mechanism?: string;
}

export interface TrustClaimRef {
  text: string;
  fact_ids: string[];
}

export interface TrustCopilotResponse {
  step1_acknowledge: string;
  step2_clarify: string;
  step3_evidence: string;
  step4_claim_limits: string;
  step5_risk_reduction: string;
  the_concern?: string;
  what_solvant_does?: string;
  what_customer_controls?: string;
  what_customer_can_verify?: string;
  what_solvant_does_not_claim?: string;
  claims?: TrustClaimRef[];
  overclaim_guard: OverclaimGuard;
  audit_event_id?: string;
  audit_event_hash?: string;
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
  topic?: string;
  claim?: string;
  allowed?: boolean;
}

export interface AuditEvent {
  event_id: string;
  sequence_number: number;
  timestamp: string;
  event_type: string;
  account_id: string;
  summary: string;
  input_hash: string;
  output_hash: string;
  previous_hash: string;
  event_hash: string;
}

export interface AuditChainVerificationResponse {
  valid: boolean;
  events_checked: number;
  chain_head: string;
  broken_at_event?: number | null;
  reason?: string | null;
}

export interface AdoptionObjective {
  objective: string;
  target: string;
  current_value: string;
  met: boolean;
}

export interface AdoptionPhaseMilestone {
  phase: string;
  day_range: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  objectives: AdoptionObjective[];
  exit_gate: string;
  exit_gate_met: boolean;
}

export interface AdoptionWorkstream {
  account_id: string;
  account_name: string;
  pilot_days_elapsed: number;
  current_phase: string;
  phases: AdoptionPhaseMilestone[];
  day_60_assessment?: Day60StallAssessment;
  root_cause?: RootCauseDiagnosis;
  remeasurement_stage?: string;
  stakeholders?: StakeholderRole[];
}


export interface GTMResearchItem {
  company: string;
  ticker: string;
  market_position: string;
  land_motion: string;
  expansion_motion: string;
  pricing_model: string;
  ai_mechanism: string;
  why_it_works: string;
  transferable_lesson: string;
  non_transferable_lesson: string;
  why_not_transferable: string;
}

export interface AdoptionGapItem {
  root_cause: string;
  can_gtm_fix: 'YES' | 'PARTIAL' | 'NO' | string;
  how_solvant_remediates: string;
  doctor_connection: string;
}

export interface PricingBenchmarkItem {
  company: string;
  pricing_mechanism: string;
  list_price: string;
  seat_based: string;
  usage_based: string;
  ai_specific_meter: string;
  expansion_mechanism: string;
  solvant_lesson: string;
  source: string;
}

export interface SolvantSynthesisStep {
  step: number;
  title: string;
  description: string;
  proof_point: string;
}

export interface SolvantStrategicSynthesis {
  core_thesis: string;
  sub_thesis: string;
  pipeline_steps: SolvantSynthesisStep[];
  incumbent_vs_solvant_comparison: {
    incumbent: {
      strategy: string;
      consequence: string;
    };
    solvant: {
      strategy: string;
      consequence: string;
    };
  };
}

export interface GTMResearchSuiteResponse {
  gtm_intelligence: GTMResearchItem[];
  adoption_gap_matrix: AdoptionGapItem[];
  pricing_benchmark: PricingBenchmarkItem[];
  synthesis: SolvantStrategicSynthesis;
}


export interface GTMConnectedStage {
  stage_number: number;
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  key_mechanics: string[];
  why_it_works: string;
}

export interface OstravaDecisionResponse {
  verdict: 'DEFEND_AND_EXPAND' | 'MOVE_WEDGE' | 'STOP_AND_REASSESS' | string;
  headline: string;
  action_plan: string[];
  defense_pillars: string[];
  prohibited_actions: string[];
  contingency_stage: string;
  core_message: string;
}

export interface GTMArchitectureResponse {
  connected_stages: GTMConnectedStage[];
  prohibited_actions: string[];
  defense_pillars: { pillar: string; description: string }[];
  contingency_stages: { stage: string; action: string }[];
}
