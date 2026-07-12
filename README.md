# Rapido Solutions Co.

Production-oriented website and content system for Rapido Solutions Co. The React frontend presents web, financial, and human resource services, projects, team members, reviews, and blogs. Published blog posts are read from Sanity, while the Express API provides contact-message storage, email notifications, and the existing private operations dashboard.

## Technology

- Frontend: React 19, React Router, Tailwind CSS, Framer Motion, Vite
- Backend: Node.js, Express, Mongoose, Zod, self-contained in `backend/`
- Content: Custom-branded Sanity Studio for private blog management
- Production services: MongoDB Atlas, Cloudinary, Resend, Sanity
- Hosting: Vercel for the frontend and Render or Belmo for the API
- Tests: Vitest, Testing Library, Supertest, Playwright

## Local Setup

1. Install Node.js 22 or newer and make sure the local MongoDB service is running.
2. Run `npm install` in the project root.
3. Run `npm --prefix backend install` to install the API dependencies.
4. Copy `backend/.env.example` to `backend/.env`.
5. Copy `frontend/.env.example` to `frontend/.env` if you need to override Sanity settings.
6. Set a strong `ADMIN_PASSWORD` with at least 12 characters. The initial administrator email is `rapidosolutionsco@outlook.com`.
7. Run `npm run dev:full`.
8. Open `http://localhost:5173`.

The local API uses MongoDB at `mongodb://127.0.0.1:27017/rapido`. Cloudinary and Resend are optional locally. Without Cloudinary, images are stored in `backend/uploads`. Without Resend, contact messages are saved and clearly reported as awaiting email delivery.

## Commands

- `npm run dev:full`: start frontend and API together
- `npm run dev:web`: start only the frontend
- `npm run dev:api`: start only the API through the `backend/` package
- `npm run dev:studio`: start the branded Sanity Studio
- `npm test`: run frontend component tests
- `npm --prefix backend test`: run API tests
- `npm run test:e2e`: run Playwright browser tests
- `npm run build`: create the production frontend bundle
- `npm run build:studio`: build the branded Sanity Studio
- `npm run deploy:studio`: deploy the branded Sanity Studio to Sanity hosting
- `npm run check`: run frontend tests, API tests, and the production frontend build

Backend-only deployment commands from inside `backend/`:

```bash
npm ci
npm start
npm test
```

## Blog Workflow

Blog posts are managed privately in the branded Sanity Studio. The frontend reads only published posts from the public `production` dataset for project `7vlwxcu7`.

Run the branded Studio locally:

```bash
cd backend/sanity/studio
npm install
npm run dev
```

The branded Studio uses the same `post` document type, field names, slugs, images, and public query fields as the website blog pages. It is intentionally not linked from the public website navigation.

Deploy the branded Studio:

```bash
npm run deploy:studio
```

After deployment, add this Studio URL in Sanity Project -> Studios -> Add Studio -> Custom Studio URL:

```text
https://rapido-blog-studio.sanity.studio
```

In Vercel, set:

- `VITE_SANITY_PROJECT_ID=7vlwxcu7`
- `VITE_SANITY_DATASET=production`
- `VITE_SANITY_API_VERSION=2025-01-01`
- `VITE_SANITY_STUDIO_URL=https://rapido-blog-studio.sanity.studio` if an internal admin link is needed outside public navigation

## Operations Dashboard

Visit `/blog-admin` and sign in with the configured administrator email and password. The dashboard supports:

- Reviewing saved contact enquiries
- Tracking messages as new, read, replied, or archived
- Changing the administrator password without database access

The session is stored in a secure HttpOnly cookie. Write requests also require a per-session CSRF token. Failed login attempts are rate-limited and the account is temporarily locked after repeated failures.

## Production Deployment

### MongoDB Atlas

Create an Atlas project and database user, allow connections from Render, and copy the Atlas connection string to Render as `MONGODB_URI`. MongoDB Compass is only a local management application; Atlas supplies the online database used by the deployed website.

### Cloudinary

Create a Cloudinary account and add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to Render. Blog cover images are then stored outside the temporary Render filesystem.

### Resend

Create a Resend account, verify the sending domain, and add `RESEND_API_KEY` and `EMAIL_FROM` to Render. Contact notifications go to `rapidosolutionsco@outlook.com`, and visitors receive a confirmation email. A verified domain is required before normal production sending.

### Render API

Create a Render Blueprint from `render.yaml`. Add all values marked `sync: false`. Set `FRONTEND_URLS` to the final Vercel URL and `API_PUBLIC_URL` to the final Render URL. `ADMIN_PASSWORD` is used only to create the first administrator record; it can be removed from Render after the first successful startup.

For Belmo or any host that supports selecting a project root, use `backend/` as the root directory, `npm ci` as the build/install command, and `npm start` as the start command.

### Vercel Frontend

Import the repository in Vercel and use the repository root. Add `VITE_API_URL` with the public Render API URL and the Sanity variables listed above, then deploy. Add the final Vercel URL to Render's `FRONTEND_URLS` and redeploy the API.

When a custom domain is purchased, connect it to Vercel, verify the same domain with Resend, update `EMAIL_FROM`, and include the custom origin in `FRONTEND_URLS`.

## Security and Operations

- Passwords are hashed with bcrypt and never returned by the API.
- Authentication uses signed HttpOnly cookies, secure cross-site cookie settings in production, CSRF protection, exact CORS origins, Helmet headers, request-size limits, and rate limits.
- Contact and blog inputs are validated server-side with Zod.
- MongoDB, Cloudinary, Resend, and JWT credentials must remain in hosting environment variables and must never be committed.
- The health endpoint is `/api/health`.
- GitHub Actions runs tests, the production build, and a high-severity dependency audit for every pull request.
