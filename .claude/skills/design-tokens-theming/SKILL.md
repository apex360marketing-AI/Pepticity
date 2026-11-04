---
name: design-tokens-theming
description: Build and check the APEX colour and theme system — the `--apx-*` token contract, W3C DTCG 2025.10 token files, OKLCH palettes (ramps, tinted neutrals, glow accents), palettes generated from a client logo, dark/light themes, and automatic contrast plus banned-colour checks. Use whenever a page, artifact module or generated client site needs colours, a palette, a theme, a recolour, "make it match my logo", dark/light mode, or a contrast fix.
---

# Design tokens and theming

Every APEX page and artifact is recoloured by tokens, never by editing literals. The instant site generator depends on it: one token set in, a fully branded site out.

## 1. The token contract (keep these names; never rename)
Tier 1, the **semantic** tokens every module already reads (from `design/library/*/notes.md`):
```
--apx-bg  --apx-surface  --apx-ink  --apx-muted  --apx-line
--apx-accent  --apx-accent-ink  --apx-radius
--apx-font-display  --apx-font-text  --apx-motion (0 = still, 1 = normal)
```
- Tier 0, **primitives** (`--apx-p-accent-50…950`, `--apx-p-neutral-0…1000`), which are ramps only semantic tokens may reference.
- Tier 2, **component** tokens (`--apx-<code>-*`, e.g. `--apx-scr102-dim`), which default to semantic tokens: `var(--apx-scr102-dim, var(--apx-muted))`.
- New shared tokens are added, never repurposed. Motion tokens live in `motion-design-system`; space and type scale tokens live in `layout-composition`.
- After changing tokens at runtime, dispatch `apx:tokens` on the element or `window` (the existing module contract).

## 2. Source of truth: DTCG 2025.10 JSON
The W3C Design Tokens Community Group format reached its first stable version (2025.10). It supports OKLCH colours and aliases. Store one file per theme at `design/tokens/<theme>.tokens.json`:
```json
{ "apx": {
  "p": { "accent": { "500": { "$type": "color",
        "$value": { "colorSpace": "oklch", "components": [0.517, 0.112, 15.9], "hex": "#9e4a52" } } } },
  "accent": { "$type": "color", "$value": "{apx.p.accent.500}" },
  "radius": { "$type": "dimension", "$value": { "value": 14, "unit": "px" } } } }
```
Build with `npx style-dictionary@5.6.0 build` (it reads DTCG natively) to produce `tokens.css` (`:root{--apx-…}`) and `tokens.json` for the generator. Inside an Artifact, inline the generated CSS.

## 3. OKLCH palette rules
Write colours as `oklch(L C H)` in CSS. OKLCH is supported in every current browser and gives even lightness steps across hues.
- **Neutrals:** hold H at the brand hue, keep C ≤ 0.02 (just a faint tint), and step L. Dark grounds sit at L 0.12–0.20, which gives the near-black with a faint tint the owner likes.
- **Accent ramp:** hold H, step L 0.97 → 0.25, lower C toward both ends, then gamut-fit (code below).
- **Glow accent:** use one high-chroma colour (C 0.15–0.22), only for glows, rims, focus rings, tracker lines and dollar values. It should cover less than 5% of the pixels.
- **Text:** `--apx-ink` sits at L ≥ 0.90 on dark grounds and L ≤ 0.25 on light grounds. `--apx-muted` must still pass 4.5:1.
- **Theme pairs:** dark and light are separate token sets for the same design. They are never presented as two "options" (CLAUDE.md).

**Banned zones**, checked automatically (measured OKLCH values of the colours the owner rejected):

| Zone | Rule | Examples |
|---|---|---|
| Gold, amber, mustard, champagne, yellow | H 65–105 and C ≥ 0.04 | #c9a96a = (0.75, 0.09, 83.5); #e6cf9c = (0.86, 0.07, 86.5) |
| Green, mint, lime | H 105–175 and C ≥ 0.04 | #22c55e H 150; #00ffc2 H 168 |

Allowed exceptions: `#d4ff3a` neon chartreuse (H 122), used as a sparing accent only; and the Field Guide light page (white, deep forest green, warm brown, small pumpkin accent). Bone (C 0.017) and pumpkin (H 47–56) fall outside both zones and are fine.

