import { createClient } from '@supabase/supabase-js';

// These must be the PUBLIC anon key + project URL (from Supabase Dashboard → Settings → API).
// NEVER put the postgresql://... connection string or the DB password here.
// Using wrong values will cause "Invalid API key" on login/auth calls.
//
// We support both Vite (VITE_) and Next.js-style (NEXT_PUBLIC_) prefixes for convenience,
// plus the newer "PUBLISHABLE_KEY" name.
const supabaseUrl =
  import.meta.env?.['VITE_SUPABASE_URL'] ||
  import.meta.env?.['NEXT_PUBLIC_SUPABASE_URL'] ||
  '';

const supabaseAnonKey =
  import.meta.env?.['VITE_SUPABASE_ANON_KEY'] ||
  import.meta.env?.['VITE_SUPABASE_PUBLISHABLE_KEY'] ||
  import.meta.env?.['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'] ||
  import.meta.env?.['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ||
  '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.warn(
    '[Supabase] Missing or invalid Supabase keys (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY or NEXT_PUBLIC_ equivalents).\n' +
    'Go to your Supabase project → Settings → API and copy the "Project URL" and the "anon" / "publishable" key.\n' +
    'Do NOT use the postgresql connection string here. Real auth and DB persistence will be disabled until fixed.'
  );
}

// Create the Supabase client (safe for browser / Vite)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Type helpers (we'll expand these as we add tables)
export type SupabaseUser = NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user']>;

// Convenience: current auth user (reactive via onAuthStateChange in components)
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper used by auth/bet flows to decide real Supabase vs local simulation
export const hasRealSupabaseConfig = Boolean(
  (import.meta.env?.['VITE_SUPABASE_URL'] || import.meta.env?.['NEXT_PUBLIC_SUPABASE_URL']) &&
  !(import.meta.env?.['VITE_SUPABASE_URL'] || import.meta.env?.['NEXT_PUBLIC_SUPABASE_URL'] || '').includes('placeholder')
);
