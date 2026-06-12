# LibreAuth

Open-source web authenticator. SvelteKit + Tailwind + Supabase.

## Setup

1. Copy `.env.example` to `.env.local` and add your Supabase URL, anon key, and service role key.
   The service role key is required for account deletion (Settings → Delete account). Find it in Supabase → Project Settings → API.
2. Optional: add Cloudflare Turnstile keys for bot protection on sign-in, registration, email resend, and account deletion.
   Create a widget at [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) and set both `PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.
3. Optional: add PostHog for product analytics on marketing pages (`PUBLIC_POSTHOG_KEY`, optional `PUBLIC_POSTHOG_HOST`). Analytics only load after cookie consent and never on the vault UI.
4. Create the database table (pick one):
   - **CLI (linked project):** `pnpm db:setup`
   - **Dashboard:** open Supabase → SQL Editor → run `supabase/migrations/001_initial.sql`
5. Install and run:

```bash
pnpm install
pnpm dev
```

## Database

The app needs the `public.totp_entries` table with row-level security. Migration lives at:

`supabase/migrations/001_initial.sql`

If you see `could not find table public.totp_entries`, the migration has not been applied to your Supabase project yet.

## SEO

Set `PUBLIC_SITE_URL` to your production domain (for example `https://libreauth.com`) so canonical URLs, Open Graph tags, and `/sitemap.xml` use the correct origin. Marketing pages ship with structured data (Organization, WebSite, SoftwareApplication, FAQ, breadcrumbs). The authenticator app routes are `noindex` and excluded from the sitemap.

## Routes

- `/` — Marketing homepage
- `/about`, `/features`, `/security`, `/privacy`, `/compare`, `/pricing` — Marketing
- `/app` — Authenticator dashboard (requires login)
- `/app/login`, `/app/register`, `/app/add`, `/app/settings` — Auth flows & settings
