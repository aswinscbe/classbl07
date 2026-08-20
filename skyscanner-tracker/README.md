# Flight Tracker (personal use, Phase 1)

Local dashboard: search Skyscanner for a route/date, see prices + booking
links, and every search is saved to a local SQLite database so you can
compare past searches instead of noting prices down by hand. Export any
selection (or all history) to a fresh Excel file.

## Setup (run once)

```bash
cd skyscanner-tracker/backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
```

## Run

```bash
cd skyscanner-tracker/backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

Open **http://localhost:8000** in your browser (works fine on a phone too,
once you serve it over your home network instead of localhost - see
"Phone access" below).

## First run: expect to tune the scraper

I built `backend/scraper.py` without live access to skyscanner.net from my
build environment, so the CSS selectors it uses to find the search box,
autocomplete suggestions, date picker, and results cards are best-effort
guesses based on Skyscanner's known UI patterns - they will likely need a
short fix-up pass:

1. Run a search from the dashboard.
2. If it fails, check `backend/debug/` - it saves a screenshot and the
   page's HTML at the point of failure.
3. Open the HTML, find the actual attribute/class Skyscanner used for that
   element (e.g. inspect the price element in your browser's devtools),
   and update the matching selector in `scraper.py`. Each step is isolated
   (`_pick_autocomplete`, the date picker block, the results-card parsing
   loop) so fixes stay localized.

Send me the debug screenshot/HTML in a future session and I can update the
selectors for you directly.

## Built-in scraping safeguards

- **Cache**: the same route+date searched again within 6 hours returns the
  stored result instead of re-scraping (`CACHE_TTL_HOURS` in `main.py`).
- **Rate limit**: minimum 60s between live scrapes, max 30 live scrapes/day
  (`MIN_SECONDS_BETWEEN_SCRAPES`, `MAX_LIVE_SCRAPES_PER_DAY` in `main.py`).
- **Human-like pacing**: randomized typing/click delays, persistent browser
  profile (cookies carry over), one search at a time (no parallel scrapes).

Tune these constants in `main.py` if you want it stricter/looser.

## Data

Everything lives in `backend/flights.db` (SQLite, single file - back it up
or delete it to reset). Two tables: `searches` (one row per search you ran)
and `results` (one row per flight found in that search).

## Export to Excel

- "Export ALL history" - every stored search, fresh snapshot file each time.
- "Export selected" - just the searches you checked in History.
- Files land in `backend/exports/`, timestamped, never overwritten.

## Phone access (later step)

Phase 1 is local-only. When you want it on your phone: run
`uvicorn main:app --host 0.0.0.0 --port 8000` and open
`http://<your-laptop-lan-ip>:8000` from your phone on the same wifi, or set
up Tailscale for access away from home. Not needed to try Phase 1 out.
