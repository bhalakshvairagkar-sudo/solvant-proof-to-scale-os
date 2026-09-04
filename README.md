# SOLVANT PROOF-TO-SCALE OS — Enterprise AI Adoption Infrastructure

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/bhalakshvairagkar-sudo/solvant-proof-to-scale-os)
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/deploy?template=https://github.com/bhalakshvairagkar-sudo/solvant-proof-to-scale-os)

> **Golden Architectural Rule:** "Code calculates. Groq explains, diagnoses, and communicates."

---

## 1. What This System Does
An **Enterprise AI Adoption Infrastructure** proving Solvant Labs' land-and-expand GTM model:
- **Wedge:** FP&A Variance Analysis & Management Reporting (human-in-the-loop analyst augmentation).
- **Pilot Contract:** 50 users, 60 days, $12,000 refundable-against-value deposit.
- **Usage-Metered Pricing:** $30/active-user/month (metered on weekly active users in customer logs, not licensed seats) + $0.40/run overage credit.
- **Customer-Verifiable Expansion Trigger:** WAU $\ge$ 60% for 4 consecutive weeks AND workflow time reduction $\ge$ 20% AND 30-day retention $\ge$ 70%.
- **Zero-Overclaim Trust Narrative:** Closed Trust Fact Base with honest compliance boundaries (SOC2 Type I complete; Type II in progress; formal external GDPR cert not held).

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
                      │ • Portfolio Overview (21+ Enterprise Accts)   │
                      │ • Account Drilldown & Live WAU Slider        │
                      │ • Pricing Simulator (12m/24m ARR)            │
                      │ • NorthBridge Shadow Overlay ($60/seat tax)  │
                      │ • Competitor Pricing Teardowns               │
                      │ • Trust Copilot (Overclaim Guard Badge)      │
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
                      │ 2. Pricing Engine                            │
                      │    - 76.5% Defensible Gross Margin           │
                      │    - NorthBridge shelfware comparison        │
                      │ 3. Groq Explain-Only Layer                   │
                      │    - Adoption Doctor (JSON schema diagnosis) │
                      │    - Trust Copilot (5-step structured defense│
                      │    - Instant verified baseline cache         │
                      └──────────────────────────────────────────────┘
```

---

## 5. Verification Suite
Run the automated test suite:
```bash
cd backend
python -m pytest -v
```
All 16 unit and API tests pass with 100% test coverage.
