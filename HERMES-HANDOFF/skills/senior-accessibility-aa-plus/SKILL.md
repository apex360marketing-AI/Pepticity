---
name: senior-accessibility-aa-plus
description: Make cinematic sites comfortable for older visitors by going beyond WCAG 2.2 AA. Covers body text ≥ 18–20px, 7:1 body contrast, 44–56px targets, focus never hidden behind sticky bars (2.4.11), a text-size control, plain language at US grade 6–8, a visible phone number, no information carried by motion alone, consistent help, and an automated axe-core pass plus custom checks. Use when asked to "make it senior friendly", "for older users", "55+ audience", "accessibility pass", "WCAG", "bigger text", "easier to read", "ADA check", "large-text mode", or before shipping any Pepticity template (the healthy-aging audience is core).
---

# Senior accessibility (WCAG 2.2 AA+)

House `quality-gate` enforces WCAG 2.2 **AA** via axe. This skill sets the higher bar for the 55+ audience and adds the checks axe cannot make. For colour maths (ratios, APCA, text over images) use the colour agent's `contrast-and-accessibility-color` skill. This skill only sets the targets.

## Targets (AA+ = AA plus the AAA items that matter for ageing eyes and hands)
| Area | Target | WCAG reference |
|---|---|---|
| Body text | ≥ 18px (Prime/55+ templates ≥ 20px), line-height 1.5–1.7, measure 45–75ch | 1.4.12 support; AAA 1.4.8 |
| Small text (labels, legal, captions) | ≥ 16px. Never below 14px, even for the footer disclaimer | — |
| Body contrast | ≥ 7:1 | 1.4.6 (AAA) |
| Large text / UI parts / focus ring | ≥ 4.5:1 text, ≥ 3:1 non-text | 1.4.3 / 1.4.11 |
| Targets | ≥ 44×44px everywhere, ≥ 56px for primary CTAs, quiz options and form inputs, with ≥ 8px spacing | 2.5.5 (AAA); 2.5.8 AA is only 24px |
| Focus | Visible ring ≥ 3px, offset 2px, never hidden by sticky header, CTA bar or chat | 2.4.7, 2.4.11 (AA), 2.4.13 |
| Zoom | 200% text and 400% zoom (320 CSS px wide) with no sideways scroll or clipped text | 1.4.4, 1.4.10 |
| Motion | Everything moving > 5 s can be stopped. Reduced motion is honoured. No meaning only in motion | 2.2.2, 2.3.3 |
| Help | Phone number and "Call me back" in the same place on every view | 3.2.6 |
| Forms | Visible labels (no placeholder-only), errors in text, no re-typing the same data | 3.3.2, 3.3.7 |
| Reading level | US grade 6–8 for body copy, FAQ and quiz | 3.1.5 (AAA) |

## 1. Type and the text-size control
Size everything in `rem` so one root change scales the page. Site 1 already sets `html[data-text="large"]` from `.a11y-toggle` with `aria-pressed`, persisted in localStorage.
```css
html { font-size: 112.5%; }                       /* 18px body base; Prime: 125% = 20px */
html[data-text="large"] { font-size: 131.25%; }   /* 21px; Prime large: 143.75% = 23px */
body { font-size: 1rem; line-height: 1.6; }
h1 { font-size: clamp(2.25rem, 1.4rem + 4vw, 4.5rem); }   /* clamp() with a rem floor so the toggle still scales it */
```
- The control is a real `<button aria-pressed>` with visible text ("Larger text" / "A A"), in the header on every view, and it works during the intro.
- After toggling, call `ScrollTrigger.refresh()` (pins measured at the old size break).
- Never use `vw`-only font sizes, because they ignore the user's zoom and the toggle.
- Test with the toggle on at 390px: no clipped headings, no buttons pushed off-screen, no sideways scroll.

## 2. Focus not obscured (2.4.11)
```css
:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; border-radius: 4px; }
html { scroll-padding-top: calc(var(--header-h) + 16px); scroll-padding-bottom: calc(var(--sticky-cta-h, 0px) + 16px); }
```
Update `--sticky-cta-h` when the bar shows or hides. Lenis's `scrollTo` ignores scroll-padding, so pass `offset: -(headerH + 16)`.

