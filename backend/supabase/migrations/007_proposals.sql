-- Migration 007: Create proposals table for corporate proposal generator
create table if not exists public.proposals (
  id text primary key,
  title text not null default 'Untitled Proposal',
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists proposals_updated_at_idx on public.proposals (updated_at desc);

drop trigger if exists proposals_set_updated_at on public.proposals;
create trigger proposals_set_updated_at before update on public.proposals
for each row execute function public.set_updated_at();

alter table public.proposals enable row level security;
revoke all on table public.proposals from anon, authenticated;
grant all on table public.proposals to service_role;
