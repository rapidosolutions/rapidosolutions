alter table public.reviews
  add column if not exists featured boolean not null default false;

alter table public.reviews
  drop constraint if exists reviews_status_check;

alter table public.reviews
  add constraint reviews_status_check
  check (status in ('pending', 'approved', 'hidden', 'rejected'));

alter table public.reviews
  drop constraint if exists reviews_featured_requires_approved_check;

alter table public.reviews
  add constraint reviews_featured_requires_approved_check
  check (featured = false or status = 'approved');
