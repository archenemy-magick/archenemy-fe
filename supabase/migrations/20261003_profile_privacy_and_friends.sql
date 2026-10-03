-- 1. Lock down public.profiles (email, names, and is_admin were readable by
--    anyone holding the anon key).
-- 2. Expose only id/username/avatar to signed-in users via public_profiles.
-- 3. Friendships (request -> accept).
-- 4. Let friends be linked to recorded game seats and see those games.
--
-- Apply in the Supabase SQL editor (or via `supabase db push`).

-- ---------------------------------------------------------------------------
-- 1. profiles: own row only
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

-- Existing policy names are unknown, so clear them all and start clean.
-- Profile rows are created by the auth trigger (security definer), which
-- bypasses RLS, so sign-up keeps working.
do $$
declare
  policy_name text;
begin
  for policy_name in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  loop
    execute format('drop policy %I on public.profiles', policy_name);
  end loop;
end $$;

create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Clients may only edit these columns. In particular, is_admin is no longer
-- writable through the API.
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant insert (id, username, first_name, last_name, avatar_url, email)
  on public.profiles to authenticated;
grant update (username, first_name, last_name, avatar_url, email, status)
  on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- 2. public_profiles: the only cross-user view of a profile
-- ---------------------------------------------------------------------------

-- Runs with the owner's rights (bypasses profiles RLS) but only exposes
-- public columns, and only to signed-in users.
create or replace view public.public_profiles as
  select id, username, avatar_url
  from public.profiles
  where status is distinct from 'INACTIVE';

revoke all on public.public_profiles from public, anon, authenticated;
grant select on public.public_profiles to authenticated;

-- Sign-up checks username availability before the user has a session.
create or replace function public.is_username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles
    where lower(username) = lower(trim(p_username))
  );
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text)
  to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. friendships
-- ---------------------------------------------------------------------------

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint friendships_not_self check (requester_id <> addressee_id),
  constraint friendships_status check (status in ('pending', 'accepted'))
);

-- One row per pair, whichever direction the request went.
create unique index if not exists friendships_pair_idx
  on public.friendships (
    least(requester_id, addressee_id),
    greatest(requester_id, addressee_id)
  );

create index if not exists friendships_addressee_idx
  on public.friendships (addressee_id);

alter table public.friendships enable row level security;

drop policy if exists "friendships_select_participant" on public.friendships;
create policy "friendships_select_participant"
  on public.friendships for select
  using (auth.uid() in (requester_id, addressee_id));

drop policy if exists "friendships_insert_request" on public.friendships;
create policy "friendships_insert_request"
  on public.friendships for insert
  with check (requester_id = auth.uid() and status = 'pending');

-- Only the addressee can accept. Declining, cancelling, and unfriending are
-- deletes.
drop policy if exists "friendships_update_accept" on public.friendships;
create policy "friendships_update_accept"
  on public.friendships for update
  using (addressee_id = auth.uid() and status = 'pending')
  with check (addressee_id = auth.uid() and status = 'accepted');

drop policy if exists "friendships_delete_participant" on public.friendships;
create policy "friendships_delete_participant"
  on public.friendships for delete
  using (auth.uid() in (requester_id, addressee_id));

-- Accepting must not be able to rewrite who the friendship is between.
revoke update on public.friendships from anon, authenticated;
grant update (status, responded_at) on public.friendships to authenticated;
revoke all on public.friendships from anon;

create or replace function public.are_friends(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.friendships
    where status = 'accepted'
      and least(requester_id, addressee_id) = least(a, b)
      and greatest(requester_id, addressee_id) = greatest(a, b)
  );
$$;

revoke all on function public.are_friends(uuid, uuid) from public;
grant execute on function public.are_friends(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. recorded games: friends linked to a seat can see the game
-- ---------------------------------------------------------------------------

-- Security definer helpers avoid RLS recursion between the two tables.
create or replace function public.is_recorded_game_owner(p_game_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.recorded_games
    where id = p_game_id and recorded_by = auth.uid()
  );
$$;

create or replace function public.is_recorded_game_participant(p_game_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.recorded_game_players
    where game_id = p_game_id and user_id = auth.uid()
  );
$$;

revoke all on function public.is_recorded_game_owner(uuid) from public;
revoke all on function public.is_recorded_game_participant(uuid) from public;
grant execute on function public.is_recorded_game_owner(uuid) to authenticated;
grant execute on function public.is_recorded_game_participant(uuid)
  to authenticated;

drop policy if exists "recorded_games_select_own" on public.recorded_games;
create policy "recorded_games_select_own"
  on public.recorded_games for select
  using (
    recorded_by = auth.uid()
    or public.is_recorded_game_participant(id)
  );

drop policy if exists "recorded_game_players_select_own" on public.recorded_game_players;
create policy "recorded_game_players_select_own"
  on public.recorded_game_players for select
  using (
    public.is_recorded_game_owner(game_id)
    or public.is_recorded_game_participant(game_id)
  );

-- Seats may only be linked to yourself or an accepted friend.
drop policy if exists "recorded_game_players_insert_own" on public.recorded_game_players;
create policy "recorded_game_players_insert_own"
  on public.recorded_game_players for insert
  with check (
    public.is_recorded_game_owner(game_id)
    and (
      user_id is null
      or user_id = auth.uid()
      or public.are_friends(auth.uid(), user_id)
    )
  );

drop policy if exists "recorded_game_players_update_own" on public.recorded_game_players;
create policy "recorded_game_players_update_own"
  on public.recorded_game_players for update
  using (public.is_recorded_game_owner(game_id))
  with check (
    public.is_recorded_game_owner(game_id)
    and (
      user_id is null
      or user_id = auth.uid()
      or public.are_friends(auth.uid(), user_id)
    )
  );

drop policy if exists "recorded_game_players_delete_own" on public.recorded_game_players;
create policy "recorded_game_players_delete_own"
  on public.recorded_game_players for delete
  using (public.is_recorded_game_owner(game_id));
