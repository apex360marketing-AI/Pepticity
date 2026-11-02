# CRD-130 · Hinged Doors

Two glass doors on chrome hinges that swing open to reveal a short call-back request form inside.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-130/module.css">
<article class="apx-c130" data-apx="CRD-130" aria-label="Request a call back">
  <form class="apx-c130__form" action="#" novalidate>
    <h3>Request a call back</h3>
    <p class="s">We’ll ring you at a time that suits you.</p>
    <label>Name<input name="name" autocomplete="name" placeholder="[Your name]"></label>
    <label>Mobile number<input name="tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="e.g. [000 000 0000]"></label>
    <label>Best time<select name="when"><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label>
    <button class="apx-c130__send" type="submit">Call me back</button>
    <p class="apx-c130__msg" role="status" aria-live="polite"></p>
  </form>
  <button class="apx-c130__open" type="button" aria-expanded="false">Open</button>
</article>
<script src="library/CRD-130/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-130"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD130.mount(el)` (also `window.APX['CRD-130']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
Light glows through the seam between the doors. Pointing parts the doors a little; "Open" swings them wide to reveal the form, and the form shows a demo thank-you when sent.

## Tokens read
`--apx-accent`, `--apx-accent-ink`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
While the doors are shut the form is inert, so it cannot be tabbed into. The open button uses aria-expanded and moves focus into the form; the result is announced politely. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.
