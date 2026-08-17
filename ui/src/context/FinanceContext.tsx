'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
  emptyProfile,
  defaultSpendingCategories,
  emptySubscriptions,
  emptyInsurances,
  emptyBudgetItems,
  emptyIncomeSources,
  emptyTransactions,
} from '@/data/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from './AuthContext';

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
  addSubscription: (sub: Omit<Subscription, 'id' | 'days_remaining'>) => Promise<void>;
  updateSubscription: (id: string, sub: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  toggleSubscriptionActive: (id: string) => Promise<void>;
  
  addInsurance: (ins: Omit<Insurance, 'id' | 'days_remaining'>) => Promise<void>;
  updateInsurance: (id: string, ins: Partial<Insurance>) => Promise<void>;
  deleteInsurance: (id: string) => Promise<void>;
  toggleInsuranceActive: (id: string) => Promise<void>;
  
  addIncomeSource: (income: Omit<IncomeSource, 'id'>) => Promise<void>;
  updateIncomeSource: (id: string, income: Partial<IncomeSource>) => Promise<void>;
  deleteIncomeSource: (id: string) => Promise<void>;
  
  addBudgetItem: (budget: Omit<BudgetItem, 'id'>) => Promise<void>;
  updateBudgetItem: (id: string, budget: Partial<BudgetItem>) => Promise<void>;
  deleteBudgetItem: (id: string) => Promise<void>;

  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  resetToDefaults: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile: authProfile } = useAuth();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(emptySubscriptions);
  const [insurances, setInsurances] = useState<Insurance[]>(emptyInsurances);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(emptyBudgetItems);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>(emptyIncomeSources);
  const [transactions, setTransactions] = useState<Transaction[]>(emptyTransactions);
  const [activeSubTab, setActiveSubTab] = useState<FinanceSubTab>('overview');
  const [isSyncing, setIsSyncing] = useState(false);

  const profile: UserFinancialProfile = useMemo(() => {
    return authProfile || emptyProfile;
  }, [authProfile]);

  // Load from Supabase when user logs in
  const fetchSupabaseData = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;
    setIsSyncing(true);

    try {
      // 1. Fetch Subscriptions
      const { data: subsData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (subsData) {
        setSubscriptions(
          subsData.map((s: any) => ({
            id: s.id,
            name: s.name,
            provider: s.provider || s.name,
            logoKey: s.logo_key || 'other',
            planName: s.plan_name || 'Standard Plan',
            amount: Number(s.amount || 0),
            currency: (s.currency as any) || 'INR',
            billing_cycle: (s.billing_cycle as any) || 'monthly',
            category: s.category || 'Entertainment',
            next_renewal_date: s.next_renewal_date || '28 days',
            days_remaining: 30,
            is_urgent: false,
            is_active: s.is_active ?? true,
          }))
        );
      }

      // 2. Fetch Insurances
      const { data: insData } = await supabase
        .from('insurances')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (insData) {
        setInsurances(
          insData.map((i: any) => ({
            id: i.id,
            policy_name: i.policy_name,
            provider: i.provider || 'Insurance Provider',
            logoKey: i.logo_key || 'other',
            policy_type: (i.policy_type as any) || 'term_life',
            policy_number: i.policy_number || 'POL-000',
            coverage_amount: Number(i.coverage_amount || 0),
            premium_amount: Number(i.premium_amount || 0),
            premium_frequency: (i.premium_frequency as any) || 'yearly',
            renewal_date: i.renewal_date || 'Next Year',
            days_remaining: 60,
            is_urgent: false,
            is_active: i.is_active ?? true,
          }))
        );
      }

      // 3. Fetch Income Sources
      const { data: incData } = await supabase
        .from('income_sources')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (incData) {
        setIncomeSources(
          incData.map((inc: any) => ({
            id: inc.id,
            title: inc.title,
            amount: Number(inc.amount || 0),
            frequency: (inc.frequency as any) || 'monthly',
            category: (inc.category as any) || 'salary',
            date: inc.date || 'Monthly',
          }))
        );
      }

      // 4. Fetch Budget Items
      const { data: budgetData } = await supabase
        .from('budget_items')
        .select('*')
        .eq('user_id', userId);

      if (budgetData) {
        setBudgetItems(
          budgetData.map((b: any) => ({
            id: b.id,
            category: b.category,
            categoryKey: b.category_key,
            allocated: Number(b.allocated || 0),
            spent: Number(b.spent || 0),
            color: b.color || '#34D399',
          }))
        );
      }

      // 5. Fetch Transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (txData) {
        setTransactions(
          txData.map((tx: any) => ({
            id: tx.id,
            title: tx.title,
            amount: Number(tx.amount || 0),
            currency: (tx.currency as any) || 'INR',
            type: (tx.type as any) || 'expense',
            category: (tx.category as any) || 'other',
            date: tx.date || 'Today',
            account_name: tx.account_name || 'Primary Account',
            is_recurring: tx.is_recurring || false,
            note: tx.note,
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching user data from Supabase:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchSupabaseData(user.id);
    } else {
      // Clear data when logged out
      setSubscriptions(emptySubscriptions);
      setInsurances(emptyInsurances);
      setBudgetItems(emptyBudgetItems);
      setIncomeSources(emptyIncomeSources);
      setTransactions(emptyTransactions);
    }
  }, [user?.id, fetchSupabaseData]);

  // Synchronize Simulation / Refresh
  const syncData = async () => {
    if (user?.id && isSupabaseConfigured) {
      await fetchSupabaseData(user.id);
    } else {
      setIsSyncing(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsSyncing(false);
    }
  };

  // Dynamic KPI Calculations based on real user data
  const totalIncome = useMemo(() => {
    const totalFromSources = incomeSources.reduce((sum, item) => sum + item.amount, 0);
    return totalFromSources > 0 ? totalFromSources : (profile.monthly_income || 0);
  }, [incomeSources, profile.monthly_income]);

  // Dynamic spending categories computed from subscriptions, insurances, and budget/transactions
  const spendingCategories = useMemo<SpendingCategorySummary[]>(() => {
    const subTotal = subscriptions
      .filter((s) => s.is_active)
      .reduce((sum, s) => sum + (s.billing_cycle === 'monthly' ? s.amount : Math.round(s.amount / 12)), 0);

    const insTotal = insurances
      .filter((i) => i.is_active)
      .reduce((sum, i) => sum + (i.premium_frequency === 'monthly' ? i.premium_amount : Math.round(i.premium_amount / 12)), 0);

    // Sum from transactions
    const categoryTotals: Record<string, number> = {
      housing: 0,
      investments: 0,
      utilities: 0,
      subscriptions: subTotal,
      insurance: insTotal,
      other: 0,
    };

    transactions
      .filter((t) => t.type === 'expense' || t.type === 'investment')
      .forEach((t) => {
        const cat = t.category;
        if (cat in categoryTotals) {
          categoryTotals[cat] += t.amount;
        } else {
          categoryTotals.other += t.amount;
        }
      });

    // If budget items exist, incorporate allocated/spent
    budgetItems.forEach((b) => {
      if (b.categoryKey in categoryTotals && categoryTotals[b.categoryKey] === 0) {
        categoryTotals[b.categoryKey] = b.spent;
      }
    });

    const grandTotal = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    if (grandTotal === 0 && profile.monthly_expenses > 0) {
      return [
        { id: 'cat_est', category: 'Estimated Expenses', categoryKey: 'other', amount: profile.monthly_expenses, percentage: 100, color: '#34D399' },
      ];
    }

    if (grandTotal === 0) {
      return defaultSpendingCategories;
    }

    return defaultSpendingCategories.map((cat) => {
      const amount = categoryTotals[cat.categoryKey] || 0;
      const percentage = grandTotal > 0 ? Number(((amount / grandTotal) * 100).toFixed(1)) : 0;
      return {
        ...cat,
        amount,
        percentage,
      };
    });
  }, [subscriptions, insurances, transactions, budgetItems, profile.monthly_expenses]);

  const totalOutflow = useMemo(() => {
    const calculatedOutflow = spendingCategories.reduce((sum, item) => sum + item.amount, 0);
    if (calculatedOutflow > 0) return calculatedOutflow;
    return profile.monthly_expenses || 0;
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

  // Cash flow trend derived from actual numbers
  const cashFlowTrend = useMemo<MonthlyCashFlowPoint[]>(() => {
    if (totalIncome === 0 && totalOutflow === 0) {
      return [];
    }
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    return [
      { month: 'Last Month', income: totalIncome, expense: totalOutflow, surplus: netSurplus },
      { month: currentMonth, income: totalIncome, expense: totalOutflow, surplus: netSurplus },
    ];
  }, [totalIncome, totalOutflow, netSurplus]);

  // Subscriptions CRUD with Supabase
  const addSubscription = async (sub: Omit<Subscription, 'id' | 'days_remaining'>) => {
    const tempId = `sub_${Date.now()}`;
    const newSub: Subscription = {
      ...sub,
      id: tempId,
      days_remaining: 30,
    };
    setSubscriptions((prev) => [newSub, ...prev]);

    if (user?.id && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .insert([
            {
              user_id: user.id,
              name: sub.name,
              provider: sub.provider,
              logo_key: sub.logoKey,
              plan_name: sub.planName,
              amount: sub.amount,
              currency: sub.currency,
              billing_cycle: sub.billing_cycle,
              category: sub.category,
              next_renewal_date: sub.next_renewal_date,
              is_active: sub.is_active,
            },
          ])
          .select()
          .single();

        if (data) {
          setSubscriptions((prev) => prev.map((s) => (s.id === tempId ? { ...s, id: data.id } : s)));
        }
      } catch (err) {
        console.error('Error adding subscription to Supabase:', err);
      }
    }
  };

  const updateSubscription = async (id: string, updated: Partial<Subscription>) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));

    if (user?.id && isSupabaseConfigured) {
      try {
        await supabase
          .from('subscriptions')
          .update({
            ...(updated.name && { name: updated.name }),
            ...(updated.provider && { provider: updated.provider }),
            ...(updated.logoKey && { logo_key: updated.logoKey }),
            ...(updated.amount !== undefined && { amount: updated.amount }),
            ...(updated.billing_cycle && { billing_cycle: updated.billing_cycle }),
            ...(updated.category && { category: updated.category }),
            ...(updated.next_renewal_date && { next_renewal_date: updated.next_renewal_date }),
            ...(updated.is_active !== undefined && { is_active: updated.is_active }),
          })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Error updating subscription in Supabase:', err);
      }
    }
  };

  const deleteSubscription = async (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));

    if (user?.id && isSupabaseConfigured) {
      try {
        await supabase.from('subscriptions').delete().eq('id', id).eq('user_id', user.id);
      } catch (err) {
        console.error('Error deleting subscription from Supabase:', err);
      }
    }
  };

  const toggleSubscriptionActive = async (id: string) => {
    const item = subscriptions.find((s) => s.id === id);
    if (!item) return;
    const newStatus = !item.is_active;

    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: newStatus } : s))
    );

    if (user?.id && isSupabaseConfigured) {
      try {
        await supabase
          .from('subscriptions')
          .update({ is_active: newStatus })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Error toggling subscription status in Supabase:', err);
      }
    }
  };

  // Insurance CRUD with Supabase
  const addInsurance = async (ins: Omit<Insurance, 'id' | 'days_remaining'>) => {
    const tempId = `ins_${Date.now()}`;
    const newIns: Insurance = {
      ...ins,
      id: tempId,
      days_remaining: 30,
    };
    setInsurances((prev) => [newIns, ...prev]);

    if (user?.id && isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('insurances')
          .insert([
            {
              user_id: user.id,
              policy_name: ins.policy_name,
              provider: ins.provider,
              logo_key: ins.logoKey,
              policy_type: ins.policy_type,
              policy_number: ins.policy_number,
              coverage_amount: ins.coverage_amount,
              premium_amount: ins.premium_amount,
              premium_frequency: ins.premium_frequency,
              renewal_date: ins.renewal_date,
              is_active: ins.is_active,
            },
          ])
          .select()
          .single();

        if (data) {
          setInsurances((prev) => prev.map((i) => (i.id === tempId ? { ...i, id: data.id } : i)));
        }
      } catch (err) {
        console.error('Error adding insurance to Supabase:', err);
      }
    }
  };

  const updateInsurance = async (id: string, updated: Partial<Insurance>) => {
    setInsurances((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));

    if (user?.id && isSupabaseConfigured) {
      try {
        await supabase
          .from('insurances')
          .update({
            ...(updated.policy_name && { policy_name: updated.policy_name }),
            ...(updated.provider && { provider: updated.provider }),
            ...(updated.coverage_amount !== undefined && { coverage_amount: updated.coverage_amount }),
            ...(updated.premium_amount !== undefined && { premium_amount: updated.premium_amount }),
            ...(updated.premium_frequency && { premium_frequency: updated.premium_frequency }),
            ...(updated.policy_type && { policy_type: updated.policy_type }),
            ...(updated.renewal_date && { renewal_date: updated.renewal_date }),
            ...(updated.is_active !== undefined && { is_active: updated.is_active }),
          })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Error updating insurance in Supabase:', err);
      }
    }
  };

  const deleteInsurance = async (id: string) => {
    setInsurances((prev) => prev.filter((i) => i.id !== id));

    if (user?.id && isSupabaseConfigured) {
      try {
        await supabase.from('insurances').delete().eq('id', id).eq('user_id', user.id);
      } catch (err) {
        console.error('Error deleting insurance from Supabase:', err);
      }
    }
  };

  const toggleInsuranceActive = async (id: string) => {
    const item = insurances.find((i) => i.id === id);
    if (!item) return;
    const newStatus = !item.is_active;

    setInsurances((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_active: newStatus } : i))
    );

    if (user?.id && isSupabaseConfigured) {
      try {
        await supabase
          .from('insurances')
          .update({ is_active: newStatus })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Error toggling insurance in Supabase:', err);
      }
    }
  };

  // Income Sources CRUD with Supabase
  const addIncomeSource = async (income: Omit<IncomeSource, 'id'>) => {
    const tempId = `inc_${Date.now()}`;
    const newInc: IncomeSource = {
      ...income,
      id: tempId,
    };
    setIncomeSources((prev) => [newInc, ...prev]);

    if (user?.id && isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('income_sources')
          .insert([
            {
              user_id: user.id,
              title: income.title,
              amount: income.amount,
              frequency: income.frequency,
              category: income.category,
              date: income.date,
            },
          ])
          .select()
          .single();

        if (data) {
          setIncomeSources((prev) => prev.map((i) => (i.id === tempId ? { ...i, id: data.id } : i)));
        }
      } catch (err) {
        console.error('Error adding income source to Supabase:', err);
      }
    }
  };

  const updateIncomeSource = async (id: string, updated: Partial<IncomeSource>) => {
    setIncomeSources((prev) => prev.map((inc) => (inc.id === id ? { ...inc, ...updated } : inc)));

    if (user?.id && isSupabaseConfigured) {
      try {
        await supabase
          .from('income_sources')
          .update({
            ...(updated.title && { title: updated.title }),
            ...(updated.amount !== undefined && { amount: updated.amount }),
            ...(updated.frequency && { frequency: updated.frequency }),
            ...(updated.date && { date: updated.date }),
          })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Error updating income in Supabase:', err);
      }
    }
  };

  const deleteIncomeSource = async (id: string) => {
    setIncomeSources((prev) => prev.filter((i) => i.id !== id));

    if (user?.id && isSupabaseConfigured) {
      try {
        await supabase.from('income_sources').delete().eq('id', id).eq('user_id', user.id);
      } catch (err) {
        console.error('Error deleting income source from Supabase:', err);
      }
    }
  };

  // Budget Items CRUD with Supabase
  const addBudgetItem = async (budget: Omit<BudgetItem, 'id'>) => {
    const tempId = `b_${Date.now()}`;
    const newBudget: BudgetItem = {
      ...budget,
      id: tempId,
    };
    setBudgetItems((prev) => [...prev, newBudget]);

    if (user?.id && isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('budget_items')
          .insert([
            {
              user_id: user.id,
              category: budget.category,
              category_key: budget.categoryKey,
              allocated: budget.allocated,
              spent: budget.spent,
              color: budget.color,
            },
          ])
          .select()
          .single();

        if (data) {
          setBudgetItems((prev) => prev.map((b) => (b.id === tempId ? { ...b, id: data.id } : b)));
        }
      } catch (err) {
        console.error('Error adding budget item to Supabase:', err);
      }
    }
  };

  const updateBudgetItem = async (id: string, updated: Partial<BudgetItem>) => {
    setBudgetItems((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));

    if (user?.id && isSupabaseConfigured) {
      try {
        await supabase
          .from('budget_items')
          .update({
            ...(updated.allocated !== undefined && { allocated: updated.allocated }),
            ...(updated.spent !== undefined && { spent: updated.spent }),
          })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Error updating budget item in Supabase:', err);
      }
    }
  };

  const deleteBudgetItem = async (id: string) => {
    setBudgetItems((prev) => prev.filter((b) => b.id !== id));

    if (user?.id && isSupabaseConfigured) {
      try {
        await supabase.from('budget_items').delete().eq('id', id).eq('user_id', user.id);
      } catch (err) {
        console.error('Error deleting budget item from Supabase:', err);
      }
    }
  };

  // Transactions CRUD with Supabase
  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const tempId = `tx_${Date.now()}`;
    const newTx: Transaction = {
      ...tx,
      id: tempId,
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (user?.id && isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('transactions')
          .insert([
            {
              user_id: user.id,
              title: tx.title,
              amount: tx.amount,
              currency: tx.currency,
              type: tx.type,
              category: tx.category,
              date: tx.date,
              account_name: tx.account_name,
              is_recurring: tx.is_recurring,
              note: tx.note,
            },
          ])
          .select()
          .single();

        if (data) {
          setTransactions((prev) => prev.map((t) => (t.id === tempId ? { ...t, id: data.id } : t)));
        }
      } catch (err) {
        console.error('Error adding transaction to Supabase:', err);
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (user?.id && isSupabaseConfigured) {
      try {
        await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id);
      } catch (err) {
        console.error('Error deleting transaction from Supabase:', err);
      }
    }
  };

  const resetToDefaults = () => {
    setSubscriptions(emptySubscriptions);
    setInsurances(emptyInsurances);
    setBudgetItems(emptyBudgetItems);
    setIncomeSources(emptyIncomeSources);
    setTransactions(emptyTransactions);
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
