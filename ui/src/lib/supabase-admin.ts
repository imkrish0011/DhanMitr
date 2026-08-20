import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Primary superadmin email from system setup
export const INITIAL_SUPERADMIN_EMAIL = 'ks9875277@gmail.com';

/**
 * Validates if server-side Supabase admin credentials are present
 */
export const isSupabaseAdminConfigured = Boolean(
  supabaseUrl &&
  serviceRoleKey &&
  !supabaseUrl.includes('your-project') &&
  !serviceRoleKey.includes('your-supabase-service-role-key')
);

/**
 * Returns a privileged Supabase client for server-side route handlers.
 * Utilizes the Service Role Key to bypass user-level RLS for administrative aggregation.
 */
export function getAdminSupabase(): SupabaseClient {
  const key = serviceRoleKey || anonKey || 'placeholder-key';
  const url = supabaseUrl || 'https://placeholder.supabase.co';

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export interface AdminAuthResult {
  authorized: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  role?: 'superadmin' | 'admin' | 'moderator';
  status: number;
  error?: string;
}

/**
 * Verifies that an incoming HTTP request is made by an authenticated administrator.
 * Extracts the JWT Bearer token, validates it with Supabase Auth, and verifies the user's
 * active admin role in the public.admin_users table.
 */
export async function verifyAdminRequest(request: Request): Promise<AdminAuthResult> {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  if (!token) {
    // Check if token is in cookies
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/sb-access-token=([^;]+)/) || cookieHeader.match(/sb-([a-zA-Z0-9_-]+)-auth-token=([^;]+)/);
    if (tokenMatch) {
      try {
        const raw = decodeURIComponent(tokenMatch[1] || tokenMatch[2]);
        if (raw.startsWith('{')) {
          const parsed = JSON.parse(raw);
          token = Array.isArray(parsed) ? parsed[0] : parsed.access_token || '';
        } else {
          token = raw;
        }
      } catch (e) {
        token = tokenMatch[1] || tokenMatch[2] || '';
      }
    }
  }

  if (!token) {
    return {
      authorized: false,
      status: 401,
      error: 'Unauthorized: Authentication token missing. Please sign in to the Admin Portal.',
    };
  }

  const supabase = getAdminSupabase();

  // Validate token with Supabase Auth
  const { data: userData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !userData?.user) {
    return {
      authorized: false,
      status: 401,
      error: 'Unauthorized: Invalid or expired authentication token. Please sign in again.',
    };
  }

  const user = userData.user;
  const userEmail = (user.email || '').toLowerCase().trim();

  // Check admin role in public.admin_users
  try {
    const { data: adminRecord, error: dbError } = await supabase
      .from('admin_users')
      .select('role, is_active')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!dbError && adminRecord) {
      if (!adminRecord.is_active) {
        return {
          authorized: false,
          status: 403,
          error: 'Forbidden: Your administrator account has been deactivated.',
        };
      }

      return {
        authorized: true,
        status: 200,
        role: (adminRecord.role as any) || 'admin',
        user: {
          id: user.id,
          email: userEmail,
          name: user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split('@')[0],
        },
      };
    }

    // Bootstrap fallback: If admin_users record is not found yet, check if this is the primary superadmin email
    if (userEmail === INITIAL_SUPERADMIN_EMAIL.toLowerCase()) {
      try {
        await supabase.from('admin_users').upsert({
          user_id: user.id,
          role: 'superadmin',
          is_active: true,
        });
      } catch (upsertErr) {
        console.warn('Could not auto-insert superadmin record into admin_users:', upsertErr);
      }

      return {
        authorized: true,
        status: 200,
        role: 'superadmin',
        user: {
          id: user.id,
          email: userEmail,
          name: user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split('@')[0],
        },
      };
    }
  } catch (err) {
    console.error('Error verifying admin authorization in database:', err);
    if (userEmail === INITIAL_SUPERADMIN_EMAIL.toLowerCase()) {
      return {
        authorized: true,
        status: 200,
        role: 'superadmin',
        user: {
          id: user.id,
          email: userEmail,
          name: user.user_metadata?.full_name || userEmail.split('@')[0],
        },
      };
    }
  }

  return {
    authorized: false,
    status: 403,
    error: 'Forbidden: Access denied. This account does not possess administrator privileges.',
  };
}

/**
 * Appends an entry to the admin audit log.
 */
export async function logAdminAudit(params: {
  adminId: string;
  adminEmail: string;
  action: string;
  targetResource: string;
  targetId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}): Promise<void> {
  try {
    const supabase = getAdminSupabase();
    await supabase.from('admin_audit_logs').insert({
      admin_id: params.adminId,
      admin_email: params.adminEmail,
      action: params.action,
      target_resource: params.targetResource,
      target_id: params.targetId || null,
      details: params.details || {},
      ip_address: params.ipAddress || null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to write admin audit log:', err);
  }
}
