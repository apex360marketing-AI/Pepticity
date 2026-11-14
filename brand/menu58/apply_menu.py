"""Put menu 58 (the real render's pixels) into the store page, and the owner's notes of Nov 14 2026.
usage: apply_menu.py path/to/new/index.html new_header.css
Exact string edits; stops if any string is not found exactly once."""
import sys, re

page, cssfile = sys.argv[1], sys.argv[2]
s = open(page, encoding="utf-8").read()

def one(old, new, what):
    global s
    n = s.count(old)
    if n != 1:
        sys.exit(f"NOT APPLIED ({n} matches): {what}")
    s = s.replace(old, new)

# 1. the header's styles: replaced whole
a = s.find('<style data-pep-src="modules/05-header/header.css">'); b = s.find('</style>', a) + len('</style>')
assert a > 0 and b > a
css = open(cssfile, encoding="utf-8").read().strip()
css = css.replace("  .pep-header-drop { position: static; display: none;", "  .pep-header-drop { position: relative; display: none;").replace("  .pep-header-drop { position: relative; }\n", "")
s = s[:a] + css + s[b:]

# 2. the header's markup
one('''      <span class="pep-header-mark" aria-hidden="true"></span>
      <span class="pep-header-name pep-header-3d" data-text="PEPTICITY" aria-hidden="true"><span class="pep-header-3d-face">PEPTICITY</span></span>
''', '', 'brand: the wordmark is in the picture')
one('<li><span class="pep-header-kwrap"><a class="pep-header-key" href="#shelf" data-key="shop"', '<li><span class="pep-header-kwrap pep-header-kwrap--shop"><a class="pep-header-key" href="#shelf" data-key="shop"', 'shop key')
one('<li><span class="pep-header-kwrap"><a class="pep-header-key" href="#doors" data-key="research"', '<li><span class="pep-header-kwrap pep-header-kwrap--research"><a class="pep-header-key" href="#doors" data-key="research"', 'research key')
one('<li><span class="pep-header-kwrap"><a class="pep-header-key" href="#story" data-key="about"', '<li><span class="pep-header-kwrap pep-header-kwrap--about"><a class="pep-header-key" href="#story" data-key="about"', 'about key')
one('<span class="pep-header-kwrap"><button class="pep-header-key" type="button" data-key="cart"', '<span class="pep-header-kwrap pep-header-kwrap--cart"><button class="pep-header-key" type="button" data-key="cart"', 'cart key')
one('''          <div class="pep-header-drop" id="pep-header-drop" data-drop>
            <div class="pep-header-drop-in">''', '''          <div class="pep-header-drop" id="pep-header-drop" data-drop>
            <div class="pep-header-drop-glow" aria-hidden="true"><i></i></div>
            <div class="pep-header-drop-in">''', 'drop glow')
# the four columns of render 58. Which product stands under which heading: docs/owner/SALES-PLAYBOOK.md section 3
# (RECOVERY, GYM AND PERFORMANCE, 55+ AND LONGEVITY, SKIN AND HAIR). Names only, no claims. HGH is left out of
# PERFORMANCE until counsel rules (playbook). Everything else is one tap away in SEE THE WHOLE LINEUP.
one('''<div class="pep-header-cols" data-cols data-head-peptide="PEPTIDES" data-head-blend="BLENDS" data-head-other="COMPOUNDS"></div>''',
    '''<div class="pep-header-cols" data-cols data-groups='[{"head":"RECOVERY","skus":["bpc-157","tb-500","bpc-157-tb-500-blend","kpv"]},{"head":"PERFORMANCE","skus":["cjc-1295","ipamorelin","tesamorelin","igf-1-lr3"]},{"head":"LONGEVITY","skus":["epitalon","mots-c","ss-31","nad","thymosin-alpha-1"]},{"head":"SKIN","skus":["ghk-cu","bpc-157-tb-500-ghk-cu-blend","glutathione"]}]'></div>''', 'columns')

# 3. the header's behaviour
one('''      var mark = q('.pep-header-mark');''', '''      var mark = q('.pep-header-mark');                 // menu 58 has no separate P: the wordmark is in the bar's picture''', 'mark note')
one('''      ctx.on('cart:changed', function (c) { if (count && c) { count.textContent = String(c.count || 0); } });''',
    '''      ctx.on('cart:changed', function (c) {
        if (!count || !c) { return; }
        count.textContent = String(c.count || 0);
        if (c.count > 0) { cartKey.setAttribute('data-has', ''); } else { cartKey.removeAttribute('data-has'); }    // render 58's CART key is clean while the cart is empty
      });''', 'cart count')
a = s.find("          var by = function (a, b) { return String(a.name).localeCompare"); b = s.find("          groups.forEach(function (g, i) {", a)
assert a > 0 and b > a, 'groups block'
s = s[:a] + '''          // render 58's four columns: the headings and which products stand under each are in header.html (data-groups)
          var bySku = {};
          list.forEach(function (p) { bySku[String(p.sku)] = p; });
          var groups = [];
          try { groups = JSON.parse(cols.getAttribute('data-groups') || '[]'); } catch (e) { groups = []; }
          groups = groups.map(function (g) {
            return { head: String(g.head || ''), items: (g.skus || []).map(function (k) { return bySku[k]; }).filter(Boolean) };
          });
          if (!groups.some(function (g) { return g.items.length; })) { throw new Error('catalogue groups empty'); }
''' + s[b:]

# 4. the ground: plain matte quilt, no light until the pointer is there (owner, Nov 14)
one("window.PEPQuilt.mount(root, { surface: 0.12, variant: 'A' });", "window.PEPQuilt.mount(root, { surface: SURFACE, variant: 'none' });", 'quilt mount')
one("      var started = false;\n      function mount()", "      // Tyson, Nov 14 2026: plain matte black quilt, a watermark (the surface at SURFACE). No blue in the holes and no\n      // breathing: variant 'none'. The holes light ONLY in a circle round the pointer, in the logo blue.\n      var SURFACE = 0.10;\n      var started = false;\n      function mount()", 'quilt note')

open(page, "w", encoding="utf-8").write(s)
print("applied to", page, len(s), "bytes")
