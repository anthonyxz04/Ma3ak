-- Marketplace v2: verification workflow, listing order, pricing model, availability, bookings,
-- quotes with revisions, messaging, notifications, reviews, vendor plans, commission and payments.
-- Additive only: existing columns are kept (old price columns stay until a later clean-up migration).
-- Money is stored in minor units (cents; LBP has no minor unit) together with its currency.

-- ---------- vendors: verification and ordering ----------
ALTER TABLE vendors DROP CONSTRAINT IF EXISTS vendors_status_check;
ALTER TABLE vendors ADD CONSTRAINT vendors_status_check CHECK (status IN ('draft','pending','submitted','under_review','needs_info','approved','rejected','suspended'));
ALTER TABLE vendors
  ADD COLUMN legal_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN business_type TEXT NOT NULL DEFAULT '',
  ADD COLUMN registration_number TEXT NOT NULL DEFAULT '',
  ADD COLUMN address TEXT NOT NULL DEFAULT '',
  ADD COLUMN authorization_statement TEXT NOT NULL DEFAULT '',
  ADD COLUMN details TEXT NOT NULL DEFAULT '{}',
  ADD COLUMN sort_rank INTEGER,
  ADD COLUMN home_rank INTEGER,
  ADD COLUMN sponsored INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN sponsored_until TEXT,
  ADD COLUMN risk_flags TEXT NOT NULL DEFAULT '',
  ADD COLUMN verified_at TEXT,
  ADD COLUMN verified_by BIGINT,
  ADD COLUMN suspended_reason TEXT NOT NULL DEFAULT '',
  ADD COLUMN terms_version TEXT,
  ADD COLUMN terms_accepted_at TEXT,
  ADD COLUMN views INTEGER NOT NULL DEFAULT 0;
CREATE INDEX idx_vendors_rank ON vendors(category, sort_rank);

-- Private verification documents (files live in private storage; only the owner and admins can open them)
CREATE TABLE vendor_documents (
  id TEXT PRIMARY KEY, vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('id_document','business_registration','ownership_proof','authorization_letter','permit','other')),
  mime TEXT NOT NULL, size INTEGER NOT NULL, original_name TEXT NOT NULL DEFAULT '', note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','accepted','rejected')),
  uploaded_at TEXT NOT NULL, reviewed_at TEXT, reviewed_by BIGINT);
CREATE INDEX idx_vendor_docs ON vendor_documents(vendor_id);

-- ---------- packages: price type, currency, inclusions/exclusions, conditions, service fields ----------
ALTER TABLE vendor_packages
  ADD COLUMN price_type TEXT NOT NULL DEFAULT 'starting' CHECK (price_type IN ('fixed','starting','quote')),
  ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD','EUR','LBP')),
  ADD COLUMN price_minor BIGINT,
  ADD COLUMN price_max_minor BIGINT,
  ADD COLUMN exclusions TEXT NOT NULL DEFAULT '[]',
  ADD COLUMN conditions TEXT NOT NULL DEFAULT '',
  ADD COLUMN details TEXT NOT NULL DEFAULT '{}';

-- ---------- availability (dates a provider is NOT available; free dates are never promised) ----------
CREATE TABLE vendor_availability (
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE, day TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('blocked','booked')), note TEXT NOT NULL DEFAULT '', booking_id TEXT,
  created_at TEXT NOT NULL, PRIMARY KEY (vendor_id, day));

-- ---------- plans (events): currency, time; plan lines in minor units ----------
ALTER TABLE events ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD', ADD COLUMN event_time TEXT;
ALTER TABLE event_services
  ADD COLUMN price_type TEXT NOT NULL DEFAULT 'starting',
  ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN unit_price_minor BIGINT,
  ADD COLUMN price_max_minor BIGINT,
  ADD COLUMN discount_minor BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN booking_id TEXT;
ALTER TABLE shares ADD COLUMN show_prices INTEGER NOT NULL DEFAULT 1, ADD COLUMN show_providers INTEGER NOT NULL DEFAULT 1, ADD COLUMN show_date INTEGER NOT NULL DEFAULT 1;

