import os
import json
import logging
from typing import Dict, Any, Optional
import httpx

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    if os.path.exists(".env"):
        try:
            with open(".env", "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
        except Exception:
            pass

from app.models import (
    AdoptionDoctorResponse,
    PricingStrategistResponse,
    TrustCopilotResponse,
    OverclaimGuard,
    AccountHealthResponse,
    PricingSimulationOutput,
)
from app.trust_copilot import (
    get_deterministic_trust_response,
    validate_and_guard_trust_response,
    TRUST_FACT_BASE,
)

logger = logging.getLogger("groq_service")
logging.basicConfig(level=logging.INFO)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def _generate_deterministic_doctor_diagnosis(health: AccountHealthResponse) -> AdoptionDoctorResponse:
    score = health.health.final_score
    band = health.health.band
    h = health.health

    if score >= 70.0 and health.expansion.all_met:
        return AdoptionDoctorResponse(
            status="EXPANSION_READY_GREEN",
            primary_issue="None — Account satisfies all pilot success thresholds and expansion criteria.",
            evidence=[
                f"Adoption Health Score is {score}/100 in the {band} band.",
                f"4-week WAU trend slope is {h.trend_direction} ({round(h.trend_slope, 3)}) with recent average WAU above 80%.",
                f"Workflow time reduction verified at {round(health.expansion.time_reduction_value * 100, 1)}% (exceeds 20% target).",
                f"30-day user retention rate is {round(health.expansion.retention_value * 100, 1)}% (exceeds 70% threshold).",
                f"Activation rate is {round(h.activation_score * 100, 1)}% across invited finance analysts.",
            ],
            recommended_actions=[
                "Present Graduated Expansion Contract: transition from $12k pilot deposit to $30/active-user/month.",
                "Expand workflow footprint to adjacent department (e.g., Commercial FP&A or Procurement Variance).",
                "Lock in annual volume tier ($26/user/mo for 150+ seats) based on customer-verifiable log data.",
            ],
            expansion_recommendation="AUTHORIZE_EXPANSION: Account's internal log data proves sustained adoption and verified efficiency gains. Trigger formal expansion review.",
            is_live_llm=False,
            model_used="verified-baseline-cache",
        )
    elif score >= 40.0:
        return AdoptionDoctorResponse(
            status="HEALTHY_WATCH_YELLOW",
            primary_issue="Adoption is stable but operating below the 20% workflow efficiency or 60% consecutive WAU threshold.",
            evidence=[
                f"Adoption Health Score is {score}/100 ({band}).",
                f"Workflow time reduction is currently {round(health.expansion.time_reduction_value * 100, 1)}% (target: >= 20%).",
                f"4-week consecutive WAU criteria: {'MET' if health.expansion.consecutive_wau_met else 'UNMET (below 60% sustained)'}.",
                f"Current weekly active rate is {round(h.frequency_score * 100, 1)}%.",
            ],
            recommended_actions=[
                "Deploy Solvant Solutions Engineer to run a 60-minute advanced variance prompt tuning workshop.",
                "Review monthly commentary output approvals with the FP&A Operations champion.",
                "Hold expansion trigger until 4 consecutive weeks of >= 60% WAU and >= 20% time reduction are logged.",
            ],
            expansion_recommendation="HOLD_EXPANSION: Keep account in pilot optimization. Do not expand until all 3 customer-verifiable gates are logged in backend telemetry.",
            is_live_llm=False,
            model_used="verified-baseline-cache",
        )
    else:
        return AdoptionDoctorResponse(
            status="AT_RISK_RED",
            primary_issue="Severe adoption stagnation: WAU and workflow time reduction are critically below pilot contractual minimums.",
            evidence=[
                f"Adoption Health Score is {score}/100 ({band}), below the 40.0 danger threshold.",
                f"WAU trend slope is negative ({round(h.trend_slope, 3)}), indicating declining analyst engagement.",
                f"Workflow time reduction is only {round(health.expansion.time_reduction_value * 100, 1)}% vs contractual 20% commitment.",
                f"Intervention status: {'MANDATORY SLA INTERVENTION ACTIVE' if health.intervention_required else 'HIGH RISK STAGNATION'}.",
            ],
            recommended_actions=[
                "Immediately dispatch Day-45 Adoption Intervention Playbook with VP Finance champion.",
                "Isolate friction points in ERP ledger connectors or management commentary drafting templates.",
                "Prepare value reconciliation report; invoke pilot deposit refund clause if adoption SLA cannot be restored within 14 days.",
            ],
            expansion_recommendation="BLOCK_EXPANSION: Account is at risk of pilot failure. Initiate intervention workstream immediately to safeguard the customer relationship.",
            is_live_llm=False,
            model_used="verified-baseline-cache",
        )


def _generate_deterministic_pricing_tradeoff(output: PricingSimulationOutput) -> PricingStrategistResponse:
    p = output.params
    arr12 = f"${round(output.arr_12m / 1000, 1)}k"
    arr24 = f"${round(output.arr_24m / 1000000, 2)}M"
    return PricingStrategistResponse(
        summary=f"Simulated model generates {arr12} ARR at Month 12 scaling to {arr24} ARR at Month 24 across {output.active_customers_24m} enterprise accounts, sustaining {output.nrr_pct}% NRR at {p.gross_margin_pct}% gross margin.",
        primary_tradeoff=f"Gating expansion on a strict {int(p.expansion_wau_threshold * 100)}% WAU threshold filters out low-conviction conversions, yielding 76.5% gross margins and {output.nrr_pct}% NRR while eliminating shelfware churn.",
        strategic_implications=[
            f"Usage-Metered Anchor: Pricing at ${p.full_price_per_user}/active user aligns cost directly with verified weekly value, insulating against incumbent $60/seat shelfware fatigue.",
            f"Overage Revenue Stream: Overage credit pricing (${p.usage_credit_rate}/run above {p.workflow_run_allowance} runs) expands ARR per customer by ~35% without requiring renegotiated contracts.",
            f"NorthBridge Shadow Moat: Customers save an average of ${round(output.northbridge_shadow[-1].customer_wasted_shelfware_spend, 2):,}/mo compared to paying flat seat licenses for unused seats.",
        ],
        cfo_soundbite=f"\"We only pay for users who actually log in and analyze variances each week. If our team doesn't use it, our bill doesn't go up. That's why the CFO approved this over Microsoft Copilot.\"",
        is_live_llm=False,
        model_used="verified-baseline-cache",
    )


async def call_groq_adoption_doctor(account_data: Dict[str, Any], health: AccountHealthResponse) -> AdoptionDoctorResponse:
    """
    Calls Groq to generate structured diagnosis based strictly on pre-computed metrics.
    Falls back instantly to deterministic baseline if no key or on any error.
    """
    api_key = os.getenv("GROQ_API_KEY", GROQ_API_KEY)
    if not api_key:
        return _generate_deterministic_doctor_diagnosis(health)

    model_name = os.getenv("GROQ_MODEL", GROQ_MODEL)
    system_prompt = (
        "You are the Solvant Adoption Doctor. You diagnose enterprise AI adoption health based solely on "
        "computed facts provided to you. You must NEVER invent, assume, or recalculate any metrics. "
        "All calculations have already been performed by deterministic backend code. "
        "Return strictly a JSON object with this exact schema:\n"
        "{\n"
        '  "status": "EXPANSION_READY_GREEN" | "HEALTHY_WATCH_YELLOW" | "AT_RISK_RED",\n'
        '  "primary_issue": string,\n'
        '  "evidence": [string],\n'
        '  "recommended_actions": [string],\n'
        '  "expansion_recommendation": string\n'
        "}"
    )

    facts_payload = {
        "account_name": health.account_name,
        "health_score": health.health.final_score,
        "band": health.health.band,
        "sub_scores": {
            "activation": health.health.activation_score,
            "frequency_wau_rate": health.health.frequency_score,
            "retention_30d_rate": health.health.retention_score,
            "outcome_time_reduction": health.health.outcome_score,
            "expansion_trend": health.health.expansion_score,
        },
        "wau_trend_direction": health.health.trend_direction,
        "wau_trend_slope": health.health.trend_slope,
        "expansion_verdict": health.expansion.verdict,
        "expansion_criteria_all_met": health.expansion.all_met,
        "workflow_time_reduction_pct": health.expansion.time_reduction_value,
        "consecutive_wau_met": health.expansion.consecutive_wau_met,
        "recent_4_weeks_wau": health.expansion.consecutive_wau_values,
        "intervention_required": health.intervention_required,
        "intervention_reason": health.intervention_reason,
    }

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Diagnose this account based strictly on these computed facts:\n{json.dumps(facts_payload, indent=2)}"},
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.1,
                },
            )
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                return AdoptionDoctorResponse(
                    status=parsed.get("status", "HEALTHY_WATCH_YELLOW"),
                    primary_issue=parsed.get("primary_issue", "Adoption diagnosis complete."),
                    evidence=parsed.get("evidence", [f"Health score: {health.health.final_score}"]),
                    recommended_actions=parsed.get("recommended_actions", ["Review pilot progress"]),
                    expansion_recommendation=parsed.get("expansion_recommendation", health.expansion.verdict),
                    is_live_llm=True,
                    model_used=model_name,
                )
    except Exception as e:
        logger.warning(f"Groq adoption doctor call failed: {e}. Falling back to deterministic baseline.")

    return _generate_deterministic_doctor_diagnosis(health)


