from typing import List, Dict, Any

WEDGE_COMPARISON_MATRIX: List[Dict[str, Any]] = [
    {
        "workflow": "FP&A Variance Analysis & Management Reporting",
        "category": "Chosen Land Wedge (Winner)",
        "pain_score": 9.5,
        "frequency_score": 9.0,
        "measurability_score": 9.8,
        "pilotability_score": 9.2,
        "total_composite_score": 9.38,
        "buyer": "VP Finance / Head of FP&A",
        "champion": "FP&A Operations Lead",
        "task_scope": "Retrieve approved general ledger data, isolate variance drivers (volume vs price vs timing vs FX), draft commentary with source citations, hand to analyst for human-in-the-loop verification.",
        "why_it_wins": "Repetitive monthly close cadence (every 30 days), quantifiable hours saved (28%), direct CFO visibility, zero multi-system automation risk (analyst remains author of record).",
        "is_selected_wedge": True,
        "analytical_verdict": "SELECTED AS PRIMARY LAND WEDGE: Meets all 4 pilot criteria without legal liability exposure.",
    },
    {
        "workflow": "Procurement Contract Review & Vendor Deviation",
        "category": "Runner-Up Analyzed (Self-Referential Angle)",
        "pain_score": 9.2,
        "frequency_score": 6.8,
        "measurability_score": 7.5,
        "pilotability_score": 6.8,
        "total_composite_score": 7.58,
        "buyer": "Head of Strategic Sourcing / Legal Ops",
        "champion": "Senior Category Manager",
        "task_scope": "Redline supplier standard terms against company playbook, audit SaaS contract seat utilization, flag uncapped indemnification clauses, calculate net unit price deltas.",
        "why_it_wins": "High contract dollar value and appealing self-referential narrative ('using AI to audit and negotiate software procurement, including incumbent AI licenses').",
        "is_selected_wedge": False,
        "analytical_verdict": "EXPLICITLY REJECTED AS DAY-1 LAND WEDGE: High legal liability on contract redlines causes General Counsel to delay 60-day pilot sign-off; episodic renewal cadence lacks the monthly heartbeat of FP&A close. Designated as GRADUATED EXPANSION WEDGE #1 once FP&A establishes organizational trust.",
    },
    {
        "workflow": "Internal HR & Employee Policy Q&A",
        "category": "Rejected Wedge (Incumbent Commodity Trap)",
        "pain_score": 5.5,
        "frequency_score": 8.0,
        "measurability_score": 4.0,
        "pilotability_score": 8.5,
        "total_composite_score": 6.50,
        "buyer": "Chief People Officer / HR Operations",
        "champion": "HR Ops Specialist",
        "task_scope": "Answer employee handbook inquiries, PTO questions, benefit summaries.",
        "why_it_wins": "Low barrier to entry, but impossible to defend.",
        "is_selected_wedge": False,
        "analytical_verdict": "COMMODITIZED TRAP: Bundled free by Slack/Microsoft; impossible to prove hard dollar ROI to CFO; zero switching cost or adoption moat.",
    },
]

COMPETITOR_PRICING_TEARDOWNS: List[Dict[str, Any]] = [
    {
        "competitor": "Snowflake & Datadog",
        "model_type": "Pure Consumption Pricing (Credits & Compute Units)",
        "pricing_mechanics": "Snowflake credits ($2.00–$4.00/credit) & Datadog hosts/custom metrics. Customers commit to an annual dollar pool and burn down against actual machine compute.",
        "why_it_succeeds": "Unmatched initial customer alignment: zero shelfware risk on day 1. Customers only pay for what runs, driving rapid developer adoption.",
        "failure_mode_in_genai": "The 'Bill Shock' Trap: CFOs dread unconstrained consumption for knowledge workers. A single unconstrained query loop or runaway token task can burn $5,000 in minutes. Result: Enterprise CFOs mandate hard seat caps or freeze consumption pilots.",
        "solvant_solution": "Hybrid Metered Certainty: $30/active-user/month (metered on WAU, not seats) + predictable usage-credit buffers ($0.40/run above 100). Zero bill shock; 100% active-usage alignment.",
    },
    {
        "competitor": "Microsoft 365 Copilot",
        "model_type": "Flat Seat-License Tax ($30/user/mo Pre-paid Annually)",
        "pricing_mechanics": "$30/user/month ($360/year/user) billed upfront as an add-on to Microsoft 365 E3/E5 enterprise agreements. Full headcount commitment required.",
        "why_it_succeeds": "Leverages existing enterprise procurement paper and bundled distribution; easy for IT to buy in bulk on existing agreements.",
        "failure_mode_in_genai": "The 67% Shelfware Penalty: Under our explicitly labeled illustrative industry assumption — 33% utilization after 90 days, for a 1,000-seat company ($360k commit), only 330 people use it: effective cost = $90.90 per active user/month! The company pays $241k/yr for ghost seats.",
        "solvant_solution": "Customer-Verifiable Metering: Solvant bills only the 330 active users ($30 * 330 = $9,900/mo vs Microsoft $30,000/mo). Solvant saves the customer $241,200/year while tying expansion directly to verified hours saved.",
    },
]

