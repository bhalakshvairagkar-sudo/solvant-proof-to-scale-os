import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.research_data import (
    GTM_RESEARCH_INTELLIGENCE,
    ADOPTION_GAP_MATRIX,
    PRICING_BENCHMARK_TEARDOWN,
    SOLVANT_STRATEGIC_SYNTHESIS,
)
from app.trust_copilot import get_deterministic_trust_response, get_fact_base

client = TestClient(app)


def test_research_full_suite_endpoint():
    """Verify GET /api/research/full-suite returns all 4 research components."""
    response = client.get("/api/research/full-suite")
    assert response.status_code == 200
    data = response.json()
    assert "gtm_intelligence" in data
    assert "adoption_gap_matrix" in data
    assert "pricing_benchmark" in data
    assert "synthesis" in data


def test_gtm_intelligence_three_named_companies():
    """Verify research covers Atlassian, Salesforce, and ServiceNow with all required dimensions."""
    companies = {item["company"]: item for item in GTM_RESEARCH_INTELLIGENCE}
    assert "Atlassian" in companies
    assert "Salesforce" in companies
    assert "ServiceNow" in companies

    # Check Atlassian requirements
    atl = companies["Atlassian"]
    assert "workflow" in atl["land_motion"].lower() or "team" in atl["land_motion"].lower()
    assert "expansion" in atl["expansion_motion"].lower()
    assert "workflow-led expansion" in atl["transferable_lesson"].lower()
    assert "installed base" in atl["non_transferable_lesson"].lower() or "distribution" in atl["non_transferable_lesson"].lower()
    assert "challenger" in atl["why_not_transferable"].lower()

    # Check Salesforce requirements
    sfdc = companies["Salesforce"]
    assert "enterprise ecosystem" in sfdc["land_motion"].lower()
    assert "agentforce" in sfdc["expansion_motion"].lower() or "agentforce" in sfdc["ai_mechanism"].lower()
    assert "consumption" in sfdc["pricing_model"].lower()
    assert "monetized through measurable consumption" in sfdc["transferable_lesson"].lower()
    assert "distribution" in sfdc["non_transferable_lesson"].lower() or "relationships" in sfdc["non_transferable_lesson"].lower()

    # Check ServiceNow requirements
    now = companies["ServiceNow"]
    assert "workflow" in now["land_motion"].lower() or "itsm" in now["land_motion"].lower()
    assert "now assist" in now["ai_mechanism"].lower()
    assert "meaningful ai work" in now["transferable_lesson"].lower()
    assert "distribution" in now["non_transferable_lesson"].lower() or "workflow" in now["non_transferable_lesson"].lower()


def test_adoption_gap_matrix_eight_causes_and_classification():
    """Verify 8 empirical root causes classified into YES, PARTIAL, NO."""
    assert len(ADOPTION_GAP_MATRIX) == 8
    causes = {item["root_cause"]: item for item in ADOPTION_GAP_MATRIX}

    expected_causes = [
        "Poor workflow fit",
        "Weak onboarding",
        "Lack of training",
        "No champion",
        "Poor data/context",
        "Weak manager reinforcement",
        "Organizational resistance",
        "Budget/business priority changes",
    ]
    for c in expected_causes:
        assert c in causes, f"Missing root cause: {c}"
        assert causes[c]["can_gtm_fix"] in ["YES", "PARTIAL", "NO"]
        assert len(causes[c]["how_solvant_remediates"]) > 20
        assert len(causes[c]["doctor_connection"]) > 10

    # Specific classifications
    assert causes["Poor workflow fit"]["can_gtm_fix"] == "PARTIAL"
    assert causes["Weak onboarding"]["can_gtm_fix"] == "YES"
    assert causes["Lack of training"]["can_gtm_fix"] == "YES"
    assert causes["No champion"]["can_gtm_fix"] == "YES"
    assert causes["Poor data/context"]["can_gtm_fix"] == "PARTIAL"
    assert causes["Weak manager reinforcement"]["can_gtm_fix"] == "PARTIAL"
    assert causes["Organizational resistance"]["can_gtm_fix"] == "NO"
    assert causes["Budget/business priority changes"]["can_gtm_fix"] == "NO"


