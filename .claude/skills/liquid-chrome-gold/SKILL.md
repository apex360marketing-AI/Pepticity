---
name: liquid-chrome-gold
description: The owner's LIQUID CHROME-GOLD material (the one gold he loves) for CSS, SVG, WebGL shaders and Higgsfield prompts - pale, low-saturation chrome gold with cream-white highlights and bronze-brown shadows, flowing like molten metal. Use for gold trim, gold type, gold rims on glass or hologram screens, the APEX DESK globe and desk, or any time the owner says "the gold in the desk", "chrome gold", "liquid gold", "that gold".
---

# LIQUID CHROME-GOLD

Source of truth: `design/references/liquid-glass/01-gold-chrome-liquid-glass-panels.png` (Read it before building) and the APEX DESK plate `design/references/liquid-glass/03-apex-desk-room-plate.png` ("That is what we're talking about. That's dope." owner, 30 Oct 2026).

All other gold stays banned (CLAUDE.md): never orange, mustard, amber, yellow, rose or flat "faded gold".

## The ramp (sampled, sRGB)
| stop | hex | use |
|---|---|---|
| shadow | `#332814` | deepest folds, under-edges |
| low | `#423524` / `#68513d` | body in shade |
| mid | `#a4845d` | body |
| highlight | `#f0e6c7` | lit ridges |
| hot | `#fef9e8` | specular streaks, tiny areas only |
LAB chroma stays low (a* about 3-5, b* about 11-19). If a sample drifts warmer than `#a4845d` at mid, it's wrong.

## CSS
```
--gold:linear-gradient(100deg,#a4845d 0%,#f0e6c7 18%,#fef9e8 24%,#68513d 40%,#f0e6c7 56%,#332814 70%,#f0e6c7 86%,#a4845d 100%);
.gold-text{background:var(--gold);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:gl 10s ease-in-out infinite;filter:drop-shadow(0 2px 0 rgba(0,0,0,.85))}
@keyframes gl{50%{background-position:100% 0}}
```
Rims: 1px gradient border via `mask-composite` (see the desk room `.rim`). The slow `background-position` drift is what makes it read "liquid".

## GLSL
```
vec3 gold(float k){k=clamp(k,0.,1.);vec3 a=vec3(.20,.157,.078),b=vec3(.41,.32,.24),c=vec3(.643,.518,.365),d=vec3(.941,.902,.78),e=vec3(.996,.976,.91);
 return k<.25?mix(a,b,k/.25):k<.5?mix(b,c,(k-.25)/.25):k<.78?mix(c,d,(k-.5)/.28):mix(d,e,(k-.78)/.22);}
// liquid look: domain-warped noise w -> bands=.5+.5*sin(w*4.2+t*.25)
// body = gold(.1+bands*.55)*(.5+bands*.45); streak = smoothstep(.86,.985,bands) -> gold(.86)*streak*.55
```
Mostly dark bronze body with thin bright streaks reads as liquid chrome. Wide bright areas read as plastic or white. Keep the total under 1.0 per channel (additive layers clip to white and kill the gold).

three.js standard material for solid gold parts: `MeshStandardMaterial({color:'#e9d9b0',metalness:1,roughness:.12-.18})` with an environment map (PMREM from a dark canvas with 3-4 warm-white softbox strips).

## Higgsfield (photo-real gold)
Upload the reference image as `image_references` and say: "polished liquid chrome-gold exactly like the reference image (pale, low-saturation chrome gold with bright cream-white highlights #f0e6c7 and deep bronze-brown shadows #332814, mirror reflections, never orange, never yellow, never rose)". `gpt_image_2_5`, quality high, 2k, 16:9 produced the approved desk plate.

## Check
Sample 10 brightest and 10 mid pixels of the result. Mids must sit near `#a4845d`/`#68513d` and stay warm (R>G>B). If they come out neutral grey, you're clipping or over-lightening.
