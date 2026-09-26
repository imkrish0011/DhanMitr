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
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('admin_users').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('subscriptions').select('*').eq('user_id', userId),
      supabase.from('insurances').select('*').eq('user_id', userId),
      supabase.from('budget_items').select('*').eq('user_id', userId),
      supabase.from('income_sources').select('*').eq('user_id', userId),
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(20),
      supabase.from('admin_audit_logs').select('details').eq('target_id', userId).eq('action', 'UPDATE_USER_TAGS').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    if (profileRes.error) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const auditTags = auditRes.data?.details?.tags && Array.isArray(auditRes.data.details.tags)
      ? auditRes.data.details.tags
      : [];
    const auditCustomTag = auditRes.data?.details?.customTag;

    const existingTags = profileRes.data?.tags && Array.isArray(profileRes.data.tags) && profileRes.data.tags.length > 0
      ? profileRes.data.tags
      : auditTags;

    return NextResponse.json({
      success: true,
      user: {
        ...profileRes.data,
        tags: existingTags,
        custom_tag: profileRes.data?.custom_tag || auditCustomTag || null,
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
