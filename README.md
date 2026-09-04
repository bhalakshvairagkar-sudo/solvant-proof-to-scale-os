# SOLVANT PROOF-TO-SCALE OS — Enterprise AI Adoption Infrastructure

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/bhalakshvairagkar-sudo/solvant-proof-to-scale-os)
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/deploy?template=https://github.com/bhalakshvairagkar-sudo/solvant-proof-to-scale-os)

> **Golden Architectural Rule:** "Code calculates. Groq explains, diagnoses, and communicates."

---

## 1. What This System Does
An **Enterprise AI Adoption Infrastructure** proving Solvant Labs' land-and-expand GTM model:
- **Wedge:** FP&A Variance Analysis & Management Reporting (human-in-the-loop analyst augmentation).
- **Pilot Contract:** 50 users, 60 days (or 30/60/90d selectable), $12,000 refundable-against-value deposit.
- **Usage-Metered Pricing:** $30/active-user/month (metered strictly on verified weekly active users in customer logs, NOT licensed seats) + $0.40/run overage credit. Zero shelfware billing (`billable_active_users = floor(expanded_seats * actual_wau_rate)`).
- **Customer-Verifiable Expansion Trigger:** WAU $\ge$ 60% for 4 consecutive weeks AND workflow time reduction $\ge$ 20% AND 30-day retention $\ge$ 70%.
- **Deterministic Claim Guard:** Strict multi-stage validation (`TRUST FACT BASE -> GROQ DRAFT -> CLAIM EXTRACTION -> DETERMINISTIC CODE VALIDATOR -> SHA-256 AUDIT LOG`).
- **Tamper-Evident Audit Ledger:** Lightweight SHA-256 hash-chained audit trail verifying every pilot milestone, health verdict, and trust response with live tamper detection simulation.
- **Preselected Demo Mode:** 24 calibrated accounts (8 Expansion Ready, 10 Healthy but Watch, 6 At Risk) with 4 pinned anchors: Acme Corp, Meridian Financial, Nova Industries, and Apex Global.
- **30/60/90 Adoption Workstream:** Structured 3-phase milestone and exit gate execution plan.

---

## 2. One-Click Cloud Deployment

### Deploy on Render (Recommended, Free)
Click the badge above or visit:
👉 **[Deploy to Render](https://render.com/deploy?repo=https://github.com/bhalakshvairagkar-sudo/solvant-proof-to-scale-os)**

Render will automatically detect [`render.yaml`](render.yaml) and deploy the unified fullstack web service with zero manual configuration.

---

## 3. Local Quickstart

### Prerequisites
- Python 3.10+
- Node.js 18+

### Run Locally (Single Script)
Double-click `launch_prototype.bat` or run:
```bash
# 1. Start Backend (Terminal 1)
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# 2. Start Frontend (Terminal 2)
cd frontend
npm run dev
```

Open your browser at **`http://localhost:3000`** (or **`http://localhost:8000`** for unified production build).

---

## 4. Architecture

```
                      Frontend (React + Tailwind + Lucide + Recharts)
                      ┌──────────────────────────────────────────────┐
                      │ • Portfolio Overview (24 Synthetic Accounts) │
                      │ • Pinned Demo Anchors (Acme, Meridian, Nova) │
                      │ • Account Drilldown & Decoupled WAU Slider   │
                      │ • 30/60/90 Adoption Workstream Roadmap       │
                      │ • Pricing Simulator (Time-to-Full-Price)     │
                      │ • Per-Account Billing Truth Banner           │
                      │ • Dynamic AI Compute Cost Transparency       │
                      │ • NorthBridge Shadow Overlay ($60/seat tax)  │
                      │ • Competitor Pricing Teardowns               │
                      │ • Trust Copilot with Visual Claim Guard      │
                      │ • Tamper-Evident SHA-256 Audit Trail Drawer  │
                      │ • Model Assumptions & Simplifications Drawer │
                      │ • Wedge Moat Matrix (Procurement Runner-Up)  │
                      │ • Judge Pitch Deck Walkthrough (8 Slides)    │
                      └──────────────────────┬───────────────────────┘
                                             │ REST API
                                             ▼
                      FastAPI Backend (Python)
                      ┌──────────────────────────────────────────────┐
                      │ 1. GTM Engine                                │
                      │    - Exact Health Score (5 weighted factors) │
                      │    - Customer-verifiable expansion gates     │
                      │    - Day-45 SLA Intervention Workstream      │
                      │    - Detailed passed/failed condition lists  │
                      │ 2. Pricing Engine                            │
                      │    - Zero shelfware billing formula          │
                      │    - Time-to-full-price (30/60/90 days)      │
                      │    - Projected Cohort NRR Proxy (excludes NL)│
                      │    - 76.5% Defensible Gross Margin           │
                      │    - Dynamic AI cost ($0.008/run via Groq)   │
                      │    - NorthBridge 33% util shadow comparison  │
                      │ 3. Deterministic Claim Guard                 │
                      │    - Closed Trust Fact Base                  │
                      │    - Strict regex/ID claim validation        │
                      │    - Boundary enforcement & honest fallback  │
                      │ 4. SHA-256 Hash-Chained Audit Ledger         │
                      │    - Continuous block chaining to genesis    │
                      │    - verify_audit_chain() & tamper demo      │
                      │ 5. Groq Explain-Only Layer                   │
                      │    - Adoption Doctor (JSON schema diagnosis) │
                      │    - Pricing Strategist (tradeoff explainer) │
                      │    - Trust Copilot (5-step structured defense│
                      └──────────────────────────────────────────────┘
```

---

## 5. Verification Suite
Run the automated test suite across all 25 unit, integration, and regression tests:
```bash
cd backend
python -m pytest tests/ -v
```

### 7 Non-Negotiable Regression Tests
1. `test_usage_based_billing_does_not_bill_shelfware`: Proves Solvant charges strictly for active billable users ($3,780/mo for 126 active users out of 175 provisioned) and $0 for the 49 unbilled inactive users, vs NorthBridge charging $10,500/mo flat.
2. `test_expansion_threshold_affects_eligibility`: Proves changing `expansion_wau_threshold` directly alters qualified account count (8 at 60%, 4 at 75%) and conversion elasticity.
3. `test_time_to_full_price_affects_revenue`: Proves 30d, 60d, and 90d ramps produce distinct expansion start months (M2, M3, M4) and materially alter 12M and 24M ARR.
4. `test_groq_cannot_authorize_unsupported_trust_claim`: Proves unauthorized overclaims (e.g. SOC2 Type II complete or air-gapped mainframe support) are intercepted, marked `BOUNDARY_ENFORCED`, and reverted to honest limits.
5. `test_audit_chain_detects_tampering`: Proves the SHA-256 ledger verifies valid chains and detects simulated tampering with the exact broken block identified.
6. `test_wau_scenario_does_not_silently_modify_retention`: Proves simulating WAU in default mode alters only WAU and does not alter retention or time savings.
7. `test_nrr_excludes_new_logo_revenue`: Proves Projected NRR Proxy is strictly cohort-based and invariant to new logo acquisition velocity (`new_pilots_per_month` doubled from 6 to 12).

All 25 tests pass 100%.

