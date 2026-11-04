---
name: holo-glass-ui
description: Build APEX "holo-glass" interfaces - screens, panels, cards and objects that are real holograms crossed with glassmorphism - almost fully see-through, projected light instead of frosted plastic, yet every word stays easy to read. Use whenever the owner asks for hologram / holographic screens, floating screens, a holographic globe or object, "see-through but readable" panels, the APEX DESK room, or wants glassmorphism to "look like an actual hologram".
---

# HOLO-GLASS UI (owner, 30 Oct 2026)

The owner's words: "it all has to be holographic ... it kind of looks like glass morphism, but it's an actual hologram. So it's see-through, and you can read it all very easily." First build: APEX DESK room (`design/desk/room/`), the floating liquid-gold hologram globe.

Pair with: `liquid-chrome-gold` (the gold material), `apex-house-style`, `apex-glassmorphism`, `threejs-real-3d`, `premium-micro-interactions`.

## 1. What makes it a hologram and not just glass
A hologram is LIGHT, not a material. Every holo surface has these five signals (use at least four):
1. **Additive light, not paint**: panel fills are near zero (`rgba(255,250,236,.015-.04)`); the visible parts are emissive lines, text and edges. In WebGL use `AdditiveBlending` for glows and rims, normal blending only for the thing that must read as substance (e.g. molten gold body).
2. **Fresnel edge**: the edge is brightest, the middle almost invisible (`pow(1-|N·V|, 2-3)` in shaders; in CSS a 1px gradient rim plus an inner `box-shadow` glow of 6-14px at low alpha).
3. **Scan structure**: very fine horizontal scanlines (2-3px period, 6-14% contrast), drifting slowly. Never so strong they hurt reading: scanlines go on the panel BACKGROUND layer only, never over text.
4. **Projection**: something casts it. A soft light pool where it would hit a surface (desk, floor), and/or a faint light cone or base slit. Floating objects bob 4-8px on a 6-8s sine.
5. **Life**: a barely visible flicker (amplitude ≤ 5%, two mixed sines, never strobing), occasional sweep of light across the surface every 8-14s, and parallax with the pointer (rotate 3-6deg, translate 6-12px).

Honour `prefers-reduced-motion`: no bob, no flicker, no sweep; keep scanlines static.

## 2. Readability rules (non-negotiable)
- Text is never on a transparent field alone. Put a **text bed** behind the text block only: `background: radial-gradient(closest-side, rgba(5,5,6,.55), rgba(5,5,6,0))` or a 10-14px blur behind the text bounding box. The panel stays clear; the words get contrast.
- Body text: Hanken Grotesk 14-16px, colour `#f1ece2` (warm white), `text-shadow: 0 0 1px rgba(0,0,0,.9), 0 0 12px rgba(0,0,0,.6)` plus a faint emissive `0 0 8px rgba(240,230,199,.18)`.
- Headings: Syncopate caps in the chrome-gold gradient (see `liquid-chrome-gold`), always with a dark drop shadow so they read on any wall.
- Measure contrast against the BUSIEST part of the background behind the panel: ≥ 4.5:1 body, ≥ 3:1 large text. Screenshot and check, every time.
- Interactive targets ≥ 40px; focus ring = 2px chartreuse `#d4ff3a` outline (the only place chartreuse is more than a dot).

## 3. Panel anatomy (CSS)
```
.holo{position:relative;isolation:isolate}
.holo::before{/* field */content:"";position:absolute;inset:0;background:linear-gradient(160deg,rgba(255,250,236,.04),rgba(255,250,236,.008) 45%,rgba(255,250,236,.025));
  -webkit-backdrop-filter:blur(1.5px) saturate(125%);backdrop-filter:blur(1.5px) saturate(125%);clip-path:var(--cut)}
.holo .scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(240,230,199,.06) 0 1px,transparent 1px 3px);mix-blend-mode:screen;animation:scan 9s linear infinite;clip-path:var(--cut);pointer-events:none}
.holo .rim{/* 1px chrome-gold edge via mask-composite, brightest at top-left */}
.holo .glow{position:absolute;inset:-1px;box-shadow:0 0 18px -6px rgba(240,230,199,.35),inset 0 0 24px -12px rgba(240,230,199,.35);clip-path:var(--cut)}
.holo .bed{/* text bed behind the text block only */}
@keyframes scan{to{background-position:0 60px}}
```
Cut corners (house style), radius ≤ 3px. Blur stays SMALL (≤ 3px) or the panel turns into frosted plastic; the owner wants "almost completely see-through".

## 4. Making screens "mesh together"
Screens in one room are ONE system, not separate cards:
- Same perspective origin for all (one `perspective` on the shared parent, screens angled toward one focal point, e.g. the globe). Outer screens rotate more (±24-32deg), inner less (±10-16deg).
- Shared light: one light direction drives every rim highlight and glare (`--gx/--gy` from the pointer, same for all).
- Connective tissue: faint projected light lines (1px, 8-15% alpha, animated dash) from each screen's inner edge to the globe/hub, so they read as projected by it.
- Same baseline grid and type scale on every screen; labels in the same corner on every screen.
- Spacing: equal gaps; nothing touching the photo's bright features (pillars, trim highlights).

## 5. Opening a screen (it must WORK, not just look good)
- Click/Enter on a screen: FLIP it from its spot to a centred working size (≤ 980px wide), un-angle it to 0deg, raise the text bed opacity a little for long reading, dim the room 40-55%. Esc/Close or a click outside returns it.
- The opened screen is the real tool: lists you can tick/add/edit/delete, a notes box you can type in, items that open their review room. Data lives in the artifact `db` (see the desk: collections `items`, `feedback`, `tasks`). Live updates via `onSnapshot`; never a fake static list.
- Focus moves into the opened screen and is trapped there; return focus to the screen on close.

## 6. Holographic objects (WebGL, three.js r128 UMD from cdnjs)
Recipe used for the desk globe:
- Shell sphere, `ShaderMaterial`, `DoubleSide`, back faces at ~30% so you see through to the far side.
- Domain-warped simplex noise drives the molten pattern; `mask` keeps part of the surface clear so it stays a hologram.
- Fresnel rim + fine lat/long grid + scanlines (`sin(worldY*170 - t*5)`) + flicker.
- Orbit rings: thin tori with an additive gold shader that runs light around them.
- Points of interest: additive sprites (radial gradient canvas texture). Chartreuse only for "needs you".
- No stand: the object floats, bobs, slowly tilts; a CSS light pool (`mix-blend-mode:screen`, blurred radial) on the surface below.
- Keep all colours under 1.0 before blending; additive layers stack and clip to white (the first globe looked silver-white for this reason). Check by tinting the output (e.g. `*vec3(1,.4,.1)`): if the tint shows, the pipeline is fine and you are clipping.
- DPR cap 2; pause rendering when the tab is hidden.

## 7. Gates before showing the owner
- Screenshot desktop 1440x900 and phone 390x844, look at them, crop-zoom the hologram.
- Readability check on every screen over its busiest background patch.
- Banned colours check (no green, no orange/yellow gold; only the pale chrome-gold ramp).
- Short clip (GIF/MP4) of the motion, since a still can't show a hologram.