THREE_LAYER_MOAT: List[Dict[str, str]] = [
    {
        "layer": "1. Workflow-Specific Configuration",
        "description": "Deep ledger taxonomy mappings, custom ERP driver formulas, and finance team vocabulary tuned during the 60-day pilot. Cannot be replicated by dropping a generic chat assistant on top of raw spreadsheets.",
        "defensibility": "High switching cost: removing Solvant breaks the monthly reporting pipeline and analyst workflow memory.",
    },
    {
        "layer": "2. Adoption-Intervention History",
        "description": "Granular record of user activation bottlenecks, prompt refinements, and custom finance training logs accumulated over months.",
        "defensibility": "Organizational lock-in: incumbent IT vendors sell licenses, not adoption change management.",
    },
    {
        "layer": "3. Outcome-Verified Data Trail",
        "description": "Cryptographically auditable log of 500+ verified monthly commentary outputs, exact time savings, and analyst sign-offs stored in customer's own cloud.",
        "defensibility": "Audit proof: CFO cannot justify replacing a proven 28% time-saving tool with an unmeasured free bundled seat.",
    },
]

# Multi-Turn Adversarial Curveball Rehearsal Pairs
ADVERSARIAL_CURVEBALL_REHEARSALS: List[Dict[str, Any]] = [
    {
        "persona": "Adversarial CISO (Playing Hardball on SOC2)",
        "initial_objection": "Do you hold a completed SOC2 Type II certification right now?",
        "solvant_opening": "No, and we will state that plainly: we hold a completed SOC2 Type I. SOC2 Type II is currently in its 6-month audit observation period with our AICPA auditor, targeting completion in Q4.",
        "adversarial_followup": "Then why should my risk committee approve routing general ledger data to an uncertified early-stage vendor instead of Microsoft?",
        "adversarial_rebuttal": "Because Microsoft requires full tenant data ingestion into their multi-tenant cloud. Solvant deploys stateless inference in your designated regional VPC boundary under Zero Data Retention (ZDR) agreements. Our $12k deposit is 100% refundable if our SOC2 Type I package and security addendum do not clear your CISO review. We give you contractual verification, not marketing claims.",
    },
    {
        "persona": "Skeptical CFO (Defending Bundled Microsoft E5)",
        "initial_objection": "Microsoft gives us Copilot in our E5 bundle. Why should I write a $12k check for Solvant?",
        "solvant_opening": "Microsoft gives you seats, not active usage. Under our illustrative industry assumption — 33% utilization after month 3, you end up paying $90/active-user on wasted shelfware.",
        "adversarial_followup": "My Microsoft rep claims Excel Copilot already does variance analysis. Why can't my analysts just use that for free?",
        "adversarial_rebuttal": "Generic Excel Copilot writes cell formulas and generic summaries; it cannot isolate volume vs price variance across multi-entity ERP ledgers with citation stamps and audit approvals. More critically: Microsoft charges you whether your team uses it or not. With Solvant, expansion is legally gated on your own internal logs hitting 60% WAU and 20% time reduction. If your team doesn't verify the value, you get your $12,000 back.",
    },
    {
        "persona": "Head of Procurement (Pushing on Deposit Refund SLA)",
        "initial_objection": "How do we get our $12,000 back if you fail the 60-day pilot?",
        "solvant_opening": "The $12,000 deposit is escrowed against 6 objective thresholds locked before Day 1: activation ≥70%, WAU ≥60%, repeat usage ≥50%, workflow time reduction ≥20%, ≥500 verified outputs, and CSAT ≥4.2/5.",
        "adversarial_followup": "Who determines whether the '20% workflow time reduction' was met? Do you calculate that, or do we?",
        "adversarial_rebuttal": "Your own system logs determine it. Solvant code computes time-delta between task initiation and verified analyst sign-off timestamp. At Day 60, if your logged time reduction is 18% instead of 20%, the expansion trigger automatically locks out and the $12,000 refund is disbursed to your accounts payable within 10 business days. The customer's data decides, never Solvant.",
    },
]

BUYER_OBJECTIONS: List[Dict[str, str]] = [
    {
        "persona": "CFO / Economic Buyer",
        "question": "Microsoft already bundles Copilot in our enterprise agreement. Why should I approve an additional $12k pilot for Solvant?",
        "suggested_query": "Why pay for Solvant when Microsoft Copilot is already bundled in our enterprise agreement?",
    },
    {
        "persona": "CISO / InfoSec",
        "question": "Where is our confidential ledger data processed, and do your models train on our proprietary forecasts?",
        "suggested_query": "Where is our financial data stored and do you train models on our internal ledgers?",
    },
    {
        "persona": "Head of Procurement",
        "question": "What happens if we do not hit your 60% active usage threshold by Day 60? Do we get our $12,000 back?",
        "suggested_query": "What happens if we do not hit your 60% active usage threshold by Day 60? Is the deposit refunded?",
    },
    {
        "persona": "Compliance & Audit Lead",
        "question": "Can you provide your SOC2 Type II and GDPR certificates before we route financial data?",
        "suggested_query": "Can you provide your SOC2 Type II and GDPR certificates before we route financial data?",
    },
]
