// AI event assistant. Knows the customer's current event, MA3AK's catalogue, and the business
// knowledge base (editable in the admin). Suggests changes as proposals the customer must approve.
import { config } from './config.js';
import { now, uid } from './db.js';
import { sendJson, fail, readJson } from './http.js';
import { currentUser } from './users.js';
import { rateLimit, clientIp, ipHash, originAllowed } from './security.js';
import { sanitizeChoices, clean } from './validate.js';
import { entitlements } from './plans.js';
import { status } from './integrations.js';
import { rulesReply } from './assistant.js';

// Fields the assistant may propose changes to, with the values the builder understands.
const ALLOWED = { venueType: 'list', timeOfDay: 'one', venueSize: 'one', guests: 'num', seating: 'list', colors: 'list', style: 'list', chairs: 'list', linens: 'list', centerpieces: 'list', flowerLevel: 'one', areas: 'list', music: 'list', backdrop: 'list', balloons: 'one', lights: 'list', effects: 'list', service: 'list', desserts: 'list', drinks: 'list', activities: 'list', technical: 'list', extrasDecor: 'list', cake: 'one', cakeTiers: 'num', danceFloor: 'one', budget: 'num' };
function cleanActions(actions) {
  if (!Array.isArray(actions)) return [];
  return actions.slice(0, 3).map(a => {
    const changes = {};
    for (const [k, v] of Object.entries(a?.changes || {})) {
      const t = ALLOWED[k]; if (!t) continue;
      if (t === 'list' && Array.isArray(v)) changes[k] = v.slice(0, 12).map(x => clean(x, 80)).filter(Boolean);
      else if (t === 'one' && typeof v === 'string') changes[k] = clean(v, 80);
      else if (t === 'num' && Number.isFinite(+v)) changes[k] = Math.max(0, Math.min(1e7, Math.round(+v)));
    }
    return { label: clean(a?.label, 80) || 'Apply suggestion', changes };
  }).filter(a => Object.keys(a.changes).length);
}
function eventContext(s) {
  if (!s || !Object.keys(s).length) return 'The customer has not started designing an event yet.';
  const lines = Object.entries(s).filter(([k]) => !k.startsWith('_') && !['fullName','phone','email'].includes(k)).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
  return lines.join('\n').slice(0, 3500);
}
async function systemPrompt(db, s) {
  const kb = (await db.all('SELECT topic, title, body FROM kb_entries ORDER BY topic, title')).map(k => `## ${k.topic}: ${k.title}\n${k.body}`).join('\n\n').slice(0, 9000);
  const cat = (await db.all('SELECT category, name, field, value FROM catalog_items WHERE available = 1 ORDER BY category, sort'));
  const catalog = cat.map(c => `${c.category}: ${c.name}${c.field ? ` (sets ${c.field} = "${c.value}")` : ''}`).join('\n');
  return `You are the MA3AK event planning assistant for a Lebanese event-planning company. Be warm, concise (under 120 words unless asked for detail), and practical.
Ground every recommendation in the customer's CURRENT EVENT below. Only recommend items from the CATALOGUE. Never invent prices, availability, packages or policies: use the BUSINESS KNOWLEDGE, and if something isn't there, say the team will confirm.
When a concrete change would help, propose it as an action. The customer must approve every action; never claim you changed their event.
If the customer wants to book, get a quote, talk to a person, or has a complaint, set "handoff": true and offer to connect them with the team.
Reply ONLY with JSON: {"reply": string, "actions": [{"label": string, "changes": {field: value}}], "handoff": boolean}. Allowed fields: ${Object.keys(ALLOWED).join(', ')}. List fields take arrays of the exact catalogue values.

CURRENT EVENT
${eventContext(s)}

CATALOGUE
${catalog}

BUSINESS KNOWLEDGE
${kb || 'No business knowledge has been added yet. For prices, packages and availability, say the team will confirm.'}`;
}
async function callModel(system, messages) {
  if (config.aiProvider === 'mock') {
    const last = messages[messages.length - 1].content.toLowerCase();
    if (/book|human|person|quote/.test(last)) return JSON.stringify({ reply: 'I’ll connect you with our team. Here’s how to reach them.', actions: [], handoff: true });
    return JSON.stringify({ reply: 'For a more luxurious feel, add chandeliers and a kosha.', actions: [{ label: 'Add chandeliers and a kosha', changes: { lights: ['Chandeliers'], areas: ['Kosha / couple’s stage'], hacked: ['x'] } }], handoff: false });
  }
  if (config.aiProvider === 'anthropic') {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': config.aiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: config.aiModel || 'claude-haiku-4-5-20251001', max_tokens: 800, system, messages }), signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error(`provider_${r.status}`); const j = await r.json(); return (j.content || []).map(c => c.text || '').join('');
  }
  if (config.aiProvider === 'openai') {
    const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${config.aiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: config.aiModel, max_tokens: 800, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, ...messages] }), signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error(`provider_${r.status}`); const j = await r.json(); return j.choices?.[0]?.message?.content || '';
  }
  throw new Error('not_configured');
}
function parse(text) {
  const m = String(text).match(/\{[\s\S]*\}/); let j = null; try { j = JSON.parse(m ? m[0] : text); } catch {}
  if (!j || typeof j.reply !== 'string') return { reply: clean(text, 2000) || 'Sorry, I didn’t catch that. Could you rephrase?', actions: [], handoff: false };
  return { reply: clean(j.reply, 2000), actions: cleanActions(j.actions), handoff: j.handoff === true };
}