def test_pricing_benchmark_teardown_and_citations():
    """Verify 4 companies with publicly listed pricing and sources (no invented prices)."""
    assert len(PRICING_BENCHMARK_TEARDOWN) >= 4
    by_company = {item["company"]: item for item in PRICING_BENCHMARK_TEARDOWN}

    # Microsoft 365 Copilot
    assert "Microsoft 365 Copilot" in by_company
    ms = by_company["Microsoft 365 Copilot"]
    assert "$30" in ms["list_price"]
    assert "YES" in ms["seat_based"]
    assert "NO" in ms["usage_based"]
    assert "NO" in ms["ai_specific_meter"]
    assert "source" in ms and len(ms["source"]) > 15

    # Salesforce Agentforce
    assert "Salesforce Agentforce" in by_company
    sf = by_company["Salesforce Agentforce"]
    assert "$2.00" in sf["list_price"] or "$2" in sf["list_price"]
    assert "HYBRID" in sf["seat_based"]
    assert "YES" in sf["usage_based"]
    assert "YES" in sf["ai_specific_meter"]
    assert "source" in sf and len(sf["source"]) > 15

    # Atlassian
    assert "Atlassian" in by_company
    atl = by_company["Atlassian"]
    assert "source" in atl and len(atl["source"]) > 15

    # ServiceNow
    assert "ServiceNow" in by_company
    now = by_company["ServiceNow"]
    assert "source" in now and len(now["source"]) > 15


def test_solvant_strategic_synthesis_thesis_and_pipeline():
    """Verify Solvant strategic thesis and 6-stage pipeline."""
    assert SOLVANT_STRATEGIC_SYNTHESIS["core_thesis"] == "Incumbents monetize distribution. Solvant must monetize proof."
    steps = SOLVANT_STRATEGIC_SYNTHESIS["pipeline_steps"]
    assert len(steps) == 6
    step_titles = [s["title"].lower() for s in steps]
    assert any("narrow" in t for t in step_titles)
    assert any("pilot" in t for t in step_titles)
    assert any("adoption" in t for t in step_titles)
    assert any("outcome" in t for t in step_titles)
    assert any("expansion" in t for t in step_titles)
    assert any("monetization" in t for t in step_titles or "usage" in t)


def test_trust_copilot_cfo_structure_for_core_objections():
    """Verify Data Residency, Model Training, and Vendor Lock-in return CFO 5-part structure."""
    objections = [
        ("Where is our financial data stored and who has access?", "data_residency"),
        ("Do you train AI models on our proprietary ledger?", "model_training"),
        ("What happens if we terminate our contract?", "vendor_lockin"),
    ]

    for q, expected_topic in objections:
        resp = get_deterministic_trust_response(q)
        # Check CFO 5-part structure fields are populated
        assert len(resp.the_concern) > 10, f"the_concern empty for {expected_topic}"
        assert len(resp.what_solvant_does) > 10, f"what_solvant_does empty for {expected_topic}"
        assert len(resp.what_customer_controls) > 10, f"what_customer_controls empty for {expected_topic}"
        assert len(resp.what_customer_can_verify) > 10, f"what_customer_can_verify empty for {expected_topic}"
        assert len(resp.what_solvant_does_not_claim) > 10, f"what_solvant_does_not_claim empty for {expected_topic}"

        # Overclaim guard is active
        assert resp.overclaim_guard.status in ["VERIFIED_GROUNDED", "BOUNDARY_ENFORCED"]
        assert resp.overclaim_guard.facts_grounded_count >= 2
        assert len(resp.overclaim_guard.verified_claims) >= 2


def test_no_unsupported_tenant_ingestion_claims():
    """Verify that unsupported claims regarding Microsoft tenant ingestion are removed."""
    from app.wedge_data import ADVERSARIAL_CURVEBALL_REHEARSALS
    for item in ADVERSARIAL_CURVEBALL_REHEARSALS:
        rebuttal = item.get("adversarial_rebuttal", "")
        assert "requires full tenant data ingestion" not in rebuttal, "Found forbidden unsupported claim!"
