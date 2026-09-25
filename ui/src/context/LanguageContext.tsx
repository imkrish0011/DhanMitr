'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'hi';

export interface Translations {
  greeting: (name: string, hour: number) => string;
  appTitle: string;
  appSub: string;
  securityBadge: string;
  tabs: {
    overview: string;
    msme: string;
    budget: string;
    goals: (count: number) => string;
    tax: string;
    subs: (count: number) => string;
    ins: (count: number) => string;
  };
  hero: {
    surplusLabel: string;
    surplusSub: string;
    savingsRate: (rate: number) => string;
    safeBuffer: (months: number) => string;
    moneyIn: string;
    moneyInSub: string;
    moneyOut: string;
    moneyOutSub: string;
  };
  actions: {
    voiceLog: string;
    voiceLogSub: string;
    addEntry: string;
    addEntrySub: string;
    msmeHub: string;
    msmeHubSub: string;
    passbook: string;
    passbookSub: string;
  };
  bento: {
    monthlyIncome: string;
    inflowBadge: string;
    incomeSub: string;
    totalOutflow: string;
    outflowBadge: string;
    outflowSub: string;
    commitments: string;
    commitmentsSub: (s: number, i: number) => string;
    tapToInspect: string;
    runwayTitle: string;
    runwayBadge: string;
    runwayMonths: (m: number) => string;
    runwaySub: string;
  };
  spending: {
    title: string;
    viewAll: string;
  };
  aiCard: {
    title: string;
    badge: string;
    surplusInsight: (surplus: string, rate: number, months: number) => string;
    emptyInsight: string;
    button: string;
  };
  renewals: {
    title: string;
    viewAll: string;
    empty: string;
    dueIn: (date: string, days?: number) => string;
    urgentBadge: string;
  };
  nav: {
    home: string;
    msme: string;
    passbook: string;
    settings: string;
    voiceAi: string;
  };
  alerts: {
    title: string;
    active: (n: number) => string;
    empty: string;
  };
  passbookView: {
    title: string;
    sub: string;
    entries: (n: number) => string;
    addTransaction: string;
    quickAdd: string;
    addIncome: string;
    addExpense: string;
    inflow: string;
    inflowSub: string;
    outflow: string;
    outflowSub: string;
    surplus: string;
    surplusSub: string;
    safe: string;
    tight: string;
    deficit: string;
    allFilter: (n: number) => string;
    expensesFilter: (n: number) => string;
    incomeFilter: (n: number) => string;
    investmentsFilter: (n: number) => string;
    searchPlaceholder: string;
    cleanTitle: string;
    cleanSub: string;
    noMatching: string;
    noMatchingSub: string;
    firstAction: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    greeting: (name, hour) => {
      const g = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      return `${g}, ${name}`;
    },
    appTitle: 'Personal Finance Hub',
    appSub: 'Real-time private balance & cashflow intelligence',
    securityBadge: 'Private & Secure',
    tabs: {
      overview: 'Overview',
      msme: 'MSME & Loans',
      budget: 'Insights & Budget',
      goals: (c) => `Goals (${c})`,
      tax: 'Tax Optimizer',
      subs: (c) => `Bills (${c})`,
      ins: (c) => `Insurance (${c})`,
    },
    hero: {
      surplusLabel: 'Available Surplus',
      surplusSub: '(Monthly)',
      savingsRate: (r) => `▲ ${r}% Savings Rate`,
      safeBuffer: (m) => `Available in hand • ${m} months safety buffer`,
      moneyIn: '+ Money In',
      moneyInSub: 'Income',
      moneyOut: '- Money Out',
      moneyOutSub: 'Expense',
    },
    actions: {
      voiceLog: 'Voice Log',
      voiceLogSub: 'Speak to log',
      addEntry: 'Add Entry',
      addEntrySub: 'Quick Record',
      msmeHub: 'MSME Hub',
      msmeHubSub: 'Loans & Schemes',
      passbook: 'Passbook',
      passbookSub: 'Live Ledger',
    },
    bento: {
      monthlyIncome: 'Monthly Income',
      inflowBadge: '▲ Inflow',
      incomeSub: 'Take-home earnings',
      totalOutflow: 'Total Outflow',
      outflowBadge: '▼ Outflow',
      outflowSub: 'Living + Bills + Ins.',
      commitments: 'Active Commitments',
      commitmentsSub: (s, i) => `${s} Bills • ${i} Ins.`,
      tapToInspect: 'Tap to inspect',
      runwayTitle: 'Runway Cushion',
      runwayBadge: 'Guarded',
      runwayMonths: (m) => `${m} Months`,
      runwaySub: 'Zero-income safety',
    },
    spending: {
      title: 'Spending Snapshot',
      viewAll: 'Full Insights',
    },
    aiCard: {
      title: 'DhanMitr AI Copilot',
      badge: 'Active',
      surplusInsight: (surplus, rate, months) =>
        `You have a healthy ₹${surplus} net monthly surplus (${rate}% savings rate). Your runway cushion covers ${months} months.`,
      emptyInsight:
        'Add your income streams and budget caps to track your monthly surplus and automated smart alerts.',
      button: 'Ask DhanMitr AI to optimize surplus',
    },
    renewals: {
      title: 'Upcoming Renewals & Alerts',
      viewAll: 'View All',
      empty: 'No pending alerts found',
      dueIn: (date, days) => `Due: ${date}${days !== undefined ? ` (in ${days}d)` : ''}`,
      urgentBadge: 'URGENT',
    },
    nav: {
      home: 'Home',
      msme: 'MSME',
      passbook: 'Passbook',
      settings: 'Settings',
      voiceAi: 'Talk to AI',
    },
    alerts: {
      title: 'Alerts & Reminders',
      active: (n) => `${n} Active`,
      empty: 'No pending alerts',
    },
    passbookView: {
      title: 'Passbook & Ledger',
      sub: 'Zero-leakage UPI & automated debit tracking',
      entries: (n) => `${n} Entries`,
      addTransaction: 'Add Transaction',
      quickAdd: 'Add',
      addIncome: '+ Money In',
      addExpense: '- Money Out',
      inflow: 'Money In',
      inflowSub: 'Monthly credits & earnings',
      outflow: 'Money Out',
      outflowSub: 'Debits, bills & expenses',
      surplus: 'Monthly Surplus',
      surplusSub: 'Available in hand',
      safe: 'Safe Surplus',
      tight: 'Tight Buffer',
      deficit: 'Deficit Risk',
      allFilter: (n) => `All (${n})`,
      expensesFilter: (n) => `Expenses (${n})`,
      incomeFilter: (n) => `Income (${n})`,
      investmentsFilter: (n) => `Investments (${n})`,
      searchPlaceholder: 'Search title, category, account...',
      cleanTitle: 'Your Ledger is Clean & Ready',
      cleanSub: 'Log your daily UPI expenses, salary credits, or investments to keep a real-time financial overview.',
      noMatching: 'No Matching Transactions',
      noMatchingSub: 'Try changing your search query or filter category to view matching records.',
      firstAction: 'Add First Transaction',
    },
  },
  hi: {
    greeting: (name, hour) => {
      const g = hour < 12 ? 'शुभ प्रभात' : hour < 17 ? 'नमस्ते' : 'शुभ संध्या';
      return `${g}, ${name}`;
    },
    appTitle: 'आपका धन-मित्र',
    appSub: 'दैनिक कमाई, खर्च और बचत का पूरा हिसाब',
    securityBadge: 'सुरक्षित खाता',
    tabs: {
      overview: 'खाता सारांश',
      msme: 'व्यापार व लोन',
      budget: 'खर्च की समझ',
      goals: (c) => `लक्ष्य (${c})`,
      tax: 'टैक्स बचत',
      subs: (c) => `बिल (${c})`,
      ins: (c) => `बीमा (${c})`,
    },
    hero: {
      surplusLabel: 'उपलब्ध बचत',
      surplusSub: '(Monthly Surplus)',
      savingsRate: (r) => `▲ ${r}% बचत दर`,
      safeBuffer: (m) => `हाथ में सुरक्षित राशि • ${m} माह की सुरक्षा`,
      moneyIn: '+ आया',
      moneyInSub: 'कमाई',
      moneyOut: '- गया',
      moneyOutSub: 'खर्च',
    },
    actions: {
      voiceLog: 'बोलकर लिखें',
      voiceLogSub: 'आवाज़ से जोड़ें',
      addEntry: 'नया हिसाब',
      addEntrySub: 'तुरंत दर्ज करें',
      msmeHub: 'व्यापार लोन',
      msmeHubSub: 'सरकारी योजनाएं',
      passbook: 'खाता बही',
      passbookSub: 'लेनदेन देखें',
    },
    bento: {
      monthlyIncome: 'कुल कमाई',
      inflowBadge: '▲ आया',
      incomeSub: 'इस महीने की आमदनी',
      totalOutflow: 'कुल खर्च',
      outflowBadge: '▼ गया',
      outflowSub: 'खर्च + राशन + बिल',
      commitments: 'सक्रिय बिल व बीमा',
      commitmentsSub: (s, i) => `${s} बिल • ${i} बीमा`,
      tapToInspect: 'विवरण देखने के लिए छुएं',
      runwayTitle: 'सुरक्षित फंड',
      runwayBadge: 'सुरक्षित',
      runwayMonths: (m) => `${m} महीने`,
      runwaySub: 'मुश्किल समय की बचत',
    },
    spending: {
      title: 'खर्च का विवरण',
      viewAll: 'पूरा देखें',
    },
    aiCard: {
      title: 'धनMitr AI साथी',
      badge: 'सक्रिय',
      surplusInsight: (surplus, rate, months) =>
        `आपके पास ₹${surplus} की बचत है (${rate}% बचत दर)। आपकी जमा पूंजी ${months} महीने के खर्च के लिए पर्याप्त है।`,
      emptyInsight:
        'अपनी मासिक आय और खर्च जोड़ें ताकि AI आपकी बचत बढ़ाने और सही सलाह देने में मदद कर सके।',
      button: 'AI से बचत बढ़ाने की सलाह लें',
    },
    renewals: {
      title: 'आगामी बिल और अलर्ट',
      viewAll: 'सभी देखें',
      empty: 'कोई लंबित बिल या अलर्ट नहीं है',
      dueIn: (date, days) => `अंतिम तिथि: ${date}${days !== undefined ? ` (${days} दिन शेष)` : ''}`,
      urgentBadge: 'जरूरी',
    },
    nav: {
      home: 'होम',
      msme: 'व्यापार',
      passbook: 'खाता',
      settings: 'सेटिंग्स',
      voiceAi: 'बोलकर बात करें',
    },
    alerts: {
      title: 'अलर्ट और याद दिलाएं',
      active: (n) => `${n} सक्रिय`,
      empty: 'कोई नया अलर्ट नहीं है',
    },
    passbookView: {
      title: 'खाता बही (Passbook)',
      sub: 'दैनिक कमाई, खर्च और बैंक का सच्चा हिसाब',
      entries: (n) => `${n} प्रविष्टियां`,
      addTransaction: 'नया हिसाब जोड़ें',
      quickAdd: 'जोड़ें',
      addIncome: '+ आया (कमाई)',
      addExpense: '- गया (खर्च)',
      inflow: 'आया (कमाई)',
      inflowSub: 'इस महीने की आमदनी',
      outflow: 'गया (खर्च)',
      outflowSub: 'खर्च, राशन व बिल भुगतान',
      surplus: 'उपलब्ध बचत',
      surplusSub: 'हाथ में बची शुद्ध राशि',
      safe: 'सुरक्षित बचत',
      tight: 'कम बचत (सावधान)',
      deficit: 'घाटा (खर्च अधिक)',
      allFilter: (n) => `सभी (${n})`,
      expensesFilter: (n) => `खर्च (${n})`,
      incomeFilter: (n) => `कमाई (${n})`,
      investmentsFilter: (n) => `निवेश (${n})`,
      searchPlaceholder: 'खर्च, खाता या दुकान खोजें...',
      cleanTitle: 'आपकी खाता बही तैयार है',
      cleanSub: 'अपनी दैनिक कमाई, राशन का खर्च, या बैंक लेनदेन दर्ज करें ताकि बचत का सही पता चल सके।',
      noMatching: 'कोई लेनदेन नहीं मिला',
      noMatchingSub: 'खोज शब्द बदलें या दूसरा विकल्प चुनकर देखें।',
      firstAction: 'पहला लेनदेन दर्ज करें',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('hi');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('dhanmitr_language') as Language | null;
      if (savedLang === 'en' || savedLang === 'hi') {
        setLanguageState(savedLang);
      } else {
        // Default to Hindi for rural / Bharat mass market, with easy 1-tap English toggle
        setLanguageState('hi');
      }
    } catch (e) {
      setLanguageState('hi');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('dhanmitr_language', lang);
    } catch (e) {}
  };

  const toggleLanguage = () => {
    const nextLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(nextLang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
