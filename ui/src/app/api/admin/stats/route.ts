import { NextResponse } from 'next/server';
import { verifyAdminRequest, getAdminSupabase } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized' },
      { status: auth.status }
    );
  }

  const supabase = getAdminSupabase();

  try {
    // 1. Fetch profiles
    const { data: profiles, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profileErr) {
      console.warn('Error fetching profiles in admin stats:', profileErr.message);
    }

    const allProfiles = profiles || [];
    const totalUsers = allProfiles.length;
    const onboardedUsers = allProfiles.filter(p => p.is_onboarded).length;
    const guestOrPendingUsers = totalUsers - onboardedUsers;

    // 2. Fetch all collections in parallel for detailed metrics
    const [
      subscriptionsRes,
      insurancesRes,
      budgetItemsRes,
      incomeSourcesRes,
      transactionsRes,
      auditLogsRes,
      adminUsersRes,
    ] = await Promise.all([
      supabase.from('subscriptions').select('*'),
      supabase.from('insurances').select('*'),
      supabase.from('budget_items').select('*'),
      supabase.from('income_sources').select('*'),
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(6),
      supabase.from('admin_users').select('*'),
    ]);

    const subscriptions = subscriptionsRes.data || [];
    const insurances = insurancesRes.data || [];
    const budgetItems = budgetItemsRes.data || [];
    const incomeSources = incomeSourcesRes.data || [];
    const transactions = transactionsRes.data || [];
    const adminUsers = adminUsersRes.data || [];

    const activeSubscriptions = subscriptions.filter(s => s.is_active);
    const activeInsurances = insurances.filter(i => i.is_active);

    // Calculate distributions
    const riskDistribution = {
      conservative: allProfiles.filter(p => p.risk_tolerance === 'conservative').length,
      moderate: allProfiles.filter(p => p.risk_tolerance === 'moderate').length,
      aggressive: allProfiles.filter(p => p.risk_tolerance === 'aggressive').length,
    };

    const employmentDistribution = {
      salaried: allProfiles.filter(p => p.employment_type === 'salaried').length,
      self_employed: allProfiles.filter(p => p.employment_type === 'self_employed').length,
      freelancer: allProfiles.filter(p => p.employment_type === 'freelancer').length,
      student: allProfiles.filter(p => p.employment_type === 'student').length,
      retired: allProfiles.filter(p => p.employment_type === 'retired').length,
    };

    const taxRegimeDistribution = {
      new: allProfiles.filter(p => p.tax_regime === 'new').length,
      old: allProfiles.filter(p => p.tax_regime === 'old').length,
      not_applicable: allProfiles.filter(p => p.tax_regime === 'not_applicable').length,
    };

    // Monthly recurring spend volume
    const estimatedMonthlyRecurringTracked = activeSubscriptions.reduce((acc, sub) => {
      const amt = Number(sub.amount) || 0;
      if (sub.billing_cycle === 'yearly') return acc + (amt / 12);
      if (sub.billing_cycle === 'quarterly') return acc + (amt / 3);
      return acc + amt;
    }, 0);

    // Total Insurance Coverage & Premium Volume
    const totalInsuranceCoverage = activeInsurances.reduce((acc, ins) => acc + (Number(ins.coverage_amount) || 0), 0);
    const totalAnnualizedPremiums = activeInsurances.reduce((acc, ins) => {
      const prem = Number(ins.premium_amount) || 0;
      if (ins.premium_frequency === 'monthly') return acc + (prem * 12);
      if (ins.premium_frequency === 'quarterly') return acc + (prem * 4);
      return acc + prem;
    }, 0);

    // Subscriptions Provider Breakdown
    const providerCounts: Record<string, number> = {};
    for (const s of subscriptions) {
      const key = s.provider || s.logo_key || 'Other';
      providerCounts[key] = (providerCounts[key] || 0) + 1;
    }
    const topProviders = Object.entries(providerCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Insurance Type Breakdown
    const insuranceTypeCounts: Record<string, number> = {};
    for (const ins of insurances) {
      const type = ins.policy_type || 'other';
      insuranceTypeCounts[type] = (insuranceTypeCounts[type] || 0) + 1;
    }

    // Transaction Volumes
    let totalIncomeRecorded = 0;
    let totalExpenseRecorded = 0;
    let totalInvestmentRecorded = 0;

    for (const t of transactions) {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') totalIncomeRecorded += amt;
      else if (t.type === 'expense') totalExpenseRecorded += amt;
      else if (t.type === 'investment') totalInvestmentRecorded += amt;
    }

    // Category-wise budget allocation
    const budgetCategoryMap: Record<string, { allocated: number; spent: number }> = {};
    for (const b of budgetItems) {
      const cat = b.category || 'Other';
      if (!budgetCategoryMap[cat]) {
        budgetCategoryMap[cat] = { allocated: 0, spent: 0 };
      }
      budgetCategoryMap[cat].allocated += Number(b.allocated || 0);
      budgetCategoryMap[cat].spent += Number(b.spent || 0);
    }
    const budgetAllocations = Object.entries(budgetCategoryMap).map(([category, vals]) => ({
      category,
      allocated: vals.allocated,
      spent: vals.spent,
    })).slice(0, 6);

    // Table Counts Matrix
    const tableCounts = {
      profiles: totalUsers,
      subscriptions: subscriptions.length,
      insurances: insurances.length,
      budget_items: budgetItems.length,
      income_sources: incomeSources.length,
      transactions: transactions.length,
      admin_users: adminUsers.length,
      admin_audit_logs: auditLogsRes.data?.length || 0,
    };

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        onboardedUsers,
        guestOrPendingUsers,
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: activeSubscriptions.length,
        totalInsurances: insurances.length,
        activeInsurances: activeInsurances.length,
        totalBudgetItems: budgetItems.length,
        totalIncomeSources: incomeSources.length,
        totalTransactions: transactions.length,
        totalAdmins: adminUsers.length,
        estimatedMonthlyRecurringTracked: Math.round(estimatedMonthlyRecurringTracked),
        totalInsuranceCoverage: Math.round(totalInsuranceCoverage),
        totalAnnualizedPremiums: Math.round(totalAnnualizedPremiums),
        totalIncomeRecorded: Math.round(totalIncomeRecorded),
        totalExpenseRecorded: Math.round(totalExpenseRecorded),
        totalInvestmentRecorded: Math.round(totalInvestmentRecorded),
        riskDistribution,
        employmentDistribution,
        taxRegimeDistribution,
        topProviders,
        insuranceTypeCounts,
        budgetAllocations,
        tableCounts,
      },
      recentUsers: allProfiles.slice(0, 6),
      recentAuditLogs: auditLogsRes.data || [],
      recentTransactions: transactions.slice(0, 6),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error generating admin stats:', err);
    return NextResponse.json(
      { error: 'Failed to compute administrative statistics', details: err.message },
      { status: 500 }
    );
  }
}
