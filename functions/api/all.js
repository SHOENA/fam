import { readRole, json } from '../../server/lib/auth.js';
import { etagOf, etagMatches } from '../../server/lib/etag.js';

export async function onRequestGet({ request, env }) {
  if (!(await readRole(request, env))) return json({ error: 'unauthorized' }, 401);
  const { results } = await env.DB.prepare('SELECT path, data FROM docs ORDER BY path').all();
  const out = {};
  for (const r of results) { try { out[r.path] = JSON.parse(r.data); } catch (e) { /* 壊れた行は無視 */ } }
  const body = JSON.stringify(out);

  // 前回から変わっていなければ、写真を含む本体は送らない
  const tag = await etagOf(body);
  const headers = { 'cache-control': 'no-store', etag: tag };
  if (etagMatches(request.headers.get('if-none-match'), tag)) return new Response(null, { status: 304, headers });
  return new Response(body, { headers: { 'content-type': 'application/json', ...headers } });
}