-- ---------- bookings ----------
CREATE TABLE bookings (
  id TEXT PRIMARY KEY, ref TEXT NOT NULL UNIQUE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  vendor_id TEXT REFERENCES vendors(id) ON DELETE SET NULL, vendor_name TEXT NOT NULL,
  package_id TEXT REFERENCES vendor_packages(id) ON DELETE SET NULL, package_snapshot TEXT NOT NULL DEFAULT '{}',
  event_id TEXT REFERENCES events(id) ON DELETE SET NULL, category TEXT NOT NULL,
  customer_name TEXT NOT NULL, customer_email TEXT, customer_phone TEXT,
  event_type TEXT, event_date TEXT, event_time TEXT, location TEXT, address TEXT NOT NULL DEFAULT '', guests INTEGER, quantity INTEGER,
  details TEXT NOT NULL DEFAULT '{}', notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('draft','quote_requested','quote_received','revision_requested','awaiting_vendor','awaiting_payment','confirmed','in_progress','completed','cancellation_requested','cancelled','declined','expired')),
  payment_status TEXT NOT NULL DEFAULT 'none' CHECK (payment_status IN ('none','pending','deposit_paid','paid','partially_refunded','refunded','failed')),
  currency TEXT NOT NULL DEFAULT 'USD',
  estimate_minor BIGINT, agreed_offer_id TEXT,
  agreed_subtotal_minor BIGINT, agreed_discount_minor BIGINT, agreed_fees_minor BIGINT, agreed_total_minor BIGINT, deposit_minor BIGINT,
  agreed_terms TEXT NOT NULL DEFAULT '{}',
  commission_rule_id BIGINT, commission_rate_bps INTEGER, commission_minor BIGINT,
  cancel_requested_by TEXT, cancel_reason TEXT NOT NULL DEFAULT '',
  disputed INTEGER NOT NULL DEFAULT 0, dispute_note TEXT NOT NULL DEFAULT '',
  vendor_note TEXT NOT NULL DEFAULT '',
  confirmed_at TEXT, completed_at TEXT, cancelled_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX idx_bookings_user ON bookings(user_id, created_at);
CREATE INDEX idx_bookings_vendor ON bookings(vendor_id, created_at);
CREATE INDEX idx_bookings_status ON bookings(status);

CREATE TABLE booking_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  at TEXT NOT NULL, actor_type TEXT NOT NULL CHECK (actor_type IN ('customer','vendor','admin','system')), actor_id TEXT,
  action TEXT NOT NULL, from_status TEXT, to_status TEXT, note TEXT NOT NULL DEFAULT '', data TEXT NOT NULL DEFAULT '{}');
CREATE INDEX idx_booking_events ON booking_events(booking_id, id);

-- Quotes, revisions and amendments. An accepted offer is never edited; changes need a new offer the customer accepts.
CREATE TABLE booking_offers (
  id TEXT PRIMARY KEY, booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE, version INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('quote','amendment')),
  status TEXT NOT NULL CHECK (status IN ('sent','accepted','rejected','revision_requested','superseded','expired','withdrawn')),
  currency TEXT NOT NULL, items TEXT NOT NULL DEFAULT '[]',
  subtotal_minor BIGINT NOT NULL, discount_minor BIGINT NOT NULL DEFAULT 0, discount_note TEXT NOT NULL DEFAULT '',
  fees_minor BIGINT NOT NULL DEFAULT 0, fees_detail TEXT NOT NULL DEFAULT '[]', total_minor BIGINT NOT NULL, deposit_minor BIGINT NOT NULL DEFAULT 0,
  payment_schedule TEXT NOT NULL DEFAULT '', inclusions TEXT NOT NULL DEFAULT '[]', exclusions TEXT NOT NULL DEFAULT '[]',
  cancellation_terms TEXT NOT NULL DEFAULT '', event_date TEXT, valid_until TEXT NOT NULL, message TEXT NOT NULL DEFAULT '',
  created_by TEXT, created_at TEXT NOT NULL, responded_at TEXT, response_note TEXT NOT NULL DEFAULT '',
  UNIQUE (booking_id, version));

CREATE TABLE booking_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer','vendor','admin','system')), sender_id TEXT,
  body TEXT NOT NULL, masked INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL,
  read_by_customer_at TEXT, read_by_vendor_at TEXT);
CREATE INDEX idx_booking_messages ON booking_messages(booking_id, id);

-- ---------- notifications (in-app; email only when an email service is configured) ----------
CREATE TABLE notifications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', link TEXT NOT NULL DEFAULT '',
  dedupe_key TEXT, read_at TEXT,
  email_status TEXT NOT NULL DEFAULT 'not_configured' CHECK (email_status IN ('not_configured','skipped','sent','failed')), email_attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL);
