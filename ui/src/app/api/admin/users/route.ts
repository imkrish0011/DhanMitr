import { NextResponse } from 'next/server';
import { verifyAdminRequest, getAdminSupabase, logAdminAudit } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized' },
      { status: auth.status }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').toLowerCase().trim();
  const roleFilter = searchParams.get('role');
  const onboardedFilter = searchParams.get('onboarded');

  const supabase = getAdminSupabase();

  try {
    // 1. Fetch profiles
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profError) {
      throw profError;
    }

    // 2. Fetch admin users list to merge role info
    const { data: adminUsers, error: adminErr } = await supabase
      .from('admin_users')
      .select('*');

    const adminMap = new Map<string, { role: string; is_active: boolean }>();
    if (adminUsers) {
      for (const a of adminUsers) {
        adminMap.set(a.user_id, { role: a.role, is_active: a.is_active });
      }
    }

    // Combine profile data with admin role data
    let userList = (profiles || []).map(p => {
      const adminInfo = adminMap.get(p.id);
      return {
        id: p.id,
        name: p.name,
        email: p.email,
        avatar_initial: p.avatar_initial,
        currency: p.currency,
        monthly_income: Number(p.monthly_income || 0),
        monthly_expenses: Number(p.monthly_expenses || 0),
        emergency_fund_balance: Number(p.emergency_fund_balance || 0),
        total_investments: Number(p.total_investments || 0),
        total_liabilities: Number(p.total_liabilities || 0),
        risk_tolerance: p.risk_tolerance,
        employment_type: p.employment_type,
        tax_regime: p.tax_regime,
        is_onboarded: Boolean(p.is_onboarded),
        created_at: p.created_at,
        updated_at: p.updated_at,
        adminRole: adminInfo?.role || 'user',
        isAdminActive: adminInfo ? adminInfo.is_active : false,
      };
    });

    // Apply search filter
    if (query) {
      userList = userList.filter(u => 
        (u.name && u.name.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.id && u.id.toLowerCase().includes(query))
      );
    }

    // Apply role filter
    if (roleFilter && roleFilter !== 'all') {
      userList = userList.filter(u => u.adminRole === roleFilter);
    }

    // Apply onboarding status filter
    if (onboardedFilter === 'true') {
      userList = userList.filter(u => u.is_onboarded);
    } else if (onboardedFilter === 'false') {
      userList = userList.filter(u => !u.is_onboarded);
    }

    return NextResponse.json({
      success: true,
      users: userList,
      total: userList.length,
    });
  } catch (err: any) {
    console.error('Error fetching admin users:', err);
    return NextResponse.json(
      { error: 'Failed to fetch user directory', details: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await verifyAdminRequest(request);

  if (!auth.authorized || !auth.user) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized' },
      { status: auth.status }
    );
  }

  // Only superadmins and admins can modify roles
  if (auth.role !== 'superadmin' && auth.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden: Insufficient privileges to alter administrative roles' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { userId, role, isActive } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    if (role === 'user') {
      // Remove admin privileges
      await supabase.from('admin_users').delete().eq('user_id', userId);
      
      await logAdminAudit({
        adminId: auth.user.id,
        adminEmail: auth.user.email,
        action: 'REVOKE_ADMIN_ROLE',
        targetResource: 'admin_users',
        targetId: userId,
        details: { previousRole: role, targetUserId: userId },
      });

      return NextResponse.json({ success: true, message: 'Admin privileges revoked' });
    }

    if (['superadmin', 'admin', 'moderator'].includes(role)) {
      // If promoting to superadmin, require requester to be superadmin
      if (role === 'superadmin' && auth.role !== 'superadmin') {
        return NextResponse.json(
          { error: 'Forbidden: Only superadmins can assign superadmin role' },
          { status: 403 }
        );
      }

      await supabase.from('admin_users').upsert({
        user_id: userId,
        role: role,
        is_active: isActive !== undefined ? isActive : true,
        created_by: auth.user.id,
      });

      await logAdminAudit({
        adminId: auth.user.id,
        adminEmail: auth.user.email,
        action: 'SET_ADMIN_ROLE',
        targetResource: 'admin_users',
        targetId: userId,
        details: { newRole: role, isActive: isActive ?? true, targetUserId: userId },
      });

      return NextResponse.json({ success: true, message: `User role updated to ${role}` });
    }

    return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
  } catch (err: any) {
    console.error('Error updating user role:', err);
    return NextResponse.json(
      { error: 'Failed to update user role', details: err.message },
      { status: 500 }
    );
  }
}
