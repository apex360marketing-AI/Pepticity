#!/usr/bin/env bash
# Download every Higgsfield asset in manifest.tsv into media/pool (needs d8j0ntlcm91z4.cloudfront.net allowed),
# then convert PNG stills to 1600px JPEG (q82) so pages stay light.
set -u; cd "$(dirname "$0")"
grep -v '^#' manifest.tsv | while IFS=$'\t' read -r name url; do
  [ -s "pool/$name" ] || curl -sSfL -o "pool/$name" "$url" || echo "FAILED $name"
done
python3 - <<'PY'
import pathlib
from PIL import Image
for p in pathlib.Path("pool").glob("*.png"):
    j = p.with_suffix(".jpg")
    if not j.exists():
        im = Image.open(p).convert("RGB"); im.thumbnail((1600, 1600)); im.save(j, quality=82, optimize=True, progressive=True)
PY
ls -la pool
