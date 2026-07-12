# Rapido Solutions Co. Handover Context

Use this file first when opening the project in a new Codex/account. Then inspect the repo before editing.

## Project Summary

Rapido Solutions Co. is a company website for web services, SEO, financial support, and human resource services. It includes service pages, projects, team, reviews, blogs, contact form UI, and a private operations dashboard route.

## Repositories And Deployment

- Original repo: `https://github.com/samarkhan56/rapido.co.git`
- Client repo: `https://github.com/rapidosolutions/rapidosolutions.git`
- Client Vercel URL: `https://rapidosolutions.vercel.app`
- Previous Vercel URL used during development: `https://rapido-co.vercel.app`
- Main branch should be treated as the production branch.

## Tech Stack

- Frontend: React 19, React Router, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, Mongoose, Zod, self-contained in `backend/`
- Content: Custom-branded Sanity Studio for blogs
- Testing: Vitest, Testing Library, Supertest, Playwright
- Planned production services: Vercel, Render or Belmo, MongoDB Atlas, Resend, Cloudinary, Sanity

## Important Commands

```bash
npm install
npm --prefix backend install
npm run dev:web
npm run dev:api
npm run dev:studio
npm run dev:full
npm run build
npm run build:studio
npm run test
npm --prefix backend test
npm run test:e2e
npm run check
npm run deploy:studio
```

Branded Sanity Studio locally:

```bash
cd backend/sanity/studio
npm install
npm run dev
```

## Sanity Blog Setup

- Sanity project ID: `7vlwxcu7`
- Dataset: `production`
- Organization ID shown in Sanity: `oP1ziOL5H`
- Sanity project dashboard URL: `https://www.sanity.io/organizations/oP1ziOL5H/project/7vlwxcu7`
- Branded Studio path: `backend/sanity/studio`
- Branded Studio URL after deployment: `https://rapido-blog-studio.sanity.studio`
- Branded Studio schema lives in `backend/sanity/studio/schemaTypes/post.js`.
- Legacy Studio schema also exists at `sanity/schemaTypes/post.js`.
- Website reads only published posts from Sanity through `frontend/src/utils/sanityBlogApi.js`.
- No Sanity token is used in frontend code.
- Keep blog management private in Sanity; public users only view published posts.
- The public `/blogs` page should not show a "Manage in Sanity" button.
- The branded Studio should not be linked from public frontend navigation.

Sanity CORS origins already added with credentials off:

- `http://localhost:5173`
- `https://rapido-co.vercel.app`
- `https://rapidosolutions.vercel.app`

## Blog Workflow

Admins manage blogs in Sanity, not from the public website:

1. Open Sanity Studio/project in the browser.
2. Create or edit a `Blog Post`.
3. Fill title, slug, summary, category, author, published date, cover image, and article body.
4. Click Publish.
5. Published posts appear on `/blogs` and `/blogs/:slug`.

Drafts, unpublished posts, and future-dated posts do not appear on the public website.

## Contact Form And Backend

The frontend contact form exists, but a fully working production contact flow requires backend deployment.

Required services:

- Render for the Express API
- Belmo can also deploy the API directly from `backend/`
- MongoDB Atlas for saved messages
- Resend for email notifications
- Optional Cloudinary for persistent uploaded media

Backend-only deployment commands from inside `backend/`:

```bash
npm ci
npm start
npm test
```

Important environment variables for Render include:

- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CONTACT_RECIPIENT_EMAIL`
- `FRONTEND_URLS=https://rapidosolutions.vercel.app`
- `API_PUBLIC_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Frontend Vercel needs:

- `VITE_API_URL` pointing to the deployed Render backend
- `VITE_SANITY_PROJECT_ID=7vlwxcu7`
- `VITE_SANITY_DATASET=production`
- `VITE_SANITY_API_VERSION=2025-01-01`
- `VITE_SANITY_STUDIO_URL=https://rapido-blog-studio.sanity.studio` if an internal admin link is needed outside public navigation

## Private Dashboard

Route: `/blog-admin`

Despite the route name, blogs are now managed in Sanity. The dashboard is still useful for contact messages and admin password changes after the backend is deployed.

## Security Decisions

- Do not commit `.env`, API keys, tokens, MongoDB URLs with passwords, Resend keys, Cloudinary secrets, JWT secrets, or Sanity tokens.
- Sanity public read values like project ID and dataset are safe to commit.
- Sanity Studio login controls blog management.
- Contact form emails must go through backend/Resend, not directly from browser code.
- Use CORS allowlist only for known frontend origins.
- Keep `sanity/.sanity/`, `backend/sanity/studio/.sanity/`, `node_modules/`, build folders, logs, and test artifacts out of Git.

## Recent State

- Latest code was pushed to both original and client repos.
- Public "Manage in Sanity" button was removed from `/blogs`.
- Client Vercel URL was added to Sanity CORS; Sanity reported it already existed when re-added.
- Repo was clean before this handover file was added.

## Suggested Next Steps

1. Commit and push this handover file.
2. Deploy/verify the client Vercel project from `rapidosolutions/rapidosolutions`.
3. Deploy backend on Render if contact form needs to save/send messages.
4. Add Render API URL as `VITE_API_URL` in Vercel.
5. Test `/blogs`, an individual blog page, and the contact form on the live site.
