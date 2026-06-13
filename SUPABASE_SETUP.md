# Supabase Integration for bwin-clone

## 1. Keys you actually need (IMPORTANT)

You pasted the **Postgres connection string** (`postgresql://postgres:...`).

**For the frontend (Vite/React), you need the public client keys instead:**

1. Go to your Supabase project: https://supabase.com/dashboard/project/sijioycftrrdugxuhttq
2. **Project Settings → API**
3. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon** `public` key → `VITE_SUPABASE_ANON_KEY`

Never put the `postgresql://` URL or the `service_role` key in browser code.

## 2. Environment

Copy `.env.example` → `.env` and fill the two values above.

## 3. What we are replacing

- The previous fake `isLoggedIn` + `AuthModal` simulation.
- In-memory `placedBets` (will move to Supabase table with RLS).

## 4. Recommended database schema (run in SQL Editor)

```sql
-- Enable UUIDs if not already
create extension if not exists "uuid-ossp";

-- Placed bets table (one row per ticket)
create table if not exists public.placed_bets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  stake numeric(12,2) not null check (stake > 0),
  potential_return numeric(12,2) not null,
  type text not null check (type in ('Single','Multi','System')),
  status text not null default 'Pending' check (status in ('Pending','Won','Lost')),
  bets jsonb not null,                    -- array of {id, match, selection, odds}
  metadata jsonb
);

-- RLS: users can only see and insert their own bets
alter table public.placed_bets enable row level security;

create policy "Users can view own bets"
  on public.placed_bets for select
  using (auth.uid() = user_id);

create policy "Users can insert own bets"
  on public.placed_bets for insert
  with check (auth.uid() = user_id);

-- Optional: future tables for live matches cache, user profiles, etc.
```

## 5. Next steps in code (we will do these)

- Use `supabase.auth.signUp` / `signInWithPassword` / `signOut` from the existing AuthModal.
- Listen to `supabase.auth.onAuthStateChange` and keep a real `user` in App state.
- Replace the fake "login success" with real Supabase calls.
- Persist `placedBets` via Supabase instead of React state only.
- Add loading / error states for auth.

Run this when you have the two keys:

```bash
npm run dev
```

Paste the keys and we continue wiring real auth + bets persistence.