CREATE UNIQUE INDEX idx_notifications_dedupe ON notifications(user_id, dedupe_key) WHERE dedupe_key IS NOT NULL;
CREATE INDEX idx_notifications_user ON notifications(user_id, id);

-- ---------- reviews and reports ----------
CREATE TABLE reviews (
  id TEXT PRIMARY KEY, booking_id TEXT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE, user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL, rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5), body TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','hidden')), vendor_reply TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX idx_reviews_vendor ON reviews(vendor_id, status);
CREATE TABLE reports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, reporter_type TEXT NOT NULL, reporter_id TEXT,
  target_type TEXT NOT NULL CHECK (target_type IN ('message','review','vendor','booking')), target_id TEXT NOT NULL,
  reason TEXT NOT NULL, details TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')),
  created_at TEXT NOT NULL, resolved_at TEXT, resolved_by BIGINT, resolution_note TEXT NOT NULL DEFAULT '');
CREATE INDEX idx_reports_status ON reports(status, id);

-- ---------- vendor plans and subscriptions ----------
CREATE TABLE vendor_plans (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, price_minor BIGINT NOT NULL DEFAULT 0, currency TEXT NOT NULL DEFAULT 'USD',
  billing_interval TEXT NOT NULL DEFAULT 'month' CHECK (billing_interval IN ('month','year')),
  entitlements TEXT NOT NULL DEFAULT '{}', description TEXT NOT NULL DEFAULT '', active INTEGER NOT NULL DEFAULT 1, sort INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL, updated_by BIGINT);
CREATE TABLE vendor_subscriptions (
  id TEXT PRIMARY KEY, vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE, plan_id TEXT NOT NULL REFERENCES vendor_plans(id),
  status TEXT NOT NULL CHECK (status IN ('requested','active','comped','cancelled','expired')),
  price_minor BIGINT NOT NULL, currency TEXT NOT NULL, billing_interval TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'manual', provider_ref TEXT,
  started_at TEXT, current_period_end TEXT, cancel_at_period_end INTEGER NOT NULL DEFAULT 0, note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX idx_subscriptions_vendor ON vendor_subscriptions(vendor_id, created_at);

-- ---------- commission rules (history kept: a change ends the old rule and starts a new one) ----------
CREATE TABLE commission_rules (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  scope TEXT NOT NULL CHECK (scope IN ('global','category','vendor')), scope_id TEXT,
  rate_bps INTEGER NOT NULL CHECK (rate_bps BETWEEN 0 AND 5000), note TEXT NOT NULL DEFAULT '',
  created_by BIGINT, created_at TEXT NOT NULL, ended_at TEXT);
CREATE INDEX idx_commission_rules ON commission_rules(scope, scope_id, ended_at);
CREATE TABLE commissions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  vendor_id TEXT, base_minor BIGINT NOT NULL, rate_bps INTEGER NOT NULL, amount_minor BIGINT NOT NULL, currency TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('accrued','invoiced','collected','waived','reversed')), note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX idx_commissions_booking ON commissions(booking_id);

-- ---------- payments (recorded manually until a payment provider is connected) ----------
CREATE TABLE payments (
  id TEXT PRIMARY KEY, booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  kind TEXT NOT NULL CHECK (kind IN ('deposit','balance','full','refund')),
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0), currency TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('offline_cash','offline_transfer','offline_other','provider')),
  provider TEXT, provider_ref TEXT UNIQUE, idempotency_key TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending','succeeded','failed')), note TEXT NOT NULL DEFAULT '',
  recorded_by BIGINT, created_at TEXT NOT NULL);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE TABLE payment_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, provider TEXT NOT NULL, event_id TEXT NOT NULL, type TEXT NOT NULL,
  payload TEXT NOT NULL DEFAULT '{}', received_at TEXT NOT NULL, processed_at TEXT, UNIQUE (provider, event_id));
CREATE TABLE payouts (
  id TEXT PRIMARY KEY, vendor_id TEXT REFERENCES vendors(id) ON DELETE SET NULL, vendor_name TEXT NOT NULL,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0), currency TEXT NOT NULL, method TEXT NOT NULL DEFAULT 'offline_transfer',
  reference TEXT NOT NULL DEFAULT '', note TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('pending','paid')),
  recorded_by BIGINT, created_at TEXT NOT NULL);
