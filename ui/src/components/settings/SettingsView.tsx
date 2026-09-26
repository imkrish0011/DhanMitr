'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { EditProfileModal } from '@/components/settings/EditProfileModal';
import { EditRiskToleranceModal } from '@/components/settings/EditRiskToleranceModal';
import { DhanMitrCardModal } from '@/components/settings/DhanMitrCardModal';
import { DhanMitrLogo } from '@/components/icons/CustomIcons';
import { resolveUserTags, getPrimaryBadge, getAllUserBadges, TagDetails } from '@/lib/userTags';
import { useTheme } from '@/context/ThemeContext';
import {
  User,
  Mail,
  Shield,
  ShieldCheck,
  Database,
  Download,
  LogOut,
  Sliders,
  CheckCircle2,
  TrendingUp,
  Wallet,
  CreditCard,
  FileText,
  Lock,
  Briefcase,
  Scale,
  Rocket,
  Building,
  Laptop,
  GraduationCap,
  Palmtree,
  Settings,
  Sun,
  Moon,
  Award,
  Sparkles,
  Share2,
  Flame,
  PieChart,
  Quote,
  Smartphone,
} from 'lucide-react';

interface SettingsViewProps {
  onBack?: () => void;
  isMobile?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ isMobile = false }) => {
  const {
    profile,
    subscriptions,
    insurances,
    incomeSources,
    transactions,
    totalIncome,
    totalOutflow,
    netSurplus,
    savingsRate,
  } = useFinance();

  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  // Resolve user recognition tags and badges
  const userTagsResult = React.useMemo(() => {
    return resolveUserTags({
      userId: profile.user_id,
      email: profile.email || user?.email,
      savingsRate,
      monthly_income: profile.monthly_income,
      total_investments: profile.total_investments,
      existingTags: profile.tags,
      customTag: profile.custom_tag,
    });
  }, [profile, user, savingsRate]);

  const allUserBadges = React.useMemo(() => {
    return userTagsResult.allBadges || getAllUserBadges(userTagsResult.tags, userTagsResult.customTag);
  }, [userTagsResult]);

  const activeBadge = allUserBadges[0] || userTagsResult.activeBadge;
  const memberNumber = userTagsResult.memberNumber || '1';

  const [activeTab, setActiveTab] = useState<'profile' | 'card' | 'sync' | 'preferences'>('profile');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [renewalAlerts, setRenewalAlerts] = useState(true);
  const [highSpendAlerts, setHighSpendAlerts] = useState(true);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const handleExportJSON = () => {
    const backupData = {
      userProfile: profile,
      subscriptions,
      insurances,
      incomeSources,
      transactions,
      exportedAt: new Date().toISOString(),
      appVersion: '2.0.0-PRO',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `धनMitr_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportSuccess('JSON data backup downloaded successfully!');
    setTimeout(() => setExportSuccess(null), 3000);
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      setExportSuccess('No transactions to export.');
      setTimeout(() => setExportSuccess(null), 2500);
      return;
    }

    const headers = 'ID,Title,Amount,Type,Category,Date,Account\n';
    const rows = transactions
      .map(
        (t) =>
          `"${t.id}","${t.title.replace(/"/g, '""')}",${t.amount},"${t.type}","${t.category}","${t.date}","${
            t.account_name || ''
          }"`
      )
      .join('\n');

    const csvData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvData);
    downloadAnchor.setAttribute('download', `धनMitr_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportSuccess('Transactions CSV exported successfully!');
    setTimeout(() => setExportSuccess(null), 3000);
  };

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'conservative':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'aggressive':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
  };

  const getEmploymentIcon = (emp?: string) => {
    switch (emp) {
      case 'salaried':
        return <Briefcase className="w-3.5 h-3.5 text-blue-500" />;
      case 'self_employed':
        return <Building className="w-3.5 h-3.5 text-emerald-500" />;
      case 'freelancer':
        return <Laptop className="w-3.5 h-3.5 text-purple-500" />;
      case 'student':
        return <GraduationCap className="w-3.5 h-3.5 text-amber-500" />;
      case 'retired':
        return <Palmtree className="w-3.5 h-3.5 text-teal-500" />;
      default:
        return <Briefcase className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Financial Identity', shortLabel: 'Identity', icon: User },
    { id: 'card' as const, label: 'DhanMITR Card', shortLabel: 'Dhan Card', icon: Award },
    { id: 'sync' as const, label: 'Cloud & Backup', shortLabel: 'Cloud Sync', icon: Database },
    { id: 'preferences' as const, label: 'Preferences & Security', shortLabel: 'Security', icon: Shield },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-28 md:pb-12 space-y-4 sm:space-y-6">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Account & Settings
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your financial identity, social story card, and security.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCardModalOpen(true)}
            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200 fill-emerald-200" />
            <span className="hidden sm:inline">Dhan Card (Story)</span>
            <span className="sm:hidden">Card</span>
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 active:scale-95 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit Profile</span>
            <span className="sm:hidden">Edit</span>
          </button>
        </div>
      </div>

      {/* Account Card - Fully Adaptive for Light & Dark Mode */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0B101D] border border-slate-200/90 dark:border-slate-800/90 p-4 sm:p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
        {/* User Identity Top Row */}
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-lg sm:text-xl flex items-center justify-center shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/30 shrink-0">
            {profile.avatar_initial || 'U'}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                {profile.name || 'Krish Sharma'}
              </h2>
              {allUserBadges.slice(0, 3).map((b: TagDetails, idx: number) => (
                <span
                  key={b.id + idx}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border shadow-2xs whitespace-nowrap ${b.colorBg} ${b.colorBorder} ${b.colorText} ${
                    b.id === 'founder' ? 'ring-1 ring-amber-400/60' : ''
                  }`}
                >
                  {b.badgeLabel}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate mt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{profile.email || user?.email || 'Authenticated User'}</span>
            </p>
          </div>
        </div>

        {/* Clean Metrics Row (Mobile-Friendly 3-Grid) */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950/70 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-center transition-colors">
          <div className="space-y-0.5">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block truncate">
              Inflow
            </span>
            <p className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white truncate">
              {formatCurrency(totalIncome || 0)}
            </p>
          </div>

          <div className="space-y-0.5 border-l border-slate-200 dark:border-slate-800">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block truncate">
              Savings
            </span>
            <p className="text-xs sm:text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 truncate">
              {savingsRate || 0}%
            </p>
          </div>

          <div className="space-y-0.5 border-l border-slate-200 dark:border-slate-800">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block truncate">
              Surplus
            </span>
            <p
              className={`text-xs sm:text-sm font-black font-mono truncate ${
                netSurplus >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrency(netSurplus || 0)}
            </p>
          </div>
        </div>

        {/* DhanMITR Card Promo Banner */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-slate-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-[#0F172A] border border-emerald-500/25 dark:border-emerald-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  Shareable DhanMITR Card
                </p>
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-500/40">
                  Light & Dark Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                Show off your Dhan Health Score & savings discipline on WhatsApp Status & Instagram Story.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCardModalOpen(true)}
            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-950/10 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Download Card</span>
            <span className="sm:hidden">Get</span>
          </button>
        </div>
      </div>

      {/* Export feedback toast */}
      {exportSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* 4-Column Mobile-Friendly Segmented Menu */}
      <div className="grid grid-cols-4 p-1 bg-slate-200/80 dark:bg-[#0B101D] rounded-2xl gap-1 border border-slate-200 dark:border-slate-800/80 select-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                isActive
                  ? 'bg-white dark:bg-[#0F172A] text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
              <span className="hidden sm:inline truncate">{tab.label}</span>
              <span className="sm:hidden text-[11px] truncate">{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-4 sm:space-y-6">
        {/* ======================= TAB 1: FINANCIAL IDENTITY ======================= */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Persona Details */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs space-y-3.5">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-500" />
                Core Financial Profile
              </h3>

              <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Full Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{profile.name || 'Krish Sharma'}</span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Employment Status</span>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 capitalize">
                    {getEmploymentIcon(profile.employment_type)}
                    {profile.employment_type?.replace('_', ' ') || 'Salaried'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Tax Filing Regime</span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 capitalize">
                    {profile.tax_regime || 'New'}
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Appetite & Persona Card */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-500" />
                    Risk Tolerance Appetite
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border capitalize ${getRiskColor(
                      profile.risk_tolerance
                    )}`}
                  >
                    {profile.risk_tolerance || 'Moderate'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {profile.risk_tolerance === 'aggressive'
                    ? 'Growth strategy with higher equity exposure and high risk-adjusted targets.'
                    : profile.risk_tolerance === 'conservative'
                    ? 'Capital preservation prioritizing fixed income and liquid assets.'
                    : 'Balanced multi-asset allocation targeting steady capital compounding.'}
                </p>

                {/* Visual Risk Gauge */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500" /> Conservative</span>
                    <span className="flex items-center gap-1"><Scale className="w-3 h-3 text-blue-500" /> Moderate</span>
                    <span className="flex items-center gap-1"><Rocket className="w-3 h-3 text-purple-500" /> Aggressive</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all ${
                        profile.risk_tolerance === 'conservative'
                          ? 'w-1/3 bg-emerald-500 shadow-xs'
                          : 'w-1/3 bg-emerald-500/20'
                      }`}
                    />
                    <div
                      className={`h-full rounded-full transition-all ${
                        profile.risk_tolerance === 'moderate' || !profile.risk_tolerance
                          ? 'w-1/3 bg-blue-500 shadow-xs'
                          : 'w-1/3 bg-blue-500/20'
                      }`}
                    />
                    <div
                      className={`h-full rounded-full transition-all ${
                        profile.risk_tolerance === 'aggressive'
                          ? 'w-1/3 bg-rose-500 shadow-xs'
                          : 'w-1/3 bg-rose-500/20'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  onClick={() => setIsRiskModalOpen(true)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5 text-blue-500" />
                  <span>Adjust Risk Appetite</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB: DHANMITR SOCIAL CARD ======================= */}
        {activeTab === 'card' && (
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Light & Dark Mode
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">Green & White or Obsidian Theme</span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Your DhanMITR Social Story Card
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ready to show off on your WhatsApp Status and Instagram Story. Highlights your financial discipline and health score safely without revealing private account balances.
                </p>
              </div>

              <button
                onClick={() => setIsCardModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Customize & Download (PNG)</span>
              </button>
            </div>

            {/* In-Page Card Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Feature Highlights on Left */}
              <div className="lg:col-span-6 space-y-4">
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  What Your Card Highlights:
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white">Dhan Health Score</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        Calculates an objective wealth health score based on cash surplus, savings discipline, and asset diversification.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white">Savings Discipline</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        Shows the percentage of income retained and invested ({savingsRate || 38}%), proving high financial prudence.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white">Diversified Portfolio & Quote</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        Features multi-asset allocation (Equity • Gold • Debt • Liquid) plus Morgan Housel&apos;s timeless wisdom and scan QR code.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setIsCardModalOpen(true)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Open Story Card & Export PNG</span>
                  </button>
                </div>
              </div>

              {/* Card Visual Preview on Right */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#070B14] p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                {/* COOL BORDER: Shiny radiant rim with luminous halo matching badge */}
                <div
                  className={`relative p-[2.5px] rounded-[30px] w-full max-w-[330px] transition-all ${
                    activeBadge.id === 'founder'
                      ? 'bg-gradient-to-tr from-amber-500 via-yellow-300 to-emerald-600 shadow-[0_16px_40px_-10px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/50'
                      : activeBadge.id === 'clever'
                      ? 'bg-gradient-to-tr from-purple-500 via-teal-300 to-emerald-600 shadow-[0_16px_40px_-10px_rgba(139,92,246,0.3)] ring-1 ring-purple-400/40'
                      : 'bg-gradient-to-tr from-emerald-500 via-teal-300 to-emerald-600 shadow-[0_16px_40px_-10px_rgba(16,185,129,0.32)] ring-1 ring-emerald-400/40'
                  }`}
                >
                  <div className="w-full bg-white rounded-[27px] p-4.5 text-slate-900 space-y-3 relative overflow-hidden select-none">
                    
                    {/* Corner shine */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/15 via-teal-300/10 to-transparent rounded-bl-full pointer-events-none" />

                    {/* TOP HEADER: BRAND + USER ON LEFT, TAGS STACKED VERTICALLY ON RIGHT */}
                    <div className="relative z-10 flex items-start justify-between gap-2.5 pb-0.5">
                      {/* Left Side: Brand Logo + DhanMitr & User Avatar + Name */}
                      <div className="space-y-2 min-w-0">
                        {/* Brand Row */}
                        <div className="flex items-center gap-2">
                          <DhanMitrLogo className="w-6 h-6 shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black tracking-tight text-slate-900 flex items-center font-display leading-tight">
                              धन<span className="text-emerald-500 font-bold">Mitr</span>
                            </span>
                            <span className="text-[7.5px] font-mono tracking-widest text-slate-400 uppercase">
                              Your Financial Friend
                            </span>
                          </div>
                        </div>

                        {/* User Identity Row */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0">
                            {profile.avatar_initial || 'K'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-slate-900 truncate leading-tight">
                              {profile.name || 'Krish Sharma'}
                            </p>
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 rounded-full text-[9px] font-extrabold bg-slate-900 text-white dark:bg-slate-800 shadow-2xs border border-slate-700/60">
                              <span className="text-emerald-400 font-black">@</span>
                              <span className="tracking-tight font-mono">{memberNumber}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Assigned Tags Stacked Vertically (One by One in a line!) */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                        {allUserBadges.slice(0, 3).map((badge: TagDetails, idx: number) => (
                          <span
                            key={badge.id + idx}
                            className={`px-2 py-0.5 rounded-full text-[8.5px] font-black tracking-wider uppercase border shadow-2xs whitespace-nowrap ${badge.colorBg} ${badge.colorBorder} ${badge.colorText} ${
                              badge.id === 'founder' ? 'ring-1 ring-amber-400/50' : ''
                            }`}
                          >
                            {badge.badgeLabel}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Middle Section: Financial Milestone Banner (Fills the gap!) */}
                    <div className="relative z-10 p-2 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border border-emerald-200/90 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[8.5px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                          Health Index
                        </span>
                        <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-emerald-600 text-white shadow-2xs">
                          TOP 5% TIER
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-extrabold text-slate-800">Wealth Maestro</span>
                        <span className="font-extrabold text-emerald-600">Grade A+</span>
                      </div>
                      <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden p-0.2">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[96%]" />
                      </div>
                    </div>

                    {/* CORE METRICS (HERO HEALTH SCORE + 2 SUPPORTING METRICS - NO STREAK) */}
                    <div className="relative z-10 space-y-2 text-center">
                      <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center justify-between px-3">
                        <div className="text-left">
                          <span className="text-[8px] font-bold text-emerald-800 uppercase block">✦ Dhan Health Score</span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-lg font-black text-slate-900">885</span>
                            <span className="text-[9px] font-normal text-slate-400">/ 900</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] font-extrabold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200 block shadow-2xs">
                            Grade A+ • Top 5%
                          </span>
                          <span className="text-[7.5px] font-semibold text-slate-500 block mt-0.5">Wealth Maestro</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-100">
                          <span className="text-[8px] font-bold text-emerald-800 uppercase block">Savings Rate</span>
                          <p className="text-base font-black text-slate-900">{savingsRate || 49}%</p>
                          <span className="text-[8px] font-extrabold text-emerald-700 bg-white px-1 rounded block mt-0.5">High Prudence</span>
                        </div>
                        <div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-100">
                          <span className="text-[8px] font-bold text-emerald-800 uppercase block">Portfolio Mix</span>
                          <p className="text-xs font-black text-slate-900 mt-1">Diversified</p>
                          <span className="text-[7.5px] font-extrabold text-emerald-700 bg-white px-1 rounded block mt-0.5 truncate">Equity • Gold • Debt</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <p className="text-[9px] italic font-serif text-emerald-950 font-bold leading-tight">
                        &quot;Wealth is what you don&apos;t see.&quot;
                      </p>
                      <p className="text-[7.5px] text-slate-400 font-semibold">— Morgan Housel</p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between pt-0.5">
                      <span className="text-[8px] font-mono font-bold text-emerald-700">dhanmitr.ai</span>
                      <span className="text-[8px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        ✔ Verified by धनMitr
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-3 font-semibold">
                  Click below to open customizer and download full 1080×1920 Story PNG
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 2: CLOUD & DATA BACKUP ======================= */}
        {activeTab === 'sync' && (
          <div className="space-y-4 sm:space-y-5">
            {/* Supabase Connection Status Card */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Database className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                      Cloud Database Sync
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Encrypted PostgreSQL (TLS 1.3 / AES-256)
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[11px] rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Synced
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-[#0B101D] rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block">Subscriptions</span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">{subscriptions.length}</span>
                </div>
                <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-[#0B101D] rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block">Insurances</span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">{insurances.length}</span>
                </div>
                <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-[#0B101D] rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block">Transactions</span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">{transactions.length}</span>
                </div>
                <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-[#0B101D] rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block">Security Model</span>
                  <span className="text-[11px] sm:text-xs font-extrabold text-emerald-600 dark:text-emerald-400">RLS Enforced</span>
                </div>
              </div>
            </div>

            {/* Export & Data Sovereignty Card */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs space-y-3.5">
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-500" />
                  Data Ownership & Backups
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Export complete snapshots of your records for spreadsheets or offline storage.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  onClick={handleExportJSON}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Download Full Backup (.json)</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <span>Export Transactions (.csv)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 3: PREFERENCES & SECURITY ======================= */}
        {activeTab === 'preferences' && (
          <div className="space-y-4 sm:space-y-5">
            {/* Preferences */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                Application Preferences
              </h3>

              {/* Theme & Mode */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Theme Appearance
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 dark:bg-[#0B101D] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Light Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 dark:bg-[#0B101D] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Dark Mode</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Display Currency
                  </label>
                  <CustomSelect
                    options={[
                      { value: 'INR', label: 'Indian Rupee (INR ₹)' },
                      { value: 'USD', label: 'US Dollar (USD $)' },
                      { value: 'EUR', label: 'Euro (EUR €)' },
                      { value: 'GBP', label: 'British Pound (GBP £)' },
                    ]}
                    value={currency}
                    onChange={(val) => setCurrency(val)}
                    direction="auto"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Renewal Push Alert Window
                  </label>
                  <CustomSelect
                    options={[
                      { value: '7', label: '7 Days Prior' },
                      { value: '10', label: '10 Days Prior (Recommended)' },
                      { value: '14', label: '14 Days Prior' },
                    ]}
                    value="10"
                    onChange={() => {}}
                    direction="auto"
                  />
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center justify-between p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-[#0B101D] border border-slate-200/80 dark:border-slate-800">
                  <div className="space-y-0.5 pr-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Upcoming Renewal Notifications</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                      Alert for OTT subscriptions & insurance premium dates.
                    </p>
                  </div>
                  <button
                    onClick={() => setRenewalAlerts(!renewalAlerts)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      renewalAlerts ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                        renewalAlerts ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-[#0B101D] border border-slate-200/80 dark:border-slate-800">
                  <div className="space-y-0.5 pr-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">High-Spend Transaction Alerts</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                      Highlight single outlays exceeding ₹5,000.
                    </p>
                  </div>
                  <button
                    onClick={() => setHighSpendAlerts(!highSpendAlerts)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      highSpendAlerts ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                        highSpendAlerts ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Account Actions & Danger Zone */}
            <div className="bg-white dark:bg-[#0F172A] border border-red-200/70 dark:border-red-900/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Account Security & Session
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Sign out of this browser session.
                  </p>
                </div>

                <button
                  onClick={signOut}
                  className="px-3.5 sm:px-4 py-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dedicated Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Dedicated Edit Risk Tolerance Modal */}
      <EditRiskToleranceModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
      />

      {/* Dedicated DhanMITR Card Modal */}
      <DhanMitrCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        profile={profile}
        savingsRate={savingsRate}
        totalIncome={totalIncome}
        netSurplus={netSurplus}
        transactionsCount={transactions.length}
      />
    </div>
  );
};
