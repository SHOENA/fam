<script>
  import { app, val, set } from '../lib/store.svelte.js';
  import { okPhoto } from '../lib/photo.js';
  import PhotoButton from './PhotoButton.svelte';

  let { tabs } = $props();
  const hero = $derived(val('site', 'main', 'heroPhoto'));
  const has = $derived(okPhoto(hero));

  // 拡大率（％）と位置（％）。100％は、枠いっぱいに広げた状態
  const num = (f, d) => { const n = parseFloat(val('site', 'main', f)); return Number.isFinite(n) ? n : d; };
  const zoom = $derived(Math.max(100, num('heroZoom', 100)));  // 100%＝枠いっぱい。これより小さくして余白は出さない
  const posX = $derived(num('heroX', 50));
  const posY = $derived(num('heroY', 50));

  let W = $state(0), H = $state(0);
  let nat = $state({ w: 0, h: 0 });
  let adjusting = $state(false);
  let heroEl = $state(null);

  const geo = $derived.by(() => {
    if (!has || !nat.w || !W || !H) return null;
    const s = Math.max(W / nat.w, H / nat.h) * (zoom / 100);
    const w = nat.w * s, h = nat.h * s;
    return { w, h, l: (W - w) * (posX / 100), t: (H - h) * (posY / 100) };
  });
  const style = $derived(geo ? `inset:auto;width:${geo.w}px;height:${geo.h}px;left:${geo.l}px;top:${geo.t}px;max-width:none;object-fit:fill` : '');

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const fmt = (v) => String(Math.round(v * 10) / 10);
  const putZoom = (v) => set('site', 'main', 'heroZoom', fmt(clamp(v, 100, 300)));
  const putPos = (x, y) => { set('site', 'main', 'heroX', fmt(clamp(x, 0, 100))); set('site', 'main', 'heroY', fmt(clamp(y, 0, 100))); };
  const reset = () => { for (const f of ['heroZoom', 'heroX', 'heroY']) set('site', 'main', f, '', true); };

  // ドラッグで移動、2本指（ピンチ）やホイールで拡大縮小
  const pts = new Map();
  let startDist = 0, startZoom = 100;
  const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; };

  function down(e) {
    if (!adjusting) return;
    try { heroEl.setPointerCapture(e.pointerId); } catch (x) { /* 合成イベントなどでは無視 */ }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) { startDist = dist(); startZoom = zoom; }
  }
  function move(e) {
    const prev = pts.get(e.pointerId);
    if (!adjusting || !prev || !geo) return;
    const cur = { x: e.clientX, y: e.clientY };
    pts.set(e.pointerId, cur);
    if (pts.size >= 2) { putZoom(startZoom * dist() / startDist); return; }
    const rx = W - geo.w, ry = H - geo.h;           // 動かせる幅（写真が大きいときはマイナス）
    putPos(Math.abs(rx) > 1 ? posX + ((cur.x - prev.x) / rx) * 100 : posX,
           Math.abs(ry) > 1 ? posY + ((cur.y - prev.y) / ry) * 100 : posY);
  }
  function up(e) {
    pts.delete(e.pointerId);
    if (pts.size === 1) startDist = 0;
  }
  function key(e) {
    if (!adjusting) return;
    const m = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[e.key];
    if (m) { e.preventDefault(); putPos(posX + m[0], posY + m[1]); }
    else if (e.key === '+' || e.key === '=') { e.preventDefault(); putZoom(zoom + 10); }
    else if (e.key === '-') { e.preventDefault(); putZoom(zoom - 10); }
  }
  $effect(() => {
    if (!adjusting || !heroEl) return;
    const wheel = (e) => { e.preventDefault(); putZoom(zoom * Math.exp(-e.deltaY * 0.002)); };
    heroEl.addEventListener('wheel', wheel, { passive: false });
    return () => heroEl.removeEventListener('wheel', wheel);
  });
  $effect(() => { if (!app.edit || !has) adjusting = false; });
</script>

<section>
  <div class="hero" class:adj={adjusting} bind:this={heroEl} bind:clientWidth={W} bind:clientHeight={H}
    role={adjusting ? 'application' : undefined} tabindex={adjusting ? 0 : undefined}
    aria-label={adjusting ? '写真の位置と大きさの調整（ドラッグで移動、2本指で拡大縮小、矢印キーで移動、プラスとマイナスで拡大縮小）' : undefined}
    onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up} onkeydown={key}>
    {#if has}<img class="cover" {style} src={hero} alt="ふたりの写真" draggable="false" onload={(e) => (nat = { w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} />{/if}
    <div class="scrim" aria-hidden="true"></div>
    <div class="ttl">
      <h1 class="display">Nice to<br />meet you</h1>
      <p class="sub">ふたりのこと、家族のこと、ちょっとだけ紹介します</p>
    </div>
    {#if adjusting}
      <p class="adjHint" aria-hidden="true">ドラッグで移動 ／ 2本指で拡大縮小</p>
    {:else}
      <PhotoButton scope="site" id="main" field="heroPhoto" kind="hero" cls="onPhoto" />
    {/if}
  </div>
  {#if app.edit && has}
    <div class="adjust">
      {#if adjusting}
        <div class="adjBtns">
          <button type="button" class="photoBtn sq" onclick={() => putZoom(zoom - 10)} aria-label="縮小">−</button>
          <output class="zv">{Math.round(zoom)}%</output>
          <button type="button" class="photoBtn sq" onclick={() => putZoom(zoom + 10)} aria-label="拡大">＋</button>
          <button type="button" class="link" onclick={reset}>元に戻す</button>
        </div>
        <button type="button" class="cta done" onclick={() => (adjusting = false)}>調整を終える</button>
      {:else}
        <button type="button" class="photoBtn" onclick={() => (adjusting = true)}>写真の位置・大きさを調整</button>
      {/if}
    </div>
  {/if}
  {@render tabs(true)}
</section>
