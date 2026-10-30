# APEX 360 START: INSTALL

This folder is the whole extension: `manifest.json`, `index.html`, `start.css`, `start.js` and `assets/`.
It replaces the browser's new tab. Nothing is sent anywhere. Your 3 things, tiles, colour and timer are saved on that computer only.

## ZEN (MAC AND WINDOWS): TRY IT NOW
Zen is built on Firefox, so the steps are the same on Mac and Windows.
- Copy the `extension` folder onto the computer (Desktop is fine).
- Open Zen and type `about:debugging#/runtime/this-firefox` in the address bar, then press Enter.
- Click **Load Temporary Add-on…**
- Open the `extension` folder and pick **manifest.json**.
- Open a new tab (Cmd+T on Mac, Ctrl+T on Windows). The APEX 360 start page shows.
- If Zen asks whether to keep the new tab change, choose **Keep changes**.
- Note: a temporary add-on is removed when Zen restarts. Your saved items stay, because the add-on ID is fixed.

## ZEN: KEEP IT FOR GOOD
Zen (like normal Firefox) only keeps add-ons that Mozilla has signed. Signing is free and can stay private.
- Zip the **contents** of the `extension` folder (manifest.json must be at the top of the zip, not inside a subfolder).
- Go to addons.mozilla.org/developers, sign in, choose **Submit a New Add-on**, then **On your own** (unlisted, so nobody else sees it).
- Upload the zip. Mozilla checks it automatically and gives back a signed `.xpi` file.
- Drag the `.xpi` file into a Zen window and click **Add**.
- Do the same on the Windows computer with the same `.xpi`.

## CHROME (OR EDGE, BRAVE, ARC, VIVALDI)
- Copy the `extension` folder onto the computer.
- Chrome: open `chrome://extensions`. Edge: open `edge://extensions`.
- Turn on **Developer mode** (top right in Chrome, left side in Edge).
- Click **Load unpacked** and choose the `extension` folder.
- Open a new tab. If Chrome asks "Change back to Google?", click **Keep it**.
- It stays installed after a restart. To update, replace the files and click the reload arrow on the extension card.
- Chrome may show a small note about `browser_specific_settings`. That line is only for Zen and Firefox and is safe to ignore.

## GOOD TO KNOW
- Only one new-tab extension can win. Remove Momentum, Bonjourr or similar first.
- It does not show in private or incognito windows.
- The browser puts the cursor in the address bar on a new tab. Click the page once (or press Tab) and the shortcuts work.
- Shortcuts: `/` search, `T` start or pause the timer, `1` `2` `3` tick a thing, `Esc` close.
- SETTINGS (top right): your name, search engine, 12 or 24 hour clock, focus and break minutes, the chime, the moving smoke, reset tiles.
- The timer keeps running across tabs. The tab title shows the time left.
