import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Cpu,
  RefreshCw,
  Sliders,
  Award,
  Layers,
  Sparkles,
  HelpCircle,
  Key,
} from 'lucide-react';
import { PortfolioSummary } from '../types';
import { setGroqConfig } from '../api';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  summary: PortfolioSummary | null;
  hasGroqKey: boolean;
  groqModel: string;
  onRefresh: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  summary,
  hasGroqKey,
  groqModel,
  onRefresh,
  onResetData,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [modelInput, setModelInput] = useState(groqModel || 'llama-3.3-70b-versatile');
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKeyInput.trim()) {
      await setGroqConfig(apiKeyInput.trim(), modelInput.trim());
      setSavedMsg(true);
      setTimeout(() => {
        setSavedMsg(false);
        setShowConfigModal(false);
        onRefresh();
      }, 1200);
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-[#0b1120]/90 backdrop-blur sticky top-0 z-40">
      {/* Top golden rule ticker banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border-b border-emerald-900/30 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            GOLDEN ARCHITECTURAL RULE:
          </span>
          <span className="text-slate-200">
            "Code calculates. Groq explains, diagnoses, and communicates."
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="hidden md:inline">Pilot Wedge: FP&A Variance Analysis</span>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Key className="w-3 h-3 text-amber-400" />
            <span>LLM Engine:</span>
            {hasGroqKey ? (
              <span className="text-emerald-400 font-medium">Groq Live ({groqModel})</span>
            ) : (
              <span className="text-indigo-300 font-medium">Verified Baseline (Cache)</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-xl tracking-wider">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  SOLVANT PROOF-TO-SCALE OS
                </h1>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono font-medium">
                  ENTERPRISE v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Land-and-Expand AI Adoption Infrastructure with Deterministic GTM Gates
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          {summary && (
            <div className="hidden lg:flex items-center gap-5 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Accounts</span>
                <span className="font-bold text-white text-sm">{summary.total_accounts}</span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Expansion Ready</span>
                <span className="font-bold text-emerald-400 text-sm">{summary.expansion_ready_count}</span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Watch</span>
                <span className="font-bold text-amber-400 text-sm">{summary.healthy_watch_count}</span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">At Risk</span>
                <span className="font-bold text-rose-400 text-sm">{summary.at_risk_count}</span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Pipeline ARR</span>
                <span className="font-bold text-emerald-300 text-sm font-mono">
                  ${(summary.pipeline_arr / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onResetData}
              title="Reset synthetic accounts to original baseline"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
            <button
              onClick={() => setActiveTab('walkthrough')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Judge Script (8 Slides)</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav role="tablist" aria-label="Main Application Views" className="flex items-center gap-1 mt-3.5 border-t border-slate-800/80 pt-2 overflow-x-auto text-xs font-medium">
          <button
            role="tab"
            aria-selected={activeTab === 'portfolio'}
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              activeTab === 'portfolio'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Portfolio Overview</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'account_deepdive'}
            onClick={() => setActiveTab('account_deepdive')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              activeTab === 'account_deepdive'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>2. Account Deep-Dive & Live WAU Slider</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'pricing'}
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              activeTab === 'pricing'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>3. Pricing Simulator & NorthBridge Shadow</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'trust'}
            onClick={() => setActiveTab('trust')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              activeTab === 'trust'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>4. Trust Copilot (Overclaim Guard)</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'wedge'}
            onClick={() => setActiveTab('wedge')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              activeTab === 'wedge'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Wedge Matrix & Moat (P1)</span>
          </button>
        </nav>
      </div>

      {/* LLM Engine Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              Configure Groq LLM Diagnostics
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your Groq API Key to test live LLaMA 3.3 70B structured calls. If omitted, the system operates flawlessly in zero-latency deterministic baseline cache mode.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Groq API Key
                </label>
                <input
                  type="password"
                  placeholder="gsk_..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Model Name (Must support strict JSON schema)
                </label>
                <input
                  type="text"
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {savedMsg && (
                <div className="p-2 bg-emerald-950/80 border border-emerald-700/60 rounded text-xs text-emerald-300 text-center font-medium">
                  Configuration saved! Active model updated.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
