#!/bin/sh
# Resolves sites/versions into a self-contained folder for gh-pages /versions/ (shared assets ONCE in _common).
# Usage: sh tools/make-versions-publish.sh /tmp/versions-publish
set -e
OUT=${1:-/tmp/versions-publish}; R=$(cd "$(dirname "$0")/.." && pwd); V=$R/sites/versions
rm -rf "$OUT"; mkdir -p "$OUT/_common"
cp -r "$V/_kit" "$V/thumbs" "$V/index.html" "$OUT/" 2>/dev/null || true
for d in "$V"/[0-9]-*/; do n=$(basename "$d"); mkdir -p "$OUT/$n"; cp -r "$d". "$OUT/$n/"; find "$OUT/$n" \( -name demo.html -o -name notes.md \) -delete; done
C=$OUT/_common; S=$V/_common
mkdir -p $C/brand/font $C/brand/logo $C/brand/ui $C/brand/src/dash $C/media/frames-hd $C/vendor $C/data $C/assets $C/shared/bot
cp -L $S/brand/font/PepticityBlack.woff2 $S/brand/font/glyphs.json $S/brand/font/type3d-engine.js $C/brand/font/
cp -L $S/brand/logo/p-mark.svg $S/brand/logo/emblem.svg $C/brand/logo/
cp -L $S/brand/ui/button.css $S/brand/ui/button.js $S/brand/ui/smoke-bg.js $C/brand/ui/
cp -L $S/brand/src/dash/_blank.webp $C/brand/src/dash/
cp -L $S/vendor/gsap.min.js $S/vendor/ScrollTrigger.min.js $S/vendor/lenis.min.js $C/vendor/
cp -L $S/data/products.json $C/data/; cp -L $S/assets/*.webp $C/assets/
for f in chest-white.mp4 chest-black.mp4 chest-white.webm chest-white-poster.jpg chest-black.webm chest-black-poster.jpg white-doors.jpg black-doors.jpg white-lab.jpg black-lab.jpg white-city.jpg black-city.jpg; do [ -f $S/media/$f ] && cp -L $S/media/$f $C/media/; done
cp -L $S/media/frames-hd/manifest.json $S/media/frames-hd/*-weave-*.webp $S/media/frames-hd/*-lab-*.webp $C/media/frames-hd/
[ -f $S/shared/bot/pep-bot.css ] && cp -L $S/shared/bot/pep-bot.css $C/shared/bot/ || true
du -sh "$OUT"; find "$OUT" -type f | wc -l
