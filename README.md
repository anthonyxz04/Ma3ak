# MA3AK Events

Event planning for Lebanon: a budget planner that adds up real provider packages, a provider directory, a partner portal for providers, quote requests, a 3D event designer, and a private admin.

- **Website:** `public/` (built from `client/src/` with `npm run build`)
- **API:** `server/` — served on Netlify by one function, `netlify/functions/api.mjs` (`/api/*`, `/auth/*`)
- **Database:** Netlify Database (managed Postgres). Schema and seed data: `netlify/database/migrations/`
- **Photos and uploads:** Netlify Blobs (private; only served through the API after a permission check)
- **Admin:** `/admin/` (no public sign-up; the first admin comes from environment variables)

---

## What it does

**Customers**
- Accounts: register, sign in (email; Google optional), confirm email, reset password, profile, sign out, delete account (removes their plans, photos and data).
- **Budget planner** (`/#/plan`, `/#/planner/<id>`): event type, date, area in Lebanon, guests, budget, theme, indoor/outdoor, services needed, special requirements.
  - Matching providers and packages come first (area, event type, capacity).
  - Add/remove services, change quantities, swap packages. Per-guest prices follow the guest count.
  - Live total shown as a range (from–up to), over-budget warning, one-tap cheaper alternatives, “request a quote” for unpriced items, custom lines with your own estimate.
  - If a provider changes a price later, the plan shows it and asks before updating.
  - Private notes, draft/finalized status, print/PDF, “send plan to MA3AK”.
  - Share links are **off by default**; a link shows the plan and totals without email, phone, private notes or requirements, and can be turned off.
- **Dashboard** (`/#/dashboard`): saved plans with estimated totals, plans shared with you, quote requests with replies and amounts, favourite providers.
- **Provider directory** (`/#/vendors`, `/#/search`, `/#/vendor/<id>`): search, filters (category, area, event type, price, guests, features), packages with prices, photos, quote requests, add to plan, save as favourite.
- **Assistant**: uses an AI model if `AI_PROVIDER`/`AI_API_KEY` are set; otherwise a built-in assistant answers from the database (providers, package prices, budget split guidelines, themes, FAQs, contact). It never confirms availability or invents prices.
- 3D designer, guest list, seating, timeline, checklist and digital invitations (from earlier versions) keep working on the same saved events.

**Providers (partners)** — `/#/partner/join`, `/#/partner`
- Sign up as a partner (or turn a customer account into one). The listing starts as a **private draft**.
- Profile, areas, event types, features, capacity, availability note, contacts.
- Packages: fixed, per guest, per hour or per item; price, optional “up to” price, or empty for “request a quote”.
- Photos (resized in the browser; metadata stripped on the server; up to 10).
- Submit for review. Nothing is public until an admin approves it. Approval does **not** mark a provider as verified.
- Quote requests: reply, set status (replied, quoted, accepted, declined, closed), quoted amount, private notes.
- Partners can only see and change their own listing and requests.

**Admin** — `/admin/`
- Overview with real counts (customers, partners, approvals waiting, live providers, demo listings, plans, quotes, requests, chats) and charts.
- Providers: approve, reject (with a note), publish/unpublish, verify (only after checking the business), feature on the homepage, edit profiles, packages and prices, photos, delete. “Edited since approval” flag when a partner changes a live listing.
- Quotes: all requests; answer those for demo or MA3AK-managed listings.
- Plans: open any customer’s plan for support (services and totals).
- Accounts, leads, requests (contact, vendor applications, sent plans), CSV export.
- Website: contact and social links, homepage hero text, budget planner intro, how-it-works steps, FAQs, themes, announcement bar.
- Categories, 3D catalogue, assistant knowledge base, activity history (audit log), integrations status.

**Demo data.** The seed migration adds 18 clearly labelled **demo providers** with illustrative prices so the planner works from day one. They show “Demo listing” everywhere, can’t be verified, have no contact details, and quote requests to them go to the MA3AK team. Unpublish or delete them in Admin → Providers → Demo listings once real partners are live.

---

## Deploy on Netlify

The Netlify project is configured by `netlify.toml`: build `npm run build`, publish `public/`, functions in `netlify/functions/`. Installing `@netlify/database` (already in `package.json`) makes Netlify provision the database; migrations in `netlify/database/migrations/` run automatically before each deploy is published.

