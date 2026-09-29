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
  const actionFilter = searchParams.get('action');
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  const supabase = getAdminSupabase();

  try {
    let query = supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (actionFilter && actionFilter !== 'all') {
      query = query.eq('action', actionFilter);
    }

    const { data: logs, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      logs: logs || [],
      count: logs?.length || 0,
    });
  } catch (err: any) {
    console.error('Error fetching admin audit logs:', err);
    return NextResponse.json(
      { error: 'Failed to fetch administrative audit logs', details: err.message },
      { status: 500 }
    );
  }
}
