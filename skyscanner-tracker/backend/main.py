import threading
from datetime import datetime

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import db
import export as export_mod
from scraper import scrape_flights

app = FastAPI(title="Skyscanner Flight Tracker (personal use)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

db.init_db()

# --- Simple self-imposed rate limiting (see mitigation plan) ---
MIN_SECONDS_BETWEEN_SCRAPES = 60
MAX_LIVE_SCRAPES_PER_DAY = 30
CACHE_TTL_HOURS = 6

_scrape_lock = threading.Lock()


class SearchRequest(BaseModel):
    origin: str
    destination: str
    travel_date: str  # YYYY-MM-DD


@app.post("/api/search")
def search(req: SearchRequest):
    cached = db.find_recent_search(req.origin, req.destination, req.travel_date, CACHE_TTL_HOURS)
    if cached:
        results = db.get_results_for_search(cached["id"])
        return {"search_id": cached["id"], "from_cache": True, "results": results,
                "origin_resolved": cached["origin_resolved"],
                "destination_resolved": cached["destination_resolved"]}

    if db.count_live_scrapes_today() >= MAX_LIVE_SCRAPES_PER_DAY:
        raise HTTPException(429, f"Daily live-scrape limit ({MAX_LIVE_SCRAPES_PER_DAY}) reached. Try again tomorrow.")

    last = db.last_live_scrape_time()
    if last and (datetime.now() - last).total_seconds() < MIN_SECONDS_BETWEEN_SCRAPES:
        wait = MIN_SECONDS_BETWEEN_SCRAPES - (datetime.now() - last).total_seconds()
        raise HTTPException(429, f"Please wait {int(wait)}s before the next search (rate limit).")

    if not _scrape_lock.acquire(blocking=False):
        raise HTTPException(429, "A search is already in progress, please wait.")
    try:
        origin_resolved, destination_resolved, flights = scrape_flights(
            req.origin, req.destination, req.travel_date
        )
    except RuntimeError as e:
        raise HTTPException(502, str(e))
    finally:
        _scrape_lock.release()

    search_id = db.create_search(
        req.origin, req.destination, req.travel_date,
        origin_resolved, destination_resolved, from_cache=False,
    )
    db.save_results(search_id, flights)
    results = db.get_results_for_search(search_id)
    return {"search_id": search_id, "from_cache": False, "results": results,
            "origin_resolved": origin_resolved, "destination_resolved": destination_resolved}


@app.get("/api/history")
def history(limit: int = 100):
    return db.list_history(limit)


@app.get("/api/search/{search_id}/results")
def search_results(search_id: int):
    s = db.get_search(search_id)
    if not s:
        raise HTTPException(404, "Search not found")
    return {"search": s, "results": db.get_results_for_search(search_id)}


@app.get("/api/compare")
def compare(search_ids: str = Query(..., description="comma-separated search ids")):
    ids = [int(i) for i in search_ids.split(",") if i.strip()]
    out = []
    for sid in ids:
        s = db.get_search(sid)
        if s:
            out.append({"search": s, "results": db.get_results_for_search(sid)})
    return out


def _joined_rows(search_ids=None):
    ids = search_ids or [s["id"] for s in db.list_history(limit=10000)]
    rows = []
    for sid in ids:
        s = db.get_search(sid)
        if not s:
            continue
        for r in db.get_results_for_search(sid):
            rows.append({**s, **r})
    return rows


@app.get("/api/export")
def export(search_ids: str | None = Query(None, description="comma-separated search ids, omit for all history")):
    ids = [int(i) for i in search_ids.split(",")] if search_ids else None
    rows = _joined_rows(ids)
    if not rows:
        raise HTTPException(404, "Nothing to export")
    path = export_mod.export_to_excel(rows)
    return FileResponse(
        path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=path.name,
    )


@app.post("/api/notes")
def add_note(search_id: int | None = None, result_id: int | None = None, note: str = ""):
    import sqlite3
    conn = db.get_conn()
    conn.execute(
        "INSERT INTO saved_notes (search_id, result_id, note, saved_at) VALUES (?, ?, ?, ?)",
        (search_id, result_id, note, datetime.now().isoformat(timespec="seconds")),
    )
    conn.commit()
    conn.close()
    return {"ok": True}


@app.get("/api/notes")
def list_notes():
    conn = db.get_conn()
    rows = conn.execute("SELECT * FROM saved_notes ORDER BY saved_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")
