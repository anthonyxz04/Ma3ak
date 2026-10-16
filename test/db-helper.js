// Each test run gets its own empty Postgres database (created here, dropped afterwards).
// Set TEST_DATABASE_URL to a Postgres server you can create databases on (default: local port 5433).
import { Pool } from '../server/minipg.js';
const ADMIN_URL = process.env.TEST_DATABASE_URL || 'postgres://postgres@127.0.0.1:5433/postgres';
export async function freshDatabase(prefix) {
  const name = `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6)}`.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const p = new Pool({ connectionString: ADMIN_URL, max: 1 }); await p.query(`CREATE DATABASE ${name}`); await p.end();
  const u = new URL(ADMIN_URL); u.pathname = '/' + name;
  return { url: u.toString(), async drop() { const q = new Pool({ connectionString: ADMIN_URL, max: 1 }); await q.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`).catch(() => {}); await q.end(); } };
}
