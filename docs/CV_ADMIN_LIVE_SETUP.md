# CV Admin Panel & WhatsApp Portal — Live Setup Guide

This guide covers making the **CV Admin** console live, setting **email / password / 2FA**, configuring **Resend email**, and linking your **company WhatsApp** through the Baileys QR portal.

Private admin URL (not linked in the public site):

```text
https://YOUR-FRONTEND-DOMAIN/system-x7k2/login
```

Local:

```text
http://localhost:5173/system-x7k2/login
```

---

## 1. What you need accounts for

| Service | Purpose |
|---------|---------|
| **Supabase** | Database (`cvs`, `admin_users`, templates, branding, communications) |
| **Vercel** (or similar) | Frontend hosting |
| **Belmo / Render** | Backend Node API (must stay running for WhatsApp session) |
| **Cloudinary** | CV PDF + branding image storage |
| **Resend** | Outbound admin/candidate emails |
| **Gemini** (optional) | Resume scoring on public analyzer |
| **Company WhatsApp phone** | Scan QR once to link Baileys portal |

---

## 2. Database (Supabase)

1. Open your Rapido Supabase project → **SQL Editor**.
2. Run in order (if not already applied):
   - `backend/supabase/migrations/001_initial_schema.sql`
   - `backend/supabase/migrations/002_reviews.sql`
   - **`backend/supabase/migrations/005_cv_admin.sql`** ← required for CV admin
3. Confirm tables exist: `admin_users`, `cvs`, `document_templates`, `branding_settings`, `generated_documents`, `communications`.

Copy from **Project Settings → API**:

- Project URL → `SUPABASE_URL`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**backend only**, never `VITE_`)

---

## 3. Backend environment variables (Belmo / Render)

Set these on the **API** service (root `backend/`):

### Core

```text
NODE_ENV=production
PORT=4174
HOST=0.0.0.0
FRONTEND_URLS=https://YOUR-FRONTEND-DOMAIN
API_PUBLIC_URL=https://YOUR-API-DOMAIN
TRUST_PROXY=true
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
JWT_SECRET=replace-with-random-32+-characters
JWT_EXPIRES_IN=8h
```

### Blog admin (existing `/blog-admin`)

```text
ADMIN_EMAIL=you@company.com
ADMIN_PASSWORD=StrongPasswordAtLeast12
```

`ADMIN_PASSWORD` is only used to **create** the first blog admin on first boot. After that you can remove it from the host env.

### CV Admin (new `/system-x7k2`)

```text
CV_ADMIN_EMAIL=you@company.com
CV_ADMIN_PASSWORD=AnotherStrongPassword12+
CV_ADMIN_COOKIE_NAME=rapido_cv_admin_session
```

On first API start with an empty `admin_users` table, the backend creates a **`super_admin`** using `CV_ADMIN_EMAIL` + `CV_ADMIN_PASSWORD`.

Then:

1. Open `/system-x7k2/login`
2. Sign in with that email/password
3. Go to **Security / 2FA** → scan QR in Google Authenticator / Authy → confirm 6-digit code
4. After 2FA is enabled, every login requires password **then** the 6-digit code
5. Remove `CV_ADMIN_PASSWORD` from production env after bootstrap (optional but recommended)

### Email (Resend)

```text
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=noreply@your-verified-domain.com
CONTACT_RECIPIENT_EMAIL=you@company.com
```

Verify your domain in Resend. Without this, CV “Send Email” and admin invite emails will fail/report not configured.

### Cloudinary

```text
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Needed for CV PDF storage and branding logo/signature uploads.

### Gemini (public resume analyzer)

```text
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-flash-latest
```

### WhatsApp Baileys session (important for live)

```text
WHATSAPP_AUTH_DIR=/var/data/whatsapp-auth
```

Mount a **persistent disk** on Belmo/Render at that path. Without persistence, every redeploy wipes the session and you must scan QR again.

---

## 4. Frontend environment (Vercel)

```text
VITE_API_URL=https://YOUR-API-DOMAIN
VITE_SITE_URL=https://YOUR-FRONTEND-DOMAIN
VITE_SANITY_PROJECT_ID=...
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2025-01-01
```

Redeploy frontend after changing `VITE_*` values.

Also ensure `FRONTEND_URLS` on the API includes the exact Vercel URL (scheme + host, no trailing slash).

---

## 5. Deploy checklist (make it live)

1. Apply SQL migrations (including `005_cv_admin.sql`).
2. Deploy **backend** with all env vars above.
3. Deploy **frontend** with `VITE_API_URL` pointing at the API.
4. Confirm `GET https://YOUR-API-DOMAIN/api/health` returns `{ "status": "ok" }` (or `"degraded"` if DB missing).
5. Open `https://YOUR-FRONTEND-DOMAIN/system-x7k2/login` — it must **not** appear in navbar/footer.
6. Log in with `CV_ADMIN_EMAIL` / `CV_ADMIN_PASSWORD`.
7. Enable **2FA**.
8. (Super admin) set **Branding**, review **Templates**.
9. Connect **WhatsApp portal** (next section).

