# CRD-111 · Etched Bubble

A speech-bubble of frosted glass with a large quotation mark etched into it that lights up from behind.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-111/module.css">
<figure class="apx-c111" data-apx="CRD-111">
  <div class="apx-c111__in">
    <span class="apx-c111__chip">Placeholder quote</span>
    <blockquote>[Your customer’s words, used with their permission.]</blockquote>
    <figcaption><span><b>[Name]</b> · [Business], [City]</span></figcaption>
  </div>
</figure>
<script src="library/CRD-111/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-111"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD111.mount(el)` (also `window.APX['CRD-111']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
The light behind the etched quotation mark breathes slowly. Pointing tilts the bubble, moves the sheen and brings the light behind the mark up to full glow.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
The quote is a real blockquote with a figcaption; it is clearly marked as a placeholder until a real, permitted quote is added. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.
