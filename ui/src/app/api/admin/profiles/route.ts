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
    const [profilesRes, incomeRes, subsRes, insRes, txRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('income_sources').select('*'),
      supabase.from('subscriptions').select('*'),
      supabase.from('insurances').select('*'),
      supabase.from('transactions').select('*'),
    ]);

    if (profilesRes.error) throw profilesRes.error;

    const list = profilesRes.data || [];

    // Precompute income, expenses, investments maps
    const incomeMap = new Map<string, number>();
    for (const inc of incomeRes.data || []) {
      const amt = Number(inc.amount || 0);
      let monthly = amt;
      if (inc.frequency === 'yearly') monthly = amt / 12;
      else if (inc.frequency === 'weekly') monthly = amt * 4.33;
      incomeMap.set(inc.user_id, (incomeMap.get(inc.user_id) || 0) + monthly);
    }

    const expensesMap = new Map<string, number>();
    for (const sub of subsRes.data || []) {
      if (sub.is_active !== false) {
        const amt = Number(sub.amount || 0);
        let monthly = amt;
        if (sub.billing_cycle === 'yearly') monthly = amt / 12;
        else if (sub.billing_cycle === 'quarterly') monthly = amt / 3;
        else if (sub.billing_cycle === 'weekly') monthly = amt * 4.33;
        expensesMap.set(sub.user_id, (expensesMap.get(sub.user_id) || 0) + monthly);
      }
    }
    for (const ins of insRes.data || []) {
      if (ins.is_active !== false) {
        const prem = Number(ins.premium_amount || 0);
        let monthly = prem / 12;
        if (ins.premium_frequency === 'monthly') monthly = prem;
        else if (ins.premium_frequency === 'quarterly') monthly = prem / 3;
        expensesMap.set(ins.user_id, (expensesMap.get(ins.user_id) || 0) + monthly);
      }
    }

    const investmentsMap = new Map<string, number>();
    for (const t of txRes.data || []) {
      if (t.type === 'investment' || t.category === 'investments') {
        investmentsMap.set(t.user_id, (investmentsMap.get(t.user_id) || 0) + Number(t.amount || 0));
      }
    }

    // Anonymized aggregations for financial analytics
    const totalUsers = list.length;
    const currenciesCount: Record<string, number> = {};
    const riskCount: Record<string, number> = {};
    const employmentCount: Record<string, number> = {};
    const taxRegimeCount: Record<string, number> = {};

    let totalMonthlyIncome = 0;
    let totalMonthlyExpenses = 0;
    let totalInvestments = 0;
    let totalEmergencyFunds = 0;

    const enrichedProfiles = list.map(p => {
      const cur = p.currency || 'INR';
      currenciesCount[cur] = (currenciesCount[cur] || 0) + 1;

      const risk = p.risk_tolerance || 'moderate';
      riskCount[risk] = (riskCount[risk] || 0) + 1;

      const emp = p.employment_type || 'salaried';
      employmentCount[emp] = (employmentCount[emp] || 0) + 1;

      const tax = p.tax_regime || 'new';
      taxRegimeCount[tax] = (taxRegimeCount[tax] || 0) + 1;

      const inc = incomeMap.get(p.id) || 0;
      const finalInc = inc > 0 ? Math.round(inc) : Number(p.monthly_income || 0);

      const exp = expensesMap.get(p.id) || 0;
      const finalExp = Math.max(Number(p.monthly_expenses || 0), Math.round(exp));

      const inv = investmentsMap.get(p.id) || 0;
      const finalInv = Math.max(Number(p.total_investments || 0), Math.round(inv));

      const emergency = Number(p.emergency_fund_balance || 0);

      totalMonthlyIncome += finalInc;
      totalMonthlyExpenses += finalExp;
      totalInvestments += finalInv;
      totalEmergencyFunds += emergency;

      return {
        id: p.id,
        name: p.name || 'User',
        email: p.email || '',
        currency: cur,
        monthly_income: finalInc,
        monthly_expenses: finalExp,
        total_investments: finalInv,
        emergency_fund_balance: emergency,
        risk_tolerance: risk,
        employment_type: emp,
        tax_regime: tax,
        is_onboarded: Boolean(p.is_onboarded),
        created_at: p.created_at,
      };
    });

    const avgIncome = totalUsers > 0 ? Math.round(totalMonthlyIncome / totalUsers) : 0;
    const avgExpenses = totalUsers > 0 ? Math.round(totalMonthlyExpenses / totalUsers) : 0;
    const avgInvestments = totalUsers > 0 ? Math.round(totalInvestments / totalUsers) : 0;

    return NextResponse.json({
      success: true,
      analytics: {
        totalProfiles: totalUsers,
        currenciesDistribution: currenciesCount,
        riskDistribution: riskCount,
        employmentDistribution: employmentCount,
        taxRegimeDistribution: taxRegimeCount,
        averages: {
          averageMonthlyIncome: avgIncome,
          averageMonthlyExpenses: avgExpenses,
          averageInvestments: avgInvestments,
          totalEmergencyFundSum: totalEmergencyFunds,
        },
      },
      profiles: enrichedProfiles,
    });
  } catch (err: any) {
    console.error('Error fetching admin profiles:', err);
    return NextResponse.json(
      { error: 'Failed to fetch profiles aggregation', details: err.message },
      { status: 500 }
    );
  }
}
