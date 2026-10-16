// Activity history shown in Admin → Activity. Never stores passwords, tokens or message bodies.
import { now } from './db.js';

export async function audit(db, who, action, target = null, detail = null) {
  try {
    await db.run('INSERT INTO audit (admin_id, actor, action, target, detail, at) VALUES (?,?,?,?,?,?)',
      who?.admin_id ?? null, who?.actor ?? (who?.email ? `admin:${who.email}` : null), action, target == null ? null : String(target).slice(0, 200), detail == null ? null : String(detail).slice(0, 500), now());
  } catch { console.warn('audit: could not record', action); }
}
