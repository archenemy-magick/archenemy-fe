-- Recorded Commander (and other format) games for personal statistics.
-- Apply this in the Supabase SQL editor (or via `supabase db push`).
--
-- Friend linking is reserved: `recorded_game_players.user_id` can later
-- point at a friend's profile. Today's RLS only lets the recorder read/write
-- their own games; widen those policies when friendships ship.

create table if not exists public.recorded_games (
  id uuid primary key default gen_random_uuid(),
  recorded_by uuid not null references public.profiles (id) on delete cascade,
  played_at timestamptz not null default now(),
  format text not null default 'commander',
  ended_on_turn integer,
  win_condition text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recorded_games_ended_on_turn_positive
    check (ended_on_turn is null or ended_on_turn >= 1)
);

create table if not exists public.recorded_game_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.recorded_games (id) on delete cascade,
  -- Nullable so opponents who are not (yet) app users can still be recorded.
  -- When friends exist, set this to the friend's profile id.
  user_id uuid references public.profiles (id) on delete set null,
  display_name text not null,
  is_recorder boolean not null default false,
  commander_name text,
  deck_name text,
  colors text[] not null default '{}'::text[],
  is_winner boolean not null default false,
  seat_order integer not null default 0,
  ending_life integer,
  created_at timestamptz not null default now(),
  constraint recorded_game_players_colors_wubrg
    check (colors <@ array['W', 'U', 'B', 'R', 'G']::text[]),
  constraint recorded_game_players_display_name_not_blank
    check (char_length(trim(display_name)) > 0)
);

create index if not exists recorded_games_recorded_by_played_at_idx
  on public.recorded_games (recorded_by, played_at desc);

create index if not exists recorded_game_players_game_id_idx
  on public.recorded_game_players (game_id);

create index if not exists recorded_game_players_user_id_idx
  on public.recorded_game_players (user_id);

-- Keep a single recorder seat per game (the signed-in user filling the form).
create unique index if not exists recorded_game_players_one_recorder_idx
  on public.recorded_game_players (game_id)
  where is_recorder;

alter table public.recorded_games enable row level security;
alter table public.recorded_game_players enable row level security;

drop policy if exists "recorded_games_select_own" on public.recorded_games;
create policy "recorded_games_select_own"
  on public.recorded_games
  for select
  using (recorded_by = auth.uid());

drop policy if exists "recorded_games_insert_own" on public.recorded_games;
create policy "recorded_games_insert_own"
  on public.recorded_games
  for insert
  with check (recorded_by = auth.uid());

drop policy if exists "recorded_games_update_own" on public.recorded_games;
create policy "recorded_games_update_own"
  on public.recorded_games
  for update
  using (recorded_by = auth.uid())
  with check (recorded_by = auth.uid());

drop policy if exists "recorded_games_delete_own" on public.recorded_games;
create policy "recorded_games_delete_own"
  on public.recorded_games
  for delete
  using (recorded_by = auth.uid());

drop policy if exists "recorded_game_players_select_own" on public.recorded_game_players;
create policy "recorded_game_players_select_own"
  on public.recorded_game_players
  for select
  using (
    exists (
      select 1
      from public.recorded_games g
      where g.id = recorded_game_players.game_id
        and g.recorded_by = auth.uid()
    )
  );

drop policy if exists "recorded_game_players_insert_own" on public.recorded_game_players;
create policy "recorded_game_players_insert_own"
  on public.recorded_game_players
  for insert
  with check (
    exists (
      select 1
      from public.recorded_games g
      where g.id = recorded_game_players.game_id
        and g.recorded_by = auth.uid()
    )
  );

drop policy if exists "recorded_game_players_update_own" on public.recorded_game_players;
create policy "recorded_game_players_update_own"
  on public.recorded_game_players
  for update
  using (
    exists (
      select 1
      from public.recorded_games g
      where g.id = recorded_game_players.game_id
        and g.recorded_by = auth.uid()
    )
  );

drop policy if exists "recorded_game_players_delete_own" on public.recorded_game_players;
create policy "recorded_game_players_delete_own"
  on public.recorded_game_players
  for delete
  using (
    exists (
      select 1
      from public.recorded_games g
      where g.id = recorded_game_players.game_id
        and g.recorded_by = auth.uid()
    )
  );
