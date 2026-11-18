<script>
  import { app, val } from '../lib/store.svelte.js';
  import { STORY, QA } from '../../shared/family.js';
  import { okPhoto } from '../lib/photo.js';
  import Input from './Input.svelte';
  import PhotoButton from './PhotoButton.svelte';

  const t = (s, f) => val('story', s.id, f) || s[f];
  const site = (f, d) => val('site', 'main', f) || d;
</script>

<section>
  <div class="page"><h2 class="display">Our story</h2><p class="sub">出会いから今日まで</p></div>
  <ol class="tl">
    {#each STORY as s (s.id)}
      {@const ph = val('story', s.id, 'photo')}
      <li>
        <span class="when">{#if !app.edit}{t(s, 'when')}{/if}</span>
        <span class="rail" aria-hidden="true"><i></i><b></b></span>
        <div class="body">
          {#if app.edit}
            <Input scope="story" id={s.id} field="title" label="タイトル" placeholder={s.title} />
            <div style="height:8px"></div>
            <Input scope="story" id={s.id} field="note" label="ひとこと" placeholder={s.note} />
            <div style="height:8px"></div>
            <Input scope="story" id={s.id} field="when" label="時期" placeholder={s.when} />
          {:else}
            <h3>{t(s, 'title')}</h3>
            <p>{t(s, 'note')}</p>
          {/if}
          {#if okPhoto(ph)}
            <div class="ph"><img src={ph} alt="" /></div>
          {:else if app.edit || s.id !== 's4'}
            <div class="ph">写真</div>
          {/if}
          <PhotoButton scope="story" id={s.id} kind="story" />
        </div>
      </li>
    {/each}
  </ol>

  <h3 class="display">Q &amp; A</h3>
  <div class="qa">
    {#each QA as q, i}
      <div>
        <span class="lab">{q}</span>
        {#if app.edit}
          <Input scope="site" id="main" field={`qa${i}g`} label={`${q} 新郎`} placeholder="新郎　［　　］" />
          <div style="height:6px"></div>
          <Input scope="site" id="main" field={`qa${i}b`} label={`${q} 新婦`} placeholder="新婦　［　　］" />
        {:else}
          <p>新郎　{site(`qa${i}g`, '［　　］')}</p>
          <p>新婦　{site(`qa${i}b`, '［　　］')}</p>
        {/if}
      </div>
    {/each}
  </div>
</section>
