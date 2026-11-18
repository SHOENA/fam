import { configured, roleForPassword, makeToken, sessionCookie, json, sameOrigin, tooManyFails, recordFail, SESSION_DAYS } from '../../server/lib/auth.js';

export async function onRequestPost({ request, env }) {
  if (!configured(env)) return json({ error: 'not_configured' }, 500);
  if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403);
  const now = Math.floor(Date.now() / 1000);
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';

  if (await tooManyFails(env.DB, ip, now)) {
    return json({ error: 'locked' }, 429, { 'retry-after': '900' });
  }
  let pass = '';
  try { pass = String((await request.json()).pass || ''); } catch (e) { /* 空として扱う */ }
  if (pass.length > 200) pass = '';

  const role = await roleForPassword(env, pass);
  if (!role) {
    await recordFail(env.DB, ip, now);
    return json({ error: 'invalid' }, 401);
  }
  const token = await makeToken(env, role, now);
  return json({ role }, 200, { 'set-cookie': sessionCookie(request, token, SESSION_DAYS * 86400) });
}
