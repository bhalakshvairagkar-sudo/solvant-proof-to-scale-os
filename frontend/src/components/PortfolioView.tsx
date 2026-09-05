import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
  Database,
} from 'lucide-react';
import { AccountItemResponse, PortfolioSummary } from '../types';

interface PortfolioViewProps {
  accounts: AccountItemResponse[];
  summary: PortfolioSummary | null;
  onSelectAccount: (accountId: string) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  accounts,
  summary,
  onSelectAccount,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'EXPANSION' | 'WATCH' | 'RISK'>('ALL');
  const [search, setSearch] = useState('');

  const filteredAccounts = useMemo(() => {
    return accounts.filter((item) => {
      const matchSearch =
        item.account.name.toLowerCase().includes(search.toLowerCase()) ||
        item.account.industry.toLowerCase().includes(search.toLowerCase()) ||
        item.account.champion_name.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (filter === 'EXPANSION') return item.expansion.verdict === 'EXPAND';
      if (filter === 'WATCH')
        return item.health.band === 'Healthy but Watch' || (item.health.band === 'Expansion Ready' && item.expansion.verdict !== 'EXPAND');
      if (filter === 'RISK') return item.health.band === 'At Risk' || item.intervention_required;
      return true;
    });
  }, [accounts, filter, search]);

  return (
    <div className="space-y-6">
      {/* Portfolio Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Pilot Stage: 60-Day Fixed Contract ($12,000 Deposit)
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-semibold">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                Synthetic Benchmark Data — 24 Calibrated Enterprise Cohorts
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Enterprise Portfolio Overview
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Deterministic health tracking across all enterprise pilot accounts. Expansion is never self-reported by Solvant — it unlocks only when customer logs verify WAU threshold, 20% time reduction, and 70% 30d retention.
            </p>
          </div>

          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
              <div className="px-3 py-1.5 border-r border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Active Pilots</span>
                <span className="text-xl font-bold text-white">{summary.total_accounts}</span>
              </div>
              <div className="px-3 py-1.5 border-r border-slate-800">
                <span className="text-[11px] text-emerald-400 uppercase tracking-wider block">Expansion Ready</span>
                <span className="text-xl font-bold text-emerald-400">{summary.expansion_ready_count}</span>
              </div>
              <div className="px-3 py-1.5 border-r border-slate-800">
                <span className="text-[11px] text-amber-400 uppercase tracking-wider block">Watch</span>
                <span className="text-xl font-bold text-amber-400">{summary.healthy_watch_count}</span>
              </div>
              <div className="px-3 py-1.5">
                <span className="text-[11px] text-rose-400 uppercase tracking-wider block">At Risk Alerts</span>
                <span className="text-xl font-bold text-rose-400">{summary.at_risk_count}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PINNED DEMO ANCHORS (Preselected Judge Walkthrough Mode) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Pinned Demo Anchors
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Click any anchor to jump directly to deep-dive diagnosis
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'acct_acme_corp', name: 'Acme Corp', role: 'Anchor 1: Clear Winner', wau: '85.4% WAU • Day 56', status: 'Expansion Ready (92.9)', verdict: 'EXPAND', border: 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-slate-900' },
            { id: 'acct_meridian_financial', name: 'Meridian Financial', role: 'Anchor 2: Strong Performer', wau: '83.0% WAU • Day 52', status: 'Expansion Ready (89.6)', verdict: 'EXPAND', border: 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-slate-900' },
            { id: 'acct_nova_industries', name: 'Nova Industries', role: 'Anchor 3: Boundary Case', wau: '61.5% WAU • Day 42', status: 'Healthy Watch (68.7)', verdict: 'HOLD', border: 'border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-slate-900' },
            { id: 'acct_apex_global', name: 'Apex Global', role: 'Anchor 4: Day-45 SLA Breach', wau: '27.3% WAU • Day 45', status: 'At Risk (30.2)', verdict: 'INTERVENE', border: 'border-rose-500/40 bg-gradient-to-b from-rose-950/20 to-slate-900' },
          ].map((anchor) => (
            <button
              key={anchor.id}
              onClick={() => onSelectAccount(anchor.id)}
              className={`p-4 rounded-xl border ${anchor.border} text-left transition hover:scale-[1.02] shadow-lg flex flex-col justify-between`}
            >
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1">{anchor.role}</span>
                <span className="text-sm font-bold text-white block">{anchor.name}</span>
                <span className="text-xs text-slate-300 font-mono mt-0.5 block">{anchor.wau}</span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-200">{anchor.status}</span>
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                  anchor.verdict === 'EXPAND'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : anchor.verdict === 'HOLD'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {anchor.verdict}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs w-full sm:w-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              filter === 'ALL'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Accounts ({accounts.length})
          </button>
          <button
            onClick={() => setFilter('EXPANSION')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition font-medium ${
              filter === 'EXPANSION'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Expansion Ready (70-100)
          </button>
          <button
            onClick={() => setFilter('WATCH')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition font-medium ${
              filter === 'WATCH'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Watch (40-69)
          </button>
          <button
            onClick={() => setFilter('RISK')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition font-medium ${
              filter === 'RISK'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            At Risk / Day 45 Alert (&lt;40)
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search account, industry, champion..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((item) => {
          const { account, health, expansion, intervention_required, estimated_arr } = item;
          const isAcme = account.id === 'acct_acme_corp';

          return (
            <div
              key={account.id}
              onClick={() => onSelectAccount(account.id)}
              className={`bg-slate-900/90 border rounded-2xl p-5 hover:border-slate-600 transition-all cursor-pointer group relative flex flex-col justify-between ${
                isAcme
                  ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/20 to-slate-900 shadow-lg shadow-emerald-950/30'
                  : 'border-slate-800'
              }`}
            >
              {isAcme && (
                <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold tracking-wider uppercase">
                  Flagship Demo Account
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition flex items-center gap-1.5">
                      {account.name}
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition text-emerald-400" />
                    </h3>
                    <p className="text-xs text-slate-400">{account.industry}</p>
                  </div>

                  {/* Health Score Pill */}
                  <div
                    className={`flex flex-col items-end px-2.5 py-1 rounded-xl border font-mono ${
                      health.band === 'Expansion Ready'
                        ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400'
                        : health.band === 'Healthy but Watch'
                        ? 'bg-amber-950/60 border-amber-800/80 text-amber-400'
                        : 'bg-rose-950/60 border-rose-800/80 text-rose-400'
                    }`}
                  >
                    <span className="text-lg font-black leading-tight">
                      {health.final_score}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400">
                      Score / 100
                    </span>
                  </div>
                </div>

                {/* Day status & Intervention banner */}
                <div className="flex items-center gap-2 mb-4 text-xs">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Day {account.pilot_days_elapsed} / 60
                  </span>

                  {intervention_required && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300 font-semibold animate-pulse">
                      <ShieldAlert className="w-3 h-3 text-rose-400" />
                      Day-45 SLA Trigger
                    </span>
                  )}
                </div>