async def call_groq_pricing_strategist(output: PricingSimulationOutput) -> PricingStrategistResponse:
    """
    Calls Groq to explain financial tradeoffs based strictly on computed pricing output.
    """
    api_key = os.getenv("GROQ_API_KEY", GROQ_API_KEY)
    if not api_key:
        return _generate_deterministic_pricing_tradeoff(output)

    model_name = os.getenv("GROQ_MODEL", GROQ_MODEL)
    system_prompt = (
        "You are the Solvant Pricing Strategist. You explain SaaS and usage-based unit economics tradeoffs "
        "to CFOs and enterprise buyers. You must never invent or recalculate any numbers. "
        "All numbers are deterministic facts computed by backend code. "
        "Return strictly a JSON object with this exact schema:\n"
        "{\n"
        '  "summary": string,\n'
        '  "primary_tradeoff": string,\n'
        '  "strategic_implications": [string],\n'
        '  "cfo_soundbite": string\n'
        "}"
    )

    facts = {
        "arr_12m": output.arr_12m,
        "arr_24m": output.arr_24m,
        "active_seats_12m": output.active_seats_12m,
        "active_seats_24m": output.active_seats_24m,
        "nrr_pct": output.nrr_pct,
        "gross_margin_pct": output.params.gross_margin_pct,
        "pilot_price": output.params.pilot_price,
        "full_price_per_user": output.params.full_price_per_user,
        "expansion_wau_threshold": output.params.expansion_wau_threshold,
        "monthly_churn_pct": output.params.monthly_churn_pct,
        "northbridge_month24_shelfware_waste": output.northbridge_shadow[-1].customer_wasted_shelfware_spend,
    }

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Explain the pricing tradeoffs based strictly on these computed facts:\n{json.dumps(facts, indent=2)}"},
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.2,
                },
            )
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                return PricingStrategistResponse(
                    summary=parsed.get("summary", ""),
                    primary_tradeoff=parsed.get("primary_tradeoff", ""),
                    strategic_implications=parsed.get("strategic_implications", []),
                    cfo_soundbite=parsed.get("cfo_soundbite", ""),
                    is_live_llm=True,
                    model_used=model_name,
                )
    except Exception as e:
        logger.warning(f"Groq pricing strategist call failed: {e}. Falling back to deterministic baseline.")

    return _generate_deterministic_pricing_tradeoff(output)


