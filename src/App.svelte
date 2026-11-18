<script>
  import { onMount } from 'svelte';
  import { app, init, logout } from './lib/store.svelte.js';
  import Login from './components/Login.svelte';
  import Home from './components/Home.svelte';
  import Story from './components/Story.svelte';
  import Family from './components/Family.svelte';

  const TABS = [['home', 'ホーム'], ['story', 'ストーリー'], ['family', '家族']];

  function go(t) {
    app.tab = t; app.sel = null;
    try { history.replaceState(null, '', '#' + t); } catch (e) { /* 無視 */ }
    window.scrollTo(0, 0);
  }

  onMount(() => {
    const h = location.hash.replace('#', '');
    if (TABS.some(([k]) => k === h)) app.tab = h;
    const onHash = () => {
      const x = location.hash.replace('#', '');
      if (TABS.some(([k]) => k === x) && x !== app.tab) { app.tab = x; app.sel = null; }
    };
    window.addEventListener('hashchange', onHash);
    init();
    return () => window.removeEventListener('hashchange', onHash);
  });
</script>

{#if !app.ready}
  <div class="boot" aria-busy="true"></div>
{:else if !app.role}
  <Login />
{:else}
  <div class="app">
    <header class="top">
      <span class="tag"><span class="mark" aria-hidden="true"></span>Our families</span>
      <span class="topbtns">
        {#if app.role === 'edit'}
          <button type="button" class="pill" class:on={app.edit} aria-pressed={app.edit} onclick={() => (app.edit = !app.edit)}>
            {app.edit ? '編集を終える' : '編集する'}
          </button>
        {/if}
        <button type="button" class="linkbtn" onclick={logout}>ログアウト</button>
      </span>
    </header>
    <div role="status" aria-live="polite">
      {#if app.message}<p class="note err">{app.message}</p>{/if}
    </div>
    {#if app.edit}
      <p class="note edit">編集中です。入力すると自動で保存され、ほかの人の画面にも反映されます。</p>
    {/if}

    {#if app.tab === 'story'}<Story />{:else if app.tab === 'family'}<Family />{:else}<Home {go} />{/if}

    <nav class="nav" aria-label="メニュー">
      <div>
        {#each TABS as [k, label]}
          <button type="button" aria-current={app.tab === k ? 'page' : 'false'} onclick={() => go(k)}><i></i>{label}</button>
        {/each}
      </div>
    </nav>
  </div>
{/if}
