#!/bin/bash
# PreToolUse on Write: blocks creating a brand-new page under sites/ from nothing.
# New pages must start as a COPY of the approved build (cp -r sites/main/v5 ...), then be edited.
# To allow a genuinely new file the owner asked for, add its path to .claude/hooks/allow-new-pages.txt
input=$(cat)
path=$(printf '%s' "$input" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("tool_input",{}).get("file_path",""))' 2>/dev/null)
case "$path" in
  */sites/*.html|*/sites/*.css|*/sites/*.js) ;;
  *) exit 0 ;;
esac
[ -e "$path" ] && exit 0
grep -qxF "$path" "${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/allow-new-pages.txt" 2>/dev/null && exit 0
echo "BLOCKED by protect-the-work: '$path' would be a brand-new page/style/script written from nothing. Copy the approved build (sites/main/v5) and edit the copy instead. If the owner asked for this exact new file, add the path to .claude/hooks/allow-new-pages.txt first." >&2
exit 2
