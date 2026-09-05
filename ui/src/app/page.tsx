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
import { EmergencyRunwayGauge } from '@/components/finance/EmergencyRunwayGauge';
import { SpendingOverviewChart } from '@/components/finance/SpendingOverviewChart';
import { CashFlowTrendChart } from '@/components/finance/CashFlowTrendChart';
import { UpcomingRenewals } from '@/components/finance/UpcomingRenewals';
import { SubscriptionsTab } from '@/components/finance/SubscriptionsTab';
import { InsurancesTab } from '@/components/finance/InsurancesTab';
import { BudgetIncomeTab } from '@/components/finance/BudgetIncomeTab';
import { GoalsTab } from '@/components/finance/GoalsTab';
import { TaxRegimeComparator } from '@/components/finance/TaxRegimeComparator';
import { ProjectLoanSuite } from '@/components/calculator/ProjectLoanSuite';
import { TransactionsView } from '@/components/finance/TransactionsView';
import { AddFinanceModal } from '@/components/finance/Modals/AddFinanceModal';

// AI Companion Components
import { VoiceAssistant } from '@/components/ai-companion/VoiceAssistant';
import { ChatAssistant } from '@/components/ai-companion/ChatAssistant';

// Landing Page Component
import { LandingPage } from '@/components/landing/LandingPage';

// Native Mobile Hub Component
import { MobileFinanceHub } from '@/components/mobile/MobileFinanceHub';

// Auth Components
import { AuthModal } from '@/components/auth/AuthModal';
import { OnboardingModal } from '@/components/auth/OnboardingModal';
import { LockedFeatureView } from '@/components/auth/LockedFeatureView';

// Settings View Component
import { SettingsView } from '@/components/settings/SettingsView';

