const SCOPES = ['site', 'people', 'story'];
export async function onRequestPut({ request, env, params }) {
  if (!env.EDIT_KEY || request.headers.get('x-edit-key') !== env.EDIT_KEY) return new Response('denied', { status: 403 });
  const { scope, id } = params;
  if (!SCOPES.includes(scope) || !/^[A-Za-z0-9_-]{1,40}$/.test(id)) return new Response('bad path', { status: 400 });
  const raw = await request.text();
  if (raw.length > 900000) return new Response('too big', { status: 413 });
  let body; try { body = JSON.parse(raw); } catch (e) { return new Response('bad json', { status: 400 }); }
  const data = body && body.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return new Response('bad data', { status: 400 });
  for (const v of Object.values(data)) if (typeof v !== 'string' || v.length > 300000) return new Response('bad value', { status: 400 });
  const path = scope + '/' + id;
  if (body.merge) {
    const row = await env.DB.prepare('SELECT data FROM docs WHERE path = ?').bind(path).first();
    Object.assign(data, {}); const cur = row ? JSON.parse(row.data) : {};
    const merged = Object.assign(cur, data);
    await env.DB.prepare('INSERT INTO docs (path, data) VALUES (?, ?) ON CONFLICT(path) DO UPDATE SET data = excluded.data').bind(path, JSON.stringify(merged)).run();
  } else {
    await env.DB.prepare('INSERT INTO docs (path, data) VALUES (?, ?) ON CONFLICT(path) DO UPDATE SET data = excluded.data').bind(path, JSON.stringify(data)).run();
  }
  return new Response('ok');
}
