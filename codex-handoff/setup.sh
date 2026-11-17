#!/bin/sh
# Run once from codex-handoff/: points every script at this folder instead of the old /home/user/work.
ROOT=$(cd "$(dirname "$0")" && pwd)
grep -rl "/home/user/work" "$ROOT/work" "$ROOT/setup.sh" 2>/dev/null | grep -v setup.sh | while read f; do sed -i "s#/home/user/work#$ROOT/work#g" "$f"; done
echo "Paths now point at $ROOT/work. Build: sh work/r3/build_chain.sh ./out work/r3tools/apply_r3.py work/r4/fix/apply_r4.py work/r4/fix/apply_r5.py work/r5/fix/apply_h5.py"
