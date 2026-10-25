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
  - Money is exact: integer cents plus a currency (USD, EUR, LBP). Totals are kept per currency and are never converted. Customer fees, when the admin sets any, are shown line by line. A price is labelled *estimate* until a provider’s quote is accepted; it then shows as *Agreed*.
  - Share links can leave out prices, provider names and the date.
- **Dashboard** (`/#/dashboard`): saved plans with estimated totals, plans shared with you, bookings with their status, favourite providers. A notification bell in the header lists updates.
- **Provider directory** (`/#/vendors`, `/#/search`, `/#/vendor/<id>`):
  - search and filters (category, area, event type, price, guests, features);
  - packages with fixed, starting or custom-quote prices, inclusions, exclusions and conditions;
  - photos, the dates the provider has blocked, and reviews from completed bookings;
  - request to book, add to plan, save as favourite.
- **Booking requests** (`/#/book/<provider>` → `/#/bookings/<id>`): see *Bookings and payments* below.
- **Assistant**: uses an AI model if `AI_PROVIDER`/`AI_API_KEY` are set; otherwise a built-in assistant answers from the database (providers, package prices, budget split guidelines, themes, FAQs, contact). It never confirms availability or invents prices.
- 3D designer, guest list, seating, timeline, checklist and digital invitations (from earlier versions) keep working on the same saved events.

**Providers (partners)** — `/#/partner/join`, `/#/partner`
- Sign up as a partner (or turn a customer account into one). The listing starts as a **private draft**.
- **Profile:** areas, event types, features, capacity, contacts, and fields specific to the category (e.g. venue capacity and facilities, photography deliverables). Private business details (legal name, registration, address) are only seen by MA3AK.
- **Packages:** fixed price (conditions required), starting price, or custom quote, each with a currency, unit (flat, per guest, per hour, per item), inclusions, exclusions and service-specific details.
- **Photos** (resized in the browser; metadata stripped on the server).
- **Verification:** documents (ID, business registration, proof of ownership or authorisation) uploaded privately, then submitted with a statement of authority. Statuses: Draft → Submitted → Under review → More info required → Verified / Rejected, and Suspended. **Only an administrator approves**; the same rules apply on every plan.
- **Availability:** a calendar to block dates. Customers can’t request blocked dates; free dates are never promised.
- **Bookings:**
  - answer requests with a quote, a revised quote or a confirmation at the package price, or decline them;
  - record a deposit received, propose changes, message the customer;
  - export to a spreadsheet (Pro).
- **Reviews** with public replies; **Plan & fees** (Ma3ak Free / Ma3ak Pro, the commission rate, partner terms to accept); **Analytics** (Pro).
- Partners can only see and change their own listing, documents and bookings.

**Admin** — `/admin/`
- **Overview** with real counts (verifications waiting, live providers, open requests, bookings, reports, disputes, plan requests…) and charts.
- **Providers:**
  - verification queue, private documents (every opening is logged), automatic risk flags (hints only), and a 4-point checklist required to approve;
  - request more information, reject, suspend or reinstate;
  - publish or unpublish, feature, mark as sponsored (always labelled), and manage plans manually;
  - edit profiles, packages, photos and blocked dates.
- **Bookings:**
  - every request and booking with its history, offers, messages, payments and commission;
  - cancel, complete, flag or resolve disputes, approve cancellations, record payments and refunds;
  - quote on behalf of MA3AK-managed listings.
- **Listing order:** drag-and-drop order per category, homepage featured, category order, and the default sort (sponsored first or not, then quality, rating, newest or name).
- **Commission & payments:** commission rates (everyone / category / provider, with history), the commission ledger, payments recorded, payouts made.
- **Provider plans:** prices and limits of Ma3ak Free and Ma3ak Pro; subscription requests.
- **Reviews & reports:** hide or publish reviews; resolve reports about messages, reviews, providers or bookings.
- **Plans** (customer budget plans, read-only for support), accounts, leads, website requests, CSV export.
- **Website:** contact, homepage, how it works, FAQs, themes, announcement, **customer fees**, **booking rules** (quote validity, review window, default cancellation wording) and **partner terms** (versioned).
- **Other:** categories, 3D catalogue, assistant knowledge base, activity history (audit log), integrations status.

**Demo data.** The seed migration adds 18 clearly labelled **demo providers** with illustrative prices so the planner works from day one. They show “Demo listing” everywhere, can’t be verified, have no contact details, always appear after real providers, and **can’t be booked**. Unpublish or delete them in Admin → Providers → Demo listings once real partners are live.

## Bookings and payments

The status rules are enforced on the server (`server/bookings.js`). Every change records who made it and when.

**Request.**
- Customers must be signed in, and must confirm their email when email is set up.
- They choose a package (or a custom quote), add the event details and their phone number with its country code, check a review screen, and send.
- They get a reference like `B-261025-K7M2QX`. The request is never called “confirmed”.

**Fixed-price package.** The request waits for the provider. The provider confirms the date at the package price (or sends a different quote), or declines.

**Quote.**
- The provider sends line items, an optional discount with a reason, any customer fees, the total, an optional deposit, the payment schedule, inclusions, exclusions, cancellation terms and an expiry date.
- The customer accepts (after ticking “I accept this price and these terms”), asks for changes, or declines.
- Unanswered quotes expire.

**Price lock.** On acceptance, the agreed amounts and terms are copied onto the booking and can’t be edited. A later change is an *amendment*: it only applies if the customer accepts it.

