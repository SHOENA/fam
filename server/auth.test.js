import test from 'node:test';
import assert from 'node:assert/strict';
import { roleForPassword, makeToken, verifyToken, readRole, configured, safeEqual } from './lib/auth.js';
import { validatePut } from './lib/validate.js';

const env = { SESSION_SECRET: 'x'.repeat(40), EDIT_PASS: 'edit-pass-1234', VIEW_PASS: 'view-pass-1234' };
const now = 1_700_000_000;

test('合言葉の役割判定', async () => {
  assert.equal(await roleForPassword(env, 'edit-pass-1234'), 'edit');
  assert.equal(await roleForPassword(env, 'view-pass-1234'), 'view');
  assert.equal(await roleForPassword(env, 'wrong'), null);
  assert.equal(await roleForPassword(env, ''), null);
  assert.equal(await roleForPassword({ ...env, VIEW_PASS: undefined }, 'view-pass-1234'), null);
});

test('設定が足りないときは使えない', () => {
  assert.equal(configured(env), true);
  assert.equal(configured({ ...env, SESSION_SECRET: 'short' }), false);
  assert.equal(configured({ ...env, EDIT_PASS: '' }), false);
});

test('セッションの署名・期限・改ざん', async () => {
  const t = await makeToken(env, 'view', now);
  assert.equal(await verifyToken(env, t, now + 10), 'view');
  assert.equal(await verifyToken(env, t, now + 31 * 86400), null);             // 期限切れ
  const [r, e, s] = t.split('.');
  assert.equal(await verifyToken(env, `edit.${e}.${s}`, now + 10), null);       // 役割の書き換え
  assert.equal(await verifyToken(env, `${r}.${Number(e) + 999999}.${s}`, now + 10), null); // 期限の書き換え
  assert.equal(await verifyToken({ ...env, SESSION_SECRET: 'y'.repeat(40) }, t, now + 10), null); // 別の鍵
  assert.equal(await verifyToken(env, 'a.b', now), null);
  assert.equal(await verifyToken(env, 'admin.9999999999.abc', now), null);
});

test('Cookieからの読み取り', async () => {
  const t = await makeToken(env, 'edit', Math.floor(Date.now() / 1000));
  const req = new Request('https://example.com/api/all', { headers: { cookie: `a=1; __Host-fam=${t}` } });
  assert.equal(await readRole(req, env), 'edit');
  const none = new Request('https://example.com/api/all');
  assert.equal(await readRole(none, env), null);
  assert.equal(await readRole(req, { ...env, SESSION_SECRET: '' }), null);
});

test('safeEqual', () => {
  assert.equal(safeEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2])), true);
  assert.equal(safeEqual(new Uint8Array([1, 2]), new Uint8Array([1, 3])), false);
  assert.equal(safeEqual(new Uint8Array([1]), new Uint8Array([1, 2])), false);
});

test('保存内容の検証', () => {
  assert.equal(validatePut('people', 'gGPa', { name: 'たろう', live: '北海道' }), null);
  assert.equal(validatePut('people', 'gGPa', { live: '札幌' }), 'bad prefecture');
  assert.equal(validatePut('people', 'nobody', { name: 'a' }), 'bad id');
  assert.equal(validatePut('other', 'main', { a: 'b' }), 'bad scope');
  assert.equal(validatePut('people', 'gGPa', { admin: 'x' }), 'bad field');
  assert.equal(validatePut('people', 'gGPa', { name: 1 }), 'bad value');
  assert.equal(validatePut('people', 'gGPa', { name: 'a'.repeat(2001) }), 'too long');
  assert.equal(validatePut('people', 'gGPa', {}), 'bad data');
  assert.equal(validatePut('people', 'gGPa', { photo: 'data:image/jpeg;base64,AAAA' }), null);
  assert.equal(validatePut('people', 'gGPa', { photo: 'data:text/html;base64,AAAA' }), 'bad photo');
  assert.equal(validatePut('people', 'gGPa', { photo: 'javascript:alert(1)' }), 'bad photo');
  assert.equal(validatePut('people', 'gGPa', { photo: '' }), null);
  assert.equal(validatePut('site', 'main', { qa3b: 'x', heroPhoto: '' }), null);
});

import { etagOf, etagMatches } from './lib/etag.js';

test('ETag：同じ内容は同じ印、違う内容は違う印', async () => {
  const a = await etagOf('{"a":1}');
  assert.equal(a, await etagOf('{"a":1}'));
  assert.notEqual(a, await etagOf('{"a":2}'));
  assert.match(a, /^"[0-9a-f]{32}"$/);
  assert.equal(etagMatches(a, a), true);
  assert.equal(etagMatches(`W/${a}`, a), true);          // 圧縮で弱いETagになっても一致
  assert.equal(etagMatches(`"x", ${a}`, a), true);
  assert.equal(etagMatches('"other"', a), false);
  assert.equal(etagMatches(null, a), false);
});
