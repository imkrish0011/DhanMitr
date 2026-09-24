'use client';

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { VoiceChatProvider } from '@/context/VoiceChatContext';
import { NavTab } from '@/types';
import { SparkleSmallIcon, DhanMitrLogo } from '@/components/icons/CustomIcons';
import { Home as HomeIcon, Briefcase, Receipt, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Layout Components
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

// Finance Components
import { ExecutiveOverview } from '@/components/finance/ExecutiveOverview';
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
  const isMsmeActive = (currentTab === 'finance_hub' && activeSubTab === 'msme_tools') || currentTab === 'msme_tools';
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
      <div className={`block md:hidden min-h-screen relative z-10 ${isAuthenticated && currentTab !== 'landing' && !(currentTab === 'ai_companion' && aiMode === 'chat') ? 'pb-20' : ''}`}>
        {currentTab === 'landing' ? (
          <LandingPage
            onOpenAi={(mode) => {
              setCurrentTab('ai_companion');
              setAiMode(mode);
            }}
            onLaunchHub={() => handleNavSelection('finance_hub')}
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
          <div className={`w-full max-w-full flex-1 flex flex-col min-w-0 ${isAuthenticated ? 'h-[calc(100dvh-4.75rem)] pb-1' : 'h-[100dvh]'} overflow-hidden`}>
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
            onOpenAddModal={(type) => handleOpenAddModal(type || 'subscription')}
            onOpenTransactions={() => setCurrentTab('transactions')}
          />
        ) : (
          <LandingPage
            onOpenAi={(mode) => {
              setCurrentTab('ai_companion');
              setAiMode(mode);
            }}
            onLaunchHub={() => handleNavSelection('finance_hub')}
          />
        )}

        {/* Floating 5-Tab Luxury Navigation Dock on Mobile after Login */}
        {isAuthenticated && currentTab !== 'landing' && (
          <div className="fixed bottom-3.5 inset-x-3.5 z-40 max-w-md mx-auto">
            {/* Ambient diffuse emerald halo */}
            <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/20 blur-xl opacity-75 pointer-events-none" />

            <div className="relative flex items-center justify-between rounded-full bg-white/90 dark:bg-[#070B16]/92 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 px-3 py-1.5 shadow-[0_12px_40px_-6px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_50px_-8px_rgba(0,0,0,0.85)]">
              {/* Home Tab */}
              <button
                onClick={() => {
                  setCurrentTab('finance_hub');
                  setActiveSubTab('overview');
                }}
                className={`relative flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer select-none ${
                  isHomeActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
                }`}
              >
                {isHomeActive && (
                  <motion.div
                    layoutId="mobileActiveDockCapsule"
                    className="absolute inset-x-1.5 inset-y-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <HomeIcon className="w-4.5 h-4.5" />
                <span className="text-[10px] tracking-tight">Home</span>
              </button>

              {/* MSME & Loans Tab */}
              <button
                onClick={() => {
                  setCurrentTab('finance_hub');
                  setActiveSubTab('msme_tools');
                }}
                className={`relative flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer select-none ${
                  isMsmeActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
                }`}
              >
                {isMsmeActive && (
                  <motion.div
                    layoutId="mobileActiveDockCapsule"
                    className="absolute inset-x-1.5 inset-y-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <Briefcase className="w-4.5 h-4.5" />
                <span className="text-[10px] tracking-tight">MSME</span>
              </button>

              {/* Center Elevated AI Companion Pulsing Sphere */}
              <div className="flex items-center justify-center px-1">
                <button
                  onClick={() => {
                    setCurrentTab('ai_companion');
                    setAiMode('voice');
                  }}
                  className={`relative -top-4 w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 group ${
                    isAiActive
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 ring-4 ring-emerald-400/40 shadow-emerald-500/50 scale-105'
                      : 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/35 hover:scale-105'
                  }`}
                  title="Talk to धनMitr AI"
                >
                  {!isAiActive && (
                    <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-ping pointer-events-none" />
                  )}
                  <Sparkles className="w-5 h-5 relative z-10 fill-slate-950" />
                </button>
              </div>

              {/* Transactions / Ledger Tab */}
              <button
                onClick={() => setCurrentTab('transactions')}
                className={`relative flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer select-none ${
                  isTransactionsActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
                }`}
              >
                {isTransactionsActive && (
                  <motion.div
                    layoutId="mobileActiveDockCapsule"
                    className="absolute inset-x-1.5 inset-y-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <Receipt className="w-4.5 h-4.5" />
                <span className="text-[10px] tracking-tight">Ledger</span>
              </button>

              {/* Profile / Settings Tab */}
              <button
                onClick={() => setCurrentTab('settings')}
                className={`relative flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer select-none ${
                  isSettingsActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
                }`}
              >
                {isSettingsActive && (
                  <motion.div
                    layoutId="mobileActiveDockCapsule"
                    className="absolute inset-x-1.5 inset-y-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <User className="w-4.5 h-4.5" />
                <span className="text-[10px] tracking-tight">Profile</span>
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
            />
          </main>
        )}

        {/* MSME & Project Loans Suite Desktop Canvas */}
        {currentTab === 'msme_tools' && (
          <main className="flex-1 min-w-0 h-screen overflow-y-auto p-6 sm:p-8">
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
                    <span className="text-slate-400 font-mono text-xs font-normal ml-2">Financial Calculators & MSME Loans Suite</span>
                  </span>
                </div>
              </div>
              <ProjectLoanSuite />
            </div>
          </main>
        )}

        {/* AI Voice Assistant Desktop Canvas */}
        {currentTab === 'ai_companion' && aiMode === 'voice' && (
          <main className="flex-1 min-w-0 h-screen overflow-y-auto">
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
          <main className="flex-1 min-w-0 h-screen p-4 lg:p-6 overflow-y-auto">
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
          <main className="flex-1 min-w-0 h-screen overflow-y-auto">
            <TransactionsView onOpenAddModal={handleOpenAddModal} />
          </main>
        )}

        {/* Settings Tab Canvas */}
        {isAuthenticated && currentTab === 'settings' && (
          <main className="flex-1 min-w-0 h-screen overflow-y-auto p-4 sm:p-8">
            <SettingsView />
          </main>
        )}

        {isAuthenticated && currentTab === 'finance_hub' && (
          <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
            <Header
              onOpenAddModal={handleOpenAddModal}
              onNavigateToTab={handleNavSelection}
            />

            <div className="px-8 sm:px-10 py-8 space-y-8">
              {/* Overview Tab */}
              {activeSubTab === 'overview' && (
                <ExecutiveOverview
                  onOpenAddModal={handleOpenAddModal}
                  onNavigateToTab={handleNavSelection}
                />
              )}

              {/* Goals Tab */}
              {activeSubTab === 'goals' && (
                <GoalsTab />
              )}

              {/* Tax Calculator Tab */}
              {activeSubTab === 'tax_calculator' && (
                <TaxRegimeComparator />
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
      <OnboardingModal onComplete={() => setCurrentTab('finance_hub')} />
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
