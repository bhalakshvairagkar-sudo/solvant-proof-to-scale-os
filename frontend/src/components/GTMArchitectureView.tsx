import React, { useState, useEffect } from 'react';
import {
  Layers,
  Award,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  FileText,
  Database,
  ExternalLink,
  Target,
  Sparkles,
  RefreshCw,
  Cpu,
  Shield,
  ShieldAlert,
  GitBranch,
  Play,
  Check,
  Lock,
  ChevronRight,
  Sliders,
  DollarSign,
  Activity,
} from 'lucide-react';
import { fetchGTMArchitecture, runOstravaDecision } from '../api';
import { GTMArchitectureResponse, OstravaDecisionResponse } from '../types';

interface GTMArchitectureViewProps {
  onSelectJudgeScenario: (scenarioKey: string) => void;
  onResetDemo: () => void;
  onNavigateToDeepDive?: () => void;
  onNavigateToPricing?: () => void;
  onNavigateToTrust?: () => void;
}

export const GTMArchitectureView: React.FC<GTMArchitectureViewProps> = ({
  onSelectJudgeScenario,
  onResetDemo,
  onNavigateToDeepDive,
  onNavigateToPricing,
  onNavigateToTrust,
}) => {
  const [data, setData] = useState<GTMArchitectureResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStageId, setActiveStageId] = useState<string>('wedge');
  const [ostravaSimulated, setOstravaSimulated] = useState<boolean>(false);

  // Decision flow states
  const [isDifferentiated, setIsDifferentiated] = useState<boolean>(true);
  const [hasAlternativePain, setHasAlternativePain] = useState<boolean>(true);
  const [decisionResult, setDecisionResult] = useState<OstravaDecisionResponse | null>(null);
  const [decisionLoading, setDecisionLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchGTMArchitecture()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
    // Load initial decision
    fetchDecision(true, true);
  }, []);

  const fetchDecision = async (diff: boolean, alt: boolean) => {
    setDecisionLoading(true);
    try {
      const res = await runOstravaDecision(diff, alt);
      setDecisionResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setDecisionLoading(false);
    }
  };

  const handleToggleDifferentiation = (val: boolean) => {
    setIsDifferentiated(val);
    fetchDecision(val, hasAlternativePain);
  };

  const handleToggleAlternative = (val: boolean) => {
    setHasAlternativePain(val);
    fetchDecision(isDifferentiated, val);
  };

  if (loading || !data) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
        <span>Loading One-Page GTM Architecture...</span>
      </div>
    );
  }

  const { connected_stages, prohibited_actions, defense_pillars, contingency_stages } = data;
  const activeStage = connected_stages.find((s) => s.id === activeStageId) || connected_stages[0];

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* PART F: JUDGE MODE FAST SCENARIO SWITCHER */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-indigo-500/40 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
            <span className="text-xs font-black text-white uppercase tracking-wider">
              JUDGE MODE — 60-Second Scenario Controls:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo Baseline</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
          <button
            onClick={() => onSelectJudgeScenario('healthy_account')}
            className="p-2.5 rounded-xl bg-slate-950 border border-emerald-800/80 hover:border-emerald-500 text-left transition group"
          >
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">Scenario 1</span>
            <span className="text-xs font-bold text-white group-hover:text-emerald-300 block truncate">
              Healthy Account
            </span>
            <span className="text-[10px] text-slate-400 block truncate">85% WAU • Expand Cleared</span>
          </button>

          <button
            onClick={() => onSelectJudgeScenario('day_60_stall')}
            className="p-2.5 rounded-xl bg-slate-950 border border-rose-800/80 hover:border-rose-500 text-left transition group"
          >
            <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block">Scenario 2</span>
            <span className="text-xs font-bold text-white group-hover:text-rose-300 block truncate">
              Day-60 Stall
            </span>
            <span className="text-[10px] text-slate-400 block truncate">27% WAU • FDE Playbook</span>
          </button>

          <button
            onClick={() => onSelectJudgeScenario('pricing_shock')}
            className="p-2.5 rounded-xl bg-slate-950 border border-amber-800/80 hover:border-amber-500 text-left transition group"
          >
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">Scenario 3</span>
            <span className="text-xs font-bold text-white group-hover:text-amber-300 block truncate">
              Pricing Shock
            </span>
            <span className="text-[10px] text-slate-400 block truncate">$241k Shelfware Waste</span>
          </button>

          <button
            onClick={() => onSelectJudgeScenario('trust_objection')}
            className="p-2.5 rounded-xl bg-slate-950 border border-cyan-800/80 hover:border-cyan-500 text-left transition group"
          >
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">Scenario 4</span>
            <span className="text-xs font-bold text-white group-hover:text-cyan-300 block truncate">
              Trust Objection
            </span>
            <span className="text-[10px] text-slate-400 block truncate">Data Residency & BYOK</span>
          </button>

          <button
            onClick={() => {
              setOstravaSimulated(true);
              const el = document.getElementById('ostrava-response-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-2.5 rounded-xl bg-slate-950 border border-purple-800/80 hover:border-purple-500 text-left transition group col-span-2 sm:col-span-1 shadow-md shadow-purple-950"
          >
            <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block">Scenario 5</span>
            <span className="text-xs font-bold text-white group-hover:text-purple-300 block truncate">
              Ostrava Responds
            </span>
            <span className="text-[10px] text-purple-300 block truncate">90-Day Free Incumbent Clone</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold mb-2">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Case Study 2: Unified Go-To-Market System Architecture
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              One-Page GTM Architecture & Incumbent Contingency
            </h2>
            <p className="text-sm text-slate-400 max-w-3xl mt-1">
              A single connected system: Narrow Wedge → Paid Pilot → Active Pricing → 30/60/90 Adoption → Customer-Verified Outcome → Expansion Trigger → Usage Monetization → Trust → 3-Layer Moat.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOstravaSimulated(!ostravaSimulated)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-lg ${
                ostravaSimulated
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-800/60'
              }`}
            >
              <GitBranch className="w-4 h-4 text-purple-300" />
              <span>{ostravaSimulated ? 'Ostrava Active (Simulating Free Clone)' : 'Simulate: Ostrava Responds'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PART A: THE 9 CONNECTED STAGES VISUAL FLOW */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-emerald-400" />
              The One-Page Connected GTM System Flow
            </h3>
            <p className="text-xs text-slate-400">
              Click any stage below to inspect its operational mechanics, quantitative thresholds, and architectural rationale.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
            Selected Wedge: FP&A Variance Analysis
          </span>
        </div>

        {/* 9 Interactive Stages Ribbon */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 pt-2">
          {connected_stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setActiveStageId(stage.id)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                activeStageId === stage.id
                  ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg shadow-emerald-950'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400">
                  0{stage.stage_number}
                </span>
                {activeStageId === stage.id && <Check className="w-3 h-3 text-emerald-400" />}
              </div>
              <span className="text-xs font-bold block truncate">{stage.title}</span>
              <span className="text-[9px] text-slate-400 block truncate mt-0.5">{stage.subtitle}</span>
            </button>
          ))}
        </div>

        {/* Active Stage Detail Deep-Dive Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                Stage 0{activeStage.stage_number} Architectural Specification
              </span>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                {activeStage.title}: <span className="text-emerald-300">{activeStage.subtitle}</span>
              </h4>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-slate-900 text-slate-300 font-mono border border-slate-800">
              Deterministic Contract
            </span>
          </div>

          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            {activeStage.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Core Operating Mechanics:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activeStage.key_mechanics.map((mech, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{mech}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/60 text-xs flex flex-col justify-between">
              <div>
                <strong className="text-emerald-400 block mb-1 text-[11px] uppercase tracking-wider">
                  Why It Wins Against Incumbent Seat Taxes:
                </strong>
                <p className="text-emerald-200/90 leading-relaxed font-medium">
                  {activeStage.why_it_works}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-emerald-900/40 flex items-center justify-between text-[11px] text-slate-400">
                <span>Provenance: Customer's own telemetry log</span>
                <span className="text-emerald-400 font-mono font-bold">Zero Vendor Self-Reporting</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PART B, C & D: OSTRAVA RESPONDS SCENARIO & DECISION ENGINE */}
      {/* ========================================================================= */}
      <div id="ostrava-response-section" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono font-bold uppercase mb-1">
              <AlertTriangle className="w-3 h-3 text-purple-400" />
              Explicit Case Study Mandate: 90-Day Incumbent Reaction
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Scenario: "Ostrava Responds — NorthBridge Copies the Narrow Feature for Free"
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              What does Solvant do when an enterprise incumbent bundles a free clone into their existing multi-million dollar license within 90 days?
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-purple-950 border border-purple-800 text-purple-200 font-mono font-bold">
              Simulation Active
            </span>
          </div>
        </div>

        {/* Prohibited Actions: WHAT NOT TO DO */}
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 space-y-2">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
              WHAT SOLVANT MUST NOT DO (The Challenger Traps)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-xs text-rose-200 font-medium">
            {prohibited_actions.map((act, idx) => (
              <div key={idx} className="p-2 rounded bg-rose-950/60 border border-rose-900/60 flex items-start gap-1.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span>{act}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Solvant 8-Pillar Strategic Response */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              THE SOLVANT 8-PILLAR DEFENSIVE PLAYBOOK
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Proof Compounds • Features Decay
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {defense_pillars.map((dp, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between hover:border-emerald-700/80 transition"
              >
                <div>
                  <span className="text-xs font-bold text-white block mb-1">{dp.pillar}</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{dp.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-emerald-400 font-mono">
                  Pillar 0{idx + 1} Confirmed
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PART C: DETERMINISTIC DECISION FLOW ENGINE */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-2xl bg-slate-950 border-2 border-indigo-500/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">
                Rule-Based Decision Logic (Zero LLM Hallucination)
              </span>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                Strategic Decision Flow: Defend & Expand vs. Move Wedge vs. Stop
              </h4>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
              Verdict: {decisionResult?.verdict || 'DEFEND_AND_EXPAND'}
            </span>
          </div>

          {/* Interactive Flow Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white block">
                Decision Node 1: Is Solvant's verified outcome materially differentiated?
              </span>
              <p className="text-[11px] text-slate-400">
                (e.g., Solvant hits 28% measured time reduction and 85% WAU vs. incumbent generic prompt with 33% WAU)
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleToggleDifferentiation(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    isDifferentiated
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  YES (Material Differentiation)
                </button>
                <button
                  onClick={() => handleToggleDifferentiation(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    !isDifferentiated
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  NO (Incumbent Commodity Parity)
                </button>
              </div>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 transition ${
              !isDifferentiated ? 'bg-slate-900 border-amber-800/80' : 'bg-slate-900/50 border-slate-800/60 opacity-60'
            }`}>
              <span className="text-xs font-bold text-white block">
                Decision Node 2: Is another workflow with stronger measurable pain available?
              </span>
              <p className="text-[11px] text-slate-400">
                (e.g., Procurement Contract Review & Vendor Deviation with high legal review costs)
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  disabled={isDifferentiated}
                  onClick={() => handleToggleAlternative(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    hasAlternativePain && !isDifferentiated
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  YES (Procurement Wedge Available)
                </button>
                <button
                  disabled={isDifferentiated}
                  onClick={() => handleToggleAlternative(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    !hasAlternativePain && !isDifferentiated
                      ? 'bg-rose-600 text-white shadow'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  NO (No Secondary Wedge)
                </button>
              </div>
            </div>
          </div>

          {/* Decision Outcome Card */}
          {decisionResult && (
            <div className={`p-4 rounded-xl border transition ${
              decisionResult.verdict === 'DEFEND_AND_EXPAND'
                ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
                : decisionResult.verdict === 'MOVE_WEDGE'
                ? 'bg-indigo-950/40 border-indigo-700/80 text-indigo-200'
                : 'bg-rose-950/40 border-rose-700/80 text-rose-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="text-sm font-black uppercase tracking-wide">
                  Calculated Verdict: {decisionResult.verdict}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  Stage: {decisionResult.contingency_stage}
                </span>
              </div>
              <p className="text-xs font-semibold text-white mb-3">
                {decisionResult.headline}
              </p>

              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Prescribed GTM Actions:
                </span>
                {decisionResult.action_plan.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-200 font-medium">
                    <span className="text-emerald-400 font-bold shrink-0">{idx + 1}.</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* PART D: CONTINGENCY ONE-PAGER VISUAL */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                Contingency One-Pager: Escalation Sequence if Ostrava Copies
              </h4>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              5-Step Compounding Escalation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {contingency_stages.map((cs, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-400 block mb-1">
                    Step 0{idx + 1}: {cs.stage}
                  </span>
                  <p className="text-xs text-slate-300 leading-snug font-medium">{cs.action}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Core Message Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-indigo-950/60 border border-emerald-700/60 text-center">
            <span className="text-xs sm:text-sm font-black text-white tracking-wide">
              "Features can be copied. Verified adoption and customer-specific outcome history compound."
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PART E: 3-LAYER COMPOUNDING MOAT */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              THE 3-LAYER DEFENSIVE MOAT (Why Free Bundled Clones Fail to Displace Solvant)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 block mb-1">
                  1. Workflow-Specific Configuration
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Deep ledger taxonomy mappings, custom ERP driver formulas, and finance team vocabulary configured over 60 days. Cannot be replicated by a generic spreadsheet add-on.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <strong className="text-emerald-300 block font-sans">Moat Strength:</strong> High switching cost; removing Solvant breaks monthly close pipelines.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400 block mb-1">
                  2. Adoption-Intervention History
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Granular record of user activation bottlenecks, prompt refinements, and custom finance training logs accumulated over months of active usage.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <strong className="text-indigo-300 block font-sans">Moat Strength:</strong> Organizational lock-in; incumbent IT vendors sell licenses, not adoption change management.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 block mb-1">
                  3. Outcome-Verified Data Trail
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Audited log of 500+ verified monthly commentary outputs, exact time savings, and analyst sign-offs stored in customer's own cloud.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <strong className="text-cyan-300 block font-sans">Moat Strength:</strong> Audit proof; CFO cannot justify replacing a proven 28% time-saving tool with an unmeasured free bundled seat.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
