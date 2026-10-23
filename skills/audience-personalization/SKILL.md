---
name: audience-personalization
description: Make ONE site adapt live to five audiences (healthy aging 55+, low energy, women 40+, men 35+, training and recovery) through an "I'm here for…" switcher that swaps the hero line, imagery, proof-section order, the quiz's first question and CTA wording, remembered in localStorage, with no layout shift, no SEO loss and no claims drift. Use when asked for "an audience switcher", "personalise the site", "different hero per audience", "I'm here for…", "segment the homepage", "tailor content for seniors / women / athletes", "dynamic content by persona", or when building any Pepticity template (the brief requires it).
---

# Audience personalisation (one site, five audiences)

BRIEF.md's change of direction: every template is ONE all-in-one site that serves all five audiences, and each template implements the switcher in its own visual style. It must not copy Site 1's photo cards. This skill is the shared data model and the rules, and the look is yours to design.

## 1. Content map (data, not scattered `if`s)
```js
const AUD = {
  longevity: { label: 'Healthy aging', img: 'aud-longevity.jpg', alt: 'Silver-haired man walking a coastal trail',
    hero: 'Clinician-guided peptide care, built around the life you want to keep living.',
    cta: 'Start my free healthy-aging review', quizStart: 'age', order: ['safety', 'process', 'people', 'price', 'testing'] },
  energy:    { label: 'Not feeling like myself', img: 'aud-energy.jpg', alt: 'Woman stretching in bed in morning light',
    hero: 'Tell a licensed clinician what feels off. Start with a free review.',
    cta: 'Talk it through: free review', quizStart: 'feel', order: ['process', 'people', 'safety', 'price', 'testing'] },
  women:     { label: 'Women 40+', img: 'aud-women.jpg', alt: 'Woman in her fifties by a window',
    hero: 'Peptide care with clinicians who know midlife women's health.',
    cta: 'Start my free review', quizStart: 'stage', order: ['people', 'process', 'safety', 'testing', 'price'] },
  men:       { label: 'Men 35+', img: 'aud-men.jpg', alt: 'Man in his forties running city stairs at dawn',
    hero: 'Know your numbers first. A licensed clinician decides what fits.',
    cta: 'Start with a free review', quizStart: 'labs', order: ['testing', 'process', 'price', 'people', 'safety'] },
  training:  { label: 'Training & recovery', img: 'aud-athlete.jpg', alt: 'Athlete in a dark gym',
    hero: 'Pharmacy-prepared, lot-tested, and reviewed by a clinician who works with athletes.',
    cta: 'Get my free review', quizStart: 'sport', order: ['testing', 'process', 'people', 'price', 'safety'] },
};
```
- Every string is the CUSTOMER's goal or a service fact, never a product promise. Run all five hero lines and CTAs through `regulated-claims-check` together, because personalised copy drifts toward claims ("for more energy" is an outcome claim, but "tell a clinician what feels off" is not).
- The five audiences change emphasis and imagery, not facts. Price, process, testing and compliance lines are identical for everyone.
- Section `order` uses IDs of proof sections, so reordering never duplicates content.

## 2. Switcher behaviour
- Placement: in or right under the hero, visible above the fold at 390×844, and repeated in the nav or menu so it is reachable from every view.
- Semantics: a radio group (`role="radiogroup"` with `aria-label="I'm here for"`, or real radios in a `<fieldset>`), arrow-key navigable, each option ≥ 44px (56px for the 55+ template). Include a neutral "Show me everything" option (the default).
- Persist: `localStorage['pep-aud']`, wrapped in try/catch. Also accept `?for=women` or `#home` plus `data-aud` deep links from ads, where the URL wins over storage.
- Apply on load BEFORE first paint to avoid a flash: a tiny inline script in `<head>` sets `document.documentElement.dataset.aud` from storage or the URL, and CSS shows the matching hero line. JS then fills the rest.
```html
<script>try{var a=new URLSearchParams(location.search).get('for')||localStorage.getItem('pep-aud');if(a)document.documentElement.dataset.aud=a}catch(e){}</script>
```
```css
.hero-line[data-for] { display: none; } .hero-line[data-for="all"] { display: block; }
[data-aud="women"] .hero-line[data-for="women"] { display: block; } [data-aud="women"] .hero-line[data-for="all"] { display: none; } /* …×5 */
```
All five hero lines live in the HTML (SEO and no-JS safe), and CSS picks one. All five lines get the same font size and a reserved `min-height` so swapping causes CLS 0.

