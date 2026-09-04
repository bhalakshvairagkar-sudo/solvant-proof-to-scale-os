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
import { AccountItemResponse, AdoptionDoctorResponse } from '../types';
import { simulateAccount, fetchAdoptionDoctor, resetAccounts, fetchAccountDetail } from '../api';

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
  const [isSimulating, setIsSimulating] = useState(false);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [doctorResponse, setDoctorResponse] = useState<AdoptionDoctorResponse | null>(null);

  // Load account data
  useEffect(() => {
    const target = accounts.find((a) => a.account.id === selectedAccountId);
    if (target) {
      setCurrentData(target);
      setWauSlider(target.health.frequency_score);
      // Auto-fetch doctor diagnosis
      loadDoctorDiagnosis(target.account.id);
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

  const handleSliderChange = async (newWau: number) => {
    setWauSlider(newWau);
    setIsSimulating(true);
    try {
      const updated = await simulateAccount(selectedAccountId, newWau);
      setCurrentData(updated);
      // Re-trigger doctor diagnosis based on updated facts
      const res = await fetchAdoptionDoctor(selectedAccountId);
      setDoctorResponse(res);
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
  };

  if (!currentData) {
    return <div className="p-8 text-center text-slate-400">Select an account to deep-dive...</div>;
  }

  const { account, health, expansion, intervention_required, intervention_reason } = currentData;

  // Chart series from recent logs
  const chartData = account.recent_logs.map((log) => ({
    week: `W${log.week_number}`,
    wau_pct: Math.round((log.active_users / account.activated_users) * 100),
    time_saved_pct: Math.round(log.time_saved_pct * 100),
    outputs: log.successful_outputs,
  }));

  return (
    <div className="space-y-6">
      {/* Top Selector & Account Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-black text-xl shadow-lg">
              {account.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
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
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {account.industry} • Primary Wedge: {account.primary_workflow}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase">Champion</span>
              <span className="font-semibold text-slate-200">
                {account.champion_name} ({account.champion_title})
              </span>
            </div>
            <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase">Economic Buyer</span>
              <span className="font-semibold text-slate-200">{account.buyer_title}</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase">Pilot Contract</span>
              <span className="font-semibold text-emerald-400">
                50 users • 60 days • $12k deposit
              </span>
            </div>
          </div>
        </div>

        {/* Mandatory Intervention Banner */}
        {intervention_required && (
          <div className="mt-4 p-3 bg-rose-950/80 border border-rose-700/80 rounded-xl flex items-center justify-between text-xs text-rose-200">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400 animate-bounce" />
              <span>
                <strong>Day-45 SLA Trigger Fired:</strong> {intervention_reason}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-900 text-rose-100 font-mono text-[11px] font-bold">
              Intervention Workstream Active
            </span>
          </div>
        )}
      </div>

      {/* LIVE INTERACTIVE WAU SLIDER (Core Demo Moment #3) */}
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

          <div className="flex items-center gap-3">
            {isSimulating && (
              <span className="px-2.5 py-1 rounded bg-amber-950 border border-amber-700 text-amber-300 text-xs font-semibold animate-pulse">
                Simulation Active
              </span>
            )}
            <button
              onClick={handleResetSimulation}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Baseline</span>
            </button>
            <button
              onClick={onNavigateToPricing}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>See Revenue Impact in Pricing</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
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

      {/* Grid: Health Score Math + Expansion Gate Checklist */}
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

        {/* Card 2: Customer-Verifiable Expansion Gates */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Expansion Trigger Gates
              </h3>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                  expansion.verdict === 'EXPAND'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : expansion.verdict === 'HOLD'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                Verdict: {expansion.verdict}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              To guarantee zero vendor self-reporting, expansion is legally gated on 3 customer-verifiable log thresholds:
            </p>

            <div className="space-y-3">
              {/* Gate 1 */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-3 ${
                  expansion.consecutive_wau_met
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {expansion.consecutive_wau_met ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <span className="font-bold block text-white">
                    1. WAU ≥ 60% for 4 consecutive weeks
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Values: [{expansion.consecutive_wau_values.map((v) => `${Math.round(v * 100)}%`).join(', ')}]
                  </span>
                </div>
              </div>

              {/* Gate 2 */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-3 ${
                  expansion.time_reduction_met
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {expansion.time_reduction_met ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <span className="font-bold block text-white">
                    2. Workflow time reduction ≥ 20%
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Logged efficiency: {(expansion.time_reduction_value * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Gate 3 */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-3 ${
                  expansion.retention_met
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {expansion.retention_met ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <span className="font-bold block text-white">
                    3. 30-Day User Retention ≥ 70%
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Logged retention: {(expansion.retention_value * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <span className="text-xs text-slate-400">
              Graduated Pricing: <strong className="text-white">$30/active user/mo</strong> (no seat taxes)
            </span>
          </div>
        </div>
      </div>

      {/* ADOPTION DOCTOR CARD (Groq Structured JSON Output) */}
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

      {/* 8-Week Usage Telemetry Chart */}
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
