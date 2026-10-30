---
name: liquid-glass-studio
description: Recreate a reference image's glass look exactly (liquid-metal glass panels, raindrop/droplet glass, chrome rims, smoke, mesh) and turn it into reusable APEX surfaces. Use whenever the owner attaches a reference image to "duplicate", asks for liquid glass, raindrop / water-droplet glass, chrome-rimmed glass panels, or glass textures for a site. Covers the look-match checklist, Higgsfield generation and transfer, live web build (SVG refraction droplets), and how to show results.
---

# Liquid glass studio

Owner's words: "duplicate it... the colours, the shine, the chrome, the texture, every piece of it... even percentage-based." Fidelity to the reference beats invention. Builds on `apex-glassmorphism` (web glass recipe) and `photoreal-product-site` (Higgsfield rules).

## 1. Read the reference before anything (mandatory)
Open the actual image with Read. Write a measured breakdown, not adjectives:
- **Composition**: how many panels, what is cropped (top / right edge), viewing angle (straight-on vs tilted), panel aspect.
- **Rim**: thickness as % of panel width, metal tone (rose-gold / platinum), how much is dark reflection vs bright highlight, inner groove.
- **Backing**: mesh/texture type, cell density, brightness (dark / mid grey), where it's lighter.
- **Accent material** (liquid metal, drops, smoke): coverage % of each panel, where it sits (left edge, bottom), width (hair-thin / ribbon / pooled), highlight colour (white-hot vs cream).
- **Extras**: droplets/bokeh count, smoke position and tint, glass reflection streak angle.
- **Variation**: are panels identical or each different?
Keep the breakdown in the reply to yourself and score every attempt against it line by line.

## 2. Generate (Higgsfield)
- Model: `gpt_image_2_5`, quality high, resolution 2k, aspect matched to the reference (tall crop → 9:16). Use `flux_3_image` only as a second opinion; it tends to tilt and repeat panels.
- Prompt = the breakdown in plain physical terms, with numbers ("covers about a quarter of each panel", "only two or three tiny blurs"). Say what NOT to do ("panels are not identical", "no text").
- Iterate from the best attempt: pass its job id as `image_references` (role `image_references`) plus a correction prompt that names only the deltas.
- Banned colour rule: the owner bans gold. If a reference is gold, make the exact gold replica (it's their reference) AND a platinum/neutral twin, and say which is which.
- Batch both versions in one `generate_image_batch`; wait with `jobs_wait` using `jobs:[{index, job_id}]`.

## 3. Bring results back and compare
Local network can't reach the CDN. In `sandbox_exec`: curl the result_url, downsize with PIL to ≤620px wide JPEG q84, return via `image_paths` (≤512 KB each). Files land in the session tool-results folder; copy them into the working tree.
Build a **compare sheet** (reference | gold | platinum, same height, labelled) with PIL and look at it. Fix any line of the breakdown that is off before showing the owner.

## 4. Raindrop glass (GLS-02)
Look: clear, see-through glass with **circular** water droplets that act as tiny lenses: each drop magnifies and flips the background, bright specular dot top-left, thin dark rim, soft caustic crescent bottom-right, slight chromatic edge. Mix of sizes (a few 18–40px, many 3–10px), a few running trails, no cartoon outlines.
- **Still/backplate**: Higgsfield macro of droplets on dark glass over the page's own palette (onyx, smoke, the page accent as a faint bokeh).
- **Live web build**: a glass pane (`backdrop-filter: blur(10–14px) saturate(160%)`) plus droplets as real lenses: SVG `feImage` displacement map (radial normal map) driving `feDisplacementMap` on a `backdrop-filter:url(#drop)` where supported (Chromium); fallback = each drop is a circle with `backdrop-filter: blur(0) saturate(1.4) brightness(1.15)`, an inner radial highlight and rim shadow. Drops slide slowly (rAF, transform only) and the pointer wipes them away; reduced motion → static drops.
- Catalogue code: GLS-02 · Raindrop Glass. GLS-01 · Liquid Metal Glass is the chrome-rim panel look.

## 5. Show it (SHOW, DON'T BURY)
Send the compare sheet with SendUserFile (`display: render`) and a published artifact link when it's a live build. Never end that message with a question dialog: ask in plain text, then use AskUserQuestion in a later turn if a choice is needed.

## Checklist before sending
- [ ] Reference viewed with Read, breakdown written
- [ ] Each attempt scored against the breakdown; deltas fixed
- [ ] Gold replica + platinum twin (when reference is gold)
- [ ] Compare sheet viewed by me first
- [ ] Live builds verified in Chromium at 1280 and 390, reduced motion checked
