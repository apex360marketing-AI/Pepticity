# BROWSER + DESKTOP CUSTOMISATION (owner, 30 Oct 2026)

Fun, custom, stimulating set-up for Mac AND Windows (we don't know his computer yet).
Checked on the web 30 Oct 2026. Prices change, so the ones marked "check" need a look before buying.
Nothing has been installed.

---

## THE SHORT VERSION

- **Don't start on Arc.** It shuts down on **22 Dec 2026**. New sign-ups closed 22 Oct.
- **ChatGPT Atlas is gone too** (shut down 9 Aug 2026).
- **Best fix for the "terrible top bar": Zen browser.** Free, Mac + Windows.
  - Tabs move to a side bar.
  - Compact mode hides the whole top bar until you need it.
  - Each workspace gets its own colour.
  - Looks are changed with one-click "mods".
- **Windows sliding in from the sides:**
  - Mac: **Loop** (free). Windows tuck into the left, right or bottom edge and slide out when the mouse touches that edge.
  - Windows PC: **Windhawk** (free) with the "Slick Window Arrangement" mod. Windows keep gliding after you let go of them, then snap into place.
- **Our own branded start page:** yes, we can build it. An animated APEX / PEPTICITY page opens on every new tab. It is a small browser extension, and he installs it once.
- **TOP 5** is at the bottom.

---

## 1. BROWSERS YOU CAN REALLY CUSTOMISE

### AT A GLANCE

| Browser | Mac | Windows | Cost | How custom | Setup |
|---|---|---|---|---|---|
| Zen | yes | yes | free | very | easy |
| Vivaldi | yes | yes | free | the most built in | medium |
| Opera GX | yes | yes | free | most "fun" (sounds, music) | easy |
| Firefox | yes | yes | free | total, with code (userChrome.css) | hard |
| Dia (Arc's successor) | yes | yes | free + paid AI | low | easy |
| Edge | yes | yes | free | low | easy |
| Chrome | yes | yes | free | lowest | easy |
| Arc | closing 22 Dec | closing 22 Dec | free | was high | avoid |

### ZEN (Arc-style, built on Firefox)
- **What you can change**
  - Tabs in a side bar. Your most-used sites pin to the top as "Essentials".
  - **Compact mode** hides tabs, buttons and the address bar. The page gets the whole screen.
  - **Workspaces** (Work / PEPTICITY / Personal). Each one has its own colour, gradient and grain.
  - **Zen Mods**: one-click looks (floating address bar, no padding, gradients and more).
  - Your own CSS (styling code), with live editing.
  - Note: normal Firefox themes don't change Zen's frame. Use Zen Mods instead.
- **Mac / Windows:** both, plus Linux. Runs natively on Apple and ARM chips.
- **Cost:** free, open source.
- **Difficulty:** easy. Mods take a click. Your own CSS is optional.
- **ADHD-friendly:** side tabs, workspaces, split view, "Glance" (opens a link on top of your page, Esc closes it), compact mode for focus.
- **Watch out:** version numbers still end in "b" (latest 1.23.2b, 9 Oct 2026). It's stable in daily use, but some mods break after updates.
- Sources:
  - [Zen site](https://zen-browser.app/)
  - [Zen user manual](https://docs.zen-browser.app/user-manual)
  - [Wikipedia: version and platforms](https://en.wikipedia.org/wiki/Zen_Browser)
  - [Workspace colours](https://github.com/zen-browser/desktop/discussions/8940)
  - [Customising Zen (mods, themes)](https://dev.to/kelvinhey/how-to-customize-zen-browser-2373)

### VIVALDI (the "everything is a setting" browser)
- **What you can change**
  - Tab bar on **any side**: top, left, right or bottom. Drag it wider or down to icons only.
  - Two-level **tab stacks**, **tab tiling** (several pages side by side) and **workspaces**.
  - Themes: build your own, or pick from thousands made by the community. Version 8.0 (May 2026) is a full redesign.
  - Your own CSS (switch it on in `vivaldi://experiments`).
  - Command chains: one key or mouse gesture runs several actions.
  - Web panels: any site docked in the side bar.
- **Mac / Windows:** both, plus Linux, Android and iPhone.
- **Cost:** free. No AI built in.
- **Difficulty:** medium. There are hundreds of settings, which can overwhelm.
- **ADHD-friendly:** **Break Mode** (Ctrl + .). It mutes audio, hides every tab and shows one "breathing" button. Plus side tabs, stacks and workspaces.
- Sources:
  - [Vivaldi features](https://vivaldi.com/features/)
  - [Tab bar on any side](https://help.vivaldi.com/desktop/tabs/tab-bar/)
  - [Vivaldi 8.0 redesign](https://alternativeto.net/news/2026/5/vivaldi-8-0-introduces-major-design-overhaul-and-new-layout-presets-still-no-ai-features/)
  - [8.0 launch and theme count](https://www.geeky-gadgets.com/vivaldi-8-browser-launch/)
  - [Break Mode](https://vivaldi.com/blog/vivaldi-introduces-break-mode/)
  - [CSS mods how-to](https://forum.vivaldi.net/post/362666)

### OPERA GX (the "most fun" browser)
- **What you can change**
  - **GX Mods** (free) change wallpapers (including live ones), colours, **browser sounds**, **background music**, shaders (screen effects), fonts, icons and splash screens.
  - Animated cursors.
- **Mac / Windows:** both. Turning your *computer's* wallpaper into a GX one works on Windows only.
- **Cost:** free.
- **Difficulty:** easy.
- **ADHD-friendly**
  - Split screen.
  - **Tab Islands**: groups related tabs on its own.
  - **Tab Traces**: shows your last 5 tabs once you have 30+ open.
  - Note: vertical tabs are confirmed for the normal Opera browser, not confirmed for GX.
- **Watch out:** gamer look out of the box. A lot of extras (side bar apps, AI, news) are worth switching off.
- Sources:
  - [GX Mods](https://www.opera.com/gx/features/mods)
  - [Split screen and Tab Islands](https://www.neowin.net/news/opera-gx-gets-split-view-tab-islands-and-more-new-features/)
  - [Tab Islands](https://www.opera.com/gx/features/tab-islands)

### FIREFOX (total control, needs code)
- **What you can change**
  - Built in: **vertical tabs** (since version 136, Mar 2025), **tab groups** (version 138), **split view** (version 149, Mar 2026, 2 pages).
  - **userChrome.css** lets you restyle the whole top bar: colours, shapes, hiding things, even animation.
  - How: turn on one hidden setting in `about:config`, make a `chrome` folder with the file in it, restart.
- **Mac / Windows:** both.
- **Cost:** free.
- **Difficulty:** hard for the CSS part. Code snippets can break when Firefox updates.
- **ADHD-friendly:** vertical tabs and tab groups. Add-ons like Sidebery or Tree Style Tab add more.
- **Watch out:** you can't set a custom new-tab page without an extension.
- Sources:
  - [Vertical tabs launch](https://connect.mozilla.org/t5/discussions/sidebar-and-vertical-tabs-launch-in-release-136/m-p/89652)
  - [Tab groups](https://linuxiac.com/mozilla-firefox-tab-groups-are-now-live/)
  - [Split view in 149](https://vpncentral.com/?p=247367)
  - [userChrome.css snippets](https://github.com/MrOtherGuy/firefox-csshacks)
  - [New-tab limit](https://bugzilla.mozilla.org/show_bug.cgi?id=1950457)

### CHROME (easy, least custom)
- **What you can change**
  - Themes = a colour or a background picture.
  - Choose and re-order toolbar buttons.
  - Native **vertical tabs** (rolled out from Apr 2026: right-click the tab strip, then "Show tabs vertically").
  - **Split view** (2 tabs, from version 145).
- **Limits:** you can't reshape the top bar, add your own CSS or add animation.
- **Cost:** free. **Difficulty:** easy.
- Sources:
  - [Vertical tabs in stable](https://chromeunboxed.com/google-is-officially-rolling-out-native-vertical-tabs-to-the-stable-version-of-chrome/)
  - [Split view](https://developer.chrome.com/blog/split-view-api-extensions)
  - [Customise panel](https://blog.google/products-and-platforms/products/chrome/new-ways-to-customize-chrome-on-your-desktop/)
  - [Toolbar buttons](https://9to5google.com/2025/01/17/google-chrome-toolbar-customize/)

### EDGE (good if already on Windows)
- **What you can change:** vertical tabs (Ctrl + Shift + comma), workspaces (tab sets per project), split screen, optional "Copilot Mode" AI. Themes are basic, like Chrome's.
- **Mac / Windows:** both. **Cost:** free. **Difficulty:** easy.
- Sources:
  - [Edge for Mac](https://www.microsoft.com/edge/mac)
  - [Vertical tabs](https://betanews.com/article/microsoft-edge-vertical-tabs)
  - [Split screen](https://pureinfotech.com/enable-split-screen-microsoft-edge/)
  - [Copilot Mode](https://www.tweaktown.com/news/106690/microsofts-edge-browser-gets-experimental-copilot-mode-that-lets-ai-view-all-your-tabs/index.html)

### ARC (closing, don't start)
- It was the most fun browser: coloured "Spaces", tabs auto-archived after 12 hours, and "Boosts" to restyle any website.
- **Shutting down 22 Dec 2026**, on Mac and Windows. You can move bookmarks, passwords and spaces into Dia.
- Sources:
  - [TechCrunch: Arc sunset](https://techcrunch.com/2026/10/22/arc-browser-sunsets-december-22-as-the-browser-company-doubles-down-on-dia/)
  - [Timeline](https://www.elevenforum.com/t/arc-browser-is-sunsetting-on-december-22-2026.50333/)
  - [What Arc had](https://wit.ucsf.edu/content/arc-web-browser)

### 2026 NEWCOMERS
- **Dia** (made by Arc's team, now owned by Atlassian)
  - Mac + Windows. Free download. Pro was $20 a month for unlimited AI; plans changed in Aug 2026, so check.
  - Tabs in a side bar or along the top, named tab groups, saved split layouts, separate work and personal profiles.
  - Mostly an AI browser: a morning brief and answers drawn from your open tabs.
  - **No Arc-style coloured Spaces. Few looks to change.**
  - Sources:
    - [Dia site](https://www.diabrowser.com/)
    - [Dia updates](https://www.diabrowser.com/updates)
    - [Aug 2026 plan changes](https://piunikaweb.com/2026/08/18/dia-announces-expensive-monthly-ai-plans/)
- **Comet** (Perplexity)
  - Free on Mac + Windows. An AI assistant on every tab. Chrome extensions work.
  - Little to customise. Reports disagree on whether it has vertical tabs.
  - Source: [Comet is free](https://www.gizbot.com/artificial-intelligence/perplexitys-ai-powered-comet-browser-is-now-free-for-everyone-on-windows-and-mac-119357.html)
- **Opera Neon**
  - An AI "agent" browser. The download became free in Aug 2026 (one report). The AI features cost $19.90 a month.
  - Sources:
    - [Neon pricing](https://toolchase.com/tool/opera-neon/)
    - [Launch price](https://www.engadget.com/ai/operas-ai-browser-will-cost-you-20-a-month-123022110.html)
- **Helium:** a private, Google-free browser built on Chrome's engine. Still pre-1.0 (0.13 in Jun 2026). Not about looks.
  - Source: [Helium platforms](https://www.mintlify.com/imputnet/helium/reference/platform-repos)
- **Orion** (Kagi): Mac only. Windows version still in development.
  - Source: [2026 roundup](https://composite.com/blog/best-new-ai-browsers)
- **ChatGPT Atlas:** shut down 9 Aug 2026.
  - Source: [MacRumors](https://www.macrumors.com/2026/07/10/openais-chatgpt-atlas-browser-shutting-down/)

---

## 2. CUSTOM NEW-TAB / START PAGES

### READY-MADE EXTENSIONS
- **Bonjourr**
  - Free, open source, no account. Chrome, Firefox, Edge. The Safari app is being discontinued.
  - Apple-style. Photos change with the time of day, or use your own.
  - Links, search, notes, quotes, weather, **Pomodoro focus timer**, your own fonts and CSS.
  - Source: [bonjourr.fr](https://bonjourr.fr/)
- **Tabliss**
  - Free, open source. Chrome, Firefox, Edge, plus a web version.
  - Backgrounds: photos, **animated GIFs**, gradients or your own pictures.
  - Widgets: clock, weather, to-dos, links.
  - Source: [tabliss.io](https://tabliss.io/)
- **Momentum** (the most ADHD-ready out of the box)
  - Free, or Plus at **$39.95 a year**.
  - Plus adds: focus mode, **site blocker**, Pomodoro, **soundscapes**, countdowns, calendar, and links to Asana, Trello and Todoist.
  - Source: [Momentum Plus](https://momentumdash.com/plus)
- **Infinity New Tab:** more of a dashboard, with more settings than Momentum.
  - Source: [2026 comparison](https://linkflare-site.pages.dev/articles/best-new-tab-extensions-2026)

### OUR OWN APEX / PEPTICITY START PAGE (yes, possible)
**What it could show**
- His brand: the PEPTICITY STUDIO 3D font, the logo P, the gunmetal look.
- A moving background. The film is made with Higgsfield, per the brand rules; cost stated before any spend.
- Clock and greeting.
- One big search bar.
- Tiles for his dashboards, Gmail, Calendar and the GitHub Pages sites.
- "Today's 3 things".
- A focus timer.
- Optional: live numbers from the PEPTICITY dashboard.

**Rough steps**
1. **One sample first.** Design one start page and show a picture. Wait for his OK.
2. **Build the page** as plain web files, kept small so new tabs open instantly.
3. **Wrap it as an extension.** A tiny settings file (`manifest.json`) tells the browser to use our page as the new tab.
   - The setting is `chrome_url_overrides` with `newtab`.
   - One file works in Chrome, Edge, Vivaldi, Opera, Dia and Comet.
   - The same setting works in Firefox and Zen.
4. **Install it privately**
   - Chrome / Edge: "Load unpacked" in developer mode. Or list it as "unlisted" on the Chrome Web Store (one-time $5 Google developer fee) so it updates on its own.
   - Firefox / Zen: Mozilla must sign it (free; it can be unlisted, so it stays private).
   - Safari: host the page on GitHub Pages, then set it as Safari's home page and choose "New tabs open with: Homepage". (A real Safari extension needs Apple's developer tools, and he has to switch it on in Safari's settings.)
5. **Rules to know**
   - It doesn't show in private (incognito) windows.
   - One extension can replace only one browser page.
   - If two new-tab extensions are installed, Chrome uses the last one and Firefox the first. Remove Momentum and the like first.
6. **Bonus:** run the same animated page as his **live desktop wallpaper**. Plash on Mac or Lively Wallpaper on Windows, both free (see section 3).

- Sources:
  - [Chrome: override the new tab](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages)
  - [MDN: chrome_url_overrides (Firefox and Safari notes)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides)

---

## 3. WINDOW ANIMATIONS ("windows sliding in from different angles")

### MAC: WHAT APPLE ALLOWS
- Apple has **no setting** to change how windows open or slide.
- Built in, you only get:
  - The minimise effect: Genie or Scale.
  - A hidden third one, **"Suck"**, set by one Terminal command. It still worked on macOS 26.4.1 (Apr 2026).
  - Reduce Motion, which switches animations off.
  - Snapping: drag a window to an edge, or hover the green button for halves and quarters.
- Newest macOS: **27 "Golden Gate"**, released 14 Sep 2026.
- So the fun on Mac comes from apps that **move windows for you, with animation**.
- Sources:
  - ["Suck" effect still works](https://eclecticlight.co/2026/04/27/the-minimise-easter-egg-lives-on/)
  - [macOS tiling guide (fan site)](https://macos-tahoe.com/blog/macos-tahoe-window-management-complete-guide-2025/)
  - [Golden Gate release](https://eclecticlight.co/2026/09/14/apple-has-released-macos-golden-gate-and-security-updates-to-tahoe-26-7-sequoia-15-8/)

### MAC TOOLS
- **Loop** (free, open source, macOS 13+): the best fit for him.
  - Hold one key and flick the mouse in a direction. A **radial menu** moves and resizes the window, **with animation** at a speed you choose.
  - **Stash:** windows hide on the **left, right or bottom** edge and **slide out** when the mouse touches that edge.
  - Install: download, or `brew install loop`.
  - Sources:
    - [Loop on GitHub](https://github.com/MrKai77/Loop)
    - [Stash docs](https://www.mintlify.com/mrkai77/loop/features/stash)
    - [Release with Stash and animation timing](https://github.com/mrkai77/Loop/releases/tag/1.3.0)
- **Rectangle** (free, open source) and **Rectangle Pro** (one-time, about $9.99, check)
  - Keyboard snapping.
  - Pro adds "throw" (send a window to 16 spots), saved layouts and **Stash** (windows slide out from the edge).
  - Sources:
    - [Rectangle Pro](https://rectangleapp.com/pro)
    - [Pro Stash](https://www.rectangleapp.com/pro/docs/stash/)
    - [Price and licence](https://aicoolies.com/pricing/rectangle)
- **Raycast:** free launcher with window commands. Pro is about $8–10 a month (sources differ). Also on Windows (beta).
  - Source: [Raycast window management](https://manual.raycast.com/window-management)
- **Hammerspoon** (free, needs simple scripts)
  - Can animate any window move (0.2 seconds by default, adjustable).
  - **We could script "windows fly in from a different side each time."**
  - Source: [Hammerspoon window docs](https://www.hammerspoon.org/docs/hs.window.html)
- **DockDoor** (free, open source): live window previews when you hover the Dock, plus a preview-style app switcher.
  - Source: [dockdoor.net](https://dockdoor.net/)
- **Live wallpaper**
  - **Plash** (free): any web page as the wallpaper, including our start page.
  - **Backdrop:** video wallpapers, $29.99 lifetime (maker's figure).
  - Sources:
    - [Plash](https://sindresorhus.com/plash)
    - [Backdrop](https://cindori.com/reviews/wallpaper-engine-vs-backdrop-mac)
- **yabai:** the most powerful tiler, but **full features need System Integrity Protection (SIP) switched off**. SIP is Apple's core security shield. **Not for a business computer.**
  - Source: [yabai SIP page](https://github.com/koekeishiya/yabai/wiki/Disabling-System-Integrity-Protection)

**Mac risks**
- These apps need "Accessibility" permission to move windows. Only install from the official site or Homebrew.
- Big macOS updates can break them for a while. Example: menu-bar apps had problems on Tahoe.
- Never turn off SIP.

### WINDOWS PC: WHAT MICROSOFT ALLOWS
- Built in: animations on or off, and Snap Layouts. No control over direction or style.

### WINDOWS TOOLS
- **Windhawk** (free, open source): a "mod store" for Windows.
  - Every mod shows its code.
  - It stays out of core system processes by default and has a safe mode.
  - **Slick Window Arrangement** mod (about 35–39k users): you "throw" a window, it **glides** in the direction you threw it, then snaps to edges. Glide length is adjustable.
  - **Windows 11 Taskbar Styler:** themes, a vertical taskbar, a dock-like bar.
  - **Start Menu Styler:** restyles the Start menu.
  - Risks:
    - Windows updates can break mods. Update KB5089573 broke Start Menu Styler on the old Start menu.
    - Game anti-cheat can object.
    - Make a restore point first.
  - Sources:
    - [Windhawk on GitHub](https://github.com/ramensoftware/windhawk)
    - [Slick Window Arrangement](https://windhawk.net/mods/slick-window-arrangement)
    - [Best mods](https://www.windowscentral.com/microsoft/windows-11/7-best-windhawk-mods-to-transform-your-desktop-on-windows-11)
    - [Safety notes](https://www.smartprix.com/bytes/windhawk-the-windows-customization-tool-you-didnt-know-you-needed/)
    - [Update breakage report](https://www.elevenforum.com/t/windhawk-mods-official-topic-please-post-all-here.29387/post-744913)
- **Seelen UI** (free, open source, in the Microsoft Store)
  - Replaces the taskbar with a themed toolbar and adds a Mac-style dock, auto-tiling and a launcher.
  - **Animated switching between desktops.** Themes are built with CSS.
  - Version 2.8.2 (Aug 2026).
  - Risks: lots of animation can raise CPU use. Needs Edge installed.
  - Sources:
    - [Seelen UI on GitHub](https://github.com/eythaann/Seelen-UI)
    - [Version and CPU note](https://geekchamp.com/?p=1101918)
- **Komorebi:** auto-tiling with **smooth window-movement animations** (Windows 11).
  - **Business use needs a paid licence:** Windows licence $10 a month or $110 a year.
  - Set up with text files, so harder.
  - Sources:
    - [Licensing](https://komorebi.lgug2z.com/about/licensing/)
    - [Pricing](https://lgug2z.com/software/komorebi)
- **GlazeWM** (free, open source): keyboard tiling set up in a text file. Animations are only on or off. Coloured window borders on Windows 11. Harder.
  - Source: [GlazeWM](https://github.com/glzr-io/glazewm)
- **PowerToys FancyZones** (free, made by Microsoft, the safest): draw your own snap zones. No animation. PowerToys is actively updated (0.100 in Jun 2026, 0.102 in Oct 2026).
  - Source: [PowerToys 0.100](https://alternativeto.net/news/2026/6/powertoys-0-100-not-1-0-launches-with-redesigned-shortcut-guide-and-an-extension-gallery/)
- **Rainmeter** (free, open source): desktop widgets (clocks, stats, launchers).
  - Game mode cuts its resource use to zero.
  - Skins can run scripts, so only use well-known ones.
  - Source: [Rainmeter 4.5](https://www.pcgameshardware.de/Freeware-Thema-204539/News/Rainmeter-mit-Spielemodus-1378529/)
- **TranslucentTB** (free, open source, Microsoft Store): see-through taskbar. Version 2026.1 (Mar 2026).
  - Source: [TranslucentTB](https://github.com/TranslucentTB/TranslucentTB)
- **Lively Wallpaper** (free, open source, Microsoft Store)
  - Video, shader or **web-page** wallpapers. Our start page could be the desktop.
  - Pauses when an app goes full screen.
  - Source: [Lively](https://github.com/rocksdanister/lively)
- **Quake Modoki:** new (Jan 2026) tiny open-source tool. Any window **slides in or out from a screen edge** with a hotkey or the mouse. It's a programmer install and very new, so **experimental only**.
  - Source: [Quake Modoki](https://lib.rs/crates/quake-modoki)

### WHICH ARE SAFE AND REPUTABLE
- **Safest (official stores or big open-source projects):**
  - Windows: PowerToys / FancyZones, TranslucentTB, Lively, Seelen UI.
  - Mac: Loop, Rectangle, Raycast, DockDoor, Plash.
- **Safe with care:** Windhawk (make a restore point, read the mod page), Rainmeter (vet skins), Hammerspoon (we write the script), GlazeWM.
- **Avoid on a work computer:**
  - yabai with SIP off.
  - Komorebi without a business licence.
  - Any "theme pack" that asks you to turn off security or patch system files.
  - Quake Modoki for now.

---

## 4. ADHD-FRIENDLY TOOLS (SHORT)

- **Focus timers**
  - Windows: **Focus sessions** are built in (Clock app). They turn on Do Not Disturb and stop taskbar flashing and badges. Links to Spotify and Microsoft To Do. Free.
  - Mac: **Session** (Pro about $3.99 a month or $29.99 a year; blocks sites and apps).
  - Mac: **Flow** (menu-bar timer, about $5 one-time per one review).
  - Bonjourr and Momentum have timers built in.
  - Sources:
    - [Windows Focus](https://www.microsoft.com/en-us/windows/tips/focus-sessions)
    - [Session / Flow](https://www.asianefficiency.com/productivity/best-pomodoro-timer-apps/)
- **Visual planners**
  - **Tiimo:** built for ADHD, a visual timeline, made for "time blindness". Free, or about $60 a year.
  - **Structured:** timeline planner, mainly Apple. Free, or about $30 a year.
  - Source: [ADHD planner roundup](https://toolfinder.co/best/adhd-planner-apps)
- **Tab managers**
  - **Tab Wrangler:** free, closes tabs you haven't touched.
  - **OneTab:** squashes all tabs into one list.
  - **Toby:** visual boards. The free plan is capped.
  - **Workona:** a tab set per project.
  - Or use the browser's own tools: Zen workspaces, Vivaldi stacks, tab groups.
  - Source: [Tab manager comparison (by a competitor)](https://supasidebar.com/blog/best-tab-manager-extension-chrome-2026)
- **Ambient sound**
  - **Brain.fm** has an ADHD mode. The latest price seen is $99.99 a year (check). It's backed by limited research.
  - **Endel:** sound that adapts to time and weather.
  - **Noisli:** mix your own rain, café or noise.
  - Sources:
    - [Brain.fm review](https://neurolaunch.com/brain-fm-review/)
    - [Alternatives](https://toolfinder.co/alternatives/brain-fm)
- **Menu bar and dock (Mac)**
  - **Bartender 6** (for Tahoe) / **Bartender 7** (for Golden Gate)
    - Paid, one-time; the price didn't load on the maker's page, so check.
    - People reported lag on Tahoe.
  - **Ice:** free, open source, macOS 14+. Hides icons and tints the menu bar (solid or gradient, rounded shapes). Tahoe support is still in beta builds.
  - **Thaw:** newer free option made for Tahoe. Beta.
  - **DockDoor:** free Dock previews.
  - Sources:
    - [Bartender purchase page](https://www.macbartender.com/purchase.html)
    - [Bartender on Tahoe](https://heise.de/-11167978)
    - [Ice](https://github.com/jordanbaird/Ice)
    - [Thaw](https://github.com/thaw-app/Thaw)
- **Taskbar and dock (Windows):** Seelen UI dock, Windhawk Taskbar Styler, TranslucentTB.
- **Distraction "off switch":** Vivaldi Break Mode, the Momentum Plus site blocker, Session's app blocking.

---

## 5. TOP 5 RECOMMENDATIONS (fun + custom + works well + low setup)

1. **Zen browser** (Mac + Windows, free)
   - Fixes the top bar: tabs on the side, compact mode, a colour per workspace, one-click mods.
   - The closest thing to Arc now that Arc is closing.
   - Setup: install, import from Chrome, pick 3–4 mods.
   - Want maximum "fun" (sounds, music, live wallpaper) instead? **Opera GX**.
2. **Our own animated APEX / PEPTICITY start page** (built by us, installed once)
   - Every new tab shows his brand, his 3 tasks for today, a focus timer and one-click tiles to his dashboards.
   - Works in Zen, Chrome, Edge and the rest. One sample first.
3. **Sliding windows**
   - **Mac: Loop** (free). Radial flick menu plus windows stashed on screen edges that slide out.
   - **Windows: Windhawk + Slick Window Arrangement** (free). Windows glide and snap. Add Taskbar Styler for the look.
4. **Live branded desktop**
   - **Mac: Plash** (free), with our start page as the moving wallpaper. Add **DockDoor**.
   - **Windows: Lively Wallpaper + TranslucentTB** (free).
   - Bigger Windows makeover later: **Seelen UI** (dock, themes, animated desktops).
5. **One focus layer**
   - **Windows Focus sessions** (built in, free) or **Session** on Mac.
   - Add **Tiimo** if he wants a visual day plan.

---

## DECISIONS FOR THE OWNER (multiple choice)

- **Q1. Which computer?** A) Mac (Recommended to confirm first) · B) Windows · C) Both
- **Q2. Browser feel?** A) Zen: clean, Arc-like (Recommended) · B) Opera GX: loud fun, sounds and music · C) Vivaldi: every setting there is
- **Q3. Build the branded start page?** A) Yes, show one sample first (Recommended) · B) Use Bonjourr for now · C) Use Momentum Plus for now
- **Q4. Window motion?** A) Loop / Windhawk glide, safe and free (Recommended) · B) Full tiling makeover (Seelen UI) · C) Leave windows as they are
