---
name: apex-build-contract
description: Load FIRST, before any other skill, whenever Maverick asks to build, make, design, mock up or restyle anything he will look at — a site, page, app screen, console, dashboard, deck, tool or demo. Establishes what is being built and what it is not, before a single line is written. Use even for a throwaway mockup, and even when another skill seems more specific.
---

# Build contract

Two failures keep repeating and this skill exists to stop both. Run it before
`apex-site-build`, before `cinematic-scroll`, before any file is written.

## The two failures

1. **Inventing a name.** "Apex War Room" is a *styling convention* — a look other
   builds follow. It was turned into a product name. Brands, product names and
   working titles are his to set. You never coin one.
2. **Building the wrong artifact.** A landing page was built for a CRM. A hero
   headline and a big number is what goes *in front of* a product; it is not the
   product. Generic marketing pages are the most generic thing that exists, which
   is exactly why they read as AI slop.

## Step 1 — read the brief, do not reconstruct it

If the work lives in a repo, read `PROJECT.md` at its root before anything else.
It names the product, what it explicitly is not, the current phase and the next
gate. If there is no `PROJECT.md`, say so and write one from his answers as the
first act of the build.

Never infer the product name from a style guide, a repo name, a Supabase project,
a folder, or an earlier session's guess. If the name is not written down, it does
not exist yet — ask.

## Step 2 — state the contract in two lines, before writing anything

```
Building: <one line — the exact screen or page, and who uses it>
Not building: <the nearest wrong thing you were about to build>
Artifact type: app screen | internal tool | landing page | document | deck | demo
```

"Not building" is the load-bearing line. Fill it with the thing that would be
easy and generic: the hero section, the pricing grid, the feature trio. If you
cannot name what you are not building, you do not understand the request.

## Step 3 — confirm the artifact type

These are different jobs and must not be confused:

- **app screen** — real data, real controls, dense. A user operates it daily.
  Opens showing actual records, never an empty shell or a headline.
- **internal tool** — his own use. Function over polish, still on-brand.
- **landing page** — persuades a stranger. Only build this when he asks for a
  page that *sells* something.
- **document / deck** — read, not operated.
- **demo** — throwaway, explicitly disposable, say so and do not persist it.

When the request could be two of these, ask which. One multiple-choice question
costs thirty seconds; the wrong artifact costs the session.

## Step 4 — only now, load the craft skills

In this order, before the first line of CSS:

1. `apex-site-build` — the skill stack and War Room material rules.
2. `apex-loader` — the entry sequence. Every site he ships has one.
3. `cinematic-scroll` — use the kit, never hand-roll scroll logic.

## Non-negotiables carried into every build

- Dark canvas. Cyan does the work; chrome gold is a ramp on two things per view,
  never a flat fill. **Yellow and flat gold are banned outright.**
- No pill buttons. Corner radii at or under 3px.
- Semantic HTML — `button`, `nav`, `main`. Keyboard reachable, visible focus,
  WCAG AA contrast, meaningful `alt`.
- Verify in a real browser before showing him: render at 1180 and 390, check for
  horizontal overflow, equal grid boxes and zero page errors, then look at the
  screenshot yourself. Never present a page you have not seen.

## When he is angry about quality

Do not rebuild from scratch and do not restyle anything he already approved.
Name the specific defects, fix only those, and prove by diff that nothing else
moved — that is `surgical-refinement`, and it applies the moment a design has
been signed off.
