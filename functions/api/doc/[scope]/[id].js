import { readRole, json, sameOrigin } from '../../../../server/lib/auth.js';
import { validatePut, MAX_BODY } from '../../../../server/lib/validate.js';

export async function onRequestPut({ request, env, params }) {
  if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403);
  const role = await readRole(request, env);
  if (!role) return json({ error: 'unauthorized' }, 401);
  if (role !== 'edit') return json({ error: 'read_only' }, 403);

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ error: 'too_big' }, 413);
  let body;
  try { body = JSON.parse(raw); } catch (e) { return json({ error: 'bad_json' }, 400); }

  const { scope, id } = params;
  const bad = validatePut(scope, id, body && body.data);
  if (bad) return json({ error: bad }, 400);

  // 既存の内容に重ねて保存（1回の命令で完結）
  await env.DB.prepare(
    `INSERT INTO docs (path, data) VALUES (?, ?)
     ON CONFLICT(path) DO UPDATE SET data = json_patch(docs.data, excluded.data)`
  ).bind(`${scope}/${id}`, JSON.stringify(body.data)).run();
  return json({ ok: true });
}
