import { readRole, json, configured } from '../../server/lib/auth.js';

export async function onRequestGet({ request, env }) {
  if (!configured(env)) return json({ error: 'not_configured' }, 500);
  const role = await readRole(request, env);
  return role ? json({ role }) : json({ error: 'unauthorized' }, 401);
}
