from typing import List, Dict, Tuple
from app.models import (
    Account,
    HealthScoreBreakdown,
    ExpansionCriteriaStatus,
    AccountHealthResponse,
)


def calculate_wau_trend_slope(weekly_wau: List[float]) -> Tuple[float, str, float]:
    """
    Computes slope over the most recent 4 weeks.
    Returns: (slope, direction, expansion_score)
    expansion_score: 1.0 for positive, 0.5 for flat, 0.0 for negative.
    """
    if len(weekly_wau) < 4:
        return 0.0, "flat", 0.5

    last_4 = weekly_wau[-4:]
    # Calculate simple linear slope across weeks [0, 1, 2, 3]
    # x = [0, 1, 2, 3], mean_x = 1.5
    # y = last_4, mean_y = sum(y)/4
    mean_x = 1.5
    mean_y = sum(last_4) / 4.0
    numerator = sum((i - mean_x) * (y - mean_y) for i, y in enumerate(last_4))
    denominator = sum((i - mean_x) ** 2 for i in range(4))  # 2.25 + 0.25 + 0.25 + 2.25 = 5.0
    slope = numerator / denominator if denominator != 0 else 0.0

    threshold = 0.015  # 1.5% weekly change threshold
    if slope > threshold:
        return slope, "positive", 1.0
    elif slope < -threshold:
        return slope, "negative", 0.0
    else:
        return slope, "flat", 0.5


def compute_health_score(
    invited_users: int,
    activated_users: int,
    weekly_active_users: int,
    retained_30d_users: int,
    workflow_time_reduction_pct: float,
    weekly_wau_history: List[float],
) -> HealthScoreBreakdown:
    """
    Exact deterministic adoption health score formula:
    score = activation_score * 0.25
          + frequency_score  * 0.25
          + retention_score  * 0.20
          + outcome_score    * 0.20
          + expansion_score  * 0.10
    """
    # 1. Activation score (activated_users / invited_users)
    activation_score = (activated_users / invited_users) if invited_users > 0 else 0.0
    activation_score = min(max(activation_score, 0.0), 1.0)

    # 2. Frequency score (weekly_active_rate = WAU / activated_users)
    frequency_score = (weekly_active_users / activated_users) if activated_users > 0 else 0.0
    frequency_score = min(max(frequency_score, 0.0), 1.0)

    # 3. Retention score (retained_30d_users / activated_users)
    retention_score = (retained_30d_users / activated_users) if activated_users > 0 else 0.0
    retention_score = min(max(retention_score, 0.0), 1.0)

    # 4. Outcome score = min(workflow_time_reduction / 0.20, 1.0) (capped at pilot target 20%)
    outcome_score = min(max(workflow_time_reduction_pct / 0.20, 0.0), 1.0)

    # 5. Expansion score = 4-week WAU trend slope (1.0 positive / 0.5 flat / 0.0 negative)
    slope, direction, expansion_score = calculate_wau_trend_slope(weekly_wau_history)

    # Contributions
    c_act = activation_score * 0.25
    c_freq = frequency_score * 0.25
    c_ret = retention_score * 0.20
    c_out = outcome_score * 0.20
    c_exp = expansion_score * 0.10

    raw_score = c_act + c_freq + c_ret + c_out + c_exp
    final_score = round(raw_score * 100.0, 1)

    # Bands:
    # 70–100 = Expansion Ready (green)
    # 40–69  = Healthy but Watch (yellow)
    # <40    = At Risk (red)
    if final_score >= 70.0:
        band = "Expansion Ready"
        color = "emerald"
    elif final_score >= 40.0:
        band = "Healthy but Watch"
        color = "amber"
    else:
        band = "At Risk"
        color = "rose"

    components = {
        "activation": round(activation_score * 100.0, 1),
        "frequency": round(frequency_score * 100.0, 1),
        "retention": round(retention_score * 100.0, 1),
        "outcome": round(outcome_score * 100.0, 1),
        "expansion_trend": round(expansion_score * 100.0, 1),
    }

    return HealthScoreBreakdown(
        activation_score=round(activation_score, 4),
        activation_contribution=round(c_act * 100.0, 2),
        frequency_score=round(frequency_score, 4),
        frequency_contribution=round(c_freq * 100.0, 2),
        retention_score=round(retention_score, 4),
        retention_contribution=round(c_ret * 100.0, 2),
        outcome_score=round(outcome_score, 4),
        outcome_contribution=round(c_out * 100.0, 2),
        expansion_score=round(expansion_score, 4),
        expansion_contribution=round(c_exp * 100.0, 2),
        raw_score=round(raw_score, 4),
        final_score=final_score,
        band=band,
        color=color,
        trend_slope=round(slope, 4),
        trend_direction=direction,
        components=components,
    )


