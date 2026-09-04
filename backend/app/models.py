from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class WeeklyLog(BaseModel):
    week_number: int
    date: str
    active_users: int
    tasks_started: int
    tasks_completed: int
    active_minutes_avg: float
    ai_calls: int
    successful_outputs: int
    time_saved_pct: float
    feedback_score: float


class Account(BaseModel):
    id: str
    name: str
    industry: str
    tier: str  # Enterprise, Mid-Market
    pilot_start_date: str
    pilot_days_elapsed: int
    invited_users: int
    activated_users: int
    weekly_active_users: int
    retained_30d_users: int
    workflow_time_reduction_pct: float  # e.g. 0.28 for 28%
    monthly_verified_outputs: int
    satisfaction_score: float  # e.g. 4.6 out of 5.0
    workflow_runs_monthly: int
    weekly_wau_history: List[float]  # last 8 weeks of WAU rates (0.0 - 1.0)
    stage: str  # "Pilot Active", "Expansion Ready", "Intervention Active", "At Risk", "Expanded"
    champion_name: str
    champion_title: str
    buyer_title: str
    primary_workflow: str = "FP&A Variance Analysis & Management Reporting"
    recent_logs: List[WeeklyLog] = []


class HealthScoreBreakdown(BaseModel):
    activation_score: float
    activation_weight: float = 0.25
    activation_contribution: float

    frequency_score: float
    frequency_weight: float = 0.25
    frequency_contribution: float

    retention_score: float
    retention_weight: float = 0.20
    retention_contribution: float

    outcome_score: float
    outcome_weight: float = 0.20
    outcome_contribution: float

    expansion_score: float
    expansion_weight: float = 0.10
    expansion_contribution: float

    raw_score: float
    final_score: float
    band: str  # "Expansion Ready", "Healthy but Watch", "At Risk"
    color: str  # "emerald", "amber", "rose"
    trend_slope: float
    trend_direction: str  # "positive", "flat", "negative"
    components: Dict[str, float] = {}


class ExpansionCriteriaStatus(BaseModel):
    consecutive_wau_met: bool  # WAU >= expansion_wau_threshold for 4 consecutive weeks
    consecutive_wau_values: List[float]
    expansion_wau_threshold_applied: float = 0.60
    time_reduction_met: bool  # workflow time reduction >= 20%
    time_reduction_value: float
    retention_met: bool  # 30-day retention >= 70%
    retention_value: float
    all_met: bool
    verdict: str  # "EXPAND", "HOLD", "INTERVENE"
    failed_conditions: List[str] = []
    passed_conditions: List[str] = []
    trigger_status: Dict[str, bool] = {}
    decision_reason: str = ""


class AccountHealthResponse(BaseModel):
    account_id: str
    account_name: str
    health: HealthScoreBreakdown
    expansion: ExpansionCriteriaStatus
    intervention_required: bool
    intervention_reason: Optional[str] = None
    pilot_thresholds_met: Dict[str, bool]


class AdoptionDoctorResponse(BaseModel):
    status: str
    primary_issue: str
    evidence: List[str]
    recommended_actions: List[str]
    expansion_recommendation: str
    is_live_llm: bool = False
    model_used: str = "verified-baseline-cache"


class PilotUnitEconomics(BaseModel):
    revenue: float = 12000.0
    delivery_cost: float = 2276.0
    ai_inference_cost: float = 112.0
    customer_success_cost: float = 1050.0
    cloud_hosting_cost: float = 450.0
    other_delivery_cost: float = 300.0
    contribution: float = 9724.0
    margin_pct: float = 81.0
    is_profitable: bool = True
    status_label: str = "PROFITABLE"


class CohortNRRBreakdown(BaseModel):
    starting_mrr: float = 3780.0
    expansion_mrr: float = 2016.0
    contraction_mrr: float = 151.2
    churn_mrr: float = 627.5
    ending_mrr: float = 5017.3
    net_change_mrr: float = 1237.3
    nrr_pct: float = 132.7
    grr_pct: float = 79.4
    excludes_new_logos: bool = True
    formula_definition: str = "NRR = (Starting MRR + Expansion - Contraction - Churn) / Starting MRR * 100"


