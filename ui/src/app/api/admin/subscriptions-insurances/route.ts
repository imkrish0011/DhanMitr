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
    const [subsRes, insRes, profilesRes] = await Promise.all([
      supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
      supabase.from('insurances').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, name, email'),
    ]);

    if (subsRes.error) throw subsRes.error;
    if (insRes.error) throw insRes.error;

    const profileMap = new Map<string, { name: string; email: string }>();
    for (const p of (profilesRes.data || [])) {
      profileMap.set(p.id, { name: p.name, email: p.email });
    }

    const subscriptions = (subsRes.data || []).map(s => ({
      ...s,
      user_name: profileMap.get(s.user_id)?.name || 'Unknown',
      user_email: profileMap.get(s.user_id)?.email || 'Unknown',
    }));

    const insurances = (insRes.data || []).map(i => ({
      ...i,
      user_name: profileMap.get(i.user_id)?.name || 'Unknown',
      user_email: profileMap.get(i.user_id)?.email || 'Unknown',
    }));

    return NextResponse.json({
      success: true,
      subscriptions,
      insurances,
      totalSubscriptions: subscriptions.length,
      totalInsurances: insurances.length,
    });
  } catch (err: any) {
    console.error('Error fetching admin subscriptions and insurances:', err);
    return NextResponse.json(
      { error: 'Failed to fetch recurring financial products', details: err.message },
      { status: 500 }
    );
  }
}
