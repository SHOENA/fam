<script>
  import { app, val, set } from '../lib/store.svelte.js';
  import { shrink, okPhoto } from '../lib/photo.js';

  let { scope, id, field = 'photo', kind = 'person', cls = '' } = $props();
  const uid = $derived(`ph-${scope}-${id}-${field}`);
  const has = $derived(okPhoto(val(scope, id, field)));
  let err = $state('');

  async function pick(e) {
    const input = e.currentTarget;
    const f = input.files && input.files[0];
    if (!f) return;
    err = '';
    try { set(scope, id, field, await shrink(f, kind), true); }
    catch (x) { err = 'この写真は読み込めませんでした。別の写真をお試しください。'; }
    input.value = '';
  }
</script>

{#if app.edit}
  <div class="tools {cls}">
    <label class="photoBtn" for={uid}>写真を選ぶ<input class="vh" type="file" accept="image/*" id={uid} onchange={pick} /></label>
    {#if has}<button type="button" class="link" onclick={() => set(scope, id, field, '', true)}>写真を外す</button>{/if}
  </div>
  {#if err}<p class="note err" role="alert" style="margin:8px 0 0">{err}</p>{/if}
{/if}
