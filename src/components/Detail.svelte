<script>
  import { app, val } from '../lib/store.svelte.js';
  import { NODE_BY } from '../../shared/family.js';
  import { okPhoto } from '../lib/photo.js';
  import Input from './Input.svelte';
  import PhotoButton from './PhotoButton.svelte';

  const n = $derived(app.sel ? NODE_BY[app.sel] : null);
  const FIELDS = [
    ['live', 'お住まい', '［都道府県］', 'pref'],
    ['job', 'お仕事', '［　　　］', 'text'],
    ['likes', '好きなもの', '［　　　］', 'text'],
    ['msg', 'ひとこと', '［　　　］', 'text']
  ];
</script>

{#if !n}
  <div class="empty">家系図の丸をタップすると、<br />その方の紹介がここに開きます</div>
{:else}
  {@const ph = val('people', n.k, 'photo')}
  {@const defName = n.self ? (n.side === 'g' ? '［新郎　氏名］' : '［新婦　氏名］') : '［お名前］'}
  <div class="detail">
    <div class="head">
      <div class="pic">{#if okPhoto(ph)}<img src={ph} alt="" />{:else}写真{/if}</div>
      <div class="who">
        <p class="rl">{n.long}</p>
        {#if app.edit}
          <Input scope="people" id={n.k} field="name" label="お名前" placeholder={defName} />
        {:else}
          <p class="nmv">{val('people', n.k, 'name') || defName}</p>
        {/if}
      </div>
      <button type="button" class="x" aria-label="閉じる" onclick={() => (app.sel = null)}>×</button>
    </div>
    <PhotoButton scope="people" id={n.k} kind="person" />
    <div class="grid2" class:edit={app.edit}>
      {#each FIELDS as [f, label, ph2, kind]}
        <div>
          <span class="lab">{label}</span>
          {#if app.edit}
            <Input scope="people" id={n.k} field={f} {label} placeholder={ph2} {kind} />
          {:else}
            <p>{val('people', n.k, f) || ph2}</p>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}
