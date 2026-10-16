// Postgres storage. In production on Netlify this is Netlify Database (managed Postgres, provisioned
// automatically). Locally it is any Postgres given by DATABASE_URL. All queries use bound parameters.
//
// SQL in this codebase is written with `?` placeholders; they are converted to Postgres `$1, $2…` here.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';

const INT8 = 20, NUMERIC = 1700;
const MIGRATIONS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../netlify/database/migrations');

// Convert `?` placeholders to `$n` (skipping quoted strings and comments).
const textCache = new Map();
export function toPg(sql) {
  let hit = textCache.get(sql); if (hit) return hit;
  let out = '', n = 0, q = null;
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    if (q) { out += c; if (c === q) q = null; continue; }
    if (c === "'" || c === '"') { q = c; out += c; continue; }
    if (c === '?') { out += '$' + (++n); continue; }
    out += c;
  }
  if (textCache.size < 2000) textCache.set(sql, out);
  return out;
}
const param = v => v === undefined ? null : typeof v === 'boolean' ? (v ? 1 : 0) : (v !== null && typeof v === 'object' && !(v instanceof Date) && !Buffer.isBuffer(v)) ? JSON.stringify(v) : v;
// COUNT/SUM return int8/numeric, which drivers give as strings; return safe numbers instead.
function fixRows(r) {
  const nums = (r.fields || []).filter(f => f.dataTypeID === INT8 || f.dataTypeID === NUMERIC).map(f => f.name);
  if (!nums.length) return r.rows;
  for (const row of r.rows) for (const k of nums) if (row[k] != null) { const n = Number(row[k]); if (Number.isFinite(n)) row[k] = n; }
  return r.rows;
}

export class Db {
  constructor(pool, client = null) { this.pool = pool; this.client = client; }
  async query(sql, params = []) {
    try { const r = await (this.client || this.pool).query(toPg(sql), params.map(param)); return { rows: fixRows(r), rowCount: r.rowCount ?? 0 }; }
    catch (e) { e.sql = sql.slice(0, 200); throw e; }
  }
  async get(sql, ...p) { return (await this.query(sql, p)).rows[0]; }
  async all(sql, ...p) { return (await this.query(sql, p)).rows; }
  async run(sql, ...p) { const r = await this.query(sql, p); return { changes: r.rowCount, rows: r.rows }; }
  stmt(sql) { return { get: (...p) => this.get(sql, ...p), all: (...p) => this.all(sql, ...p), run: (...p) => this.run(sql, ...p) }; }
  // Many rows in a few round trips. `table`, `cols` and `tail` are code constants, never user input.
  async insertMany(table, cols, rows, tail = '') {
    for (let i = 0; i < rows.length; i += 400) {
      const chunk = rows.slice(i, i + 400);
      await this.run(`INSERT INTO ${table} (${cols.join(', ')}) VALUES ${chunk.map(r => '(' + r.map(() => '?').join(',') + ')').join(',')} ${tail}`, ...chunk.flat());
    }
  }
  // All-or-nothing. Inside `fn`, use the handle it receives so every query runs on the same connection.
  async tx(fn) {
    if (this.client) return fn(this);
    const c = await this.pool.connect(), t = new Db(this.pool, c);
    try { await c.query('BEGIN'); const r = await fn(t); await c.query('COMMIT'); return r; }
    catch (e) { await c.query('ROLLBACK').catch(() => {}); throw e; }
    finally { c.release(); }
  }
}

const onNetlify = () => config.onNetlify;
let shared = null;
// One pool per process (one per warm function instance on Netlify).
export async function openDb({ connectionString, applyMigrations } = {}) {
  if (shared && !connectionString) return shared;
  let pool;
  if (!connectionString && onNetlify()) {
    const { getDatabase } = await import('@netlify/database');
    pool = getDatabase().pool;
  } else {
    const url = connectionString || process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set. Point it at a Postgres database (see README).');
    const { Pool } = await import('./minipg.js'); // small built-in driver for local development and tests
    pool = new Pool({ connectionString: url, max: 8 });
  }
  const db = new Db(pool);
  // On Netlify, migrations are applied by the deploy. Locally we apply the same files ourselves.
  if (applyMigrations ?? !onNetlify()) await migrateLocal(db);
  if (!connectionString) shared = db;
  return db;
}
async function migrateLocal(db) {
  await db.run('CREATE TABLE IF NOT EXISTS ma3ak_local_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');
  const done = new Set((await db.all('SELECT name FROM ma3ak_local_migrations')).map(r => r.name));
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => /^\d+_[\w-]+\.sql$/.test(f)).sort();
  for (const f of files) {
    if (done.has(f)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8');
    await db.tx(async t => { await t.client.query(sql); await t.run('INSERT INTO ma3ak_local_migrations (name, applied_at) VALUES (?, ?)', f, now()); });
  }
}

export const now = () => new Date().toISOString();
export const uid = () => crypto.randomUUID();
// Run a function inside a transaction (all-or-nothing). The callback receives the transaction handle.
export const tx = (db, fn) => db.tx(fn);
