import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized' },
      { status: auth.status }
    );
  }

  return NextResponse.json({
    success: true,
    user: auth.user,
    role: auth.role,
    verifiedAt: new Date().toISOString(),
  });
}
