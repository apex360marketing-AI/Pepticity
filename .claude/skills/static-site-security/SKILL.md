---
name: "static-site-security"
description: "Audit and harden the security of a website that has no server of its own (GitHub Pages, a static host, a page builder's custom code): content security policy inside the page, a guard against being shown invisibly inside another site, referrer policy, forms that leak typed details, personal data in browser storage, outside scripts. Use when asked to audit, harden, secure, pen-test or 'make it safe', before publishing a store front, and whenever a form, a script, a payment step or a CRM hook is added."
---

# Static site security: attack it, prove it, fix it, prove it again

A site with no server still has an attack surface: the visitor's browser. The usual
mistake is protecting everything in the page's own scripts and nothing the browser
enforces. This skill closes that gap and proves it by execution, never by reading.

Spawning red-team agents costs real usage: ask first unless the owner asked for an
audit or hardening in their own words.

## 1. Enumerate, deterministically

1. Copy the page into its own folder that holds an empty `.clawness/` folder, so the
   scanner cannot walk up and scan the whole home directory (it did once: 1,084 junk hits).
2. Run the tripwire scan. If `clawness` is not on PATH, find the plugin
   (`find / -name scan.py -path '*clawness*'`) and run it with `python3 -I`,
   `sys.path` pointed at the folder above `clawness/`, args `scan --project <folder>`.
3. List scanners on PATH (`semgrep bandit gitleaks trivy codeql`). Never install one
   without asking. If none, say so: a tripwire is not a SAST engine.
4. Adjudicate every candidate (`scan --set <id> false-positive|confirmed --verdict ...`).
   Regex literals that mention `document` or `script` are a known false positive.

## 2. The invariants to break (attack each one, in this order)

1. Nothing from the URL, `document.referrer`, `postMessage`, storage, typed text,
   catalogue or config becomes markup or script (`innerHTML`, `insertAdjacentHTML`,
   `outerHTML`, `document.write`, `setAttribute` on `href`/`src`/`style`/`on*`,
   `eval`, `new Function`, string timers).
2. Every link the page builds stays `https:`, `mailto:` or `tel:`; no open redirect;
   `target="_blank"` carries `rel="noopener"`.
3. No personal data (email, name, phone, address, birthday, order) in localStorage,
   sessionStorage, cookies, IndexedDB, the URL, the analytics data layer or the console;
   nothing personal leaves the page while the form endpoint is empty; when it is set,
   data goes only there, over https, only as the consent rules allow (Canada: the email
   consent box is separate and unticked).
4. The cart cannot show a wrong price, a hidden or flagged product, a negative or absurd
   quantity, or a total that disagrees with the catalogue.
5. Nothing loads from another host except a pinned, integrity-hashed fallback.
6. With scripts slow or off, no form posts typed details anywhere.
7. Another site cannot show the page invisibly and land the visitor's click on a
   consent box or send key (clickjacking).

## 3. Reproduce before you touch anything

Write `repro.js`: one claim per line, prints `BROKEN` or `safe`, takes any URL. Run it on
the unchanged page and keep the output. Never fix what did not reproduce; say which did not.
For the adversarial read, use the red-team and blue-team agents
(`clawness:security-red-team`, then `clawness:security-blue-team`) on surface not yet cleared,
telling them what is already done.

## 4. Fix recipes for a host that cannot send headers

- **Content Security Policy as `<meta http-equiv>`**, the first thing after `<meta charset>`:
  `default-src 'none'; script-src 'self' <sha256 of every inline script and import map>
  <pinned CDN path only>; style-src 'self' 'unsafe-inline'; img-src 'self' data:;
  font-src 'self'; connect-src 'self' <form endpoint origin, once set>; base-uri 'none';
  form-action 'none'`. No `'unsafe-eval'`. Compute the script hashes from the FINAL file,
  LAST: any later edit to an inline script silently blocks it. So the security patch
  always runs after every other patch.
- **Meta CSP ignores `frame-ancestors`, `report-uri` and `sandbox`.** For framing, add a
  script guard: when the page is framed by another origin, set
  `document.documentElement.inert = true`. Never rely on `top.location =` (a sandboxed
  frame blocks it).
- **Referrer:** `<meta name="referrer" content="strict-origin">`, so a link's `?email=`
  never leaves in the Referer. Chromium ignores it for files loaded from CSS `url()`:
  report that, do not claim it.
- **Forms:** `form-action 'none'` stops the browser posting before scripts are ready; the
  scripts send, and only to the configured endpoint.
- **DOM:** build text with `textContent`; build links with `new URL()` and allow-list the scheme.
- **Outside code:** self-host. A CDN fallback is pinned to a version and has SRI hashes.

## 5. Prove it

1. Failing test first: `check_sec.js`, one test per fix, named after the defect in plain
   words; watch it fail on the unchanged page.
2. CSP walk: operate every feature (menus, every form to its end, cart to checkout,
   dialogs, the guide, 3D, scroll top to bottom) at 1440 and 390 with a
   `securitypolicyviolation` listener and the console watched for `Refused to`.
   Target: 0 violations, 0 requests to another host, 0 console errors.
3. No visible change: compare every element's box before and after (they must not move).
4. Mutation: delete each guard in a throwaway copy, re-hash, and require `check_sec.js`
   to fail. Mutate AFTER re-hashing, or the policy blocks the whole script and the
   mutant is "caught" for the wrong reason.
5. Re-run `repro.js` on the fixed page: every fixed claim must now read `safe`.

## 6. What a page cannot fix: report it as the owner's decision

- A shared address such as `<name>.github.io` shares storage and cookies with every other
  page on it: only the site's own domain closes that.
- Real security headers (frame-ancestors, HSTS, nosniff) need a host or CDN that sends
  them (for example Cloudflare or Netlify in front).
- Order capture, payments and the CRM need a backend: name the risk, do not fake it.

## 7. Report

Root cause first, where findings share one. Then: what reproduced and what did not;
what was fixed; numbers before and after (repro, tests, mutants, CSP violations); what
stays open and why; what was not checked (browsers, real devices, the live build).
Never list a still-open weakness of a live site in a public file.
