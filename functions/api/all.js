export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT path, data FROM docs').all();
  const out = {};
  for (const r of results) { try { out[r.path] = JSON.parse(r.data); } catch (e) {} }
  return new Response(JSON.stringify(out), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
