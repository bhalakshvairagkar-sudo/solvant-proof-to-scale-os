import os
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.models import (
    Account,
    AccountHealthResponse,
    PricingSimulationInput,
    PricingSimulationOutput,
    AdoptionDoctorResponse,
    PricingStrategistResponse,
    TrustCopilotResponse,
    TrustFactItem,
    AdoptionWorkstream,
    AdoptionPhaseMilestone,
    AdoptionObjective,
)
from app.database import db
from app.gtm_engine import evaluate_account_health
from app.pricing_engine import run_pricing_simulation
from app.groq_service import (
    call_groq_adoption_doctor,
    call_groq_pricing_strategist,
    call_groq_trust_copilot,
)
from app.trust_copilot import get_fact_base
from app.audit_chain import audit_ledger, AuditChainVerificationResponse, AuditEvent
from app.gtm_architecture import (
    GTM_CONNECTED_STAGES,
    PROHIBITED_OSTRAVA_ACTIONS,
    SOLVANT_EIGHT_PILLAR_RESPONSE,
    CONTINGENCY_ONE_PAGER_STAGES,
    evaluate_ostrava_decision,
)
from app.models import OstravaDecisionRequest, OstravaDecisionResponse
from app.research_data import (
    GTM_RESEARCH_INTELLIGENCE,
    ADOPTION_GAP_MATRIX,
    PRICING_BENCHMARK_TEARDOWN,
    SOLVANT_STRATEGIC_SYNTHESIS,
)
from app.models import GTMResearchSuiteResponse
from app.wedge_data import (
    WEDGE_COMPARISON_MATRIX,
    THREE_LAYER_MOAT,
    BUYER_OBJECTIONS,
    COMPETITOR_PRICING_TEARDOWNS,
    ADVERSARIAL_CURVEBALL_REHEARSALS,
)

