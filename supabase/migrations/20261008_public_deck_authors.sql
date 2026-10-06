-- Show who made a public Archenemy deck, to everyone (signed in or not).
--
-- public_profiles stays signed-in only, so this does not expose every
-- account's username: it answers only for decks that are public, and only
-- with the creator's username (no ids, avatars, or other profile fields).
--
-- Apply in the Supabase SQL editor (or via `supabase db push`).

-- archenemy_decks.id is a text column (UUID-shaped values), so deck ids are
-- passed and returned as text.
drop function if exists public.get_public_deck_authors(uuid[]);

create or replace function public.get_public_deck_authors(p_deck_ids text[])
returns table (deck_id text, username text)
language sql
stable
security definer
set search_path = public
as $$
  select d.id, p.username
  from public.archenemy_decks d
  join public.profiles p on p.id = d.user_id
  where d.id = any(p_deck_ids)
    and d.is_public
    and p.status is distinct from 'INACTIVE';
$$;

-- Supabase grants new functions to anon by default; state it explicitly
-- since anon access is intended here.
revoke all on function public.get_public_deck_authors(text[]) from public;
grant execute on function public.get_public_deck_authors(text[])
  to anon, authenticated;

notify pgrst, 'reload schema';
