import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Shield,
  Percent,
  Sliders,
  Sparkles,
  Info,
  RefreshCw,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  PricingSimulationInput,
  PricingSimulationOutput,
  PricingStrategistResponse,
} from '../types';
import { runPricingSimulation, fetchPricingStrategist, fetchCompetitorTeardowns } from '../api';

export const PricingSimulator: React.FC = () => {
  const [competitorTeardowns, setCompetitorTeardowns] = useState<any[]>([]);
  const [params, setParams] = useState<PricingSimulationInput>({
    pilot_price: 12000,
    pilot_users: 50,
    expansion_wau_threshold: 0.60,
    usage_credit_rate: 0.40,
    full_price_per_user: 30,
    pilot_to_expansion_conversion_pct: 65,
    monthly_churn_pct: 1.5,
    gross_margin_pct: 76.5,
    new_pilots_per_month: 6,
    workflow_runs_per_user_month: 140,
    workflow_run_allowance: 100,
    expansion_seat_multiplier: 3.5,
  });

  const [output, setOutput] = useState<PricingSimulationOutput | null>(null);
  const [showNorthBridgeShadow, setShowNorthBridgeShadow] = useState(true);
  const [strategistLoading, setStrategistLoading] = useState(false);
  const [strategistResponse, setStrategistResponse] = useState<PricingStrategistResponse | null>(null);
  const [showCostStackModal, setShowCostStackModal] = useState(false);

  useEffect(() => {
    runModel(params);
    fetchCompetitorTeardowns().then(setCompetitorTeardowns);
  }, [params]);

  const runModel = async (currentParams: PricingSimulationInput) => {
    try {
      const res = await runPricingSimulation(currentParams);
      setOutput(res);
      // Fetch strategist explanation
      loadStrategistExplanation(res);
    } catch (err) {
      console.error(err);
    }
  };

  const loadStrategistExplanation = async (simOutput: PricingSimulationOutput) => {
    setStrategistLoading(true);
    try {
      const res = await fetchPricingStrategist(simOutput);
      setStrategistResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setStrategistLoading(false);
    }
  };

  const handleSliderChange = (field: keyof PricingSimulationInput, value: number) => {
    setParams((prev) => ({ ...prev, [field]: value }));
  };

  const handleSimulateAcmeSlump = () => {
    // Demonstrates live demo step 3: simulated adoption drop causes conversion to drop from 65% to 45%
    setParams((prev) => ({
      ...prev,
      pilot_to_expansion_conversion_pct: 45,
      monthly_churn_pct: 2.8,
    }));
  };

  const handleResetParams = () => {
    setParams({
      pilot_price: 12000,
      pilot_users: 50,
      expansion_wau_threshold: 0.60,
      usage_credit_rate: 0.40,
      full_price_per_user: 30,
      pilot_to_expansion_conversion_pct: 65,
      monthly_churn_pct: 1.5,
      gross_margin_pct: 76.5,
      new_pilots_per_month: 6,
      workflow_runs_per_user_month: 140,
      workflow_run_allowance: 100,
      expansion_seat_multiplier: 3.5,
    });
  };

  // Prepare chart series combining Solvant ARR and NorthBridge Shadow
  const chartData = output
    ? output.monthly_projections.map((p, idx) => {
        const nb = output.northbridge_shadow[idx];
        return {
          month: `M${p.month}`,
          solvant_arr: Math.round(p.total_arr / 1000),
          solvant_mrr: p.total_mrr,
          gross_profit: Math.round((p.total_arr * (params.gross_margin_pct / 100)) / 1000),
          northbridge_shadow_spend: Math.round((nb.northbridge_billed_monthly * 12) / 1000),
          customer_shelfware_waste: Math.round((nb.customer_wasted_shelfware_spend * 12) / 1000),
          active_seats: p.active_seats,
        };
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold mb-2">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Usage-Metered vs. Incumbent Shelfware Economics
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              24-Month Pricing & Financial Model
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Deterministic financial calculation. Pure backend code calculates ARR, gross profit, and NRR. Groq explains the strategic tradeoffs to CFO judges.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSimulateAcmeSlump}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-700/80 text-amber-200 transition shadow"
            >
              Simulate Account Slump (-20% Conv)
            </button>
            <button
              onClick={handleResetParams}
              className="flex items-center gap-1 px-3 py-2 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      {output && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 12M ARR */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              12-Month ARR
            </span>
            <div className="text-2xl font-black text-white font-mono">
              ${(output.arr_12m / 1000).toFixed(1)}k
            </div>
            <span className="text-xs text-emerald-400 block mt-1">
              {output.active_seats_12m} active seats • {output.active_customers_12m} accts
            </span>
          </div>

          {/* 24M ARR */}
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-lg bg-gradient-to-b from-emerald-950/20 to-slate-900">
            <span className="text-[11px] text-emerald-400 uppercase tracking-wider block mb-1">
              24-Month ARR
            </span>
            <div className="text-2xl font-black text-emerald-300 font-mono">
              ${(output.arr_24m / 1000000).toFixed(2)}M
            </div>
            <span className="text-xs text-slate-400 block mt-1">
              {output.active_seats_24m} active seats • {output.active_customers_24m} accts
            </span>
          </div>

          {/* Gross Margin & Profit */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                24M Gross Profit
              </span>
              <button
                onClick={() => setShowCostStackModal(true)}
                className="text-slate-400 hover:text-emerald-400 transition"
                title="View defensible cost stack"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              ${(output.gross_profit_24m / 1000000).toFixed(2)}M
            </div>
            <span className="text-xs text-emerald-400 block mt-1">
              {params.gross_margin_pct}% Defensible Margin
            </span>
          </div>

          {/* NRR */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Net Revenue Retention
            </span>
            <div className="text-2xl font-black text-white font-mono">
              {output.nrr_pct}%
            </div>
            <span className="text-xs text-slate-400 block mt-1">
              3.5x expansion seat multiplier
            </span>
          </div>

          {/* NorthBridge Shelfware Waste Avoided */}
          <div className="bg-slate-900 border border-indigo-900/60 rounded-2xl p-5 shadow-lg col-span-2 lg:col-span-1">
            <span className="text-[11px] text-indigo-400 uppercase tracking-wider block mb-1">
              Shelfware Waste Saved
            </span>
            <div className="text-2xl font-black text-indigo-300 font-mono">
              $
              {(
                output.northbridge_shadow[23].customer_wasted_shelfware_spend / 1000
              ).toFixed(1)}
              k/mo
            </div>
            <span className="text-xs text-slate-400 block mt-1">
              vs Incumbent $60/seat tax
            </span>
          </div>
        </div>
      )}

      {/* Main Simulator Grid: Controls + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Financial Sliders */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              GTM & Pricing Controls
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Pure Deterministic</span>
          </div>

          {/* Slider 1: Pilot Price */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">60-Day Pilot Deposit</span>
              <span className="text-emerald-400 font-mono">${params.pilot_price.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="8000"
              max="24000"
              step="1000"
              value={params.pilot_price}
              onChange={(e) => handleSliderChange('pilot_price', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">
              100% refundable against value targets
            </span>
          </div>

          {/* Slider 2: Full Price Per Active User */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Post-Pilot Active User Price</span>
              <span className="text-emerald-400 font-mono">${params.full_price_per_user}/user/mo</span>
            </div>
            <input
              type="range"
              min="20"
              max="45"
              step="1"
              value={params.full_price_per_user}
              onChange={(e) => handleSliderChange('full_price_per_user', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Billed ONLY on customer's weekly active users
            </span>
          </div>

          {/* Slider 3: Expansion Conversion Rate */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Pilot → Expansion Conversion</span>
              <span className="text-emerald-400 font-mono">{params.pilot_to_expansion_conversion_pct}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="90"
              step="5"
              value={params.pilot_to_expansion_conversion_pct}
              onChange={(e) =>
                handleSliderChange('pilot_to_expansion_conversion_pct', parseFloat(e.target.value))
              }
              className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Target baseline: 65% graduation rate
            </span>
          </div>

          {/* Slider 4: Monthly Churn Rate */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Post-Expansion Monthly Churn</span>
              <span className="text-amber-400 font-mono">{params.monthly_churn_pct}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={params.monthly_churn_pct}
              onChange={(e) => handleSliderChange('monthly_churn_pct', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Slider 5: Gross Margin Rate */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Gross Margin Target</span>
              <span className="text-emerald-400 font-mono">{params.gross_margin_pct}%</span>
            </div>
            <input
              type="range"
              min="65"
              max="85"
              step="0.5"
              value={params.gross_margin_pct}
              onChange={(e) => handleSliderChange('gross_margin_pct', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Defensible cost stack: 23.5% COGS (11.5% LLM inference + 8.5% CS + 3.5% Cloud)
            </span>
          </div>

          {/* Slider 6: Overage Run Pricing */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Usage Credit Overage Rate</span>
              <span className="text-emerald-400 font-mono">${params.usage_credit_rate.toFixed(2)}/run</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="1.00"
              step="0.05"
              value={params.usage_credit_rate}
              onChange={(e) => handleSliderChange('usage_credit_rate', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Billed for workflow runs exceeding 100/mo allowance
            </span>
          </div>
        </div>

        {/* Right Column (2 cols): 24-Month Projection Chart & NorthBridge Shadow */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  24-Month ARR Projection & NorthBridge Shadow Overlay
                </h3>
                <p className="text-xs text-slate-400">
                  Solvant usage-metered ARR vs NorthBridge incumbent seat-tax model ($60/licensed seat with 33% usage).
                </p>
              </div>

              {/* Toggle NorthBridge Shadow */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                <input
                  type="checkbox"
                  checked={showNorthBridgeShadow}
                  onChange={(e) => setShowNorthBridgeShadow(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span>NorthBridge Shadow Overlay</span>
              </label>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="solvantArrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="shadowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="k" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0b1120',
                      border: '1px solid #334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area
                    type="monotone"
                    dataKey="solvant_arr"
                    name="Solvant Usage-Metered ARR ($k)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#solvantArrGrad)"
                  />
                  {showNorthBridgeShadow && (
                    <Area
                      type="monotone"
                      dataKey="northbridge_shadow_spend"
                      name="NorthBridge Seat-Tax Model ($k)"
                      stroke="#818cf8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#shadowGrad)"
                    />
                  )}
                  {showNorthBridgeShadow && (
                    <Line
                      type="monotone"
                      dataKey="customer_shelfware_waste"
                      name="Customer Wasted Spend on Incumbent ($k)"
                      stroke="#f43f5e"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GROQ PRICING STRATEGIST CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Groq Pricing Strategist (Tradeoff Explainer)
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono font-normal">
                      Explain-Only
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Interprets deterministic simulation facts. Explains why numbers moved to a CFO.
                  </p>
                </div>
              </div>

              {strategistResponse && (
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    strategistResponse.is_live_llm
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                  }`}
                >
                  {strategistResponse.is_live_llm
                    ? '✓ Groq Live (LLaMA 3.3 70B)'
                    : '✓ Verified Baseline Cache'}
                </span>
              )}
            </div>

            {strategistResponse ? (
              <div className="space-y-4 bg-slate-950/80 border border-slate-800/80 rounded-xl p-5">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    CFO Executive Summary
                  </span>
                  <p className="text-xs text-slate-200">{strategistResponse.summary}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Core Strategic Tradeoff
                  </span>
                  <p className="text-xs font-semibold text-emerald-400">
                    {strategistResponse.primary_tradeoff}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    Unit Economic Strategic Implications
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {strategistResponse.strategic_implications.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                    CFO Soundbite (Rehearse this on stage)
                  </span>
                  <blockquote className="text-xs italic text-indigo-300 border-l-2 border-indigo-500 pl-3">
                    {strategistResponse.cfo_soundbite}
                  </blockquote>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                Calculating strategist perspective...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-Competitor Pricing Teardowns (20% Quantitative Rigor Requirement) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Real-Competitor Pricing Teardowns & Mathematical Defense
            </h3>
            <p className="text-xs text-slate-400">
              Quantitative comparison of market pricing archetypes vs Solvant's hybrid adoption-metered model.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
            Part of 20% Quantitative Rigor
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitorTeardowns.map((td, i) => (
            <div
              key={i}
              className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-sm">{td.competitor}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-900 text-indigo-300 border border-slate-800">
                    {td.model_type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mb-2">{td.pricing_mechanics}</p>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 mb-2">
                  <strong className="text-slate-400 block mb-0.5">Where It Fails In Enterprise GenAI:</strong>
                  {td.failure_mode_in_genai}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-xs text-emerald-300">
                <strong className="text-emerald-400 block mb-0.5">Solvant Hybrid Solution:</strong>
                {td.solvant_solution}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Defensible Cost Stack Modal */}
      {showCostStackModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Defensible 76.5% Gross Margin Cost Stack
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Prepared to defend live if a judge questions: "Why 76.5% gross margin? What is inside your cost stack?"
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="font-bold text-white block">LLM Inference & Fast Compute (Groq)</span>
                  <span className="text-[10px] text-slate-400">
                    Llama 3.3 70B tokens + variance JSON parsing
                  </span>
                </div>
                <span className="text-amber-400 font-bold">11.5%</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="font-bold text-white block">Customer Success & FP&A Tuning Support</span>
                  <span className="text-[10px] text-slate-400">
                    Solutions engineer hours amortized per account
                  </span>
                </div>
                <span className="text-amber-400 font-bold">8.5%</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="font-bold text-white block">Cloud Infrastructure & VPC Isolation</span>
                  <span className="text-[10px] text-slate-400">
                    Stateless AWS/Frankfurt containers & KMS encryption
                  </span>
                </div>
                <span className="text-amber-400 font-bold">3.5%</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-slate-300">
                  <span>Total Cost of Goods Sold (COGS):</span>
                  <span className="text-rose-400">23.5%</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-400 text-sm pt-1 border-t border-slate-800">
                  <span>Defensible Gross Margin:</span>
                  <span>76.5%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowCostStackModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
