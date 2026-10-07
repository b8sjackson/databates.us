-- Run once in the Supabase SQL editor of the DataBates project. Holds order requests from databates.us.
create table if not exists public.website_requests (
  id uuid primary key default gen_random_uuid(),
  received_at timestamptz not null default now(),
  firm text not null, name text not null, role text not null,
  email text not null, phone text not null, size text not null,
  help text[] not null default '{}', delivery text not null, start text not null,
  problem text, source text, user_agent text,
  stage text not null default 'New'
);
alter table public.website_requests enable row level security;
-- No policies on purpose: only the service role (used by the Vercel function) can read or write.
revoke all on public.website_requests from anon, authenticated;
