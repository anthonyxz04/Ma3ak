-- Star ratings (1–5):
--  * any signed-in customer can rate a provider once (a review without a booking);
--    reviews that come from a completed booking keep their booking_id and show "Verified booking";
--  * ratings for each event type on the Events page;
--  * a customer's rating of their own event, after its date.
-- Backward-compatible: only relaxes one NOT NULL and adds a table, an index and columns.
ALTER TABLE reviews ALTER COLUMN booking_id DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_customer_once ON reviews(vendor_id, user_id) WHERE booking_id IS NULL;

CREATE TABLE IF NOT EXISTS event_type_ratings (
  event_type TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (event_type, user_id));

ALTER TABLE events ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating IS NULL OR rating BETWEEN 1 AND 5);
ALTER TABLE events ADD COLUMN IF NOT EXISTS rating_comment TEXT NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS rated_at TEXT;
CREATE INDEX IF NOT EXISTS idx_events_rated ON events(rated_at) WHERE rated_at IS NOT NULL;
