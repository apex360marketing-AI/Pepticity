#!/bin/bash
# PEPTICITY startup briefing. Runs at every session start; whatever it prints
# is put in front of Claude before any work. Owner-approved content lives in
# .claude/startup/STARTUP.md. This script only reads files; it changes nothing.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

echo "=================== PEPTICITY STARTUP BRIEFING ==================="
cat .claude/startup/STARTUP.md 2>/dev/null || echo "(STARTUP.md missing: tell the owner)"

echo
echo "## LOCKED ITEMS (docs/owner/LOCKED.md)"
grep '^|' docs/owner/LOCKED.md 2>/dev/null | tail -n +3 || echo "(none)"

echo
echo "## LATEST OWNER ASKS (last 12 lines of docs/owner/REQUEST-LEDGER.md)"
grep '^- R' docs/owner/REQUEST-LEDGER.md 2>/dev/null | tail -12 | cut -c1-400

echo
echo "## ARSENAL CHECK"
found=""
for d in "$CLAUDE_PROJECT_DIR/../apex_agents_bots" /home/user/apex_agents_bots; do
  if [ -f "$d/design/effects.json" ]; then found="$d"; break; fi
done
if [ -n "$found" ]; then
  n=$(ls "$found/design/library" 2>/dev/null | wc -l)
  echo "FOUND: $(cd "$found" && pwd) ($n effect modules in design/library)"
else
  echo "MISSING: apex_agents_bots is not in this session. Tell the owner first (see S3)."
fi
echo "=================================================================="
exit 0
