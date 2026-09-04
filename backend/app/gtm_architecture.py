from typing import List, Dict, Any
from app.models import OstravaDecisionResponse


# ==============================================================================
# PART A: ONE-PAGE GTM ARCHITECTURE (9 Connected Stages)
# ==============================================================================
GTM_CONNECTED_STAGES: List[Dict[str, Any]] = [
    {
        "stage_number": 1,
        "id": "wedge",
        "title": "Narrow Workflow Wedge",
        "subtitle": "Single High-Visibility Workflow",
        "summary": "FP&A Variance Analysis & Management Reporting. Targeted at VP Finance & CFO.",
        "key_mechanics": [
            "Single buying team: FP&A Operations and VP Finance",
            "Limited initial footprint: 50 financial analysts",
            "Proven in weeks: 30-day monthly close heartbeat provides rapid empirical proof cycles rather than quarterly lag",
            "Target outcome: 28% measured hours saved with human-in-the-loop analyst verification",
        ],
        "why_it_works": "Repetitive monthly close cadence creates immediate habit formation; zero multi-system automation risk.",
    },
    {
        "stage_number": 2,
        "id": "land",
        "title": "Paid Pilot Contract",
        "subtitle": "Low-Risk Procurement Land",
        "summary": "50 users • 60–90 days • $12,000 deposit escrowed against 6 objective value criteria.",
        "key_mechanics": [
            "Zero procurement red tape: standard security addendum + SOC2 Type I audit package",
            "Defined baseline: historical hours spent per variance report locked on Day 1",
            "Contractually refundable deposit: if customer logs fail 6 objective thresholds, deposit refunded within 10 days",
        ],
        "why_it_works": "Aligns financial risk with Solvant; CFO can approve without multi-year budget lock-in.",
    },
    {
        "stage_number": 3,
        "id": "pricing",
        "title": "Active-Usage Pricing",
        "subtitle": "Zero-Shelfware Alignment",
        "summary": "$30 / active billable user / month (metered on WAU) + $0.40 / run usage credit buffer.",
        "key_mechanics": [
            "Formula: Billable Active Users = floor(expanded_seats * actual_wau_rate)",
            "Customer does not pay for inactive seats: saves $241k/yr compared to flat $60/seat incumbent tax",
            "Predictable economics: 76.5% gross margin with AI compute costs capped at $0.008/run",
        ],
        "why_it_works": "Completely eliminates customer shelfware anxiety while guaranteeing healthy software unit economics.",
    },
    {
        "stage_number": 4,
        "id": "adoption",
        "title": "30/60/90 Adoption Engine",
        "subtitle": "Licensing is Not Adoption",
        "summary": "Programmatic milestone tracking across Activation (0–30), Habit (31–60), and Value (61–90).",
        "key_mechanics": [
            "Day-45 SLA Trigger: automatic stall detection if WAU decays >15%",
            "Day-60 Stall Diagnostic: classified as HEALTHY, AT RISK, or STALLED",
            "Intervention Engine: 8 root-cause playbooks dispatched to Forward Deployed Engineers within 48 hours",
        ],
        "why_it_works": "Ensures purchased software becomes a daily analyst habit rather than abandoned shelfware.",
    },
    {
        "stage_number": 5,
        "id": "outcome",
        "title": "Customer-Verified Outcome",
        "subtitle": "Zero Vendor Self-Reporting",
        "summary": "Evaluated strictly from customer's own immutable telemetry logs stored in their VPC.",
        "key_mechanics": [
            "Quantified time reduction: computed from task start timestamp to verified analyst sign-off",
            "Variance commentary accuracy: verified against general ledger source citations",
            "Analyst satisfaction: 4.6 / 5.0 verified CSAT across monthly reporting cycles",
        ],
        "why_it_works": "No marketing fluff; the customer's own data advocates for renewal and expansion.",
    },
    {
        "stage_number": 6,
        "id": "expansion_trigger",
        "title": "Expansion Trigger Gates",
        "subtitle": "Deterministic Contractual Lock",
        "summary": "Expansion is legally blocked unless all 5 customer telemetry thresholds pass simultaneously.",
        "key_mechanics": [
            "Gate 1: WAU ≥ 60% sustained for 4 consecutive weeks",
            "Gate 2: Workflow time reduction ≥ 20% (achieving 28%)",
            "Gate 3: Business ROI multiplier ≥ 2.0x (achieving 3.2x)",
            "Gate 4: Workflow completion rate ≥ 75% (achieving 90%)",
            "Gate 5: 30-day user retention ≥ 70% (achieving 84%)",
        ],
        "why_it_works": "Expansion is earned through mathematical proof, eliminating renewal friction.",
    },
    {
        "stage_number": 7,
        "id": "monetization",
        "title": "Usage Monetization & Scale",
        "subtitle": "138% Cohort NRR",
        "summary": "Graduated expansion from 50 to ~175 seats with predictable multi-year net revenue retention.",
        "key_mechanics": [
            "Pure cohort-based NRR: 138% (excluding new logos)",
            "Predictable expansion: accounts expand 3.5x after proving value in the primary wedge",
            "Graceful churn control: annualized churn capped under 5% through continuous health monitoring",
        ],
        "why_it_works": "High customer lifetime value driven by verified adoption rather than coerced multi-year lock-in.",
    },
    {
        "stage_number": 8,
        "id": "trust",
        "title": "Trust & Sovereignty",
        "subtitle": "Closed Fact Base & Claim Guard",
        "summary": "CFO-friendly sovereign boundary: regional VPC tenancy, zero model training, and open-format exports.",
        "key_mechanics": [
            "Data Residency: customer-selected cloud boundary (AWS us-east-1, EU Frankfurt) with BYOK encryption",
            "Model Training: commercial Zero Data Retention (ZDR) addendum; customer data not used to train public models",
            "Vendor Lock-in: 1-click open JSON/CSV exports testable on Day 1 of the pilot",
            "Honest Posture: SOC2 Type I complete, SOC2 Type II in active observation (target Q4)",
        ],
        "why_it_works": "CISO and CFO objections neutralized with contractual guarantees and verifiable architecture.",
    },
    {
        "stage_number": 9,
        "id": "defensibility",
        "title": "Compounding Moat",
        "subtitle": "Immunity to Free Bundled Clones",
        "summary": "3-Layer Moat built during the pilot that prevents customer switching even if incumbents bundle for free.",
        "key_mechanics": [
            "Layer 1: Workflow-Specific Configuration (deep ledger taxonomy and custom ERP formulas)",
            "Layer 2: Adoption-Intervention History (granular change management and analyst training logs)",
            "Layer 3: Outcome-Verified Data Trail (500+ verified monthly commentary outputs with SHA-256 audit hashes)",
        ],
        "why_it_works": "Free software is worthless if it doesn't do the work. Removing Solvant breaks the monthly close pipeline.",
    },
]

