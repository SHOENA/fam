// 保存してよい内容かを確認する（画面側の入力制限に頼らない）
import { SCOPES, IDS, FIELDS, PHOTO_FIELDS, NUM_FIELDS } from '../../shared/family.js';
import { PREFS } from '../../shared/prefs.js';

const PHOTO_RE = /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/;
export const MAX_BODY = 900000;
export const MAX_PHOTO = 280000;
export const MAX_TEXT = 2000;

export const validatePut = (scope, id, data) => {
  if (!SCOPES.includes(scope)) return 'bad scope';
  if (!IDS[scope].includes(id)) return 'bad id';
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'bad data';
  const keys = Object.keys(data);
  if (keys.length === 0 || keys.length > FIELDS[scope].length) return 'bad data';
  for (const k of keys) {
    if (!FIELDS[scope].includes(k)) return 'bad field';
    const v = data[k];
    if (typeof v !== 'string') return 'bad value';
    if (PHOTO_FIELDS.includes(k)) {
      if (v !== '' && (v.length > MAX_PHOTO || !PHOTO_RE.test(v))) return 'bad photo';
    } else if (scope === 'site' && NUM_FIELDS[k]) {
      const [lo, hi] = NUM_FIELDS[k];
      if (v !== '' && (!/^\d{1,3}$/.test(v) || +v < lo || +v > hi)) return 'bad value';
    } else if (v.length > MAX_TEXT) {
      return 'too long';
    } else if (scope === 'people' && k === 'live' && v !== '' && !PREFS.includes(v)) {
      return 'bad prefecture';
    }
  }
  return null;
};