Public site stays unchanged. Successful resume analyses are also stored into `cvs` for the admin dashboard.

---

## 6. WhatsApp portal (Baileys — like WhatsApp Web)

In-app path:

```text
/system-x7k2/whatsapp
```

### How it works

1. Click **Connect / Show QR**.
2. On the company phone: **WhatsApp → Linked devices → Link a device**.
3. Scan the QR shown in the admin portal.
4. Status becomes **connected** and shows the linked number.
5. Send messages to any number (**include country code**, e.g. `923001234567`).
6. From a CV detail page you can use **Send via portal** (pre-fills phone/message) or the classic **wa.me** link.

### Rules / warnings

- Baileys is an **unofficial** WhatsApp Web client. It can break when WhatsApp changes protocols, and accounts can be limited if abused.
- Keep the **phone online** and charged.
- Use a dedicated **company** WhatsApp number, not a personal one you cannot afford to lose.
- For high volume / marketing, plan an upgrade to the official **WhatsApp Cloud API**.
- Session files live under `WHATSAPP_AUTH_DIR` (default `backend/data/whatsapp-auth`). **Do not commit** them (gitignored).

### Live hosting tip

Baileys needs a **long-running Node process** (your Belmo/Render API). Serverless-only hosts will not keep the socket alive. Attach a persistent disk for `WHATSAPP_AUTH_DIR`.

---

## 7. Managing admins, passwords, email, WhatsApp

### Create more admins

1. Sign in as `super_admin`.
2. Open **Manage Admins → Add Admin**.
3. Enter name, email, role (`admin` or `super_admin`).
4. A temporary password is shown (and emailed via Resend if configured).
5. New admin signs in at `/system-x7k2/login`, then enables 2FA.

### Reset password

**Manage Admins → Reset password** generates a new temporary password (and disables 2FA until they set it up again).

### Roles

| Role | Access |
|------|--------|
| `super_admin` | Everything + branding, templates, manage admins |
| `admin` | CVs, documents, WhatsApp portal, email/WhatsApp actions |

### Candidate email

On a CV detail page → **Send Email** → uses Resend (`EMAIL_FROM`). Logged in `communications`.

### Candidate WhatsApp

- **wa.me** — opens WhatsApp Web/App with a prefilled draft (no server send).
- **Send via portal** — sends through the linked company number after QR connect.

---

## 8. Local development (quick)

```bash
# root
npm install
npm --prefix backend install
copy backend\.env.example backend\.env
# fill SUPABASE_*, JWT_SECRET, CV_ADMIN_PASSWORD, etc.

# apply migration 003 in Supabase SQL editor

npm run dev:full
```

- Site: http://localhost:5173  
- CV Admin: http://localhost:5173/system-x7k2/login  
- WhatsApp: http://localhost:5173/system-x7k2/whatsapp  

---

## 9. Troubleshooting

| Symptom | Fix |
|---------|-----|
| Login “database” / table missing | Run `005_cv_admin.sql` |
| No first CV admin | Set `CV_ADMIN_PASSWORD` (12+) and restart API once |
| CORS / cookie issues in prod | `FRONTEND_URLS` exact match; `COOKIE_SAME_SITE=none`; `COOKIE_SECURE=true` |
| Email fails | Resend domain verified; `EMAIL_FROM` on that domain |
| QR never appears | API must be reachable; check backend logs; click Connect again |
| WhatsApp disconnects after deploy | Mount persistent `WHATSAPP_AUTH_DIR` |
| PDF not stored on CV | Cloudinary env missing (falls back to local uploads on disk hosts) |

---

## 10. Security reminders

- Never put `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, Resend, Cloudinary, or Gemini keys in Vercel `VITE_` vars.
- Keep `/system-x7k2` unlisted (already excluded from sitemap/`robots.txt`).
- Prefer 2FA on every CV admin account.
- Rotate temporary passwords after invites.