class ChurnRiskAssessment(BaseModel):
    risk_level: str = "LOW"  # "LOW", "MEDIUM", "HIGH"
    risk_score: float = 28.5  # 0 to 100
    annualized_churn_pct: float = 16.6
    churned_customers_12m: int = 4
    churned_customers_24m: int = 15
    revenue_lost_to_churn_12m: float = 23184.0
    revenue_lost_to_churn_24m: float = 86940.0
    key_drivers: List[str] = Field(default_factory=list)


class TimeToFullPriceComparisonPoint(BaseModel):
    horizon_months: int
    revenue_12m: float
    revenue_24m: float
    gross_margin_pct: float
    full_price_start_month: int
    active_customers_12m: int
    active_customers_24m: int


class PerAccountPricingBreakdown(BaseModel):
    licensed_users: int = 175
    activated_users: int = 160
    weekly_active_users: int = 126
    weekly_active_rate: float = 0.72
    billable_active_users: int = 126
    unbilled_inactive_users: int = 49
    base_mrr: float = 3780.0
    usage_overage_mrr: float = 2016.0
    total_mrr: float = 5796.0
    shelfware_savings_statement: str = "You don't pay us for the 49 users who aren't actively using the workflow."


class PricingSimulationInput(BaseModel):
    pilot_price: float = 12000.0
    pilot_duration_months: int = 2
    pilot_users: int = 50
    expansion_wau_threshold: float = 0.60
    usage_credit_rate: float = 0.40
    workflow_run_allowance: int = 100
    time_to_full_price_months: int = 6
    expansion_seat_multiplier: float = 3.5  # average expansion lands ~175 seats from 50 pilot seats
    pilot_to_expansion_conversion_pct: float = 65.0
    monthly_churn_pct: float = 1.5
    ai_cost_per_run: float = 0.008  # Illustrative AI infrastructure cost assumption: Groq LLaMA 3.3 70B inference
    cs_cost_per_customer_month: float = 350.0
    cloud_cost_per_customer_month: float = 150.0
    other_delivery_cost_per_customer_month: float = 100.0
    full_price_per_user: float = 30.0
    gross_margin_pct: float = 76.5
    new_pilots_per_month: int = 6
    workflow_runs_per_user_month: int = 140
    time_to_full_price_days: int = 60  # Backwards compatibility: [30, 60, 90] days
    pilot_duration_days: int = 60


class MonthlyProjection(BaseModel):
    month: int
    active_customers: int
    active_seats: int
    billable_active_users: int = 0
    licensed_seats: int = 0
    pilot_revenue: float = 0.0
    transition_revenue: float = 0.0
    expansion_base_revenue: float = 0.0
    usage_overage_revenue: float = 0.0
    base_mrr: float
    overage_mrr: float
    total_mrr: float
    total_arr: float
    dynamic_ai_cost: float = 0.0
    total_delivery_cost_mrr: float = 0.0
    gross_profit_mrr: float
    cumulative_revenue: float = 0.0
    cumulative_gross_profit: float


class NorthBridgeShadowPoint(BaseModel):
    month: int
    northbridge_licensed_seats: int
    northbridge_effective_active_users: int  # Illustrative industry assumption — 33% utilization
    northbridge_billed_monthly: float  # $60 / seat * all licensed seats
    solvant_billed_monthly: float  # only active seats + usage
    customer_wasted_shelfware_spend: float  # difference paid to NorthBridge with 0 usage


