# CRD-102 · Chamfer Plate

A pricing card cut like a machined glass plate, whose edge lights up from behind wherever you point.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-102/module.css">
<article class="apx-c102" data-apx="CRD-102" aria-label="Plan">
  <div class="apx-c102__in">
    <p class="apx-c102__plan">[Plan name]</p>
    <p class="apx-c102__for">For [who this plan suits]</p>
    <p class="apx-c102__price"><span class="apx-c102__amt">[Your price]</span><span class="apx-c102__per">per month</span></p>
    <ul class="apx-c102__list">
      <li>[Number] checked leads a month</li>
      <li>Sent to your phone and your CRM</li>
      <li>Each lead goes to your business only</li>
      <li>[Your contract terms]</li>
    </ul>
    <a class="apx-c102__cta" href="#plan">Choose this plan</a>
  </div>
</article>
<script src="library/CRD-102/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-102"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD102.mount(el)` (also `window.APX['CRD-102']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
A soft light breathes behind the plate. Pointing at it tilts the plate, follows the pointer with a glow behind the glass and lights the nearest stretch of the rim.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
The plan is a plain list and a link; nothing is hidden behind hover. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.
