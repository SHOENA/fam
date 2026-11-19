// 内容が変わっていないかを、短い印（ETag）で確かめる
export const etagOf = async (text) => {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  let s = '';
  for (const b of new Uint8Array(d).slice(0, 16)) s += b.toString(16).padStart(2, '0');
  return `"${s}"`;
};

// If-None-Match の値に、現在のETagが含まれるか（弱いETag W/ も同じものとして扱う）
export const etagMatches = (header, tag) =>
  !!header && header.split(',').map((x) => x.trim().replace(/^W\//, '')).includes(tag);
