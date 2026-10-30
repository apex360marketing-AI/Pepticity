---
name: exploded-layers-3d
description: Build a "Frame by Frame" exploded-layers scene and a "Descent" camera-dive intro for a three.js hero product (vial, bottle, device, jar). The product pulls apart into labelled layers as the visitor scrolls a pinned section, with DOM tags that track each 3D part, and the intro camera dives down onto the product. Use whenever a product page needs an anatomy / "what's inside" / exploded view, labelled 3D parts, or a dive-in intro.
---

# Exploded layers + camera dive (three.js)

Two owner favourites, packaged for any hero product:
- **Frame by Frame (ANA-01 · Exploded Anatomy):** scroll a pinned section and the product separates into its parts along one axis, each part named by a DOM tag drawn to its 3D anchor.
- **The Descent (INT-04 · Camera Dive):** the intro starts high above the product looking down, then the camera dives and levels out in front of it, with dust streaking past.

## 1. Build the product as part groups

Group meshes by the layer you want to name. Never add parts straight to the spin group if they must move apart.

```js
const spin = new THREE.Group();            // turns with idle/pointer/scroll
const capG = new THREE.Group(), labelG = new THREE.Group(), liqG = new THREE.Group(), glassG = new THREE.Group();
spin.add(glassG, liqG, labelG, capG);
```

Each part gets a rest offset (0) and an exploded offset. Keep the explode on ONE axis (y for upright products) plus a small sideways fan so tags never overlap:

```js
const PARTS = [
  { g: capG,   dy:  1.25, dx: 0,     anchor: new THREE.Vector3(0.5, H/2+0.3, 0), id: 'seal'  },
  { g: labelG, dy:  0.35, dx: 0,     dz: 0.55, anchor: ..., id: 'label' },
  { g: liqG,   dy: -0.95, dx: 0,     anchor: ..., id: 'liquid' },
  { g: glassG, dy:  0,    dx: 0,     anchor: ..., id: 'glass' },
];
```

## 2. Drive it from one number

`S.explode` (0..1) is written by a GSAP ScrollTrigger on the pinned section; the render loop smooths it and applies an ease with a per-part stagger so the parts leave one after another, not as a block:

```js
exS += (S.explode - exS) * 0.08;
PARTS.forEach((p, i) => {
  const k = easeInOut(clamp01(exS * 1.6 - i * 0.18));
  p.g.position.set((p.dx||0)*k, p.dy*k, (p.dz||0)*k);
});
```

While exploded: stop the idle spin, turn the product to a fixed three-quarter angle, and move it to the centre of the frame (the section's copy sits beside it).

## 3. Tags that follow the 3D parts

Project each anchor to the screen every frame and write `transform` on the DOM tag (never `top/left`). Hide tags when `exS < .25`.

```js
v.copy(p.anchor).applyMatrix4(p.g.matrixWorld).project(cam);
tag.style.transform = `translate3d(${(v.x*.5+.5)*innerWidth}px, ${(-v.y*.5+.5)*innerHeight}px, 0)`;
```

Tag markup: a hairline leader + a mono label + one short sentence. Tags are `aria-hidden` decoration; the same content must exist as a real list in the section for screen readers and phones.

## 4. Camera dive intro

Animate one value `S.intro` 0..1 (GSAP timeline, 4–5s, `power2.inOut`). In the loop:

```js
const d = easeOutCubic(intro);
cam.position.set(0, lerp(11, 0.2, d), lerp(3.5, 9, d));
cam.lookAt(vial.position.x * d, vial.position.y, 0);   // look down at it, then level out
dust.position.y = (1 - d) * 6;                          // motes streak up past the lens
```

Fade exposure in from 0.15 during the first 40% so it reads as falling out of the dark.

## 5. Rules

- Desktop only for the pin (`gsap.matchMedia('(min-width: 901px)')`). On phones show the same anatomy as a stacked list with the 3D product exploded to a fixed 0.6 as you pass the section — no pin.
- Reduced motion: no dive (start level), explode jumps to 0.6 when the section is in view.
- Keep part count 3–5. More than five tags reads as a parts catalogue, not a story.
- Copy is factual and neutral (what the part is and why it is checked). No health claims.
- Verify in a real browser at 1440 and 390: screenshot rest, mid and fully exploded, and check tags line up with their parts.
