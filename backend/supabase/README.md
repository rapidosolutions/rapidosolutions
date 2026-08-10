# Rapido Supabase Setup

Supabase stores private backend data for Rapido. The public website never connects to these tables directly.

## Create the database

1. Open the Rapido project in the Supabase dashboard.
2. Open SQL Editor and create a new query.
3. Run `migrations/001_initial_schema.sql`, `migrations/002_reviews.sql`, `migrations/003_projects.sql`, and `migrations/004_review_moderation.sql` in that order.
4. Confirm that `admins`, `contact_messages`, `legacy_blogs`, `reviews`, and `projects` appear in Table Editor.

The migration enables Row Level Security and does not create public `anon` or `authenticated` policies. The Express backend uses the private service-role credential and is the only application allowed to access these tables.

## Configure the backend

Add these values to `backend/.env` for local development and to Belmo's private environment settings for production:

```text
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-private-service-role-key
```

Find the URL and server-side key under Supabase Project Settings -> API. Never add the service-role key to Vercel, frontend code, a `VITE_` variable, Git, screenshots, or client-side requests.

## Data flow

1. The browser validates the project-request form.
2. The browser sends the request to the Belmo Express API at `/api/contact`.
3. The API validates it again and inserts it into `contact_messages` using the service-role key.
4. The API asks Resend to notify Rapido and confirm receipt to the visitor.
5. The private operations dashboard reads and updates messages through authenticated API routes.

Public blog posts continue to use Sanity. The `legacy_blogs` table exists only to preserve compatibility with the older protected backend blog API.

The private `/project-admin` interface uses the same administrator session. Project access is separately authorized through `admins.can_manage_projects`; set this field to `false` for administrators who should not manage projects. Its Reviews section uses the existing authenticated review APIs. Public project API queries return only rows whose status is `published`. Archive operations are soft deletes that set status to `archived`.
