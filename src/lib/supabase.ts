import { createClient } from '@supabase/supabase-js';

// These must be the PUBLIC anon key + project URL (from Supabase Dashboard → Settings → API).
// NEVER put the postgresql://... connection string or the DB password here.
// Using wrong values will cause "Invalid API key" on login/auth calls.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.warn(
    '[Supabase] Missing or invalid VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.\n' +
    'Go to your Supabase project → Settings → API and copy the "Project URL" and "anon" key.\n' +
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
