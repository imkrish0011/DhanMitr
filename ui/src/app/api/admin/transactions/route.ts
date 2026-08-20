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

  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get('type');
  const categoryFilter = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  const supabase = getAdminSupabase();

  try {
    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit);

    if (typeFilter && typeFilter !== 'all') {
      query = query.eq('type', typeFilter);
    }

    if (categoryFilter && categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter);
    }

    const [txRes, profilesRes] = await Promise.all([
      query,
      supabase.from('profiles').select('id, name, email'),
    ]);

    if (txRes.error) throw txRes.error;

    const profileMap = new Map<string, { name: string; email: string }>();
    for (const p of (profilesRes.data || [])) {
      profileMap.set(p.id, { name: p.name, email: p.email });
    }

    const transactions = (txRes.data || []).map(t => ({
      ...t,
      user_name: profileMap.get(t.user_id)?.name || 'Unknown',
      user_email: profileMap.get(t.user_id)?.email || 'Unknown',
    }));

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length,
    });
  } catch (err: any) {
    console.error('Error fetching admin transactions:', err);
    return NextResponse.json(
      { error: 'Failed to fetch global transactions', details: err.message },
      { status: 500 }
    );
  }
}