## 3. Plain language (grade 6–8)
- Short sentences (≤ 20 words on average) and common words: "use" not "utilise", "check" not "verify". Explain terms on first use ("a licensed clinician, a medical professional who…").
- Measure it. A Flesch–Kincaid estimate is good enough for a gate:
```js
const syl = w => (w.toLowerCase().replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '').match(/[aeiouy]{1,2}/g) || [1]).length;
function fkGrade(text) { const s = text.split(/[.!?]+\s/).filter(Boolean).length || 1, words = text.match(/[A-Za-z']+/g) || [];
  const sy = words.reduce((n, w) => n + syl(w), 0); return 0.39 * (words.length / s) + 11.8 * (sy / words.length) - 15.59; }
// run on main body copy per view (exclude legal disclaimer); target ≤ 8.0, flag > 9.0
```

## 4. Phone and help
- Show `[phone number]` as selectable text plus a `tel:` link, ≥ 18px, in the header (desktop) and in the sticky bar or footer (mobile), on every view. Add the hours beside it.
- "Call me back" is a short form: name, phone, best time, as one field each with visible labels and `autocomplete="name"` / `autocomplete="tel"`.
- Never make chat the only help channel.

## 5. Motion and senses
- The intro's Skip button is visible from frame 1 (satisfies 2.2.2). Marquees, auto-advancing sliders and looping video need a pause button, or they must not exist.
- No information only in motion or animation: counters must show the final number in the HTML, and a scroll story must have its steps as readable text (BRIEF: the page is complete at rest).
- No flashing > 3 per second (2.3.1), including shader flicker and strobing light sweeps.
- Hover-only reveals also open on focus and tap. Tooltips stay until dismissed (1.4.13).
- Parallax and scrub are off under `prefers-reduced-motion`. Gate pins to ≥ 901px.

## 6. Forms and quiz for older users
- Labels sit above fields, and inputs are ≥ 56px tall with 18px+ text. Never use placeholder-as-label.
- Errors appear inline in text and in a summary at the top with links to each field. Never clear what the user typed.
- No time limits. If one is unavoidable, warn first and allow ≥ 10× extension (2.2.1).
- Support password managers and paste. No CAPTCHA puzzles (3.3.8).

## 7. Automated pass (axe-core 4.14 + custom checks)
Verified: `@axe-core/playwright@4.14.0`, `axe-core@4.14.0`, `playwright@1.64.1`.
```js
import AxeBuilder from '@axe-core/playwright';
const res = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'wcag2aaa'])   // aaa adds color-contrast-enhanced (7:1)
  .exclude('#intro').analyze();
const bad = res.violations.filter(v => ['serious', 'critical'].includes(v.impact) || v.id === 'color-contrast-enhanced');
// custom checks axe doesn't make:
const issues = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('p, li, dd, label, td')) {
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (el.offsetParent && el.textContent.trim().length > 40 && fs < 18) out.push(['body<18px', el.className, fs]);
  }
  for (const el of document.querySelectorAll('a[href], button, input, select, textarea, [role=button], summary')) {
    const r = el.getBoundingClientRect();
    if (el.offsetParent && (r.width < 44 || r.height < 44) && !el.closest('p')) out.push(['target<44', el.outerHTML.slice(0, 60), Math.round(r.width), Math.round(r.height)]);
  }
  if (!/\[phone number\]|\d{3}[\s.-]\d{3}[\s.-]\d{4}/.test(document.body.innerText)) out.push(['no-visible-phone']);
  return out;
});
```
Inline links inside paragraphs are exempt from the 44px check (2.5.5 exception), but give them a ≥ 2px underline.

## Verify (both 390×844 and 1440×900, every view, toggle off and on)
- axe: zero serious or critical issues and zero `color-contrast-enhanced` on body copy. Report counts.
- Custom checks: zero `body<18px` (or <20px for Prime), zero `target<44`, phone visible.
- Tab through every view: the focused element's rect is never under the header or sticky bar (compare rects on each Tab, about 40 steps).
- 200% zoom (`page.setViewportSize({width: 640})` with `deviceScaleFactor: 2`) and 320px width: `scrollWidth <= innerWidth`.
- FK grade per view ≤ 8 (list any paragraph > 9 with a rewrite).
- `reducedMotion:'reduce'`: no transform changes over 2 s on any element (two snapshots of `getComputedStyle` transforms).
