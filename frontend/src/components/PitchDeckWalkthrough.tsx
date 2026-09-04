import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Award,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
  Layers,
  CheckCircle,
} from 'lucide-react';

export const PitchDeckWalkthrough: React.FC<{
  onJumpToTab: (tab: string, accountId?: string) => void;
}> = ({ onJumpToTab }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      step: 'Slide 1 / 8',
      title: 'Problem: The "Best Demo, Lost Deal" Enterprise Trap',
      subtitle: 'Why great point copilots get killed in enterprise procurement',
      openingQuote:
        "\"The incumbent's advantage isn't a better AI — it's that enterprises already own its seats. Its weakness is that owning seats isn't the same as using them. That gap is our wedge.\"",
      points: [
        'Enterprises buy Microsoft Copilot or Google Gemini bundled into their E5 / Workspace agreements for flat seat fees ($30-$60/user).',
        'Within 6 months, 67% of those seats become shelfware: users tried it twice, got generic answers, and abandoned it.',
        'CFOs freeze renewals on AI point solutions because no one can prove hard workflow time savings or actual weekly active usage.',
      ],
      actionLabel: 'Next: The Insight →',
      actionFn: () => setCurrentSlide(1),
    },
    {
      step: 'Slide 2 / 8',
      title: 'Insight: The Active Usage Gap (Illustrative 33% Utilization)',
      subtitle: 'The wedge is adoption infrastructure, not another chatbot',
      points: [
        'Enterprises do not have an AI capability problem; they have an AI Adoption & Verification problem.',
        'Under our illustrative industry assumption — 33% utilization, an enterprise paying $60/seat for 175 employees has only ~58 active users, wasting $84,000/year on shelfware.',
        'Solvant flips this entirely: we charge a $12,000 refundable deposit, lock pilot success thresholds before day 1, and bill ONLY for active weekly users verified in customer logs.',
      ],
      actionLabel: 'Next: System Architecture →',
      actionFn: () => setCurrentSlide(2),
    },
    {
      step: 'Slide 3 / 8',
      title: 'System Architecture: "Code calculates. Groq explains."',
      subtitle: 'The single most critical design rule keeping the live demo hallucination-free',
      points: [
        'Deterministic Core: Every adoption health score, trend slope, churn rate, ARR, and gross profit number is computed by Python backend code.',
        'Groq Structured Layer: Groq receives only pre-computed facts via strict JSON schemas. It never recalculates numbers; it diagnoses bottlenecks and explains tradeoffs in plain CFO language.',
        'Stage Reliability: If Groq rate-limits or times out, an instant verified baseline cache fires with zero spinners and zero stage errors.',
      ],
      actionLabel: 'Next: Chosen Land Wedge →',
      actionFn: () => setCurrentSlide(3),
    },
    {
      step: 'Slide 4 / 8',
      title: 'Chosen Wedge: FP&A Variance Analysis',
      subtitle: 'Narrow scope, recurring monthly pain, human-in-the-loop verification',
      points: [
        'Buyer: VP Finance / Head of FP&A | Champion: FP&A Operations Lead | Users: Financial analysts.',
        'Task Scope: Given a management variance question, retrieve approved ledger data, isolate variance drivers (volume vs price vs FX), and draft commentary with citations.',
        'Augmentation, NOT Automation: The financial analyst remains the author of record and verifies every output. Over 500 verified outputs logged per month.',
      ],
      actionLabel: 'Next: Live Product Demo (Acme Corp) →',
      actionFn: () => onJumpToTab('account_deepdive', 'acct_acme_corp'),
    },
    {
      step: 'Slide 5 / 8',
      title: 'Live Walkthrough: Acme Corp Drilldown',
      subtitle: 'Customer-verifiable expansion gates in action',
      points: [
        'Acme Corp is on Day 56 of its 60-day pilot with 50 invited users and 48 activated.',
        'Adoption Health Score is 92.9/100 (Expansion Ready Green band).',
        'All 3 customer-verifiable gates are satisfied: 4-week consecutive WAU ≥ 60%, time reduction 28% (≥ 20%), and 30d retention 87.5% (≥ 70%).',
        'Adoption Doctor recommends immediate expansion authorization to $30/active-user/month.',
      ],
      actionLabel: 'Next: Drag the WAU Slider Live →',
      actionFn: () => onJumpToTab('account_deepdive', 'acct_acme_corp'),
    },
    {
      step: 'Slide 6 / 8',
      title: 'Live Sensitivity: Drag WAU Down on Stage',
      subtitle: 'Proving deterministic responsiveness before judges',
      points: [
        'Drag the live slider from 85% down to 25%: score drops from 92.9 to < 45 instantly.',
        'Expansion verdict flips from EXPAND to HOLD/INTERVENE in real-time.',
        'Day-45 SLA Trigger fires automatically: dispatches the Adoption Intervention playbook.',
        'Jump to the Pricing Simulator to see 24-month ARR drop, proving the direct macro financial impact.',
      ],
      actionLabel: 'Jump to Pricing Simulator →',
      actionFn: () => onJumpToTab('pricing'),
    },
    {
      step: 'Slide 7 / 8',
      title: 'Defensibility: The 3-Layer Moat Against Bundled Incumbents',
      subtitle: 'What happens when Microsoft Copilot bundles a free clone in 90 days?',
      points: [
        'Layer 1: Workflow Configuration — Deep ledger taxonomies and variance formulas tuned over 60 days cannot be replaced by dropping a generic chat prompt.',
        'Layer 2: Intervention History — Granular records of prompt training and user friction resolution create organizational stickiness.',
        'Layer 3: Outcome-Verified Data Trail — 500+ audited commentary outputs with SHA-256 hash chains and 28% verified hours saved give the CFO audit proof to defend Solvant.',
      ],
      actionLabel: 'Next: Trust & Incumbent Defense →',
      actionFn: () => setCurrentSlide(7),
    },
    {
      step: 'Slide 8 / 8',
      title: 'Trust Copilot & Compliance Posture',
      subtitle: 'Honest compliance boundaries without overclaiming',
      points: [
        'Closed Trust Fact Base guarantees zero training on customer ledgers and customer-selected regional VPC storage.',
        'Zero Overclaiming: We state plainly that SOC2 Type I is complete, while SOC2 Type II is currently IN-PROGRESS (target Q4), and formal external GDPR cert is not yet held.',
        'Overclaim Guard badge verifies that every answer is strictly grounded in verified facts.',
        'Closing Call to Action: Lock the land wedge, measure real usage, and let the customer\'s own data trigger expansion.',
      ],
      actionLabel: 'Open Trust Copilot →',
      actionFn: () => onJumpToTab('trust'),
    },
  ];

  const current = slides[currentSlide];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Slide Navigation Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-white text-sm">
            Judge Presentation Deck & Rehearsal Script
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <button
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-emerald-400 font-bold">
            Slide {currentSlide + 1} of {slides.length}
          </span>
          <button
            disabled={currentSlide === slides.length - 1}
            onClick={() => setCurrentSlide((p) => Math.min(slides.length - 1, p + 1))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-emerald-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[440px] flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
              {current.step}
            </span>
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Live Pitch Rehearsal
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {current.title}
            </h2>
            <p className="text-sm font-semibold text-emerald-400 mt-1">
              {current.subtitle}
            </p>
          </div>

          {/* Opening quote if present */}
          {current.openingQuote && (
            <div className="p-4 bg-slate-950/80 border-l-4 border-emerald-500 rounded-r-xl text-slate-200 text-sm italic font-medium leading-relaxed">
              {current.openingQuote}
            </div>
          )}

          {/* Key Bullet Points */}
          <div className="space-y-3">
            {current.points.map((pt, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="leading-relaxed">{pt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Slide Footer with Action Call */}
        <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between">
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === i ? 'w-8 bg-emerald-400' : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={current.actionFn}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
          >
            <span>{current.actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
