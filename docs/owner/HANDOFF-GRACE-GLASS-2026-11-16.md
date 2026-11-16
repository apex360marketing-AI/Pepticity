# HANDOFF: Desk glass previews → "Grace's peptide site and dashboards"

From session `session_01SMNC3WfMCMsAuVJXh6u6Z4` (Nov 3, Desk glass look + colour switcher). The owner is archiving that session and wants to work only from "Grace's peptide site and dashboards". This file holds that session's full context and audit. **Low priority: finish the card work first.**

## 1. What that session was asked to do (owner, 3 Nov)
- Give Grace's pieces one premium look taken from the PEPTICITY DESK artifact (https://claude.ai/artifact/5Cs1gS1qceEjhahFmvE1pw): liquid-glass see-through cards, clipped corners (top-left + bottom-right), thin glow rim, chrome gold / chrome platinum.
- Add a 10-colour switcher: the 8 accents from /versions/ (Blue #0066FF, Chartreuse #D4FF3A, Cyan #0FFFFF, Red #FF004F, Violet #6F00FF, Orchid #8D029B, Copper #C46210, Salmon #FA8072) + Chrome Gold + Chrome Platinum.
- Apply to the owner + customer dashboards, the concierge page + concierge control tab, and the Command Center. Publish only to NEW preview folders, never over live pages.
- Customer link fixes: no GRACE (OWNER) switch or owner data, remove the "Bacteriostatic water (Pfizer)" sample row, remove the "logo is a placeholder" footer line.
- Round 2 (owner in chat): "way too monotone... add illumination [hover] effects and some colour... classy, not cheap", and about the header: "I don't want to see your command centre or nothing".

## 2. What is live (public GitHub Pages, preview folders only)
- https://apex360marketing-ai.github.io/Pepticity/dashboard-glass/
- https://apex360marketing-ai.github.io/Pepticity/client-glass/
- https://apex360marketing-ai.github.io/Pepticity/concierge-glass/ (+ control tab at /concierge-glass/panel/#owner, tab 11)
- https://apex360marketing-ai.github.io/Pepticity/command-center/

That session never touched live dashboard/, client/, concierge/, the store (/new/, /new-hardened/, /store/) or the card work.

**Live audit, 16 Nov (Playwright, 1440 and 390 wide):** all 5 URLs return 200, 0 console errors, no sideways scroll, colour switcher present. /client-glass/ shows no owner switch. /command-center/ no longer shows "YOUR COMMAND CENTER".

## 3. Source
- Branch `claude/grace-glass` (commits 078e2c6, cd6a21c).
- `tools/glass-skin/skin.css`: the look (glass panes, colour-pair rims, hover glow, sweep, colour on figures, eyebrows, chart line, bars and tabs, the switcher UI).
- `tools/glass-skin/skin.js`: switcher (localStorage key `pep-accent`, `?accent=` URL param), pointer torch, per-card hot spot, one-at-a-time light sweep.
- `tools/glass-skin/build.py`: injects the skin into each page and applies the fixes. Run as `python3 tools/glass-skin/build.py <out> <command_center_html> <concierge_html> <concierge_panel_dir>`.
- `previews/glass/`: the built output as published on 3 Nov.

## 4. Things to know before reusing it
- **Built from 3 Nov sources.** The live dashboards changed on 13 Nov (store look, logo 21, background 21), so the glass previews are now out of date against live.
- **client-glass was edited on gh-pages on 4 Nov by another session** (baa6acb, 0b4d0d7: owner-side code stripped from client pages). Re-running build.py as it is and copying the result over gh-pages would bring back the pre-4-Nov client page. Re-apply that strip if you rebuild.
- Each colour is a pair: Gold + sapphire #4f7dff, Platinum + #9db4ff, Blue + #00C2FF, Chartreuse + #2EF2A0, Cyan + #4F7DFF, Red + #FF2D95, Violet + #C04BFF, Orchid + #FF4FD8, Copper + #E8C39E, Salmon + #FF6FA8. Default is Chrome Gold.
- Fonts, layout, copy and 3D type were left alone, because main CLAUDE.md locks the dashboard look. Only colour and light were added.
- Command Center header: the "YOUR COMMAND CENTER" heading and the "COMMAND CENTER" label under the logo were removed, and the first tab reads HOME. No earlier written header note was found in the ledger, the board or any branch, so this is a reading of the owner's chat words.
- The first push to gh-pages was blocked by the permission check. It went through only after the owner said "Yes" in chat.

## 5. Open owner questions (review board QJABMKttNFPFsRMcRkdJw5, unanswered as of 16 Nov)
- `grace-glass-header`: is the Command Center header right now?
- `grace-glass-colour`: is the colour level right?
- `grace-glass-default`: which colour should Grace see first?
- `grace-glass-studio`: should "YOUR STUDIO" come off the dashboards too? (It's locked, so it was left.)
- Private review page with before/after shots: https://claude.ai/artifact/RnhVQZEez1eX4sL7Nthn5M

## 6. Owner rules picked up (branch claude/owner-rules-2026-11-02, CLAUDE.md)
- Questions go on the review board as steps, never in chat. Open the board after every change.
- Mark anything changed in bright purple #B000FF on pages the owner reviews.
- Anything for Grace goes out as a public GitHub Pages link, never a private artifact link.

## 7. Suggested next steps (owner decides; nothing urgent)
1. Ask the owner, as a board step, whether to keep the 4 glass preview folders, fold the colour switcher and hover lighting into the store (/new/) look, or retire them.
2. If kept, rebuild from current live sources so they carry logo 21, the store look and the 4 Nov client fix.
3. Don't overwrite live pages with these previews without the owner's OK.
