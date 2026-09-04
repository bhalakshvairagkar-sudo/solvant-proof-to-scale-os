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