class PricingSimulationOutput(BaseModel):
    arr_12m: float
    arr_24m: float
    revenue_12m: float = 0.0
    revenue_24m: float = 0.0
    pilot_revenue_total_12m: float = 0.0
    expansion_revenue_total_12m: float = 0.0
    usage_revenue_total_12m: float = 0.0
    revenue_growth_y2_vs_y1: float = 0.0
    active_seats_12m: int
    active_seats_24m: int
    active_customers_12m: int
    active_customers_24m: int
    gross_profit_12m: float
    gross_profit_24m: float
    gross_margin_pct: float = 76.5
    nrr_pct: float
    grr_pct: float = 82.0
    nrr_label: str = "Cohort-Based Net Revenue Retention (NRR)"
    nrr_explanation: str = "Pure cohort-based NRR excluding new logo revenue: (Starting MRR + Expansion - Contraction - Churn) / Starting MRR * 100."
    cohort_nrr_proxy_pct: float = 138.0
    effective_conversion_pct: float
    actual_wau_rate_applied: float
    eligible_expansion_accounts_count: Optional[int] = None
    pilot_days: int = 60
    full_price_start_month: int = 3
    months_at_full_price_12m: int = 10
    months_at_full_price_24m: int = 22
    total_ai_infrastructure_cost_12m: float = 0.0
    total_ai_infrastructure_cost_24m: float = 0.0
    total_delivery_cost_12m: float = 0.0
    total_delivery_cost_24m: float = 0.0
    pilot_economics: PilotUnitEconomics = Field(default_factory=PilotUnitEconomics)
    cohort_nrr: CohortNRRBreakdown = Field(default_factory=CohortNRRBreakdown)
    churn_risk: ChurnRiskAssessment = Field(default_factory=ChurnRiskAssessment)
    time_to_full_price_comparison: List[TimeToFullPriceComparisonPoint] = Field(default_factory=list)
    causal_change_explanation: str = ""
    per_account_sample: PerAccountPricingBreakdown = Field(default_factory=PerAccountPricingBreakdown)
    monthly_projections: List[MonthlyProjection]
    northbridge_shadow: List[NorthBridgeShadowPoint]
    cost_stack_breakdown: Dict[str, float]
    model_assumptions: Dict[str, Any] = Field(default_factory=dict)
    known_simplifications: List[str] = Field(default_factory=list)
    params: PricingSimulationInput


class PricingStrategistResponse(BaseModel):
    summary: str
    primary_tradeoff: str
    strategic_implications: List[str]
    cfo_soundbite: str
    is_live_llm: bool = False
    model_used: str = "verified-baseline-cache"


class OverclaimGuard(BaseModel):
    status: str  # "VERIFIED_GROUNDED", "WARNING_UNSUPPORTED", "BOUNDARY_ENFORCED"
    facts_grounded_count: int
    verified_claims: List[str]
    unsupported_or_limited_claims: List[str]
    validation_mechanism: str = "Claim Guard: deterministic fact-reference validation"


class TrustClaimRef(BaseModel):
    text: str
    fact_ids: List[str]


class TrustCopilotResponse(BaseModel):
    step1_acknowledge: str
    step2_clarify: str
    step3_evidence: str
    step4_claim_limits: str
    step5_risk_reduction: str
    claims: List[TrustClaimRef] = []
    overclaim_guard: OverclaimGuard
    audit_event_id: Optional[str] = None
    audit_event_hash: Optional[str] = None
    is_live_llm: bool = False
    model_used: str = "verified-baseline-cache"


class TrustFactItem(BaseModel):
    id: str
    topic: str
    claim: str
    allowed: bool = True
    category: str
    title: str
    status: str = "ACTIVE"
    detail: str
    limits: str
    evidence_source: str


class AdoptionObjective(BaseModel):
    objective: str
    target: str
    current_value: str
    met: bool


class AdoptionPhaseMilestone(BaseModel):
    phase: str
    day_range: str
    status: str  # "COMPLETED", "IN_PROGRESS", "UPCOMING"
    objectives: List[AdoptionObjective]
    exit_gate: str
    exit_gate_met: bool


class AdoptionWorkstream(BaseModel):
    account_id: str
    account_name: str
    pilot_days_elapsed: int
    current_phase: str
    phases: List[AdoptionPhaseMilestone]

