// 画面の状態と、サーバーとのやりとり
export const app = $state({
  ready: false, role: null, edit: false, tab: 'home', side: 'g', sel: null,
  site: {}, people: {}, story: {}, message: ''
});

const POLL_MS = 10000;
const HOLD_MS = 4000;      // 自分の保存の直後は、古いデータで上書きしない
let lastWrite = 0, inflight = 0, pollTimer = null;
const pending = {};         // path -> {field: value}
const timers = {};

const call = (url, opts = {}) => fetch(url, { cache: 'no-store', credentials: 'same-origin', ...opts });
const say = (m) => { app.message = m; };
const backToLogin = () => { app.role = null; app.edit = false; stopPolling(); };

export const val = (scope, id, field) => {
  const d = scope === 'site' ? app.site : app[scope][id];
  const v = d && d[field];
  return typeof v === 'string' ? v : '';
};

export async function init() {
  try {
    const r = await call('/api/me');
    if (r.ok) { app.role = (await r.json()).role; await load(); startPolling(); }
  } catch (e) { /* ログイン画面を出す */ }
  app.ready = true;
}

export async function login(pass) {
  try {
    const r = await call('/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pass }) });
    if (r.status === 401) return 'invalid';
    if (r.status === 429) return 'locked';
    if (!r.ok) return 'error';
    app.role = (await r.json()).role;
    await load(); startPolling();
    return 'ok';
  } catch (e) { return 'error'; }
}

export async function logout() {
  try { await call('/api/logout', { method: 'POST' }); } catch (e) { /* 続行 */ }
  backToLogin();
  app.site = {}; app.people = {}; app.story = {}; app.sel = null; app.message = '';
}

export async function load() {
  const r = await call('/api/all');
  if (r.status === 401) { backToLogin(); return; }
  if (!r.ok) { say('最新の内容を取得できませんでした。'); return; }
  const j = await r.json();
  const people = {}, story = {};
  for (const [path, d] of Object.entries(j)) {
    const [scope, id] = path.split('/');
    if (scope === 'people') people[id] = d;
    else if (scope === 'story') story[id] = d;
  }
  app.site = j['site/main'] || {};
  app.people = people; app.story = story;
  if (app.message.startsWith('最新の')) say('');
}

const busy = () => inflight > 0 || Object.keys(pending).length > 0 || Date.now() - lastWrite < HOLD_MS;
const poll = () => { if (app.role && !document.hidden && !busy()) load().catch(() => {}); };
function startPolling() { stopPolling(); pollTimer = setInterval(poll, POLL_MS); }
function stopPolling() { if (pollTimer) clearInterval(pollTimer); pollTimer = null; }
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });

const flush = async (scope, id) => {
  const path = `${scope}/${id}`;
  while (pending[path]) {
    const patch = pending[path]; delete pending[path];
    inflight++;
    try {
      const r = await call(`/api/doc/${path}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data: patch }) });
      if (r.status === 401) { backToLogin(); return; }
      if (r.status === 403) { app.edit = false; say('編集の権限がありません。'); return; }
      if (r.status === 413) say('保存の上限に達しました。写真を小さくしてください。');
      else if (!r.ok) say('保存できませんでした。もう一度お試しください。');
      else if (app.message.startsWith('保存')) say('');
    } catch (e) { say('保存できませんでした。通信を確認してください。'); }
    finally { inflight--; lastWrite = Date.now(); }
  }
};

// 入力を反映して保存する。文字は続けて打つ間は待ち、写真は即時に送る。
export function set(scope, id, field, value, immediate = false) {
  const target = scope === 'site' ? app.site : (app[scope][id] ||= {});
  target[field] = value;
  const path = `${scope}/${id}`;
  pending[path] = { ...(pending[path] || {}), [field]: value };
  clearTimeout(timers[path]);
  timers[path] = setTimeout(() => flush(scope, id), immediate ? 0 : 700);
}
