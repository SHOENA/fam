// 写真を縮小して JPEG の文字列にする（保存サイズを小さく保つ）
export const SIZES = { person: [320, 320], story: [640, 400], hero: [640, 400] };
export const okPhoto = (s) =>
  typeof s === 'string' && s.length < 300000 && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(s);

export const shrink = (file, kind) =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('read'));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('img'));
      img.onload = () => {
        const [w, h] = SIZES[kind];
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const g = c.getContext('2d');
        const s = Math.max(w / img.width, h / img.height);
        const dw = img.width * s, dh = img.height * s;
        g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
        g.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
        let q = 0.82, out = c.toDataURL('image/jpeg', q);
        while (out.length > 200000 && q > 0.4) { q -= 0.1; out = c.toDataURL('image/jpeg', q); }
        resolve(out);
      };
      img.src = String(fr.result);
    };
    fr.readAsDataURL(file);
  });
