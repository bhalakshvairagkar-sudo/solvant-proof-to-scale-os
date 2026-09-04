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
  BookOpen,
} from 'lucide-react';
import { fetchGTMResearchSuite } from '../api';
import { GTMResearchSuiteResponse } from '../types';

interface GTMResearchIntelligenceProps {
  onNavigateToDeepDive?: () => void;
  onNavigateToPricing?: () => void;
  onNavigateToTrust?: () => void;
}

export const GTMResearchIntelligence: React.FC<GTMResearchIntelligenceProps> = ({
  onNavigateToDeepDive,
  onNavigateToPricing,
  onNavigateToTrust,
}) => {
  const [data, setData] = useState<GTMResearchSuiteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'synthesis' | 'companies' | 'matrix' | 'pricing'>('synthesis');
  const [selectedCompany, setSelectedCompany] = useState<string>('Atlassian');

  useEffect(() => {
    fetchGTMResearchSuite()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
        <span>Loading GTM Research Intelligence...</span>
      </div>
    );
  }

  const { gtm_intelligence, adoption_gap_matrix, pricing_benchmark, synthesis } = data;
  const currentCompanyData = gtm_intelligence.find((c) => c.company === selectedCompany) || gtm_intelligence[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              Case Study 2: The Challenger's Wedge — GTM Research Intelligence
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Enterprise AI GTM Strategy & Competitor Teardowns
            </h2>
            <p className="text-sm text-slate-400 max-w-3xl mt-1">
              Empirical market research across three enterprise software giants (Atlassian, Salesforce, ServiceNow), an 8-cause Adoption Gap Matrix, and a verified Pricing Benchmark Teardown.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-mono font-semibold">
              Empirical GTM Evidence Base
            </span>
          </div>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveSection('synthesis')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'synthesis'
                ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>1. Solvant Strategic Synthesis</span>
          </button>

          <button
            onClick={() => setActiveSection('companies')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'companies'
                ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Incumbent Research (Atlassian • Salesforce • ServiceNow)</span>
          </button>

          <button
            onClick={() => setActiveSection('matrix')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'matrix'
                ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>3. Adoption Gap Research Matrix (8 Causes)</span>
          </button>

          <button
            onClick={() => setActiveSection('pricing')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'pricing'
                ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>4. Pricing Teardown Benchmark (Public Sources)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SOLVANT STRATEGIC SYNTHESIS */}
      {/* ========================================================================= */}
      {activeSection === 'synthesis' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Core Thesis Banner */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border-2 border-emerald-500/50 rounded-2xl p-6 shadow-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-600/60 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Strategic Challenger Conclusion
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              "{synthesis.core_thesis}"
            </h3>
            <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              {synthesis.sub_thesis}
            </p>
          </div>

          {/* 6-Step Value Pipeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-emerald-400" />
                The Solvant Proof-to-Scale GTM Pipeline
              </h4>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                Our Strategic Synthesis
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
              {synthesis.pipeline_steps.map((step) => (
                <div
                  key={step.step}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3 relative hover:border-slate-700 transition"
                >
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-[10px] text-emerald-400">
                    {step.step}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block pr-6">{step.title}</span>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{step.description}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-[10px] text-emerald-300 font-mono">
                    <strong className="text-slate-500 block font-sans">Proof Point:</strong>
                    {step.proof_point}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incumbent vs. Solvant Contrast Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-rose-900/60 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  The Incumbent Playbook (Monetize Distribution)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                  Shelfware Vulnerability
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {synthesis.incumbent_vs_solvant_comparison.incumbent.strategy}
              </p>
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs text-rose-200">
                <strong>Business Consequence:</strong> {synthesis.incumbent_vs_solvant_comparison.incumbent.consequence}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-900/60 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  The Solvant Playbook (Monetize Proof)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  Challenger Advantage
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {synthesis.incumbent_vs_solvant_comparison.solvant.strategy}
              </p>
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-200">
                <strong>Business Consequence:</strong> {synthesis.incumbent_vs_solvant_comparison.solvant.consequence}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. INCUMBENT RESEARCH (Atlassian, Salesforce, ServiceNow) */}
      {/* ========================================================================= */}
      {activeSection === 'companies' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Company Selector Buttons */}
          <div className="flex flex-wrap gap-3">
            {gtm_intelligence.map((item) => (
              <button
                key={item.company}
                onClick={() => setSelectedCompany(item.company)}
                className={`px-4 py-2.5 rounded-xl text-left border text-xs transition flex items-center gap-2.5 ${
                  selectedCompany === item.company
                    ? 'bg-emerald-950 border-emerald-500 text-white font-bold shadow-lg shadow-emerald-950'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <div>
                  <span className="block font-bold">{item.company}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{item.ticker}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Detailed Teardown Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                  Enterprise Case Analysis
                </span>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {currentCompanyData.company} ({currentCompanyData.ticker})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentCompanyData.market_position}</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                Real Enterprise Telemetry
              </span>
            </div>

            {/* Core GTM Mechanics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                  1. Land Motion
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {currentCompanyData.land_motion}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                  2. Expansion Motion
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {currentCompanyData.expansion_motion}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                  3. Pricing Model
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {currentCompanyData.pricing_model}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                  4. AI Mechanism
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {currentCompanyData.ai_mechanism}
                </p>
              </div>
            </div>

            {/* Why It Works Box */}
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/60 text-xs text-indigo-200">
              <strong className="text-indigo-400 block mb-1 text-[11px] uppercase tracking-wider">
                Why Their Model Works in Practice:
              </strong>
              {currentCompanyData.why_it_works}
            </div>

            {/* Transferable vs. Non-Transferable Lessons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Transferable Lesson */}
              <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-800/80 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Transferable Lesson for Solvant
                  </h4>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {currentCompanyData.transferable_lesson}
                </p>
              </div>

              {/* Non-Transferable Lesson */}
              <div className="p-5 rounded-xl bg-rose-950/30 border border-rose-800/80 space-y-2">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                    Non-Transferable Lesson & Challenger Trap
                  </h4>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  <strong>Why it fails without an installed base:</strong> {currentCompanyData.why_not_transferable}
                </p>
                <div className="pt-2 border-t border-rose-900/60 text-[11px] text-rose-300/90 font-mono">
                  Lesson: {currentCompanyData.non_transferable_lesson}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ADOPTION GAP RESEARCH MATRIX (8 Causes) */}
      {/* ========================================================================= */}
      {activeSection === 'matrix' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  Adoption Gap Research Matrix (Can GTM Fix It?)
                </h3>
                <p className="text-xs text-slate-400">
                  Categorization of 8 empirical root causes of enterprise AI adoption stalls and their programmatic resolution.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                Connected to Adoption Doctor Engine
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="py-3 px-4">Root Cause</th>
                    <th className="py-3 px-4">GTM Can Fix?</th>
                    <th className="py-3 px-4">How Solvant Remediates (Intervention Engine)</th>
                    <th className="py-3 px-4">Adoption Doctor / SLA Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {adoption_gap_matrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-950/50 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white text-sm block">{row.root_cause}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold uppercase border ${
                            row.can_gtm_fix === 'YES'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : row.can_gtm_fix === 'PARTIAL'
                              ? 'bg-amber-950 text-amber-300 border-amber-700'
                              : 'bg-rose-950 text-rose-300 border-rose-700'
                          }`}
                        >
                          {row.can_gtm_fix}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-200 max-w-md leading-relaxed font-medium">
                        {row.how_solvant_remediates}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-400 font-mono">
                        {row.doctor_connection}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>Rule-based intervention engine maps 8 discrete enterprise root causes to standard operating procedures.</span>
              <button
                onClick={onNavigateToDeepDive}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Inspect in Live Account Deep-Dive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PRICING BENCHMARK TEARDOWN (Public Sources) */}
      {/* ========================================================================= */}
      {activeSection === 'pricing' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Enterprise AI Pricing Benchmark Teardown
                </h3>
                <p className="text-xs text-slate-400">
                  Comparative breakdown of publicly listed pricing mechanisms and structural lessons for Solvant.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800">
                Public Commercial Disclosures
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Public List Price</th>
                    <th className="py-3 px-4">Seat-based?</th>
                    <th className="py-3 px-4">Usage-based?</th>
                    <th className="py-3 px-4">AI Meter?</th>
                    <th className="py-3 px-4">Expansion Motion</th>
                    <th className="py-3 px-4">Solvant Strategic Lesson</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pricing_benchmark.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-950/50 transition">
                      <td className="py-4 px-4">
                        <span className="font-bold text-white text-sm block">{p.company}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 max-w-xs truncate" title={p.source}>
                          {p.source}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono font-semibold text-emerald-400">
                        {p.list_price}
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-300">
                        {p.seat_based}
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-300">
                        {p.usage_based}
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-indigo-300">
                        {p.ai_specific_meter}
                      </td>
                      <td className="py-4 px-4 text-slate-300 text-[11px] max-w-xs">
                        {p.expansion_mechanism}
                      </td>
                      <td className="py-4 px-4 text-slate-200 text-[11px] max-w-xs font-medium">
                        {p.solvant_lesson}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="italic text-[11px]">
                Note: No pricing numbers are invented. All figures are verified from publicly listed commercial guides and SEC/analyst disclosures.
              </span>
              <button
                onClick={onNavigateToPricing}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Run Interactive Pricing Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
