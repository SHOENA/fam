<script>
  // 編集中に出す入力欄。入力は自動で保存される。
  import { val, set } from '../lib/store.svelte.js';
  import { PREFS } from '../../shared/prefs.js';

  let { scope, id, field, label, placeholder = '', kind = 'text', big = false } = $props();
  const uid = $derived(`f-${scope}-${id}-${field}`);
  const cur = $derived(val(scope, id, field));
</script>

<label class="vh" for={uid}>{label}</label>
{#if kind === 'pref'}
  <select class="in" id={uid} value={cur} onchange={(e) => set(scope, id, field, e.currentTarget.value, true)}>
    <option value="">選択してください</option>
    {#each PREFS as p}<option value={p}>{p}</option>{/each}
    {#if cur && !PREFS.includes(cur)}<option value={cur}>{cur}</option>{/if}
  </select>
{:else if kind === 'area'}
  <textarea class="in" id={uid} rows="3" value={cur} {placeholder} oninput={(e) => set(scope, id, field, e.currentTarget.value)}></textarea>
{:else}
  <input class="in" class:big id={uid} value={cur} {placeholder} autocomplete="off" oninput={(e) => set(scope, id, field, e.currentTarget.value)} />
{/if}
