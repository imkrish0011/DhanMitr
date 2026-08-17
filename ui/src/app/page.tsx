'use client';

import React, { useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { VoiceChatProvider } from '@/context/VoiceChatContext';
import { NavTab } from '@/types';

// Layout Components
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

// Finance Components
import { KpiCards } from '@/components/finance/KpiCards';
import { SpendingOverviewChart } from '@/components/finance/SpendingOverviewChart';
import { CashFlowTrendChart } from '@/components/finance/CashFlowTrendChart';
import { UpcomingRenewals } from '@/components/finance/UpcomingRenewals';
import { SubscriptionsTab } from '@/components/finance/SubscriptionsTab';
import { InsurancesTab } from '@/components/finance/InsurancesTab';
import { BudgetIncomeTab } from '@/components/finance/BudgetIncomeTab';
import { AddFinanceModal } from '@/components/finance/Modals/AddFinanceModal';

// AI Companion Components
import { VoiceAssistant } from '@/components/ai-companion/VoiceAssistant';
import { ChatAssistant } from '@/components/ai-companion/ChatAssistant';

// Native Mobile Hub Component
import { MobileFinanceHub } from '@/components/mobile/MobileFinanceHub';

// Standalone Transactions Placeholder
const TransactionsView: React.FC = () => {
  const { transactions } = useFinance();
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Live ledger of your banking, UPI and automated debits</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                  tx.type === 'income' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {tx.type === 'income' ? '↓' : '↑'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{tx.title}</h4>
                  <p className="text-[10px] text-slate-400">{tx.date} • {tx.account_name}</p>
                </div>
              </div>
              <span className={`text-sm font-extrabold ${
                tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
              }`}>
                {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SettingsView: React.FC = () => {
  const { profile } = useFinance();
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Settings</h2>
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4 text-xs">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-bold text-lg flex items-center justify-center">
            {profile.avatar_initial}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{profile.name}</h3>
            <p className="text-slate-500 dark:text-slate-400">{profile.email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Currency</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">INR (₹)</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
            <span className="font-semibold text-slate-700 dark:text-slate-300">AI Financial Companion</span>
            <span className="text-slate-500">Enabled (Bilingual English / Hindi)</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Monitored Services</span>
            <span className="font-bold text-slate-900 dark:text-white">10 OTT & 2 Insurances</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('finance_hub');
  const [aiMode, setAiMode] = useState<'voice' | 'chat'>('voice');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { activeSubTab } = useFinance();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] transition-colors duration-200">
      {/* ========================================================================= */}
      {/* MOBILE NATIVE VIEW (Visible on mobile screen widths < 768px)               */}
      {/* ========================================================================= */}
      <div className="block md:hidden min-h-screen">
        {currentTab === 'ai_companion' && aiMode === 'voice' ? (
          <VoiceAssistant
            onSwitchToChat={() => setAiMode('chat')}
            onNavigateToHub={() => setCurrentTab('finance_hub')}
          />
        ) : currentTab === 'ai_companion' && aiMode === 'chat' ? (
          <div className="h-screen flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B101B] shrink-0">
              <button onClick={() => setCurrentTab('finance_hub')} className="text-xs font-bold text-emerald-600">
                ← Back
              </button>
              <h1 className="text-sm font-bold">AI Chat</h1>
              <div className="w-8" />
            </div>
            <ChatAssistant
              onSwitchToVoice={() => setAiMode('voice')}
              onNavigateToHub={() => setCurrentTab('finance_hub')}
            />
          </div>
        ) : currentTab === 'transactions' ? (
          <div className="pb-24">
            <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B101B]">
              <button onClick={() => setCurrentTab('finance_hub')} className="text-xs font-bold text-emerald-600">
                ← Back
              </button>
              <h1 className="text-sm font-bold">Transactions</h1>
              <div className="w-8" />
            </div>
            <TransactionsView />
          </div>
        ) : currentTab === 'settings' ? (
          <div className="pb-24">
            <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B101B]">
              <button onClick={() => setCurrentTab('finance_hub')} className="text-xs font-bold text-emerald-600">
                ← Back
              </button>
              <h1 className="text-sm font-bold">Settings</h1>
              <div className="w-8" />
            </div>
            <SettingsView />
          </div>
        ) : (
          <MobileFinanceHub
            onOpenVoice={() => {
              setCurrentTab('ai_companion');
              setAiMode('voice');
            }}
            onOpenChat={() => {
              setCurrentTab('ai_companion');
              setAiMode('chat');
            }}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenTransactions={() => setCurrentTab('transactions')}
          />
        )}
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW (Visible on screens >= 768px md: breakpoint)                 */}
      {/* ========================================================================= */}
      <div className="hidden md:flex min-h-screen">
        {/* Desktop Left Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* AI Voice Assistant Desktop Canvas */}
        {currentTab === 'ai_companion' && aiMode === 'voice' && (
          <main className="flex-1 min-h-screen">
            <VoiceAssistant
              onSwitchToChat={() => setAiMode('chat')}
              onNavigateToHub={() => setCurrentTab('finance_hub')}
            />
          </main>
        )}

        {/* AI Chat Assistant Desktop Canvas */}
        {currentTab === 'ai_companion' && aiMode === 'chat' && (
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            <ChatAssistant
              onSwitchToVoice={() => setAiMode('voice')}
              onNavigateToHub={() => setCurrentTab('finance_hub')}
            />
          </main>
        )}

        {/* Transactions Tab Canvas */}
        {currentTab === 'transactions' && (
          <main className="flex-1 overflow-y-auto">
            <TransactionsView />
          </main>
        )}

        {/* Settings Tab Canvas */}
        {currentTab === 'settings' && (
          <main className="flex-1 overflow-y-auto">
            <SettingsView />
          </main>
        )}

        {/* Finance Hub Dashboard Canvas */}
        {currentTab === 'finance_hub' && (
          <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
            <Header onOpenAddModal={() => setIsAddModalOpen(true)} />

            <div className="px-8 sm:px-10 py-8 space-y-8">
              {/* Overview Tab */}
              {activeSubTab === 'overview' && (
                <>
                  {/* Top 4 KPI Metrics */}
                  <KpiCards />

                  {/* Middle 2 Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-6">
                      <SpendingOverviewChart />
                    </div>
                    <div className="lg:col-span-6">
                      <CashFlowTrendChart />
                    </div>
                  </div>

                  {/* Upcoming Renewals & Alerts */}
                  <UpcomingRenewals />
                </>
              )}

              {/* Subscriptions Tab */}
              {activeSubTab === 'subscriptions' && (
                <SubscriptionsTab onOpenAddModal={() => setIsAddModalOpen(true)} />
              )}

              {/* Insurances Tab */}
              {activeSubTab === 'insurances' && (
                <InsurancesTab onOpenAddModal={() => setIsAddModalOpen(true)} />
              )}

              {/* Budget Tab */}
              {activeSubTab === 'budget' && (
                <BudgetIncomeTab onOpenAddModal={() => setIsAddModalOpen(true)} />
              )}
            </div>
          </main>
        )}
      </div>

      {/* Dynamic Modal to Add Financial Info */}
      <AddFinanceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default function Home() {
  return (
    <ThemeProvider>
      <FinanceProvider>
        <VoiceChatProvider>
          <AppContent />
        </VoiceChatProvider>
      </FinanceProvider>
    </ThemeProvider>
  );
}
