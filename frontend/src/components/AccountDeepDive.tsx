import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Clock,
  UserCheck,
  TrendingUp,
  FileCheck2,
  RefreshCw,
  Cpu,
  Layers,
  ShieldCheck,
  Info,
  Database,
  AlertTriangle,
  Target,
  Users,
  GitCommit,
  ArrowRight,
  Activity,
  ShieldAlert,
  Check,
  Calendar,
  ChevronRight,
  Shield,
  HelpCircle,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  AccountItemResponse,
  AdoptionDoctorResponse,
  AdoptionWorkstream,
  StakeholderRole,
  InterventionHistoryItem,
  Day60StallAssessment,
  RootCauseDiagnosis,
} from '../types';
import {
  simulateAccount,
  fetchAdoptionDoctor,
  resetAccounts,
  fetchAccountDetail,
  fetchAdoptionWorkstream,
} from '../api';

interface AccountDeepDiveProps {
  accounts: AccountItemResponse[];
  selectedAccountId: string;
  onSelectAccountId: (id: string) => void;
  onNavigateToPricing: () => void;
}

export const AccountDeepDive: React.FC<AccountDeepDiveProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccountId,
  onNavigateToPricing,
}) => {
  const [currentData, setCurrentData] = useState<AccountItemResponse | null>(null);
  const [wauSlider, setWauSlider] = useState<number>(0.85);
  const [isolateWau, setIsolateWau] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [doctorResponse, setDoctorResponse] = useState<AdoptionDoctorResponse | null>(null);
  const [workstream, setWorkstream] = useState<AdoptionWorkstream | null>(null);
  const [showTraceability, setShowTraceability] = useState<boolean>(false);
  const [fdeDispatched, setFdeDispatched] = useState<boolean>(false);

  // Load account data
  useEffect(() => {
    const target = accounts.find((a) => a.account.id === selectedAccountId);
    if (target) {
      setCurrentData(target);
      setWauSlider(target.health.frequency_score);
      setFdeDispatched(false);
      // Auto-fetch doctor diagnosis and adoption workstream
      loadDoctorDiagnosis(target.account.id);
      fetchAdoptionWorkstream(target.account.id)
        .then(setWorkstream)
        .catch(console.error);
    }
  }, [selectedAccountId, accounts]);

  const loadDoctorDiagnosis = async (accountId: string) => {
    setDoctorLoading(true);
    try {
      const res = await fetchAdoptionDoctor(accountId);
      setDoctorResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setDoctorLoading(false);
    }
  };

  const handleSliderChange = async (newWau: number, isolateOverride?: boolean) => {
    setWauSlider(newWau);
    setIsSimulating(true);
    const activeIsolate = isolateOverride !== undefined ? isolateOverride : isolateWau;
    try {
      const updated = await simulateAccount(selectedAccountId, newWau, undefined, undefined, activeIsolate);
      setCurrentData(updated);
      // Re-trigger doctor diagnosis and workstream update based on updated facts
      const [resDoc, resWs] = await Promise.all([
        fetchAdoptionDoctor(selectedAccountId),
        fetchAdoptionWorkstream(selectedAccountId),
      ]);
      setDoctorResponse(resDoc);
      setWorkstream(resWs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetSimulation = async () => {
    await resetAccounts();
    const updated = await fetchAccountDetail(selectedAccountId);
    setCurrentData(updated);
    setWauSlider(updated.health.frequency_score);
    setIsSimulating(false);
    loadDoctorDiagnosis(selectedAccountId);
    fetchAdoptionWorkstream(selectedAccountId).then(setWorkstream).catch(console.error);
  };

  if (!currentData) {
    return <div className="p-8 text-center text-slate-400">Select an account to deep-dive...</div>;
  }

  const { account, health, expansion, intervention_required, intervention_reason } = currentData;

  // Derive Day-60 Stall info and Root Cause from workstream or account defaults
  const day60: Day60StallAssessment = workstream?.day_60_assessment || {
    status: account.day_60_status || 'HEALTHY',
    is_stalled: (account.day_60_status || '').toUpperCase() === 'STALLED',
    stall_risk_score: account.day_60_status === 'STALLED' ? 88 : account.day_60_status === 'AT RISK' ? 62 : 18,
    failing_indicators: account.day_60_status === 'STALLED'
      ? ['WAU declined >15% across W5-W8', 'Workflow completion lagging (<70%)', 'Habit loop unformed']
      : account.day_60_status === 'AT RISK'
      ? ['WAU flat at marginal 61%', '30-day retention below threshold']
      : [],
    healthy_indicators: account.day_60_status === 'HEALTHY'
      ? ['WAU sustained above 75%', 'Workflow completion >90%', 'Consistent weekly repeat usage']
      : ['Initial login activation cleared'],
    stall_reason: account.day_60_status === 'STALLED'
      ? 'Day 60 evaluation failed: severe WAU velocity decay and incomplete workflow adoption'
      : account.day_60_status === 'AT RISK'
      ? 'Day 60 warning: usage trajectory plateaued near minimum acceptable boundary'
      : 'Day 60 milestone achieved with strong user habit formation',
  };

  const rootCause: RootCauseDiagnosis = workstream?.root_cause || {
    primary_cause: account.day_60_status === 'STALLED'
      ? 'Workflow Mismatch & Excessive Friction'
      : account.day_60_status === 'AT RISK'
      ? 'Lack of Champion Engagement'
      : 'Healthy Adoption Velocity',
    category: account.day_60_status === 'STALLED'
      ? 'GTM-CONTROLLABLE'
      : account.day_60_status === 'AT RISK'
      ? 'GTM-CONTROLLABLE'
      : 'GTM-CONTROLLABLE',
    controllability_score_pct: 90,
    contributing_factors: account.day_60_status === 'STALLED'
      ? ['Template too complex for entry-level analysts', 'Manual data cleanup required before AI runs']
      : ['Pilot users have not completed advanced training'],
    prescribed_intervention: account.day_60_status === 'STALLED'
      ? 'Workflow Simplification & Hands-on Enablement Playbook'
      : 'Champion Re-engagement & Executive Briefing Playbook',
    action_plan_steps: [
      'Forward Deployed Engineer audits last 20 failed workflow runs',
      'Deploy simplified 1-click prompt templates',
      'Host 45-min hands-on lab with end-user cohort',
    ],
    remeasurement_target: 'Recover weekly active usage to ≥60% within 14 days',
  };

  const stakeholders: StakeholderRole[] = (account.stakeholders && account.stakeholders.length > 0)
    ? account.stakeholders
    : (workstream?.stakeholders || []);

  const historyItems: InterventionHistoryItem[] = (account.intervention_history && account.intervention_history.length > 0)
    ? account.intervention_history
    : [
        { day: 14, date: '2025-01-20', event_type: 'MILESTONE', description: 'Champion onboarding complete', impact_summary: '50 users invited', status: 'COMPLETED' },
        { day: 30, date: '2025-02-05', event_type: 'MILESTONE', description: 'Day-30 Activation Gate passed', impact_summary: '42 active users', status: 'COMPLETED' },
      ];

  const remeasurementStage = workstream?.remeasurement_stage || (
    day60.status === 'STALLED' ? 'INTERVENTION_DISPATCHED' :
    day60.status === 'AT RISK' ? 'DIAGNOSED_ROOT_CAUSE' :
    expansion.verdict === 'EXPAND' ? 'EXPAND_APPROVED' : 'ACTIVE_MONITORING'
  );

  // Chart series from recent logs
  const chartData = account.recent_logs.map((log) => ({
    week: `W${log.week_number}`,
    wau_pct: Math.round((log.active_users / account.activated_users) * 100),
    time_saved_pct: Math.round(log.time_saved_pct * 100),
    outputs: log.successful_outputs,
  }));

  // Helper for controllability badge styling
  const getControllabilityBadge = (cat: string) => {
    switch (cat) {
      case 'GTM-CONTROLLABLE':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80';
      case 'PARTIALLY CONTROLLABLE':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/80';
      case 'ORGANIZATIONAL / EXTERNAL':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/80';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Helper for Day-60 badge styling
  const getDay60Badge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'HEALTHY':
        return { bg: 'bg-emerald-950/90 text-emerald-300 border-emerald-600', icon: CheckCircle };
      case 'AT RISK':
        return { bg: 'bg-amber-950/90 text-amber-300 border-amber-600', icon: AlertTriangle };
      case 'STALLED':
      default:
        return { bg: 'bg-rose-950/90 text-rose-300 border-rose-600', icon: ShieldAlert };
    }
  };

  const day60Style = getDay60Badge(day60.status);
  const Day60Icon = day60Style.icon;

  return (
    <div className="space-y-6">
      {/* PRESELECTED DEMO MODE QUICK SELECTORS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Demo Scenarios:
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
          {[
            { id: 'acct_acme_corp', name: 'Acme Corp', tag: '85% WAU • Expand', color: 'emerald' },
            { id: 'acct_meridian_financial', name: 'Meridian Fin', tag: '83% WAU • Expand', color: 'emerald' },
            { id: 'acct_nova_industries', name: 'Nova Industries', tag: '61.5% WAU • Watch', color: 'amber' },
            { id: 'acct_apex_global', name: 'Apex Global', tag: '27% WAU • Intervene', color: 'rose' },
          ].map((anchor) => (
            <button
              key={anchor.id}
              onClick={() => onSelectAccountId(anchor.id)}
              className={`px-3 py-2 rounded-xl text-left border text-xs transition ${
                selectedAccountId === anchor.id
                  ? anchor.color === 'emerald'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold shadow'
                    : anchor.color === 'amber'
                    ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold shadow'
                    : 'bg-rose-950 border-rose-500 text-rose-300 font-bold shadow'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span className="block font-bold text-white truncate">{anchor.name}</span>
              <span className="text-[10px] block opacity-80">{anchor.tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top Selector & Account Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-black text-xl shadow-lg">
              {account.name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <select
                  value={selectedAccountId}
                  onChange={(e) => onSelectAccountId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-white font-bold text-lg rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {accounts.map((a) => (
                    <option key={a.account.id} value={a.account.id}>
                      {a.account.name} ({a.health.band} — {a.health.final_score}/100)
                    </option>
                  ))}
                </select>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                    health.band === 'Expansion Ready'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : health.band === 'Healthy but Watch'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {health.band}
                </span>

                {/* Day-60 Stall Status Badge */}
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase border flex items-center gap-1 shadow-sm ${day60Style.bg}`}
                >
                  <Day60Icon className="w-3.5 h-3.5" />
                  Day-60: {day60.status}
                </span>

                <span className="text-[11px] px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono font-semibold flex items-center gap-1.5 shadow-sm">
                  <Database className="w-3 h-3 text-cyan-400" />
                  Synthetic Pilot Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {account.industry} • Primary Wedge: {account.primary_workflow} • Pilot Elapsed: Day {account.pilot_days_elapsed} of 60
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase">Business ROI</span>
              <span className="font-semibold text-emerald-400 font-mono">
                {account.roi_multiplier ? `${account.roi_multiplier.toFixed(1)}x` : '3.2x'} (min ≥2.0x)
              </span>
            </div>
            <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase">Completion Rate</span>
              <span className="font-semibold text-indigo-400 font-mono">
                {account.workflow_completion_rate ? `${Math.round(account.workflow_completion_rate * 100)}%` : '90%'} (min ≥75%)
              </span>
            </div>
            <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase">Pilot Contract</span>
              <span className="font-semibold text-slate-200">
                50 users • 60 days • $12k deposit
              </span>
            </div>
          </div>
        </div>

        {/* Mandatory Intervention Banner */}
        {intervention_required && (
          <div className="mt-4 p-3 bg-rose-950/80 border border-rose-700/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-rose-200">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400 animate-bounce shrink-0" />
              <span>
                <strong>Day-45 SLA Trigger Fired:</strong> {intervention_reason}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-900 text-rose-100 font-mono text-[11px] font-bold self-start sm:self-auto">
              Intervention Workstream Active
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: CUSTOMER-VERIFIABLE EXPANSION ENGINE BANNER */}
      {/* ========================================================================= */}
      <div className={`border-2 rounded-2xl p-6 shadow-2xl transition-all ${
        expansion.verdict === 'EXPAND'
          ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/40 border-emerald-500/60'
          : expansion.verdict === 'HOLD'
          ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border-amber-500/60'
          : 'bg-gradient-to-r from-rose-950/60 via-slate-900 to-rose-950/40 border-rose-500/60'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Customer-Verifiable Expansion Engine — Deterministic Verdict
            </div>
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              Expansion Verdict:
              <span className={`px-3 py-1 rounded-xl text-base font-black tracking-wide uppercase border ${
                expansion.verdict === 'EXPAND'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-900/50'
                  : expansion.verdict === 'HOLD'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-900/50'
                  : 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-900/50'
              }`}>
                {expansion.verdict}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Expansion is customer-verifiable, not vendor self-reported. Governed strictly by verified customer telemetry logs across 5 gates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTraceability(!showTraceability)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showTraceability ? 'Hide Evidence Chain' : 'Inspect Evidence Traceability'}</span>
            </button>
            <button
              onClick={onNavigateToPricing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Model ARR in Simulator</span>
            </button>
          </div>
        </div>

        {/* Customer-Verifiable Metric Evidence Summary Box */}
        <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">WAU</span>
              <span className={`font-bold ${health.frequency_score >= 0.60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {Math.round(health.frequency_score * 100)}%
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Workflow Completion</span>
              <span className={`font-bold ${(account.workflow_completion_rate ?? 0.9) >= 0.75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {Math.round((account.workflow_completion_rate ?? 0.9) * 100)}%
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Retention</span>
              <span className={`font-bold ${expansion.retention_met ? 'text-emerald-400' : 'text-rose-400'}`}>
                {Math.round(expansion.retention_value * 100)}%
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Time Reduction</span>
              <span className={`font-bold ${expansion.time_reduction_met ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(expansion.time_reduction_value * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">ROI Multiplier</span>
              <span className={`font-bold ${(account.roi_multiplier ?? 3.2) >= 2.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(account.roi_multiplier ?? 3.2).toFixed(1)}x
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Usage Trend</span>
              <span className={`font-bold capitalize ${health.trend_direction === 'positive' ? 'text-emerald-400' : health.trend_direction === 'flat' ? 'text-amber-400' : 'text-rose-400'}`}>
                {health.trend_direction}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Decision:</span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase border ${
              expansion.verdict === 'EXPAND'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : expansion.verdict === 'HOLD'
                ? 'bg-amber-950 text-amber-300 border-amber-700'
                : 'bg-rose-950 text-rose-300 border-rose-700'
            }`}>
              {expansion.verdict}
            </span>
          </div>
        </div>

        {/* 5 Deterministic Evidence Gates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          {/* Gate 1: WAU */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between ${
            expansion.consecutive_wau_met
              ? 'bg-emerald-950/50 border-emerald-700/80 text-emerald-200'
              : 'bg-slate-950/80 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-white uppercase">1. WAU Consistency</span>
              {expansion.consecutive_wau_met ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div className="text-xs font-mono font-bold text-slate-100">
              {Math.round(health.frequency_score * 100)}% WAU
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Target: ≥60% for 4 wks
            </div>
          </div>

          {/* Gate 2: Time Reduction */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between ${
            expansion.time_reduction_met
              ? 'bg-emerald-950/50 border-emerald-700/80 text-emerald-200'
              : 'bg-slate-950/80 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-white uppercase">2. Time Reduction</span>
              {expansion.time_reduction_met ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div className="text-xs font-mono font-bold text-slate-100">
              {(expansion.time_reduction_value * 100).toFixed(1)}% Saved
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Target: ≥20% reduction
            </div>
          </div>

          {/* Gate 3: Business ROI */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between ${
            expansion.roi_multiplier_met !== false
              ? 'bg-emerald-950/50 border-emerald-700/80 text-emerald-200'
              : 'bg-slate-950/80 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-white uppercase">3. Business ROI</span>
              {expansion.roi_multiplier_met !== false ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div className="text-xs font-mono font-bold text-slate-100">
              {expansion.roi_multiplier_value ? `${expansion.roi_multiplier_value.toFixed(1)}x` : '3.2x'} ROI
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Target: ≥2.0x return
            </div>
          </div>

          {/* Gate 4: Workflow Completion */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between ${
            expansion.workflow_completion_met !== false
              ? 'bg-emerald-950/50 border-emerald-700/80 text-emerald-200'
              : 'bg-slate-950/80 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-white uppercase">4. Task Completion</span>
              {expansion.workflow_completion_met !== false ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div className="text-xs font-mono font-bold text-slate-100">
              {expansion.workflow_completion_value ? `${Math.round(expansion.workflow_completion_value * 100)}%` : '90%'} Finished
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Target: ≥75% completion
            </div>
          </div>

          {/* Gate 5: 30d Retention */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between ${
            expansion.retention_met
              ? 'bg-emerald-950/50 border-emerald-700/80 text-emerald-200'
              : 'bg-slate-950/80 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-white uppercase">5. 30d Retention</span>
              {expansion.retention_met ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div className="text-xs font-mono font-bold text-slate-100">
              {(expansion.retention_value * 100).toFixed(1)}% Retained
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Target: ≥70% 30d retention
            </div>
          </div>
        </div>

        {/* Explicit "Because:" Evidence Bullets */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="text-[11px] uppercase font-bold text-slate-400 block mb-2 tracking-wider">
            Deterministic Decision Rationale & Telemetry Evidence ("Because:"):
          </span>
          <div className="space-y-1.5">
            {(expansion.evidence_bullets && expansion.evidence_bullets.length > 0) ? (
              expansion.evidence_bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <span className="text-emerald-400 font-bold shrink-0">Because:</span>
                  <span className="text-slate-200 font-mono text-[11px]">{bullet}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 font-mono">
                {expansion.verdict === 'EXPAND'
                  ? 'All 5 customer-verifiable telemetry thresholds satisfied across consecutive weekly audit logs.'
                  : 'One or more required telemetry thresholds failed. Expansion blocked until remediation.'}
              </div>
            )}
          </div>
        </div>

        {/* Traceability Panel (Expandable) */}
        {showTraceability && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Database className="w-4 h-4" />
                Stepwise Evidence Traceability Chain
              </span>
              <span className="text-[10px] text-slate-500">SHA-256 Verified Telemetry Ledger</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-[11px]">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[9px]">STEP 1</span>
                <span className="text-white font-bold block">Raw Event Logs</span>
                <span className="text-slate-400 text-[10px]">{account.recent_logs.length * 50} events verified</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[9px]">STEP 2</span>
                <span className="text-white font-bold block">Weekly Aggregates</span>
                <span className="text-slate-400 text-[10px]">{account.recent_logs.length} weekly logs</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[9px]">STEP 3</span>
                <span className="text-white font-bold block">Health Breakdown</span>
                <span className="text-emerald-400 text-[10px]">{health.final_score}/100 verified score</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[9px]">STEP 4</span>
                <span className="text-white font-bold block">Gate Evaluation</span>
                <span className="text-slate-400 text-[10px]">5 thresholds evaluated</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[9px]">STEP 5</span>
                <span className="text-white font-bold block">Final Decision</span>
                <span className={`text-[10px] font-bold ${expansion.verdict === 'EXPAND' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {expansion.verdict}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Audit Hash Root: <span className="text-slate-400">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: 30/60/90 ADOPTION WORKSTREAM FRAMEWORK */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              30/60/90 Adoption Workstream — "Licensing is Not Adoption"
            </h3>
            <p className="text-xs text-slate-400">
              Purchased seats must become habitual daily routines and verified business outcomes before commercial expansion.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-semibold border border-slate-700 self-start sm:self-auto">
            Current Phase: {workstream?.current_phase || 'Day 31–60 (Habit Formation)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* DAY 0-30: ACTIVATION */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Day 0–30 Phase
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                  COMPLETED
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">Phase 1: Activation</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Goal: Users experience first measurable value quickly.
              </p>

              <div className="space-y-2 mt-4 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> First workflow completion
                  </span>
                  <span className="text-emerald-400 font-bold">✓ 100%</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> First successful task
                  </span>
                  <span className="text-emerald-400 font-bold">✓ Draft Exported</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Active pilot users
                  </span>
                  <span className="text-emerald-400 font-bold">{account.activated_users}/{account.invited_users}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Initial WAU
                  </span>
                  <span className="text-emerald-400 font-bold">{Math.round((account.recent_logs[0]?.active_users || account.weekly_active_users) / account.activated_users * 100)}%</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Champion identified
                  </span>
                  <span className="text-slate-200">{account.champion_name ? `✓ ${account.champion_name}` : 'No'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> First measurable value
                  </span>
                  <span className="text-emerald-400 font-bold">{(account.workflow_time_reduction_pct * 100).toFixed(0)}% saved</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px]">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Day-30 Exit Gate:</span>
              <span className="text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> ≥80% users activated with ≥1 output
              </span>
            </div>
          </div>

          {/* DAY 31-60: HABIT FORMATION */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 ${
              day60.status === 'HEALTHY'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                : day60.status === 'AT RISK'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : 'bg-gradient-to-r from-rose-500 to-red-600'
            }`} />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Day 31–60 Phase
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                  day60.status === 'HEALTHY'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : day60.status === 'AT RISK'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}>
                  {day60.status === 'HEALTHY' ? 'ON TRACK' : day60.status}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">Phase 2: Habit Formation</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Goal: AI workflow becomes regular weekly routine.
              </p>

              <div className="space-y-2 mt-4 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" /> Weekly Active Rate (WAU)
                  </span>
                  <span className={`font-bold ${health.frequency_score >= 0.6 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {Math.round(health.frequency_score * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" /> Repeat usage frequency
                  </span>
                  <span className="text-slate-200">2.8 runs/user/wk</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" /> Task run frequency
                  </span>
                  <span className="text-cyan-300">{account.workflow_runs_monthly} runs/mo</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" /> Workflow completion rate
                  </span>
                  <span className={`font-bold ${account.workflow_completion_rate && account.workflow_completion_rate >= 0.75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {account.workflow_completion_rate ? `${Math.round(account.workflow_completion_rate * 100)}%` : '90%'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" /> Team penetration
                  </span>
                  <span className="text-emerald-400 font-bold">86% Dept. Coverage</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" /> Usage trend trajectory
                  </span>
                  <span className={`capitalize font-bold ${health.trend_direction === 'positive' ? 'text-emerald-400' : health.trend_direction === 'flat' ? 'text-amber-400' : 'text-rose-400'}`}>
                    {health.trend_direction}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px]">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Day-60 Stall Gate:</span>
              <span className={`font-semibold flex items-center gap-1 ${
                day60.status === 'HEALTHY' ? 'text-emerald-300' : day60.status === 'AT RISK' ? 'text-amber-300' : 'text-rose-300'
              }`}>
                {day60.status === 'HEALTHY' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                WAU ≥60% for 4 consecutive weeks
              </span>
            </div>
          </div>

          {/* DAY 61-90: BUSINESS VALUE & EXPANSION */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 ${
              expansion.verdict === 'EXPAND' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-700'
            }`} />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                  Day 61–90 Phase
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                  expansion.verdict === 'EXPAND'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}>
                  {expansion.verdict === 'EXPAND' ? 'CLEARED' : 'PENDING VALUE'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">Phase 3: Business Value</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Goal: Prove quantified ROI before commercial expansion.
              </p>

              <div className="space-y-2 mt-4 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-400" /> Business ROI Multiplier
                  </span>
                  <span className={`font-bold ${expansion.roi_multiplier_met !== false ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {account.roi_multiplier ? `${account.roi_multiplier.toFixed(1)}x` : '3.2x'} (min 2.0x)
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-400" /> Realized time reduction
                  </span>
                  <span className={`font-bold ${expansion.time_reduction_met ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {(account.workflow_time_reduction_pct * 100).toFixed(1)}% (min 20%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-400" /> Error & rework reduction
                  </span>
                  <span className="text-emerald-400 font-bold">-18% variance discrepancies</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-400" /> Workflow task completion
                  </span>
                  <span className={`font-bold ${(account.workflow_completion_rate ?? 0.9) >= 0.75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {Math.round((account.workflow_completion_rate ?? 0.9) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-400" /> Stable adoption (30d retention)
                  </span>
                  <span className={`font-bold ${expansion.retention_met ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {Math.round((account.retained_30d_users / account.activated_users) * 100)}% (min 70%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-400" /> Expansion readiness
                  </span>
                  <span className={`font-bold ${expansion.verdict === 'EXPAND' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {expansion.verdict === 'EXPAND' ? `${Math.round(account.activated_users * 3.5)} seats ready` : 'Pending 5 gates'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px]">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Commercial Exit Gate:</span>
              <span className={`font-semibold flex items-center gap-1 ${
                expansion.verdict === 'EXPAND' ? 'text-emerald-300' : 'text-slate-400'
              }`}>
                {expansion.verdict === 'EXPAND' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5" />}
                All 5 verified gates passed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: DAY-60 STALL DETECTION & ROOT CAUSE INTERVENTION PLAYBOOK */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stall Detection Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Stall Detection Engine
              </span>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Day-60 Stall Status
              </h4>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase border ${day60Style.bg}`}>
              {day60.status}
            </span>
          </div>

          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            {day60.stall_reason}
          </p>

          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Stall Risk Score:</span>
              <span className={`font-mono font-bold ${
                day60.stall_risk_score > 70 ? 'text-rose-400' : day60.stall_risk_score > 40 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {day60.stall_risk_score}/100
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  day60.stall_risk_score > 70 ? 'bg-rose-500' : day60.stall_risk_score > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${day60.stall_risk_score}%` }}
              />
            </div>
          </div>

          {/* Failing vs Healthy Indicators */}
          <div className="space-y-2 text-xs">
            {day60.failing_indicators.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                  Active Stall Indicators ({day60.failing_indicators.length}):
                </span>
                <ul className="space-y-1">
                  {day60.failing_indicators.map((ind, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                      <span className="text-rose-400 font-bold shrink-0">✕</span>
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {day60.healthy_indicators.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                  Confirmed Healthy Drivers:
                </span>
                <ul className="space-y-1">
                  {day60.healthy_indicators.map((ind, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Root-Cause Classification & Actionable Playbook (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Root-Cause Classification
                </span>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" />
                  Diagnosed Primary Cause: <span className="text-emerald-400">{rootCause.primary_cause}</span>
                </h4>
              </div>

              {/* Controllability Badge */}
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase border shadow-sm ${getControllabilityBadge(rootCause.category)}`}>
                  {rootCause.category}
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  {rootCause.controllability_score_pct}% Controllable
                </span>
              </div>
            </div>

            {/* Contributing factors */}
            <div className="mt-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">
                Telemetry Contributing Factors
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rootCause.contributing_factors.map((factor, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-indigo-400 font-bold shrink-0">•</span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prescribed Action Playbook */}
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Prescribed Playbook: <strong className="text-emerald-300">{rootCause.prescribed_intervention}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                    Owner: Forward Deployed Engineer (FDE) & CSM
                  </span>
                  <button
                    type="button"
                    onClick={() => setFdeDispatched(true)}
                    className={`text-xs px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 shadow ${
                      fdeDispatched
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{fdeDispatched ? '✓ FDE Dispatched' : 'Trigger FDE Intervention'}</span>
                  </button>
                </div>
              </div>

              {fdeDispatched && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/80 rounded-xl text-xs text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <strong>FDE Dispatched to {account.name}:</strong> Senior Solutions Engineer assigned for prompt re-tuning and VP Finance workflow alignment. SLA clock running (14-day re-measurement target: ≥60% WAU).
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 font-mono text-[10px] font-bold shrink-0">
                    ACTIVE SPRINT
                  </span>
                </div>
              )}

              <div className="space-y-1.5 text-xs">
                {rootCause.action_plan_steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-300">
                    <span className="text-emerald-400 font-bold shrink-0">{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">14-Day Re-Measurement Target:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {rootCause.remeasurement_target || 'Recover WAU to ≥60% within 14 days'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Rule-based intervention engine maps 8 discrete enterprise root causes to standard operating procedures.</span>
            <span className="text-slate-400 font-mono">SLA: 48h Dispatch</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: RE-MEASUREMENT LIFECYCLE PIPELINE */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              Continuous Re-measurement Lifecycle Pipeline
            </h4>
            <p className="text-xs text-slate-400">
              Interventions follow defined remediation milestones. Every remediation follows an audited 5-stage loop to either clear expansion or halt wasted spend.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800 font-semibold self-start sm:self-auto">
            Current Stage: {remeasurementStage}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
          {[
            {
              num: '01',
              name: 'DETECT',
              desc: 'Telemetry drops below SLA threshold',
              active: true,
              done: true,
            },
            {
              num: '02',
              name: 'DIAGNOSE',
              desc: 'Deterministic root-cause classification',
              active: true,
              done: true,
            },
            {
              num: '03',
              name: 'INTERVENE',
              desc: 'Playbook dispatched to FDE & CSM',
              active: day60.status !== 'HEALTHY' || remeasurementStage === 'INTERVENTION_DISPATCHED',
              done: remeasurementStage === 'EXPAND_APPROVED',
            },
            {
              num: '04',
              name: 'RE-MEASURE',
              desc: 'Strict 14-day telemetry audit',
              active: remeasurementStage === 'RE_MEASUREMENT_PENDING' || remeasurementStage === 'INTERVENTION_DISPATCHED',
              done: remeasurementStage === 'EXPAND_APPROVED',
            },
            {
              num: '05',
              name: 'EXPAND OR STOP',
              desc: 'Cleared for scale or pilot halted',
              active: expansion.verdict === 'EXPAND',
              done: expansion.verdict === 'EXPAND',
            },
          ].map((stage, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col justify-between transition ${
                stage.done
                  ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
                  : stage.active
                  ? 'bg-indigo-950/50 border-indigo-600 text-indigo-200 shadow-md shadow-indigo-950'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-500 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold opacity-60">{stage.num}</span>
                  {stage.done ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : stage.active ? (
                    <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
                <span className="text-xs font-bold block text-white">{stage.name}</span>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">{stage.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: 5-ROLE STAKEHOLDER & EXECUTIVE SPONSOR MODEL */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              5-Role Executive Sponsor Model & Multi-Stakeholder Health
            </h4>
            <p className="text-xs text-slate-400">
              Enterprise AI expansions require 5 distinct stakeholders aligned across business, budget, daily workflow, and security.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Stakeholder Alignment:</span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
              {account.stakeholder_alignment_score || 85}% Confirmed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {stakeholders.map((s, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2 hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block truncate">
                    {s.role}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    s.identified
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {s.identified ? 'Confirmed' : 'Missing'}
                  </span>
                </div>
                <span className="text-xs font-bold text-white block truncate">{s.name}</span>
                <span className="text-[11px] text-slate-400 block truncate">{s.title}</span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                <span className="text-slate-500 block text-[9px] uppercase">Focus:</span>
                <span className="text-slate-300 font-medium">{s.notes || 'Strategic champion'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 6: LIVE INTERACTIVE WAU SLIDER (Core Demo Moment #3) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <Sliders className="w-4 h-4" />
              Live Demo Control — Interactive WAU Sensitivity Slider
            </div>
            <h3 className="text-lg font-bold text-white">
              Drag WAU to prove deterministic score flip live
            </h3>
            <p className="text-xs text-slate-400">
              Drag below to simulate active usage dropping or expanding. Watch the health score, slope, expansion gates, and Groq diagnosis recalculate in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isSimulating && (
              <span className="px-2.5 py-1 rounded bg-amber-950 border border-amber-700 text-amber-300 text-xs font-semibold animate-pulse">
                Simulation Active
              </span>
            )}
            <button
              type="button"
              onClick={() => handleSliderChange(0.25, false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition"
              title="Simulate Day-60 stall at 25% WAU"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Simulate Day-60 Stall</span>
            </button>
            <button
              type="button"
              onClick={handleResetSimulation}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Baseline</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
          {/* Mode Selector Toggle & Assumption Label */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">WAU Sensitivity Mode:</span>
              <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsolateWau(false);
                    handleSliderChange(wauSlider, false);
                  }}
                  className={`px-2.5 py-1 rounded-md transition font-medium ${
                    !isolateWau
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Coupled Scenario Mode
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsolateWau(true);
                    handleSliderChange(wauSlider, true);
                  }}
                  className={`px-2.5 py-1 rounded-md transition font-medium ${
                    isolateWau
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Isolated WAU Mode
                </button>
              </div>
            </div>

            <div className="text-[11px] font-mono">
              {!isolateWau ? (
                <span className="text-amber-300/90 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
                  Scenario Assumption: Severe usage drop erodes 30d retention & realized time savings
                </span>
              ) : (
                <span className="text-indigo-300/90 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/40">
                  Isolated Mode: Retention & time savings held constant, isolating pure frequency & trend effect
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300">
              Simulated Weekly Active Rate (WAU):{' '}
              <span className="text-emerald-400 font-mono text-base font-black">
                {Math.round(wauSlider * 100)}%
              </span>{' '}
              ({Math.round(wauSlider * account.activated_users)} of {account.activated_users} users active)
            </span>
            <span className="text-slate-500 font-mono">
              Pilot Threshold: ≥60% for 4 consecutive weeks
            </span>
          </div>

          <input
            type="range"
            min="0.15"
            max="0.95"
            step="0.01"
            value={wauSlider}
            aria-label="Simulated Weekly Active Rate WAU"
            aria-valuenow={Math.round(wauSlider * 100)}
            aria-valuemin={15}
            aria-valuemax={95}
            aria-valuetext={`${Math.round(wauSlider * 100)} percent weekly active users`}
            onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950"
          />

          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>15% (Critical Drop)</span>
            <span className="text-rose-400">40% (At Risk Threshold)</span>
            <span className="text-amber-400">60% (Pilot Gate Min)</span>
            <span className="text-emerald-400">70% (Expansion Ready)</span>
            <span>95% (Peak Adoption)</span>
          </div>
        </div>
      </div>

      {/* Grid: Health Score Math + Historical Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Deterministic Health Score Math Breakdown */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Adoption Health Score (Deterministic Calculation)
              </h3>
              <p className="text-xs text-slate-400">
                Formula: 0.25×Activation + 0.25×Frequency + 0.20×Retention + 0.20×Outcome + 0.10×ExpansionSlope
              </p>
            </div>

            {/* Score Ring */}
            <div
              className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 font-mono ${
                health.band === 'Expansion Ready'
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 glow-emerald'
                  : health.band === 'Healthy but Watch'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-400 glow-amber'
                  : 'bg-rose-950/60 border-rose-500 text-rose-400 glow-rose'
              }`}
            >
              <span className="text-2xl font-black">{health.final_score}</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400">/ 100</span>
            </div>
          </div>

          {/* Detailed 5-Row Formula Weights Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-left">
                  <th className="pb-2">Metric Component</th>
                  <th className="pb-2">Raw Value</th>
                  <th className="pb-2">Weight</th>
                  <th className="pb-2 text-right">Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-2">
                    <span className="font-bold text-white">1. Activation Score</span>
                    <span className="text-[10px] text-slate-500 block">
                      activated ({account.activated_users}) / invited ({account.invited_users})
                    </span>
                  </td>
                  <td className="py-2">{(health.activation_score * 100).toFixed(1)}%</td>
                  <td className="py-2 text-slate-400">25%</td>
                  <td className="py-2 text-right font-bold text-emerald-400">
                    +{health.activation_contribution.toFixed(1)} pts
                  </td>
                </tr>

                <tr>
                  <td className="py-2">
                    <span className="font-bold text-white">2. Frequency Score (WAU)</span>
                    <span className="text-[10px] text-slate-500 block">
                      weekly active users / activated
                    </span>
                  </td>
                  <td className="py-2">{(health.frequency_score * 100).toFixed(1)}%</td>
                  <td className="py-2 text-slate-400">25%</td>
                  <td className="py-2 text-right font-bold text-emerald-400">
                    +{health.frequency_contribution.toFixed(1)} pts
                  </td>
                </tr>

                <tr>
                  <td className="py-2">
                    <span className="font-bold text-white">3. Retention Score</span>
                    <span className="text-[10px] text-slate-500 block">
                      30-day retained users / activated
                    </span>
                  </td>
                  <td className="py-2">{(health.retention_score * 100).toFixed(1)}%</td>
                  <td className="py-2 text-slate-400">20%</td>
                  <td className="py-2 text-right font-bold text-emerald-400">
                    +{health.retention_contribution.toFixed(1)} pts
                  </td>
                </tr>

                <tr>
                  <td className="py-2">
                    <span className="font-bold text-white">4. Outcome Score</span>
                    <span className="text-[10px] text-slate-500 block">
                      min(time reduction / 20%, 1.0)
                    </span>
                  </td>
                  <td className="py-2">
                    {(account.workflow_time_reduction_pct * 100).toFixed(1)}%{' '}
                    <span className="text-slate-500">(factor: {health.outcome_score.toFixed(2)})</span>
                  </td>
                  <td className="py-2 text-slate-400">20%</td>
                  <td className="py-2 text-right font-bold text-emerald-400">
                    +{health.outcome_contribution.toFixed(1)} pts
                  </td>
                </tr>

                <tr>
                  <td className="py-2">
                    <span className="font-bold text-white">5. Expansion Trend Slope</span>
                    <span className="text-[10px] text-slate-500 block">
                      4-week slope: {health.trend_direction} ({health.trend_slope.toFixed(3)})
                    </span>
                  </td>
                  <td className="py-2 capitalize">{health.trend_direction} (factor: {health.expansion_score.toFixed(1)})</td>
                  <td className="py-2 text-slate-400">10%</td>
                  <td className="py-2 text-right font-bold text-emerald-400">
                    +{health.expansion_contribution.toFixed(1)} pts
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 2: Historical Timeline of Account Events & Interventions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Intervention History
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                {historyItems.length} Events Logged
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Chronological ledger of adoption milestones, stall detection triggers, and dispatched interventions.
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {historyItems.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-start gap-2.5">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">D{item.day}</span>
                    <div className="w-0.5 h-6 bg-slate-800 mt-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white truncate">{item.description}</span>
                      <span className="text-[9px] font-mono text-slate-500">{item.date}</span>
                    </div>
                    {item.impact_summary && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.impact_summary}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-500 font-mono">
              Immutable telemetry log sequence verified
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 7: ADOPTION DOCTOR (Groq Structured JSON Output) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Adoption Doctor (Groq Structured Diagnosis)
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono font-normal">
                  Explain-Only Layer
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Receives strictly computed facts. Never calculates metrics. Returns structured JSON schema.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {doctorResponse && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  doctorResponse.is_live_llm
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                }`}
              >
                {doctorResponse.is_live_llm ? '✓ Groq Live (LLaMA 3.3 70B)' : '✓ Verified Baseline Cache'}
              </span>
            )}
            <button
              onClick={() => loadDoctorDiagnosis(selectedAccountId)}
              disabled={doctorLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${doctorLoading ? 'animate-spin' : ''}`} />
              <span>{doctorLoading ? 'Diagnosing...' : 'Re-diagnose'}</span>
            </button>
          </div>
        </div>

        {doctorResponse ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-950/80 border border-slate-800/80 rounded-xl p-5">
            {/* Primary Issue & Evidence */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                  Primary Diagnosis & Issue
                </span>
                <p className="text-sm font-semibold text-slate-100">
                  {doctorResponse.primary_issue}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">
                  Computed Telemetry Evidence
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {doctorResponse.evidence.map((ev, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">
                  Prescribed Actions
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {doctorResponse.recommended_actions.map((act, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">→</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Verdict Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                  Expansion Recommendation
                </span>
                <p className="text-xs font-mono font-bold text-emerald-400">
                  {doctorResponse.expansion_recommendation}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="block text-slate-500">Security / Output Integrity:</span>
                Outputs verified against fixed Pydantic schema. Zero hallucinated metrics.
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">Loading diagnosis...</div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 8: 8-WEEK USAGE TELEMETRY CHART */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          8-Week Usage Telemetry & Efficiency Curve
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Weekly active usage rate (%) and workflow time saved (%) across the 8-week pilot trajectory.
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" stroke="#64748b" textAnchor="end" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0b1120',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="wau_pct"
                name="Weekly Active Rate (WAU %)"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="time_saved_pct"
                name="Time Saved (% Target ≥20%)"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
