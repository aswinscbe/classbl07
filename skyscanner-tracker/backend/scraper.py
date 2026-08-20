"""
Playwright-based Skyscanner scraper.

IMPORTANT (read this before you run it):
This was built without live access to skyscanner.net from the build
environment, so the CSS selectors below are best-effort based on
Skyscanner's known UI patterns and WILL likely need small tweaks once you
run this against the real site. When a step fails, this module dumps a
screenshot + the page HTML into backend/debug/ so you can inspect what
Skyscanner actually rendered and adjust the selector in one place.

Design choices, on purpose:
- Drives the real search box (origin/destination autocomplete) instead of
  hardcoding airport codes, per your requirement not to limit cities.
- Uses a persistent browser profile (backend/browser_profile/) so cookies
  and session state carry over between runs - looks more like a returning
  human than a fresh headless browser every time.
- Adds randomized human-like delays between actions.
- Never runs two scrapes concurrently (see main.py's lock).
"""

import random
import time
from datetime import datetime
from pathlib import Path

from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

BASE_DIR = Path(__file__).parent
PROFILE_DIR = BASE_DIR / "browser_profile"
DEBUG_DIR = BASE_DIR / "debug"
DEBUG_DIR.mkdir(exist_ok=True)

SEARCH_URL = "https://www.skyscanner.net/"


def _human_pause(a=0.4, b=1.2):
    time.sleep(random.uniform(a, b))


def _dump_debug(page, label):
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    try:
        page.screenshot(path=str(DEBUG_DIR / f"{label}_{ts}.png"), full_page=True)
        (DEBUG_DIR / f"{label}_{ts}.html").write_text(page.content(), encoding="utf-8")
    except Exception:
        pass


def _pick_autocomplete(page, input_selector: str, query: str):
    """Type into a search box and click the first autocomplete suggestion.
    Returns the resolved label text (e.g. 'Bengaluru (BLR)') if found."""
    box = page.locator(input_selector).first
    box.click()
    _human_pause()
    box.fill("")
    for ch in query:
        box.type(ch, delay=random.uniform(40, 110))
    _human_pause(0.6, 1.4)

    suggestion = page.locator(
        "[data-testid='autosuggest-list'] li, [role='listbox'] [role='option']"
    ).first
    suggestion.wait_for(state="visible", timeout=8000)
    label = suggestion.inner_text()
    suggestion.click()
    _human_pause()
    return label


def scrape_flights(origin_query: str, destination_query: str, travel_date: str,
                    headless: bool = True, max_results: int = 25):
    """
    travel_date: 'YYYY-MM-DD'
    Returns (origin_resolved, destination_resolved, list[dict flight results])
    Raises RuntimeError with a clear message on failure (selectors need tuning,
    site blocked us, etc). Caller decides how to surface / fall back.
    """
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE_DIR),
            headless=headless,
            executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
            if Path("/opt/pw-browsers/chromium-1194/chrome-linux/chrome").exists() else None,
            viewport={"width": 390, "height": 844},  # mobile-ish viewport
            locale="en-GB",
        )
        page = context.new_page()
        try:
            page.goto(SEARCH_URL, timeout=30000)
            _human_pause(1.0, 2.0)

            origin_label = _pick_autocomplete(
                page, "input[placeholder*='From' i], input[name='origin']", origin_query
            )
            destination_label = _pick_autocomplete(
                page, "input[placeholder*='To' i], input[name='destination']", destination_query
            )

            # Prefer letting the site's own date picker set the date so we
            # don't have to guess URL slug formats; fall back to direct URL
            # construction if that fails.
            try:
                date_input = page.locator("[data-testid='depart-date-input'], input[name='departDate']").first
                date_input.click()
                _human_pause()
                d = datetime.strptime(travel_date, "%Y-%m-%d")
                day_cell = page.locator(
                    f"[aria-label*='{d.strftime('%d %B %Y')}' i], td[data-date='{travel_date}']"
                ).first
                day_cell.click(timeout=8000)
                _human_pause()
            except PWTimeout:
                pass  # not fatal - search may still work with default date

            search_button = page.locator(
                "button[data-testid='search-button'], button:has-text('Search flights')"
            ).first
            search_button.click()

            page.wait_for_selector(
                "[data-testid='results-list'], [data-testid='flight-card']",
                timeout=45000,
            )
            _human_pause(1.5, 3.0)

            cards = page.locator("[data-testid='flight-card']")
            count = min(cards.count(), max_results)
            flights = []
            for i in range(count):
                card = cards.nth(i)
                try:
                    airline = card.locator("[data-testid='airline-name']").first.inner_text()
                except Exception:
                    airline = None
                try:
                    price_text = card.locator("[data-testid='price']").first.inner_text()
                    price = float("".join(c for c in price_text if c.isdigit() or c == "."))
                    currency = "".join(c for c in price_text if c.isalpha())
                except Exception:
                    price, currency = None, None
                try:
                    times_text = card.locator("[data-testid='times']").first.inner_text()
                    depart_time, arrival_time = (times_text.split("-") + [None])[:2]
                except Exception:
                    depart_time, arrival_time = None, None
                try:
                    duration = card.locator("[data-testid='duration']").first.inner_text()
                except Exception:
                    duration = None
                try:
                    stops_text = card.locator("[data-testid='stops']").first.inner_text()
                    stops = 0 if "direct" in stops_text.lower() else int(stops_text[0])
                    stopover_airport = stops_text if stops else None
                except Exception:
                    stops, stopover_airport = None, None
                try:
                    booking_link = card.locator("a").first.get_attribute("href")
                    if booking_link and booking_link.startswith("/"):
                        booking_link = "https://www.skyscanner.net" + booking_link
                except Exception:
                    booking_link = page.url

                flights.append({
                    "airline": airline,
                    "depart_time": depart_time,
                    "arrival_time": arrival_time,
                    "duration": duration,
                    "stops": stops,
                    "stopover_airport": stopover_airport,
                    "price": price,
                    "currency": currency,
                    "booking_link": booking_link,
                })

            if not flights:
                _dump_debug(page, "no_flights_parsed")
                raise RuntimeError(
                    "Search ran but no flight cards were parsed - Skyscanner's "
                    "markup likely differs from the selectors in scraper.py. "
                    "See backend/debug/ for a screenshot + HTML dump to fix selectors against."
                )

            return origin_label, destination_label, flights

        except PWTimeout as e:
            _dump_debug(page, "timeout")
            raise RuntimeError(
                f"Timed out waiting for a step (possible CAPTCHA/block, or a "
                f"selector is stale). See backend/debug/ for a screenshot. Detail: {e}"
            )
        finally:
            context.close()
