# SELECTION STUDIO: PLAYBOOK (owner, 30 Oct)

Grace's FINAL selection site. Also the APEX template for every future client.

## What the owner asked (short version)
- One site where Grace sees every option we've made and makes her final picks. She does not get another round.
- Already in it: business cards (20), labels (10), bottles (37), plus review questions beside the site, dashboards and colours.
- Add:
  - 10 cool effects (spinning, scroll-to-spin, horizontal scroll and similar)
  - 15 buttons with hover effects
  - the best glassmorphism cards, including the newest ones (LED colour switch, scroll-lit cards, light streak, glass member card, coin footer)
  - fonts
  - anything else we've built
- Every option must be LIVE, animated and cinematic, so she can try it, not just look at a picture.
- Easy to navigate. Pimp. Works great.
- It's a TEMPLATE: built so we can reuse it for any client.
- The owner reviews the site and the question flow BEFORE it's finished, and can stop or adjust it.
- Answers and picks email back to the owner.

## Recommendations (to make it next level)
1. **Selection Studio, not a form.** Chapters on a left rail: COLOUR · TYPE · BUTTONS · CARDS · EFFECTS · CARDS (BUSINESS) · LABELS · BOTTLES · LOGO · BACKGROUNDS · ENTRANCES · MENUS · REVIEW QUESTIONS.
2. **Live stage.** Each option runs in its own sandboxed live preview. TRY IT opens a full-screen cinematic stage with a short "how to play" hint (scroll / hover / drag / tap).
3. **LOVE / MAYBE / NO plus one FINAL PICK per chapter.** She can love many but must crown one, so we get decisions, not wish lists.
4. **"YOUR PEPTICITY" live board.** As she crowns picks, a side panel assembles her brand: her colour + button + card + font + logo + bottle together, so she sees the combined look.
5. **Her colour everywhere.** The colour she picks re-tints every live demo instantly, so every option shows in HER colour.
6. **Finish = brand sheet.** A one-page summary of her final picks that emails to the owner and she can save as PDF.
7. **Performance.** Only the demos on screen run (lazy iframes, pause when off-screen); reduced-motion fallbacks; works on phone.
8. **Template engine.** One config file (client name, logo, font, accents, which modules show) plus a module library with codes, so a new client's studio takes minutes.
9. **Owner view.** ?view=owner shows codes, the module source, and a "copy picks" button for the build.
10. **Extras worth adding:** loader/entrance options, page-transition styles (panels sliding in from different angles), menu styles, cursor styles, sound on/off, 3D emblem/coin variants, background variants.

## Playbook (stages; owner reviews after Stage 1)
- **STAGE 1. Shell + flow sample**
  - Studio shell: nav rail, chapter pages, pick UI, FINAL PICK, live board, autosave, email.
  - Chapter EFFECTS with the first 10 live effects.
  - The existing review questions placed into the rail.
  - Published to /grace-studio/ (preview; /grace/ stays live until approved).
  - Owner reviews and adjusts the questions and flow.
- **STAGE 2. Library**
  - 15 buttons, about 12 glass cards, the fonts (STUDIO 3D plus sister cuts), logo and emblem options, backgrounds, entrances, page transitions, menus.
  - Every module live, accent-aware, with a code (e.g. BTN-07).
- **STAGE 3. Finish**
  - Brand-sheet summary plus PDF save, email (FormSubmit to apex360marketing@gmail.com), and the thank-you screen with the illuminated signature.
  - QA at 1440 and 390, both looks, reduced motion.
  - Swap /grace/ to the studio when the owner says GO.
- **TEMPLATE**
  - sites/selection-studio/config.json plus modules/<cat>/<CODE>.html with manifest.json.
  - docs explain how to clone it for a new client.

## Module contract (every live option)
- Standalone HTML in modules/<cat>/<CODE>.html. It runs alone or inside an iframe.
- Brand tokens; listens for ?acc=<slug> and postMessage {acc} to re-tint live.
- Plays only when told (postMessage play/pause from the shell); reduced-motion fallback.
- Manifest entry: {code, cat, name, desc, file, interact: scroll|hover|drag|tap, source}.
- Imagery: existing Higgsfield assets only. The motion is code.
