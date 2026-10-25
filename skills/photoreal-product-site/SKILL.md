---
name: photoreal-product-site
description: Make a product landing page (peptides, supplements, skincare, any physical product) look like a premium brand people want to buy from — Higgsfield photo-real product shoots with ONE consistent product across every shot, a shot list per page, art direction per palette, getting the media into an artifact, scroll-turned product from a turntable film, image-led layouts, ALL-CAPS headings, and a "would I buy this?" gate. Use whenever a product site, hero, packshot, vial/bottle/jar visual, or "make it look expensive / not cheap / professional" request comes up, and before ever drawing a product in three.js.
---

# Photo-real product site

The owner's verdict on a hand-built three.js vial: "looks like a 10-year-old drew the bottle… nobody is buying that." Lesson: **a product page sells with photography**. Code makes the motion, the type and the interactions; the product itself must be photo-real.

## Hard rules
1. **Never a procedural 3D product as the hero.** three.js / CSS may add light, particles, refraction or a depth wobble *around* a real image, never replace it.
2. **ALL headings in CAPITALS** (h1–h3, wordmarks, menu, card titles, intro words) via `text-transform:uppercase` + tracking `.04–.14em`; brand names (PEPTICITY, APEX 360) typed in capitals in source, labels and textures too.
3. **One product, every shot.** Generate the hero packshot first, then pass that job id as the reference image for every other shot so the vial, cap, label and box match. Reject any shot where the product changed shape, cap colour or label.
4. **Confirm credits before generating** (quote with `get_cost:true`; show the shot list and total). Sample first: shoot ONE option, show it, then the rest.
5. Compliance for health products: no syringes, needles, injection, dosing, pills-in-hand claims, before/after, faces with outcome implications. Allowed: vials, boxes, lab glass, cold-chain case, certificate paper, clinician hands writing (no faces needed), textures.
6. Brand colours: no gold/amber/champagne anywhere in the shot (caps, foil, light temperature). Use chrome/platinum/matte black. Warm light only if neutral, never yellow.

## Models and cost (checked 2026-10-25)
| Use | Model | Cost |
|---|---|---|
| Hero packshot / stills, reference-consistent | `flux_3_image` (up to 10 refs, 2k) | 3 cr |
| Quick drafts | `gpt_image_2_5` | 0.25 cr |
| Product ad stills | `marketing_studio_image` 2k | 2 cr |
| Intro film / turntable, 8 s silent | `kling3_0` mode `pro`, `sound:"off"`, `start_image` = hero still | 14 cr |
| Higher-end film | `seedance_2_5` omni_reference 1080p 8 s | 128 cr (ask first) |

## Shot list per option (≈ 6 stills + 2 films ≈ 46 cr)
1. **Hero packshot** 16:9 — the vial (and box) on the page's ground colour, studio light, the page's accent as rim light, generous empty space on the copy side.
2. **Macro label** 3:2 — the lot code and label typography, shallow depth of field.
3. **Still life with box** 4:5 — vial + carton + certificate card, editorial.
4. **Cold-chain** 3:2 — insulated case, frost, vial nested (delivery story).
5. **Lab/QA** 3:2 — chromatography vials, gloved hand, no face (testing story).
6. **Clinician** 3:2 — hands, stethoscope or tablet with notes; no face or a face out of focus.
7. **Film A: intro plate** — slow push-in or light sweep across the hero vial, 8 s.
8. **Film B: turntable** — 180–360° orbit of the vial, locked exposure, plain ground (for the scroll-turned product).

### Prompt anatomy
`[subject, exact product description repeated verbatim] · [set + ground colour as hex words] · [lighting: key softbox 45°, rim in <accent>, practical reflections] · [lens: 100mm macro / 85mm, f/4, shallow DOF] · [mood words: clinical, couture, quiet] · [composition: subject right third, negative space left] · "photorealistic product photography, no text other than the label, no people's faces, no syringes"`.
Write the label text into the prompt in capitals ("PEPTICITY" wordmark, "LOT PX-2611-A") and check it renders legibly; if a model garbles it, regenerate or composite the label in CSS over a clean area.

## Getting media into the page
- Higgsfield results live on `d8j0ntlcm91z4.cloudfront.net`. The cloud environment must allow that host (environment settings → Network access → Allowed domains). If it is blocked, say so and stop; never fake the imagery.
- Stills: resize to 2400/1600/900 wide JPEG q82 (or WebP), `srcset`, `fetchpriority="high"` on the hero only.
- Films: follow pepticity `skills/web-video-pipeline` (intro only, H.264 + poster, < 3 MB mobile).
- **Scroll-turned product (allowed everywhere because it is stills, not playback):** extract 48–72 frames from Film B (`ffmpeg -i turn.mp4 -vf "fps=8,scale=1200:-2" -q:v 5 f%03d.jpg`), preload progressively, draw the frame for the scroll progress onto a `<canvas>` (Apple AirPods style). Keep total ≤ 4 MB.
- Artifacts: publish media as `files` next to the page (relative paths), within the 16 MB/file and 511-file limits.
- Blend photos into the page: match the photo ground to `--bg`, then feather edges with `mask-image: radial-gradient(...)` so there is never a visible rectangle.

## Layout patterns that read "expensive"
- Product-as-hero, image bleeding off one edge, headline in caps set large with tight leading on the other side; one CTA.
- Alternating full-bleed photo sections with short caps headings and one sentence; let images breathe (≥ 12vh vertical space).
- Detail crops (macro) as section openers; captions in mono like a spec sheet.
- Motion is slow and physical: parallax ≤ 8%, mask reveals, the scroll-turned product, light sweeps over photos (CSS gradient with `mix-blend-mode:soft-light`). No bouncing, no confetti.
- Glass cards only over photography or deep gradients, never over flat black.

## "Would I buy this?" gate (before showing the owner)
Screenshot desktop + phone and answer honestly, all must be yes:
- Does the product look real and premium at 100% zoom (no warped cap, mushy label, plastic look)?
- Is the same product identical in every shot?
- Are all headings in capitals and the brand in capitals everywhere?
- Would this sit next to Aesop / Hims / Function Health without looking homemade?
- No gold, no green (except allowed chartreuse sparks), no blue/purple-led areas?
Then run `quality-gate` and `award-jury-review`.