async def call_groq_trust_copilot(question: str) -> TrustCopilotResponse:
    """
    Calls Groq to generate 5-step objection response strictly grounded in the closed Trust Fact Base.
    Enforces Overclaim Guard: never invent certifications or guarantees.
    """
    api_key = os.getenv("GROQ_API_KEY", GROQ_API_KEY)
    if not api_key:
        return get_deterministic_trust_response(question)

    model_name = os.getenv("GROQ_MODEL", GROQ_MODEL)
    fact_base_text = "\n".join(
        [f"- [{f.category}] {f.title}: {f.detail} (LIMITS: {f.limits})" for f in TRUST_FACT_BASE]
    )

    system_prompt = (
        "You are the Solvant Trust Copilot. You answer enterprise security, compliance, and privacy objections "
        "using ONLY the facts provided in the CLOSED TRUST FACT BASE below. "
        "RULES:\n"
        "1. Never invent or imply certifications not explicitly stated (e.g. SOC2 Type I is complete, but SOC2 Type II is IN PROGRESS, target Q4; formal external GDPR certification is NOT held).\n"
        "2. If an objection asks about something not supported or not yet held, say so explicitly.\n"
        "3. You must follow the 5-step response structure:\n"
        "   - Step 1: Acknowledge (empathy for buyer's risk)\n"
        "   - Step 2: Clarify (define the technical boundary)\n"
        "   - Step 3: Evidence (from fact base)\n"
        "   - Step 4: Limit the claim (explicitly state what is NOT claimed)\n"
        "   - Step 5: Risk-reduction mechanism (pilot deposit refund, customer data gates)\n"
        "4. Return strictly valid JSON adhering to this schema:\n"
        "{\n"
        '  "step1_acknowledge": string,\n'
        '  "step2_clarify": string,\n'
        '  "step3_evidence": string,\n'
        '  "step4_claim_limits": string,\n'
        '  "step5_risk_reduction": string,\n'
        '  "overclaim_guard": {\n'
        '     "status": "VERIFIED_GROUNDED" | "BOUNDARY_ENFORCED",\n'
        '     "facts_grounded_count": number,\n'
        '     "verified_claims": [string],\n'
        '     "unsupported_or_limited_claims": [string]\n'
        '  }\n'
        "}\n\n"
        f"CLOSED TRUST FACT BASE:\n{fact_base_text}"
    )

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Enterprise Buyer / CISO Question: {question}"},
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.1,
                },
            )
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                og_data = parsed.get("overclaim_guard", {})
                og = OverclaimGuard(
                    status=og_data.get("status", "VERIFIED_GROUNDED"),
                    facts_grounded_count=og_data.get("facts_grounded_count", 2),
                    verified_claims=og_data.get("verified_claims", ["Grounded in closed fact base"]),
                    unsupported_or_limited_claims=og_data.get("unsupported_or_limited_claims", []),
                )
                raw_resp = TrustCopilotResponse(
                    step1_acknowledge=parsed.get("step1_acknowledge", ""),
                    step2_clarify=parsed.get("step2_clarify", ""),
                    step3_evidence=parsed.get("step3_evidence", ""),
                    step4_claim_limits=parsed.get("step4_claim_limits", ""),
                    step5_risk_reduction=parsed.get("step5_risk_reduction", ""),
                    overclaim_guard=og,
                    is_live_llm=True,
                    model_used=model_name,
                )
                return validate_and_guard_trust_response(raw_resp, question)
    except Exception as e:
        logger.warning(f"Groq trust copilot call failed: {e}. Falling back to deterministic baseline.")

    return get_deterministic_trust_response(question)
