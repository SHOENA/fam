<script>
  import { app, val, set } from '../lib/store.svelte.js';
  import { okPhoto } from '../lib/photo.js';
  import PhotoButton from './PhotoButton.svelte';

  let { tabs } = $props();
  const hero = $derived(val('site', 'main', 'heroPhoto'));
  const has = $derived(okPhoto(hero));

  // 拡大率（％）と位置（％）。100％は、枠いっぱいに広げた状態
  const num = (f, d) => { const n = parseInt(val('site', 'main', f), 10); return Number.isFinite(n) ? n : d; };
  const zoom = $derived(num('heroZoom', 100));
  const posX = $derived(num('heroX', 50));
  const posY = $derived(num('heroY', 50));

  let W = $state(0), H = $state(0);
  let nat = $state({ w: 0, h: 0 });
  const geo = $derived.by(() => {
    if (!has || !nat.w || !W || !H) return null;
    const s = Math.max(W / nat.w, H / nat.h) * (zoom / 100);
    const w = nat.w * s, h = nat.h * s;
    return { w, h, l: (W - w) * (posX / 100), t: (H - h) * (posY / 100) };
  });
  const style = $derived(geo ? `inset:auto;width:${geo.w}px;height:${geo.h}px;left:${geo.l}px;top:${geo.t}px;max-width:none;object-fit:fill` : '');

  const put = (f, v) => set('site', 'main', f, String(Math.round(v)));
  const fitAll = () => {
    if (!nat.w || !W || !H) return;
    const k = Math.min(W / nat.w, H / nat.h) / Math.max(W / nat.w, H / nat.h);
    put('heroZoom', Math.max(30, k * 100)); put('heroX', 50); put('heroY', 50);
  };
  const reset = () => { for (const f of ['heroZoom', 'heroX', 'heroY']) set('site', 'main', f, '', true); };
</script>

<section>
  <div class="hero" bind:clientWidth={W} bind:clientHeight={H}>
    {#if has}<img class="cover" {style} src={hero} alt="ふたりの写真" onload={(e) => (nat = { w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} />{/if}
    <div class="scrim" aria-hidden="true"></div>
    <div class="ttl">
      <h1 class="display">Nice to<br />meet you</h1>
      <p class="sub">ふたりのこと、家族のこと、ちょっとだけ紹介します</p>
    </div>
    <PhotoButton scope="site" id="main" field="heroPhoto" kind="hero" cls="onPhoto" />
  </div>
  {#if app.edit && has}
    <div class="adjust" role="group" aria-label="写真の見え方の調整">
      <p class="adjTtl">写真の見え方</p>
      <label class="rg"><span>拡大</span><input type="range" min="30" max="300" step="5" value={zoom} oninput={(e) => put('heroZoom', e.currentTarget.value)} /><output>{zoom}%</output></label>
      <label class="rg"><span>左右</span><input type="range" min="0" max="100" step="1" value={posX} oninput={(e) => put('heroX', e.currentTarget.value)} /><output>{posX}%</output></label>
      <label class="rg"><span>上下</span><input type="range" min="0" max="100" step="1" value={posY} oninput={(e) => put('heroY', e.currentTarget.value)} /><output>{posY}%</output></label>
      <div class="adjBtns">
        <button type="button" class="photoBtn" onclick={fitAll}>写真全体を表示</button>
        <button type="button" class="link" onclick={reset}>元に戻す</button>
      </div>
    </div>
  {/if}
  {@render tabs(true)}
</section>
