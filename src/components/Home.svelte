<script>
  import { val } from '../lib/store.svelte.js';
  import { okPhoto } from '../lib/photo.js';
  import PhotoButton from './PhotoButton.svelte';

  let { tabs } = $props();
  const hero = $derived(val('site', 'main', 'heroPhoto'));
</script>

<section>
  <div class="hero">
    {#if okPhoto(hero)}<img class="cover" src={hero} alt="ふたりの写真" />{/if}
    <div class="scrim" aria-hidden="true"></div>
    <div class="ttl">
      <h1 class="display">Nice to<br />meet you</h1>
      <p class="sub">ふたりのこと、家族のこと、ちょっとだけ紹介します</p>
    </div>
    <PhotoButton scope="site" id="main" field="heroPhoto" kind="hero" cls="onPhoto" />
  </div>
  {@render tabs(true)}
</section>