## 3. What changes, and how it animates
| Element | Change | Transition |
|---|---|---|
| Hero line | Swap visible line | Template's own text effect (split rise, scramble or mask), 400–600 ms. Reduced motion: instant |
| Hero image | `img` src (preloaded on switcher hover/focus) | Cross-fade 500 ms on two stacked layers, never a blank frame. Fallback gradient per audience |
| Proof order | Reorder sections by `order` | CSS `order` on a flex column (no DOM move, no focus loss) and a GSAP Flip for motion. Call `ScrollTrigger.refresh()` after |
| Quiz first question | Pre-answer `goal` and start at `quizStart` | None (progress text updates) |
| CTA wording | All CTAs with `data-cta` | Text swap. Keep the same width with `min-width` to avoid jumps |
| Chat chips | First chip matches the audience | None |
```js
function applyAudience(id, { animate = true } = {}) {
  const a = AUD[id]; document.documentElement.dataset.aud = id || '';
  try { id ? localStorage.setItem('pep-aud', id) : localStorage.removeItem('pep-aud'); } catch {}
  const state = animate && window.Flip ? Flip.getState('.proof > section') : null;
  (a?.order || DEFAULT_ORDER).forEach((sid, i) => document.getElementById(sid).style.order = i);
  if (state) Flip.from(state, { duration: .7, ease: 'power2.inOut' });
  document.querySelectorAll('[data-cta]').forEach(b => b.textContent = a?.cta || DEFAULT_CTA);
  quiz.preset({ goal: id, start: a?.quizStart });
  ScrollTrigger.refresh();
  announce(`Showing information for ${a?.label || 'everyone'}`);   // polite live region, once
  track('audience_select', { aud: id || 'all' });
}
```
- Never scroll the user on switch. Keep their position, and move focus only if it was on an element that left the DOM (it should not be, because you reorder with CSS `order`).
- Reordering with CSS `order` changes visual order but not DOM or tab order. That is acceptable for proof sections that are independent blocks. If a section references "above" or "below", rewrite the copy.

## 4. Imagery rules
- Use the shared image pool names from BRIEF.md (`aud-*.jpg`, etc.). Each audience needs a designed fallback (gradient plus a canvas motif) because files may be missing. Use `onerror="this.remove()"`.
- Show real-feeling people of the audience's age, active and dignified, never frail or clinical. No before/after, no shirtless "transformation" shots, no injection imagery.
- Alt text describes the scene, never the outcome ("Man running stairs at dawn", not "Man with renewed energy").

## 5. Privacy
Audience choice is a preference, not health data, but treat it gently: store it locally only, send just the audience ID to analytics after consent, and never combine it with quiz answers in any outbound payload.

## Verify
- For each of the 6 states (5 audiences + all), at 390×844 and 1440×900: screenshot the hero, and assert the hero line, image `src`, first CTA text and proof `order` match the map.
- CLS stays < 0.05 while cycling all 6 states (layout-shift observer from `perf-budget-cwv`, excluding the 500 ms after input).
- Reload keeps the choice. `?for=men` overrides storage. With localStorage blocked (throwing stub), the site still works with the default.
- Keyboard: arrow keys move the radio selection, and the live region announces exactly once per change.
- Raw HTML contains all five hero lines (search-readable).
- One `regulated-claims-check` pass over all audience strings, with the result attached.
