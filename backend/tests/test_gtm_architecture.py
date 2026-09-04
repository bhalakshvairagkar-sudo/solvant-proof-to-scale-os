import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.gtm_architecture import evaluate_ostrava_decision, GTM_CONNECTED_STAGES

client = TestClient(app)


def test_gtm_architecture_endpoint():
    """Verify GET /api/gtm-architecture returns all 9 connected stages."""
    response = client.get("/api/gtm-architecture")
    assert response.status_code == 200
    data = response.json()
    assert "connected_stages" in data
    assert len(data["connected_stages"]) == 9
    stage_ids = [s["id"] for s in data["connected_stages"]]
    assert stage_ids == [
        "wedge",
        "land",
        "pricing",
        "adoption",
        "outcome",
        "expansion_trigger",
        "monetization",
        "trust",
        "defensibility",
    ]


def test_ostrava_decision_differentiated_defends_and_expands():
    """When verified outcome is materially differentiated, code deterministically outputs DEFEND_AND_EXPAND."""
    resp = evaluate_ostrava_decision(materially_differentiated=True, alternative_pain_available=True)
    assert resp.verdict == "DEFEND_AND_EXPAND"
    assert "Material Outcome Differentiation" in resp.headline
    assert any("28% hours saved" in a for a in resp.action_plan)
    assert any("Procurement Contract Review" in a for a in resp.action_plan)
    assert resp.contingency_stage == "DEFENSE_ACTIVE_AND_EXPANDING"


def test_ostrava_decision_not_differentiated_pivots_wedge():
    """When outcome is parity but alternative pain is available, code outputs MOVE_WEDGE."""
    resp = evaluate_ostrava_decision(materially_differentiated=False, alternative_pain_available=True)
    assert resp.verdict == "MOVE_WEDGE"
    assert "Pivot Primary Wedge" in resp.headline
    assert any("Procurement Contract Review" in a for a in resp.action_plan)
    assert resp.contingency_stage == "WEDGE_PIVOTED"


def test_ostrava_decision_no_secondary_wedge_halts():
    """When outcome is parity and no alternative wedge exists, code outputs STOP_AND_REASSESS."""
    resp = evaluate_ostrava_decision(materially_differentiated=False, alternative_pain_available=False)
    assert resp.verdict == "STOP_AND_REASSESS"
    assert "Gracefully Halt" in resp.headline
    assert any("Refund customer pilot deposits" in a for a in resp.action_plan)
    assert resp.contingency_stage == "GRACEFUL_HALT"


def test_ostrava_decision_endpoint():
    """Verify POST /api/gtm-architecture/ostrava-decision."""
    response = client.post(
        "/api/gtm-architecture/ostrava-decision",
        json={"materially_differentiated": True, "alternative_pain_available": True},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "DEFEND_AND_EXPAND"


def test_prohibited_actions_enforcement():
    """Verify that prohibited reactions are explicitly tracked."""
    response = client.get("/api/gtm-architecture")
    data = response.json()
    prohibited = " ".join(data["prohibited_actions"]).lower()
    assert "match free pricing" in prohibited
    assert "discounting" in prohibited
    assert "feature war" in prohibited
    assert "better ai" in prohibited
