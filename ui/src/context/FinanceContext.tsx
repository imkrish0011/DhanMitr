'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserFinancialProfile,
  SpendingCategorySummary,
  Subscription,
  Insurance,
  BudgetItem,
  IncomeSource,
  MonthlyCashFlowPoint,
  Transaction,
  FinanceSubTab,
} from '@/types';
import {
  initialProfile,
  initialSpendingCategories,
  initialCashFlowTrend,
  initialSubscriptions,
  initialInsurances,
  initialBudgetItems,
  initialIncomeSources,
  initialTransactions,
} from '@/data/mockData';

interface FinanceContextType {
  profile: UserFinancialProfile;
  spendingCategories: SpendingCategorySummary[];
  cashFlowTrend: MonthlyCashFlowPoint[];
  subscriptions: Subscription[];
  insurances: Insurance[];
  budgetItems: BudgetItem[];
  incomeSources: IncomeSource[];
  transactions: Transaction[];
  activeSubTab: FinanceSubTab;
  setActiveSubTab: (tab: FinanceSubTab) => void;
  isSyncing: boolean;
  syncData: () => Promise<void>;
  
  // KPI Metrics
  totalIncome: number;
  totalOutflow: number;
  netSurplus: number;
  savingsRate: number;
  activeSubscriptionsCount: number;
  activeInsurancesCount: number;
  
