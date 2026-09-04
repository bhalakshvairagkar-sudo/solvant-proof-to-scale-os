import pytest
from app.models import PricingSimulationInput
from app.pricing_engine import run_pricing_simulation


def test_pricing_engine_baseline():
    params = PricingSimulationInput(
        pilot_price=12000.0,
        pilot_users=50,
        expansion_wau_threshold=0.60,
        usage_credit_rate=0.40,
        full_price_per_user=30.0,
        pilot_to_expansion_conversion_pct=65.0,
        monthly_churn_pct=1.5,
        gross_margin_pct=76.5,
        new_pilots_per_month=6,
        workflow_runs_per_user_month=140,
        workflow_run_allowance=100,
    )
    result = run_pricing_simulation(params)

    # Sanity checks on 12m and 24m projections
    assert len(result.monthly_projections) == 24
    assert result.arr_12m > 0
    assert result.arr_24m > result.arr_12m
    assert result.active_seats_24m > result.active_seats_12m

    # Check gross profit calculation
    assert round(result.gross_profit_12m, 2) == round(result.arr_12m * 0.765, 2)
    assert round(result.gross_profit_24m, 2) == round(result.arr_24m * 0.765, 2)

    # Check NRR is healthy (typically 120% - 150%)
    assert result.nrr_pct >= 100.0

    # Defensible cost stack verification
    assert result.cost_stack_breakdown["defensible_gross_margin_pct"] == 76.5
    assert result.cost_stack_breakdown["total_cogs_pct"] == 23.5


def test_northbridge_shadow_shelfware_comparison():
    params = PricingSimulationInput()
    result = run_pricing_simulation(params)

    assert len(result.northbridge_shadow) == 24
    # At month 24, NorthBridge seats should show significant wasted shelfware spend
    m24_shadow = result.northbridge_shadow[-1]
    assert m24_shadow.northbridge_effective_active_users == int(m24_shadow.northbridge_licensed_seats * 0.33)
    assert m24_shadow.northbridge_billed_monthly > m24_shadow.solvant_billed_monthly
    assert m24_shadow.customer_wasted_shelfware_spend > 0


def test_pricing_sensitivity_on_conversion_rate():
    base_params = PricingSimulationInput(pilot_to_expansion_conversion_pct=65.0)
    high_params = PricingSimulationInput(pilot_to_expansion_conversion_pct=80.0)

    base_res = run_pricing_simulation(base_params)
    high_res = run_pricing_simulation(high_params)

    assert high_res.arr_24m > base_res.arr_24m
    assert high_res.active_seats_24m > base_res.active_seats_24m


def test_active_billable_users_and_threshold_elasticity():
    # P0 verification: active_billable_users = expanded_seats * actual_wau_rate
    low_gate = PricingSimulationInput(expansion_wau_threshold=0.50)
    high_gate = PricingSimulationInput(expansion_wau_threshold=0.75)

    low_res = run_pricing_simulation(low_gate)
    high_res = run_pricing_simulation(high_gate)

    # 1. Threshold changes eligible accounts count
    assert low_res.eligible_expansion_accounts_count >= high_res.eligible_expansion_accounts_count
    assert high_res.eligible_expansion_accounts_count == 4
    assert low_res.eligible_expansion_accounts_count == 8

    # 2. Conversion elasticity: higher gate reduces conversion rate
    assert low_res.effective_conversion_pct > high_res.effective_conversion_pct
    assert low_res.effective_conversion_pct == 83.0
    assert high_res.effective_conversion_pct == 38.0

    # 3. Active WAU rate applied reflects gate
    assert low_res.actual_wau_rate_applied == 0.62
    assert high_res.actual_wau_rate_applied == 0.87

    # 4. Downstream economics: lower gate converts more pilots, generating higher cumulative ARR
    assert low_res.arr_24m > high_res.arr_24m

    # 5. NRR label is simplified cohort proxy
    assert "Simplified Cohort Proxy" in low_res.nrr_label


