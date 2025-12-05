import { createClient } from '@supabase/supabase-js';

// Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local'
  );
}

// Supabase client with anon key (respects RLS)
// Note: Once you run the schema.sql in Supabase, you can generate types with:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/server/supabase/database.types.ts
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');

// Supabase admin client with service role key (bypasses RLS)
// Use this for server-side operations that need full database access
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl ?? '', supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase; // Fallback to regular client if service key not set

export type SupabaseClient = typeof supabase;
