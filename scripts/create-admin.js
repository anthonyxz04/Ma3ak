// Create or reset an admin account from the command line (there is no public admin sign-up page).
//   DATABASE_URL=postgres://… npm run create-admin -- you@example.com
// For the Netlify database, use the connection string from `netlify database status --show-credentials`
// (Team Owners/Developers only) — never commit it.
import readline from 'node:readline';
import { openDb } from '../server/db.js';
import { hashPassword, passwordProblems } from '../server/security.js';

const email = (process.argv[2] || '').trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { console.error('Usage: npm run create-admin -- you@example.com'); process.exit(1); }
if (!process.env.DATABASE_URL) { console.error('Set DATABASE_URL to the Postgres connection string first.'); process.exit(1); }
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('New password (12+ characters, letters and numbers): ', async pw => {
  rl.close(); const p = passwordProblems(pw); if (p) { console.error(p); process.exit(1); }
  const db = await openDb({ connectionString: process.env.DATABASE_URL, applyMigrations: false }), t = new Date().toISOString();
  await db.run('INSERT INTO admins (email, pass_hash, created_at, updated_at) VALUES (?,?,?,?) ON CONFLICT (email) DO UPDATE SET pass_hash = EXCLUDED.pass_hash, failed = 0, locked_until = 0, updated_at = EXCLUDED.updated_at', email, hashPassword(pw), t, t);
  await db.run('DELETE FROM sessions WHERE admin_id = (SELECT id FROM admins WHERE email = ?)', email);
  console.log(`Admin ${email} is ready.`); process.exit(0);
});
