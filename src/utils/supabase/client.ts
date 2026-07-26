import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  (import.meta.env?.NEXT_PUBLIC_SUPABASE_URL as string) ||
  (import.meta.env?.VITE_SUPABASE_URL as string) ||
  "https://wdtrsewdtiguykediyqu.supabase.co";

const supabaseKey =
  (import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) ||
  (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) ||
  "your-anon-key";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
