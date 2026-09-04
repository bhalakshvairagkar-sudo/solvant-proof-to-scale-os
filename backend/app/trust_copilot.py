from typing import Dict, List, Optional
from app.models import TrustCopilotResponse, OverclaimGuard, TrustFactItem


# CLOSED TRUST FACT BASE (Immutable truth source)
TRUST_FACT_BASE: List[TrustFactItem] = [
    TrustFactItem(
        id="fact_data_residency",
        category="Data Residency & Storage",
        title="Customer-Selected Cloud Boundary",
        status="ACTIVE",
        detail="All customer financial data, variance notes, and telemetry remain strictly inside the customer's selected cloud region (AWS us-east-1, us-west-2, or EU Frankfurt). Solvant deploys stateless inference containers with zero cross-border egress.",
        limits="Does not support on-premise air-gapped mainframe deployments without prior architectural review.",
        evidence_source="Solvant Cloud Architecture Specification v2.4 (AWS VPC Endpoint & KMS policy configuration, terraform-aws-solvant-vpc v1.2)",
    ),
    TrustFactItem(
        id="fact_model_training",
        category="Model Training & IP",
        title="Zero Training on Customer Data",
        status="ACTIVE",
        detail="Customer prompts, financial ledgers, variance analyses, and commentary are never retained, indexed, or used to train or fine-tune public foundation models or shared weights. Groq inference endpoints run under zero-data-retention agreements.",
        limits="Customer must opt in explicitly via written agreement if they wish to train a private, customer-dedicated LoRA adapter.",
        evidence_source="Commercial Groq API Zero Data Retention Addendum §4.2 & Enterprise Data Processing Agreement §7",
    ),
    TrustFactItem(
        id="fact_vendor_lockin",
        category="Exportability & Lock-in",
        title="Full Open-Standard Data Exportability",
        status="ACTIVE",
        detail="Customers retain 100% ownership of all generated management reports, variance commentary, and audit trails. Complete dataset export is available anytime via standardized JSON and CSV formats, including full audit timestamps and source citations.",
        limits="Solvant does not provide proprietary spreadsheet macros or native legacy ERP plugin source code.",
        evidence_source="Solvant Open Telemetry & Schema Export Specification RFC-104 (JSON/CSV REST Endpoints)",
    ),
    TrustFactItem(
        id="fact_compliance_certifications",
        category="Certifications & Audit Status",
        title="SOC2 Type I Complete; Type II In-Progress",
        status="AUDIT_IN_PROGRESS",
        detail="SOC2 Type I audit is complete and available under NDA. SOC2 Type II is actively underway with an independent auditor across a 6-month observation period (target completion Q4). GDPR-aligned technical controls (Article 28 DPA, tenant data isolation, encryption in transit TLS 1.3 and at rest AES-256) are operational.",
        limits="Formal SOC2 Type II report is NOT yet issued. Formal third-party external GDPR certification is NOT yet held. We state this plainly and do not claim unverified badges.",
        evidence_source="AICPA SOC 2 Type I Examination Report (Issued June 2026 by Schellman & Co.); AICPA Engagement Letter Ref #SC-2026-992",
    ),
]