                {/* 5-Dimension Mini Score Bars */}
                <div className="space-y-1.5 bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 mb-4 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Weekly Active Rate (WAU):</span>
                    <span className="font-semibold text-slate-200">
                      {(health.frequency_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, health.frequency_score * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Workflow Time Reduction:</span>
                    <span className="font-semibold text-slate-200">
                      {(account.workflow_time_reduction_pct * 100).toFixed(1)}% (Goal: ≥20%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        account.workflow_time_reduction_pct >= 0.20 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, (account.workflow_time_reduction_pct / 0.20) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">30-Day User Retention:</span>
                    <span className="font-semibold text-slate-200">
                      {(health.retention_score * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">4-Wk Trend Slope:</span>
                    <span
                      className={`font-semibold capitalize ${
                        health.trend_direction === 'positive'
                          ? 'text-emerald-400'
                          : health.trend_direction === 'flat'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {health.trend_direction} ({health.trend_slope > 0 ? '+' : ''}
                      {health.trend_slope.toFixed(3)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
                    Expansion Verdict
                  </span>
                  <span
                    className={`font-bold uppercase ${
                      expansion.verdict === 'EXPAND'
                        ? 'text-emerald-400'
                        : expansion.verdict === 'HOLD'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {expansion.verdict}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
                    Post-Pilot ARR
                  </span>
                  <span className="font-bold text-slate-200 font-mono">
                    ${(estimated_arr / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