export function aiRoutes(db, track) {
  return {
    // Always available: an AI model when configured on the server, otherwise the built-in assistant that answers from the database.
    'GET /api/ai/status': async (req, res) => sendJson(res, 200, { ok: true, configured: true, mode: status().ai.configured ? 'ai' : 'rules' }),
    'POST /api/ai/chat': async (req, res) => {
      if (!originAllowed(req)) return fail(res, 403, 'Request blocked.');
      const aiOn = status().ai.configured;
      const u = await currentUser(req, db), key = u ? `u:${u.id}` : `a:${ipHash(clientIp(req))}`;
      const daily = aiOn ? await rateLimit(`ai:d:${key}`, u ? entitlements(u).aiPerDay : 10, 864e5) : await rateLimit(`ai:r:${key}`, 300, 864e5), burst = await rateLimit(`ai:m:${key}`, aiOn ? 6 : 20, 60e3);
      if (!daily.ok || !burst.ok) return fail(res, 429, u || !aiOn ? 'You’ve sent a lot of messages. Please try again a little later.' : 'Create a free account to keep chatting with the assistant.');
      let b; try { b = await readJson(req, 64e3); } catch (e) { return fail(res, e.status || 400, e.message); }
      const msg = clean(b.message, 2000); if (!msg) return fail(res, 422, 'Type a message.');
      let conv = b.conversationId ? (await db.get('SELECT * FROM ai_conversations WHERE id = ?', String(b.conversationId))) : null;
      if (conv && (u ? conv.user_id !== u.id : conv.anon !== key)) conv = null; // never continue someone else's chat
      const t = now();
      if (!conv) { conv = { id: uid() }; (await db.run('INSERT INTO ai_conversations (id, user_id, event_id, anon, created_at, updated_at) VALUES (?,?,?,?,?,?)', conv.id, u?.id || null, null, u ? null : key, t, t)); }
      if (u && b.eventId) { const owns = (await db.get('SELECT 1 FROM events e LEFT JOIN event_members m ON m.event_id = e.id AND m.user_id = ? WHERE e.id = ? AND (e.user_id = ? OR m.user_id IS NOT NULL)', u.id, String(b.eventId), u.id)); if (owns) (await db.run('UPDATE ai_conversations SET event_id = ? WHERE id = ?', String(b.eventId), conv.id)); }
      const history = (await db.all('SELECT role, content FROM ai_messages WHERE conversation_id = ? ORDER BY id DESC LIMIT 12', conv.id)).reverse().map(m => ({ role: m.role, content: m.content }));
      (await db.run('INSERT INTO ai_messages (conversation_id, role, content, created_at) VALUES (?,?,?,?)', conv.id, 'user', msg, t));
      const state = sanitizeChoices(b.state || {}); let out, mode = aiOn ? 'ai' : 'rules';
      if (aiOn) { try { out = parse(await callModel(await systemPrompt(db, state), [...history, { role: 'user', content: msg }])); } catch { console.warn('ai: provider error, using the built-in assistant'); mode = 'rules'; } }
      if (mode === 'rules') { const r = await rulesReply(db, msg, { eventType: state.eventType }); out = { reply: r.reply, actions: [], handoff: !!r.handoff, providers: r.providers || [], links: r.links || [] }; }
      (await db.run('INSERT INTO ai_messages (conversation_id, role, content, actions, created_at) VALUES (?,?,?,?,?)', conv.id, 'assistant', out.reply, out.actions.length ? JSON.stringify(out.actions) : null, now()));
      (await db.run('UPDATE ai_conversations SET updated_at = ?, handoff = GREATEST(handoff, ?) WHERE id = ?', now(), out.handoff ? 1 : 0, conv.id));
      track('ai_message', { handoff: out.handoff, actions: out.actions.length }, u?.id);
      sendJson(res, 200, { ok: true, conversationId: conv.id, mode, ...out });
    },
  };
}
export { ALLOWED as AI_FIELDS };
