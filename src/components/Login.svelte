<script>
  import { login } from '../lib/store.svelte.js';

  let pass = $state('');
  let busy = $state(false);
  let msg = $state('');

  async function submit(e) {
    e.preventDefault();
    if (!pass || busy) return;
    busy = true; msg = '';
    const r = await login(pass);
    busy = false;
    if (r === 'invalid') msg = '合言葉が違います。';
    else if (r === 'locked') msg = '間違いが続いたため、しばらくお待ちください（15分ほど）。';
    else if (r === 'error') msg = '接続できませんでした。通信を確認してください。';
    if (r !== 'ok') pass = '';
  }
</script>

<main class="login">
  <div class="cloud" style="top:12%;left:-60px;width:260px;height:120px;opacity:.95"></div>
  <div class="cloud" style="top:30%;right:-70px;width:240px;height:130px;opacity:.9"></div>
  <div class="head">
    <h1 class="display">Welcome</h1>
    <p class="sub" style="margin-bottom:0">ふたりと家族の紹介です。合言葉を入力してください。</p>
  </div>
  <div class="sheet">
    <form onsubmit={submit}>
      <label class="lab" for="pass">合言葉</label>
      <input class="in big" id="pass" type="password" autocomplete="current-password" bind:value={pass} disabled={busy} />
      <p class="msg2" role="alert">{msg}</p>
      <button class="cta" type="submit" disabled={busy || !pass}>{busy ? '確認しています' : '入る'}</button>
    </form>
  </div>
</main>
