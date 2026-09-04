import React, { useState, useEffect } from 'react';
import {
  Layers,
  Award,
  CheckCircle2,
  XCircle,
  Shield,
  HelpCircle,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import { fetchWedgeComparison, fetchBuyerObjections } from '../api';

export const WedgeMatrix: React.FC<{ onAskObjection: (q: string) => void }> = ({
  onAskObjection,
}) => {
  const [data, setData] = useState<{ matrix: any[]; three_layer_moat: any[] } | null>(null);
  const [buyerObjections, setBuyerObjections] = useState<any[]>([]);

  useEffect(() => {
    fetchWedgeComparison().then(setData);
    fetchBuyerObjections().then(setBuyerObjections);
  }, []);

  if (!data) return <div className="p-8 text-center text-slate-500">Loading wedge analysis...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold mb-2">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          Strategic Wedge Analysis (Fixed Selection — Not a Live Recommender)
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Why FP&A Variance Analysis is the Wedge
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mt-1">
          Scored rigorously against candidate enterprise workflows. The winning wedge requires high cadence, measurable time saved, and human-in-the-loop analyst verification.
        </p>
      </div>

      {/* Static Wedge Comparison Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          Workflow Evaluation Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-3 px-4">Workflow Candidate</th>
                <th className="py-3 px-4">Pain (10)</th>
                <th className="py-3 px-4">Frequency (10)</th>
                <th className="py-3 px-4">Measurability (10)</th>
                <th className="py-3 px-4">Pilotability (10)</th>
                <th className="py-3 px-4">Composite</th>
                <th className="py-3 px-4">Buyer & Champion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.matrix.map((row, i) => (
                <tr
                  key={i}
                  className={
                    row.is_selected_wedge
                      ? 'bg-emerald-950/20 text-emerald-100 font-medium'
                      : 'text-slate-300'
                  }
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {row.is_selected_wedge ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold block text-white text-sm">
                          {row.workflow}
                        </span>
                        <span className="text-[11px] text-slate-400 block">{row.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold">{row.pain_score}</td>
                  <td className="py-4 px-4 font-mono font-bold">{row.frequency_score}</td>
                  <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                    {row.measurability_score}
                  </td>
                  <td className="py-4 px-4 font-mono font-bold">{row.pilotability_score}</td>
                  <td className="py-4 px-4 font-mono font-black text-sm text-emerald-300">
                    {row.total_composite_score}
                  </td>
                  <td className="py-4 px-4 text-[11px]">
                    <span className="text-white block font-semibold">{row.buyer}</span>
                    <span className="text-slate-400">Champion: {row.champion}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytical Deep-Dive: Self-Referential Procurement Wedge Runner-Up */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-white text-base">
            Analytical Rigor: Why We Evaluated and Deferred the Self-Referential Procurement Wedge
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          We did not pick FP&A blindly as the default answer. We conducted a deep analytical evaluation of the seductive <strong className="text-amber-300">Self-Referential Procurement Ops Wedge</strong> ("using an AI to audit software procurement, negotiate terms, and detect shelfware in incumbent AI contracts like Microsoft Copilot").
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <span className="font-bold text-emerald-400 block mb-1">
              1. The Seductive Narrative
            </span>
            <p className="text-slate-300">
              Procurement heads love the poetic justice of an AI that audits incumbent AI shelfware and negotiates SaaS discounts. It yields immediate theoretical savings on multimillion-dollar contracts.
            </p>
          </div>

          <div className="bg-slate-950 border border-amber-900/60 rounded-xl p-4">
            <span className="font-bold text-amber-400 block mb-1">
              2. The Day-1 Fatal Flaws
            </span>
            <p className="text-slate-300">
              <strong>High Legal Liability:</strong> If the AI hallucinates a liability cap or misses an uncapped indemnity clause in an MSA, General Counsel freezes the pilot. <strong>Cadence:</strong> Contract renewals occur quarterly or annually, lacking the unrelenting monthly closing heartbeat of FP&A.
            </p>
          </div>

          <div className="bg-slate-950 border border-indigo-900/60 rounded-xl p-4">
            <span className="font-bold text-indigo-400 block mb-1">
              3. Graduated Expansion #1
            </span>
            <p className="text-slate-300">
              Rather than discarding it, Procurement Ops is our <strong>#1 Graduated Expansion Target</strong>. Once FP&A variance analysis hits 60% WAU and establishes trust, the CFO introduces Solvant to Procurement at $26/user/month!
            </p>
          </div>
        </div>
      </div>

      {/* 3-Layer Defensibility Moat */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          The 3-Layer Moat Against Bundled Incumbents
        </h3>
        <p className="text-xs text-slate-400">
          If Microsoft or Google bundles a free clone within 90 days, why doesn't the customer switch? The moat is built during the pilot:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {data.three_layer_moat.map((moat, i) => (
            <div
              key={i}
              className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 block mb-2">
                  {moat.layer}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{moat.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-indigo-300">
                <strong className="text-slate-400 block mb-0.5">Incumbent Defense:</strong>
                {moat.defensibility}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buyer Objection Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            Buyer Objection Persona Simulator (Rehearsal Practice)
          </h3>
          <span className="text-xs text-slate-400">Simulate Curveball Questions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buyerObjections.map((b, i) => (
            <div
              key={i}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-emerald-400 block mb-1">
                  {b.persona}
                </span>
                <p className="text-xs text-slate-200 font-medium italic mb-3">
                  "{b.question}"
                </p>
              </div>

              <button
                onClick={() => onAskObjection(b.suggested_query)}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition text-center"
              >
                Send to Trust Copilot →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
