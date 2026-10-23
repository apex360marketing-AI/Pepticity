---
name: web-video-pipeline
description: Turn AI-generated video (Higgsfield clips) into lightweight web intro plates. Covers prompting for loop-free 6–9 s plates, ffmpeg AV1 / VP9 / H.264 renditions with mobile crops, poster and last-frame stills, size targets (< 3 MB mobile), `autoplay muted playsinline` markup, codec and network-aware source selection, canplay timeouts with canvas fallbacks, and the owner's rule that video appears ONLY in the intro. Use when asked to "add the intro film", "compress this video", "make the Higgsfield clip web-ready", "video background", "hero video", "encode AV1/WebM", "poster frame", "the video won't autoplay on iPhone", or when any .mp4/.mov lands in media/.
---

# Web video pipeline (AI film → intro plate)

## The owner's rule
**Video only in the intro.** One clip (`media/intro.mp4` plus its renditions) used as a background plate during the 7–9 s entrance. No hero loops, no section videos, no autoplay reels or testimonial videos anywhere else. If a request asks for video elsewhere, propose a canvas, scroll-scrubbed still sequence or CSS treatment instead and tell the user why.

The intro must look finished without the video (BRIEF.md). The video adds texture, and the canvas carries the scene.

## 1. Generating the clip (confirm first)
Higgsfield generation spends the user's credits. **Before calling any Higgsfield generate tool, stop and confirm** the model, duration, count and credit quote (use its quote/explore step first). Never batch-generate variants without approval.
Prompt for a plate, not a story:
- 6–9 s, 16:9 at 1080p or higher, one slow continuous camera move (push-in, orbit ≤ 30°), no cuts.
- No text, logos, faces or hands in close-up, which AI renders badly and which raise compliance risk.
- No syringes, injections or vials being drawn (compliance). Allowed: lab glass, crystal, liquid, light, macro textures.
- Dark, low-detail edges (they will be masked and overlaid), and subject centred in the middle 56% so a 9:16 mobile crop keeps it.
- Palette within the template's tokens. Never gold, amber or champagne (house rule).

## 2. Renditions (ffmpeg; all commands tested on ffmpeg with libsvtav1 / libvpx-vp9 / libx264)
Strip audio everywhere (`-an`). An intro never has sound. 24 fps is enough for a plate.
```bash
IN=media/raw/intro-src.mp4; OUT=media
# Desktop AV1 (best compression; Chrome, Firefox, Safari 17+ on hardware with AV1 decode)
ffmpeg -y -i $IN -an -vf "scale=-2:1080:flags=lanczos,fps=24,format=yuv420p" \
  -c:v libsvtav1 -preset 6 -crf 38 -g 96 -svtav1-params tune=0 -movflags +faststart $OUT/intro-1080.av1.mp4
# Desktop VP9 (fallback for older Chromium/Firefox)
ffmpeg -y -i $IN -an -vf "scale=-2:1080:flags=lanczos,fps=24" \
  -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -deadline good -cpu-used 2 -pix_fmt yuv420p $OUT/intro-1080.vp9.webm
# Desktop H.264 (universal fallback)
ffmpeg -y -i $IN -an -vf "scale=-2:1080:flags=lanczos,fps=24" \
  -c:v libx264 -preset slow -crf 26 -profile:v high -level 4.0 -pix_fmt yuv420p -movflags +faststart $OUT/intro-1080.h264.mp4
# Mobile portrait crop 9:16 at 720 wide (AV1 + H.264); adjust crop x if the subject is off-centre
ffmpeg -y -i $IN -an -vf "crop=ih*9/16:ih,scale=720:-2:flags=lanczos,fps=24,format=yuv420p" \
  -c:v libsvtav1 -preset 6 -crf 40 -g 96 -movflags +faststart $OUT/intro-720p.av1.mp4
ffmpeg -y -i $IN -an -vf "crop=ih*9/16:ih,scale=720:-2:flags=lanczos,fps=24" \
  -c:v libx264 -preset slow -crf 27 -profile:v high -level 4.0 -pix_fmt yuv420p -movflags +faststart $OUT/intro-720p.h264.mp4
# Stills: first frame = poster (seamless swap), last frame = handoff still
ffmpeg -y -i $IN -frames:v 1 -vf "scale=-2:1080" -c:v libaom-av1 -still-picture 1 -crf 32 $OUT/intro-poster.avif
ffmpeg -y -i $IN -frames:v 1 -vf "scale=-2:1080" -q:v 4 $OUT/intro-poster.jpg
ffmpeg -y -sseof -0.05 -i $IN -frames:v 1 -q:v 4 $OUT/intro-last.jpg
# Check every output
for f in $OUT/intro-*; do ffprobe -v error -show_entries format=size,duration:stream=codec_name,width,height,pix_fmt -of compact "$f"; done
```
Keep `media/intro.mp4` as the H.264 1080 file, because BRIEF.md references that path and it must keep working.

