---
name: apex-loader
description: Build the entry sequence for any site, console or page Maverick ships — the cinematic 2-5 second loading moment before the page resolves. Use whenever starting a new site or page for him, when he asks for a loading screen, intro, splash, reveal or "make the entrance feel expensive", and as a required step in every Apex build. Never ship him a site without one.
---

# Apex loader

Every site he ships opens with a short cinematic moment. Not a spinner, not a
progress bar, not a play button — a brand mark resolving out of the dark, then
the page arriving underneath it.

## The rules that make it feel expensive instead of slow

1. **2 to 5 seconds, and never a frame longer.** It is a moment, not a gate. Hard
   timeout: if assets are not ready at 5s, the loader leaves anyway.
2. **It never blocks the real content.** The page is fully rendered and readable
   underneath from the first frame. The loader is an overlay that lifts, not a
   screen the page waits behind. Content that only exists after the loader is
   invisible to search engines and to screen readers.
3. **Once per session.** Store a flag in `sessionStorage` (wrapped in try/catch —
   it throws in private windows). A loader he sees on every navigation is a tax,
   not a flourish.
4. **Reduced motion gets no loader at all.** Not a faster one. None.
5. **Nothing animates but `transform`, `opacity` and `filter`.** Anything that
   touches layout stutters on the first paint, which is the worst possible moment.
6. **Focus goes to the page, not the overlay.** `inert` the overlay, or keep it
   out of the tab order entirely, and move focus to `main` when it lifts.

## The sequence

Four beats, roughly 600ms / 900ms / 600ms / 500ms:

1. **Ignition** — black. A single hairline of cyan draws across the mark's
   baseline, left to right.
2. **Draw** — the mark strokes itself on with `stroke-dasharray` / `stroke-dashoffset`,
   cyan filament on near-black.
3. **Resolve** — the stroke fills; the chrome-gold ramp wipes across the wordmark
   once (this is the gold moment, and the only one on entry).
4. **Lift** — the whole overlay scales up a hair and fades, revealing the page
   already settled beneath it. Never a wipe or a curtain; it is a focus pull.

## Implementation

```html
<div id="boot" aria-hidden="true" inert>
  <svg viewBox="0 0 240 48" width="240" height="48" role="presentation">
    <path id="boot-mark" d="…" fill="none" stroke="var(--brand)" stroke-width="1.4"/>
  </svg>
  <span class="boot-rule"></span>
</div>
```

```css
#boot{position:fixed;inset:0;z-index:999;display:grid;place-items:center;
  background:var(--void);
  transition:opacity .5s cubic-bezier(.16,1,.3,1), transform .5s cubic-bezier(.16,1,.3,1)}
#boot.lifting{opacity:0;transform:scale(1.04);pointer-events:none}
#boot-mark{stroke-dasharray:var(--len);stroke-dashoffset:var(--len);
  animation-name:draw;animation-duration:.9s;animation-delay:.6s;
  animation-timing-function:cubic-bezier(.16,1,.3,1);animation-fill-mode:both}
@keyframes draw{to{stroke-dashoffset:0}}
@media (prefers-reduced-motion:reduce){#boot{display:none}}
```

```js
(function(){
  var boot = document.getElementById('boot');
  if(!boot) return;
  var seen = false;
  try { seen = sessionStorage.getItem('booted') === '1'; } catch(e){}
  if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) { boot.remove(); return; }
  var mark = document.getElementById('boot-mark');
  if (mark) mark.style.setProperty('--len', mark.getTotalLength());
  function lift(){
    if (!boot.isConnected) return;
    boot.classList.add('lifting');
    try { sessionStorage.setItem('booted','1'); } catch(e){}
    boot.addEventListener('transitionend', function(){
      boot.remove();
      var m = document.querySelector('main');
      if (m) { m.setAttribute('tabindex','-1'); m.focus({preventScroll:true}); }
    }, {once:true});
  }
  var t = setTimeout(lift, 5000);                       // hard ceiling
  window.addEventListener('load', function(){           // normal path
    clearTimeout(t); setTimeout(lift, 2200);
  });
})();
```

`getTotalLength()` must run before the animation starts, or the dash offset is
`NaN` and the mark appears fully drawn with no animation at all. That is the
single most common way this effect silently does nothing.

## Per-site variation

The sequence stays; the mark changes. Each site draws *its own* mark — never a
generic logo placeholder, never a spinner dressed up. If a site has no mark yet,
say so and build the loader last rather than inventing one.

## Verify before shipping

- Hard refresh: loader runs once. Navigate within the site: it does not run again.
- Throttle to slow 3G: content is readable underneath before the loader lifts.
- Toggle reduced motion: no loader, page usable immediately.
- Tab immediately on load: focus lands in the page, never trapped in the overlay.
- View source with JS disabled: all content present.
