-- Friend profile pages: let a user read the games of an accepted friend so
-- the profile can show that friend's stats.
--
-- Returns every game the friend has a seat in (games they recorded and games
-- others recorded with them linked), with all seats. Notes are left out:
-- the viewer may not have been at those games. Raises if the two users are
-- not friends; a user may always read their own.
--
-- Apply in the Supabase SQL editor (or via `supabase db push`).

create or replace function public.get_friend_recorded_games(p_friend_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if p_friend_id <> v_uid and not are_friends(v_uid, p_friend_id) then
    raise exception 'You can only view stats for your friends'
      using errcode = '42501';
  end if;

  return (
    select coalesce(jsonb_agg(game order by played_at desc), '[]'::jsonb)
    from (
      select
        g.played_at,
        jsonb_build_object(
          'id', g.id,
          'recorded_by', g.recorded_by,
          'played_at', g.played_at,
          'format', g.format,
          'ended_on_turn', g.ended_on_turn,
          'win_condition', g.win_condition,
          'notes', null,
          'created_at', g.created_at,
          'updated_at', g.updated_at,
          'players', (
            select coalesce(jsonb_agg(to_jsonb(p) order by p.seat_order), '[]'::jsonb)
            from recorded_game_players p
            where p.game_id = g.id
          )
        ) as game
      from recorded_games g
      where exists (
        select 1 from recorded_game_players p
        where p.game_id = g.id and p.user_id = p_friend_id
      )
    ) games
  );
end;
$$;

revoke all on function public.get_friend_recorded_games(uuid) from public;
grant execute on function public.get_friend_recorded_games(uuid)
  to authenticated;
