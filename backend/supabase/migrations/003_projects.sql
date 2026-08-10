alter table public.admins
  add column if not exists can_manage_projects boolean not null default true;
alter table public.admins alter column can_manage_projects set default false;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  slug text not null unique check (char_length(slug) between 1 and 100),
  type text not null check (type in ('web', 'financial', 'human')),
  category text not null check (char_length(category) between 1 and 100),
  description text not null check (char_length(description) between 1 and 1000),
  services jsonb not null default '[]'::jsonb check (jsonb_typeof(services) = 'array'),
  metric text not null check (char_length(metric) between 1 and 160),
  cover_image jsonb,
  cover_alt text not null default '' check (char_length(cover_alt) <= 200),
  accent text not null default 'from-slate-200 to-blue-400' check (char_length(accent) <= 120),
  project_url text not null default '' check (char_length(project_url) <= 2000),
  featured boolean not null default false,
  display_order integer not null default 0 check (display_order between 0 and 10000),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  seo_title text not null default '' check (char_length(seo_title) <= 160),
  seo_description text not null default '' check (char_length(seo_description) <= 300),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_public_order_idx
  on public.projects (status, featured desc, display_order asc, created_at asc);
create index if not exists projects_updated_at_idx on public.projects (updated_at desc);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
revoke all on table public.projects from anon, authenticated;
grant all on table public.projects to service_role;

insert into public.projects
  (title, slug, type, category, description, services, metric, cover_alt, accent, display_order, status, published_at)
values
  ('Shopify Skincare Store', 'shopify-skincare-store', 'web', 'Shopify Stores', 'A clean product-led store concept with stronger product storytelling, mobile-first buying flow, and trust sections.', '["Shopify","UI/UX","Conversion"]', 'Cleaner purchase journey', 'A Shopify-style ecommerce store being edited on a laptop', 'from-slate-200 to-blue-400', 10, 'published', now()),
  ('Restaurant Ordering Website', 'restaurant-ordering-website', 'web', 'Restaurant Websites', 'A local restaurant experience with menu highlights, reservation CTA, location details, and fast mobile navigation.', '["Web Design","SEO","Local UX"]', 'Faster customer actions', 'A restaurant ordering interface open on a tablet', 'from-slate-200 to-sky-300', 20, 'published', now()),
  ('Real Estate Showcase', 'real-estate-showcase', 'web', 'Real Estate Websites', 'A premium property presentation concept with lead capture, neighborhood context, and trust-building pages.', '["Web Development","Lead Flow","Brand"]', 'Stronger property trust', 'A modern home suitable for a real estate showcase website', 'from-blue-100 to-emerald-300', 30, 'published', now()),
  ('SaaS Growth Landing Page', 'saas-growth-landing-page', 'web', 'SaaS Landing Pages', 'A conversion-focused landing page with segmented proof, product visuals, pricing CTA, and onboarding flow.', '["Landing Page","Copy","Analytics"]', 'Sharper trial intent', 'A digital analytics dashboard shown on a laptop screen', 'from-blue-200 to-cyan-300', 40, 'published', now()),
  ('Local Service Business Website', 'local-service-business-website', 'web', 'Business Websites', 'A practical service website designed around quote requests, service area SEO, reviews, and call conversions.', '["Web Development","SEO","Maintenance"]', 'More lead paths', 'A business planning session with laptops and notes', 'from-slate-200 to-blue-300', 50, 'published', now()),
  ('WordPress Business Website', 'wordpress-business-website', 'web', 'WordPress Websites', 'A flexible WordPress website concept with service hubs, blog-ready structure, and simple page management.', '["WordPress","Elementor","Performance"]', 'Easy content updates', 'WordPress development code displayed on a laptop screen', 'from-indigo-200 to-blue-300', 60, 'published', now()),
  ('Product Page UX Upgrade', 'product-page-ux-upgrade', 'web', 'UI/UX Improvements', 'A before-and-after product detail layout focused on clearer benefits, stronger CTAs, and review visibility.', '["UX Review","CRO","Shopify"]', 'Reduced friction', 'A UX wireframe and product layout planning session', 'from-cyan-100 to-emerald-300', 70, 'published', now()),
  ('Technical SEO Cleanup', 'technical-seo-cleanup', 'web', 'SEO/Performance Projects', 'A search-ready website structure with metadata improvements, better headings, internal links, and speed hygiene.', '["Technical SEO","Performance","Content Structure"]', 'Improved crawl clarity', 'Website analytics charts used for SEO and performance review', 'from-blue-100 to-sky-300', 80, 'published', now()),
  ('Property Accounting Cleanup', 'property-accounting-cleanup', 'financial', 'Financial Projects', 'A finance operations project focused on reconciliations, owner statement clarity, reporting routines, and cleaner property ledgers.', '["Bookkeeping","Property Accounting","Reporting"]', 'Cleaner month-end visibility', 'Property finance planning with house models and cash', 'from-emerald-100 to-blue-200', 90, 'published', now()),
  ('Bookkeeping Workflow Setup', 'bookkeeping-workflow-setup', 'financial', 'Financial Projects', 'A structured bookkeeping support direction for businesses that need organized transactions, AR/AP tracking, and reporting readiness.', '["Bookkeeping","AR/AP","Reconciliations"]', 'More organized records', 'A bookkeeping desk with calculator, reports, and laptop', 'from-slate-100 to-emerald-200', 100, 'published', now()),
  ('Talent Acquisition Workflow', 'talent-acquisition-workflow', 'human', 'Human Resource Projects', 'A hiring process structure for screening, shortlisting, interview stages, and clearer candidate communication.', '["Talent Acquisition","Hiring Flow","Screening"]', 'Clearer hiring pipeline', 'Human resource hiring workflow concept', 'from-blue-100 to-indigo-300', 110, 'published', now()),
  ('HR Policy and SOP Setup', 'hr-policy-and-sop-setup', 'human', 'Human Resource Projects', 'A documentation project for core workplace policies, role responsibilities, approvals, and repeatable operating procedures.', '["Policies","SOPs","Documentation"]', 'Consistent team process', 'Human resource policy documentation concept', 'from-slate-100 to-sky-300', 120, 'published', now()),
  ('Training and Development Plan', 'training-and-development-plan', 'human', 'Human Resource Projects', 'An employee development direction for onboarding, skills training, manager check-ins, and team learning routines.', '["Training","Onboarding","Development"]', 'Stronger team readiness', 'Employee training and development planning concept', 'from-emerald-100 to-blue-300', 130, 'published', now())
on conflict (slug) do nothing;
