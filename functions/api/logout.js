import { sessionCookie, json, sameOrigin } from '../../server/lib/auth.js';

export async function onRequestPost({ request }) {
  if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403);
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie(request, '', 0) });
}
