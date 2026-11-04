# CRD-127 · Fanned Deck

Three glass trade cards held like a hand of cards that fan out when you point and deal to the front one by one.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-127/module.css">
<section class="apx-c127" data-apx="CRD-127" aria-label="Trades">
  <ul>
    <li class="apx-c127__card" data-pos="0"><span class="apx-c127__tab">Trade</span><div class="apx-c127__body"><p class="apx-c127__n" aria-hidden="true">01</p><h3 class="apx-c127__t">Roofing</h3><p class="apx-c127__d">Repairs, new roofs and storm damage.</p></div></li>
    <li class="apx-c127__card" data-pos="1"><span class="apx-c127__tab">Trade</span><div class="apx-c127__body"><p class="apx-c127__n" aria-hidden="true">02</p><h3 class="apx-c127__t">Plumbing</h3><p class="apx-c127__d">Leaks, drains and water heaters.</p></div></li>
    <li class="apx-c127__card" data-pos="2"><span class="apx-c127__tab">Trade</span><div class="apx-c127__body"><p class="apx-c127__n" aria-hidden="true">03</p><h3 class="apx-c127__t">Heating &amp; cooling</h3><p class="apx-c127__d">Furnaces, air conditioning and heat pumps.</p></div></li>
  </ul>
  <button class="apx-c127__next" type="button">Next trade</button>
  <p class="apx-c127__live" aria-live="polite"></p>
</section>
<script src="library/CRD-127/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-127"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD127.mount(el)` (also `window.APX['CRD-127']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
The hand of cards breathes gently. Pointing fans the cards out; clicking a card at the back, or pressing "Next trade", deals it to the front.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
The cards are a list; "Next trade" is a real button and the front card is announced through a polite live region. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.
