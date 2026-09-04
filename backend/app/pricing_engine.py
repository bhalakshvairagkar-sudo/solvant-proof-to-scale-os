from typing import List, Dict
from app.models import (
    PricingSimulationInput,
    PricingSimulationOutput,
    MonthlyProjection,
    NorthBridgeShadowPoint,
)


def run_pricing_simulation(params: PricingSimulationInput) -> PricingSimulationOutput:
    """
    Deterministic pricing and revenue simulation over 24 months.
    Includes NorthBridge Shadow comparison (licensed seats @ 33% usage vs Solvant usage-metering).
    """
    monthly_projections: List[MonthlyProjection] = []
    northbridge_shadow: List[NorthBridgeShadowPoint] = []

    # State tracking across 24 months
    # Cohorts of graduated expanded customers
    expanded_customers = 0.0
    active_seats = 0
    gross_margin_rate = params.gross_margin_pct / 100.0
    churn_rate = params.monthly_churn_pct / 100.0
    conversion_rate = params.pilot_to_expansion_conversion_pct / 100.0

    # Overages per user/month:
    overage_runs = max(0, params.workflow_runs_per_user_month - params.workflow_run_allowance)
    overage_per_user = overage_runs * params.usage_credit_rate  # e.g. 40 * $0.40 = $16/mo

    cumulative_gross_profit = 0.0

    for m in range(1, 25):
        # In each month, new pilots enter (default 6).
        # Pilots run for 2 months (60 days). Graduations happen after month 2.
        # For month m > 2, new expansions = new_pilots_per_month * conversion_rate
        if m >= 3:
            new_graduates = params.new_pilots_per_month * conversion_rate
            # Existing expanded customers experience monthly churn
            expanded_customers = (expanded_customers * (1.0 - churn_rate)) + new_graduates
        else:
            expanded_customers = 0.0

        # Currently active pilot accounts in month m (up to 2 cohorts of pilots running simultaneously)
        active_pilots = params.new_pilots_per_month * (1 if m == 1 else 2)

        # Average expanded customer seats: pilot_users * expansion_seat_multiplier
        expanded_seats_per_customer = int(params.pilot_users * params.expansion_seat_multiplier)
        total_expanded_seats = int(expanded_customers * expanded_seats_per_customer)
        total_pilot_seats = int(active_pilots * params.pilot_users)

        total_active_seats = total_expanded_seats + total_pilot_seats
        total_customers = int(round(expanded_customers)) + active_pilots

        # Revenue computation:
        # Pilot revenue: $12,000 / 2 months = $6,000/mo per active pilot
        pilot_mrr = active_pilots * (params.pilot_price / 2.0)

        # Post-pilot usage-metered: $30/active-user/month
        expanded_base_mrr = total_expanded_seats * params.full_price_per_user
        expanded_overage_mrr = total_expanded_seats * overage_per_user

        total_mrr = pilot_mrr + expanded_base_mrr + expanded_overage_mrr
        total_arr = total_mrr * 12.0

        gross_profit_mrr = total_mrr * gross_margin_rate
        cumulative_gross_profit += gross_profit_mrr

        monthly_projections.append(
            MonthlyProjection(
                month=m,
                active_customers=total_customers,
                active_seats=total_active_seats,
                base_mrr=round(pilot_mrr + expanded_base_mrr, 2),
                overage_mrr=round(expanded_overage_mrr, 2),
                total_mrr=round(total_mrr, 2),
                total_arr=round(total_arr, 2),
                gross_profit_mrr=round(gross_profit_mrr, 2),
                cumulative_gross_profit=round(cumulative_gross_profit, 2),
            )
        )

        # NorthBridge Shadow comparison:
        # NorthBridge bills $60/seat on total licensed headcount (assumes enterprise licenses all employees)
        # but enterprise only sees 33% actual weekly usage.
        # In Solvant, enterprise pays $30 + overages ONLY on active users.
        nb_licensed_seats = total_expanded_seats if total_expanded_seats > 0 else total_pilot_seats
        # In NorthBridge, only 33% of those seats actually get used:
        nb_effective_active = int(nb_licensed_seats * 0.33)
        nb_billed = nb_licensed_seats * 60.0  # $60 / seat
        solvant_billed = (expanded_base_mrr + expanded_overage_mrr) if m >= 3 else pilot_mrr
        shelfware_waste = max(0.0, nb_billed - solvant_billed)

        northbridge_shadow.append(
            NorthBridgeShadowPoint(
                month=m,
                northbridge_licensed_seats=nb_licensed_seats,
                northbridge_effective_active_users=nb_effective_active,
                northbridge_billed_monthly=round(nb_billed, 2),
                solvant_billed_monthly=round(solvant_billed, 2),
                customer_wasted_shelfware_spend=round(shelfware_waste, 2),
            )
        )

    # Key milestones: Month 12 & Month 24
    p12 = monthly_projections[11]
    p24 = monthly_projections[23]

    # Net Revenue Retention (NRR) calculation:
    # Based on an expanding cohort across 12 months:
    # Starting seats = 50, expands to 175 (3.5x), retains after 12 months of monthly churn
    cohort_retention_factor = (1.0 - churn_rate) ** 12
    # Revenue per expanded seat vs pilot seat: ($30 + overage) vs ($12k / (50 * 2)) = $120/mo pilot vs ($30 + $16) = $46/mo
    # Cohort dollar expansion: (175 seats * $46/mo) / (50 seats * $120/mo pilot rate normalized)
    # Standard SaaS NRR calculation for graduated accounts:
    # Base expansion multiplier (3.5) * retention factor * overage uplift (1.35)
    # Gives ~138% typical NRR
    annualized_expansion_uplift = (params.expansion_seat_multiplier * (1.0 + (overage_per_user / params.full_price_per_user))) / 2.5
    nrr_pct = round(annualized_expansion_uplift * cohort_retention_factor * 100.0, 1)

    cost_stack_breakdown = {
        "llm_inference_groq_pct": 11.5,
        "customer_success_support_pct": 8.5,
        "cloud_vpc_hosting_pct": 3.5,
        "total_cogs_pct": 23.5,
        "defensible_gross_margin_pct": round(params.gross_margin_pct, 1),
    }

    return PricingSimulationOutput(
        arr_12m=p12.total_arr,
        arr_24m=p24.total_arr,
        active_seats_12m=p12.active_seats,
        active_seats_24m=p24.active_seats,
        active_customers_12m=p12.active_customers,
        active_customers_24m=p24.active_customers,
        gross_profit_12m=round(p12.total_arr * gross_margin_rate, 2),
        gross_profit_24m=round(p24.total_arr * gross_margin_rate, 2),
        nrr_pct=nrr_pct,
        monthly_projections=monthly_projections,
        northbridge_shadow=northbridge_shadow,
        cost_stack_breakdown=cost_stack_breakdown,
        params=params,
    )
