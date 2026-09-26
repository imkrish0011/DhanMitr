import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { resolveUserTags } from '@/lib/userTags';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const email = searchParams.get('email');

  if (!userId && !email) {
    return NextResponse.json({ error: 'Missing userId or email parameter' }, { status: 400 });
  }

  try {
    const supabase = getAdminSupabase();

    // 1. Fetch profile to check if DB has tags
    let profileQuery = supabase.from('profiles').select('*');
    if (userId) {
      profileQuery = profileQuery.eq('id', userId);
    } else if (email) {
      profileQuery = profileQuery.eq('email', email);
    }
    const { data: profile } = await profileQuery.maybeSingle();

    // 2. Fetch latest audit logs for user tags (our permanent historical backup)
    let auditQuery = supabase
      .from('admin_audit_logs')
      .select('target_id, details, created_at')
      .eq('action', 'UPDATE_USER_TAGS')
      .order('created_at', { ascending: false });

    if (userId) {
      auditQuery = auditQuery.eq('target_id', userId);
    }
    const { data: auditLogs } = await auditQuery.limit(1);

    const latestAudit = auditLogs && auditLogs.length > 0 ? auditLogs[0] : null;
    const auditTags = latestAudit?.details?.tags && Array.isArray(latestAudit.details.tags)
      ? latestAudit.details.tags
      : [];
    const auditCustomTag = latestAudit?.details?.customTag;

    // Use profile tags if present, otherwise fallback to latest audit log tags
    const existingTags = profile?.tags && Array.isArray(profile.tags) && profile.tags.length > 0
      ? profile.tags
      : auditTags;

    const directCustomTag = profile?.custom_tag || auditCustomTag;

    const resolved = resolveUserTags({
      userId: profile?.id || userId || undefined,
      email: profile?.email || email || undefined,
      monthly_income: Number(profile?.monthly_income || 0),
      total_investments: Number(profile?.total_investments || 0),
      existingTags,
      customTag: directCustomTag,
    });

    return NextResponse.json({
      success: true,
      tags: resolved.tags,
      customTag: resolved.customTag || directCustomTag || null,
      allBadges: resolved.allBadges,
      activeBadge: resolved.activeBadge,
      memberNumber: resolved.memberNumber,
    });
  } catch (err: any) {
    console.error('Error fetching user tags:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
