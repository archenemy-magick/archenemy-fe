-- Edit a recorded game in one transaction: update the match details and
-- replace its seats. Only the recorder can edit.
--
-- Security definer so seats already linked to a user can be kept even if
-- that person is no longer a friend (the insert policy would reject them).
-- All other checks from the RLS policies are repeated explicitly below.
--
-- Apply in the Supabase SQL editor (or via `supabase db push`).

create or replace function public.update_recorded_game(
  p_game_id uuid,
  p_game jsonb,
  p_players jsonb
)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_previously_linked uuid[];
  v_player jsonb;
  v_user uuid;
  v_linked uuid[] := '{}';
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not exists (
    select 1 from recorded_games
    where id = p_game_id and recorded_by = v_uid
  ) then
    raise exception 'Only the person who recorded this game can edit it'
      using errcode = '42501';
  end if;

  if jsonb_typeof(p_players) <> 'array' or jsonb_array_length(p_players) < 2 then
    raise exception 'A game needs at least two players';
  end if;

  if (
    select count(*) from jsonb_array_elements(p_players) seat
    where (seat->>'is_recorder')::boolean
  ) <> 1 then
    raise exception 'Mark exactly one player as you';
  end if;

  select coalesce(array_agg(user_id), '{}') into v_previously_linked
  from recorded_game_players
  where game_id = p_game_id and user_id is not null;

  update recorded_games set
    played_at = (p_game->>'played_at')::timestamptz,
    format = p_game->>'format',
    ended_on_turn = (p_game->>'ended_on_turn')::integer,
    win_condition = p_game->>'win_condition',
    notes = nullif(trim(p_game->>'notes'), ''),
    updated_at = now()
  where id = p_game_id;

  delete from recorded_game_players where game_id = p_game_id;

  for v_player in select * from jsonb_array_elements(p_players) loop
    if (v_player->>'is_recorder')::boolean then
      v_user := v_uid;
    else
      v_user := nullif(v_player->>'user_id', '')::uuid;
      if v_user = v_uid then
        raise exception 'You can only be in one seat';
      end if;
      if v_user is not null
        and not (v_user = any(v_previously_linked))
        and not are_friends(v_uid, v_user) then
        raise exception 'Seats can only be linked to friends';
      end if;
      if v_user = any(v_linked) then
        raise exception 'Each friend can only be in one seat';
      end if;
      if v_user is not null then
        v_linked := v_linked || v_user;
      end if;
    end if;

    insert into recorded_game_players (
      game_id, user_id, display_name, is_recorder, commander_name,
      deck_name, colors, is_winner, seat_order, ending_life
    ) values (
      p_game_id,
      v_user,
      trim(v_player->>'display_name'),
      (v_player->>'is_recorder')::boolean,
      nullif(trim(v_player->>'commander_name'), ''),
      nullif(trim(v_player->>'deck_name'), ''),
      coalesce(
        array(select jsonb_array_elements_text(v_player->'colors')),
        '{}'
      ),
      coalesce((v_player->>'is_winner')::boolean, false),
      coalesce((v_player->>'seat_order')::integer, 0),
      (v_player->>'ending_life')::integer
    );
  end loop;
end;
$$;

revoke all on function public.update_recorded_game(uuid, jsonb, jsonb)
  from public;
grant execute on function public.update_recorded_game(uuid, jsonb, jsonb)
  to authenticated;
