import { createClient } from '@supabase/supabase-js';

// These must be the PUBLIC anon key + project URL.
// The raw postgresql:// connection string (with password) must NEVER be used in the browser.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Using a no-op client. Add the keys to .env to enable real auth + persistence.'
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
