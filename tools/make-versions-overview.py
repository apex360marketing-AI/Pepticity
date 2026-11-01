#!/usr/bin/env python3
"""Overview sheet (all 8 hero + reading shots) + index thumbnails, from docs/owner/versions-sheets/raw/."""
import json, pathlib
from PIL import Image, ImageDraw, ImageFont
R = pathlib.Path(__file__).resolve().parent.parent
RAW = R / "docs/owner/versions-sheets/raw"; V = R / "sites/versions"; TH = V / "thumbs"; TH.mkdir(exist_ok=True)
font = lambda s: ImageFont.truetype(str(R / "brand/font/PepticityBlack.otf"), s)
dirs = sorted(d.name for d in V.iterdir() if (d / "version.json").exists())
W, CW, CH = 2400, 560, 350
sheet = Image.new("RGB", (W, 150 + 4 * (CH + 70) * 1), (27, 28, 31))
dr = ImageDraw.Draw(sheet); dr.text((40, 40), "PEPTICITY - 8 VERSIONS", font=font(46), fill=(236, 239, 243))
dr.text((40, 100), "SAME SHAPE, LOGO, COIN, FILMS AND TOUR - NEW COLOUR AND 7 EFFECTS EACH", font=font(18), fill=(154, 161, 170))
for i, d in enumerate(dirs):
    m = json.loads((V / d / "version.json").read_text())
    hx = m["hex"]; col = tuple(int(hx[k:k+2], 16) for k in (1, 3, 5))
    hero = Image.open(RAW / f"{d}-hero.png").convert("RGB")
    hero.resize((720, 450), Image.LANCZOS).save(TH / f"{d}.webp", quality=82)
    read = Image.open(RAW / f"{d}-read.png").convert("RGB")
    cx, cy = 40 + (i % 2) * (W // 2), 150 + (i // 2) * (CH + 70)
    sheet.paste(hero.resize((CW, CH), Image.LANCZOS), (cx, cy + 40)); sheet.paste(read.resize((CW, CH), Image.LANCZOS), (cx + CW + 16, cy + 40))
    dr.polygon([(cx + 8, cy + 8), (cx + 16, cy + 16), (cx + 8, cy + 24), (cx, cy + 16)], fill=col)
    dr.text((cx + 28, cy + 4), f"{m['n']} - {m['name']}   {hx}", font=font(22), fill=(236, 239, 243))
    dr.text((cx + 28 + 520, cy + 9), " · ".join(e["code"] for e in m["effects"]), font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 14) if pathlib.Path("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf").exists() else font(12), fill=col)
sheet.save(R / "docs/owner/versions-sheets/00-overview.png")
print("overview + thumbs:", len(dirs))
