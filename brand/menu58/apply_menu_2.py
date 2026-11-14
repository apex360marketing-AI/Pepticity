"""Nov 14 follow-ups to the menu-58 header (exact string edits, applied to the built page and to new_header.css)."""
import sys
edits = [
 # PEPTIDES sits where render 58 has it on the crystal (5 px lower)
 (".pep-header-kwrap--hero { left: 42.44%; width: 20.95%; top: 27.5%; height: 63.8%; }",
  ".pep-header-kwrap--hero { left: 42.44%; width: 20.95%; top: 30.4%; height: 63.8%; }"),
 # phone: the whole PEPTICITY name shows, the keys sit beside it, never on it
 ("    --pep-header-h: clamp(54px, 16.4vw, 76px);", "    --pep-header-h: clamp(46px, 15.2vw, 76px);"),
 ("      url(\"assets/menu58/bar-mid.webp\") calc(var(--pep-header-h) * 2.74) top / calc(100% - var(--pep-header-h) * 2.96) 100% no-repeat;",
  "      url(\"assets/menu58/bar-mid.webp\") calc(var(--pep-header-h) * 2.88) top / calc(100% - var(--pep-header-h) * 3.09) 100% no-repeat;"),
 ("justify-content: flex-end; padding-right: calc(var(--pep-header-h) * .36); }", "justify-content: flex-end; padding-right: calc(var(--pep-header-h) * .28); }"),
 ("  .pep-header-brand { left: 0; top: 0; width: calc(var(--pep-header-h) * 2.75); height: 100%; }", "  .pep-header-brand { left: 0; top: 0; width: calc(var(--pep-header-h) * 2.89); height: 100%; }"),
 ("    min-height: 40px;\n    padding: 0 calc(var(--pep-header-h) * .3);", "    min-height: 40px;\n    padding: 0 calc(var(--pep-header-h) * .2);"),
 # phone: the list opens under PEPTIDES, full width, inside the sheet
 ("  .pep-header-drop-glow { display: none; }", "  .pep-header-drop { left: 0; top: auto; }\n  .pep-header-drop-glow { display: none; }"),
]
for path in sys.argv[1:]:
    s = open(path, encoding="utf-8").read()
    for old, new in edits:
        n = s.count(old)
        if n != 1: sys.exit(f"{path}: NOT APPLIED ({n} matches): {old[:80]!r}")
        s = s.replace(old, new)
    open(path, "w", encoding="utf-8").write(s); print("ok", path)
