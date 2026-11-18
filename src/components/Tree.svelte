<script>
  import { TREE, COL, ROW, MX, TOP, R, LAB, BW } from '../../shared/family.js';
  import { app, val } from '../lib/store.svelte.js';
  import { okPhoto } from '../lib/photo.js';

  const T = $derived(TREE[app.side]);

  const geo = $derived.by(() => {
    const by = {};
    T.nodes.forEach((n) => (by[n.k] = n));
    const X = (n) => MX + n.c * COL;
    const Y = (n) => TOP + n.r * ROW;
    const circ = (cx, cy, r) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 `;
    let d = '', rings = '';
    for (const u of T.units) {
      const ps = u.p.map((k) => by[k]), ks = u.k.map((k) => by[k]);
      const cy = Y(ps[0]), br = cy + 100;
      let sx, sy;
      if (u.couple) {
        const x1 = X(ps[0]), x2 = X(ps[1]);
        sx = (x1 + x2) / 2; sy = cy;
        d += `M${x1 + R} ${cy} H${x2 - R} `;
        rings += circ(sx - 3.5, cy, 5) + circ(sx + 3.5, cy, 5);
      } else { sx = X(ps[0]); sy = cy + LAB; }
      const xs = ks.map(X);
      d += `M${sx} ${sy} V${br} M${Math.min(sx, ...xs)} ${br} H${Math.max(sx, ...xs)} `;
      for (const k of ks) d += `M${X(k)} ${br} V${Y(k) - R - 3} `;
    }
    const maxC = Math.max(...T.nodes.map((n) => n.c));
    const maxR = Math.max(...T.nodes.map((n) => n.r));
    return {
      d, rings,
      W: Math.round(MX * 2 + maxC * COL),
      H: TOP + maxR * ROW + LAB + 24,
      nodes: T.nodes.map((n) => ({ ...n, left: X(n) - BW / 2, top: Y(n) - R - 4 }))
    };
  });

  const nameOf = (n) => val('people', n.k, 'name') || (n.self ? '［氏名］' : '［お名前］');
</script>

<div class="scroller">
  <div class="tree" style:--side={T.color} style:width="{geo.W}px" style:height="{geo.H}px">
    <svg width={geo.W} height={geo.H} viewBox="0 0 {geo.W} {geo.H}" aria-hidden="true">
      <path d={geo.d} fill="none" stroke={T.color} stroke-width="1.5" stroke-opacity=".6" stroke-linejoin="round" />
      <path d={geo.rings} fill="#F1F3F7" stroke="#C8202F" stroke-width="1.5" />
    </svg>
    {#each geo.nodes as n (n.k)}
      {@const ph = val('people', n.k, 'photo')}
      <button type="button" class="node" aria-pressed={app.sel === n.k}
        style:left="{n.left}px" style:top="{n.top}px" style:width="{BW}px"
        onclick={() => (app.sel = app.sel === n.k ? null : n.k)}>
        <span class="av" class:self={n.self} class:long={n.mark.length > 1}>
          {#if okPhoto(ph)}<img src={ph} alt="" />{:else}{n.mark}{/if}
        </span>
        <span class="rel">{n.rel}</span>
        <span class="nm">{nameOf(n)}</span>
      </button>
    {/each}
  </div>
</div>
