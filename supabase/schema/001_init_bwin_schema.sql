-- bwin-clone initial schema
-- Run this in Supabase Dashboard > SQL Editor (recommended)
-- or via Supabase CLI after proper linking.
--
-- IMPORTANT SECURITY (from installed supabase skill):
-- - Always enable RLS on public tables.
-- - Use "to authenticated using (auth.uid() = user_id)" pattern.
-- - Never put this password in client code. This file is for admin setup only.
-- - After running, verify with SELECT * FROM placed_bets; (should see only your rows when authenticated).

-- Enable necessary extensions (usually already on in Supabase)
create extension if not exists "uuid-ossp";

-- ============================================
-- placed_bets table
-- Stores user betting tickets. Each row belongs to one authenticated user.
-- ============================================
create table if not exists public.placed_bets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  stake numeric(12, 2) not null check (stake > 0),
  potential_return numeric(12, 2) not null,
  type text not null check (type in ('Single', 'Multi', 'System')),
  status text not null default 'Pending' check (status in ('Pending', 'Won', 'Lost')),
  bets jsonb not null,           -- Array of { id, match, selection, odds }
  metadata jsonb
);

-- Enable Row Level Security (CRITICAL per skill)
alter table public.placed_bets enable row level security;

-- RLS Policies (following supabase-postgres-best-practices + security checklist)
-- Users can only see their own bets
create policy "Users can view their own placed bets"
  on public.placed_bets
  for select
  to authenticated
  using ( (select auth.uid()) = user_id );

-- Users can insert their own bets
create policy "Users can insert their own placed bets"
  on public.placed_bets
  for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

-- (Optional for future) Users can update status of their own pending bets (e.g. for admin simulation)
-- create policy "Users can update their own pending bets"
--   on public.placed_bets
--   for update
--   to authenticated
--   using ( (select auth.uid()) = user_id and status = 'Pending' )
--   with check ( (select auth.uid()) = user_id );

-- Grant access (in case Data API settings require explicit grant)
grant select, insert on public.placed_bets to authenticated;

-- ============================================
-- Optional: simple user profiles (if you want extra fields beyond auth.users)
-- ============================================
-- create table if not exists public.profiles (
--   id uuid references auth.users(id) on delete cascade primary key,
--   username text,
--   created_at timestamptz default now()
-- );
-- alter table public.profiles enable row level security;
-- create policy "Users can view own profile" on public.profiles for select to authenticated using (id = auth.uid());
-- etc.

comment on table public.placed_bets is 'User betting tickets. RLS enforced so users only access their own data.';

-- After running this:
-- 1. Go to Authentication > Providers and enable Email + Password (if not already).
-- 2. Get your anon key from Project Settings > API.
-- 3. Put VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
-- 4. The React app will then use real Supabase Auth + this table for placed bets.