1. **Connect the repository.** In Netlify: *Project configuration → Build & deploy → Link repository* (or *Add new project → Import an existing project*), choose GitHub and this repository, branch `main`. Netlify reads `netlify.toml`; leave the build settings as they are.
2. **Environment variables** (*Project configuration → Environment variables*, scope **Functions**):
   - `SESSION_SECRET` — 48+ random characters (mark as secret).
   - `PUBLIC_ORIGIN` — the site address, e.g. `https://ma3ak-events.netlify.app` (add your own domain later, comma-separated).
   - `ADMIN_EMAIL` — the admin email.
   - `ADMIN_PASSWORD` — a strong password (12+ characters, letters and numbers). Used **once** to create the first admin; delete it after you sign in.
   - Optional: `RESEND_API_KEY`, `MAIL_FROM`, `NOTIFY_EMAIL` (emails), `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL` (AI assistant), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, WhatsApp settings. See `.env.example`.
3. **Make the site public** if the team has visitor access control on (*Project configuration → Access & security → Visitor access*: no password, no team login).
4. **Deploy** (push to `main`, or *Deploys → Trigger deploy*). Netlify Database needs a credit-based Netlify plan.
5. Open `/admin/`, sign in with `ADMIN_EMAIL` and the password, then remove `ADMIN_PASSWORD` from the environment and redeploy.

Notes
- Deploy previews get their own database branch, copied from production at creation time. **Preview links are public and can contain production data** — don’t share them.
- Netlify Blobs (photos) is shared by all deploy contexts of the site; avoid uploading test photos from previews.
- Backups: Netlify Database supports snapshots (*Data & Storage → Database*). Take one before big changes. Restoring a snapshot replaces data; it isn’t a routine rollback.
- Daily clean-up runs as a scheduled function (`netlify/functions/cleanup.mjs`, 03:17 UTC): old requests (after `RETENTION_DAYS`, default 730), expired sessions, tokens and rate-limit rows.
- Never edit or delete a migration that has already been applied; add a new file with a later timestamp (`netlify database migrations new -d "..."`). Data changes in production are made the same way (a DML migration) or in the admin.

## Run it locally

Requires Node.js 22.13+ and a Postgres server.

```bash
npm run build
export DATABASE_URL=postgres://user:password@localhost:5432/ma3ak   # any empty database
export SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(36).toString('base64'))")
export ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='choose-a-long-password-1'
npm start            # http://localhost:3000  (applies the migrations automatically)
```

Locally the server uses a small built-in Postgres client (`server/minipg.js`) and stores photos under `DATA_DIR/uploads`. On Netlify it uses `@netlify/database` and Netlify Blobs.

**Tests** (`npm test`) start the real server against a fresh Postgres database for each suite (set `TEST_DATABASE_URL` to a server where you can create databases; default `postgres://postgres@127.0.0.1:5433/postgres`). They cover accounts, isolation between customers and between partners, the planner’s totals, share-link privacy, quotes, admin review, website content, the assistant, uploads and security headers.

**Create or reset an admin** from a terminal: `DATABASE_URL=... npm run create-admin -- you@example.com`.

## Managing the platform

- **Approve a provider:** Admin → Overview → “Waiting for approval” (or Providers → Waiting for approval) → open → read the profile, packages and photos → *Approve and publish*, or *Reject* with a note the partner will see.
- **Verify a provider:** only after you’ve checked the business (registration, Instagram, a call). Providers → open → *Mark as verified*.
- **Add a provider yourself:** Providers → *Add provider* → record their agreement (how they agreed) → save → add packages and photos → *Approve and publish*.
- **Change prices:** Providers → open → Packages → *Edit*. Partners can edit their own. Plans that already include a package keep the old price and show the customer that it changed.
- **Categories:** Admin → Categories (add, rename, reorder, hide; a category in use can’t be deleted).
- **Homepage, contact, FAQs, themes:** Admin → Website. Changes appear immediately.
- **Customer plans:** Admin → Plans (read-only, for support). Customers manage their own plans.
- **Quote requests:** partners answer their own. Requests to demo or MA3AK-managed listings: Admin → Quotes.
- **Activity history:** Admin → Activity.

## Security

- Passwords hashed with scrypt; sessions in HttpOnly, `SameSite` cookies (`__Host-` prefix in production) with CSRF tokens on every change; account lockout after repeated failures.
- Every query uses bound parameters. All authorization is checked on the server: customers only see their own plans (or ones shared with them), partners only their own listing and requests, admin endpoints need an admin session.
- Rate limits are stored in the database (shared by all function instances). Honeypot and timing checks on public forms.
- Uploads: JPG/PNG only, verified from the file bytes, EXIF/GPS and comments removed, 4 MB limit, private storage.
- Strict Content-Security-Policy (no inline scripts), HSTS, `X-Frame-Options: DENY`, `nosniff`, referrer and permissions policies. The admin renders user data with `textContent` only.
- No secrets in the code or the website bundle; `.env` files are git-ignored and `.env.example` holds placeholders only.
