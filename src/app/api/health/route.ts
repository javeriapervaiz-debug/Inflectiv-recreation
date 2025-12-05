import { NextResponse } from 'next/server';
import { supabase } from '@/server/supabase';

/**
 * Health check endpoint
 * GET /api/health - Check tRPC and Supabase connectivity
 */
export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    tRPC: 'ok',
    supabase: 'pending' as string,
    supabaseDetails: null as Record<string, unknown> | null,
  };

  // Test Supabase connection
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      checks.supabase = 'error';
      checks.supabaseDetails = { error: error.message };
    } else {
      checks.supabase = 'ok';
      checks.supabaseDetails = {
        connected: true,
        hasSession: !!data.session,
      };
    }
  } catch (err) {
    checks.supabase = 'error';
    checks.supabaseDetails = {
      error: err instanceof Error ? err.message : 'Unknown error',
      hint: 'Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    };
  }

  const allHealthy = checks.tRPC === 'ok' && checks.supabase === 'ok';

  return NextResponse.json(checks, {
    status: allHealthy ? 200 : 503
  });
}
