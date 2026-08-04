# PGPBL07 Planner — rebuild

A clean rewrite of the class planner. Built from scratch to fix the root
cause of the old site's instability: functions and CSS rules that had been
redefined 2-4 times across months of incremental patches, with the *last*
definition silently winning. Every function and rule here is defined
exactly once.

## Files

| File | Purpose |
|---|---|
| `index.html` | **Today** page — live "happening now" / "up next" card, rest of today's classes, quick task add |
| `planner.html` | **Planner** page — tabs for Schedule (full list), Calendar, Tasks, Notes, Profile |
| `app.js` | Shared core: schedule fetching, date/time parsing, personal filtering, deterministic subject colors, dark mode |
| `tasks.js` | Local task list (localStorage) + Google Tasks OAuth sync, kept isolated so one failing doesn't break the other |
| `style.css` | Single stylesheet, plain/neutral design, light + dark mode |
| `manifest.webmanifest` | PWA metadata (installable) |
| `service-worker.js` | Simple network-first cache, one version constant — bump `CACHE` on future deploys, nothing else |

## What's preserved from the old site
- Schedule fetched from the same Google Apps Script endpoint
- Profile setup (name, roll, section, electives)
- Personal filtering: Core classes by section, Electives by your picks
- "Happening now" / "Up next" live detection
- Full schedule list + Calendar view
- Notes
- Local tasks + Google Tasks sync (same OAuth Client ID as before, so no
  reconfiguration needed in Google Cloud Console)
- Dark mode
- Installable PWA shell

## What's fixed structurally
- **Subject colors are no longer hardcoded per-code.** `subjectColor()` in
  `app.js` derives a stable color from the code itself via a hash function.
  If the sheet renames a subject code again (like the NWW → NWLB case),
  colors keep working automatically — nothing to update.
- **Date/time parsing is defensive.** `normDate()` tries a fast path then
  falls back to regex extraction; `normTime()` handles the sheet's
  inconsistent `.`/`:` and spacing. Verified against the actual sheet's
  real format (`"Tuesday, 4 August, 2026"`, `"9.15 -10.30"`).
- **No duplicate function/style definitions.** If something needs to
  change, edit the one place it's defined — there's no "which version
  actually runs" ambiguity anymore.

## Known limitation to be aware of
The NWLB/NWW-style mismatch can still happen at a different layer: if your
Google Apps Script's `availableElectives` list uses a different code than
what's actually written on the class rows in the sheet, the elective won't
match during filtering — that's a data problem upstream of this app, in
the Apps Script project, not something any frontend code can detect or fix.

## Deploying
Drop all files into your GitHub Pages branch root (same structure, no
build step needed — it's plain HTML/CSS/JS). No dependencies to install.
