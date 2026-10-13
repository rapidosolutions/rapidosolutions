-- Migration 006: Add gallery_images, sub_category, project_url to projects and project_name to reviews
alter table public.projects
  add column if not exists project_url text not null default '' check (char_length(project_url) <= 2000),
  add column if not exists gallery_images jsonb not null default '[]'::jsonb check (jsonb_typeof(gallery_images) = 'array'),
  add column if not exists sub_category text not null default '' check (char_length(sub_category) <= 120);

-- Update reviews table to support specific project/group association
alter table public.reviews
  add column if not exists project_name text not null default '' check (char_length(project_name) <= 160);

-- Backfill project_url for any existing projects without a URL
update public.projects
  set project_url = concat('https://', slug, '.rapidosolutions.com')
  where project_url is null or project_url = '';

