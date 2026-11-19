<script>
  import { app, val } from '../lib/store.svelte.js';
  import Input from './Input.svelte';

  const site = (f, d) => val('site', 'main', f) || d;
</script>

<section>
  <div class="page"><h2 class="display">About us</h2><p class="sub">ふたりの自己紹介</p>
  <div class="couple">
    <div class="pair">
      <div class="fld">
        <span class="lab">GROOM</span>
        {#if app.edit}<Input scope="site" id="main" field="groom" label="新郎" placeholder="［新郎］" big />{:else}<span class="val">{site('groom', '［新郎］')}</span>{/if}
      </div>
      <svg width="30" height="18" viewBox="0 0 26 16" fill="none" aria-hidden="true" style="flex:0 0 30px;margin-bottom:12px">
        <circle cx="9" cy="8" r="6.5" stroke="#111" stroke-width="1.5" /><circle cx="17" cy="8" r="6.5" stroke="#111" stroke-width="1.5" />
      </svg>
      <div class="fld r">
        <span class="lab">BRIDE</span>
        {#if app.edit}<Input scope="site" id="main" field="bride" label="新婦" placeholder="［新婦］" big />{:else}<span class="val">{site('bride', '［新婦］')}</span>{/if}
      </div>
    </div>
  </div>
  </div>
</section>
