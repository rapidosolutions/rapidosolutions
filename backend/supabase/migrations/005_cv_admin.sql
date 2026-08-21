-- CV Admin Panel schema (service_role access; RLS enabled, anon/authenticated revoked)
-- Apply in Supabase SQL Editor after 001 and 002.

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) between 3 and 254),
  password_hash text not null,
  role text not null default 'admin' check (role in ('super_admin', 'admin')),
  full_name text not null default '' check (char_length(full_name) <= 160),
  is_active boolean not null default true,
  totp_secret_encrypted text not null default '',
  totp_enabled boolean not null default false,
  failed_login_attempts integer not null default 0 check (failed_login_attempts >= 0),
  lock_until timestamptz,
  last_login_at timestamptz,
  created_by uuid references public.admin_users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cvs (
  id uuid primary key default gen_random_uuid(),
  full_name text not null default '' check (char_length(full_name) <= 160),
  email text not null default '' check (char_length(email) <= 254),
  phone text not null default '' check (char_length(phone) <= 50),
  designation text not null default '' check (char_length(designation) <= 160),
  category text not null default 'General' check (char_length(category) <= 80),
  cv_url text check (cv_url is null or char_length(cv_url) <= 2000),
  cv_public_id text not null default '' check (char_length(cv_public_id) <= 500),
  cv_score numeric(4, 1),
  gemini_summary text not null default '' check (char_length(gemini_summary) <= 8000),
  status text not null default 'new' check (status in ('new', 'shortlisted', 'hired', 'rejected')),
  source text not null default 'public_upload' check (source in ('public_upload', 'manual', 'sample')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_templates (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in (
    'appointment_letter',
    'internship_certificate',
    'experience_letter',
    'explanation_letter'
  )),
  title text not null check (char_length(title) between 1 and 160),
  body_html text not null check (char_length(body_html) between 1 and 200000),
  created_by uuid references public.admin_users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (type)
);

create table if not exists public.branding_settings (
  id uuid primary key default gen_random_uuid(),
  logo_url text not null default '' check (char_length(logo_url) <= 2000),
  logo_public_id text not null default '' check (char_length(logo_public_id) <= 500),
  college_name text not null default 'Rapido Solutions Co.' check (char_length(college_name) <= 200),
  address text not null default '' check (char_length(address) <= 1000),
  footer_text text not null default '' check (char_length(footer_text) <= 1000),
  primary_color text not null default '#4c1d95' check (char_length(primary_color) <= 20),
  secondary_color text not null default '#1e1b4b' check (char_length(secondary_color) <= 20),
  signature_image_url text not null default '' check (char_length(signature_image_url) <= 2000),
  signature_public_id text not null default '' check (char_length(signature_public_id) <= 500),
  updated_by uuid references public.admin_users (id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.generated_documents (
  id uuid primary key default gen_random_uuid(),
  cv_id uuid references public.cvs (id) on delete set null,
  template_id uuid references public.document_templates (id) on delete set null,
  template_type text not null default '' check (char_length(template_type) <= 80),
  final_content_html text not null check (char_length(final_content_html) between 1 and 200000),
  pdf_url text not null default '' check (char_length(pdf_url) <= 2000),
  pdf_public_id text not null default '' check (char_length(pdf_public_id) <= 500),
  generated_by uuid references public.admin_users (id) on delete set null,
  generated_at timestamptz not null default now()
);

create table if not exists public.communications (
  id uuid primary key default gen_random_uuid(),
  cv_id uuid references public.cvs (id) on delete cascade,
  type text not null check (type in ('email', 'whatsapp')),
  subject text not null default '' check (char_length(subject) <= 300),
  message text not null check (char_length(message) between 1 and 10000),
  sent_at timestamptz not null default now(),
  sent_by uuid references public.admin_users (id) on delete set null
);

create index if not exists cvs_created_at_idx on public.cvs (created_at desc);
create index if not exists cvs_status_idx on public.cvs (status);
create index if not exists cvs_category_idx on public.cvs (category);
create index if not exists cvs_score_idx on public.cvs (cv_score desc nulls last);
create index if not exists cvs_email_idx on public.cvs (email);
create index if not exists communications_cv_id_idx on public.communications (cv_id, sent_at desc);
create index if not exists generated_documents_cv_id_idx on public.generated_documents (cv_id, generated_at desc);

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at before update on public.admin_users
for each row execute function public.set_updated_at();

drop trigger if exists cvs_set_updated_at on public.cvs;
create trigger cvs_set_updated_at before update on public.cvs
for each row execute function public.set_updated_at();

drop trigger if exists document_templates_set_updated_at on public.document_templates;
create trigger document_templates_set_updated_at before update on public.document_templates
for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.cvs enable row level security;
alter table public.document_templates enable row level security;
alter table public.branding_settings enable row level security;
alter table public.generated_documents enable row level security;
alter table public.communications enable row level security;

revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.cvs from anon, authenticated;
revoke all on table public.document_templates from anon, authenticated;
revoke all on table public.branding_settings from anon, authenticated;
revoke all on table public.generated_documents from anon, authenticated;
revoke all on table public.communications from anon, authenticated;

grant all on table public.admin_users to service_role;
grant all on table public.cvs to service_role;
grant all on table public.document_templates to service_role;
grant all on table public.branding_settings to service_role;
grant all on table public.generated_documents to service_role;
grant all on table public.communications to service_role;

-- Default branding singleton + document templates (idempotent)
insert into public.branding_settings (college_name, address, footer_text, primary_color, secondary_color)
select 'Rapido Solutions Co.', '', 'Confidential — for official use only.', '#4c1d95', '#1e1b4b'
where not exists (select 1 from public.branding_settings);

insert into public.document_templates (type, title, body_html)
select 'appointment_letter', 'Appointment Letter',
'<div style="font-family: Georgia, serif; line-height: 1.6; color: #1e1b4b;">
  <p>Date: {{date}}</p>
  <p>Dear {{full_name}},</p>
  <p>We are pleased to offer you the position of <strong>{{designation}}</strong> in the {{department}} department.</p>
  <p>Your joining date is <strong>{{joining_date}}</strong>. Compensation: <strong>{{salary}}</strong>.</p>
  <h3>Terms &amp; Conditions of Appointment</h3>
  <div>{{conditions}}</div>
  <p>We look forward to welcoming you.</p>
  <p>Sincerely,<br/>{{college_name}}</p>
</div>'
where not exists (select 1 from public.document_templates where type = 'appointment_letter');

insert into public.document_templates (type, title, body_html)
select 'internship_certificate', 'Internship Certificate',
'<div style="font-family: Georgia, serif; line-height: 1.6; color: #1e1b4b; text-align: center;">
  <h1>Certificate of Internship</h1>
  <p>This certifies that <strong>{{full_name}}</strong> successfully completed an internship as <strong>{{designation}}</strong> at {{college_name}}.</p>
  <p>Period: {{joining_date}} — {{date}}</p>
  <p>{{conditions}}</p>
</div>'
where not exists (select 1 from public.document_templates where type = 'internship_certificate');

insert into public.document_templates (type, title, body_html)
select 'experience_letter', 'Experience Letter',
'<div style="font-family: Georgia, serif; line-height: 1.6; color: #1e1b4b;">
  <p>Date: {{date}}</p>
  <p>To Whom It May Concern,</p>
  <p>This is to certify that <strong>{{full_name}}</strong> worked with {{college_name}} as <strong>{{designation}}</strong> in {{department}}.</p>
  <p>{{conditions}}</p>
  <p>We wish them success in future endeavours.</p>
  <p>Sincerely,<br/>{{college_name}}</p>
</div>'
where not exists (select 1 from public.document_templates where type = 'experience_letter');

insert into public.document_templates (type, title, body_html)
select 'explanation_letter', 'Explanation Letter',
'<div style="font-family: Georgia, serif; line-height: 1.6; color: #1e1b4b;">
  <p>Date: {{date}}</p>
  <p>Dear {{full_name}},</p>
  <p>Subject: Request for Explanation — {{designation}}</p>
  <p>{{conditions}}</p>
  <p>Please submit your written explanation by the stated deadline.</p>
  <p>Sincerely,<br/>{{college_name}}</p>
</div>'
where not exists (select 1 from public.document_templates where type = 'explanation_letter');