app = FastAPI(
    title="Solvant Proof-to-Scale OS API",
    description="Enterprise AI Adoption Infrastructure — Deterministic GTM & Pricing Engine with Groq Diagnostics",
    version="1.0.0",
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimulationUpdateRequest(BaseModel):
    simulated_wau_pct: Optional[float] = None
    simulated_time_reduction_pct: Optional[float] = None
    simulated_retention_pct: Optional[float] = None
    isolate_wau_effect: Optional[bool] = False


class GroqKeyRequest(BaseModel):
    groq_api_key: str
    groq_model: Optional[str] = None


class ObjectionQueryRequest(BaseModel):
    question: str


@app.get("/api/health")
def get_system_health():
    api_key = os.getenv("GROQ_API_KEY", "")
    model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    return {
        "status": "healthy",
        "has_groq_api_key": bool(api_key),
        "groq_model": model_name,
        "golden_rule": "Code calculates. Groq explains.",
        "engine_rule": "CODE CALCULATES. GROQ EXPLAINS.",
        "fact_base_count": len(get_fact_base()),
        "audit_ledger_status": "ONLINE",
        "audit_events_count": len(audit_ledger.get_events()),
    }


@app.post("/api/groq/configure-key")
def configure_groq_key(req: GroqKeyRequest):
    if not req.groq_api_key or not req.groq_api_key.startswith("gsk_"):
        raise HTTPException(
            status_code=400,
            detail="Invalid Groq API key format. Key must start with 'gsk_'",
        )
    os.environ["GROQ_API_KEY"] = req.groq_api_key
    if req.groq_model:
        os.environ["GROQ_MODEL"] = req.groq_model
    return {
        "status": "configured",
        "groq_model": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
    }


@app.get("/api/portfolio")
def get_portfolio_summary(expansion_wau_threshold: float = 0.60):
    accounts = db.get_all()
    evaluated = [evaluate_account_health(a, expansion_wau_threshold=expansion_wau_threshold) for a in accounts]

    expansion_ready = [e for e in evaluated if e.expansion.verdict == "EXPAND"]
    healthy_watch = [
        e for e in evaluated
        if e.health.band == "Healthy but Watch" or (e.health.band == "Expansion Ready" and e.expansion.verdict != "EXPAND")
    ]
    at_risk = [e for e in evaluated if e.health.band == "At Risk"]

    # Active billable users calculation:
    actual_wau_rate = min(0.95, max(0.40, expansion_wau_threshold + 0.12))
    active_billable_users = int(round(175 * actual_wau_rate))
    pipeline_arr = len(expansion_ready) * (active_billable_users * (30 + 16) * 12)
    avg_health_score = round(sum(e.health.final_score for e in evaluated) / len(evaluated), 1) if evaluated else 0.0

    return {
        "total_accounts": len(accounts),
        "expansion_ready_count": len(expansion_ready),
        "healthy_watch_count": len(healthy_watch),
        "at_risk_count": len(at_risk),
        "intervention_alerts_count": sum(1 for e in evaluated if e.intervention_required),
        "pipeline_arr": pipeline_arr,
        "avg_health_score": avg_health_score,
        "expansion_wau_threshold_applied": expansion_wau_threshold,
        "active_billable_users_per_account": active_billable_users,
    }


@app.get("/api/accounts")
def list_accounts(expansion_wau_threshold: float = 0.60):
    accounts = db.get_all()
    results = []
    actual_wau_rate = min(0.95, max(0.40, expansion_wau_threshold + 0.12))
    for acct in accounts:
        health_resp = evaluate_account_health(acct, expansion_wau_threshold=expansion_wau_threshold)
        expanded_seats = int(acct.activated_users * 3.5)
        active_billable = int(round(expanded_seats * actual_wau_rate))
        est_arr = int(active_billable * (30 + 16) * 12)
        results.append({
            "account": acct,
            "health": health_resp.health,
            "expansion": health_resp.expansion,
            "intervention_required": health_resp.intervention_required,
            "intervention_reason": health_resp.intervention_reason,
            "estimated_arr": est_arr,
            "active_billable_users": active_billable,
            "day_60_assessment": health_resp.day_60_assessment,
            "root_cause": health_resp.root_cause,
            "stakeholder_alignment_score": health_resp.stakeholder_alignment_score,
        })
    # Sort accounts: Expansion Ready first, then Watch, then At Risk
    band_order = {"Expansion Ready": 0, "Healthy but Watch": 1, "At Risk": 2}
    results.sort(key=lambda x: (0 if x["expansion"].verdict == "EXPAND" else band_order.get(x["health"].band, 3), -x["health"].final_score))
    return results


@app.get("/api/accounts/{account_id}")
def get_account_detail(account_id: str, expansion_wau_threshold: float = 0.60):
    acct = db.get_by_id(account_id)
    if not acct:
        raise HTTPException(status_code=404, detail="Account not found")

    health_resp = evaluate_account_health(acct, expansion_wau_threshold=expansion_wau_threshold)
    actual_wau_rate = min(0.95, max(0.40, expansion_wau_threshold + 0.12))
    expanded_seats = int(acct.activated_users * 3.5)
    active_billable = int(round(expanded_seats * actual_wau_rate))
    est_arr = int(active_billable * (30 + 16) * 12)

    return {
        "account": acct,
        "health": health_resp.health,
        "expansion": health_resp.expansion,
        "intervention_required": health_resp.intervention_required,
        "intervention_reason": health_resp.intervention_reason,
        "pilot_thresholds_met": health_resp.pilot_thresholds_met,
        "estimated_arr": est_arr,
        "active_billable_users": active_billable,
        "day_60_assessment": health_resp.day_60_assessment,
        "root_cause": health_resp.root_cause,
        "stakeholder_alignment_score": health_resp.stakeholder_alignment_score,
    }


@app.post("/api/accounts/{account_id}/simulate")
def simulate_account_changes(account_id: str, req: SimulationUpdateRequest):
    """
    Live interactive simulation: updates WAU or other metrics live,
    recalculating health score and expansion verdict dynamically.
    """
    isolate = req.isolate_wau_effect if req.isolate_wau_effect is not None else True
    updated_acct = db.update_account_simulation(
        account_id=account_id,
        simulated_wau_pct=req.simulated_wau_pct,
        simulated_time_reduction_pct=req.simulated_time_reduction_pct,
        simulated_retention_pct=req.simulated_retention_pct,
        isolate_wau_effect=isolate,
    )
    if not updated_acct:
        raise HTTPException(status_code=404, detail="Account not found")

    health_resp = evaluate_account_health(updated_acct)
    expanded_seats = int(updated_acct.activated_users * 3.5)
    active_billable = int(round(expanded_seats * 0.72))
    est_arr = int(active_billable * (30 + 16) * 12)

    return {
        "account": updated_acct,
        "health": health_resp.health,
        "expansion": health_resp.expansion,
        "intervention_required": health_resp.intervention_required,
        "intervention_reason": health_resp.intervention_reason,
        "pilot_thresholds_met": health_resp.pilot_thresholds_met,
        "estimated_arr": est_arr,
        "active_billable_users": active_billable,
    }


@app.post("/api/accounts/reset")
def reset_all_accounts():
    db.reset()
    return {"message": "All accounts reset to seed baseline"}


def build_adoption_workstream(account: Account) -> AdoptionWorkstream:
    days = account.pilot_days_elapsed
    health_resp = evaluate_account_health(account)
    h = health_resp.health
    e = health_resp.expansion
    stall = health_resp.day_60_assessment
    cause = health_resp.root_cause
    
    # Phase 1: Days 0–30: ACTIVATION (Goal: Users experience first value quickly)
    p1_status = "COMPLETED" if days >= 30 else "IN_PROGRESS"
    p1_objectives = [
        AdoptionObjective(
            objective="First workflow completion & general ledger sync",
            target="stateless VPC endpoint live, first variance generated",
            current_value="Stateless AWS KMS + VPC Endpoint live; first variance logged",
            met=True,
        ),
        AdoptionObjective(
            objective="First successful task & active user onboarding",
            target=">= 70% activation (35+ users)",
            current_value=f"{account.activated_users}/{account.invited_users} ({int(round((account.activated_users/account.invited_users)*100))}%)",
            met=(account.activated_users / account.invited_users) >= 0.70,
        ),
        AdoptionObjective(
            objective="End-user champion & executive sponsor identified",
            target="5 core stakeholder roles identified",
            current_value=f"{len([s for s in account.stakeholders if s.identified])}/5 roles confirmed ({int(account.stakeholder_alignment_score)}% alignment)",
            met=account.stakeholder_alignment_score >= 60.0,
        ),
        AdoptionObjective(
            objective="First measurable value delivered",
            target=">= 4 hours saved on initial close cycle",
            current_value=f"{(account.workflow_time_reduction_pct * 100):.1f}% time saved; {account.monthly_verified_outputs} outputs",
            met=account.workflow_time_reduction_pct >= 0.15,
        ),
    ]
    p1_exit_met = all(o.met for o in p1_objectives)
    
    # Phase 2: Days 31–60: HABIT (Goal: Usage becomes habitual)
    if days < 30:
        p2_status = "UPCOMING"
    elif days < 60:
        p2_status = "IN_PROGRESS"
    else:
        p2_status = "COMPLETED"
        
    current_wau_pct = int(round((account.weekly_active_users / account.activated_users) * 100))
    p2_objectives = [
        AdoptionObjective(
            objective="Weekly active usage rate (WAU)",
            target=">= 60% WAU for 4 consecutive weeks",
            current_value=f"{current_wau_pct}% current WAU ({'Met' if e.consecutive_wau_met else 'Unmet'})",
            met=e.consecutive_wau_met,
        ),
        AdoptionObjective(
            objective="Repeat usage & cohort retention",
            target=">= 70% 30-day active retention",
            current_value=f"{int(round((account.retained_30d_users/account.activated_users)*100))}% retained",
            met=e.retention_met,
        ),
        AdoptionObjective(
            objective="Workflow completion rate",
            target=">= 75% tasks completed through export",
            current_value=f"{int(round(account.workflow_completion_rate * 100))}% completed",
            met=account.workflow_completion_rate >= 0.75,
        ),
        AdoptionObjective(
            objective="Usage trend slope",
            target="Positive or flat slope over 4-week window",
            current_value=f"{h.trend_direction} ({h.trend_slope:.3f}/wk)",
            met=h.trend_slope >= -0.015,
        ),
    ]
    p2_exit_met = all(o.met for o in p2_objectives)

    # Phase 3: Days 61–90: BUSINESS VALUE (Goal: Convert usage into customer-verifiable business value)
    if days < 60:
        p3_status = "UPCOMING"
    else:
        p3_status = "IN_PROGRESS"

    expanded_seats = int(account.activated_users * 3.5)
    p3_objectives = [
        AdoptionObjective(
            objective="Customer-verifiable ROI multiplier",
            target=">= 2.0x realized return on pilot investment",
            current_value=f"{account.roi_multiplier:.1f}x measured ROI",
            met=account.roi_multiplier >= 2.0,
        ),
        AdoptionObjective(
            objective="Finance workflow time reduction",
            target=">= 20% variance close cycle reduction",
            current_value=f"{int(round(account.workflow_time_reduction_pct * 100))}% measured reduction",
            met=e.time_reduction_met,
        ),
        AdoptionObjective(
            objective="Error & rework reduction",
            target=">= 15% variance reporting error reduction",
            current_value=f"{int(round(account.error_reduction_pct * 100))}% error reduction",
            met=account.error_reduction_pct >= 0.15,
        ),
        AdoptionObjective(
            objective=f"Enterprise expansion readiness ({expanded_seats} provisioned seats)",
            target="Usage-metered active billing approved by CFO",
            current_value=f"{int(round(expanded_seats * 0.72))} billable active users ready",
            met=e.verdict == "EXPAND",
        ),
    ]
    p3_exit_met = e.verdict == "EXPAND"

    current_phase_label = (
        "Phase 1: Activation (Days 0–30)" if days <= 30
        else ("Phase 2: Habit (Days 31–60)" if days <= 60
              else "Phase 3: Business Value (Days 61–90)")
    )

    phases = [
        AdoptionPhaseMilestone(
            phase="Phase 1: Activation",
            day_range="Days 0–30",
            status=p1_status,
            objectives=p1_objectives,
            exit_gate="Activation SLA Gate (>=70% activated, secure VPC live, first value)",
            exit_gate_met=p1_exit_met,
        ),
        AdoptionPhaseMilestone(
            phase="Phase 2: Habit",
            day_range="Days 31–60",
            status=p2_status,
            objectives=p2_objectives,
            exit_gate="Habit Formation Gate (60% WAU 4wks, 75% completion, 70% retention)",
            exit_gate_met=p2_exit_met,
        ),
        AdoptionPhaseMilestone(
            phase="Phase 3: Business Value",
            day_range="Days 61–90",
            status=p3_status,
            objectives=p3_objectives,
            exit_gate="Business Value & Expansion Gate (>=20% time saved, >=2.0x ROI)",
            exit_gate_met=p3_exit_met,
        ),
    ]

    remeasure_stage = (
        "INTERVENTION_RE_MEASUREMENT" if health_resp.intervention_required
        else ("EXPANSION_CLEARANCE" if e.verdict == "EXPAND" else "HABIT_MONITORING")
    )

    return AdoptionWorkstream(
        account_id=account.id,
        account_name=account.name,
        pilot_days_elapsed=account.pilot_days_elapsed,
        current_phase=current_phase_label,
        phases=phases,
        day_60_assessment=stall,
        root_cause=cause,
        remeasurement_stage=remeasure_stage,
        stakeholders=account.stakeholders,
    )

@app.get("/api/adoption-workstream/{account_id}", response_model=AdoptionWorkstream)
def get_account_adoption_workstream(account_id: str):
    acct = db.get_by_id(account_id)
    if not acct:
        raise HTTPException(status_code=404, detail="Account not found")
    return build_adoption_workstream(acct)


# Tamper-Evident SHA-256 Audit Trail Endpoints
@app.get("/api/audit/events", response_model=List[AuditEvent])
def get_audit_trail_events(limit: int = 50):
    return audit_ledger.get_events(limit=limit)


@app.post("/api/audit/verify", response_model=AuditChainVerificationResponse)
def verify_audit_trail_chain():
    return audit_ledger.verify_audit_chain()


@app.post("/api/audit/tamper-demo")
def simulate_audit_chain_tamper(sequence_number: int = 2):
    return audit_ledger.simulate_tamper_for_demo(sequence_number=sequence_number)


@app.post("/api/audit/reset")
def reset_audit_trail():
    audit_ledger.reset_chain()
    return {"status": "reset", "message": "Audit ledger restored to verifiable genesis state"}


@app.get("/api/model-assumptions")
def get_model_assumptions():
    return {
        "seat_billing_rule": "Billable Active Users = floor(expanded_seats * actual_wau_rate). Zero shelfware billing.",
        "pilot_deposit": "$12,000 upfront deposit, Contractually refundable if 6 verifiable value criteria fail",
        "time_to_full_price_modes": [
            {"days": 30, "description": "1 month pilot, full pricing begins Month 2"},
            {"days": 60, "description": "2 month pilot, full pricing begins Month 3 (Default)"},
            {"days": 90, "description": "3 month pilot, full pricing begins Month 4"},
        ],
        "ai_inference_cost": "$0.0080 per execution via Groq LLaMA 3.3 70B",
        "nrr_definition": "Projected NRR Proxy: Cohort-level expansion and churn model. Excludes new logo revenue.",
        "benchmark_data": "NorthBridge Copilot: $60/seat on total provisioned seats under illustrative industry assumption — 33% utilization.",
    }


@app.post("/api/groq/adoption-doctor/{account_id}", response_model=AdoptionDoctorResponse)
async def diagnose_account(account_id: str):
    acct = db.get_by_id(account_id)
    if not acct:
        raise HTTPException(status_code=404, detail="Account not found")

    health_resp = evaluate_account_health(acct)
    diagnosis = await call_groq_adoption_doctor(acct.model_dump(), health_resp)
    return diagnosis


@app.post("/api/pricing/simulate", response_model=PricingSimulationOutput)
def simulate_pricing(params: PricingSimulationInput):
    """
    Pure deterministic pricing engine calculation.
    Formula: active_billable_users = floor(expanded_seats * actual_wau_rate).
    """
    return run_pricing_simulation(params, synthetic_accounts=db.get_all())


@app.post("/api/groq/pricing-strategist", response_model=PricingStrategistResponse)
async def explain_pricing_tradeoffs(output: PricingSimulationOutput):
    """
    Groq call that explains financial tradeoffs based strictly on computed pricing model.
    """
    return await call_groq_pricing_strategist(output)


@app.get("/api/trust/fact-base", response_model=List[TrustFactItem])
def get_trust_fact_base():
    return get_fact_base()


@app.post("/api/groq/trust-copilot", response_model=TrustCopilotResponse)
async def handle_trust_objection(req: ObjectionQueryRequest):
    """
    Groq call (or deterministic fallback) that answers security/trust objections
    strictly grounded in the closed Trust Fact Base using Claim Guard validation.
    """
    return await call_groq_trust_copilot(req.question)


@app.get("/api/wedge-comparison")
def get_wedge_comparison():
    return {
        "matrix": WEDGE_COMPARISON_MATRIX,
        "three_layer_moat": THREE_LAYER_MOAT,
    }


@app.get("/api/competitor-teardowns")
def get_competitor_teardowns():
    return COMPETITOR_PRICING_TEARDOWNS


@app.get("/api/adversarial-curveballs")
def get_adversarial_curveballs():
    return ADVERSARIAL_CURVEBALL_REHEARSALS


@app.get("/api/buyer-objections")
def get_buyer_objections():
    return BUYER_OBJECTIONS



@app.get("/api/research/full-suite", response_model=GTMResearchSuiteResponse)
def get_research_full_suite():
    return {
        "gtm_intelligence": GTM_RESEARCH_INTELLIGENCE,
        "adoption_gap_matrix": ADOPTION_GAP_MATRIX,
        "pricing_benchmark": PRICING_BENCHMARK_TEARDOWN,
        "synthesis": SOLVANT_STRATEGIC_SYNTHESIS,
    }


@app.get("/api/research/gtm-intelligence")
def get_gtm_intelligence():
    return GTM_RESEARCH_INTELLIGENCE


@app.get("/api/research/adoption-gap-matrix")
def get_adoption_gap_matrix():
    return ADOPTION_GAP_MATRIX


@app.get("/api/research/pricing-benchmark")
def get_pricing_benchmark():
    return PRICING_BENCHMARK_TEARDOWN


@app.get("/api/research/solvant-synthesis")
def get_solvant_synthesis():
    return SOLVANT_STRATEGIC_SYNTHESIS


@app.get("/api/gtm-architecture")
def get_gtm_architecture_data():
    return {
        "connected_stages": GTM_CONNECTED_STAGES,
        "prohibited_actions": PROHIBITED_OSTRAVA_ACTIONS,
        "defense_pillars": SOLVANT_EIGHT_PILLAR_RESPONSE,
        "contingency_stages": CONTINGENCY_ONE_PAGER_STAGES,
    }


@app.post("/api/gtm-architecture/ostrava-decision", response_model=OstravaDecisionResponse)
def run_ostrava_decision(req: OstravaDecisionRequest):
    return evaluate_ostrava_decision(
        materially_differentiated=req.materially_differentiated,
        alternative_pain_available=req.alternative_pain_available,
    )

# Static files mount and SPA catch-all for unified production deployment
dist_candidates = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "dist")),
]
dist_dir = next((d for d in dist_candidates if os.path.exists(d)), None)

if dist_dir:
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    if full_path.startswith("api"):
        raise HTTPException(status_code=404, detail="API route not found")
    if dist_dir:
        index_file = os.path.join(dist_dir, "index.html")
        direct_file = os.path.join(dist_dir, full_path)
        if full_path and os.path.isfile(direct_file):
            return FileResponse(direct_file)
        if os.path.exists(index_file):
            return FileResponse(index_file)
    return {"message": "Solvant API running. Build frontend with 'npm run build' to view full UI."}
