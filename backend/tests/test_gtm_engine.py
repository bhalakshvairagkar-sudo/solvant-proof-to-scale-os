import pytest
from app.gtm_engine import compute_health_score, calculate_wau_trend_slope, evaluate_expansion_criteria
from app.models import Account
from app.gtm_engine import evaluate_account_health


def test_health_score_weights_and_exact_math():
    # Scenario: Perfect 1.0 across all 5 dimensions
    # activation: 50/50 = 1.0 (* 0.25)
    # frequency: 45/45 = 1.0 (* 0.25)
    # retention: 45/45 = 1.0 (* 0.20)
    # outcome: 0.20 / 0.20 = 1.0 (* 0.20)
    # expansion: positive trend = 1.0 (* 0.10)
    # sum = 1.00 -> final_score = 100.0
    res = compute_health_score(
        invited_users=50,
        activated_users=45,
        weekly_active_users=45,
        retained_30d_users=45,
        workflow_time_reduction_pct=0.20,
        weekly_wau_history=[0.60, 0.70, 0.80, 0.90],  # strongly positive
    )
    assert res.activation_score == 0.9  # 45/50
    assert res.frequency_score == 1.0   # 45/45
    assert res.retention_score == 1.0   # 45/45
    assert res.outcome_score == 1.0     # 0.20/0.20
    assert res.expansion_score == 1.0   # positive slope
    # 0.9*0.25 + 1.0*0.25 + 1.0*0.20 + 1.0*0.20 + 1.0*0.10 = 0.225 + 0.25 + 0.2 + 0.2 + 0.1 = 0.975 -> 97.5
    assert res.final_score == 97.5
    assert res.band == "Expansion Ready"
    assert res.color == "emerald"


def test_outcome_score_capping():
    # Outcome score = min(reduction / 0.20, 1.0). If reduction is 0.40 (40%), outcome score caps at 1.0
    res = compute_health_score(
        invited_users=50,
        activated_users=40,
        weekly_active_users=30,
        retained_30d_users=30,
        workflow_time_reduction_pct=0.45,
        weekly_wau_history=[0.60, 0.60, 0.60, 0.60],
    )
    assert res.outcome_score == 1.0
    assert res.outcome_contribution == 20.0  # 1.0 * 0.20 * 100


def test_trend_slope_classifications():
    # Positive slope
    _, dir_pos, exp_pos = calculate_wau_trend_slope([0.60, 0.65, 0.70, 0.75])
    assert dir_pos == "positive"
    assert exp_pos == 1.0

    # Negative slope
    _, dir_neg, exp_neg = calculate_wau_trend_slope([0.75, 0.70, 0.65, 0.60])
    assert dir_neg == "negative"
    assert exp_neg == 0.0

    # Flat slope
    _, dir_flat, exp_flat = calculate_wau_trend_slope([0.65, 0.65, 0.65, 0.65])
    assert dir_flat == "flat"
    assert exp_flat == 0.5


def test_health_score_bands():
    # Band 1: Expansion Ready (>= 70)
    b_green = compute_health_score(50, 45, 38, 38, 0.25, [0.70, 0.75, 0.80, 0.84])
    assert b_green.final_score >= 70.0
    assert b_green.band == "Expansion Ready"
    assert b_green.color == "emerald"

    # Band 2: Healthy but Watch (40 - 69.9)
    b_yellow = compute_health_score(50, 35, 20, 22, 0.15, [0.55, 0.56, 0.57, 0.58])
    assert 40.0 <= b_yellow.final_score < 70.0
    assert b_yellow.band == "Healthy but Watch"
    assert b_yellow.color == "amber"

    # Band 3: At Risk (< 40)
    b_red = compute_health_score(50, 20, 8, 8, 0.05, [0.50, 0.45, 0.40, 0.35])
    assert b_red.final_score < 40.0
    assert b_red.band == "At Risk"
    assert b_red.color == "rose"


def test_day_45_intervention_rule():
    # Rule: if score < 45 by day 45 -> auto-trigger intervention workstream
    acct = Account(
        id="test_intervention",
        name="Test Corp",
        industry="Tech",
        tier="Enterprise",
        pilot_start_date="2026-07-01",
        pilot_days_elapsed=48,  # past day 45
        invited_users=50,
        activated_users=25,
        weekly_active_users=10,
        retained_30d_users=11,
        workflow_time_reduction_pct=0.08,
        monthly_verified_outputs=150,
        satisfaction_score=3.5,
        workflow_runs_monthly=1200,
        weekly_wau_history=[0.50, 0.45, 0.42, 0.40],
        stage="Pilot Active",
        champion_name="Alice",
        champion_title="Lead",
        buyer_title="VP",
    )
    res = evaluate_account_health(acct)
    assert res.health.final_score < 45.0
    assert res.intervention_required is True
    assert "Mandatory SLA threshold" in res.intervention_reason


def test_expansion_criteria_customer_verifiable():
    # All met: WAU >= 60% for 4 consecutive weeks, time reduction >= 20%, 30d retention >= 70%
    crit_met = evaluate_expansion_criteria(
        weekly_wau_history=[0.62, 0.65, 0.70, 0.75],
        workflow_time_reduction_pct=0.22,
        retained_30d_users=35,
        activated_users=45,  # 35/45 = 77.7% >= 70%
        health_score=78.0,
    )
    assert crit_met.consecutive_wau_met is True
    assert crit_met.time_reduction_met is True
    assert crit_met.retention_met is True
    assert crit_met.all_met is True
    assert crit_met.verdict == "EXPAND"

    # One missing: time reduction only 18%
    crit_unmet = evaluate_expansion_criteria(
        weekly_wau_history=[0.62, 0.65, 0.70, 0.75],
        workflow_time_reduction_pct=0.18,  # fails 20%
        retained_30d_users=35,
        activated_users=45,
        health_score=72.0,
    )
    assert crit_unmet.consecutive_wau_met is True
    assert crit_unmet.time_reduction_met is False
    assert crit_unmet.all_met is False
    assert crit_unmet.verdict == "HOLD"


