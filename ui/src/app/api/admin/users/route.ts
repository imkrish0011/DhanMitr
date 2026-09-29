import { NextResponse } from 'next/server';
import { verifyAdminRequest, getAdminSupabase, logAdminAudit } from '@/lib/supabase-admin';
import { resolveUserTags } from '@/lib/userTags';

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
    // 1. Fetch profiles, auth users, and all user financial records in parallel
    const [
      profilesRes,
      authUsersRes,
      adminUsersRes,
      auditLogsRes,
      incomeRes,
      subsRes,
      insRes,
      txRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.auth.admin.listUsers().catch(() => ({ data: { users: [] }, error: null })),
      supabase.from('admin_users').select('*'),
      supabase.from('admin_audit_logs').select('target_id, details, created_at').eq('action', 'UPDATE_USER_TAGS').order('created_at', { ascending: false }),
      supabase.from('income_sources').select('*'),
      supabase.from('subscriptions').select('*'),
      supabase.from('insurances').select('*'),
      supabase.from('transactions').select('*'),
    ]);

    if (profilesRes.error) {
      throw profilesRes.error;
    }

    const profiles = profilesRes.data || [];
    const authUsers = (authUsersRes.data as any)?.users || [];

    // Reconcile: If any auth user exists that is missing from profiles, synthesize a profile entry
    const existingProfileIds = new Set(profiles.map(p => p.id));
    for (const au of authUsers) {
      if (!existingProfileIds.has(au.id)) {
        const meta = au.user_metadata || {};
        const fallbackName = meta.full_name || meta.name || (au.email ? au.email.split('@')[0] : 'User');
        const fallbackInitial = fallbackName.charAt(0).toUpperCase();

        profiles.push({
          id: au.id,
          name: fallbackName,
          email: au.email || '',
          avatar_initial: fallbackInitial,
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
        });
        existingProfileIds.add(au.id);
      }
    }

    // 2. Build lookup maps for roles and audit tags
    const adminMap = new Map<string, { role: string; is_active: boolean }>();
    if (adminUsersRes.data) {
      for (const a of adminUsersRes.data) {
        adminMap.set(a.user_id, { role: a.role, is_active: a.is_active });
      }
    }

    const auditTagsMap = new Map<string, { tags: string[]; customTag?: string }>();
    if (auditLogsRes.data) {
      for (const log of auditLogsRes.data) {
        if (log.target_id && !auditTagsMap.has(log.target_id) && log.details) {
          const t = Array.isArray(log.details.tags) ? log.details.tags : [];
          auditTagsMap.set(log.target_id, {
            tags: t,
            customTag: log.details.customTag,
          });
        }
      }
    }

    // 3. Compute real monthly income from income_sources
    const incomeMap = new Map<string, number>();
    const incomeCountMap = new Map<string, number>();
    for (const inc of incomeRes.data || []) {
      const amt = Number(inc.amount || 0);
      let monthlyAmt = amt;
      if (inc.frequency === 'yearly') monthlyAmt = amt / 12;
      else if (inc.frequency === 'weekly') monthlyAmt = amt * 4.33;
      incomeMap.set(inc.user_id, (incomeMap.get(inc.user_id) || 0) + monthlyAmt);
      incomeCountMap.set(inc.user_id, (incomeCountMap.get(inc.user_id) || 0) + 1);
    }

    // 4. Compute monthly recurring expenses from subscriptions & insurances
    const expensesMap = new Map<string, number>();
    const subsCountMap = new Map<string, number>();
    for (const sub of subsRes.data || []) {
      subsCountMap.set(sub.user_id, (subsCountMap.get(sub.user_id) || 0) + 1);
      if (sub.is_active !== false) {
        const amt = Number(sub.amount || 0);
        let monthly = amt;
        if (sub.billing_cycle === 'yearly') monthly = amt / 12;
        else if (sub.billing_cycle === 'quarterly') monthly = amt / 3;
        else if (sub.billing_cycle === 'weekly') monthly = amt * 4.33;
        expensesMap.set(sub.user_id, (expensesMap.get(sub.user_id) || 0) + monthly);
      }
    }

    const insCountMap = new Map<string, number>();
    for (const ins of insRes.data || []) {
      insCountMap.set(ins.user_id, (insCountMap.get(ins.user_id) || 0) + 1);
      if (ins.is_active !== false) {
        const prem = Number(ins.premium_amount || 0);
        let monthly = prem / 12;
        if (ins.premium_frequency === 'monthly') monthly = prem;
        else if (ins.premium_frequency === 'quarterly') monthly = prem / 3;
        expensesMap.set(ins.user_id, (expensesMap.get(ins.user_id) || 0) + monthly);
      }
    }

    // 5. Compute investments from transactions
    const investmentsMap = new Map<string, number>();
    const txCountMap = new Map<string, number>();
    for (const t of txRes.data || []) {
      txCountMap.set(t.user_id, (txCountMap.get(t.user_id) || 0) + 1);
      if (t.type === 'investment' || t.category === 'investments') {
        investmentsMap.set(t.user_id, (investmentsMap.get(t.user_id) || 0) + Number(t.amount || 0));
      }
    }

    // Combine profile data with admin role data & compute automatic + custom tags
    let userList = profiles.map(p => {
      const adminInfo = adminMap.get(p.id);
      const auditTagInfo = auditTagsMap.get(p.id);
      const existingTags = (p.tags && Array.isArray(p.tags) && p.tags.length > 0)
        ? p.tags
        : (auditTagInfo?.tags || []);
      const directCustomTag = p.custom_tag || auditTagInfo?.customTag;

      // Real calculated financial metrics
      const computedIncome = incomeMap.get(p.id) || 0;
      const finalMonthlyIncome = computedIncome > 0 ? Math.round(computedIncome) : Number(p.monthly_income || 0);

      const computedExpenses = expensesMap.get(p.id) || 0;
      const finalMonthlyExpenses = Math.max(Number(p.monthly_expenses || 0), Math.round(computedExpenses));

      const computedInvestments = investmentsMap.get(p.id) || 0;
      const finalInvestments = Math.max(Number(p.total_investments || 0), Math.round(computedInvestments));

      const { tags, customTag } = resolveUserTags({
        userId: p.id,
        email: p.email,
        monthly_income: finalMonthlyIncome,
        total_investments: finalInvestments,
        existingTags,
        customTag: directCustomTag,
      });

      return {
        id: p.id,
        name: p.name || 'User',
        email: p.email || '',
        avatar_initial: p.avatar_initial || (p.name ? p.name.charAt(0).toUpperCase() : 'U'),
        currency: p.currency || 'INR',
        monthly_income: finalMonthlyIncome,
        monthly_expenses: finalMonthlyExpenses,
        emergency_fund_balance: Number(p.emergency_fund_balance || 0),
        total_investments: finalInvestments,
        total_liabilities: Number(p.total_liabilities || 0),
        risk_tolerance: p.risk_tolerance || 'moderate',
        employment_type: p.employment_type || 'salaried',
        tax_regime: p.tax_regime || 'new',
        is_onboarded: Boolean(p.is_onboarded),
        created_at: p.created_at,
        updated_at: p.updated_at,
        adminRole: adminInfo?.role || 'user',
        isAdminActive: adminInfo ? adminInfo.is_active : false,
        tags,
        custom_tag: customTag || null,
        income_sources_count: incomeCountMap.get(p.id) || 0,
        subscriptions_count: subsCountMap.get(p.id) || 0,
        insurances_count: insCountMap.get(p.id) || 0,
        transactions_count: txCountMap.get(p.id) || 0,
      };
    });

    // Apply search filter
    if (query) {
      userList = userList.filter(u => 
        (u.name && u.name.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.id && u.id.toLowerCase().includes(query)) ||
        (u.tags && Array.isArray(u.tags) && u.tags.some((t: any) => typeof t === 'string' && t.toLowerCase().includes(query))) ||
        (u.custom_tag && u.custom_tag.toLowerCase().includes(query))
      );
    }

    // Apply role filter
    if (roleFilter && roleFilter !== 'all') {
      if (roleFilter === 'admins_all') {
        userList = userList.filter(u => ['superadmin', 'admin', 'moderator'].includes(u.adminRole));
      } else if (roleFilter === 'admin') {
        // Match both admin and superadmin to ensure all admin staff is discoverable
        userList = userList.filter(u => u.adminRole === 'admin' || u.adminRole === 'superadmin');
      } else {
        userList = userList.filter(u => u.adminRole === roleFilter);
      }
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

  // Only superadmins and admins can modify roles or assign special tags
  if (auth.role !== 'superadmin' && auth.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden: Insufficient privileges to alter user settings' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { userId, role, isActive, action, tags, customTag } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // 1. Tag Assignment Action
    if (action === 'UPDATE_TAGS' || tags !== undefined) {
      try {
        await supabase.from('profiles').update({
          tags: Array.isArray(tags) ? tags : [],
          custom_tag: customTag || null,
        }).eq('id', userId);
      } catch (err: any) {
        console.warn('Could not update tags in profiles table:', err?.message);
      }

      await logAdminAudit({
        adminId: auth.user.id,
        adminEmail: auth.user.email,
        action: 'UPDATE_USER_TAGS',
        targetResource: 'profiles',
        targetId: userId,
        details: { tags, customTag, targetUserId: userId },
      });

      return NextResponse.json({
        success: true,
        message: 'User tags updated successfully',
        tags,
        customTag,
      });
    }

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
