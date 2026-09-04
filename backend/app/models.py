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


class ExpansionCriteriaStatus(BaseModel):
    consecutive_wau_met: bool  # WAU >= 60% for 4 consecutive weeks
    consecutive_wau_values: List[float]
    time_reduction_met: bool  # workflow time reduction >= 20%
    time_reduction_value: float
    retention_met: bool  # 30-day retention >= 70%
    retention_value: float
    all_met: bool
    verdict: str  # "EXPAND", "HOLD", "INTERVENE"


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


class PricingSimulationInput(BaseModel):
    pilot_price: float = 12000.0
    pilot_users: int = 50
    expansion_wau_threshold: float = 0.60
    usage_credit_rate: float = 0.40
    full_price_per_user: float = 30.0
    pilot_to_expansion_conversion_pct: float = 65.0
    monthly_churn_pct: float = 1.5
    gross_margin_pct: float = 76.5
    new_pilots_per_month: int = 6
    workflow_runs_per_user_month: int = 140
    workflow_run_allowance: int = 100
    expansion_seat_multiplier: float = 3.5  # average expansion lands ~175 seats from 50 pilot seats


class MonthlyProjection(BaseModel):
    month: int
    active_customers: int
    active_seats: int
    base_mrr: float
    overage_mrr: float
    total_mrr: float
    total_arr: float
    gross_profit_mrr: float
    cumulative_gross_profit: float


class NorthBridgeShadowPoint(BaseModel):
    month: int
    northbridge_licensed_seats: int
    northbridge_effective_active_users: int  # only 33% active
    northbridge_billed_monthly: float  # $60 / seat * all licensed seats
    solvant_billed_monthly: float  # only active seats + usage
    customer_wasted_shelfware_spend: float  # difference paid to NorthBridge with 0 usage


class PricingSimulationOutput(BaseModel):
    arr_12m: float
    arr_24m: float
    active_seats_12m: int
    active_seats_24m: int
    active_customers_12m: int
    active_customers_24m: int
    gross_profit_12m: float
    gross_profit_24m: float
    nrr_pct: float
    monthly_projections: List[MonthlyProjection]
    northbridge_shadow: List[NorthBridgeShadowPoint]
    cost_stack_breakdown: Dict[str, float]
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


class TrustCopilotResponse(BaseModel):
    step1_acknowledge: str
    step2_clarify: str
    step3_evidence: str
    step4_claim_limits: str
    step5_risk_reduction: str
    overclaim_guard: OverclaimGuard
    is_live_llm: bool = False
    model_used: str = "verified-baseline-cache"


class TrustFactItem(BaseModel):
    id: str
    category: str
    title: str
    status: str
    detail: str
    limits: str
