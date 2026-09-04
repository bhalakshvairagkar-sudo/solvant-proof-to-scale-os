from typing import List, Dict, Any

# ==============================================================================
# PART A: GTM RESEARCH INTELLIGENCE (Atlassian, Salesforce, ServiceNow)
# ==============================================================================
GTM_RESEARCH_INTELLIGENCE: List[Dict[str, Any]] = [
    {
        "company": "Atlassian",
        "ticker": "NASDAQ: TEAM",
        "market_position": "Dominant developer, IT, and agile project management collaboration suite (>300,000 customers)",
        "land_motion": "Bottom-up, team-level self-serve entry via Jira Software and Confluence with minimal procurement friction.",
        "expansion_motion": "Cross-product virality (Jira -> Confluence -> Jira Service Management) and user tier expansion into enterprise cloud agreements.",
        "pricing_model": "Tiered per-seat subscription (Standard, Premium, Enterprise) with emerging consumption credits for AI agents.",
        "ai_mechanism": "Atlassian Intelligence: leverages the internal Work Graph (linking code commits, tickets, and docs) to power virtual service agents and auto-summaries.",
        "why_it_works": "Deep context advantage from sitting in the daily collaborative workflow; team members naturally invite cross-functional colleagues.",
        "transferable_lesson": "Workflow-led expansion and usage monetization: winning a specific daily operational routine (e.g. Jira sprint tracking or Solvant monthly variance analysis) creates natural user habit.",
        "non_transferable_lesson": "Reliance on massive existing installed base and viral self-serve distribution.",
        "why_not_transferable": "A challenger enterprise AI startup has zero installed seats on Day 1. It cannot wait for organic viral expansion across a 300,000-customer ecosystem; it must earn every expansion through verified mathematical proof.",
    },
    {
        "company": "Salesforce",
        "ticker": "NYSE: CRM",
        "market_position": "Global CRM and customer enterprise ecosystem leader (>150,000 enterprise customers)",
        "land_motion": "Top-down enterprise ecosystem sale landing core Sales Cloud or Service Cloud departmental commitments.",
        "expansion_motion": "Multi-cloud expansion (Service, Marketing, Commerce, Data Cloud) and newly launched Agentforce autonomous agent deployments.",
        "pricing_model": "Hybrid seat + consumption: base user seat licenses ($25–$500/user/mo) plus $2 per conversation for Agentforce autonomous actions.",
        "ai_mechanism": "Agentforce: autonomous AI agents integrated into Salesforce Data Cloud and CRM workflows that trigger actions and conversations across customer touchpoints.",
        "why_it_works": "Owns the authoritative enterprise System of Record for customer relationships; AI agents have immediate read/write access to business context.",
        "transferable_lesson": "AI value can and should be monetized through measurable consumption (actions, tasks, completed workflows) rather than purely flat seat licensing.",
        "non_transferable_lesson": "Enormous enterprise distribution, pre-existing master service agreements (MSAs), and multi-decade executive buyer relationships.",
        "why_not_transferable": "Salesforce can append consumption pricing to an already locked-in multi-million dollar annual contract. A challenger cannot pitch consumption without proving that the underlying AI actually performs the work reliably.",
    },
    {
        "company": "ServiceNow",
        "ticker": "NYSE: NOW",
        "market_position": "Enterprise digital workflow and IT service management backplane (>8,100 enterprise customers, 85% of Fortune 500)",
        "land_motion": "Workflow-led enterprise entry starting in IT Service Management (ITSM) and help desk ticketing infrastructure.",
        "expansion_motion": "Expanding into adjacent enterprise workflows (HR Service Delivery, Customer Service, Security Operations, Creator Workflows) and Now Assist generative AI add-ons.",
        "pricing_model": "Core platform licensing tiers (Pro, Enterprise) with Now Assist add-on SKUs and Assist consumption transaction packs.",
        "ai_mechanism": "Now Assist: specialized generative AI models integrated into workflow steps for ticket summarization, code assist, incident deflection, and knowledge creation.",
        "why_it_works": "Embedded directly in high-volume, structured operational workflows where ticket resolution time directly equates to quantified labor savings.",
        "transferable_lesson": "Meter meaningful AI work (completed business workflows, resolved items, verified variance notes) rather than blindly charging for raw tokens or static logins.",
        "non_transferable_lesson": "Pre-existing ownership of enterprise workflow plumbing and IT system governance.",
        "why_not_transferable": "ServiceNow already routes the enterprise's mission-critical tickets. A challenger enters as an unproven external system and must establish trust through a risk-free pilot before it can touch enterprise core workflows.",
    },
]