def test_case_scenario_1_healthy_account_expands():
    from app.seed_data import get_seed_accounts
    accounts = get_seed_accounts()
    acme = next(a for a in accounts if a.id == "acct_acme_corp")
    
    res = evaluate_account_health(acme)
    assert res.expansion.verdict == "EXPAND"
    assert res.day_60_assessment.status == "HEALTHY"
    assert res.day_60_assessment.is_stalled is False
    assert res.root_cause.primary_cause == "Healthy Adoption Velocity"
    assert res.root_cause.category == "GTM-CONTROLLABLE"
    assert len(res.expansion.evidence_bullets) >= 5
    assert "WAU =" in res.expansion.evidence_bullets[0]
    assert "ROI =" in res.expansion.evidence_bullets[4]


def test_case_scenario_2_declining_wau_triggers_intervention():
    from app.models import Account
    acct = Account(
        id="test_declining",
        name="Declining Corp",
        industry="Retail",
        tier="Enterprise",
        pilot_start_date="2026-07-01",
        pilot_days_elapsed=46,
        invited_users=50,
        activated_users=45,
        weekly_active_users=18,
        retained_30d_users=25,
        workflow_time_reduction_pct=0.18,
        monthly_verified_outputs=300,
        satisfaction_score=3.9,
        workflow_runs_monthly=2000,
        weekly_wau_history=[0.75, 0.65, 0.50, 0.38],  # steep negative slope
        stage="Pilot Active",
        champion_name="Bob",
        champion_title="Lead",
        buyer_title="VP",
        roi_multiplier=1.6,
        workflow_completion_rate=0.62,
    )
    res = evaluate_account_health(acct)
    assert res.expansion.verdict in ["INTERVENE", "HOLD"]
    assert res.health.trend_direction == "negative"
    assert res.day_60_assessment.status in ["STALLED", "AT RISK"]
    assert res.root_cause.category in ["GTM-CONTROLLABLE", "PARTIALLY CONTROLLABLE", "ORGANIZATIONAL / EXTERNAL"]


def test_case_scenario_3_day_60_stalled_account_diagnosed():
    from app.seed_data import get_seed_accounts
    accounts = get_seed_accounts()
    apex = next(a for a in accounts if a.id == "acct_apex_global")
    
    res = evaluate_account_health(apex)
    assert res.day_60_assessment.status == "STALLED"
    assert res.day_60_assessment.is_stalled is True
    assert res.intervention_required is True
    assert res.root_cause.primary_cause in ["Poor Workflow Fit", "Business Priority Change", "Lack of Training"]
    assert len(res.root_cause.action_plan_steps) >= 2
    assert "Workflow Redesign" in res.root_cause.prescribed_intervention or len(res.root_cause.prescribed_intervention) > 0


def test_case_scenario_4_low_roi_does_not_expand():
    from app.models import Account
    # Account with passing WAU and time reduction, but low ROI (1.4x < 2.0x target)
    acct = Account(
        id="test_low_roi",
        name="Low ROI Corp",
        industry="Tech",
        tier="Enterprise",
        pilot_start_date="2026-07-01",
        pilot_days_elapsed=55,
        invited_users=50,
        activated_users=45,
        weekly_active_users=38,  # 84% WAU
        retained_30d_users=40,   # 88% retention
        workflow_time_reduction_pct=0.25, # 25% time saved
        monthly_verified_outputs=600,
        satisfaction_score=4.5,
        workflow_runs_monthly=5000,
        weekly_wau_history=[0.70, 0.75, 0.80, 0.84],
        stage="Pilot Active",
        champion_name="Carol",
        champion_title="Director",
        buyer_title="CFO",
        roi_multiplier=1.4,  # fails 2.0x hurdle!
        workflow_completion_rate=0.90,
    )
    res = evaluate_account_health(acct)
    assert res.expansion.roi_multiplier_met is False
    assert res.expansion.verdict != "EXPAND"
    assert any("ROI" in f for f in res.expansion.failed_conditions)


def test_case_scenario_5_high_usage_weak_outcome_does_not_blindly_expand():
    from app.models import Account
    # Account with very high WAU (90%) but failing outcome (only 12% time reduction < 20%)
    acct = Account(
        id="test_high_usage_weak_outcome",
        name="Busywork Corp",
        industry="Tech",
        tier="Enterprise",
        pilot_start_date="2026-07-01",
        pilot_days_elapsed=55,
        invited_users=50,
        activated_users=45,
        weekly_active_users=42,  # 93% WAU
        retained_30d_users=40,
        workflow_time_reduction_pct=0.12,  # fails 20% hurdle!
        monthly_verified_outputs=550,
        satisfaction_score=4.4,
        workflow_runs_monthly=5000,
        weekly_wau_history=[0.85, 0.88, 0.90, 0.93],
        stage="Pilot Active",
        champion_name="Dan",
        champion_title="Director",
        buyer_title="CFO",
        roi_multiplier=2.5,
        workflow_completion_rate=0.88,
    )
    res = evaluate_account_health(acct)
    assert res.expansion.time_reduction_met is False
    assert res.expansion.verdict != "EXPAND"
    assert any("Workflow time reduction" in f for f in res.expansion.failed_conditions)
