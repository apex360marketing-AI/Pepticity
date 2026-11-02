#!/bin/sh
# Resolves sites/versions into a self-contained folder for gh-pages /versions/ (shared assets ONCE in _common).
# Usage: sh tools/make-versions-publish.sh /tmp/versions-publish
set -e
OUT=${1:-/tmp/versions-publish}; R=$(cd "$(dirname "$0")/.." && pwd); V=$R/sites/versions
rm -rf "$OUT"; mkdir -p "$OUT/_common"
cp -r "$V/_kit" "$V/thumbs" "$V/index.html" "$OUT/" 2>/dev/null || true
for d in "$V"/[0-9]-*/; do n=$(basename "$d"); mkdir -p "$OUT/$n"; cp -r "$d". "$OUT/$n/"; find "$OUT/$n" \( -name demo.html -o -name notes.md \) -delete; done
C=$OUT/_common; S=$V/_common
mkdir -p $C/brand/font $C/brand/logo $C/brand/ui $C/brand/src/dash $C/vendor $C/data $C/assets $C/shared/bot
cp -L $S/brand/font/PepticityBlack.woff2 $S/brand/font/glyphs.json $S/brand/font/type3d-engine.js $C/brand/font/
cp -L $S/brand/logo/p-mark.svg $S/brand/logo/emblem.svg $C/brand/logo/
cp -L $S/brand/ui/button.css $S/brand/ui/button.js $S/brand/ui/smoke-bg.js $C/brand/ui/
cp -L $S/brand/src/dash/_blank.webp $C/brand/src/dash/
cp -L $S/vendor/gsap.min.js $S/vendor/ScrollTrigger.min.js $S/vendor/lenis.min.js $C/vendor/
cp -L $S/data/products.json $C/data/; cp -L $S/assets/*.webp $C/assets/
[ -f $S/shared/bot/pep-bot.css ] && cp -L $S/shared/bot/pep-bot.css $C/shared/bot/ || true
# LEAN (gh-pages is near its 1 GB limit): the big shared media (films, doors, lab, city, frame atlases) already lives on the public branch at /Pepticity/site-v4/media/.
# Point every version at it instead of copying 156 MB again.
grep -rlE "_common/media/" "$OUT"/[0-9]*-* "$OUT"/index.html 2>/dev/null | while read f; do sed -i 's#\.\./_common/media/#/Pepticity/site-v4/media/#g; s#_common/media/#/Pepticity/site-v4/media/#g' "$f"; done
du -sh "$OUT"; find "$OUT" -type f | wc -l