def test_trust_fact_base_evidence_sources():
    from app.trust_copilot import get_fact_base
    facts = get_fact_base()
    assert len(facts) >= 4
    for fact in facts:
        assert fact.evidence_source is not None
        assert len(fact.evidence_source.strip()) > 10



def test_pilot_unit_economics_profitable_and_loss_making():
    # 1. Profitable baseline pilot ($12,000 price)
    res_profitable = run_pricing_simulation(PricingSimulationInput(pilot_price=12000.0, cs_cost_per_customer_month=350.0))
    pe = res_profitable.pilot_economics
    assert pe.revenue == 12000.0
    assert pe.delivery_cost > 0
    assert pe.contribution > 0
    assert pe.margin_pct > 0
    assert pe.is_profitable is True
    assert pe.status_label == "PROFITABLE"

    # 2. Loss-making pilot ($1,000 price with $2,000+ delivery cost)
    res_loss = run_pricing_simulation(PricingSimulationInput(pilot_price=1000.0, cs_cost_per_customer_month=1000.0))
    pe_loss = res_loss.pilot_economics
    assert pe_loss.revenue == 1000.0
    assert pe_loss.contribution < 0
    assert pe_loss.margin_pct < 0
    assert pe_loss.is_profitable is False
    assert pe_loss.status_label == "LOSS-MAKING"


def test_cohort_nrr_and_grr_formulas():
    res = run_pricing_simulation(PricingSimulationInput())
    cn = res.cohort_nrr
    assert cn.excludes_new_logos is True
    assert cn.starting_mrr > 0
    assert cn.expansion_mrr > 0
    assert cn.contraction_mrr >= 0
    assert cn.churn_mrr >= 0
    expected_ending = round(cn.starting_mrr + cn.expansion_mrr - cn.contraction_mrr - cn.churn_mrr, 2)
    assert abs(cn.ending_mrr - expected_ending) <= 0.05
    expected_nrr = round((cn.ending_mrr / cn.starting_mrr) * 100.0, 1)
    assert abs(cn.nrr_pct - expected_nrr) <= 0.2
    assert cn.grr_pct <= 100.0


def test_deterministic_churn_risk_levels():
    # Low churn scenario
    res_low = run_pricing_simulation(PricingSimulationInput(monthly_churn_pct=0.5, cs_cost_per_customer_month=400.0))
    assert res_low.churn_risk.risk_level in ["LOW", "MEDIUM"]
    assert len(res_low.churn_risk.key_drivers) >= 3

    # High churn scenario
    res_high = run_pricing_simulation(PricingSimulationInput(monthly_churn_pct=4.5, cs_cost_per_customer_month=150.0))
    assert res_high.churn_risk.risk_score > res_low.churn_risk.risk_score
    assert res_high.churn_risk.revenue_lost_to_churn_24m > res_low.churn_risk.revenue_lost_to_churn_24m


def test_time_to_full_price_comparison_matrix():
    res = run_pricing_simulation(PricingSimulationInput())
    comp = res.time_to_full_price_comparison
    assert len(comp) == 4
    horizons = [c.horizon_months for c in comp]
    assert horizons == [3, 6, 9, 12]
    # 3m horizon yields faster full price than 12m horizon
    c3 = next(c for c in comp if c.horizon_months == 3)
    c12 = next(c for c in comp if c.horizon_months == 12)
    assert c3.revenue_12m > c12.revenue_12m


def test_pricing_engine_handles_zero_and_extreme_inputs():
    # Zero users, zero price, zero conversion
    extreme_params = PricingSimulationInput(
        pilot_users=0,
        pilot_price=0.0,
        pilot_to_expansion_conversion_pct=0.0,
        monthly_churn_pct=0.0,
        workflow_runs_per_user_month=0,
    )
    res = run_pricing_simulation(extreme_params)
    assert res.arr_12m >= 0
    assert res.pilot_economics.contribution <= 0
    assert res.cohort_nrr.nrr_pct >= 0