def evaluate_expansion_criteria(
    weekly_wau_history: List[float],
    workflow_time_reduction_pct: float,
    retained_30d_users: int,
    activated_users: int,
    health_score: float,
    expansion_wau_threshold: float = 0.60,
) -> ExpansionCriteriaStatus:
    """
    Expansion trigger criteria (all customer-verifiable, never Solvant self-reported):
    1. WAU >= expansion_wau_threshold for 4 consecutive weeks
    2. Workflow time reduction >= 20%
    3. 30-day retention >= 70%
    """
    last_4_wau = weekly_wau_history[-4:] if len(weekly_wau_history) >= 4 else weekly_wau_history
    consecutive_wau_met = len(last_4_wau) >= 4 and all(w >= expansion_wau_threshold for w in last_4_wau)

    time_reduction_met = workflow_time_reduction_pct >= 0.20

    retention_rate = (retained_30d_users / activated_users) if activated_users > 0 else 0.0
    retention_met = retention_rate >= 0.70

    all_met = consecutive_wau_met and time_reduction_met and retention_met

    passed_conditions: List[str] = []
    failed_conditions: List[str] = []

    thresh_pct = int(round(expansion_wau_threshold * 100))
    wau_str = ", ".join([f"{int(round(w * 100))}%" for w in last_4_wau])
    if consecutive_wau_met:
        passed_conditions.append(f"4-week consecutive WAU ({wau_str}) met or exceeded threshold ({thresh_pct}%)")
    else:
        failed_conditions.append(f"4-week consecutive WAU ({wau_str}) fell short of threshold ({thresh_pct}%)")

    time_pct = int(round(workflow_time_reduction_pct * 100))
    if time_reduction_met:
        passed_conditions.append(f"Workflow time reduction ({time_pct}%) satisfied >= 20% objective target")
    else:
        failed_conditions.append(f"Workflow time reduction ({time_pct}%) below 20% target requirement")

    ret_pct = int(round(retention_rate * 100))
    if retention_met:
        passed_conditions.append(f"30-day user retention ({ret_pct}%) satisfied >= 70% persistence target")
    else:
        failed_conditions.append(f"30-day user retention ({ret_pct}%) below 70% persistence requirement")

    if health_score >= 70.0:
        passed_conditions.append(f"Overall adoption health score ({health_score:.1f}/100) satisfied >= 70.0 bar")
    else:
        failed_conditions.append(f"Overall adoption health score ({health_score:.1f}/100) below 70.0 bar")

    trigger_status = {
        "consecutive_wau_met": consecutive_wau_met,
        "time_reduction_met": time_reduction_met,
        "retention_met": retention_met,
        "health_score_met": health_score >= 70.0,
    }

    if all_met and health_score >= 70.0:
        verdict = "EXPAND"
        decision_reason = "All 4 verifiable adoption hurdles satisfied. Account cleared for customer-approved expansion."
    elif health_score < 40.0:
        verdict = "INTERVENE"
        decision_reason = f"Critical risk detected: {'; '.join(failed_conditions)}. SLA breach triggers immediate workflow intervention."
    else:
        verdict = "HOLD"
        decision_reason = f"Expansion on hold pending: {'; '.join(failed_conditions)}."

    return ExpansionCriteriaStatus(
        consecutive_wau_met=consecutive_wau_met,
        consecutive_wau_values=[round(w, 3) for w in last_4_wau],
        expansion_wau_threshold_applied=round(expansion_wau_threshold, 3),
        time_reduction_met=time_reduction_met,
        time_reduction_value=round(workflow_time_reduction_pct, 3),
        retention_met=retention_met,
        retention_value=round(retention_rate, 3),
        all_met=all_met,
        verdict=verdict,
        failed_conditions=failed_conditions,
        passed_conditions=passed_conditions,
        trigger_status=trigger_status,
        decision_reason=decision_reason,
    )


def evaluate_account_health(account: Account, expansion_wau_threshold: float = 0.60) -> AccountHealthResponse:
    health = compute_health_score(
        invited_users=account.invited_users,
        activated_users=account.activated_users,
        weekly_active_users=account.weekly_active_users,
        retained_30d_users=account.retained_30d_users,
        workflow_time_reduction_pct=account.workflow_time_reduction_pct,
        weekly_wau_history=account.weekly_wau_history,
    )

    expansion = evaluate_expansion_criteria(
        weekly_wau_history=account.weekly_wau_history,
        workflow_time_reduction_pct=account.workflow_time_reduction_pct,
        retained_30d_users=account.retained_30d_users,
        activated_users=account.activated_users,
        health_score=health.final_score,
        expansion_wau_threshold=expansion_wau_threshold,
    )

    # Rule: if score < 45 by day 45 -> auto-trigger intervention workstream
    intervention_required = False
    intervention_reason = None
    if account.pilot_days_elapsed >= 45 and health.final_score < 45.0:
        intervention_required = True
        intervention_reason = (
            f"Adoption score is {health.final_score}/100 at Day {account.pilot_days_elapsed}. "
            f"Mandatory SLA threshold of 45.0 breached. Automated intervention workstream dispatched."
        )

    # Pilot contract success thresholds (all 6):
    pilot_thresholds = {
        "activation_ge_70": (account.activated_users / account.invited_users) >= 0.70 if account.invited_users > 0 else False,
        "wau_ge_60": (account.weekly_active_users / account.activated_users) >= 0.60 if account.activated_users > 0 else False,
        "repeat_usage_ge_50": (account.retained_30d_users / account.activated_users) >= 0.50 if account.activated_users > 0 else False,
        "time_reduction_ge_20": account.workflow_time_reduction_pct >= 0.20,
        "outputs_ge_500": account.monthly_verified_outputs >= 500,
        "satisfaction_ge_4_2": account.satisfaction_score >= 4.2,
    }

    return AccountHealthResponse(
        account_id=account.id,
        account_name=account.name,
        health=health,
        expansion=expansion,
        intervention_required=intervention_required,
        intervention_reason=intervention_reason,
        pilot_thresholds_met=pilot_thresholds,
    )
