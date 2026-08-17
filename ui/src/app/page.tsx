'use client';

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { VoiceChatProvider } from '@/context/VoiceChatContext';
import { NavTab } from '@/types';
import { SparkleSmallIcon, DhanMitrLogo } from '@/components/icons/CustomIcons';
import { motion } from 'framer-motion';

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

// Auth Components
import { AuthModal } from '@/components/auth/AuthModal';
import { OnboardingModal } from '@/components/auth/OnboardingModal';
import { LockedFeatureView } from '@/components/auth/LockedFeatureView';

// Transactions View
const TransactionsView: React.FC<{ onOpenAddModal: (type?: any) => void }> = ({ onOpenAddModal }) => {
  const { transactions } = useFinance();

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Live ledger of your banking, UPI and automated debits</p>
        </div>
        <button
          onClick={() => onOpenAddModal('expense')}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <span>+ Add Transaction</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        {transactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 text-xl font-bold">
              ₹
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Transactions Logged Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Add your recent expenses, salary credit, or investment deposits to maintain a real-time financial ledger.
            </p>
            <button
              onClick={() => onOpenAddModal('expense')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer inline-block"
            >
              Add First Transaction
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

// Settings View
const SettingsView: React.FC = () => {
  const { profile } = useFinance();
  const { user, signOut, openOnboarding } = useAuth();

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Settings</h2>
        <button
          onClick={openOnboarding}
          className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          Edit Profile
        </button>
      </div>

      <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4 text-xs">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-bold text-lg flex items-center justify-center">
            {profile.avatar_initial || 'U'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{profile.name || 'User'}</h3>
            <p className="text-slate-500 dark:text-slate-400">{profile.email || user?.email || 'No email attached'}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Currency</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">INR (₹)</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Risk Profile</span>
            <span className="font-medium text-slate-900 dark:text-white capitalize">{profile.risk_tolerance || 'Moderate'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Tax Regime</span>
            <span className="font-medium text-slate-900 dark:text-white capitalize">{profile.tax_regime || 'New Regime'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
            <span className="font-semibold text-slate-700 dark:text-slate-300">AI Financial Companion</span>
            <span className="text-slate-500">Enabled (Bilingual English / Hindi)</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Cloud Synchronization</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Supabase Connected</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={signOut}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('ai_companion');
  const [aiMode, setAiMode] = useState<'voice' | 'chat'>('voice');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<any>('subscription');

  const { activeSubTab, setActiveSubTab } = useFinance();

  // If user logs in, automatically show Finance Hub
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentTab('finance_hub');
    } else {
      setCurrentTab('ai_companion');
    }
  }, [isAuthenticated]);

  const handleOpenAddModal = (type?: any) => {
    if (!isAuthenticated) {
      openAuthModal('signup', 'Sign up to add and track your personalized financial records.');
      return;
    }
    if (type && ['subscription', 'insurance', 'income', 'expense'].includes(type)) {
      setAddModalType(type);
    }
    setIsAddModalOpen(true);
  };

  const handleNavSelection = (tab: NavTab) => {
    if (!isAuthenticated && (tab === 'finance_hub' || tab === 'transactions' || tab === 'settings')) {
      openAuthModal('signup', `Create a free account or sign in to access ${tab === 'finance_hub' ? 'Finance Hub' : tab === 'transactions' ? 'Transactions' : 'Settings'}.`);
      return;
    }
    setCurrentTab(tab);
  };

  const isHomeActive = currentTab === 'finance_hub' && activeSubTab === 'overview';
  const isInsightsActive = currentTab === 'finance_hub' && activeSubTab === 'budget';
  const isAiActive = currentTab === 'ai_companion';
  const isTransactionsActive = currentTab === 'transactions';
  const isSettingsActive = currentTab === 'settings';

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] transition-colors duration-200">
      {/* ========================================================================= */}
      {/* MOBILE NATIVE VIEW (Visible on mobile screen widths < 768px)               */}
      {/* ========================================================================= */}
      <div className="block md:hidden min-h-screen relative pb-16">
        {currentTab === 'ai_companion' && aiMode === 'voice' ? (
          <div>
            <VoiceAssistant
              onSwitchToChat={() => setAiMode('chat')}
              onNavigateToHub={() => handleNavSelection('finance_hub')}
            />
          </div>
        ) : currentTab === 'ai_companion' && aiMode === 'chat' ? (
          <div className="h-[calc(100dvh-4.5rem)] flex flex-col overflow-hidden">
            <ChatAssistant
              onSwitchToVoice={() => setAiMode('voice')}
              onNavigateToHub={() => handleNavSelection('finance_hub')}
            />
          </div>
        ) : currentTab === 'transactions' ? (
          isAuthenticated ? (
            <div>
              <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B101B]">
                <button onClick={() => setCurrentTab('finance_hub')} className="text-xs font-bold text-emerald-600">
                  ← Back
                </button>
                <h1 className="text-sm font-bold">Transactions</h1>
                <div className="w-8" />
              </div>
              <TransactionsView onOpenAddModal={handleOpenAddModal} />
            </div>
          ) : (
            <LockedFeatureView featureName="Recent Transactions Ledger" />
          )
        ) : currentTab === 'settings' ? (
          isAuthenticated ? (
            <div>
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
            <LockedFeatureView featureName="Account Settings" />
          )
        ) : (
          isAuthenticated ? (
            <MobileFinanceHub
              onOpenVoice={() => {
                setCurrentTab('ai_companion');
                setAiMode('voice');
              }}
              onOpenChat={() => {
                setCurrentTab('ai_companion');
                setAiMode('chat');
              }}
              onOpenAddModal={() => handleOpenAddModal('subscription')}
              onOpenTransactions={() => setCurrentTab('transactions')}
            />
          ) : (
            <LockedFeatureView featureName="Personal Finance Hub" />
          )
        )}

        {/* ALWAYS-PERSISTENT Bottom 5-Tab Navigation Bar on Mobile with Transitional Light Indicator */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-2 flex items-center justify-between shadow-lg">
          {/* Home Tab */}
          <button
            onClick={() => {
              handleNavSelection('finance_hub');
              if (isAuthenticated) setActiveSubTab('overview');
            }}
            className={`relative px-3 py-1.5 rounded-xl flex flex-col items-center gap-1 transition-colors cursor-pointer select-none ${
              isHomeActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {isHomeActive && (
              <motion.div
                layoutId="mobileNavActiveLight"
                className="absolute inset-0 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/15 border border-emerald-500/25 -z-10 shadow-[0_0_14px_rgba(16,185,129,0.25)]"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              >
                <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
              </motion.div>
            )}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-[10px]">Home {!isAuthenticated && '🔒'}</span>
          </button>

          {/* Insights Tab */}
          <button
            onClick={() => {
              handleNavSelection('finance_hub');
              if (isAuthenticated) setActiveSubTab('budget');
            }}
            className={`relative px-3 py-1.5 rounded-xl flex flex-col items-center gap-1 transition-colors cursor-pointer select-none ${
              isInsightsActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {isInsightsActive && (
              <motion.div
                layoutId="mobileNavActiveLight"
                className="absolute inset-0 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/15 border border-emerald-500/25 -z-10 shadow-[0_0_14px_rgba(16,185,129,0.25)]"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              >
                <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
              </motion.div>
            )}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
            <span className="text-[10px]">Insights</span>
          </button>

          {/* Center Elevated Glowing AI Companion FAB */}
          <button
            onClick={() => {
              setCurrentTab('ai_companion');
              setAiMode('voice');
            }}
            className={`relative -top-5 w-13 h-13 rounded-full flex items-center justify-center transition-all ${
              isAiActive
                ? 'bg-emerald-500 text-white border-2 border-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.85)] scale-105'
                : 'bg-[#064E3B] text-emerald-300 border-2 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.45)] active:scale-90'
            }`}
            title="Open AI Companion"
          >
            <SparkleSmallIcon className="w-7 h-7 fill-current" />
          </button>

          {/* Transactions Tab */}
          <button
            onClick={() => handleNavSelection('transactions')}
            className={`relative px-3 py-1.5 rounded-xl flex flex-col items-center gap-1 transition-colors cursor-pointer select-none ${
              isTransactionsActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {isTransactionsActive && (
              <motion.div
                layoutId="mobileNavActiveLight"
                className="absolute inset-0 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/15 border border-emerald-500/25 -z-10 shadow-[0_0_14px_rgba(16,185,129,0.25)]"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              >
                <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
              </motion.div>
            )}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
            </svg>
            <span className="text-[10px]">Ledger {!isAuthenticated && '🔒'}</span>
          </button>

          {/* Profile / Settings Tab */}
          <button
            onClick={() => handleNavSelection('settings')}
            className={`relative px-3 py-1.5 rounded-xl flex flex-col items-center gap-1 transition-colors cursor-pointer select-none ${
              isSettingsActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {isSettingsActive && (
              <motion.div
                layoutId="mobileNavActiveLight"
                className="absolute inset-0 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/15 border border-emerald-500/25 -z-10 shadow-[0_0_14px_rgba(16,185,129,0.25)]"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              >
                <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
              </motion.div>
            )}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-[10px]">Profile</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW (Visible on screens >= 768px md: breakpoint)                 */}
      {/* ========================================================================= */}
      <div className="hidden md:flex h-screen overflow-hidden">
        {/* Desktop Left Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={handleNavSelection} />

        {/* AI Voice Assistant Desktop Canvas */}
        {currentTab === 'ai_companion' && aiMode === 'voice' && (
          <main className="flex-1 h-screen overflow-y-auto">
            <VoiceAssistant
              onSwitchToChat={() => setAiMode('chat')}
              onNavigateToHub={() => handleNavSelection('finance_hub')}
            />
          </main>
        )}

        {/* AI Chat Assistant Desktop Canvas */}
        {currentTab === 'ai_companion' && aiMode === 'chat' && (
          <main className="flex-1 h-screen p-4 lg:p-6 overflow-y-auto">
            <ChatAssistant
              onSwitchToVoice={() => setAiMode('voice')}
              onNavigateToHub={() => handleNavSelection('finance_hub')}
            />
          </main>
        )}

        {/* Transactions Tab Canvas */}
        {currentTab === 'transactions' && (
          <main className="flex-1 h-screen overflow-y-auto">
            {isAuthenticated ? (
              <TransactionsView onOpenAddModal={handleOpenAddModal} />
            ) : (
              <LockedFeatureView featureName="Recent Transactions Ledger" />
            )}
          </main>
        )}

        {/* Settings Tab Canvas */}
        {currentTab === 'settings' && (
          <main className="flex-1 h-screen overflow-y-auto">
            {isAuthenticated ? (
              <SettingsView />
            ) : (
              <LockedFeatureView featureName="Account Settings" />
            )}
          </main>
        )}

        {/* Finance Hub Dashboard Canvas */}
        {currentTab === 'finance_hub' && (
          <main className="flex-1 flex flex-col h-screen overflow-y-auto">
            {isAuthenticated ? (
              <>
                <Header onOpenAddModal={handleOpenAddModal} />

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
                    <SubscriptionsTab onOpenAddModal={() => handleOpenAddModal('subscription')} />
                  )}

                  {/* Insurances Tab */}
                  {activeSubTab === 'insurances' && (
                    <InsurancesTab onOpenAddModal={() => handleOpenAddModal('insurance')} />
                  )}

                  {/* Budget Tab */}
                  {activeSubTab === 'budget' && (
                    <BudgetIncomeTab onOpenAddModal={() => handleOpenAddModal('income')} />
                  )}
                </div>
              </>
            ) : (
              <LockedFeatureView featureName="Personal Finance Hub" />
            )}
          </main>
        )}
      </div>

      {/* Dynamic Modal to Add Financial Info */}
      <AddFinanceModal
        isOpen={isAddModalOpen}
        initialType={addModalType}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Supabase Authentication Modal (Google OAuth & Email/Password) */}
      <AuthModal />

      {/* User Onboarding Modal (Mandatory Name, Optional Financial Details) */}
      <OnboardingModal />
    </div>
  );
};

export default function Home() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <VoiceChatProvider>
            <AppContent />
          </VoiceChatProvider>
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
