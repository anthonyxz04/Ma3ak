-- MA3AK database schema (Postgres). Applied automatically by Netlify on deploy.
-- Timestamps are ISO-8601 text (UTC); epoch-millisecond fields are BIGINT.

-- ---------- website requests (contact, vendor applications, event designs) ----------
CREATE TABLE requests (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ref TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('event','contact','vendor','booking')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','contacted','booked','closed','spam')),
  name TEXT NOT NULL, email TEXT, phone TEXT,
  summary TEXT NOT NULL DEFAULT '', payload TEXT NOT NULL DEFAULT '{}', notes TEXT NOT NULL DEFAULT '',
  ip_hash TEXT, event_id TEXT, user_id TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX idx_req_created ON requests(created_at);
CREATE INDEX idx_req_type_status ON requests(type, status);
CREATE TABLE files (
  id TEXT PRIMARY KEY, request_id BIGINT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  kind TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL);

-- ---------- admin ----------
CREATE TABLE admins (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, email TEXT NOT NULL UNIQUE, pass_hash TEXT NOT NULL,
  failed INTEGER NOT NULL DEFAULT 0, locked_until BIGINT NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE sessions (
  id_hash TEXT PRIMARY KEY, admin_id BIGINT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  csrf TEXT NOT NULL, expires BIGINT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE audit (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, admin_id BIGINT, actor TEXT, action TEXT NOT NULL, target TEXT, detail TEXT, at TEXT NOT NULL);
CREATE INDEX idx_audit_at ON audit(at);

-- ---------- customer and partner accounts ----------
CREATE TABLE users (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL DEFAULT '', phone TEXT, avatar_url TEXT,
  pass_hash TEXT, google_sub TEXT UNIQUE, email_verified INTEGER NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','partner')),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','premium','business')),
  failed INTEGER NOT NULL DEFAULT 0, locked_until BIGINT NOT NULL DEFAULT 0, marketing INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, last_login_at TEXT);
CREATE TABLE user_sessions (id_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, csrf TEXT NOT NULL, expires BIGINT NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE TABLE user_tokens (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, kind TEXT NOT NULL CHECK (kind IN ('verify','reset')), expires BIGINT NOT NULL, used INTEGER NOT NULL DEFAULT 0);

-- ---------- service categories and providers ----------
CREATE TABLE categories (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, single TEXT NOT NULL DEFAULT '', blurb TEXT NOT NULL DEFAULT '', icon TEXT NOT NULL DEFAULT 'more', sort INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL);
CREATE TABLE vendors (
  id TEXT PRIMARY KEY, owner_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL, category TEXT NOT NULL, locations TEXT NOT NULL DEFAULT '', event_types TEXT NOT NULL DEFAULT '', services TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '', about TEXT NOT NULL DEFAULT '', availability_note TEXT NOT NULL DEFAULT '',
  price_from INTEGER, capacity_min INTEGER, capacity_max INTEGER,
  phone TEXT, whatsapp TEXT, instagram TEXT, website TEXT, email TEXT,
  -- publication: a listing is public only when status = 'approved', active = 1 and consent is recorded
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending','approved','rejected')),
  active INTEGER NOT NULL DEFAULT 0, verified INTEGER NOT NULL DEFAULT 0, featured INTEGER NOT NULL DEFAULT 0, is_demo INTEGER NOT NULL DEFAULT 0,
  consent_at TEXT, consent_note TEXT NOT NULL DEFAULT '', review_note TEXT NOT NULL DEFAULT '',
  submitted_at TEXT, approved_at TEXT, partner_updated_at TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX idx_vendors_cat ON vendors(category, status, active);
CREATE INDEX idx_vendors_owner ON vendors(owner_user_id);
CREATE TABLE vendor_packages (
  id TEXT PRIMARY KEY, vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
  price INTEGER, price_max INTEGER,                      -- NULL price = "request a quote"
  unit TEXT NOT NULL DEFAULT 'flat' CHECK (unit IN ('flat','per_guest','per_hour','per_item')),
  min_qty INTEGER, includes TEXT NOT NULL DEFAULT '[]', active INTEGER NOT NULL DEFAULT 1, sort INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX idx_packages_vendor ON vendor_packages(vendor_id, sort);
CREATE TABLE vendor_photos (
  id TEXT PRIMARY KEY, vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  mime TEXT NOT NULL, size INTEGER NOT NULL, alt TEXT NOT NULL DEFAULT '', sort INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
CREATE INDEX idx_photos_vendor ON vendor_photos(vendor_id, sort);

-- ---------- event plans (3D designs and budget plans share one record) ----------
CREATE TABLE events (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, event_type TEXT, event_date TEXT, venue TEXT, location TEXT, setting TEXT,
  guest_count INTEGER, budget INTEGER, style TEXT, notes TEXT NOT NULL DEFAULT '', requirements TEXT NOT NULL DEFAULT '', wanted TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','finalized','sent','booked','archived')),
  progress INTEGER NOT NULL DEFAULT 0, rev INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX idx_events_user ON events(user_id, updated_at);
CREATE TABLE event_selections (event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE, field TEXT NOT NULL, value TEXT NOT NULL, multi INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (event_id, field, value));
CREATE INDEX idx_sel_field ON event_selections(field, value);
CREATE TABLE event_items (id TEXT NOT NULL, event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE, item_type TEXT, source TEXT NOT NULL CHECK (source IN ('added','moved','removed')), x REAL, z REAL, ry REAL, PRIMARY KEY (event_id, id));
CREATE TABLE event_services (
  id TEXT PRIMARY KEY, event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category TEXT NOT NULL, vendor_id TEXT REFERENCES vendors(id) ON DELETE SET NULL, package_id TEXT REFERENCES vendor_packages(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'package' CHECK (source IN ('package','custom')),
  label TEXT NOT NULL, vendor_name TEXT NOT NULL DEFAULT '', unit TEXT NOT NULL DEFAULT 'flat' CHECK (unit IN ('flat','per_guest','per_hour','per_item')),
  unit_price INTEGER, price_max INTEGER,   -- estimate captured when added; NULL unit_price = request a quote
  quantity INTEGER,                        -- NULL on per-guest lines = follow the plan's guest count
  note TEXT NOT NULL DEFAULT '', sort INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX idx_services_event ON event_services(event_id, sort);
CREATE TABLE event_versions (id TEXT PRIMARY KEY, event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE, label TEXT NOT NULL, snapshot TEXT NOT NULL, created_by TEXT, created_at TEXT NOT NULL);
CREATE INDEX idx_versions_event ON event_versions(event_id, created_at);
CREATE TABLE event_members (event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, role TEXT NOT NULL CHECK (role IN ('viewer','editor')), created_at TEXT NOT NULL, PRIMARY KEY (event_id, user_id));
CREATE TABLE shares (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE, permission TEXT NOT NULL CHECK (permission IN ('view','edit')), created_at TEXT NOT NULL, expires_at TEXT, revoked INTEGER NOT NULL DEFAULT 0, views INTEGER NOT NULL DEFAULT 0);
CREATE TABLE favorites (user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, item_id TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY (user_id, item_id));

-- ---------- quote requests to providers ----------
CREATE TABLE quotes (
  id TEXT PRIMARY KEY, ref TEXT NOT NULL UNIQUE, vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  package_id TEXT REFERENCES vendor_packages(id) ON DELETE SET NULL, event_id TEXT REFERENCES events(id) ON DELETE SET NULL, user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL, email TEXT, phone TEXT, event_date TEXT, guests INTEGER, location TEXT, message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','replied','quoted','accepted','declined','closed')),
  quoted_amount INTEGER, reply TEXT NOT NULL DEFAULT '', partner_note TEXT NOT NULL DEFAULT '', ip_hash TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX idx_quotes_vendor ON quotes(vendor_id, created_at);
CREATE INDEX idx_quotes_user ON quotes(user_id, created_at);

-- ---------- 3D designer catalogue, AI, analytics ----------
CREATE TABLE catalog_items (id TEXT PRIMARY KEY, category TEXT NOT NULL, name TEXT NOT NULL, model TEXT, field TEXT, value TEXT, rarity TEXT NOT NULL DEFAULT 'c' CHECK (rarity IN ('c','r','e','l')), price_from INTEGER, image_id TEXT, tags TEXT NOT NULL DEFAULT '', featured INTEGER NOT NULL DEFAULT 0, is_new INTEGER NOT NULL DEFAULT 0, popular INTEGER NOT NULL DEFAULT 0, available INTEGER NOT NULL DEFAULT 1, sort INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL);
CREATE TABLE kb_entries (id TEXT PRIMARY KEY, topic TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE ai_conversations (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id) ON DELETE CASCADE, event_id TEXT REFERENCES events(id) ON DELETE SET NULL, anon TEXT, handoff INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE ai_messages (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE, role TEXT NOT NULL, content TEXT NOT NULL, actions TEXT, created_at TEXT NOT NULL);
CREATE TABLE analytics (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name TEXT NOT NULL, user_id TEXT, anon TEXT, props TEXT, at TEXT NOT NULL);
CREATE INDEX idx_analytics ON analytics(name, at);

-- ---------- guests, timeline, checklist, invitations ----------
CREATE TABLE guests (
  id TEXT PRIMARY KEY, event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL, phone TEXT, email TEXT, party TEXT NOT NULL DEFAULT '',
  rsvp TEXT NOT NULL DEFAULT 'pending' CHECK (rsvp IN ('pending','confirmed','declined')),
  vip INTEGER NOT NULL DEFAULT 0, plus_one INTEGER NOT NULL DEFAULT 0, dietary TEXT NOT NULL DEFAULT '',
  table_no INTEGER, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX idx_guests_event ON guests(event_id, name);
CREATE TABLE timeline_items (id TEXT PRIMARY KEY, event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE, at TEXT NOT NULL, title TEXT NOT NULL, sort INTEGER NOT NULL DEFAULT 0);
CREATE INDEX idx_timeline_event ON timeline_items(event_id, sort);
CREATE TABLE checklist_items (id TEXT PRIMARY KEY, event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE, phase TEXT NOT NULL, title TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0, sort INTEGER NOT NULL DEFAULT 0);
CREATE INDEX idx_checklist_event ON checklist_items(event_id, sort);
CREATE TABLE invitations (
  event_id TEXT PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE, token TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '', host TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '', event_date TEXT, event_time TEXT,
  location TEXT NOT NULL DEFAULT '', dress_code TEXT NOT NULL DEFAULT '', rsvp_by TEXT, rsvp_open INTEGER NOT NULL DEFAULT 1,
  theme TEXT NOT NULL DEFAULT '[]', cover_id TEXT, published INTEGER NOT NULL DEFAULT 0, views INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

-- ---------- website content editable from the admin ----------
CREATE TABLE site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL, updated_by BIGINT);

-- ---------- rate limits shared by every server instance ----------
CREATE TABLE rate_limits (k TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at BIGINT NOT NULL);
