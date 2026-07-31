create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 3 and 254),
  company text not null default '' check (char_length(company) <= 160),
  role text not null default '' check (char_length(role) <= 120),
  service text not null check (char_length(service) between 1 and 120),
  rating smallint not null check (rating between 1 and 5),
  review text not null check (char_length(review) between 20 and 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  consent boolean not null default false check (consent = true),
  notification_email_status text not null default 'pending'
    check (notification_email_status in ('pending', 'sent', 'failed', 'not_configured')),
  email_error text not null default '' check (char_length(email_error) <= 500),
  user_agent text not null default '' check (char_length(user_agent) <= 500),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_status_approved_at_idx
  on public.reviews (status, approved_at desc, created_at desc);
create index if not exists reviews_created_at_idx on public.reviews (created_at desc);

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at before update on public.reviews
for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;
revoke all on table public.reviews from anon, authenticated;
grant all on table public.reviews to service_role;
