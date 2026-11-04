# CRD-104 · Crest Shield

A glass shield inside a chrome bezel whose reflections slowly turn; the seal glows from behind on hover.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-104/module.css">
<article class="apx-c104" data-apx="CRD-104" aria-label="How leads are checked">
  <div class="apx-c104__in">
    <div class="apx-c104__seal" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor"><circle class="r" cx="32" cy="32" r="29" stroke-width="1.2" stroke-dasharray="2 4"/><circle cx="32" cy="32" r="22" stroke-width="1.6"/><path d="M22 33l7 7 13-15" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    <p class="apx-c104__eyebrow">Before it reaches you</p>
    <h3 class="apx-c104__title">Every lead is checked</h3>
    <ul class="apx-c104__list">
      <li><div><b>Real phone number</b><span>[Your check]</span></div></li>
      <li><div><b>Real address</b><span>[Your check]</span></div></li>
      <li><div><b>A real request</b><span>[Your check]</span></div></li>
    </ul>
    <p class="apx-c104__foot">[Your verification process]</p>
  </div>
</article>
<script src="library/CRD-104/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-104"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD104.mount(el)` (also `window.APX['CRD-104']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
Reflections travel slowly round the chrome bezel. Pointing tilts the shield, speeds the reflections and lights the seal from behind.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
The checks are a plain list; the seal drawing is decorative. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.
