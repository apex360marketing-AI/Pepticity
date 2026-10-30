# SELECTION STUDIO · how to clone it for a new client

One site where a client tries every live option we have made, picks LOVE / MAYBE / NO on each, crowns one FINAL PICK per chapter, sees it all come together on a live brand board, and sends the result to us by email. PEPTICITY (Grace) is the first build. Everything client-specific lives in `config.json`, the module manifests and the brand files in `assets/`.

## Files

| File | What it is |
|---|---|
| `index.html` | The shell markup: top bar, chapter rail, stage, TRY IT stage, brand board, thank-you letter. No client words except fallbacks. |
| `studio.css` | All shell styles (glass, rail, tiles, board, sheet, print). Accent comes from `--acc` (set at runtime). |
| `studio.js` | Reads `config.json` and the manifests, builds every chapter, runs the live tiles, saves picks, sends the email. |
| `config.json` | **The template.** Client name, logo, accents, email endpoint, chapters. |
| `build.py` | Copies the brand files into `assets/` and makes `data/sets.json`. Run it when a brand file or picture set changes. |
| `assets/` | Brand font, glyph table, 3D type engine, approved button CSS, smoke ground, logo, signature. |
| `data/sets.json` | Picture sets (business cards, labels, bottles). Paths are relative to the picks folder named in `config.sets.base`. |
| `modules/` | Live option modules + `manifest-a.json` / `manifest-b.json` (built by the module agents). |

## Clone for a new client (about 15 minutes)

1. Copy the whole `sites/selection-studio/` folder to `sites/<client>-studio/`.
2. Edit `config.json`:
   - `client`: `name` (in CAPITALS, e.g. `"ACME DENTAL"`), `person` (`"SARAH"`), `email` (her reply-to), `studioName`, `signedBy`, `agency`.
   - `brand`: `logo` (SVG), `font` (woff2), `glyphs` + `type3dEngine` (set `"type3d": false` if the client has no 3D font; headings then use the CSS metal look with `font`), `signature` (thank-you image), `smoke` (moving ground on/off).
   - `accents`: the colour options, `{slug, name, hex, note}`. The first one listed that matches `defaultAccent` is used until she picks. Slugs are sent to every module (`?acc=<slug>` and `postMessage({acc, hex, rgb, name})`), so use slugs the modules know or rely on `hex`.
   - `submit.endpoint`: `https://formsubmit.co/ajax/<your inbox>` (first send from a new inbox needs the FormSubmit confirmation click). `submit.subject` is the email subject. `mode: "local"` keeps answers in the browser only (testing).
   - `storageKey`: make it unique per client (`"acme-studio-sarah"`), so two studios on one domain never share picks.
   - `importPicksKey`: an older picks page whose LOVE / MAYBE / NO should carry over (or remove it).
   - `manifests` + `modulesBase`: which module libraries to load.
   - `sets.src` / `sets.base`: picture sets and the folder(s) their images live in. `base` is a list; the first folder that answers is used (so one config works locally and when published).
   - `review.src`: the review/questions page to embed in YOUR SITE (list, first that answers wins), its `storageKey` and question count. Remove the chapter if the client has no review.
   - `live`: playing cap (desktop/phone), how many previews may stay loaded, how early they load, default virtual width.
   - `chapters`: the order of the rail. Kinds:
     - `start`: welcome, resume, chapter deck.
     - `accents`: one tile per accent; crowning one sets her colour.
     - `modules`: every manifest entry whose `cat` is in `cats`. `expect` = how many "LOADING SOON" tiles show while none exist yet. `vw` = the width the module is drawn at before it is scaled into a tile (small for buttons, wide for backgrounds).
     - `set`: a picture set from `data/sets.json` (`set` = its id, `code` = the prefix on each tile, e.g. `CARD` → `CARD-01`).
     - `review`: embeds `review.src` and keeps its own submit.
     - `finish`: the brand sheet, SAVE AS PDF and SEND.
     - `lead` supports `{n}` (option count; at the start of the sentence it becomes a word: "Fifteen"). `fine` adds a small note under the lead. `group` puts a label above the chapter in the rail.
   - `board.slots`: which crowned picks show on YOUR <CLIENT> and where (`area`: `logo`, `type`, `btn`, `card`, `biz`, `label`, `bottle`, `colour`). `board.chips`: chapters listed as text under the board.
3. Replace the brand files in `assets/` (or point `config.brand` at new ones) and run `python3 sites/<client>-studio/build.py` if you keep the build script (edit its `COPY` list and set source first).
4. Modules: add or remove manifest entries. Each entry: `{code, cat, name, desc, file, interact: scroll|hover|drag|tap, source}`; optional `poster` (a still shown before the live preview loads). Files are resolved relative to the manifest. A file that is missing shows as LOADING SOON with its name, so you can list a module before it is built.
5. Open `index.html?view=owner` to check codes, source paths and COPY PICKS AS JSON. Then run the checks below and publish.

## Module contract (what the shell sends and expects)

- Loaded as `<file>?acc=<slug>&hex=<hex>&in=tile|stage|board&hint=0&chrome=0&bare=1` (the shell shows the code and the interaction hint itself).
- `postMessage({cmd:'play'})` / `({cmd:'pause'})`: only the 4 tiles nearest the middle of the screen (2 on phones) plus the hovered one play; everything else is paused; tiles far away are unloaded. Opening TRY IT or the board pauses every tile.
- `postMessage({acc, hex, rgb, name})` on load and whenever she changes colour.
- Optional reply `{pep:'ready'}` or `{event:'ready'}`: the shell re-sends colour and play state.
- Same-origin iframes (`sandbox="allow-scripts allow-same-origin …"`), so relative fonts and scripts load.

## What gets saved and sent

- `localStorage[storageKey]`: `{p: {CODE: {v: love|maybe|no, n: note}}, crowns: {chapterId: CODE}, acc, last, scroll, email, extra, done}`. Autosaves on every tap; START offers CONTINUE WHERE I LEFT OFF; the URL hash keeps the chapter on reload.
- SEND posts JSON to FormSubmit: `_subject`, `_template: "table"`, `_captcha: "false"`, `_replyto`, one readable field per chapter (`"03 · BUTTONS": "FINAL PICK: … | LOVED (3): … | MAYBE … | NO … | NOTES …"`), `ANYTHING ELSE`, `summary` (plain text) and `selection_json` (everything). If the POST fails, the payload stays in `localStorage[storageKey + "-sent"]` and the thank-you screen offers TRY AGAIN and COPY.
- `window.STUDIO_SUBMIT(payload)` (if a page defines it) replaces FormSubmit.

## Checks before sending a studio to a client

Serve `sites/` as the web root (so `../grace-review/` paths resolve) and run Playwright at 1440×900 and 390×844:
- no page errors; `document.documentElement.scrollWidth` equals the viewport width on every chapter;
- `STUDIO.live().playing <= 4` with more than 4 tiles on screen (2 on phones);
- crown something, reload, the crown is still there (`STUDIO.state.crowns`);
- intercept `https://formsubmit.co/**` and read the POST body before it leaves;
- `reduced_motion: 'reduce'`: no panes, CSS headings, everything still usable;
- touch: tapping a live tile opens TRY IT.

## Publishing (PEPTICITY)

Stage 1 preview goes to `/grace-studio/` on gh-pages; `/grace/` stays live until the owner says GO. The studio reads pictures and the review from `../grace-review/` locally and `../grace/` when published (both listed in `config.json`), so no path edits are needed as long as `/grace/` is published beside it.
