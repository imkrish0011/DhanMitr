import { NextResponse } from 'next/server';
import { verifyAdminRequest, isSupabaseAdminConfigured } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized' },
      { status: auth.status }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

  // Sanitize url to show domain only for safe diagnostics
  let maskedSupabaseUrl = 'Not Configured';
  if (supabaseUrl) {
    try {
      const parsed = new URL(supabaseUrl);
      maskedSupabaseUrl = `${parsed.protocol}//${parsed.hostname}`;
    } catch (e) {
      maskedSupabaseUrl = 'Configured (Invalid Format)';
    }
  }

  return NextResponse.json({
    success: true,
    system: {
      appName: 'धनMitr Command Center',
      version: '1.0.0',
      nodeEnv: process.env.NODE_ENV || 'development',
      serverTime: new Date().toISOString(),
      supabaseStatus: {
        urlConfigured: Boolean(supabaseUrl),
        maskedUrl: maskedSupabaseUrl,
        anonKeyPresent: hasAnonKey,
        serviceKeyPresent: hasServiceKey,
        adminReady: isSupabaseAdminConfigured,
      },
      backendStatus: {
        apiUrl: backendApiUrl,
      },
    },
    requester: {
      user: auth.user,
      role: auth.role,
    },
  });
}
