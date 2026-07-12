# Rapido Blog Studio

Custom-branded Sanity Studio for managing Rapido Solutions Co. blog posts.

## Local Use

```bash
cd backend/sanity/studio
npm install
npm run dev
```

The Studio connects to the existing Sanity project:

- Project ID: `7vlwxcu7`
- Dataset: `production`
- Document type: `post`

## Deployment

Deploy this Studio from `backend/sanity/studio`:

```bash
npm run deploy
```

The configured Sanity Studio host is:

```text
https://rapido-blog-studio.sanity.studio
```

Use that URL in Sanity Project -> Studios -> Add Studio -> Custom Studio URL after deployment completes.

## Security

Do not add this Studio URL to the public website navigation. Access is controlled by Sanity project membership and login.
