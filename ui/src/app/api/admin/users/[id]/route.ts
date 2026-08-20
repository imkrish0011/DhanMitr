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
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('admin_users').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('subscriptions').select('*').eq('user_id', userId),
      supabase.from('insurances').select('*').eq('user_id', userId),
      supabase.from('budget_items').select('*').eq('user_id', userId),
      supabase.from('income_sources').select('*').eq('user_id', userId),
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(20),
    ]);

    if (profileRes.error) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        ...profileRes.data,
        adminRole: adminRes.data?.role || 'user',
        isAdminActive: adminRes.data?.is_active ?? false,
      },
      subscriptions: subsRes.data || [],
      insurances: insRes.data || [],
      budgetItems: budgetRes.data || [],
      incomeSources: incomeRes.data || [],
      recentTransactions: txRes.data || [],
    });
  } catch (err: any) {
    console.error('Error fetching user detail:', err);
    return NextResponse.json(
      { error: 'Failed to fetch user complete profile', details: err.message },
      { status: 500 }
    );
  }
}
