import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Database,
  FileCode2,
  Award,
  Sparkles,
  Send,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TrustCopilotResponse, TrustFactItem } from '../types';
import {
  fetchTrustCopilot,
  fetchTrustFactBase,
  fetchAdversarialCurveballs,
  fetchAuditEvents,
  verifyAuditChain,
  tamperAuditDemo,
  resetAuditChain,
} from '../api';
import { AuditEvent, AuditChainVerificationResponse } from '../types';

export const TrustCopilot: React.FC = () => {
  const [facts, setFacts] = useState<TrustFactItem[]>([]);
  const [adversarialCurveballs, setAdversarialCurveballs] = useState<any[]>([]);
  const [showAdversarialMode, setShowAdversarialMode] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(
    'Where is our financial data stored and who has access?'
  );
  const [customQuestion, setCustomQuestion] = useState('');
  const [response, setResponse] = useState<TrustCopilotResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFactBase, setShowFactBase] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [verificationResult, setVerificationResult] = useState<AuditChainVerificationResponse | null>(null);
  const [verifying, setVerifying] = useState(false);

  const quickObjections = [
    {
      label: '1. DATA RESIDENCY (Sovereignty & VPC)',
      q: 'Where is our financial data stored and who has access?',
    },
    {
      label: '2. MODEL TRAINING (Zero Data Retention)',
      q: 'Do you train AI models on our proprietary ledger and forecast data?',
    },
    {
      label: '3. VENDOR LOCK-IN (Open Standard Export)',
      q: 'What happens if we terminate? Can we export our commentary and data?',
    },
    {
      label: '4. SOC2 / GDPR Audit (Honest Posture)',
      q: 'Do you hold a completed SOC2 Type II and GDPR certification?',
    },
    {
      label: '5. Incumbent Leakage',
      q: 'Can Microsoft or OpenAI inspect our internal financial ledgers through your API?',
    },
  ];

  useEffect(() => {
    loadFacts();
    fetchAdversarialCurveballs().then(setAdversarialCurveballs);
    handleAsk(selectedQuestion);
  }, []);

  const loadFacts = async () => {
    try {
      const data = await fetchTrustFactBase();
      setFacts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAsk = async (questionToAsk: string) => {
    setLoading(true);
    try {
      const res = await fetchTrustCopilot(questionToAsk);
      setResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickClick = (q: string) => {
    setSelectedQuestion(q);
    setCustomQuestion('');
    handleAsk(q);
  };

  const loadAuditTrail = async () => {
    try {
      const evts = await fetchAuditEvents();
      setAuditEvents(evts);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const res = await verifyAuditChain();
      setVerificationResult(res);
      await loadAuditTrail();
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  const handleTamperDemo = async () => {
    try {
      await tamperAuditDemo(2);
      await handleVerifyChain();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetAuditChain = async () => {
    try {
      await resetAuditChain();
      await handleVerifyChain();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuestion.trim()) {
      setSelectedQuestion(customQuestion.trim());
      handleAsk(customQuestion.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Closed Trust Fact Base & Overclaim Guard
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Trust Copilot (Executive Objection Handler)
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Plain CFO and CISO language grounded strictly in verified enterprise architecture facts. Follows an immutable 5-step response structure with zero invented certifications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdversarialMode(!showAdversarialMode)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/80 text-amber-200 text-xs font-semibold transition"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{showAdversarialMode ? 'Hide Curveballs' : 'Adversarial Rehearsal Partner'}</span>
            </button>
            <button
              onClick={() => setShowFactBase(!showFactBase)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>{showFactBase ? 'Hide Fact Base' : 'Inspect Closed Fact Base'}</span>
              {showFactBase ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                const next = !showAuditTrail;
                setShowAuditTrail(next);
                if (next) {
                  loadAuditTrail();
                  handleVerifyChain();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showAuditTrail ? 'Hide Audit Trail' : 'Tamper-Evident Audit Trail'}</span>
              {showAuditTrail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Adversarial Rehearsal Partner Mode */}
      {showAdversarialMode && (
        <div className="bg-slate-950 border border-amber-800/80 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm">
                Adversarial Partner Rehearsal (Unscripted Multi-Turn Curveballs)
              </h3>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 font-mono">
              Live Stage Composure Training
            </span>
          </div>
          <p className="text-xs text-slate-400">
            A script alone cannot guarantee live composure. Practice how to pivot when an adversarial CISO, CFO, or Procurement Lead follows up aggressively after your opening answer:
          </p>

          <div className="space-y-4">
            {adversarialCurveballs.map((ac, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 text-sm">{ac.persona}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Scenario #{i + 1}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="font-bold text-slate-400 block mb-1">
                      1. Initial Objection & Opening:
                    </span>
                    <p className="text-slate-200 italic mb-2">"{ac.initial_objection}"</p>
                    <span className="font-semibold text-emerald-400 block mb-0.5">Solvant Opening:</span>
                    <p className="text-slate-300">{ac.solvant_opening}</p>
                  </div>

                  <div className="p-3 bg-amber-950/20 rounded-lg border border-amber-900/60">
                    <span className="font-bold text-amber-400 block mb-1">
                      2. Aggressive Curveball Follow-up:
                    </span>
                    <p className="text-amber-200 italic mb-2">"{ac.adversarial_followup}"</p>
                    <span className="font-semibold text-indigo-400 block mb-0.5">Stage Rebuttal:</span>
                    <p className="text-slate-200 leading-relaxed font-medium">{ac.adversarial_rebuttal}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETERMINISTIC CLAIM GUARD VISUAL PIPELINE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Deterministic Claim Guard Pipeline (Code Calculates. Groq Explains.)
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            Claim Guard: deterministic fact-reference validation
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block mb-1">STAGE 1</span>
            <span className="font-bold text-white block">Closed Fact Base</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Authoritative truth source</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block mb-1">STAGE 2</span>
            <span className="font-bold text-slate-200 block">Groq LLaMA 3.3</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Drafts 5-step response</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block mb-1">STAGE 3</span>
            <span className="font-bold text-slate-200 block">Claim Extraction</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Parses specific claims</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-900/60 bg-cyan-950/20">
            <span className="text-[10px] font-mono text-cyan-400 block mb-1">STAGE 4</span>
            <span className="font-bold text-cyan-300 block">Deterministic Guard</span>
            <span className="text-[10px] text-cyan-500 block mt-0.5">Code checks fact references</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-900/60 bg-amber-950/20">
            <span className="text-[10px] font-mono text-amber-400 block mb-1">STAGE 5</span>
            <span className="font-bold text-amber-300 block">Supported?</span>
            <span className="text-[10px] text-amber-500 block mt-0.5">Yes: Display • No: Revert</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-900/60 bg-emerald-950/20">
            <span className="text-[10px] font-mono text-emerald-400 block mb-1">STAGE 6</span>
            <span className="font-bold text-emerald-300 block">SHA-256 Ledger</span>
            <span className="text-[10px] text-emerald-500 block mt-0.5">Hash-chained audit log</span>
          </div>
        </div>
      </div>

      {/* Tamper-Evident SHA-256 Audit Trail Drawer */}
      {showAuditTrail && (
        <div className="bg-slate-950 border border-cyan-800/70 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">
                  Tamper-Evident Audit Ledger (SHA-256 Hash Chaining)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Every pilot milestone, health verdict, and trust response is deterministically hashed and linked to the previous block.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleVerifyChain}
                disabled={verifying}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{verifying ? 'Verifying...' : 'Verify Hash Chain'}</span>
              </button>
              <button
                onClick={handleTamperDemo}
                className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-700/80 text-rose-200 font-bold text-xs transition shadow flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Test Tamper Detection</span>
              </button>
              <button
                onClick={handleResetAuditChain}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Verification Status Banner */}
          {verificationResult && (
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                verificationResult.valid
                  ? 'bg-emerald-950/50 border-emerald-700/80 text-emerald-300'
                  : 'bg-rose-950/70 border-rose-600 text-rose-200 animate-pulse'
              }`}
            >
              <div className="flex items-center gap-2">
                {verificationResult.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>
                  <strong>{verificationResult.valid ? 'Chain Verified Valid:' : 'Tampering Detected:'}</strong>{' '}
                  {verificationResult.valid
                    ? `All ${verificationResult.events_checked} blocks verified. SHA-256 event hash links continuously unbroken to genesis.`
                    : `${verificationResult.reason || 'Cryptographic mismatch detected'}`}
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 hidden md:block">
                Head: {verificationResult.chain_head.slice(0, 12)}...
              </span>
            </div>
          )}

          {/* Audit Events Table */}
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-left">
                  <th className="pb-2">Seq #</th>
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Account</th>
                  <th className="pb-2">Summary</th>
                  <th className="pb-2 text-right">SHA-256 Event Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {auditEvents.map((evt) => (
                  <tr key={evt.event_id} className="hover:bg-slate-900/50">
                    <td className="py-2 text-slate-400">#{evt.sequence_number}</td>
                    <td className="py-2 text-slate-500 text-[10px]">{evt.timestamp.slice(0, 19).replace('T', ' ')}</td>
                    <td className="py-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px]">
                        {evt.event_type}
                      </span>
                    </td>
                    <td className="py-2 text-emerald-400">{evt.account_id}</td>
                    <td className="py-2 text-slate-200 max-w-xs truncate" title={evt.summary}>
                      {evt.summary}
                    </td>
                    <td className="py-2 text-right text-cyan-400 text-[10px]">
                      {evt.event_hash.slice(0, 10)}...{evt.event_hash.slice(-6)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* Closed Fact Base Inspector Drawer */}
      {showFactBase && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">
                Closed Trust Fact Base (Immutable Single Source of Truth)
              </h3>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              Overclaim Guard Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facts.map((fact) => (
              <div
                key={fact.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{fact.title}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      fact.status === 'ACTIVE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {fact.status}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{fact.detail}</p>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1.5">
                  <div className="text-amber-300/90">
                    <strong className="text-slate-400">Strict Limitation:</strong> {fact.limits}
                  </div>
                  {fact.evidence_source && (
                    <div className="text-cyan-300/90 font-mono text-[10px] bg-slate-950/60 p-1.5 rounded border border-slate-800">
                      <strong className="text-slate-400 font-sans">Audited Evidence:</strong> {fact.evidence_source}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Objection Chips Selector */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Select Common Enterprise CISO / CFO Objections:
        </span>
        <div className="flex flex-wrap gap-2">
          {quickObjections.map((obj, i) => (
            <button
              key={i}
              onClick={() => handleQuickClick(obj.q)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition text-left flex items-center gap-2 ${
                selectedQuestion === obj.q
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>{obj.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Query Box for Live Judges */}
      <form onSubmit={handleCustomSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Ask any curveball CISO / CFO objection live..."
          value={customQuestion}
          onChange={(e) => setCustomQuestion(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/20 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask Copilot</span>
        </button>
      </form>

      {/* 5-Step Structured Response Presentation (CFO-Friendly Narrative Architecture) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Response Meta Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              CFO-Friendly Narrative Architecture (5 Distinct Tiers)
            </div>
            <h3 className="font-bold text-white text-base">
              Audited Trust Response for "{selectedQuestion}"
            </h3>
          </div>

          {/* Overclaim Guard Badge */}
          {response && (
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                  response.overclaim_guard.status === 'BOUNDARY_ENFORCED'
                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  Overclaim Guard: {response.overclaim_guard.facts_grounded_count} Verified Facts Grounded
                </span>
              </span>

              <span
                className={`text-xs px-2 py-0.5 rounded font-mono ${
                  response.is_live_llm
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                }`}
              >
                {response.is_live_llm ? 'Groq Live' : 'Verified Cache'}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Formulating grounded response...</span>
          </div>
        ) : response ? (
          <div className="space-y-4">
            {/* 1. THE CONCERN */}
            <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 text-[10px] font-mono font-bold">
                  1
                </span>
                <span>THE CONCERN (Executive Empathy)</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium pl-7">
                {response.the_concern || response.step1_acknowledge}
              </p>
            </div>

            {/* 2. WHAT SOLVANT DOES */}
            <div className="bg-emerald-950/20 border border-emerald-800/60 rounded-xl p-4.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-300 text-[10px] font-mono font-bold">
                  2
                </span>
                <span>WHAT SOLVANT DOES (Technical Architecture)</span>
              </div>
              <p className="text-xs text-emerald-200/90 leading-relaxed font-medium pl-7">
                {response.what_solvant_does || response.step2_clarify}
              </p>
            </div>

            {/* 3. WHAT THE CUSTOMER CONTROLS */}
            <div className="bg-indigo-950/20 border border-indigo-800/60 rounded-xl p-4.5">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-300 text-[10px] font-mono font-bold">
                  3
                </span>
                <span>WHAT THE CUSTOMER CONTROLS (VPC & KMS Sovereignty)</span>
              </div>
              <p className="text-xs text-indigo-200/90 leading-relaxed font-medium pl-7">
                {response.what_customer_controls || response.step3_evidence}
              </p>
            </div>

            {/* 4. WHAT THE CUSTOMER CAN VERIFY */}
            <div className="bg-cyan-950/20 border border-cyan-800/60 rounded-xl p-4.5">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1.5">
                <span className="w-5 h-5 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-300 text-[10px] font-mono font-bold">
                  4
                </span>
                <span>WHAT THE CUSTOMER CAN VERIFY (Audited Telemetry & Open Export)</span>
              </div>
              <p className="text-xs text-cyan-200/90 leading-relaxed font-medium pl-7">
                {response.what_customer_can_verify || response.step5_risk_reduction}
              </p>
            </div>

            {/* 5. WHAT SOLVANT DOES NOT CLAIM */}
            <div className="bg-amber-950/20 border border-amber-800/60 rounded-xl p-4.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-900 flex items-center justify-center text-amber-300 text-[10px] font-mono font-bold">
                  5
                </span>
                <span>WHAT SOLVANT DOES NOT CLAIM (Honest Posture & Enforced Limits)</span>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed font-medium pl-7">
                {response.what_solvant_does_not_claim || response.step4_claim_limits}
              </p>
            </div>

            {/* Overclaim Guard Explicit Callouts */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified Claims Grounded:</span>
                <span className="text-slate-200 font-mono text-[11px]">
                  {response.overclaim_guard.verified_claims.join(' • ')}
                </span>
              </div>

              {response.overclaim_guard.unsupported_or_limited_claims.length > 0 && (
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Enforced Boundary:</span>
                  <span className="text-amber-200 font-mono text-[11px]">
                    {response.overclaim_guard.unsupported_or_limited_claims.join(' • ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};