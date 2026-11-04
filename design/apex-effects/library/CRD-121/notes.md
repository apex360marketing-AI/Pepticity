# CRD-121 · Postmark Stamp

A new-lead notice on a perforated glass postage stamp; pointing at it slams a postmark down onto the glass.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-121/module.css">
<article class="apx-c121" data-apx="CRD-121" aria-label="Sample new lead notice">
  <div class="apx-c121__in">
    <p class="apx-c121__k">New lead for [Your business]</p>
    <span class="apx-c121__chip">Sample</span>
    <h3 class="apx-c121__title">Bathroom remodel</h3>
    <p class="apx-c121__text">[City] · sent at [time] to your phone and your CRM.</p>
    <div class="apx-c121__denom"><span>Leads in this notice</span><b>1</b></div>
  </div>
</article>
<script src="library/CRD-121/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-121"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD121.mount(el)` (also `window.APX['CRD-121']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
A soft sheen passes over the stamp. Pointing tilts it and presses the postmark down onto the glass with a little bounce; leaving lifts it.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
The postmark is decorative; the lead notice is plain text marked Sample. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.