## 4. Inline colour kit (zero dependencies; tested)
```js
const lin=c=>(c/=255)<=.04045?c/12.92:((c+.055)/1.055)**2.4, gam=c=>255*(c<=.0031308?12.92*c:1.055*c**(1/2.4)-.055);
function hexToOklch(h){const[r,g,b]=[1,3,5].map(i=>lin(parseInt(h.slice(i,i+2),16)));
  const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  const A=1.9779984951*l-2.428592205*m+.4505937099*s,B=.0259040371*l+.7827717662*m-.808675766*s;
  return{L:.2104542553*l+.793617785*m-.0040720468*s,C:Math.hypot(A,B),H:(Math.atan2(B,A)*180/Math.PI+360)%360};}
function oklchToLin({L,C,H}){const a=C*Math.cos(H*Math.PI/180),b=C*Math.sin(H*Math.PI/180);
  const l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.291485548*b)**3;
  return[4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s];}
const inGamut=v=>v.every(x=>x>=-1e-4&&x<=1.0001);
function fit(c){c={...c};while(!inGamut(oklchToLin(c))&&c.C>0)c.C-=.002;return c;}       // keep L and H, reduce chroma
const toHex=c=>'#'+oklchToLin(fit(c)).map(v=>Math.round(gam(Math.min(1,Math.max(0,v)))).toString(16).padStart(2,'0')).join('');
const Y=c=>{const v=oklchToLin(fit(c)).map(x=>Math.min(1,Math.max(0,x)));return .2126*v[0]+.7152*v[1]+.0722*v[2];};
const contrast=(a,b)=>{const[x,y]=[a,b].map(c=>Y(typeof c=='string'?hexToOklch(c):c)).sort((p,q)=>q-p);return(x+.05)/(y+.05);};
const ramp=(H,Cmax)=>[.97,.92,.85,.75,.65,.56,.48,.40,.32,.25].map(L=>toHex({L,H,C:Cmax*(1-Math.abs(L-.6)*1.1)}));
function banned(hex,{fieldGuide=false}={}){if(hex.toLowerCase()==='#d4ff3a')return false;const{C,H}=hexToOklch(hex);
  return(C>=.04&&H>=65&&H<=105)||(!fieldGuide&&C>=.04&&H>105&&H<=175);}
```

## 5. Palette from a client logo (instant site, taste test)
1. Draw the logo onto a 64×64 canvas, read the pixels, and skip transparent ones (alpha < 128) as well as near-white and near-black ones (L > 0.95 or L < 0.08).
2. Convert to OKLab and run k-means (k = 5, 8 iterations). Rank the clusters by pixel count × chroma.
3. The top chromatic cluster becomes the accent hue. Build the neutrals from that hue at C 0.012, the ramp with `ramp(H, C)`, and set `--apx-accent-ink` to whichever of the ink or bg colours contrasts better with the accent.
4. **If the logo colour falls in a banned zone** (for example a gold logo), never ship it silently. Ask the owner as multiple choice: platinum/bone variant (Recommended), use the client's colour on their own site only, or nearest allowed hue.
5. Show the result on ONE sample section first (sample-first rule), then apply it to the rest.

## 6. CSS theme skeleton (Artifact contract)
```css
:root{--apx-bg:oklch(.97 .006 30);--apx-ink:oklch(.22 .01 30);/* …light defaults… */}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--apx-bg:oklch(.15 .012 30);--apx-ink:oklch(.93 .008 30);}}
:root[data-theme="dark"]{--apx-bg:oklch(.15 .012 30);--apx-ink:oklch(.93 .008 30);}
body{background:var(--apx-bg);color:var(--apx-ink)}
```
Mixing: `color-mix(in oklch, var(--apx-accent) 18%, transparent)` for glows and tints. Relative colour syntax (`oklch(from var(--apx-accent) calc(l + .1) c h)`) needs an `@supports` guard.

## Do / don't
- DO keep every colour in tokens; a grep for `#[0-9a-f]{3,8}` outside the token block should find only SVG assets with fallbacks.
- DO check contrast against the busiest pixels behind glass, not against the token background.
- DON'T use big areas of saturated colour; glow comes from small high-chroma accents on dark near-neutral grounds.
- DON'T present APCA as compliance. WCAG 2.2 AA ratios (4.5:1 text, 3:1 large text and UI) are the rule; APCA Lc ≥ 60 is advisory.
- DON'T forget SVG `fill=` / `stop-color=` attributes and shader `vec3` uniforms; they hide colours from CSS sweeps.

## Verify (Playwright, `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`)
- Walk every visible element and read `getComputedStyle` color, background-color, border-color and box-shadow. Convert each to hex (draw it on a 1×1 canvas and read back the pixel) and run `banned()`: zero hits allowed.
- Text contrast for every text node is ≥ 4.5:1 (≥ 3:1 for large text); quality-gate's axe pass must agree.
- Toggle `data-theme` light and dark and set `colorScheme` in the context: both render, with no unstyled flash.
- Recolour test: swap `--apx-accent` at runtime and dispatch `apx:tokens`; every module updates, nothing stays the old colour.
