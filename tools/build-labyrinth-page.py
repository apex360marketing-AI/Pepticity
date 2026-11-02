#!/usr/bin/env python3
"""LABYRINTH plan page (owner-review-page standard). Every skill starts IN; the owner taps one to take it OUT. Output: docs/owner/labyrinth/{index,artifact}.html"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from review_lib import render
R = pathlib.Path(__file__).resolve().parent.parent
def g(id_, title, ask, rows):
    return dict(id=id_, title=title, ask=ask, checks=[dict(key=k, label=k, sub=s) for k, s in rows],
                options=[dict(key='ok', label='THIS GROUP IS RIGHT'), dict(key='more', label='ADD MORE (say which in the note)')])
plan = dict(id='plan', title='THE PLAN: 3 SKILLS, NOT 200', ask='What I will create. Nothing is created until you answer.',
  lines=[
   'DAEDALUS (the skill that builds skills): writes, tests and size-checks every other skill. Keeps them small and sharp.',
   'LABYRINTH (the flagship): from 2 to 3 lines it builds the whole business: brand, site, marketing, hooks, psychology, automation.',
   'MINOTAUR (the hunter): audits everything like a jury, hunts slop, cheap looks, dead hooks and legal risks, then scores it.',
   'The loop inside LABYRINTH: BRIEF > STUDY > DESIGN > BUILD > HOOKS > AUDIT > LEARN > IMPROVE, then it starts the next lap.',
   'LEARN means: after every job it writes what worked and failed to a lessons file and to your brain. It updates its own rules in small, versioned steps, and big changes wait for your tap.',
   'IMPROVE means: a scheduled nightly run re-scores past jobs, tries better versions, keeps only what beats the old score.',
   'One thread ties it together: the question board, the review pages and the brain, so nothing is asked twice.',
   'Honest limits: Claude cannot retrain its own weights. "Trains itself" means rules, lessons and tests that get better. Legal, payments and ad accounts still need a human tap.',
   'Why 3 and not 1: one giant skill loads too much and starts to miss its triggers. A small core that pulls in modules only when needed behaves like one skill and stays sharp. The research session is confirming the exact limits.'],
  options=[dict(key='ok', label='YES, 3 SKILLS (Recommended)'), dict(key='one', label='JUST ONE SKILL'), dict(key='two', label='TWO SKILLS'), dict(key='change', label='CHANGE IT (note)')])
groups = [
 g('grp-work', 'HOW WE WORK TOGETHER', 'The rules of how you and I work. Tap any to take it out.', [
  ('read-three-times', 'Re-reads your ask three times so nothing is dropped'),
  ('requirement-checklist', 'Turns your message into a ticked checklist'),
  ('owner-accountability', 'Nothing swapped or decided for you'),
  ('owner-precision-mode', 'One exact change, proves nothing else moved'),
  ('owner-delivery-format', 'Point form, short, always a recommendation'),
  ('owner-review-page', 'You click pictures to approve; answers save'),
  ('forward-partner', 'Ends every job with ranked next ideas'),
  ('stage-gate + staged-delivery', 'One piece, a picture, your OK, then the next'),
  ('spec-before-build', 'Restates the job and flags gaps before building'),
  ('verify-before-done', 'No "done" without browser proof'),
  ('clickable-recommendations + decision-board', 'You approve ideas by tapping'),
  ('session-splitter', 'Separates jammed projects into their own sessions'),
  ('apex-build-contract', 'Decides what is and is not being built before line one'),
  ('surgical-refinement', 'Proves by diff that only the asked change moved')]),
 g('grp-look', 'THE $30K LOOK', 'What makes it look expensive and never cheap.', [
  ('premium-restraint', 'Colour only on edges and glints, with a checker'),
  ('clear-glass-spec', 'Completely see-through glass, with a pixel test'),
  ('apex-glassmorphism + holo-glass-ui + liquid-glass-studio', 'Glass, hologram and liquid-metal surfaces'),
  ('apex-house-style + pepticity-brand-lock', 'Locks a brand so every page matches'),
  ('design-tokens-theming', 'One colour system with contrast checks'),
  ('layout-composition', 'One-of-a-kind grids, never the template look'),
  ('modern-typography + ux-writing-microcopy', 'Distinct type and plain, sharp words'),
  ('liquid-chrome-gold (+ platinum)', 'Your chrome metals as reusable materials'),
  ('accent-colorways', 'One accent, capped, per colourway'),
  ('visual-reference-lock + reference-match + reference-pixel-kit + reference-eyedropper + glyph-reference-match', 'Matches your pictures exactly, by measuring'),
  ('motion-design-system + premium-micro-interactions', 'One motion language, tactile hovers'),
  ('apex-design-first', 'Shows look options first, then locks the design'),
  ('apex-loader', 'The entrance moment before a page appears')]),
 g('grp-3d', '3D, 4D, SCROLL AND MOTION', 'Depth, life and movement.', [
  ('threejs-real-3d + 4d-direction', 'Real 3D that reacts to pointer, scroll and time'),
  ('3d-asset-pipeline', 'Production-weight models, fast and compressed'),
  ('exploded-layers-3d', 'Products that pull apart as you scroll'),
  ('webgl-shader-backgrounds', 'Live liquid and light behind the page'),
  ('hologram-panels + chrome-lift-icons', 'Floating glass panels and lifted chrome icons'),
  ('gsap-scroll-choreography + cinematic-scroll', 'Pinned, scrubbed, cinematic scroll stories'),
  ('css-scroll-driven-motion', 'Light scroll motion with no JavaScript'),
  ('smooth-scroll-audit', 'Measured, weighted, never-flying scroll'),
  ('page-transitions', 'Smooth moves between pages and the entrance'),
  ('effect-catalog + effect-picks-enforcer', 'Every effect numbered, used and proven present'),
  ('apex-cinematic-design', 'Whole premium animated landing pages')]),
 g('grp-leads', 'LEADS, SALES AND PSYCHOLOGY', 'Everything that collects leads and makes sales.', [
  ('hook-architecture + lead-hook-proof', 'A classy ask every screen, each one tested end to end'),
  ('capture-forms + pepticity-lead-engine', 'Forms, consent records and hook tagging'),
  ('conversion-ux', 'Turns visitors into leads without losing the look'),
  ('guided-quiz-funnel + product-finder-quiz', 'Quizzes that guide and capture'),
  ('interest-entry-hooks + gamified-reveal-hooks', 'Need-based cards and playful sign-ups'),
  ('exit-and-return-hooks + scroll-reveal-hooks', 'Catch leavers, welcome returners, hooks that glide in'),
  ('stay-and-explore + save-share-and-refer', 'Keeps people longer; loops that bring friends'),
  ('honest-urgency-and-social-proof', 'Real scarcity and proof only'),
  ('follow-up-sequences', 'Emails and texts after the visit, with consent'),
  ('offer-to-checkout + checkout-closers', 'Cart, price, and the sale closed'),
  ('competitor-teardown + campaign-sales-audit', 'What rivals do and where the money path leaks'),
  ('social-campaign-builder', 'Postable campaigns, day by day'),
  ('taste-test-ux', 'Picks effects and styles by reaction')]),
 g('grp-audit', 'QUALITY GATES AND AUDITS', 'What stops slop before you see it.', [
  ('quality-gate', 'Phone and desktop shots, errors, speed, accessibility'),
  ('award-jury-review', 'Scores it like an awards jury, flags template smell'),
  ('luxury-benchmark + apex-design-capture', 'Compares against top sites, studying never copying'),
  ('apex-visual-gate', 'Measures your hard design rules'),
  ('audit-and-harden + site-audit-harden', 'Repeatable audit and fix loops'),
  ('prove-the-check', 'Proves a passing check could have failed'),
  ('ui-ux-testing + systematic-debugging + test-driven-development', 'Finds and fixes real bugs'),
  ('verification-before-completion + build-report', 'Evidence before any claim'),
  ('requesting-code-review + receiving-code-review', 'Reviews that are honest, not polite')]),
 g('grp-agents', 'AGENTS AND WORKFLOW', 'How the work gets split and run.', [
  ('dispatching-parallel-agents + subagent-driven-development', 'Many agents at once, results merged'),
  ('writing-plans + executing-plans', 'Plans first, then a clean run'),
  ('using-git-worktrees + finishing-a-development-branch', 'Safe parallel branches, tidy finish'),
  ('brainstorming + using-superpowers', 'Thinks before building; finds the right skill'),
  ('writing-skills (+ DAEDALUS)', 'Creates and tests new skills'),
  ('diagnosing-superpowers', 'Finds out why a session went wrong'),
  ('credit-guard', 'Never an unplanned Higgsfield spend')]),
 g('grp-media', 'IMAGES, FILMS AND MODES', 'Media and your own build modes.', [
  ('photoreal-product-site', 'Real-looking products from Higgsfield, one consistent look'),
  ('local-comfy-engine + local-open-models', 'Free local image and video generation'),
  ('apex-standard + apex-grandioso', 'Your go-all-the-way build modes'),
  ('apex-desk + apex-desk-pet', 'Your cinematic room and the living panther'),
  ('neon-glass-ui', 'Neon glass interface style')]),
 g('grp-brain', 'BRAIN AND OPERATING SYSTEM', 'What Labyrinth learns into, and where it lives.', [
  ('the-brain + apex-brain-map', 'Your knowledge hub and its map'),
  ('apex-command-center + command-center-customize', 'Your desktop and phone control room'),
  ('apex-island', 'Watches your sessions and asks you to approve'),
  ('Konshus memory', 'Long-term memory the learning is written into')]),
 g('grp-industry', 'INDUSTRY MODULES (loaded only when the business needs them)', 'Kept out of the core so it stays sharp.', [
  ('peptide-regulatory', 'Canada and US rules for peptides'),
  ('peptide-copy-and-guide + peptide-expert', 'How PEPTICITY speaks and what it knows'),
  ('regulated-claims-check', 'Flags risky health claims in any copy'),
  ('NEW: a module slot per industry', 'Each new business gets its own compliance module')]),
 dict(id='grp-out', title='LEFT OUT ON PURPOSE (separate tools, not the builder)', ask='These stay as their own skills. Tap one to bring it IN.',
      checks=[dict(key=k, label=k, sub=s) for k, s in [
  ('mac-setup + mac-audit + windows-setup + launchpad-windows', 'Computer setup kits'),
  ('apex-partner-kit + ghl-launch + apex-family-agents', 'Partner, CRM and family agent setups'),
  ('apex-guardian-line + apex-windows-installer + apex-desktop-command-center + apex-setup-product', 'Phone, installer and setup product'),
  ('print-kit + prisma-* + arsenal-alphabet + logo-designer', 'Print, hosting and font tools')]],
      options=[dict(key='ok', label='LEAVE THESE OUT'), dict(key='in', label='BRING SOME IN (tap them above)')]),
]
spec = dict(id='labyrinth-1', title='LABYRINTH Plan',
  intro='What goes into LABYRINTH, one line each. <b>Everything starts IN. Tap any skill to take it OUT.</b> Nothing is created until you answer. Your taps save by themselves.',
  items=[plan] + groups)
a, b = render(spec, R / 'docs/owner/labyrinth')
print(len(groups) + 1, 'cards,', sum(len(g_.get('checks', [])) for g_ in groups), 'skill rows ->', b)
