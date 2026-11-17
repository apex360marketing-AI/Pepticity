---
name: "site-hardening"
description: "Put and keep a website's protections in place: the hardening baseline every page must carry, the approved security tool belt run in one command, and the rules that stop a protection from being undone by a later edit. Use when asked to harden, lock down, protect the site or the brand, after any audit, before every release, and whenever a script, form, CRM link, payment or outside service is added."
---

# Site hardening: protections that stay in place

Auditing finds holes; hardening makes sure they stay closed after the next edit, the
next patch and the next helper. Pair this with `static-site-security` (how to attack and
prove) and `site-release-gate` (how to release). Installing tools changes the machine:
install only the approved list below, only inside a work folder, never into the project.

## 1. The baseline every page carries (check all of it, every release)

1. A Content-Security-Policy meta tag first in `<head>`: `default-src 'none'`, scripts by
   hash plus `'self'`, no `'unsafe-eval'`, `connect-src` limited to the site and the one
   form endpoint, `base-uri 'none'`, `form-action 'none'`. Re-hashed LAST, after every other edit.
2. A frame guard: framed by another origin, the page goes inert (nothing can be pressed).
3. `<meta name="referrer" content="strict-origin">`.
4. No personal data in localStorage, sessionStorage, cookies, IndexedDB, the URL, the
   analytics data layer or the console. Forms send only to the configured endpoint, only
   with the consent rules met (Canada: separate, unticked email consent).
5. Text is set with `textContent`; links are built with `new URL()` and limited to
   `https:`, `mailto:`, `tel:`; new windows carry `rel="noopener"`.
6. Every outside file is self-hosted, or pinned to a version with an integrity hash.
7. Nothing secret or private in the public repository, in any branch or in history.

## 2. The approved tool belt (pinned; verified releases, November 2026)

| Tool | Checks | Safe use |
|---|---|---|
| Gitleaks 8.30.1 | leaked keys and passwords in all git history | run on a full mirror clone; mask output |
| Semgrep 1.185.0 | real static analysis of the page's scripts | `--metrics=off`, local rules only, never `--config auto` |
| ESLint + eslint-plugin-no-unsanitized 4.1.5 | code-injection sinks (`innerHTML` and friends) | on the extracted inline scripts |
| Retire.js | outside libraries with known holes | on the page folder and vendored code |
| OSV-Scanner 2.7.1 | dependencies with known holes (the stand-in for Trivy) | lockfiles and SBOMs |
| Google CSP Evaluator 1.1.8 | weaknesses in the page's policy | on the exact policy string shipped |
| Mozilla HTTP Observatory 1.7.2 | the live site's security grade | one ordinary visit to the published address |
| Lighthouse 13.6.0 | best practices, accessibility, performance | local copy and the published address |
| axe-core 4.14.0 | accessibility, with every dialog and menu open | at 390 and 1440 wide |
| OWASP ZAP 2.17.0 | a second-opinion attack scan | baseline/passive, LOCAL copy only |

Banned: Trivy (its releases and GitHub Actions were hijacked in March 2026), Nuclei and
Nikto (server tools, noisy), AI auto-pentesters (they attack live targets). Any new tool:
check its latest release date, read its release notes, verify checksums, ask the owner.

## 3. One command

Run the tool belt with `harden-scan.sh <page-folder> <live-url|none> <repo-dir> <out-dir>`
(kept with the project's hardening tools). It extracts the inline scripts, runs every
tool above in a fixed order and writes one `summary.txt`. A tool that cannot run is
listed as NOT RUN with the reason, never silently skipped.

## 4. Judge, fix, lock

1. Every tool finding is a candidate, not a verdict: reproduce it or mark it a false
   positive with the reason.
2. Fix with the smallest anchored, repeatable change, no visible change; failing test
   first; mutation run (delete the guard, the test must fail).
3. Lock it: add each fixed hole to the release checks so a later edit that reopens it
   fails the release gate.

## 5. What hardening cannot do inside a page (name it as the owner's decision)

Own domain instead of a shared `*.github.io` address; a host or CDN that sends real
security headers (HSTS, frame-ancestors, nosniff); a private repository for build notes;
GitHub secret scanning with push protection and branch protection on the published branch;
a backend for orders and the CRM with server-side validation and rate limits.