  // CRUD Actions
  addSubscription: (sub: Omit<Subscription, 'id' | 'days_remaining'>) => void;
  updateSubscription: (id: string, sub: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  toggleSubscriptionActive: (id: string) => void;
  
  addInsurance: (ins: Omit<Insurance, 'id' | 'days_remaining'>) => void;
  updateInsurance: (id: string, ins: Partial<Insurance>) => void;
  deleteInsurance: (id: string) => void;
  toggleInsuranceActive: (id: string) => void;
  
  addIncomeSource: (income: Omit<IncomeSource, 'id'>) => void;
  updateIncomeSource: (id: string, income: Partial<IncomeSource>) => void;
  deleteIncomeSource: (id: string) => void;
  
  addBudgetItem: (budget: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (id: string, budget: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;

  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  
  resetToDefaults: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserFinancialProfile>(initialProfile);
  const [spendingCategories, setSpendingCategories] = useState<SpendingCategorySummary[]>(initialSpendingCategories);
  const [cashFlowTrend, setCashFlowTrend] = useState<MonthlyCashFlowPoint[]>(initialCashFlowTrend);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [insurances, setInsurances] = useState<Insurance[]>(initialInsurances);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(initialBudgetItems);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>(initialIncomeSources);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [activeSubTab, setActiveSubTab] = useState<FinanceSubTab>('overview');
  const [isSyncing, setIsSyncing] = useState(false);

  // Load from LocalStorage if available
  useEffect(() => {
    try {
      const savedSubs = localStorage.getItem('dhanmitr_subs');
      if (savedSubs) setSubscriptions(JSON.parse(savedSubs));

      const savedIns = localStorage.getItem('dhanmitr_ins');
      if (savedIns) setInsurances(JSON.parse(savedIns));

      const savedBudget = localStorage.getItem('dhanmitr_budget');
      if (savedBudget) setBudgetItems(JSON.parse(savedBudget));

      const savedIncome = localStorage.getItem('dhanmitr_income');
      if (savedIncome) setIncomeSources(JSON.parse(savedIncome));

      const savedTx = localStorage.getItem('dhanmitr_tx');
      if (savedTx) setTransactions(JSON.parse(savedTx));
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }, []);

  // Save to LocalStorage on updates
  useEffect(() => {
    try {
      localStorage.setItem('dhanmitr_subs', JSON.stringify(subscriptions));
      localStorage.setItem('dhanmitr_ins', JSON.stringify(insurances));
      localStorage.setItem('dhanmitr_budget', JSON.stringify(budgetItems));
      localStorage.setItem('dhanmitr_income', JSON.stringify(incomeSources));
      localStorage.setItem('dhanmitr_tx', JSON.stringify(transactions));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [subscriptions, insurances, budgetItems, incomeSources, transactions]);

  // Dynamic KPI Calculations
  const totalIncome = useMemo(() => {
    const totalFromSources = incomeSources.reduce((sum, item) => sum + item.amount, 0);
    return totalFromSources > 0 ? totalFromSources : profile.monthly_income;
  }, [incomeSources, profile.monthly_income]);

  const totalOutflow = useMemo(() => {
    // Total spent across spending categories or budget
    const totalSpent = spendingCategories.reduce((sum, item) => sum + item.amount, 0);
    return totalSpent > 0 ? totalSpent : profile.monthly_expenses;
  }, [spendingCategories, profile.monthly_expenses]);

  const netSurplus = useMemo(() => {
    return Math.max(0, totalIncome - totalOutflow);
  }, [totalIncome, totalOutflow]);

  const savingsRate = useMemo(() => {
    if (totalIncome <= 0) return 0;
    return Math.round((netSurplus / totalIncome) * 100);
  }, [netSurplus, totalIncome]);

  const activeSubscriptionsCount = useMemo(() => {
    return subscriptions.filter((s) => s.is_active).length;
  }, [subscriptions]);

  const activeInsurancesCount = useMemo(() => {
    return insurances.filter((i) => i.is_active).length;
  }, [insurances]);

  // Synchronize Simulation
  const syncData = async () => {
    setIsSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSyncing(false);
  };

  // Subscriptions CRUD
  const addSubscription = (sub: Omit<Subscription, 'id' | 'days_remaining'>) => {
    const newSub: Subscription = {
      ...sub,
      id: `sub_${Date.now()}`,
      days_remaining: 30,
    };
    setSubscriptions((prev) => [newSub, ...prev]);

    // Recalculate Subscriptions category in spending overview
    const subCost = sub.billing_cycle === 'monthly' ? sub.amount : Math.round(sub.amount / 12);
    setSpendingCategories((prev) => {
      const updated = prev.map((cat) =>
        cat.categoryKey === 'subscriptions' ? { ...cat, amount: cat.amount + subCost } : cat
      );
      const newTotal = updated.reduce((s, c) => s + c.amount, 0);
      return updated.map((cat) => ({
        ...cat,
        percentage: Number(((cat.amount / newTotal) * 100).toFixed(1)),
      }));
    });
  };

  const updateSubscription = (id: string, updated: Partial<Subscription>) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleSubscriptionActive = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s))
    );
  };

  // Insurance CRUD
  const addInsurance = (ins: Omit<Insurance, 'id' | 'days_remaining'>) => {
    const newIns: Insurance = {
      ...ins,
      id: `ins_${Date.now()}`,
      days_remaining: 30,
    };
    setInsurances((prev) => [newIns, ...prev]);

    const insCost =
      ins.premium_frequency === 'monthly'
        ? ins.premium_amount
        : Math.round(ins.premium_amount / 12);
    setSpendingCategories((prev) => {
      const updated = prev.map((cat) =>
        cat.categoryKey === 'insurance' ? { ...cat, amount: cat.amount + insCost } : cat
      );
      const newTotal = updated.reduce((s, c) => s + c.amount, 0);
      return updated.map((cat) => ({
        ...cat,
        percentage: Number(((cat.amount / newTotal) * 100).toFixed(1)),
      }));
    });
  };

  const updateInsurance = (id: string, updated: Partial<Insurance>) => {
    setInsurances((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));
  };

  const deleteInsurance = (id: string) => {
    setInsurances((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleInsuranceActive = (id: string) => {
    setInsurances((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_active: !i.is_active } : i))
    );
  };

  // Income Sources CRUD
  const addIncomeSource = (income: Omit<IncomeSource, 'id'>) => {
    const newInc: IncomeSource = {
      ...income,
      id: `inc_${Date.now()}`,
    };
    setIncomeSources((prev) => [newInc, ...prev]);
  };

  const updateIncomeSource = (id: string, updated: Partial<IncomeSource>) => {
    setIncomeSources((prev) => prev.map((inc) => (inc.id === id ? { ...inc, ...updated } : inc)));
  };

  const deleteIncomeSource = (id: string) => {
    setIncomeSources((prev) => prev.filter((i) => i.id !== id));
  };

  // Budget Items CRUD
  const addBudgetItem = (budget: Omit<BudgetItem, 'id'>) => {
    const newBudget: BudgetItem = {
      ...budget,
      id: `b_${Date.now()}`,
    };
    setBudgetItems((prev) => [...prev, newBudget]);
  };

  const updateBudgetItem = (id: string, updated: Partial<BudgetItem>) => {
    setBudgetItems((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  };

  const deleteBudgetItem = (id: string) => {
    setBudgetItems((prev) => prev.filter((b) => b.id !== id));
  };

  // Transactions CRUD
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const resetToDefaults = () => {
    setProfile(initialProfile);
    setSpendingCategories(initialSpendingCategories);
    setCashFlowTrend(initialCashFlowTrend);
    setSubscriptions(initialSubscriptions);
    setInsurances(initialInsurances);
    setBudgetItems(initialBudgetItems);
    setIncomeSources(initialIncomeSources);
    setTransactions(initialTransactions);
    localStorage.clear();
  };

  return (
    <FinanceContext.Provider
      value={{
        profile,
        spendingCategories,
        cashFlowTrend,
        subscriptions,
        insurances,
        budgetItems,
        incomeSources,
        transactions,
        activeSubTab,
        setActiveSubTab,
        isSyncing,
        syncData,
        totalIncome,
        totalOutflow,
        netSurplus,
        savingsRate,
        activeSubscriptionsCount,
        activeInsurancesCount,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        toggleSubscriptionActive,
        addInsurance,
        updateInsurance,
        deleteInsurance,
        toggleInsuranceActive,
        addIncomeSource,
        updateIncomeSource,
        deleteIncomeSource,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        addTransaction,
        deleteTransaction,
        resetToDefaults,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
