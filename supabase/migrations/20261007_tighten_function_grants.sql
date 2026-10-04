-- Supabase grants EXECUTE on new functions in `public` to `anon` (and
-- `authenticated`) directly via default privileges, so the earlier
-- `revoke all ... from public` did not stop anonymous calls. Revoke `anon`
-- explicitly on every function that should require a signed-in user.
--
-- Also: are_friends(a, b) answered for any pair of users, which let anyone
-- check whether two other people are friends. It now only answers when the
-- caller is one of the two. Every existing caller passes auth.uid() as one
-- side, so behavior there is unchanged.
--
-- Apply AFTER 20261005_update_recorded_game.sql and
-- 20261006_friend_recorded_games.sql (it references their functions).
-- is_username_available stays callable by anon: sign-up needs it.

create or replace function public.are_friends(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() in (a, b)
    and exists (
      select 1 from public.friendships
      where status = 'accepted'
        and least(requester_id, addressee_id) = least(a, b)
        and greatest(requester_id, addressee_id) = greatest(a, b)
    );
$$;

revoke execute on function public.are_friends(uuid, uuid) from anon;
revoke execute on function public.is_recorded_game_owner(uuid) from anon;
revoke execute on function public.is_recorded_game_participant(uuid) from anon;
revoke execute on function public.unlink_me_from_recorded_game(uuid) from anon;
revoke execute on function public.update_recorded_game(uuid, jsonb, jsonb)
  from anon;
revoke execute on function public.get_friend_recorded_games(uuid) from anon;

-- Make sure the API sees the new and changed functions right away.
notify pgrst, 'reload schema';
