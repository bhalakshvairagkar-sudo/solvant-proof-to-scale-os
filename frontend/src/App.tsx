import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PortfolioView } from './components/PortfolioView';
import { AccountDeepDive } from './components/AccountDeepDive';
import { PricingSimulator } from './components/PricingSimulator';
import { TrustCopilot } from './components/TrustCopilot';
import { WedgeMatrix } from './components/WedgeMatrix';
import { PitchDeckWalkthrough } from './components/PitchDeckWalkthrough';
import { AccountItemResponse, PortfolioSummary } from './types';
import { fetchAccounts, fetchPortfolioSummary, fetchHealth, resetAccounts } from './api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('portfolio');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('acct_acme_corp');
  const [accounts, setAccounts] = useState<AccountItemResponse[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [hasGroqKey, setHasGroqKey] = useState<boolean>(false);
  const [groqModel, setGroqModel] = useState<string>('llama-3.3-70b-versatile');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [accts, sum, h] = await Promise.all([
        fetchAccounts(),
        fetchPortfolioSummary(),
        fetchHealth(),
      ]);
      setAccounts(accts);
      setSummary(sum);
      setHasGroqKey(h.has_groq_api_key);
      setGroqModel(h.groq_model);
    } catch (err) {
      console.error('Failed to load initial data from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    try {
      await resetAccounts();
      await loadInitialData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectAccountFromPortfolio = (id: string) => {
    setSelectedAccountId(id);
    setActiveTab('account_deepdive');
  };

  const handleJumpToTab = (tab: string, accountId?: string) => {
    if (accountId) {
      setSelectedAccountId(accountId);
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#080d16] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        summary={summary}
        hasGroqKey={hasGroqKey}
        groqModel={groqModel}
        onRefresh={loadInitialData}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Connecting to Solvant Deterministic GTM Core...</span>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'portfolio' && (
              <PortfolioView
                accounts={accounts}
                summary={summary}
                onSelectAccount={handleSelectAccountFromPortfolio}
              />
            )}

            {activeTab === 'account_deepdive' && (
              <AccountDeepDive
                accounts={accounts}
                selectedAccountId={selectedAccountId}
                onSelectAccountId={setSelectedAccountId}
                onNavigateToPricing={() => setActiveTab('pricing')}
              />
            )}

            {activeTab === 'pricing' && <PricingSimulator />}

            {activeTab === 'trust' && <TrustCopilot />}

            {activeTab === 'wedge' && (
              <WedgeMatrix
                onAskObjection={(q) => {
                  setActiveTab('trust');
                }}
              />
            )}

            {activeTab === 'walkthrough' && (
              <PitchDeckWalkthrough onJumpToTab={handleJumpToTab} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#06090e] py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Solvant Labs • Enterprise AI Adoption Infrastructure & Deterministic GTM Engine
          </span>
          <span className="font-mono text-slate-400">
            Groq Explain-Only Layer • Zero Hallucination Mode Active
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
