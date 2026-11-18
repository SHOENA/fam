// 合言葉ログインと署名つきセッション（Cloudflare Workers の Web Crypto で完結）
const enc = new TextEncoder();
export const SESSION_DAYS = 30;
export const WINDOW_SEC = 15 * 60;   // 失敗を数える期間
export const MAX_FAILS_PER_IP = 5;   // 同じ接続元で許す失敗回数
export const MAX_FAILS_ALL = 60;     // 全体で許す失敗回数（分散した総当たり対策）

const b64u = (buf) => {
  let s = '';
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const hmac = async (secret, msg) => {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
};

// 長さが同じ前提で、途中で止まらない比較
export const safeEqual = (a, b) => {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
};

export const configured = (env) => Boolean(env.SESSION_SECRET && env.SESSION_SECRET.length >= 32 && env.EDIT_PASS);

// 入力された合言葉の役割を返す（'edit' | 'view' | null）。どちらも必ず比較する。
export const roleForPassword = async (env, input) => {
  const given = await hmac(env.SESSION_SECRET, 'pw:' + String(input));
  const edit = await hmac(env.SESSION_SECRET, 'pw:' + env.EDIT_PASS);
  const view = env.VIEW_PASS ? await hmac(env.SESSION_SECRET, 'pw:' + env.VIEW_PASS) : null;
  const isEdit = safeEqual(given, edit);
  const isView = view ? safeEqual(given, view) : false;
  return isEdit ? 'edit' : isView ? 'view' : null;
};

export const makeToken = async (env, role, nowSec) => {
  const exp = nowSec + SESSION_DAYS * 86400;
  const body = `${role}.${exp}`;
  return `${body}.${b64u(await hmac(env.SESSION_SECRET, 'sess:' + body))}`;
};

export const verifyToken = async (env, token, nowSec) => {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  const [role, exp, sig] = parts;
  if (role !== 'edit' && role !== 'view') return null;
  if (!/^\d{1,12}$/.test(exp) || Number(exp) < nowSec) return null;
  const want = enc.encode(b64u(await hmac(env.SESSION_SECRET, `sess:${role}.${exp}`)));
  const got = enc.encode(sig);
  return safeEqual(want, got) ? role : null;
};

const isHttps = (request) => new URL(request.url).protocol === 'https:';
const cookieName = (request) => (isHttps(request) ? '__Host-fam' : 'fam');

export const sessionCookie = (request, token, maxAge) =>
  `${cookieName(request)}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${isHttps(request) ? '; Secure' : ''}`;

export const readRole = async (request, env, nowSec = Math.floor(Date.now() / 1000)) => {
  if (!configured(env)) return null;
  const name = cookieName(request);
  const m = (request.headers.get('cookie') || '').split(/;\s*/).find((c) => c.startsWith(name + '='));
  return m ? verifyToken(env, m.slice(name.length + 1), nowSec) : null;
};

export const json = (obj, status = 200, headers = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers }
  });

// 書き込み系は、別のサイトから送られたものを拒否する
export const sameOrigin = (request) => {
  const o = request.headers.get('origin');
  return !o || o === new URL(request.url).origin;
};

// ---- 失敗回数の制限（D1） ----
export const tooManyFails = async (db, ip, nowSec) => {
  const since = nowSec - WINDOW_SEC;
  const a = await db.prepare('SELECT COUNT(*) AS n FROM login_fails WHERE ip = ? AND ts > ?').bind(ip, since).first();
  const b = await db.prepare('SELECT COUNT(*) AS n FROM login_fails WHERE ts > ?').bind(since).first();
  return a.n >= MAX_FAILS_PER_IP || b.n >= MAX_FAILS_ALL;
};
export const recordFail = async (db, ip, nowSec) => {
  await db.prepare('INSERT INTO login_fails (ip, ts) VALUES (?, ?)').bind(ip, nowSec).run();
  await db.prepare('DELETE FROM login_fails WHERE ts < ?').bind(nowSec - 86400).run();
};
