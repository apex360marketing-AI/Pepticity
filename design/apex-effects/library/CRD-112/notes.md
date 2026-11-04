# CRD-112 · Lanyard Badge

A glass staff badge hanging from a lanyard that swings when you brush it and slides up a short bio.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-112/module.css">
<article class="apx-c112" data-apx="CRD-112" aria-label="Your contact">
  <div class="apx-c112__in">
    <div class="apx-c112__portrait" aria-hidden="true"><span class="apx-c112__halo"></span><span class="apx-c112__face"><svg viewBox="0 0 100 100"><circle cx="50" cy="40" r="17" fill="currentColor" fill-opacity=".55"/><path d="M14 100c4-22 18-34 36-34s32 12 36 34z" fill="currentColor" fill-opacity=".4"/></svg></span><span class="apx-c112__gloss"></span></div>
    <h3 class="apx-c112__name">[Name]</h3>
    <p class="apx-c112__role">[Role]</p>
    <p class="apx-c112__tag">Your contact at APEX</p>
    <p class="apx-c112__line">[What they do for you, in one line]</p>
    <button class="apx-c112__more" type="button" aria-expanded="false" aria-controls="bio-x">About [Name]</button>
  </div>
  <div class="apx-c112__bio" id="bio-x"><b>About [Name]</b><p>[Short bio: years in the trade and the areas they look after.]</p><button class="apx-c112__close" type="button">Close</button></div>
</article>
<script src="library/CRD-112/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-112"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD112.mount(el)` (also `window.APX['CRD-112']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
The badge sways gently on its lanyard. Moving the pointer across it pushes it into a real swing that settles, and the portrait layers shift for depth. "About" slides a short bio up over the badge.

## Tokens read
`--apx-accent`, `--apx-accent-ink`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
About is a real button with aria-expanded controlling the bio panel; nothing swings with reduced motion. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.
