'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { EditProfileModal } from '@/components/settings/EditProfileModal';
import { EditRiskToleranceModal } from '@/components/settings/EditRiskToleranceModal';
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

  const [activeTab, setActiveTab] = useState<'profile' | 'sync' | 'preferences'>('profile');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
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
    downloadAnchor.setAttribute('download', `DhanMITR_Backup_${new Date().toISOString().slice(0, 10)}.json`);
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
    downloadAnchor.setAttribute('download', `DhanMITR_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Manage your financial identity, security, and cloud backup.
          </p>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Edit Financial Profile</span>
          <span className="sm:hidden">Edit</span>
        </button>
      </div>

      {/* Luxury Obsidian Account Card */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#0F172A] dark:bg-[#0B101D] border border-slate-200/80 dark:border-slate-800/90 text-white p-4 sm:p-6 shadow-xl space-y-4">
        {/* User Identity Top Row */}
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-600 text-white font-black text-lg sm:text-xl flex items-center justify-center shadow-md ring-2 ring-emerald-500/30 shrink-0">
            {profile.avatar_initial || 'U'}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight truncate">
              {profile.name || 'Krish Sharma'}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate mt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{profile.email || user?.email || 'Authenticated User'}</span>
            </p>
          </div>
        </div>

        {/* Clean Metrics Row (Mobile-Friendly 3-Grid) */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/70 dark:bg-slate-950/60 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-800/80 text-center">
          <div className="space-y-0.5">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block truncate">
              Inflow
            </span>
            <p className="text-xs sm:text-sm font-extrabold text-white truncate">
              {formatCurrency(totalIncome || 0)}
            </p>
          </div>

          <div className="space-y-0.5 border-l border-slate-800">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block truncate">
              Savings
            </span>
            <p className="text-xs sm:text-sm font-extrabold text-emerald-400 truncate">
              {savingsRate || 0}%
            </p>
          </div>

          <div className="space-y-0.5 border-l border-slate-800">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block truncate">
              Surplus
            </span>
            <p
              className={`text-xs sm:text-sm font-extrabold truncate ${
                netSurplus >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(netSurplus || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Export feedback toast */}
      {exportSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* Strict 3-Column Mobile-Friendly Segmented Menu */}
      <div className="grid grid-cols-3 p-1 bg-slate-200/80 dark:bg-[#0B101D] rounded-2xl gap-1 border border-slate-200 dark:border-slate-800/80 select-none">
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
                    <span>Conservative (🛡️)</span>
                    <span>Moderate (⚖️)</span>
                    <span>Aggressive (🚀)</span>
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
    </div>
  );
};
