<script>
  import { app, val } from '../lib/store.svelte.js';
  import { TREE } from '../../shared/family.js';
  import Input from './Input.svelte';
  import Tree from './Tree.svelte';
  import Detail from './Detail.svelte';

  const DEFAULT = '新婦の親族は、ほとんどが北海道に。\n新郎の親族は、北海道の外に全国バラバラです。';
  const pick = (s) => { app.side = s; app.sel = null; };
</script>

<section>
  <div class="page"><h2 class="display">Our families</h2><p class="sub">ご家族のご紹介</p></div>
  <div class="msg">
    <div class="bar"></div>
    {#if app.edit}
      <Input scope="site" id="main" field="message" label="ひとこと" kind="area" placeholder={DEFAULT} />
    {:else}
      <p>{val('site', 'main', 'message') || DEFAULT}</p>
    {/if}
  </div>
  <div class="seg" role="group" aria-label="家の切り替え">
    {#each ['g', 'b'] as s}
      <button type="button" aria-pressed={app.side === s} style:background={app.side === s ? TREE[s].color : ''} onclick={() => pick(s)}>{TREE[s].label}</button>
    {/each}
  </div>
  <Tree />
  <p class="hint">横にスクロールできます。丸をタップすると紹介が開きます。</p>
  {#if app.sel}<div class="detailWrap"><Detail /></div>{/if}
</section>