## 3. Size targets (8 s clip)
| Rendition | Target | If over |
|---|---|---|
| Mobile AV1 720×1280 | ≤ 1.5 MB | CRF +3 |
| Mobile H.264 720×1280 | **< 3 MB (hard)** | CRF +2, or drop to 600 wide |
| Desktop AV1 1080p | ≤ 3 MB | CRF +3, or `-vf …,hqdn3d=2:1:3:3` to denoise AI grain first |
| Desktop VP9 / H.264 1080p | ≤ 6 MB | CRF +2 |
| Poster AVIF / JPG | ≤ 60 KB / ≤ 120 KB | lower quality: the plate sits under overlays |
AI clips carry heavy grain that wastes bits. Denoise (`hqdn3d`) before CRF hacks, and add grain back with a CSS/canvas noise overlay at 3–5% opacity.

## 4. Markup and selection
```html
<video class="intro-plate" muted playsinline preload="none" disablepictureinpicture disableremoteplayback
       aria-hidden="true" tabindex="-1" poster="media/intro-poster.jpg"></video>
```
```js
const v = document.querySelector('.intro-plate');
const conn = navigator.connection || {};
const skipVideo = matchMedia('(prefers-reduced-motion: reduce)').matches || conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '')
               || matchMedia('(prefers-reduced-data: reduce)').matches;
if (!skipVideo) {
  const mobile = matchMedia('(max-width: 700px) and (orientation: portrait)').matches;
  const av1 = v.canPlayType('video/mp4; codecs="av01.0.08M.08"') === 'probably';
  const vp9 = v.canPlayType('video/webm; codecs="vp9"');
  v.src = mobile ? (av1 ? 'media/intro-720p.av1.mp4' : 'media/intro-720p.h264.mp4')
                 : (av1 ? 'media/intro-1080.av1.mp4' : vp9 ? 'media/intro-1080.vp9.webm' : 'media/intro.mp4');
  let ok = false;
  v.addEventListener('canplay', () => { ok = true; v.play()?.catch(() => { ok = false; }); }, { once: true });
  v.addEventListener('error', () => { ok = false; v.remove(); }, { once: true });
  setTimeout(() => { if (!ok) { v.removeAttribute('src'); v.load(); v.remove(); } }, 1200);  // don't wait: canvas carries it
}
```
- Choose in JS rather than with `<source media>`, so you choose once and before any download. Set `src` after first paint, never in the HTML, or the video's first frame can become the LCP element.
- `muted` + `playsinline` are required for iOS autoplay. Also set `v.muted = true` in JS (React and some builds drop the attribute). Low Power Mode on iOS blocks autoplay entirely, and the `play()` rejection must fall back silently.
- The plate fades in only after `canplay` (`opacity` 0 → target over 600 ms), so there is never a black box or a broken-video icon.
- Never `loop`. The intro ends and the video element is removed with `#intro`. Use `v.pause(); v.removeAttribute('src'); v.load()` before removal to free the decoder.
- No controls, captions or audio are needed, because the plate is decorative (`aria-hidden`). If a clip ever carries meaning, it is no longer a plate and needs captions and a text alternative.

## 5. Single-file artifacts
The media is not inlined: the 16 MB page limit and the CSP make base64 video a bad idea. Upload the renditions to the artifact's asset store (needs the `assets` capability, so load `artifact-capabilities`). That is a publish step, so confirm with the user first. Then reference the returned URLs exactly. Until then, the canvas-only intro must stand alone.

## Verify
- Run `ffprobe` on every rendition: no audio stream, expected codec, sizes within targets. Paste the table.
- Grep the built HTML for `<video`: exactly one, inside `#intro`. Grep for `autoplay` with `loop`: zero.
- Playwright with `media/` emptied: no broken-video UI, and the intro screenshots still look finished.
- Playwright with media present: the video `src` is not requested before first paint (check request timestamps against FCP), and the plate is visible at t = 2 s.
- Mobile context (390×844, `isMobile`): the 720p portrait rendition is requested, not the 1080p one.
- Save-Data emulation (`page.route` with a `Save-Data: on` header or a stubbed `navigator.connection`): zero video requests.
