-- Tracker schema + policies

create table if not exists public.user_bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  event_date date not null default (now()::date),
  is_parlay boolean not null default false,
  parlay_legs integer not null default 0,
  is_boost boolean not null default false,
  profit_boost_pct numeric not null default 0,
  is_bonus_bet boolean not null default false,
  bonus_bet_value numeric not null default 0,
  is_no_sweat boolean not null default false,
  no_sweat_value numeric not null default 0,
  sport text not null,
  sportsbook text not null,
  event text not null,
  market text not null,
  line text,
  bet_name text not null,
  odds numeric not null,
  implied_win_pct numeric not null,
  dollar_stake numeric not null,
  unit_stake numeric not null,
  potential_payout numeric not null,
  result text not null,
  payout numeric not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists user_bets_user_id_idx on public.user_bets (user_id);
create index if not exists user_bets_created_at_idx on public.user_bets (created_at desc);
create index if not exists user_bets_event_date_idx on public.user_bets (event_date desc);
create index if not exists user_bets_sport_idx on public.user_bets (sport);
create index if not exists user_bets_result_idx on public.user_bets (result);

alter table public.user_bets
  add constraint user_bets_result_check
  check (result in ('Win', 'Loss', 'Push', 'Pending', 'Void', 'Cancelled'));

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  sportsbooks jsonb,
  odds_format text,
  theme text,
  unit_size numeric,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences
  add column if not exists unit_size numeric;

alter table public.user_preferences enable row level security;

create policy "user_preferences_select_own"
  on public.user_preferences
  for select
  using (auth.uid() = user_id);

create policy "user_preferences_upsert_own"
  on public.user_preferences
  for insert
  with check (auth.uid() = user_id);

create policy "user_preferences_update_own"
  on public.user_preferences
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.user_bets enable row level security;

create policy "user_bets_select_own"
  on public.user_bets
  for select
  using (auth.uid() = user_id);

create policy "user_bets_insert_own"
  on public.user_bets
  for insert
  with check (auth.uid() = user_id);

create policy "user_bets_update_own"
  on public.user_bets
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_bets_delete_own"
  on public.user_bets
  for delete
  using (auth.uid() = user_id);