# Verified deterministic fallbacks for core objections
VERIFIED_OBJECTION_RESPONSES: Dict[str, TrustCopilotResponse] = {
    "data_residency": TrustCopilotResponse(
        step1_acknowledge="We understand that corporate financial data and ledger commentary require strict sovereign boundary guarantees.",
        step2_clarify="The question is whether Solvant stores or routes your financial inputs through multi-tenant or foreign cloud environments.",
        step3_evidence="Per our Data Residency Fact Base: all inference occurs within your designated cloud region (e.g., AWS us-east-1 or EU Frankfurt). Groq inference endpoints operate under zero-data-retention (ZDR) contracts with strict stateless execution.",
        step4_claim_limits="We do not claim support for air-gapped on-premise deployments; our architecture relies on customer-selected sovereign VPC boundaries with TLS 1.3 encryption.",
        step5_risk_reduction="During the 60-day pilot, all deployment occurs inside your designated tenant with your own KMS keys, backed by our $12,000 refundable-against-value deposit.",
        overclaim_guard=OverclaimGuard(
            status="VERIFIED_GROUNDED",
            facts_grounded_count=2,
            verified_claims=[
                "Customer-selected regional tenancy (US/EU)",
                "Stateless inference with Zero Data Retention (ZDR)",
                "Customer KMS key support",
            ],
            unsupported_or_limited_claims=[
                "Air-gapped on-premise mainframe deployment not supported",
            ],
        ),
        is_live_llm=False,
        model_used="verified-fact-base-v1",
    ),
    "model_training": TrustCopilotResponse(
        step1_acknowledge="Protecting your strategic forecasts and proprietary margins from leaking into shared AI weights is an absolute priority.",
        step2_clarify="You are confirming whether any finance analyst inputs, ledger numbers, or commentary become part of LLM training sets.",
        step3_evidence="Under our core security architecture: customer data is never used to train, retrain, or fine-tune public foundation models. We execute strictly via zero-retention commercial API agreements where prompts are discarded immediately after token generation.",
        step4_claim_limits="We do not automatically produce private custom weights unless your enterprise explicitly contracts for an isolated, customer-dedicated LoRA adapter running in your VPC.",
        step5_risk_reduction="Your enterprise retains full intellectual property ownership of all variance commentary, verified outputs, and prompt templates, auditable in your pilot logs.",
        overclaim_guard=OverclaimGuard(
            status="VERIFIED_GROUNDED",
            facts_grounded_count=2,
            verified_claims=[
                "Zero training on customer prompts or financial ledgers",
                "Prompts discarded post-generation under ZDR agreements",
                "100% customer IP ownership on generated outputs",
            ],
            unsupported_or_limited_claims=[
                "Private fine-tuning requires separate dedicated VPC agreement",
            ],
        ),
        is_live_llm=False,
        model_used="verified-fact-base-v1",
    ),
    "vendor_lockin": TrustCopilotResponse(
        step1_acknowledge="Enterprise CFOs rightfully avoid adopting point solutions that trap their historical workflows or commentary in closed formats.",
        step2_clarify="You are evaluating how easily your team can retrieve its verified variance notes and audit logs if you choose not to expand.",
        step3_evidence="All variance commentary, data citations, approval stamps, and user logs are exportable at any time via open-standard JSON and CSV formats. Nothing is encapsulated in proprietary black-box blobs.",
        step4_claim_limits="Solvant does not provide proprietary ERP connector binary source code, but guarantees that all customer-generated artifacts and data mappings remain fully portable.",
        step5_risk_reduction="Expansion is gated entirely on your own internal logs hitting 60% WAU and 20% time reduction. If thresholds are missed, you walk away with your full exported audit trail and your $12,000 deposit refunded.",
        overclaim_guard=OverclaimGuard(
            status="VERIFIED_GROUNDED",
            facts_grounded_count=2,
            verified_claims=[
                "Open standard JSON/CSV structured exports",
                "Full audit trail and citation records included",
                "Zero proprietary encapsulation lock-in",
            ],
            unsupported_or_limited_claims=[
                "Does not include ERP connector proprietary source code",
            ],
        ),
        is_live_llm=False,
        model_used="verified-fact-base-v1",
    ),
    "certifications": TrustCopilotResponse(
        step1_acknowledge="Security and risk committees need unambiguous clarity on our current regulatory and compliance audit posture.",
        step2_clarify="You are asking whether Solvant currently holds SOC2 Type II, ISO 27001, or formal external GDPR certifications.",
        step3_evidence="We have completed SOC2 Type I audit certification (available under NDA). Our technical controls are operational: tenant isolation, TLS 1.3 transit encryption, AES-256 storage encryption, and GDPR Article 28 Data Processing Agreements.",
        step4_claim_limits="We state plainly: SOC2 Type II is currently IN PROGRESS (active 6-month observation period through Q4), NOT yet completed. Formal external GDPR certification is NOT yet held. We will not overclaim compliance badges we have not completed.",
        step5_risk_reduction="We offer security review against our SOC2 Type I package, an agreed security addendum, and the pilot's 60-day refundable deposit if our controls fail your CISO evaluation.",
        overclaim_guard=OverclaimGuard(
            status="BOUNDARY_ENFORCED",
            facts_grounded_count=2,
            verified_claims=[
                "SOC2 Type I audit complete and report available under NDA",
                "AES-256 encryption at rest, TLS 1.3 in transit",
                "GDPR Article 28 DPA operational",
            ],
            unsupported_or_limited_claims=[
                "SOC2 Type II is currently IN-PROGRESS (target Q4), not yet completed",
                "Formal external third-party GDPR certification is not held",
            ],
        ),
        is_live_llm=False,
        model_used="verified-fact-base-v1",
    ),
}


def get_fact_base() -> List[TrustFactItem]:
    return TRUST_FACT_BASE


def get_deterministic_trust_response(query: str) -> TrustCopilotResponse:
    q = query.lower()
    if any(k in q for k in ["residency", "region", "where", "store", "frankfurt", "us-east"]):
        return VERIFIED_OBJECTION_RESPONSES["data_residency"]
    elif any(k in q for k in ["train", "weights", "ledger", "retrain", "data used"]):
        return VERIFIED_OBJECTION_RESPONSES["model_training"]
    elif any(k in q for k in ["lock", "export", "leave", "proprietary", "terminate"]):
        return VERIFIED_OBJECTION_RESPONSES["vendor_lockin"]
    elif any(k in q for k in ["soc2", "soc", "type ii", "type 2", "certif", "gdpr", "iso"]):
        return VERIFIED_OBJECTION_RESPONSES["certifications"]
    else:
        # Default to comprehensive trust overview grounded in the fact base
        return VERIFIED_OBJECTION_RESPONSES["certifications"]