**Payments.**
- With no deposit, the booking is confirmed straight away. With a deposit, it waits until a payment is *recorded* that covers it.
- Payment status is kept separately from booking status.
- No online payment provider is connected: nothing is charged on the website, and no card data is ever handled. See [docs/payments-lebanon.md](docs/payments-lebanon.md) for options in Lebanon.

**Commission.**
- Set by MA3AK (for everyone, a category or one provider) and shown to providers before they accept terms.
- Fixed on each booking when the price is agreed, and written to a ledger.
- Reversed if the booking is cancelled. It is invoiced, not deducted.

**Cancellation.** Before agreement, the customer can cancel directly. After agreement, one side requests it and the other side (or MA3AK) answers.

**Privacy.**
- The provider sees the customer’s email, phone and address only once the booking is confirmed.
- Messages before confirmation have phone numbers, emails and WhatsApp/Instagram links hidden.
- Messages, reviews, providers and bookings can be reported.

**Reviews.** Only after a completed booking, once per booking, within the review window. Shown as “Verified booking”.

**Notifications.** Created in the app for every step, with no duplicates; also sent by email when an email service is configured. The daily clean-up sends reminders two days before an event, expires old quotes and retries failed emails.

---

## Deploy on Netlify

The Netlify project is configured by `netlify.toml`: build `npm run build`, publish `public/`, functions in `netlify/functions/`. Installing `@netlify/database` (already in `package.json`) makes Netlify provision the database; migrations in `netlify/database/migrations/` run automatically before each deploy is published.

1. **Connect the repository.** In Netlify: *Project configuration → Build & deploy → Link repository* (or *Add new project → Import an existing project*), choose GitHub and this repository, branch `main`. Netlify reads `netlify.toml`; leave the build settings as they are.
2. **Environment variables** (*Project configuration → Environment variables*, scope **Functions**):
   - `SESSION_SECRET` — optional on Netlify: if it isn't set, the server creates a random key once and keeps it in the database. Set it (48+ random characters, marked secret) if you prefer to manage it yourself.
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

**Tests** (`npm test`) start the real server against a fresh Postgres database for each suite (set `TEST_DATABASE_URL` to a server where you can create databases; default `postgres://postgres@127.0.0.1:5433/postgres`). They cover:
- accounts, and isolation between customers and between partners;
- verification with private documents, and that paid plans never verify anyone;
- listing order, the planner’s totals, and share-link privacy;
- the booking form and the booking status rules, quotes, revisions, expiry and the price lock;
- payments recorded once (idempotency), refund limits, commission calculation and its snapshot;
- message masking, reviews, reports, notifications, Pro entitlements and account-deletion rules;
- admin review, website content, the assistant, uploads and security headers.

**Create or reset an admin** from a terminal: `DATABASE_URL=... npm run create-admin -- you@example.com`.

## Managing the platform

**Verify a provider**
1. Admin → Overview → “Waiting for verification”.
2. Open the provider. Read the profile and packages, and open the documents (each opening is logged).
3. Accept or reject each document.
4. Tick the four checklist items and choose *Approve and verify*. Or ask for more information, or reject with a note the provider sees.

**Suspend a provider:** Providers → open → *Suspend* (with a reason). The listing is hidden immediately.

**Order listings:** Admin → Listing order. Drag providers within a category, choose the homepage featured providers and the category order, and set the default sort. Real providers always come before demo listings.

**Sponsored placement:** Providers → open → *Mark as sponsored* until a date. It is labelled “Sponsored” on the website and never affects verification.

**Commission:** Admin → Commission & payments → set a rate for everyone, a category or a provider. Existing bookings keep their rate.

**Ma3ak Pro**
1. When a provider requests it (Admin → Provider plans), arrange payment with them.
2. Open the provider → *Activate Pro (paid)* with the end date and how they paid. Or *Give Pro free*.
3. Change the price or limits in Admin → Provider plans.

**Payments and refunds:** Bookings → open → *Record a payment or refund* (only money actually received or refunded). Record payouts to providers in Commission & payments.

**Customer fees, booking rules and partner terms:** Admin → Website → *Marketplace rules*. Change the terms’ version whenever you change their text, so providers accept them again.

**Add a provider yourself:** Providers → *Add provider* → record their agreement → add packages and photos → approve with the checklist. You answer its booking requests in Bookings.

**Categories, homepage, contact, FAQs, themes:** Admin → Categories / Website. Changes appear immediately.

**Activity history:** Admin → Activity.

## Security

- Passwords hashed with scrypt; sessions in HttpOnly, `SameSite` cookies (`__Host-` prefix in production) with CSRF tokens on every change; account lockout after repeated failures.
- Every query uses bound parameters. All authorization is checked on the server:
  - customers see only their own plans (or ones shared with them) and their own bookings;
  - partners see only their own listing, documents and bookings;
  - admin endpoints need an admin session.
- Booking actions are checked against the booking’s status and the user’s role on the server, and a concurrent change is refused rather than applied twice.
- Verification documents are stored privately (Netlify Blobs store `ma3ak-documents`), always downloaded as attachments (never shown inline), and readable only by their provider and administrators.
- Rate limits are stored in the database (shared by all function instances). Honeypot and timing checks on public forms.
- Uploads: JPG/PNG only, verified from the file bytes, EXIF/GPS and comments removed, 4 MB limit, private storage.
- Strict Content-Security-Policy (no inline scripts), HSTS, `X-Frame-Options: DENY`, `nosniff`, referrer and permissions policies. The admin renders user data with `textContent` only.
- No secrets in the code or the website bundle; `.env` files are git-ignored and `.env.example` holds placeholders only.
