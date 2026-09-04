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

# Enable CORS for local Next.js/Vite frontend development
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
        "engine": "Solvant Proof-to-Scale GTM & Pricing Core v1.0",
        "golden_rule": "Code calculates. Groq explains, diagnoses, and communicates.",
        "fallback_guarantee": "Zero-latency deterministic cache active on rate limit or missing key.",
    }


@app.post("/api/config/groq-key")
def configure_groq_key(req: GroqKeyRequest):
    if req.groq_api_key.strip():
        os.environ["GROQ_API_KEY"] = req.groq_api_key.strip()
    if req.groq_model and req.groq_model.strip():
        os.environ["GROQ_MODEL"] = req.groq_model.strip()
    return {
        "success": True,
        "has_groq_api_key": bool(os.getenv("GROQ_API_KEY")),
        "groq_model": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
    }


@app.get("/api/portfolio")
def get_portfolio_summary(expansion_wau_threshold: float = 0.60):
    accounts = db.get_all()
    evaluated = [evaluate_account_health(acct, expansion_wau_threshold=expansion_wau_threshold) for acct in accounts]

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
    }


@app.post("/api/accounts/{account_id}/simulate")
def simulate_account_changes(account_id: str, req: SimulationUpdateRequest):
    """
    Live interactive simulation: updates WAU or other metrics live,
    recalculating health score and expansion verdict dynamically.
    """
    updated_acct = db.update_account_simulation(
        account_id=account_id,
        simulated_wau_pct=req.simulated_wau_pct,
        simulated_time_reduction_pct=req.simulated_time_reduction_pct,
        simulated_retention_pct=req.simulated_retention_pct,
        isolate_wau_effect=bool(req.isolate_wau_effect),
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
    Computes 12m & 24m ARR, seats, gross profit (76.5%), NRR, and NorthBridge Shadow series.
    Formula: active_billable_users = expanded_seats * actual_wau_rate.
    """
    return run_pricing_simulation(params, synthetic_accounts=db.get_all())


@app.post("/api/groq/pricing-strategist", response_model=PricingStrategistResponse)
async def explain_pricing_tradeoffs(output: PricingSimulationOutput):
    """
    Groq call that explains WHY metrics shifted based strictly on the computed pricing model.
    """
    return await call_groq_pricing_strategist(output)


@app.get("/api/trust/fact-base", response_model=List[TrustFactItem])
def get_trust_fact_base():
    return get_fact_base()


@app.post("/api/groq/trust-copilot", response_model=TrustCopilotResponse)
async def handle_trust_objection(req: ObjectionQueryRequest):
    """
    Groq call (or deterministic fallback) that answers security/trust objections
    strictly grounded in the closed Trust Fact Base using the 5-step structure.
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
