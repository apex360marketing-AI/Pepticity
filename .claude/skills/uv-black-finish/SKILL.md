---
name: uv-black-finish
description: Make the owner's UV BLACK finish for PEPTICITY - a deep, glossier black with a faint ultraviolet/violet sheen that only shows at grazing angles, like black-light-lit lacquer or anodised titanium. Use whenever the owner says UV, UV black, ultraviolet, black-light, "shinier black", or pairs matte with UV. Pairs with matte-finish.
---

# UV black finish

UV black is the "second black" next to matte: deeper and glossier, with a whisper of ultraviolet that lives in the reflections and grazing edges, never in the body. Think wet black lacquer under a black-light, or titanium with a thin oxide film. The violet is a sheen, not a paint.

## What it looks like (check against this)
- Body: #0a0910 to #0e0c14 (black with a hair of violet). Never purple, never navy.
- Reflections: crisp but dimmed (clearcoat), showing the studio strips as dark-grey bars.
- At grazing angles only: a thin violet-indigo film (#4b3b86 to #6F00FF at very low strength). Face-on it is black.
- Next to matte black it must read as a clearly different, richer black: that contrast IS the look.
- Accent colour (blue / chartreuse / purple) is light, not material: it comes from emissive edges or lights, never from tinting the UV black.

## three.js recipe (r160, MeshPhysicalMaterial)
- color 0x0c0a12, metalness 0.5, roughness 0.22-0.3
- clearcoat 1, clearcoatRoughness 0.06-0.12, envMapIntensity 0.8-1.0
- sheen 1, sheenRoughness 0.3, sheenColor 0x2a2250 (subtle violet at grazing)
- optional iridescence 0.15-0.3, iridescenceIOR 1.3, iridescenceThicknessRange [180, 320] for the thin-film shimmer (keep low; high = oil slick, banned)
- needs scene.environment with bright strips so the clearcoat has something to reflect

## Higgsfield prompt words
"deep UV-black lacquer, glossier than the matte frame, a faint ultraviolet sheen visible only at grazing angles, like anodised titanium under black-light, black face-on, never purple"
Pair with: "matte black frame" so the two blacks contrast.

## Fail if
- it reads purple or blue face-on
- it looks the same as the matte parts
- rainbow/oil-slick colours appear
- the accent colour tints the body instead of glowing on edges
