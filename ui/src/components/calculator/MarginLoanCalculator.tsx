'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Download,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  Building2,
  Coins,
  Sparkles,
  ArrowRight,
  Info,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface MarginLoanCalculatorProps {
  onProjectCostChange?: (cost: number) => void;
  initialProjectCost?: number;
}

export const MarginLoanCalculator: React.FC<MarginLoanCalculatorProps> = ({
  onProjectCostChange,
  initialProjectCost = 500000,
}) => {
  const { language } = useLanguage();
  const [projectCost, setProjectCost] = useState<number>(initialProjectCost);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  // Exact formulas:
  // Margin = Project Cost * 0.10 (10%)
  // Loan = Project Cost * 0.90 (90%)
  // Official Micro Finance tier cap: Maximum loan is ₹1.25 Lakh (₹125,000)
  const isMicro = projectCost <= 140000;
  const rawLoanAmount = Math.round(projectCost * 0.9);
  const loanAmount = isMicro ? Math.min(125000, rawLoanAmount) : rawLoanAmount;
  const marginMoney = projectCost - loanAmount;

  // Update parent when project cost changes
  useEffect(() => {
    onProjectCostChange?.(projectCost);
  }, [projectCost, onProjectCostChange]);

  // Exact Tiered Threshold Scheme Router:
  // <= 1.40L -> Micro Finance (6.5%, 3 yrs, 3 mo moratorium, Max loan cap: ₹1.25L)
  // 1.40L to 50L -> Term Loan (8%, 7 yrs, 6 mo moratorium)
  // > 50L -> Commercial MSME (9.5%, 8 yrs, 6 mo moratorium)
  const scheme = useMemo(() => {
    if (projectCost <= 140000) {
      return {
        id: 'mudra',
        name: language === 'hi' ? 'मुद्रा / माइक्रो फाइनेंस योजना' : 'Mudra / Micro Finance Scheme',
        badge: language === 'hi' ? 'प्राथमिकता माइक्रो क्रेडिट (अधिकतम ₹1.25L)' : 'Priority Micro Credit (Max ₹1.25L)',
        rate: 6.5,
        years: 3,
        moratoriumMonths: 3,
        maxLoanCap: 125000,
        note: language === 'hi' ? 'ग्रामीण दुकानों और छोटे उद्यमों के लिए। कोई गारंटी/बंधक की जरूरत नहीं।' : 'Designed for small village ventures & retail shops. Zero collateral needed.',
      };
    } else if (projectCost <= 5000000) {
      return {
        id: 'pmegp_cgtmse',
        name: language === 'hi' ? 'CGTMSE / PMEGP प्रोजेक्ट टर्म लोन' : 'CGTMSE / PMEGP Project Term Loan',
        badge: language === 'hi' ? 'बिना गारंटी सरकारी लोन' : 'CGTMSE Collateral-Free',
        rate: 8.0,
        years: 7,
        moratoriumMonths: 6,
        maxLoanCap: null,
        note: language === 'hi' ? 'मशीनरी, शेड व व्यावसायिक सेटअप के लिए सरकारी गारंटी टर्म लोन।' : 'Government-guaranteed term loan for machinery, sheds & commercial setups.',
      };
    } else {
      return {
        id: 'commercial',
        name: language === 'hi' ? 'कमर्शियल MSME प्रोजेक्ट लोन' : 'Commercial MSME Project Loan',
        badge: language === 'hi' ? 'एंटरप्राइज टियर' : 'Enterprise Tier',
        rate: 9.5,
        years: 8,
        moratoriumMonths: 6,
        maxLoanCap: null,
        note: language === 'hi' ? 'बड़े औद्योगिक और प्रोसेसिंग प्लांट्स के लिए विशेष बैंकिंग शर्तें।' : 'Customized banking terms for larger industrial and processing setups.',
      };
    }
  }, [projectCost, language]);

  // Quarterly EMI & Moratorium Math:
  const schedule = useMemo(() => {
    if (loanAmount <= 0) return { quarterlyEmi: 0, interestOnly: 0, rows: [] };

    const totalQuarters = scheme.years * 4;
    const moratoriumQuarters = Math.round(scheme.moratoriumMonths / 3);
    const repaymentQuarters = totalQuarters - moratoriumQuarters;
    const quarterlyRate = (scheme.rate / 100) / 4;

    // Grace period simple interest per quarter
    const interestOnly = Math.round(loanAmount * quarterlyRate);

    // Quarterly reducing EMI formula
    const factor = Math.pow(1 + quarterlyRate, repaymentQuarters);
    const quarterlyEmi = Math.round(
      loanAmount * ((quarterlyRate * factor) / (factor - 1))
    );

    // Schedule generation
    let balance = loanAmount;
    const rows = [];

    for (let q = 1; q <= totalQuarters; q++) {
      const isGrace = q <= moratoriumQuarters;
      const intPay = Math.round(balance * quarterlyRate);
      let prinPay = 0;
      let totalPay = 0;

      if (isGrace) {
        prinPay = 0;
        totalPay = intPay;
      } else {
        prinPay = Math.min(balance, quarterlyEmi - intPay);
        totalPay = quarterlyEmi;
        balance = Math.max(0, balance - prinPay);
      }

      rows.push({
        quarter: q,
        year: Math.ceil(q / 4),
        isGrace,
        principal: prinPay,
        interest: intPay,
        total: totalPay,
        balance: Math.max(0, balance),
      });
    }

    return { quarterlyEmi, interestOnly, rows };
  }, [loanAmount, scheme]);

  // CSV Export
  const downloadCSV = () => {
    if (!schedule.rows.length) return;
    const csvContent =
      'data:text/csv;charset=utf-8,Quarter,Period,Status,Principal (INR),Interest (INR),Total Payment (INR),Remaining Balance (INR)\n' +
      schedule.rows
        .map(
          (r) =>
            `Q${r.quarter},Year ${r.year} Q${((r.quarter - 1) % 4) + 1},${
              r.isGrace ? 'Grace Period (Moratorium)' : 'Regular EMI'
            },${r.principal},${r.interest},${r.total},${r.balance}`
        )
        .join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Repayment_Schedule_INR_${loanAmount}.csv`;
    link.click();
  };

  const quickPresets = [
    { label: language === 'hi' ? '₹1 लाख' : '₹1 Lakh', val: 100000 },
    { label: language === 'hi' ? '₹2 लाख' : '₹2 Lakh', val: 200000 },
    { label: language === 'hi' ? '₹5 लाख' : '₹5 Lakh', val: 500000 },
    { label: language === 'hi' ? '₹10 लाख' : '₹10 Lakh', val: 1000000 },
    { label: language === 'hi' ? '₹25 लाख' : '₹25 Lakh', val: 2500000 },
    { label: language === 'hi' ? '₹50 लाख' : '₹50 Lakh', val: 5000000 },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Main Project Loan Bento Card */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs space-y-4">
        {/* Card Header & Budget Slider */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {language === 'hi' ? '10% मार्जिन व 90% प्रोजेक्ट लोन' : '10% Margin & 90% Project Loan'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {scheme.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'hi'
                  ? 'अपना प्रोजेक्ट बजट चुनें और अपनी 10% पूंजी व 90% स्वीकृत बैंक लोन देखें।'
                  : 'Select your enterprise budget to calculate your 10% equity down payment & 90% sanctioned bank loan.'}
              </p>
            </div>

            {/* Total Budget Display */}
            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1.5 sm:gap-0 bg-slate-50 dark:bg-white/5 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-xl border border-slate-200/60 dark:border-white/5 sm:border-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                {language === 'hi' ? 'कुल प्रोजेक्ट बजट' : 'Total Project Cost'}
              </span>
              <span className="text-lg sm:text-2xl font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                ₹{projectCost.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Fluid Slider */}
          <div className="pt-1 space-y-2">
            <input
              type="range"
              min="50000"
              max="5000000"
              step="25000"
              value={projectCost}
              onChange={(e) => setProjectCost(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
            />

            {/* Quick Preset Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickPresets.map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setProjectCost(preset.val)}
                  className={`py-1 px-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    projectCost === preset.val
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Unified 2-Pod Capital Bento (Promoter Margin vs Sanctioned Bank Loan) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
          {/* Pod 1: Promoter 10% Down Payment (4 cols on desktop) */}
          <div className="md:col-span-4 p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent border border-teal-500/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 font-mono flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'आपकी 10% पूंजी' : 'Your 10% Down Payment'}</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-600 dark:text-teal-400">
                  {language === 'hi' ? 'स्वयं का हिस्सा' : 'Promoter Equity'}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                ₹{marginMoney.toLocaleString('en-IN')}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              {language === 'hi'
                ? 'बैंक लोन मंजूरी के लिए आपका आवश्यक प्रारंभिक योगदान (0% ब्याज)।'
                : 'Your upfront margin contribution required by the bank with zero interest liability.'}
            </p>
          </div>

          {/* Pod 2: Sanctioned Bank Loan & Repayment (8 cols on desktop) */}
          <div className="md:col-span-8 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/25 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'स्वीकृत 90% बैंक लोन' : 'Sanctioned 90% Bank Loan'}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    {scheme.rate}% p.a.
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                    {scheme.years} {language === 'hi' ? 'वर्ष' : 'Yrs'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mt-1">
                <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  ₹{loanAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                  {language === 'hi' ? 'अनुमानित किश्त:' : 'Repayment:'}{' '}
                  <span className="text-base text-blue-600 dark:text-blue-400 font-black">
                    ~₹{Math.round(schedule.quarterlyEmi / 3).toLocaleString('en-IN')}
                  </span>
                  <span className="text-slate-400 font-normal">/{language === 'hi' ? 'माह' : 'mo'}</span>
                  <span className="text-slate-400 text-[10px] font-normal block sm:inline sm:ml-1">
                    (₹{schedule.quarterlyEmi.toLocaleString('en-IN')}/qtr)
                  </span>
                </div>
              </div>
            </div>

            {/* Moratorium Grace Period Pill */}
            <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {scheme.moratoriumMonths}-{language === 'hi' ? 'माह की छूट (Moratorium):' : 'Month Moratorium:'}
                </span>{' '}
                {language === 'hi'
                  ? `शुरुआती ${scheme.moratoriumMonths} महीने ₹0 मूलधन। केवल साधारण ब्याज (₹${schedule.interestOnly.toLocaleString('en-IN')}/तिमाही) दें।`
                  : `Pay ₹0 principal during setup. Only simple interest of ₹${schedule.interestOnly.toLocaleString('en-IN')}/qtr applies.`}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Action Strip: Collapsible Schedule Toggle & Export */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-white/5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowSchedule(!showSchedule)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              {showSchedule
                ? language === 'hi'
                  ? 'किश्त सारणी छिपाएं'
                  : 'Hide Schedule'
                : language === 'hi'
                ? `किश्त सारणी (${scheme.years * 4} तिमाहियां)`
                : `Repayment Schedule (${scheme.years * 4}Q)`}
            </span>
            {showSchedule ? <ChevronUp className="w-3.5 h-3.5 ml-0.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5 shrink-0" />}
          </button>

          {showSchedule && (
            <button
              onClick={downloadCSV}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'hi' ? 'CSV डाउनलोड' : 'Export CSV'}</span>
            </button>
          )}
        </div>

        {/* 4. Collapsible Schedule Table */}
        {showSchedule && (
          <div className="pt-2 animate-in fade-in duration-200 space-y-2">
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden overflow-x-auto shadow-2xs max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-[#070B14] sticky top-0 border-b border-slate-200 dark:border-white/10 text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">{language === 'hi' ? 'तिमाही' : 'Quarter'}</th>
                    <th className="py-2.5 px-3 font-bold">{language === 'hi' ? 'स्थिति' : 'Status'}</th>
                    <th className="py-2.5 px-3 font-bold">{language === 'hi' ? 'मूलधन' : 'Principal'}</th>
                    <th className="py-2.5 px-3 font-bold">{language === 'hi' ? 'ब्याज' : 'Interest'}</th>
                    <th className="py-2.5 px-3 font-bold">{language === 'hi' ? 'कुल भुगतान' : 'Total Payment'}</th>
                    <th className="py-2.5 px-3 font-bold">{language === 'hi' ? 'शेष लोन' : 'Balance'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {schedule.rows.map((row) => (
                    <tr
                      key={row.quarter}
                      className={
                        row.isGrace
                          ? 'bg-amber-500/5 text-amber-600 dark:text-amber-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }
                    >
                      <td className="py-2 px-3 font-bold">Q{row.quarter}</td>
                      <td className="py-2 px-3">
                        {row.isGrace ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 font-bold">
                            {language === 'hi' ? 'छूट अवधि' : 'Moratorium'}
                          </span>
                        ) : (
                          <span className="text-slate-400">{language === 'hi' ? 'नियमित ईएमआई' : 'Regular EMI'}</span>
                        )}
                      </td>
                      <td className="py-2 px-3">₹{row.principal.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3">₹{row.interest.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 font-bold">₹{row.total.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3">₹{row.balance.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 5. Minimal Government Schemes Guide (Dynamic Highlighting) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              {language === 'hi' ? 'सरकारी योजना पात्रता गाइड' : 'Government Scheme Eligibility Guide'}
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {language === 'hi' ? 'बजट के अनुसार सुझाई गई योजना' : 'Matched to your project budget'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Scheme 1: Mudra */}
          <div
            className={`p-3 rounded-2xl transition-all border ${
              projectCost <= 140000
                ? 'bg-teal-500/10 border-teal-500/40 ring-1 ring-teal-500/30'
                : 'bg-slate-50 dark:bg-[#070B14] border-slate-200/60 dark:border-white/5 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase font-mono">
                Mudra Yojana (PMMY)
              </span>
              {projectCost <= 140000 && (
                <span className="text-[9px] font-bold bg-teal-500 text-slate-950 px-1.5 py-0.2 rounded">
                  {language === 'hi' ? 'सटीक मैच' : 'Best Match'}
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {language === 'hi' ? '₹10 लाख तक' : 'Up to ₹10 Lakhs'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
              {language === 'hi'
                ? 'बिना किसी गारंटी के। ग्रामीण दुकानों, वेंडरों व सेवा इकाइयों के लिए उत्तम।'
                : 'Zero collateral needed. Ideal for rural shops, service units & vendors.'}
            </p>
          </div>

          {/* Scheme 2: PMEGP */}
          <div
            className={`p-3 rounded-2xl transition-all border ${
              projectCost > 140000 && projectCost <= 5000000
                ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30'
                : 'bg-slate-50 dark:bg-[#070B14] border-slate-200/60 dark:border-white/5 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono">
                PMEGP Subsidy Scheme
              </span>
              {projectCost > 140000 && projectCost <= 5000000 && (
                <span className="text-[9px] font-bold bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded">
                  {language === 'hi' ? 'सटीक मैच' : 'Best Match'}
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {language === 'hi' ? '15% – 35% सरकारी सब्सिडी' : '15% – 35% Govt Subsidy'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
              {language === 'hi'
                ? 'विनिर्माण के लिए ₹50 लाख तक, सीधे खाते में मार्जिन मनी सब्सिडी।'
                : 'Up to ₹50 Lakhs for manufacturing, with direct margin subsidy into your account.'}
            </p>
          </div>

          {/* Scheme 3: CGTMSE */}
          <div
            className={`p-3 rounded-2xl transition-all border ${
              projectCost > 5000000
                ? 'bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/30'
                : 'bg-slate-50 dark:bg-[#070B14] border-slate-200/60 dark:border-white/5 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase font-mono">
                CGTMSE Guarantee
              </span>
              {projectCost > 5000000 && (
                <span className="text-[9px] font-bold bg-blue-500 text-white px-1.5 py-0.2 rounded">
                  {language === 'hi' ? 'सटीक मैच' : 'Best Match'}
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {language === 'hi' ? '₹5 करोड़ तक' : 'Up to ₹5 Crores'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
              {language === 'hi'
                ? 'क्रेडिट गारंटी ट्रस्ट द्वारा 85% तक सुरक्षित बैंक ऋण।'
                : 'Bank loan backed up to 85% by Credit Guarantee Trust for Micro & Small Enterprises.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
