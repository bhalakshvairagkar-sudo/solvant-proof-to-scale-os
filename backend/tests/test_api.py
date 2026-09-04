import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Code calculates" in data["golden_rule"]


def test_api_portfolio():
    response = client.get("/api/portfolio")
    assert response.status_code == 200
    data = response.json()
    assert data["total_accounts"] >= 20
    assert data["expansion_ready_count"] >= 5
    assert data["at_risk_count"] >= 3
    assert data["pipeline_arr"] > 0


def test_api_accounts_list():
    response = client.get("/api/accounts")
    assert response.status_code == 200
    accounts = response.json()
    assert len(accounts) >= 20
    acme = next((a for a in accounts if a["account"]["id"] == "acct_acme_corp"), None)
    assert acme is not None
    assert acme["health"]["band"] == "Expansion Ready"
    assert acme["health"]["final_score"] >= 70.0


def test_live_wau_slider_simulation_flip():
    # Test the core live demo interaction:
    # Acme Corp starts at high WAU (~85%) -> Expansion Ready
    # Drag WAU down to 0.25 (25%) -> score flips to At Risk / Intervention (< 45)
    try:
        orig_resp = client.get("/api/accounts/acct_acme_corp")
        assert orig_resp.status_code == 200
        orig_score = orig_resp.json()["health"]["final_score"]
        assert orig_score >= 70.0

        # Drag WAU down to 25%
        sim_resp = client.post(
            "/api/accounts/acct_acme_corp/simulate",
            json={"simulated_wau_pct": 0.25, "simulated_time_reduction_pct": 0.06},
        )
        assert sim_resp.status_code == 200
        sim_data = sim_resp.json()
        new_score = sim_data["health"]["final_score"]
        assert new_score < 45.0
        assert sim_data["health"]["band"] in ["At Risk", "Healthy but Watch"]
        assert sim_data["expansion"]["all_met"] is False
        assert sim_data["expansion"]["verdict"] in ["HOLD", "INTERVENE"]
    finally:
        # Reset back to seed
        reset_resp = client.post("/api/accounts/reset")
        assert reset_resp.status_code == 200


def test_pricing_simulation_endpoint():
    payload = {
        "pilot_price": 12000.0,
        "pilot_users": 50,
        "expansion_wau_threshold": 0.60,
        "usage_credit_rate": 0.40,
        "full_price_per_user": 30.0,
        "pilot_to_expansion_conversion_pct": 65.0,
        "monthly_churn_pct": 1.5,
        "gross_margin_pct": 76.5,
        "new_pilots_per_month": 6,
        "workflow_runs_per_user_month": 140,
        "workflow_run_allowance": 100,
    }
    response = client.post("/api/pricing/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "arr_12m" in data
    assert "arr_24m" in data
    assert "northbridge_shadow" in data
    assert len(data["monthly_projections"]) == 24


def test_trust_fact_base_and_copilot_fallback():
    # Fact base endpoint
    fb_resp = client.get("/api/trust/fact-base")
    assert fb_resp.status_code == 200
    facts = fb_resp.json()
    assert len(facts) >= 4

    # Trust copilot call with certification objection (tests honest claim limitation)
    tc_resp = client.post(
        "/api/groq/trust-copilot",
        json={"question": "Do you hold a completed SOC2 Type II certification?"},
    )
    assert tc_resp.status_code == 200
    res = tc_resp.json()
    assert "step1_acknowledge" in res
    assert "step3_evidence" in res
    assert "step4_claim_limits" in res
    assert "overclaim_guard" in res
    # Must enforce boundary: SOC2 Type II in progress, NOT completed
    assert any("in progress" in c.lower() or "in-progress" in c.lower() for c in res["overclaim_guard"]["unsupported_or_limited_claims"])


def test_adoption_doctor_fallback_endpoint():
    resp = client.post("/api/groq/adoption-doctor/acct_acme_corp")
    assert resp.status_code == 200
    doc = resp.json()
    assert "status" in doc
    assert "evidence" in doc
    assert len(doc["evidence"]) >= 3
    assert "AUTHORIZE_EXPANSION" in doc["expansion_recommendation"] or "EXPAND" in doc["expansion_recommendation"]
