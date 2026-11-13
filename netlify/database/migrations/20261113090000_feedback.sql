-- Website feedback: ideas, problems, compliments sent from the "Send feedback" page.
-- New table only (backward-compatible: older code simply never reads it).
CREATE TABLE IF NOT EXISTS feedback (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ref TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('idea','problem','praise','other')),
  rating INTEGER CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  message TEXT NOT NULL,
  email TEXT,
  page TEXT NOT NULL DEFAULT '',
  lang TEXT NOT NULL DEFAULT '',
  user_id TEXT,
  ip_hash TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','done','spam')),
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  handled_by BIGINT);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status, id);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at);
