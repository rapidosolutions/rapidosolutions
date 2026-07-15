create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) <= 254),
  password_hash text not null,
  failed_login_attempts integer not null default 0 check (failed_login_attempts >= 0),
  lock_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text not null default '' check (char_length(phone) <= 50),
  company text not null default '' check (char_length(company) <= 160),
  service text not null check (char_length(service) between 1 and 120),
  budget text not null check (char_length(budget) between 1 and 80),
  message text not null check (char_length(message) between 1 and 5000),
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  notification_email_status text not null default 'pending'
    check (notification_email_status in ('pending', 'sent', 'failed', 'not_configured')),
  confirmation_email_status text not null default 'pending'
    check (confirmation_email_status in ('pending', 'sent', 'failed', 'not_configured')),
  email_error text not null default '' check (char_length(email_error) <= 500),
  user_agent text not null default '' check (char_length(user_agent) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.legacy_blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  slug text not null unique check (char_length(slug) between 1 and 100),
  category text not null default 'Business' check (char_length(category) between 1 and 80),
  summary text not null check (char_length(summary) between 1 and 500),
  content text not null check (char_length(content) between 1 and 50000),
  author text not null default 'Rapido Editorial' check (char_length(author) between 1 and 100),
  read_time text not null default '3 min read' check (char_length(read_time) <= 30),
  published boolean not null default true,
  cover_image jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_status_idx on public.contact_messages (status);
create index if not exists contact_messages_email_idx on public.contact_messages (email);
create index if not exists legacy_blogs_published_created_at_idx on public.legacy_blogs (published, created_at desc);

drop trigger if exists admins_set_updated_at on public.admins;
create trigger admins_set_updated_at before update on public.admins
for each row execute function public.set_updated_at();

drop trigger if exists contact_messages_set_updated_at on public.contact_messages;
create trigger contact_messages_set_updated_at before update on public.contact_messages
for each row execute function public.set_updated_at();

drop trigger if exists legacy_blogs_set_updated_at on public.legacy_blogs;
create trigger legacy_blogs_set_updated_at before update on public.legacy_blogs
for each row execute function public.set_updated_at();

alter table public.admins enable row level security;
alter table public.contact_messages enable row level security;
alter table public.legacy_blogs enable row level security;

revoke all on table public.admins from anon, authenticated;
revoke all on table public.contact_messages from anon, authenticated;
revoke all on table public.legacy_blogs from anon, authenticated;
grant all on table public.admins to service_role;
grant all on table public.contact_messages to service_role;
grant all on table public.legacy_blogs to service_role;
