import { NextResponse } from 'next/server';
import { verifyAdminRequest, getAdminSupabase } from '@/lib/supabase-admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminRequest(request);

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized' },
      { status: auth.status }
    );
  }

  const { id: userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
  }

  const supabase = getAdminSupabase();

  try {
    const [
      profileRes,
      adminRes,
      subsRes,
      insRes,
      budgetRes,
      incomeRes,
      txRes,
      auditRes,
      authRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('admin_users').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('subscriptions').select('*').eq('user_id', userId),
      supabase.from('insurances').select('*').eq('user_id', userId),
      supabase.from('budget_items').select('*').eq('user_id', userId),
      supabase.from('income_sources').select('*').eq('user_id', userId),
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(50),
      supabase.from('admin_audit_logs').select('details').eq('target_id', userId).eq('action', 'UPDATE_USER_TAGS').order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.auth.admin.getUserById(userId).catch(() => ({ data: { user: null }, error: null })),
    ]);

    let profileData = profileRes.data;

    // If profile row doesn't exist, build one from auth user metadata
    if (!profileData && authRes?.data?.user) {
      const au = authRes.data.user;
      const meta = au.user_metadata || {};
      const fallbackName = meta.full_name || meta.name || (au.email ? au.email.split('@')[0] : 'User');
      profileData = {
        id: au.id,
        name: fallbackName,
        email: au.email || '',
        avatar_initial: fallbackName.charAt(0).toUpperCase(),
        currency: 'INR',
        monthly_income: 0,
        monthly_expenses: 0,
        emergency_fund_balance: 0,
        total_investments: 0,
        total_liabilities: 0,
        risk_tolerance: 'moderate',
        employment_type: 'salaried',
        tax_regime: 'new',
        is_onboarded: false,
        created_at: au.created_at || new Date().toISOString(),
        updated_at: au.updated_at || new Date().toISOString(),
        tags: [],
        custom_tag: null,
      };
    }

    if (!profileData) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const auditTags = auditRes.data?.details?.tags && Array.isArray(auditRes.data.details.tags)
      ? auditRes.data.details.tags
      : [];
    const auditCustomTag = auditRes.data?.details?.customTag;

    const existingTags = profileData.tags && Array.isArray(profileData.tags) && profileData.tags.length > 0
      ? profileData.tags
      : auditTags;

    // Calculate real monthly income
    const incomeSources = incomeRes.data || [];
    const computedIncome = incomeSources.reduce((sum: number, inc: any) => {
      const amt = Number(inc.amount || 0);
      let monthly = amt;
      if (inc.frequency === 'yearly') monthly = amt / 12;
      else if (inc.frequency === 'weekly') monthly = amt * 4.33;
      return sum + monthly;
    }, 0);

    // Calculate real recurring monthly expenses
    const subscriptions = subsRes.data || [];
    const insurances = insRes.data || [];
    const computedExpenses = subscriptions.reduce((sum: number, sub: any) => {
      if (sub.is_active === false) return sum;
      const amt = Number(sub.amount || 0);
      let monthly = amt;
      if (sub.billing_cycle === 'yearly') monthly = amt / 12;
      else if (sub.billing_cycle === 'quarterly') monthly = amt / 3;
      else if (sub.billing_cycle === 'weekly') monthly = amt * 4.33;
      return sum + monthly;
    }, 0) + insurances.reduce((sum: number, ins: any) => {
      if (ins.is_active === false) return sum;
      const prem = Number(ins.premium_amount || 0);
      let monthly = prem / 12;
      if (ins.premium_frequency === 'monthly') monthly = prem;
      else if (ins.premium_frequency === 'quarterly') monthly = prem / 3;
      return sum + monthly;
    }, 0);

    // Calculate investments from ledger
    const transactions = txRes.data || [];
    const computedInvestments = transactions.reduce((sum: number, t: any) => {
      if (t.type === 'investment' || t.category === 'investments') {
        return sum + Number(t.amount || 0);
      }
      return sum;
    }, 0);

    const finalIncome = computedIncome > 0 ? Math.round(computedIncome) : Number(profileData.monthly_income || 0);
    const finalExpenses = Math.max(Number(profileData.monthly_expenses || 0), Math.round(computedExpenses));
    const finalInvestments = Math.max(Number(profileData.total_investments || 0), Math.round(computedInvestments));

    return NextResponse.json({
      success: true,
      user: {
        ...profileData,
        monthly_income: finalIncome,
        monthly_expenses: finalExpenses,
        total_investments: finalInvestments,
        tags: existingTags,
        custom_tag: profileData.custom_tag || auditCustomTag || null,
        adminRole: adminRes.data?.role || 'user',
        isAdminActive: adminRes.data?.is_active ?? false,
      },
      subscriptions,
      insurances,
      budgetItems: budgetRes.data || [],
      incomeSources,
      recentTransactions: transactions,
    });
  } catch (err: any) {
    console.error('Error fetching user detail:', err);
    return NextResponse.json(
      { error: 'Failed to fetch user complete profile', details: err.message },
      { status: 500 }
    );
  }
}
