#!/usr/bin/env python3
"""Round 5 hardening (look-neutral). Runs after apply_r5.py and before the security step.
H5-1 Founders form (H63): the phone number is sent ONLY with its text-message consent (CASL). Before: sent without it.
H5-2 Phone menu: tapping the PEPTICITY logo closes the open menu (it used to stay open over the hero)."""
import sys
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    c = s.count(a); assert c == n, (a[:70], c)
    s = s.replace(a, b)
rep("if (tel.length >= 7) { o.phone = tel; if (sms && sms.checked) { o.consent_sms = { text: visibleText(form, '[data-consent-sms-text]'), at: new Date().toISOString() }; } }",
    "if (tel.length >= 7 && sms && sms.checked) { o.phone = tel; o.consent_sms = { text: visibleText(form, '[data-consent-sms-text]'), at: new Date().toISOString() }; }")
rep("qa('[data-key=\"shop\"], [data-key=\"research\"], [data-key=\"about\"], [data-leave]').forEach(function (a) { a.addEventListener('click', went); });",
    "qa('[data-key=\"shop\"], [data-key=\"research\"], [data-key=\"about\"], [data-leave], .pep-header-brand').forEach(function (a) { a.addEventListener('click', went); });")
open(dst, 'w', encoding='utf-8').write(s)
print('apply_h5: 2 fixes applied')
