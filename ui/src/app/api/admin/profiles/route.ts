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
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const list = profiles || [];

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

    for (const p of list) {
      const cur = p.currency || 'INR';
      currenciesCount[cur] = (currenciesCount[cur] || 0) + 1;

      const risk = p.risk_tolerance || 'moderate';
      riskCount[risk] = (riskCount[risk] || 0) + 1;

      const emp = p.employment_type || 'salaried';
      employmentCount[emp] = (employmentCount[emp] || 0) + 1;

      const tax = p.tax_regime || 'new';
      taxRegimeCount[tax] = (taxRegimeCount[tax] || 0) + 1;

      totalMonthlyIncome += Number(p.monthly_income || 0);
      totalMonthlyExpenses += Number(p.monthly_expenses || 0);
      totalInvestments += Number(p.total_investments || 0);
      totalEmergencyFunds += Number(p.emergency_fund_balance || 0);
    }

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
      profiles: list.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        currency: p.currency,
        risk_tolerance: p.risk_tolerance,
        employment_type: p.employment_type,
        tax_regime: p.tax_regime,
        is_onboarded: p.is_onboarded,
        created_at: p.created_at,
      })),
    });
  } catch (err: any) {
    console.error('Error fetching admin profiles:', err);
    return NextResponse.json(
      { error: 'Failed to fetch profiles aggregation', details: err.message },
      { status: 500 }
    );
  }
}