# ==============================================================================
# PART B: ADOPTION GAP RESEARCH MATRIX
# ==============================================================================
ADOPTION_GAP_MATRIX: List[Dict[str, Any]] = [
    {
        "root_cause": "Poor workflow fit",
        "can_gtm_fix": "PARTIAL",
        "how_solvant_remediates": "Forward Deployed Engineers narrow scope to repetitive, high-frequency tasks with structured inputs (monthly FP&A variance analysis) rather than generic open-ended chat prompts.",
        "doctor_connection": "Adoption Doctor detects high login rate but low workflow run count; triggers 'Use-Case Narrow & Deepen Playbook' to eliminate workflow friction.",
    },
    {
        "root_cause": "Weak onboarding",
        "can_gtm_fix": "YES",
        "how_solvant_remediates": "Implement guided 1-click template workflows, automated ERP/ledger setup verification, and mandatory first-output milestone tracking within Day 0–14.",
        "doctor_connection": "Day-30 Activation Gate flags accounts below 80% activated user threshold; dispatches CSM 1-on-1 analyst setup sessions.",
    },
    {
        "root_cause": "Lack of training",
        "can_gtm_fix": "YES",
        "how_solvant_remediates": "Conduct interactive 45-minute analyst workshops, provide role-specific variance commentary prompt templates, and host weekly FDE office hours.",
        "doctor_connection": "Adoption Doctor detects repetitive prompt errors or low satisfaction scores; triggers 'Prompt & Template Retraining Playbook'.",
    },
    {
        "root_cause": "No champion",
        "can_gtm_fix": "YES",
        "how_solvant_remediates": "Map multi-stakeholder health across 5 roles early; identify internal power users from weekly telemetry and formalize a Champion coaching cadence.",
        "doctor_connection": "Stakeholder Model alerts when End-User Champion is unconfirmed or disengaged; triggers 'Champion Re-engagement Playbook'.",
    },
    {
        "root_cause": "Poor data/context",
        "can_gtm_fix": "PARTIAL",
        "how_solvant_remediates": "Deploy pre-built zero-code connectors to standard ERP/GL systems; configure customer data dictionary and ledger taxonomy during pilot setup.",
        "doctor_connection": "Telemetry captures high analyst manual override rates; prompts FDE schema alignment and ERP connector validation.",
    },
    {
        "root_cause": "Weak manager reinforcement",
        "can_gtm_fix": "PARTIAL",
        "how_solvant_remediates": "Send automated weekly executive summaries highlighting analyst hours saved and variance commentary quality improvements directly to finance managers.",
        "doctor_connection": "System generates weekly ROI digest for VP Finance showing aggregate hours saved and team active usage trends.",
    },
    {
        "root_cause": "Organizational resistance",
        "can_gtm_fix": "NO",
        "how_solvant_remediates": "Cultural inertia and fear of displacement require executive leadership mandate and internal change management. Solvant arms sponsors with verifiable productivity proof.",
        "doctor_connection": "Root-cause engine classifies under 'ORGANIZATIONAL / EXTERNAL' (25% controllability); alerts Executive Sponsor to address team incentives.",
    },
    {
        "root_cause": "Budget/business priority changes",
        "can_gtm_fix": "NO",
        "how_solvant_remediates": "External macro pressures or leadership turnover cannot be solved by GTM tooling alone. Solvant offers a graceful pilot pause or refund guarantee rather than forcing renewal.",
        "doctor_connection": "Classified under 'ORGANIZATIONAL / EXTERNAL' (10% controllability); triggers commercial hold status without burning customer goodwill.",
    },
]