const AppContent: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('landing');
  const [aiMode, setAiMode] = useState<'voice' | 'chat'>('voice');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<any>('subscription');

  const { activeSubTab, setActiveSubTab } = useFinance();

  // If user logs in, automatically show Finance Hub; if logged out, show Landing
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentTab('finance_hub');
    } else {
      setCurrentTab('landing');
    }
  }, [isAuthenticated]);

  const handleOpenAddModal = (type?: any) => {
    if (!isAuthenticated) {
      openAuthModal('signup', 'Sign up to add and track your personalized financial records.');
      return;
    }
    if (type && ['subscription', 'insurance', 'income', 'expense', 'investment', 'reminder', 'goal', 'tax'].includes(type)) {
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
    <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-emerald-500/20 selection:text-emerald-500 overflow-x-hidden">
      {/* Ambient Atmospheric Lighting & Grid Pattern */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40 dark:opacity-60 bg-radial-mesh" />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-20 dark:opacity-30 bg-grid-subtle" />
      {/* ========================================================================= */}
      {/* MOBILE NATIVE VIEW (Visible on mobile screen widths < 768px)               */}
      {/* ========================================================================= */}
      <div className={`block md:hidden min-h-screen relative z-10 ${isAuthenticated && currentTab !== 'landing' ? 'pb-20' : ''}`}>
        {currentTab === 'landing' ? (
          <LandingPage
            onOpenAi={(mode) => {
              setCurrentTab('ai_companion');
              setAiMode(mode);
            }}
            onLaunchHub={() => handleNavSelection('finance_hub')}
            onOpenCalculator={() => {
              setCurrentTab('msme_tools');
              setActiveSubTab('msme_tools');
            }}
          />
        ) : currentTab === 'msme_tools' ? (
          <div className="min-h-screen px-3 py-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <button
                onClick={() => setCurrentTab(isAuthenticated ? 'finance_hub' : 'landing')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                ← Back to {isAuthenticated ? 'Hub' : 'Home'}
              </button>
              <div className="flex items-center gap-2">
                <DhanMitrLogo className="w-6 h-5" />
                <span className="text-xs font-bold font-mono text-emerald-500">MSME Tools</span>
              </div>
            </div>
            <ProjectLoanSuite />
          </div>
        ) : currentTab === 'ai_companion' && aiMode === 'voice' ? (
          <div>
            <VoiceAssistant
              onSwitchToChat={() => setAiMode('chat')}
              onNavigateToHub={() => {
                if (isAuthenticated) {
                  handleNavSelection('finance_hub');
                } else {
                  setCurrentTab('landing');
                }
              }}
            />
          </div>
        ) : currentTab === 'ai_companion' && aiMode === 'chat' ? (
          <div className={`${isAuthenticated ? 'h-[calc(100dvh-5.5rem)]' : 'h-[100dvh]'} flex flex-col overflow-hidden`}>
            <ChatAssistant
              onSwitchToVoice={() => setAiMode('voice')}
              onNavigateToHub={() => {
                if (isAuthenticated) {
                  handleNavSelection('finance_hub');
                } else {
                  setCurrentTab('landing');
                }
              }}
            />
          </div>
        ) : currentTab === 'transactions' && isAuthenticated ? (
          <TransactionsView
            onOpenAddModal={handleOpenAddModal}
            onBack={() => setCurrentTab('finance_hub')}
            isMobile={true}
          />
        ) : currentTab === 'settings' && isAuthenticated ? (
          <SettingsView isMobile={true} />
        ) : isAuthenticated ? (
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
          <LandingPage
            onOpenAi={(mode) => {
              setCurrentTab('ai_companion');
              setAiMode(mode);
            }}
            onLaunchHub={() => handleNavSelection('finance_hub')}
            onOpenCalculator={() => {
              setCurrentTab('msme_tools');
              setActiveSubTab('msme_tools');
            }}
          />
        )}

        {/* Floating 5-Tab Navigation Dock on Mobile after Login */}
        {isAuthenticated && currentTab !== 'landing' && (
          <div className="fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto rounded-2xl bg-white/85 dark:bg-[#0E1526]/85 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 px-3 py-1.5 shadow-xl shadow-slate-900/5 dark:shadow-black/50">
            <div className="grid grid-cols-5 items-center w-full max-w-md mx-auto">
              {/* Home Tab */}
              <button
                onClick={() => {
                  setCurrentTab('finance_hub');
                  setActiveSubTab('overview');
                }}
                className={`relative py-1 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none ${
                  isHomeActive
                    ? 'text-emerald-500 dark:text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium'
                }`}
              >
                {isHomeActive && (
                  <motion.div
                    layoutId="mobileNavMinimalIndicator"
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
                <span className="text-[10px] tracking-tight truncate w-full text-center leading-none">Home</span>
              </button>

              {/* Insights Tab */}
              <button
                onClick={() => {
                  setCurrentTab('finance_hub');
                  setActiveSubTab('budget');
                }}
                className={`relative py-1 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none ${
                  isInsightsActive
                    ? 'text-emerald-500 dark:text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium'
                }`}
              >
                {isInsightsActive && (
                  <motion.div
                    layoutId="mobileNavMinimalIndicator"
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M18 20V10M12 20V4M6 20v-6" />
                </svg>
                <span className="text-[10px] tracking-tight truncate w-full text-center leading-none">Insights</span>
              </button>

              {/* Center Elevated AI Companion FAB */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => {
                    setCurrentTab('ai_companion');
                    setAiMode('voice');
                  }}
                  className={`relative -top-3 w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isAiActive
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105 ring-2 ring-emerald-300 dark:ring-emerald-400'
                      : 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 active:scale-95'
                  }`}
                  title="Open AI Companion"
                >
                  <SparkleSmallIcon className="w-5 h-5 fill-current" />
                </button>
              </div>

              {/* Transactions / Ledger Tab */}
              <button
                onClick={() => setCurrentTab('transactions')}
                className={`relative py-1 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none ${
                  isTransactionsActive
                    ? 'text-emerald-500 dark:text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium'
                }`}
              >
                {isTransactionsActive && (
                  <motion.div
                    layoutId="mobileNavMinimalIndicator"
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                </svg>
                <span className="text-[10px] tracking-tight truncate w-full text-center leading-none">Ledger</span>
              </button>

              {/* Profile / Settings Tab */}
              <button
                onClick={() => setCurrentTab('settings')}
                className={`relative py-1 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none ${
                  isSettingsActive
                    ? 'text-emerald-500 dark:text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium'
                }`}
              >
                {isSettingsActive && (
                  <motion.div
                    layoutId="mobileNavMinimalIndicator"
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="text-[10px] tracking-tight truncate w-full text-center leading-none">Profile</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW (Visible on screens >= 768px md: breakpoint)                 */}
      {/* ========================================================================= */}
      <div className={`hidden md:flex ${currentTab === 'landing' ? 'min-h-screen' : 'h-screen overflow-hidden'} relative z-10`}>
        {/* Desktop Left Sidebar: Only rendered after login and not on landing */}
        {isAuthenticated && currentTab !== 'landing' && (
          <Sidebar currentTab={currentTab} onSelectTab={handleNavSelection} />
        )}

        {/* Landing Page Desktop Canvas */}
        {currentTab === 'landing' && (
          <main className="flex-1 w-full min-h-screen overflow-y-auto">
            <LandingPage
              onOpenAi={(mode) => {
                setCurrentTab('ai_companion');
                setAiMode(mode);
              }}
              onLaunchHub={() => handleNavSelection('finance_hub')}
              onOpenCalculator={() => {
                setCurrentTab('msme_tools');
                setActiveSubTab('msme_tools');
              }}
            />
          </main>
        )}

        {/* MSME & Project Loans Suite Desktop Canvas */}
        {currentTab === 'msme_tools' && (
          <main className="flex-1 h-screen overflow-y-auto p-6 sm:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setCurrentTab(isAuthenticated ? 'finance_hub' : 'landing')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  ← Back to {isAuthenticated ? 'Finance Hub' : 'Home'}
                </button>
                <div className="flex items-center gap-2.5">
                  <DhanMitrLogo className="w-8 h-6 shrink-0" />
                  <span className="font-display font-black text-sm tracking-tight text-slate-900 dark:text-white">
                    धन<span className="text-emerald-500">Mitr</span>
                    <span className="text-slate-400 font-mono text-xs font-normal ml-2">MSME & Project Loans Suite</span>
                  </span>
                </div>
              </div>
              <ProjectLoanSuite />
            </div>
          </main>
        )}

        {/* AI Voice Assistant Desktop Canvas */}
        {currentTab === 'ai_companion' && aiMode === 'voice' && (
          <main className="flex-1 h-screen overflow-y-auto">
            <VoiceAssistant
              onSwitchToChat={() => setAiMode('chat')}
              onNavigateToHub={() => {
                if (isAuthenticated) {
                  handleNavSelection('finance_hub');
                } else {
                  setCurrentTab('landing');
                }
              }}
            />
          </main>
        )}

        {/* AI Chat Assistant Desktop Canvas */}
        {currentTab === 'ai_companion' && aiMode === 'chat' && (
          <main className="flex-1 h-screen p-4 lg:p-6 overflow-y-auto">
            <ChatAssistant
              onSwitchToVoice={() => setAiMode('voice')}
              onNavigateToHub={() => {
                if (isAuthenticated) {
                  handleNavSelection('finance_hub');
                } else {
                  setCurrentTab('landing');
                }
              }}
            />
          </main>
        )}

        {/* Transactions Tab Canvas */}
        {isAuthenticated && currentTab === 'transactions' && (
          <main className="flex-1 h-screen overflow-y-auto">
            <TransactionsView onOpenAddModal={handleOpenAddModal} />
          </main>
        )}

        {/* Settings Tab Canvas */}
        {isAuthenticated && currentTab === 'settings' && (
          <main className="flex-1 h-screen overflow-y-auto p-4 sm:p-8">
            <SettingsView />
          </main>
        )}

        {isAuthenticated && currentTab === 'finance_hub' && (
          <main className="flex-1 flex flex-col h-screen overflow-y-auto">
            <Header
              onOpenAddModal={handleOpenAddModal}
              onNavigateToTab={handleNavSelection}
            />

            <div className="px-8 sm:px-10 py-8 space-y-8">
              {/* Overview Tab */}
              {activeSubTab === 'overview' && (
                <>
                  {/* Top 4 KPI Metrics */}
                  <KpiCards />

                  {/* Emergency Fund Runway Gauge Meter */}
                  <EmergencyRunwayGauge />

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

              {/* Goals Tab */}
              {activeSubTab === 'goals' && (
                <GoalsTab />
              )}

              {/* Tax Calculator Tab */}
              {activeSubTab === 'tax_calculator' && (
                <TaxRegimeComparator />
              )}

              {/* MSME & Project Loans Suite */}
              {activeSubTab === 'msme_tools' && (
                <ProjectLoanSuite />
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
