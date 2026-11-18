import { readRole, json } from '../../server/lib/auth.js';

export async function onRequestGet({ request, env }) {
  if (!(await readRole(request, env))) return json({ error: 'unauthorized' }, 401);
  const { results } = await env.DB.prepare('SELECT path, data FROM docs').all();
  const out = {};
  for (const r of results) { try { out[r.path] = JSON.parse(r.data); } catch (e) { /* 壊れた行は無視 */ } }
  return json(out);
}