# ==============================================================================
# PART B & C: OSTRAVA RESPONSE & DETERMINISTIC DECISION ENGINE
# ==============================================================================
PROHIBITED_OSTRAVA_ACTIONS: List[str] = [
    "Do NOT match free pricing (burns venture capital, validates commodity race to bottom)",
    "Do NOT engage in endless discounting (destroys gross margins and software pricing integrity)",
    "Do NOT enter a superficial feature war (incumbents can ship surface-level UI widgets faster)",
    "Do NOT claim 'better AI' alone (subjective model claims convince no enterprise CFO)",
]

SOLVANT_EIGHT_PILLAR_RESPONSE: List[Dict[str, str]] = [
    {"pillar": "1. Defend the Workflow", "description": "Anchor in deep ledger taxonomy mappings and analyst daily routines tuned over the 60-day pilot."},
    {"pillar": "2. Prove Measurable ROI", "description": "Present CFO with verified 28% hours saved ledger vs unmeasured free bundled seats with 33% WAU."},
    {"pillar": "3. Use Customer-Owned Evidence", "description": "Let the customer's own internal audit logs and analyst sign-offs advocate for Solvant."},
    {"pillar": "4. Strengthen Adoption", "description": "Deploy Forward Deployed Engineers to coach analysts and maintain >80% weekly active usage."},
    {"pillar": "5. Expand to Adjacent Workflows", "description": "Accelerate Graduated Expansion #1 into Procurement Contract Review & Vendor Deviation ($26/seat)."},
    {"pillar": "6. Increase Workflow Depth", "description": "Add multi-entity FX adjustments, scenario sensitivity models, and automated ERP reconciliation."},
    {"pillar": "7. Preserve Portability", "description": "Remind CFO of open JSON/CSV export capability; zero proprietary black-box encapsulation."},
    {"pillar": "8. Move Where Bundling is Weakest", "description": "Target cross-platform data environments (SAP, Oracle NetSuite, Workday) where incumbent bundling fails."},
]

