from typing import List, Dict, Tuple, Optional, Any
from app.models import (
    Account,
    HealthScoreBreakdown,
    ExpansionCriteriaStatus,
    AccountHealthResponse,
    Day60StallAssessment,
    RootCauseDiagnosis,
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
    mean_x = 1.5
    mean_y = sum(last_4) / 4.0
    numerator = sum((i - mean_x) * (y - mean_y) for i, y in enumerate(last_4))
    denominator = sum((i - mean_x) ** 2 for i in range(4))  # 5.0
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
    # 70-100 = Expansion Ready (green)
    # 40-69  = Healthy but Watch (yellow)
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


def evaluate_day_60_stall(
    account: Account,
    expansion_wau_threshold: float = 0.60,
) -> Day60StallAssessment:
    """
    Deterministic Day-60 stall detection based on 6 multi-factor criteria:
    - WAU rate vs threshold
    - 4-week usage trend slope
    - 30-day cohort retention
    - Workflow completion rate
    - Realized ROI multiplier
    - Workflow time reduction %
    """
    failing: List[str] = []
    healthy: List[str] = []

    current_wau = (account.weekly_active_users / account.activated_users) if account.activated_users > 0 else 0.0
    slope, direction, _ = calculate_wau_trend_slope(account.weekly_wau_history)
    retention_rate = (account.retained_30d_users / account.activated_users) if account.activated_users > 0 else 0.0

    # Criterion 1: WAU vs target
    if current_wau >= expansion_wau_threshold:
        healthy.append(f"WAU ({int(round(current_wau * 100))}%) meets {int(round(expansion_wau_threshold * 100))}% hurdle")
    else:
        failing.append(f"WAU ({int(round(current_wau * 100))}%) below {int(round(expansion_wau_threshold * 100))}% hurdle")

    # Criterion 2: Usage trend slope
    if slope >= 0.0:
        healthy.append(f"Usage trend is {direction} ({round(slope, 3)}/wk)")
    else:
        failing.append(f"Declining usage trend ({round(slope, 3)}/wk)")

    # Criterion 3: Repeat retention
    if retention_rate >= 0.70:
        healthy.append(f"30-day retention ({int(round(retention_rate * 100))}%) satisfies >= 70% persistence")
    else:
        failing.append(f"30-day retention ({int(round(retention_rate * 100))}%) below 70% threshold")

    # Criterion 4: Workflow completion rate
    if account.workflow_completion_rate >= 0.75:
        healthy.append(f"Workflow completion ({int(round(account.workflow_completion_rate * 100))}%) satisfies >= 75% target")
    else:
        failing.append(f"Low workflow completion ({int(round(account.workflow_completion_rate * 100))}%) below 75% target")

    # Criterion 5: Measured ROI multiplier
    if account.roi_multiplier >= 2.0:
        healthy.append(f"Realized ROI ({account.roi_multiplier:.1f}x) satisfies >= 2.0x value hurdle")
    else:
        failing.append(f"Weak realized ROI ({account.roi_multiplier:.1f}x) below 2.0x value hurdle")

    # Criterion 6: Workflow time reduction
    if account.workflow_time_reduction_pct >= 0.20:
        healthy.append(f"Workflow time saved ({int(round(account.workflow_time_reduction_pct * 100))}%) satisfies >= 20% target")
    else:
        failing.append(f"Time reduction ({int(round(account.workflow_time_reduction_pct * 100))}%) below 20% target")

    # Stall status evaluation:
    if len(failing) >= 3 or current_wau < 0.40 or (account.pilot_days_elapsed >= 40 and slope < -0.02):
        status = "STALLED"
        is_stalled = True
        stall_risk_score = round(min(98.0, 65.0 + (len(failing) * 6.5)), 1)
        stall_reason = f"Critical Day-60 stall: {len(failing)} of 6 criteria failing ({'; '.join(failing[:2])}). Automated SLA intervention required."
    elif len(failing) >= 1 or current_wau < expansion_wau_threshold or slope < 0.0:
        status = "AT RISK"
        is_stalled = False
        stall_risk_score = round(45.0 + (len(failing) * 5.0), 1)
        stall_reason = f"Day-60 early warning: {len(failing)} metric(s) lagging ({'; '.join(failing[:2])}). Proactive coaching advised."
    else:
        status = "HEALTHY"
        is_stalled = False
        stall_risk_score = round(max(5.0, 20.0 - (len(healthy) * 2.0)), 1)
        stall_reason = "Day-60 healthy trajectory: All habit and value benchmarks satisfied on schedule."

    return Day60StallAssessment(
        status=status,
        is_stalled=is_stalled,
        stall_risk_score=stall_risk_score,
        failing_indicators=failing,
        healthy_indicators=healthy,
        stall_reason=stall_reason,
    )


def diagnose_root_cause(
    account: Account,
    health: HealthScoreBreakdown,
    expansion: ExpansionCriteriaStatus,
    stall_assessment: Day60StallAssessment,
) -> RootCauseDiagnosis:
    """
    Deterministic 8-cause root-cause classification categorized into:
    - GTM-CONTROLLABLE (Solvant engineering/onboarding fixes)
    - PARTIALLY CONTROLLABLE (Executive alignment / champion nudges)
    - ORGANIZATIONAL / EXTERNAL (Corporate shifts / macro resistance)
    """
    current_wau = (account.weekly_active_users / account.activated_users) if account.activated_users > 0 else 0.0
    act_rate = (account.activated_users / account.invited_users) if account.invited_users > 0 else 0.0

    if account.roi_multiplier < 1.4 and account.workflow_time_reduction_pct < 0.15 and current_wau < 0.45:
        return RootCauseDiagnosis(
            primary_cause="Poor Workflow Fit",
            category="GTM-CONTROLLABLE",
            controllability_score_pct=95.0,
            contributing_factors=[
                "General ledger export structure mismatch causing manual analyst reformatting",
                f"Workflow time reduction is only {int(round(account.workflow_time_reduction_pct * 100))}% vs 20% commitment",
                f"Realized ROI is {account.roi_multiplier:.1f}x, failing the 2.0x hurdle",
            ],
            prescribed_intervention="Workflow Redesign & Custom FP&A Prompt Library Sprint",
            action_plan_steps=[
                "Deploy Solvant Solutions Engineer to map ERP variance columns into automated JSON schemas",
                "Redesign variance commentary prompts to mirror CFO standard executive reporting pack",
                "Provide analysts with one-click variance drafting templates",
            ],
            remeasurement_target="Restore workflow time reduction to >= 20% within 14 days of prompt deployment",
        )

    elif act_rate < 0.65:
        return RootCauseDiagnosis(
            primary_cause="Weak Onboarding",
            category="GTM-CONTROLLABLE",
            controllability_score_pct=90.0,
            contributing_factors=[
                f"Only {account.activated_users} of {account.invited_users} invited analysts ({int(round(act_rate*100))}%) completed activation",
                "Invited analysts have not run their first variance draft",
                "Initial VPC connector latency during pilot week 1",
            ],
            prescribed_intervention="Assisted Re-Onboarding Cohort with Solutions Architect",
            action_plan_steps=[
                "Host 45-minute live cohort onboarding session with invited FP&A team",
                "Run 1-on-1 walkthrough for first monthly variance completion",
                "Verify automated SSO / VPC access permissions for all invited analysts",
            ],
            remeasurement_target="Reach >= 75% analyst activation within 10 days",
        )

    elif account.workflow_completion_rate < 0.72 and current_wau >= 0.45:
        return RootCauseDiagnosis(
            primary_cause="Lack of Training",
            category="GTM-CONTROLLABLE",
            controllability_score_pct=85.0,
            contributing_factors=[
                f"Workflow completion rate is {int(round(account.workflow_completion_rate * 100))}%: tasks started but abandoned before export",
                "Analysts unfamiliar with variance prompt modifiers for management commentary",
                "Feedback score indicates hesitation on output auditability",
            ],
            prescribed_intervention="Targeted 60-Min Variance Commentary Prompt Engineering Workshop",
            action_plan_steps=[
                "Conduct hands-on prompt engineering masterclass on management variance commentary",
                "Distribute Solvant FP&A Prompt Cookbook with before/after commentary examples",
                "Institute weekly 30-minute drop-in office hours with Solvant FP&A Lead",
            ],
            remeasurement_target="Elevate workflow completion rate to >= 80% on next monthly close cycle",
        )

    elif account.stakeholder_alignment_score < 60.0 or not any(s.role == "End-User Champion" and s.identified for s in account.stakeholders):
        return RootCauseDiagnosis(
            primary_cause="No Internal Champion",
            category="PARTIALLY CONTROLLABLE",
            controllability_score_pct=65.0,
            contributing_factors=[
                "No day-to-day FP&A Lead champion actively evangelizing the tool across the team",
                f"Stakeholder alignment score is {account.stakeholder_alignment_score:.0f}%",
                "Usage is fragmented across isolated analysts without centralized close cadence",
            ],
            prescribed_intervention="Executive Sponsor Escalation & Champion Identification",
            action_plan_steps=[
                "Meet with Economic Buyer to identify and appoint a Lead FP&A Analyst Champion",
                "Establish weekly champion check-in with Solvant Customer Success lead",
                "Provide champion with pilot progress dashboard to share in leadership syncs",
            ],
            remeasurement_target="Confirm designated champion and establish weekly cadence within 7 days",
        )

    elif account.monthly_verified_outputs < 400:
        return RootCauseDiagnosis(
            primary_cause="Poor Data/Context",
            category="GTM-CONTROLLABLE",
            controllability_score_pct=90.0,
            contributing_factors=[
                f"Monthly outputs ({account.monthly_verified_outputs}) below 500 contractual target",
                "General ledger sync frequency limited to monthly batch rather than weekly rolling sync",
                "AI commentary lacks divisional cost-center context",
            ],
            prescribed_intervention="KMS / ERP General Ledger Connector Tuning & Context Enrichment",
            action_plan_steps=[
                "Upgrade VPC endpoint connector to ingest rolling weekly ledger snapshots",
                "Add divisional cost-center hierarchy into customer-private KMS context store",
                "Validate data freshness SLA with enterprise IT/Security owner",
            ],
            remeasurement_target="Increase verified monthly outputs to >= 500 within 14 days",
        )

    elif health.outcome_score < 0.65 and current_wau >= 0.60:
        return RootCauseDiagnosis(
            primary_cause="Low Manager Reinforcement",
            category="PARTIALLY CONTROLLABLE",
            controllability_score_pct=60.0,
            contributing_factors=[
                f"High analyst frequency ({int(round(current_wau * 100))}% WAU) but modest realized time reduction ({int(round(account.workflow_time_reduction_pct * 100))}%)",
                "FP&A managers still requiring dual-entry in legacy Excel sheets",
                "Commentary exports not yet mandated in executive variance review packet",
            ],
            prescribed_intervention="VP Finance Operational Review: Embed Variance Scorecards into Close",
            action_plan_steps=[
                "Brief VP Finance on dual-entry bottleneck; request formal mandate to use Solvant packet",
                "Establish variance commentary sign-off workflow directly inside Solvant dashboard",
                "Review time savings telemetry at bi-weekly finance operations meeting",
            ],
            remeasurement_target="Achieve formal sign-off in Solvant on >= 80% of variance packs",
        )

    elif health.final_score < 40.0 and account.satisfaction_score < 3.8:
        return RootCauseDiagnosis(
            primary_cause="Organizational Resistance",
            category="ORGANIZATIONAL / EXTERNAL",
            controllability_score_pct=35.0,
            contributing_factors=[
                f"Low satisfaction score ({account.satisfaction_score}/5.0) and entrenched analyst habits",
                "Staff concern regarding automation displacing analyst headcount",
                "Finance leadership communication gap regarding AI adoption intent",
            ],
            prescribed_intervention="CFO Sponsor Executive Alignment & Augmentation Briefing",
            action_plan_steps=[
                "Deliver CFO-sponsored all-hands briefing: AI as augmentation for high-value strategic FP&A",
                "Highlight analyst career growth from automated variance drudgery elimination",
                "Offer voluntary prompt certification cohort with executive visibility",
            ],
            remeasurement_target="Raise user satisfaction score to >= 4.2 on next pulse survey",
        )

    elif stall_assessment.status == "STALLED":
        return RootCauseDiagnosis(
            primary_cause="Business Priority Change",
            category="ORGANIZATIONAL / EXTERNAL",
            controllability_score_pct=25.0,
            contributing_factors=[
                "Enterprise restructuring or corporate ERP overhaul reprioritizing finance capacity",
                "Key leadership turnover in finance division",
                "Budget freeze or shift in fiscal year priorities",
            ],
            prescribed_intervention="Pilot Milestone Realignment or Strategic Hold Playbook",
            action_plan_steps=[
                "Engage Economic Buyer to align pilot deliverables with revised corporate timeline",
                "Pause pilot clock if necessary under mutual agreement",
                "Scope narrow FP&A high-impact wedge aligned with new executive priorities",
            ],
            remeasurement_target="Re-baseline pilot SLA milestones with revised executive sign-off",
        )

    else:
        return RootCauseDiagnosis(
            primary_cause="Healthy Adoption Velocity",
            category="GTM-CONTROLLABLE",
            controllability_score_pct=95.0,
            contributing_factors=[
                f"Strong weekly active usage ({int(round(current_wau * 100))}% WAU)",
                f"Consistent workflow efficiency ({int(round(account.workflow_time_reduction_pct * 100))}% time saved)",
                f"Customer-verifiable ROI realized ({account.roi_multiplier:.1f}x)",
            ],
            prescribed_intervention="Sustain Expansion Cadence & Prepare Enterprise Rollout Pack",
            action_plan_steps=[
                "Finalize 175-seat active usage expansion contract at $30/active user/mo",
                "Present executive value realization report to CFO and Economic Buyer",
                "Initiate Phase 3 Enterprise Rollout planning for adjacent division",
            ],
            remeasurement_target="Execute expansion contract upon pilot graduation (Day 60)",
        )


def evaluate_expansion_criteria(
    weekly_wau_history: List[float],
    workflow_time_reduction_pct: float,
    retained_30d_users: int,
    activated_users: int,
    health_score: float,
    expansion_wau_threshold: float = 0.60,
    roi_multiplier: float = 3.2,
    workflow_completion_rate: float = 0.90,
) -> ExpansionCriteriaStatus:
    """
    Expansion trigger criteria (all customer-verifiable, never Solvant self-reported):
    1. WAU >= expansion_wau_threshold for 4 consecutive weeks
    2. Workflow time reduction >= 20%
    3. 30-day retention >= 70%
    4. Realized ROI multiplier >= 2.0x
    5. Workflow completion rate >= 75%
    """
    last_4_wau = weekly_wau_history[-4:] if len(weekly_wau_history) >= 4 else weekly_wau_history
    consecutive_wau_met = len(last_4_wau) >= 4 and all(w >= expansion_wau_threshold for w in last_4_wau)
    time_reduction_met = workflow_time_reduction_pct >= 0.20
    retention_rate = (retained_30d_users / activated_users) if activated_users > 0 else 0.0
    retention_met = retention_rate >= 0.70
    roi_met = roi_multiplier >= 2.0
    completion_met = workflow_completion_rate >= 0.75
    slope, direction, _ = calculate_wau_trend_slope(weekly_wau_history)

    all_met = consecutive_wau_met and time_reduction_met and retention_met and roi_met and completion_met

    passed_conditions: List[str] = []
    failed_conditions: List[str] = []
    evidence_bullets: List[str] = []

    thresh_pct = int(round(expansion_wau_threshold * 100))
    wau_str = ", ".join([f"{int(round(w * 100))}%" for w in last_4_wau])
    last_wau_pct = int(round(last_4_wau[-1] * 100)) if last_4_wau else 0

    # Bullet 1: WAU
    evidence_bullets.append(f"WAU = {last_wau_pct}% (Threshold: >= {thresh_pct}%)")
    if consecutive_wau_met:
        passed_conditions.append(f"4-week consecutive WAU ({wau_str}) met or exceeded threshold ({thresh_pct}%)")
    else:
        failed_conditions.append(f"4-week consecutive WAU ({wau_str}) fell short of threshold ({thresh_pct}%)")

    # Bullet 2: Workflow completion
    comp_pct = int(round(workflow_completion_rate * 100))
    evidence_bullets.append(f"Workflow completion = {comp_pct}% (Target: >= 75%)")
    if completion_met:
        passed_conditions.append(f"Workflow completion ({comp_pct}%) met >= 75% target")
    else:
        failed_conditions.append(f"Workflow completion ({comp_pct}%) below 75% target")

    # Bullet 3: 30-day retention
    ret_pct = int(round(retention_rate * 100))
    evidence_bullets.append(f"30-day retention = {ret_pct}% (Target: >= 70%)")
    if retention_met:
        passed_conditions.append(f"30-day user retention ({ret_pct}%) satisfied >= 70% persistence target")
    else:
        failed_conditions.append(f"30-day user retention ({ret_pct}%) below 70% persistence requirement")

    # Bullet 4: Time reduction
    time_pct = int(round(workflow_time_reduction_pct * 100))
    evidence_bullets.append(f"Time reduction = {time_pct}% (Target: >= 20%)")
    if time_reduction_met:
        passed_conditions.append(f"Workflow time reduction ({time_pct}%) satisfied >= 20% objective target")
    else:
        failed_conditions.append(f"Workflow time reduction ({time_pct}%) below 20% target requirement")

    # Bullet 5: Realized ROI
    evidence_bullets.append(f"ROI = {roi_multiplier:.1f}x (Target: >= 2.0x)")
    if roi_met:
        passed_conditions.append(f"Realized ROI ({roi_multiplier:.1f}x) satisfied >= 2.0x value target")
    else:
        failed_conditions.append(f"Realized ROI ({roi_multiplier:.1f}x) below 2.0x value requirement")

    # Bullet 6: Usage trend
    evidence_bullets.append(f"Trend = {direction} ({'+' if slope >= 0 else ''}{round(slope, 3)}/wk)")

    if health_score >= 70.0:
        passed_conditions.append(f"Overall adoption health score ({health_score:.1f}/100) satisfied >= 70.0 bar")
    else:
        failed_conditions.append(f"Overall adoption health score ({health_score:.1f}/100) below 70.0 bar")

    trigger_status = {
        "consecutive_wau_met": consecutive_wau_met,
        "time_reduction_met": time_reduction_met,
        "retention_met": retention_met,
        "roi_multiplier_met": roi_met,
        "workflow_completion_met": completion_met,
        "health_score_met": health_score >= 70.0,
    }

    if all_met and health_score >= 70.0:
        verdict = "EXPAND"
        decision_reason = f"All 5 verifiable customer criteria satisfied (WAU {last_wau_pct}%, Completion {comp_pct}%, Retention {ret_pct}%, Time Saved {time_pct}%, ROI {roi_multiplier:.1f}x). Account cleared for customer-approved expansion."
    elif health_score < 40.0 or slope < -0.02 or roi_multiplier < 1.3:
        verdict = "INTERVENE"
        decision_reason = f"Critical risk detected: {'; '.join(failed_conditions)}. SLA breach triggers immediate workflow intervention."
    else:
        verdict = "HOLD"
        decision_reason = f"Expansion on hold pending: {'; '.join(failed_conditions)}."

    traceability_chain = {
        "step1_raw_telemetry": {
            "weekly_wau_history": [round(w, 3) for w in weekly_wau_history],
            "activated_users": activated_users,
            "retained_30d_users": retained_30d_users,
            "workflow_time_reduction_pct": round(workflow_time_reduction_pct, 3),
            "roi_multiplier": round(roi_multiplier, 2),
            "workflow_completion_rate": round(workflow_completion_rate, 3),
        },
        "step2_calculated_metrics": {
            "last_4_wau": [round(w, 3) for w in last_4_wau],
            "consecutive_wau_met": consecutive_wau_met,
            "time_reduction_met": time_reduction_met,
            "retention_met": retention_met,
            "roi_met": roi_met,
            "completion_met": completion_met,
            "trend_slope": round(slope, 4),
            "trend_direction": direction,
        },
        "step3_health_score": round(health_score, 1),
        "step4_verdict": verdict,
        "step5_decision_reason": decision_reason,
    }

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
        roi_multiplier_met=roi_met,
        roi_multiplier_value=round(roi_multiplier, 2),
        workflow_completion_met=completion_met,
        workflow_completion_value=round(workflow_completion_rate, 3),
        evidence_bullets=evidence_bullets,
        traceability_chain=traceability_chain,
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
        roi_multiplier=getattr(account, "roi_multiplier", 3.2),
        workflow_completion_rate=getattr(account, "workflow_completion_rate", 0.90),
    )

    stall_assessment = evaluate_day_60_stall(account, expansion_wau_threshold=expansion_wau_threshold)
    root_cause = diagnose_root_cause(account, health, expansion, stall_assessment)

    # Rule: if score < 45 by day 45 OR stalled -> auto-trigger intervention workstream
    intervention_required = False
    intervention_reason = None
    if account.pilot_days_elapsed >= 45 and health.final_score < 45.0:
        intervention_required = True
        intervention_reason = (
            f"Adoption score is {health.final_score}/100 at Day {account.pilot_days_elapsed}. "
            f"Mandatory SLA threshold of 45.0 breached. Automated intervention workstream dispatched."
        )
    elif stall_assessment.status == "STALLED":
        intervention_required = True
        intervention_reason = stall_assessment.stall_reason

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
        day_60_assessment=stall_assessment,
        root_cause=root_cause,
        stakeholder_alignment_score=getattr(account, "stakeholder_alignment_score", 80.0),
    )
