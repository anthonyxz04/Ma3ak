// The signed-in provider (partner) and their own listing. One listing per partner account.
// Every partner route goes through this, so a partner can only ever reach their own records.
import { fail } from './http.js';
import { requireUser } from './users.js';

export function partnerGuard(db) {
  return async (req, res, write = false) => {
    const u = await requireUser(req, res, db, { write }); if (!u) return null;
    if (u.role !== 'partner') { fail(res, 403, 'This page is for provider accounts.', { code: 'not_partner' }); return null; }
    const v = await db.get('SELECT * FROM vendors WHERE owner_user_id = ?', u.id);
    if (!v) { fail(res, 404, 'Your provider profile was not found. Contact MA3AK.'); return null; }
    return { u, v };
  };
}