# ==============================================================================
# PART C: PRICING BENCHMARK TEARDOWN (Publicly Listed Pricing with Sources)
# ==============================================================================
PRICING_BENCHMARK_TEARDOWN: List[Dict[str, Any]] = [
    {
        "company": "Microsoft 365 Copilot",
        "pricing_mechanism": "Fixed seat license add-on",
        "list_price": "$30.00 / user / month (prepaid annually at $360 / user / year)",
        "seat_based": "YES (100% seat commitment)",
        "usage_based": "NO (zero usage adjustment)",
        "ai_specific_meter": "NO (flat rate regardless of utilization)",
        "expansion_mechanism": "Enterprise-wide seat expansion on annual renewal or broad enterprise agreement true-up.",
        "solvant_lesson": "Charging flat seats regardless of active usage creates massive shelfware when utilization hits illustrative 33% rates ($90.90/active user effective cost). Solvant bills only active billable users.",
        "source": "Microsoft Official Commercial Pricing & Licensing Guide (Microsoft 365 Copilot Add-on, publicly listed at $30/user/mo with 1-year commit, 2024).",
    },
    {
        "company": "Salesforce Agentforce",
        "pricing_mechanism": "Hybrid seat baseline + per-conversation consumption credits",
        "list_price": "$2.00 per conversation standard, or consumption-based flex credit bundles",
        "seat_based": "HYBRID (base CRM user licenses + consumption)",
        "usage_based": "YES (conversation volume)",
        "ai_specific_meter": "YES (per-conversation / agent task completion credits)",
        "expansion_mechanism": "Expanding agent conversation volume across service, sales, and external channels.",
        "solvant_lesson": "Action/conversation metering directly aligns software cost with business outputs. However, without cost caps, CFOs fear unconstrained spend. Solvant pairs active-user certainty ($30/WAU) with usage allowances.",
        "source": "Salesforce Official Dreamforce 2024 Product & Pricing Announcement (Agentforce listed at $2 per conversation standard, 2024).",
    },
    {
        "company": "Atlassian",
        "pricing_mechanism": "Tiered per-seat subscription with bundled AI in higher tiers",
        "list_price": "Standard ($7.75/user/mo), Premium ($15.25/user/mo), Enterprise ($130k+/yr commit)",
        "seat_based": "YES (primarily per-seat tier structure)",
        "usage_based": "EMERGING (credit limits on virtual service agent interactions)",
        "ai_specific_meter": "HYBRID (Atlassian Intelligence included in Premium/Enterprise; usage allowances on AI agents)",
        "expansion_mechanism": "Cross-product expansion (Jira -> Confluence -> JSM) and user tier upgrades.",
        "solvant_lesson": "Team-level workflow entry is highly effective for initial wedge adoption, but an incumbent has distribution advantages that a challenger must counter with customer-verifiable proof of ROI.",
        "source": "Atlassian Official Cloud Pricing Guide (Jira Software & Cloud Enterprise pricing schedules, 2024).",
    },
    {
        "company": "ServiceNow",
        "pricing_mechanism": "Platform seat licensing + Now Assist generative AI uplift SKUs",
        "list_price": "Typically 30%–50% uplift on Pro/Enterprise packages or packaged assist transactions",
        "seat_based": "HYBRID (Pro/Enterprise user license base + Now Assist add-on)",
        "usage_based": "YES (Assist transaction packs)",
        "ai_specific_meter": "YES (assist transactions and generative task executions)",
        "expansion_mechanism": "Cross-departmental workflow expansion (ITSM -> HR Service Delivery -> Customer Workflows).",
        "solvant_lesson": "Meter meaningful business work rather than raw tokens. But unlike ServiceNow, an unproven challenger cannot demand a platform-wide commitment up front; it must land via a paid proof pilot.",
        "source": "ServiceNow Financial Analyst Day 2024 & Public Commercial License Disclosures (Now Assist SKU packaging).",
    },
]

# ==============================================================================
# STRATEGIC SYNTHESIS
# ==============================================================================
SOLVANT_STRATEGIC_SYNTHESIS: Dict[str, Any] = {
    "core_thesis": "Incumbents monetize distribution. Solvant must monetize proof.",
    "sub_thesis": "A challenger without an installed base cannot sell seat taxes or unconstrained token consumption. Solvant wins by proving workflow adoption first, charging against verified active usage, and expanding only when customer telemetry confirms value.",
    "pipeline_steps": [
        {
            "step": 1,
            "title": "Narrow Workflow Wedge",
            "description": "Target a high-frequency, monthly-cadence task with structured inputs and quantifiable time savings (FP&A Variance Analysis).",
            "proof_point": "28% measured time reduction; human-in-the-loop analyst verification.",
        },
        {
            "step": 2,
            "title": "Paid Pilot",
            "description": "50 users, 60 days, $12,000 deposit. Contractually refundable against 6 objective telemetry thresholds.",
            "proof_point": "Customer's budget authority secured with zero downside risk.",
        },
        {
            "step": 3,
            "title": "Adoption Acceleration",
            "description": "Active monitoring of 30/60/90 milestones with automated stall detection and root-cause playbooks.",
            "proof_point": "Day-45 SLA triggers and Forward Deployed Engineer intervention before pilot stalls.",
        },
        {
            "step": 4,
            "title": "Verified Outcome",
            "description": "Strict customer-verifiable evaluation: WAU ≥60% for 4 weeks, time saved ≥20%, ROI ≥2.0x, completion ≥75%.",
            "proof_point": "Zero vendor self-reporting. Governed strictly by customer's immutable audit log.",
        },
        {
            "step": 5,
            "title": "Customer-Gated Expansion",
            "description": "Expansion from 50 to ~175 seats triggered ONLY when all 5 customer telemetry thresholds pass.",
            "proof_point": "Expansion is earned, not forced. If thresholds fail, deposit is refunded.",
        },
        {
            "step": 6,
            "title": "Active Usage Monetization",
            "description": "$30/active user/month (billed strictly on WAU, not provisioned seats) + $0.40/run usage allowance buffer.",
            "proof_point": "Customer does not pay for inactive shelfware; Solvant generates predictable 76.5% gross margin.",
        },
    ],
    "incumbent_vs_solvant_comparison": {
        "incumbent": {
            "strategy": "Sell all seats upfront on enterprise agreement; bundle AI add-on; collect full annual license fees regardless of adoption.",
            "consequence": "67% shelfware waste, low active utilization, executive buyer frustration at renewal.",
        },
        "solvant": {
            "strategy": "Land narrow wedge on paid pilot; drive daily habit loop; charge only for active billable users; expand on customer's own data.",
            "consequence": "High customer trust, 138% cohort NRR, zero shelfware waste, defensible adoption moat.",
        },
    },
}
