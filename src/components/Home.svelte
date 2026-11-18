<script>
  import { app, val } from '../lib/store.svelte.js';
  import { okPhoto } from '../lib/photo.js';
  import Input from './Input.svelte';
  import PhotoButton from './PhotoButton.svelte';

  let { go } = $props();
  const hero = $derived(val('site', 'main', 'heroPhoto'));
  const show = (f, d) => val('site', 'main', f) || d;
</script>

<section>
  <div class="hero">
    <div class="cloud" style="top:150px;left:-60px;width:260px;height:120px;opacity:.95"></div>
    <div class="cloud" style="top:90px;right:-70px;width:240px;height:130px;opacity:.9"></div>
    <div class="cloud" style="top:210px;left:90px;width:260px;height:110px"></div>
    <div class="flag" aria-hidden="true">&amp;</div>
    <div class="heroPhoto">
      {#if okPhoto(hero)}<img src={hero} alt="ふたりの写真" />{:else}ふたりの写真{/if}
    </div>
  </div>
  <div class="sheet">
    <h1 class="display">Nice to meet you</h1>
    <p class="sub">ふたりのこと、家族のこと、ちょっとだけ紹介します</p>
    <PhotoButton scope="site" id="main" field="heroPhoto" kind="hero" />
    <div class="pair" style:margin-top={app.edit ? '16px' : '0'}>
      <div class="fld">
        <span class="lab">GROOM</span>
        {#if app.edit}<Input scope="site" id="main" field="groom" label="新郎" placeholder="［新郎］" big />{:else}<span class="val">{show('groom', '［新郎］')}</span>{/if}
      </div>
      <svg width="30" height="18" viewBox="0 0 26 16" fill="none" aria-hidden="true" style="flex:0 0 30px;margin-bottom:12px">
        <circle cx="9" cy="8" r="6.5" stroke="#C8202F" stroke-width="1.5" /><circle cx="17" cy="8" r="6.5" stroke="#C8202F" stroke-width="1.5" />
      </svg>
      <div class="fld r">
        <span class="lab">BRIDE</span>
        {#if app.edit}<Input scope="site" id="main" field="bride" label="新婦" placeholder="［新婦］" big />{:else}<span class="val">{show('bride', '［新婦］')}</span>{/if}
      </div>
    </div>
    <div class="row2">
      <div class="fld">
        <span class="lab">DATE</span>
        {#if app.edit}<Input scope="site" id="main" field="date" label="日付" placeholder="20〇〇.〇.〇（〇）" />{:else}<span class="val s">{show('date', '20〇〇.〇.〇（〇）')}</span>{/if}
      </div>
      <div class="fld">
        <span class="lab">PLACE</span>
        {#if app.edit}<Input scope="site" id="main" field="place" label="場所" placeholder="［会場名］" />{:else}<span class="val s">{show('place', '［会場名］')}</span>{/if}
      </div>
    </div>
    <button type="button" class="cta" onclick={() => go('family')}>家族を紹介する</button>
    <button type="button" class="ghost" onclick={() => go('story')}>ふたりのストーリーを見る</button>
  </div>
</section>
