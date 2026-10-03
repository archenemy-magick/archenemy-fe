-- Let a linked friend remove themselves from a game someone else recorded
-- (e.g. it duplicates their own recording). The seat stays in the game with
-- its name; only the account link is cleared, so it drops out of their log
-- and stats. The recorder's copy is otherwise untouched.
--
-- Apply in the Supabase SQL editor (or via `supabase db push`).

create or replace function public.unlink_me_from_recorded_game(p_game_id uuid)
returns void
language sql
volatile
security definer
set search_path = public
as $$
  update public.recorded_game_players p
  set user_id = null
  from public.recorded_games g
  where p.game_id = p_game_id
    and g.id = p.game_id
    and p.user_id = auth.uid()
    -- The recorder's own seat stays linked; they delete the game instead.
    and g.recorded_by <> auth.uid();
$$;

revoke all on function public.unlink_me_from_recorded_game(uuid) from public;
grant execute on function public.unlink_me_from_recorded_game(uuid)
  to authenticated;
