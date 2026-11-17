#!/bin/sh
# Build the release page from the live copy in the fixed order. usage: build_chain.sh OUT_DIR [extra_patch.py ...]
# Extra patches run AFTER the round-2 works fixes and BEFORE the security patch (which re-hashes inline scripts).
set -e
OUT=$1; shift
rm -rf "$OUT"; mkdir -p "$OUT/site"; cp -r /home/user/work/live/new "$OUT/site/new"; F="$OUT/site/new/index.html"
python3 -I /home/user/work/audit5/apply_works.py "$F" "$F" >/dev/null
python3 -I /home/user/work/scroll/apply_scroll.py "$F" "$F" >/dev/null
python3 -I /home/user/work/r2works/apply_works2.py "$F" "$F" >/dev/null
for P in "$@"; do python3 -I "$P" "$F" "$F"; done
python3 -I /home/user/work/r2sec/apply_sec.py "$F" "$F" >/dev/null
echo "built $F ($(wc -c < "$F") bytes)"
