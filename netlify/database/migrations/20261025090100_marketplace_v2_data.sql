-- Marketplace v2 data: backfill new columns, move old quote requests into bookings, seed plans,
-- the default commission rule and new settings. Runs once.

UPDATE vendors SET status = 'submitted' WHERE status = 'pending';
UPDATE vendors SET verified_at = COALESCE(approved_at, updated_at) WHERE verified = 1 AND verified_at IS NULL;

UPDATE vendor_packages SET
  price_type = CASE WHEN price IS NULL THEN 'quote' ELSE 'starting' END,
  price_minor = CASE WHEN price IS NULL THEN NULL ELSE price::bigint * 100 END,
  price_max_minor = CASE WHEN price_max IS NULL THEN NULL ELSE price_max::bigint * 100 END;

UPDATE event_services SET
  price_type = CASE WHEN unit_price IS NULL THEN 'quote' ELSE 'starting' END,
  unit_price_minor = CASE WHEN unit_price IS NULL THEN NULL ELSE unit_price::bigint * 100 END,
  price_max_minor = CASE WHEN price_max IS NULL THEN NULL ELSE price_max::bigint * 100 END;

-- Old one-step quote requests become bookings, keeping their reference numbers.
INSERT INTO bookings (id, ref, user_id, vendor_id, vendor_name, package_id, package_snapshot, event_id, category,
  customer_name, customer_email, customer_phone, event_date, location, guests, notes, status, currency, created_at, updated_at)
SELECT q.id, q.ref, q.user_id, q.vendor_id, v.name, q.package_id,
  COALESCE((SELECT json_build_object('name', p.name, 'unit', p.unit, 'priceType', CASE WHEN p.price IS NULL THEN 'quote' ELSE 'starting' END,
    'priceMinor', p.price::bigint * 100, 'priceMaxMinor', p.price_max::bigint * 100, 'currency', 'USD')::text FROM vendor_packages p WHERE p.id = q.package_id), '{}'),
  q.event_id, v.category, q.name, q.email, q.phone, q.event_date, q.location, q.guests, q.message,
  CASE q.status WHEN 'new' THEN 'quote_requested' WHEN 'replied' THEN 'quote_requested' WHEN 'quoted' THEN 'quote_received'
    WHEN 'accepted' THEN 'quote_received' WHEN 'declined' THEN 'declined' ELSE 'cancelled' END,
  'USD', q.created_at, q.updated_at
FROM quotes q JOIN vendors v ON v.id = q.vendor_id
ON CONFLICT DO NOTHING;

INSERT INTO booking_offers (id, booking_id, version, kind, status, currency, items, subtotal_minor, total_minor, valid_until, message, created_at)
SELECT q.id || '-o1', q.id, 1, 'quote', 'sent', 'USD', '[]', q.quoted_amount::bigint * 100, q.quoted_amount::bigint * 100,
  to_char(now() + interval '30 days', 'YYYY-MM-DD'), q.reply, q.updated_at
FROM quotes q WHERE q.status IN ('quoted', 'accepted') AND q.quoted_amount IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO booking_messages (booking_id, sender_type, sender_id, body, created_at)
SELECT q.id, 'customer', q.user_id, q.message, q.created_at FROM quotes q WHERE q.message <> '' AND EXISTS (SELECT 1 FROM bookings b WHERE b.id = q.id);
INSERT INTO booking_messages (booking_id, sender_type, body, created_at)
SELECT q.id, 'vendor', q.reply, q.updated_at FROM quotes q WHERE q.reply <> '' AND q.status NOT IN ('quoted', 'accepted') AND EXISTS (SELECT 1 FROM bookings b WHERE b.id = q.id);
INSERT INTO booking_events (booking_id, at, actor_type, action, to_status, note)
SELECT b.id, b.created_at, 'system', 'migrated', b.status, 'Moved from the earlier quote-request system' FROM bookings b;

-- Vendor plans. Prices are editable in Admin → Plans; Pro can't be bought online until billing is connected.
INSERT INTO vendor_plans (id, name, price_minor, currency, billing_interval, entitlements, description, sort, updated_at) VALUES
  ('free', 'Ma3ak Free', 0, 'USD', 'month',
   '{"maxPhotos":10,"maxPackages":10,"analytics":false,"leadTools":false,"featuredEligible":false,"portfolioSections":false}',
   'Verified profile after approval, standard listing, packages and prices, booking requests and quotes, messaging.', 0, '2026-10-25T09:01:00.000Z'),
  ('pro', 'Ma3ak Pro', 3999, 'USD', 'month',
   '{"maxPhotos":40,"maxPackages":40,"analytics":true,"leadTools":true,"featuredEligible":true,"portfolioSections":true}',
   'Everything in Free, plus performance analytics, more photos and packages, lead tools (private notes and CSV export) and eligibility for featured placements. Same verification rules as Free. No guaranteed bookings or placement.', 1, '2026-10-25T09:01:00.000Z')
ON CONFLICT DO NOTHING;

-- No commission until an administrator sets a rate (the 5% in the brief is an example, not a decision).
INSERT INTO commission_rules (scope, scope_id, rate_bps, note, created_at)
SELECT 'global', NULL, 0, 'Default: no commission until set by an administrator', '2026-10-25T09:01:00.000Z'
WHERE NOT EXISTS (SELECT 1 FROM commission_rules);

INSERT INTO site_settings (key, value, updated_at) VALUES
  ('customerFees', '[]', '2026-10-25T09:01:00.000Z'),
  ('listingSort', '{"sponsoredFirst":false,"auto":"quality"}', '2026-10-25T09:01:00.000Z'),
  ('bookingPolicy', '{"offerValidityDays":14,"defaultCancellationTerms":"No special cancellation terms were set by the provider. Ask them before you accept if this matters to you.","reviewWindowDays":180}', '2026-10-25T09:01:00.000Z'),
  ('vendorTerms', '{"version":"2026-10-25","text":"1. Accurate listings. Your profile, photos, packages, prices and availability must be accurate and yours to offer.\n2. Prices. Fixed prices are binding under the conditions you state. Starting prices and custom quotes become binding only when the customer accepts your written quote. You cannot change an accepted price on your own: send an amendment the customer must accept.\n3. Fees. Ma3ak may charge a commission on bookings that come through Ma3ak. The rate that applies is shown in your partner page and is recorded on each booking when it is confirmed. A subscription (Ma3ak Pro) is separate from commission and optional.\n4. Bookings through Ma3ak. Do not ask customers you met through Ma3ak to move a booking off the platform to avoid agreed fees. Ma3ak may review repeated diversion and suspend listings after giving you a chance to respond.\n5. Customer data. Use customer details only for the booking they relate to. Do not share them.\n6. Cancellations. Honour the cancellation terms in the quote the customer accepted.\n7. Verification. Ma3ak reviews your documents before your listing is published and may ask for more information or suspend a listing that no longer meets these terms.\nThese terms are a draft prepared for Ma3ak and should be reviewed by a lawyer before launch."}', '2026-10-25T09:01:00.000Z')
ON CONFLICT (key) DO NOTHING;
