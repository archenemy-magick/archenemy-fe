-- Feedback submitted from /feedback. Written and read only by the server
-- (/api/feedback, using the service role key): RLS is on with no policies,
-- and anon/authenticated have no grants, so the public API can't touch it.
--
-- Every submission is stored even when the email fails or the daily email
-- cap is hit, so nothing is lost. ip_hash is a salted SHA-256 of the sender's
-- IP, used only for rate limiting; raw IPs are never stored.
--
-- Apply in the Supabase SQL editor (or via `supabase db push`).

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references public.profiles (id) on delete set null,
  category text not null,
  message text not null,
  reply_email text,
  page_url text,
  user_agent text,
  ip_hash text not null,
  emailed boolean not null default false,
  constraint feedback_category check (category in ('bug', 'idea', 'other')),
  constraint feedback_message_length
    check (char_length(message) between 10 and 4000),
  constraint feedback_reply_email_length
    check (reply_email is null or char_length(reply_email) <= 254)
);

-- Rate-limit lookups: recent submissions per IP, and per day overall.
create index if not exists feedback_ip_hash_created_at_idx
  on public.feedback (ip_hash, created_at desc);
create index if not exists feedback_created_at_idx
  on public.feedback (created_at desc);

alter table public.feedback enable row level security;
revoke all on public.feedback from anon, authenticated;
