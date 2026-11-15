---
name: "laser-engraver"
description: "Build the laser-engraving effect: a visitor types their name, presses a striking ENGRAVE button, and a laser writes it into a glass card or surface on the page with sparks, glow and a finished engraved look (frosted etch, deep cut, UV glow, chrome inlay and more). Use when asked for engraving, laser effects, personalising a card or product with a name, holograms that write or etch, or a 'wow' interaction on a members' card."
---

# Laser engraver

The engraving must read as a real laser working on real glass, not as text fading in.
It is built in the page (canvas plus SVG), so it works live on the site, at 60 frames a
second, with no image generator and no outside library.

## 1. The interaction

1. The visitor types their name (letters, spaces, hyphen, apostrophe; 2 to 24 characters;
   trimmed; shown in capitals in the brand font). Never inserted as HTML: `textContent`
   only. Never written to browser storage, the URL or analytics.
2. They press ENGRAVE (a striking button in the house glass style: cut corners, no pills,
   no points, light underneath).
3. The laser head appears at the start point and writes the name in 2 to 3.5 seconds.
4. The result settles: hot edges cool from white to the finish colour, a few sparks fade,
   a faint smoke wisp drifts up and vanishes. The card tilts slightly so the engraving
   catches the light. An `aria-live` region says "Your name has been engraved".
5. Typing a new name and pressing again clears and re-engraves.

## 2. Two engines (pick per style)

- **Raster** (like a real engraver): draw the name into an offscreen canvas mask at device
  pixel ratio; the beam sweeps line by line (or in a fast serpentine), revealing the mask
  where it has passed. Reads as industrial and precise.
- **Vector trace**: the name as SVG text with a stroke that draws itself
  (`stroke-dasharray` / `stroke-dashoffset`), the laser head following the drawing front,
  then the fill (the finish) comes in behind it. Reads as handwriting with light.

## 3. The laser head (the part that sells it)

A small white-hot core (2 to 3 px), a tight logo-blue bloom (#2a78ff, ice core #cfe6ff),
a short motion streak, and sparks: 8 to 20 tiny particles per frame at the head, flung
away from the surface, cooling from white through ice-blue to nothing in about 0.4 s,
with a little gravity. The surface just behind the head stays hot (bright edge) for a
fraction of a second. Optional faint smoke. Only `transform` and `opacity` on DOM layers;
particles on a canvas.

## 4. Finishes (brand palette only: black, chrome, platinum, ice, the one blue, a touch of pale chrome gold)

1. **Frosted etch**: white frosted letters inside the glass, soft inner shadow, faint sparkle.
2. **Deep cut**: dark engraved channel with bright bevelled edges catching the top light.
3. **UV glow**: letters that fluoresce a cool ultraviolet blue (violet hint allowed only here).
4. **Chrome inlay**: polished chrome letters set into the glass, with a moving reflection.
5. **Plasma burn**: edges glow white-blue and cool to a dark smoky etch.
6. **Hologram etch**: thin ice-blue scanline shimmer that shifts with the pointer.
7. **Diamond cut**: faceted letters, sharp highlights that sparkle as the card tilts.
8. **Gold leaf**: pale chrome-gold fill (reflection, never a glow; use sparingly).

## 5. Rules

- `prefers-reduced-motion`: no beam, no sparks: the finished engraving appears at once.
- Stop all animation frames when done or off screen; no work while hidden.
- Canvas sized to device pixel ratio, capped for phones; the engraving stays crisp.
- Keyboard: Enter in the name field engraves; the button is a real `<button>`; focus visible.
- Security: input limited and escaped, a content security policy compatible (scripts in
  files, no `eval`, no inline handlers).
- Nothing personal leaves the page; the engraving is visual only until the form is submitted.

## 6. Proof before showing

- Record each style with Playwright (video or frames to GIF/MP4) at 1440 and at a phone size,
  and look at the frames: beam visible, sparks visible, final engraving crisp and on brand.
- Tests: the name appears in the finished state; HTML in the name is shown as text;
  reduced motion skips the animation; no requests and no storage writes; 0 page errors;
  frame budget holds (no long tasks over 50 ms during the engrave on a 4x-slowed CPU).