CONTINGENCY_ONE_PAGER_STAGES: List[Dict[str, str]] = [
    {"stage": "Immediate", "action": "Protect existing pilot and customer champions with high-touch FDE support."},
    {"stage": "Then", "action": "Prove outcome: publish customer-verified time reduction and ROI report to CFO."},
    {"stage": "Then", "action": "Increase workflow depth: configure proprietary ERP reconciliation rules and custom driver formulas."},
    {"stage": "Then", "action": "Expand to adjacent workflows: cross-sell Procurement Ops and Management Reporting."},
    {"stage": "Then", "action": "Use outcome history as differentiation: 12 months of immutable audit trails that no new tool possesses."},
]


def evaluate_ostrava_decision(materially_differentiated: bool = True, alternative_pain_available: bool = True) -> OstravaDecisionResponse:
    """
    Deterministic Decision Engine for Incumbent Copycat Scenario:
    Incumbent copies feature
    ↓
    Is Solvant's verified outcome materially differentiated?
    ↓
    YES → DEFEND + EXPAND
    NO
    ↓
    Is another workflow with stronger measurable pain available?
    ↓
    YES → MOVE WEDGE
    NO  → STOP / REASSESS
    """
    if materially_differentiated:
        return OstravaDecisionResponse(
            verdict="DEFEND_AND_EXPAND",
            headline="Material Outcome Differentiation Confirmed: Defend Core Workflow & Expand into Adjacent Units",
            action_plan=[
                "Present CFO with telemetry-verified 28% hours saved vs unmeasured free bundled seats.",
                "Deepen ERP taxonomy configuration and custom financial formulas (Moat Layer 1).",
                "Trigger Graduated Expansion #1 into Procurement Contract Review ($26/seat/mo).",
                "Lock in annual agreement based on verified 138% cohort NRR performance.",
            ],
            defense_pillars=[p["pillar"] + ": " + p["description"] for p in SOLVANT_EIGHT_PILLAR_RESPONSE[:4]],
            prohibited_actions=PROHIBITED_OSTRAVA_ACTIONS,
            contingency_stage="DEFENSE_ACTIVE_AND_EXPANDING",
            core_message="Features can be copied. Verified adoption and customer-specific outcome history compound.",
        )
    else:
        if alternative_pain_available:
            return OstravaDecisionResponse(
                verdict="MOVE_WEDGE",
                headline="Incumbent Parity Reached: Pivot Primary Wedge to High-Pain Procurement Ops",
                action_plan=[
                    "Gracefully transition FP&A workflow to maintenance mode without discounting.",
                    "Pivot primary land motion to Procurement Contract Review & Vendor Deviation (higher dollar leverage).",
                    "Deploy pre-built SaaS contract audit connectors for Head of Strategic Sourcing.",
                    "Establish new 60-day proof pilot where incumbent bundling does not exist.",
                ],
                defense_pillars=[p["pillar"] + ": " + p["description"] for p in SOLVANT_EIGHT_PILLAR_RESPONSE[4:]],
                prohibited_actions=PROHIBITED_OSTRAVA_ACTIONS,
                contingency_stage="WEDGE_PIVOTED",
                core_message="When an incumbent commoditizes a feature, a nimble challenger pivots to the next unbundled high-pain operational wedge.",
            )
        else:
            return OstravaDecisionResponse(
                verdict="STOP_AND_REASSESS",
                headline="No Differentiated Workflow Wedge: Gracefully Halt Commercial Scale & Conserve Capital",
                action_plan=[
                    "Refund customer pilot deposits in full per our contractual guarantee.",
                    "Export all customer commentary and audit logs in open standard JSON/CSV.",
                    "Halt enterprise outbound GTM spend to preserve venture runway.",
                    "Convene strategic advisory board to architect new proprietary wedge with uncopyable data moats.",
                ],
                defense_pillars=["Preserve customer trust and capital integrity over forced commercial renewal."],
                prohibited_actions=PROHIBITED_OSTRAVA_ACTIONS,
                contingency_stage="GRACEFUL_HALT",
                core_message="A disciplined GTM engine knows when to stop rather than burning capital in an unwinnable commodity war.",
            )
