"""PEPTICITY OWNER REVIEW STANDARD (skill owner-review-page).
render(spec, out_dir): writes out_dir/index.html (standalone) and out_dir/artifact.html (fragment for the Artifact tool, db capability).
spec = {id, title, intro (html), running (html, optional), items:[{id,title,ask,images:[data-uri],thumbs:[{key,label,sub,img}],options:[{key,label}],lines,link}]}"""
import json, io, base64, pathlib
from PIL import Image
T = pathlib.Path(__file__).resolve().parent / 'review.template.html'
def uri(path, w, box=None, q=78):
    im = Image.open(path).convert('RGB')
    if box: im = im.crop(box)
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
def render(spec, out_dir):
    out = pathlib.Path(out_dir); out.mkdir(parents=True, exist_ok=True)
    frag = T.read_text().replace('/*SPEC*/{}', json.dumps(spec, ensure_ascii=True).replace('</', '<\\/'))
    (out / 'artifact.html').write_text(frag)
    (out / 'index.html').write_text('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + frag + '</body></html>')
    return out / 'index.html', out / 'artifact.html'
