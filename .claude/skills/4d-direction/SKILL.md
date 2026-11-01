---
name: 4d-direction
description: Use for every PEPTICITY 3D object (hero P, coin, vial, medallion, lens zoom). 4D = real 3D plus time: it reacts to pointer, scroll and idle time. Sets the motion budget, the phone fallback and the 5-frame proof strip.
---
# 4D DIRECTION
3D = real depth, one frozen moment. 4D = the same object reacting to the visitor over time (owner asked to see the difference, 1 Nov).

## Every 3D object must have
- Pointer: leans/turns toward the pointer, eased (lerp 0.06-0.1), max 12 degrees. Never shows its back.
- Scroll: turns or travels a little with scroll, tied to a ScrollTrigger scrub, never faster than the scroll.
- Idle: slow breathing (under 2 degrees, 8-12 s loop) and a light rake that crosses the metal now and then.
- Light: one key, one rim in the accent colour (follows the COLOUR button), environment reflections (PMREM).
- Materials: matte gunmetal faces, UV-black sides, hairline edge light. Never flat colour.

## Budget
- 60 fps on a mid laptop, 30 fps floor on a phone. One WebGL renderer per page where possible.
- Pause rendering when off screen (IntersectionObserver) and when the tab is hidden.
- Phone: lower pixel ratio (max 1.5), fewer lights, no pointer lean (use a gentle gyro-free idle).
- Reduced motion: static pose, no scroll turn.
- Free GPU memory when an object leaves (dispose geometries, materials, textures).

## Proof (mandatory)
Filmstrip of the object at 5 moments (pointer left, right, low, scroll a little, scroll more) like docs/owner/3d-vs-4d.png.
