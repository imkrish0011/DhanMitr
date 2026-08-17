'use client';

import React, { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { BillingCycle, InsuranceType, TransactionCategory } from '@/types';
import { StatefulButton, ButtonState } from '@/components/ui/StatefulButton';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import {
  Tv,
  ShieldCheck,
  Wallet,
  CreditCard,
  TrendingUp,
  Bell,
  Play,
  Package,
  Music,
  Star,
  Film,
  Bot,
  Brain,
  Zap,
  HeartPulse,
  Car,
  Home,
  Utensils,
  ShoppingCart,
  ShoppingBag,
  Smartphone,
  Landmark,
  Coins,
  BarChart3,
  CircleDollarSign,
  Lock,
  AlertTriangle,
  AlertCircle,
  Calendar,
  X,
} from 'lucide-react';

export type FinanceRecordType = 'subscription' | 'insurance' | 'income' | 'expense' | 'investment' | 'reminder';

interface AddFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: FinanceRecordType;
}

export const AddFinanceModal: React.FC<AddFinanceModalProps> = ({
  isOpen,
  onClose,
  initialType = 'subscription',
}) => {
  const { addSubscription, addInsurance, addIncomeSource, addTransaction } = useFinance();
  const [activeType, setActiveType] = useState<FinanceRecordType>(initialType);
  const [buttonState, setButtonState] = useState<ButtonState>('idle');

  useEffect(() => {
    if (initialType) {
      setActiveType(initialType);
    }
  }, [initialType, isOpen]);

  // 1. Subscription form fields
  const [subName, setSubName] = useState('');
  const [subProvider, setSubProvider] = useState('');
  const [subLogoKey, setSubLogoKey] = useState<string>('netflix');
  const [subAmount, setSubAmount] = useState('');
  const [subCycle, setSubCycle] = useState<BillingCycle>('monthly');
  const [subCategory, setSubCategory] = useState('Entertainment');
  const [subDate, setSubDate] = useState('28 Aug 2026');

  // 2. Insurance form fields
  const [insName, setInsName] = useState('');
  const [insProvider, setInsProvider] = useState('HDFC Life Insurance');
  const [insLogoKey, setInsLogoKey] = useState<string>('hdfc_life');
  const [insType, setInsType] = useState<InsuranceType>('term_life');
  const [insCoverage, setInsCoverage] = useState('');
  const [insPremium, setInsPremium] = useState('');
  const [insFreq, setInsFreq] = useState<'monthly' | 'yearly'>('yearly');
  const [insPolicyNo, setInsPolicyNo] = useState('');
  const [insDate, setInsDate] = useState('15 Sep 2026');

  // 3. Income form fields
  const [incTitle, setIncTitle] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incFreq, setIncFreq] = useState<'monthly' | 'one_time'>('monthly');
  const [incCategory, setIncCategory] = useState<'salary' | 'freelance' | 'dividend' | 'rental' | 'other'>('salary');
  const [incAccount, setIncAccount] = useState('Primary Bank');

  // 4. Expense form fields
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<TransactionCategory>('utilities');
  const [expAccount, setExpAccount] = useState('UPI / GPay');

  // 5. Investment form fields
  const [invName, setInvName] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invType, setInvType] = useState('mutual_fund');
  const [invFreq, setInvFreq] = useState<'monthly' | 'one_time'>('monthly');
  const [invBroker, setInvBroker] = useState('Zerodha / Groww');
  const [invDate, setInvDate] = useState('10 of every month');

  // 6. Reminder / Bill form fields
  const [remName, setRemName] = useState('');
  const [remAmount, setRemAmount] = useState('');
  const [remCategory, setRemCategory] = useState('utilities');
  const [remDate, setRemDate] = useState('05 Sep 2026');
  const [remPriority, setRemPriority] = useState('high');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setButtonState('loading');

    setTimeout(() => {
      if (activeType === 'subscription') {
        if (!subName || !subAmount) {
          setButtonState('error');
          return;
        }
        addSubscription({
          name: subName,
          provider: subProvider || subName,
          logoKey: subLogoKey as any,
          planName: `${subCycle === 'monthly' ? 'Monthly' : 'Annual'} Plan`,
          amount: Number(subAmount),
          currency: 'INR',
          billing_cycle: subCycle,
          category: subCategory,
          next_renewal_date: subDate,
          is_urgent: false,
          is_active: true,
        });
      } else if (activeType === 'insurance') {
        if (!insName || !insPremium) {
          setButtonState('error');
          return;
        }
        addInsurance({
          policy_name: insName,
          provider: insProvider,
          logoKey: insLogoKey as any,
          policy_type: insType,
          policy_number: insPolicyNo || `POL-${Math.floor(100000 + Math.random() * 900000)}`,
          coverage_amount: Number(insCoverage) || 1000000,
          premium_amount: Number(insPremium),
          premium_frequency: insFreq,
          renewal_date: insDate,
          is_urgent: false,
          is_active: true,
        });
      } else if (activeType === 'income') {
        if (!incTitle || !incAmount) {
          setButtonState('error');
          return;
        }
        addIncomeSource({
          title: incTitle,
          amount: Number(incAmount),
          frequency: incFreq,
          category: incCategory,
          date: '01 of every month',
        });
      } else if (activeType === 'expense') {
        if (!expTitle || !expAmount) {
          setButtonState('error');
          return;
        }
        addTransaction({
          title: expTitle,
          amount: Number(expAmount),
          currency: 'INR',
          type: 'expense',
          category: expCategory,
          date: 'Today',
          account_name: expAccount,
        });
      } else if (activeType === 'investment') {
        if (!invName || !invAmount) {
          setButtonState('error');
          return;
        }
        addTransaction({
          title: `${invName} (${invType === 'mutual_fund' ? 'SIP' : 'Investment'})`,
          amount: Number(invAmount),
          currency: 'INR',
          type: 'investment',
          category: 'investments',
          date: invDate || 'Today',
          account_name: invBroker,
        });
      } else if (activeType === 'reminder') {
        if (!remName || !remAmount) {
          setButtonState('error');
          return;
        }
        addSubscription({
          name: remName,
          provider: remName,
          logoKey: 'other',
          planName: 'Bill Payment',
          amount: Number(remAmount),
          currency: 'INR',
          billing_cycle: 'monthly',
          category: remCategory,
          next_renewal_date: remDate,
          is_urgent: remPriority === 'high',
          is_active: true,
        });
      }

      setButtonState('success');
      setTimeout(() => {
        setButtonState('idle');
        onClose();
      }, 500);
    }, 400);
  };

  const tabs = [
    { id: 'subscription' as const, label: 'Subscription', icon: Tv },
    { id: 'insurance' as const, label: 'Insurance', icon: ShieldCheck },
    { id: 'income' as const, label: 'Income', icon: Wallet },
    { id: 'expense' as const, label: 'Expense', icon: CreditCard },
    { id: 'investment' as const, label: 'Investment', icon: TrendingUp },
    { id: 'reminder' as const, label: 'Alert / Bill', icon: Bell },
  ];

  // Options for custom selects with sleek SVG icons
  const subLogoOptions: SelectOption[] = [
    { value: 'netflix', label: 'Netflix', icon: <Film className="w-3.5 h-3.5 text-rose-500" /> },
    { value: 'amazon_prime', label: 'Amazon Prime', icon: <Package className="w-3.5 h-3.5 text-sky-500" /> },
    { value: 'spotify', label: 'Spotify', icon: <Music className="w-3.5 h-3.5 text-emerald-500" /> },
    { value: 'hotstar', label: 'Disney+ Hotstar', icon: <Star className="w-3.5 h-3.5 text-amber-500" /> },
    { value: 'youtube', label: 'YouTube Premium', icon: <Play className="w-3.5 h-3.5 text-red-500" /> },
    { value: 'apple', label: 'Apple One', icon: <Tv className="w-3.5 h-3.5 text-slate-400" /> },
    { value: 'chatgpt', label: 'ChatGPT Plus', icon: <Bot className="w-3.5 h-3.5 text-teal-500" /> },
    { value: 'claude', label: 'Claude Pro', icon: <Brain className="w-3.5 h-3.5 text-amber-600" /> },
    { value: 'sonyliv', label: 'Sony LIV', icon: <Tv className="w-3.5 h-3.5 text-purple-500" /> },
    { value: 'other', label: 'Other Service', icon: <Zap className="w-3.5 h-3.5 text-emerald-500" /> },
  ];

  const cycleOptions: SelectOption[] = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const insTypeOptions: SelectOption[] = [
    { value: 'term_life', label: 'Term Life Insurance', icon: <HeartPulse className="w-3.5 h-3.5 text-rose-500" /> },
    { value: 'health', label: 'Health Insurance', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> },
    { value: 'motor', label: 'Motor / Vehicle', icon: <Car className="w-3.5 h-3.5 text-blue-500" /> },
    { value: 'home', label: 'Home Insurance', icon: <Home className="w-3.5 h-3.5 text-amber-500" /> },
  ];

  const expCategoryOptions: SelectOption[] = [
    { value: 'housing', label: 'Housing / Rent', icon: <Home className="w-3.5 h-3.5 text-amber-500" /> },
    { value: 'investments', label: 'Investments', icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> },
    { value: 'utilities', label: 'Bills & Utilities', icon: <Zap className="w-3.5 h-3.5 text-cyan-500" /> },
    { value: 'subscriptions', label: 'Subscriptions', icon: <Tv className="w-3.5 h-3.5 text-purple-500" /> },
    { value: 'insurance', label: 'Insurance', icon: <ShieldCheck className="w-3.5 h-3.5 text-rose-500" /> },
    { value: 'other', label: 'Food, Dining & Other', icon: <Utensils className="w-3.5 h-3.5 text-emerald-500" /> },
  ];

  const paymentAccountOptions: SelectOption[] = [
    { value: 'UPI / GPay', label: 'UPI / Google Pay / PhonePe', icon: <Smartphone className="w-3.5 h-3.5 text-emerald-500" /> },
    { value: 'HDFC Bank Account', label: 'HDFC Bank Account', icon: <Landmark className="w-3.5 h-3.5 text-blue-500" /> },
    { value: 'ICICI Bank Account', label: 'ICICI Bank Account', icon: <Landmark className="w-3.5 h-3.5 text-orange-500" /> },
    { value: 'Credit Card', label: 'Credit Card', icon: <CreditCard className="w-3.5 h-3.5 text-purple-500" /> },
    { value: 'Cash', label: 'Cash in Hand', icon: <Coins className="w-3.5 h-3.5 text-amber-500" /> },
  ];

  const invTypeOptions: SelectOption[] = [
    { value: 'mutual_fund', label: 'Mutual Fund SIP', icon: <BarChart3 className="w-3.5 h-3.5 text-emerald-500" /> },
    { value: 'stocks', label: 'Direct Stocks / Shares', icon: <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> },
    { value: 'gold', label: 'Digital Gold / SGB', icon: <CircleDollarSign className="w-3.5 h-3.5 text-amber-500" /> },
    { value: 'fixed_deposit', label: 'Fixed Deposit (FD)', icon: <Lock className="w-3.5 h-3.5 text-teal-500" /> },
    { value: 'ppf_nps', label: 'PPF / NPS / Provident', icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> },
    { value: 'crypto', label: 'Crypto Assets', icon: <Zap className="w-3.5 h-3.5 text-yellow-500" /> },
  ];

  const remPriorityOptions: SelectOption[] = [
    { value: 'high', label: 'High / Critical Alert', icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> },
    { value: 'medium', label: 'Medium Priority', icon: <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> },
    { value: 'normal', label: 'Standard Reminder', icon: <Calendar className="w-3.5 h-3.5 text-slate-400" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Add Financial Record
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Tab Selection: 3-column x 2-row grid with full text visibility */}
        <div className="grid grid-cols-3 p-3 bg-slate-100/80 dark:bg-[#0B101D] gap-2 border-b border-slate-200/60 dark:border-slate-800/80 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveType(tab.id)}
                className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer select-none ${
                  isActive
                    ? 'bg-white dark:bg-[#0F172A] text-emerald-600 dark:text-emerald-400 font-bold shadow-xs ring-1 ring-emerald-500/40 border border-emerald-500/20'
                    : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="text-xs font-bold whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* ===================== 1. SUBSCRIPTION ===================== */}
          {activeType === 'subscription' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service / Platform Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Disney+ Hotstar, Netflix, Spotify"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white focus:outline-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Platform Icon
                  </label>
                  <CustomSelect
                    options={subLogoOptions}
                    value={subLogoKey}
                    onChange={(val) => setSubLogoKey(val)}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Billing Cycle
                  </label>
                  <CustomSelect
                    options={cycleOptions}
                    value={subCycle}
                    onChange={(val) => setSubCycle(val as any)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 499"
                    value={subAmount}
                    onChange={(e) => setSubAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white focus:outline-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Renewal Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 28 Aug 2026"
                    value={subDate}
                    onChange={(e) => setSubDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          {/* ===================== 2. INSURANCE ===================== */}
          {activeType === 'insurance' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Policy Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Max Life Term Plan Plus"
                  value={insName}
                  onChange={(e) => setInsName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white focus:outline-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Provider
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Life, Star Health"
                    value={insProvider}
                    onChange={(e) => setInsProvider(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Policy Type
                  </label>
                  <CustomSelect
                    options={insTypeOptions}
                    value={insType}
                    onChange={(val) => setInsType(val as any)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Coverage Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 10000000"
                    value={insCoverage}
                    onChange={(e) => setInsCoverage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Premium Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 12000"
                    value={insPremium}
                    onChange={(e) => setInsPremium(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white focus:outline-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. POL-984321"
                    value={insPolicyNo}
                    onChange={(e) => setInsPolicyNo(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Renewal Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Sep 2026"
                    value={insDate}
                    onChange={(e) => setInsDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          {/* ===================== 3. INCOME ===================== */}
          {activeType === 'income' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Income Source / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Primary Job Salary, Consulting, Rental"
                  value={incTitle}
                  onChange={(e) => setIncTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white focus:outline-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 75000"
                    value={incAmount}
                    onChange={(e) => setIncAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white focus:outline-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Frequency
                  </label>
                  <CustomSelect
                    options={[
                      { value: 'monthly', label: 'Monthly Recurring' },
                      { value: 'one_time', label: 'One-Time Credit' },
                    ]}
                    value={incFreq}
                    onChange={(val) => setIncFreq(val as any)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Credited Account
                </label>
                <CustomSelect
                  options={paymentAccountOptions}
                  value={incAccount}
                  onChange={(val) => setIncAccount(val)}
                  direction="up"
                />
              </div>
            </>
          )}

          {/* ===================== 4. EXPENSE ===================== */}
          {activeType === 'expense' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expense Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grocery store, Broadband, Dinner"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white focus:outline-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white focus:outline-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <CustomSelect
                    options={expCategoryOptions}
                    value={expCategory}
                    onChange={(val) => setExpCategory(val as any)}
                    direction="auto"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode / Account
                </label>
                <CustomSelect
                  options={paymentAccountOptions}
                  value={expAccount}
                  onChange={(val) => setExpAccount(val)}
                  direction="up"
                />
              </div>
            </>
          )}

          {/* ===================== 5. INVESTMENT ===================== */}
          {activeType === 'investment' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Investment Name / Fund / Asset
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nifty 50 Index Fund SIP, Tata Motors, SGB Gold"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white focus:outline-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Investment Type
                  </label>
                  <CustomSelect
                    options={invTypeOptions}
                    value={invType}
                    onChange={(val) => setInvType(val)}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white focus:outline-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Broker / Platform
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Zerodha, Groww, Upstox"
                    value={invBroker}
                    onChange={(e) => setInvBroker(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Investment Date / Schedule
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10 of every month"
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          {/* ===================== 6. REMINDER / BILL ===================== */}
          {activeType === 'reminder' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bill / Alert Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. BESCOM Electricity Bill, Airtel Broadband, House Rent"
                  value={remName}
                  onChange={(e) => setRemName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white focus:outline-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bill Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2400"
                    value={remAmount}
                    onChange={(e) => setRemAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white focus:outline-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 05 Sep 2026"
                    value={remDate}
                    onChange={(e) => setRemDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <CustomSelect
                    options={expCategoryOptions}
                    value={remCategory}
                    onChange={(val) => setRemCategory(val)}
                    direction="up"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority / Alert Level
                  </label>
                  <CustomSelect
                    options={remPriorityOptions}
                    value={remPriority}
                    onChange={(val) => setRemPriority(val)}
                    direction="up"
                  />
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <StatefulButton
              type="submit"
              state={buttonState}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Save Record
            </StatefulButton>
          </div>
        </form>
      </div>
    </div>
  );
};
