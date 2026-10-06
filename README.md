# IEEE SGBIT Student Branch Website

Official website of the IEEE Student Branch at S.G. Balekundri Institute of Technology, Belagavi.

Built with Next.js 14 (App Router), Tailwind CSS, Framer Motion, GSAP and Three.js.
Data and file storage run on Supabase. Hosting runs on Vercel.

## Features

- Public site: home, about, team, join, events (past and upcoming)
- Event registration with optional payment screenshot upload
- Membership application and contact forms stored in Supabase (optional Google Sheets mirror)
- Private admin panel for the web master: create, edit and delete events, approve or reject
  registrations (with payment screenshot preview), approve memberships, handle queries

## Tech stack

| Area | Tool |
|---|---|
| Framework | Next.js 14, React 18, TypeScript |
| Styling and motion | Tailwind CSS, Framer Motion, GSAP, Lenis, Three.js |
| Database and storage | Supabase (Postgres, Storage) |
| Validation | Zod |
| Hosting | Vercel |

## Project structure

```
src/
  app/                 pages and API routes
    api/               public form endpoints (join, contact, event registration)
    api/sb-console/    admin API (reachable only through the secret admin path)
    sb-console/        admin panel UI (reachable only through the secret admin path)
    events/            past events, upcoming events, event detail
  components/          UI sections
  lib/
    admin/             admin auth, sessions, config
    security/          crypto, upload checks, rate limiting
    supabase/          server only Supabase client
    events.ts          event data layer
    validation.ts      Zod schemas for every input
  middleware.ts        admin gate, security headers
supabase/schema.sql    database schema, storage buckets, seed events
scripts/setup-admin.mjs  generates admin password hash, secret URL and secrets
```

## Local development

Requirements: Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local     # then fill in the values (see below)
npm run dev                    # http://localhost:3000
```

Without Supabase variables the public site still runs using the bundled event list, and the forms
fall back to local text files. The admin panel and event registration need Supabase.

## Environment variables

Set these in `.env.local` locally and in Vercel (see Deployment). Never prefix any of them with
`NEXT_PUBLIC_`, that would expose them in the browser.

| Variable | Required | What it is |
|---|---|---|
| `SUPABASE_URL` | yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Supabase `service_role` secret key (server only) |
| `ADMIN_IEEE_ID` | yes | IEEE ID used to log in to the admin panel |
| `ADMIN_ROUTE_KEY` | yes | Secret URL segment for the admin panel (40+ characters) |
| `ADMIN_SESSION_SECRET` | yes | Key that signs admin sessions (48+ characters) |
| `ADMIN_PASSWORD_HASH` | yes | scrypt hash of the admin password (starts with `scrypt:`) |
| `IP_HASH_SALT` | yes | Salt used to hash visitor IPs for rate limiting |
| `GOOGLE_SHEETS_ID` | no | Mirror form submissions to a Google Sheet |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | no | Service account for the sheet mirror |
| `GOOGLE_PRIVATE_KEY` | no | Private key for the sheet mirror |

If any required admin variable is missing or malformed, the admin panel turns itself off and its
URL returns 404. This is intentional.

## One time setup

### 1. Database

1. Create a project at https://supabase.com
2. Open SQL Editor, paste the contents of `supabase/schema.sql`, click Run.
   This creates the tables, locks them with row level security, creates the storage buckets and
   seeds the existing events. It is safe to run again.
3. Project Settings > API: copy the project URL and the `service_role` key.

### 2. Admin credentials

```bash
node scripts/setup-admin.mjs
```

Enter a password of 14 or more characters. The script prints the `ADMIN_*` values and your private
admin URL, which looks like `/101132497-<random characters>`. Copy the printed lines into
`.env.local`. Store the password in a password manager. It is never saved, only its hash is.

Log in at `https://<your-domain>/<private admin path>` with the IEEE ID and that password.

## Deployment (Vercel, automatic)

The repository is connected to Vercel through its GitHub integration, so deployments are automatic:

| Action | Result |
|---|---|
| Push to `master` | Production deployment |
| Push to any other branch or open a pull request | Preview deployment |

No manual build step is needed. Vercel runs `npm install` and `npm run build` itself.

### Setting environment variables on Vercel

1. Project > Settings > Environment Variables.
2. Add every required variable from the table above.
3. For each one, tick Production, Preview and Development.
4. Save.

Changing a variable does not affect existing deployments. After any change you must redeploy:

- Deployments > latest deployment > menu > Redeploy, and untick "Use existing build cache", or
- push any commit, or
- trigger a deploy hook (below).

### Optional: redeploy with one URL (deploy hook)

1. Project > Settings > Git > Deploy Hooks > create a hook for the `master` branch.
2. Copy the URL. Calling it starts a fresh production build:

```bash
curl -X POST "<your deploy hook URL>"
```

Treat the hook URL as a secret. Anyone with it can trigger deploys.

### Deployment checklist

- [ ] `supabase/schema.sql` has been run
- [ ] All 7 required variables are set for Production and Preview
- [ ] Redeployed after the last variable change
- [ ] Production branch in Vercel (Settings > Git) is the branch you push to
- [ ] Admin URL loads and login works

### Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Admin URL returns 404 | An admin variable is missing, wrongly pasted, or the deployment predates it. Check all 7 variables and redeploy without build cache. |
| Admin login says "Database not configured" | `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing or wrong. |
| Registration says "Registrations are not open yet" | Supabase variables are not available to this deployment. |
| Login locked for 15 minutes | 5 failed attempts from one network. Wait, then try again. |
| Changed a variable, nothing happened | Variables apply only to new deployments. Redeploy. |
| Forgot admin password | Run `node scripts/setup-admin.mjs`, update `ADMIN_PASSWORD_HASH` (and the route and secrets if printed), redeploy. |

## Security overview

- Admin panel is served only from a secret URL; every other path returns a plain 404.
- Password stored as a scrypt hash. Login is rate limited per IP and globally, with lockout.
- Signed httpOnly session cookie, 4 hour limit, 30 minute idle timeout, revocable server side.
- Every admin write requires a same origin request and a per session CSRF token.
- Payment screenshots live in a private bucket, only viewable through 2 minute signed links.
- Uploads are verified by file signature (JPG, PNG, WEBP only, 4 MB max).
- All database tables use row level security with no public policies. Only the server can access data.
- Strict Content Security Policy on the admin page, HSTS and security headers site wide.
- Every admin action is recorded in an audit log.

More detail: `ADMIN_SETUP.md`. Google Sheets mirror setup: `GOOGLE_SHEETS_SETUP.md`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint |

## Contributing

1. Branch off `master`.
2. Commit small, meaningful changes.
3. Open a pull request. Vercel posts a preview link for review.
4. Never commit `.env*` files. They are gitignored; keep secrets in Vercel and local files only.
