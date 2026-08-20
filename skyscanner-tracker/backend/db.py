import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).parent / "flights.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    origin_query TEXT NOT NULL,
    destination_query TEXT NOT NULL,
    origin_resolved TEXT,
    destination_resolved TEXT,
    travel_date TEXT NOT NULL,
    searched_at TEXT NOT NULL,
    from_cache INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    search_id INTEGER NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
    airline TEXT,
    depart_time TEXT,
    arrival_time TEXT,
    duration TEXT,
    stops INTEGER,
    stopover_airport TEXT,
    price REAL,
    currency TEXT,
    booking_link TEXT
);

CREATE TABLE IF NOT EXISTS saved_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    search_id INTEGER REFERENCES searches(id) ON DELETE CASCADE,
    result_id INTEGER REFERENCES results(id) ON DELETE CASCADE,
    note TEXT,
    saved_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_results_search ON results(search_id);
CREATE INDEX IF NOT EXISTS idx_searches_route_date
    ON searches(origin_query, destination_query, travel_date);
"""


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_conn()
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()


def find_recent_search(origin: str, destination: str, travel_date: str, ttl_hours: int):
    conn = get_conn()
    row = conn.execute(
        """
        SELECT * FROM searches
        WHERE lower(origin_query) = lower(?)
          AND lower(destination_query) = lower(?)
          AND travel_date = ?
        ORDER BY searched_at DESC LIMIT 1
        """,
        (origin, destination, travel_date),
    ).fetchone()
    conn.close()
    if not row:
        return None
    searched_at = datetime.fromisoformat(row["searched_at"])
    age_hours = (datetime.now() - searched_at).total_seconds() / 3600
    if age_hours > ttl_hours:
        return None
    return row


def create_search(origin_query, destination_query, travel_date,
                   origin_resolved=None, destination_resolved=None, from_cache=False):
    conn = get_conn()
    cur = conn.execute(
        """
        INSERT INTO searches
            (origin_query, destination_query, origin_resolved, destination_resolved,
             travel_date, searched_at, from_cache)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (origin_query, destination_query, origin_resolved, destination_resolved,
         travel_date, datetime.now().isoformat(timespec="seconds"), int(from_cache)),
    )
    search_id = cur.lastrowid
    conn.commit()
    conn.close()
    return search_id


def save_results(search_id, flights: list[dict]):
    conn = get_conn()
    conn.executemany(
        """
        INSERT INTO results
            (search_id, airline, depart_time, arrival_time, duration,
             stops, stopover_airport, price, currency, booking_link)
        VALUES (:search_id, :airline, :depart_time, :arrival_time, :duration,
                :stops, :stopover_airport, :price, :currency, :booking_link)
        """,
        [{**f, "search_id": search_id} for f in flights],
    )
    conn.commit()
    conn.close()


def get_results_for_search(search_id):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM results WHERE search_id = ? ORDER BY price ASC", (search_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_search(search_id):
    conn = get_conn()
    row = conn.execute("SELECT * FROM searches WHERE id = ?", (search_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def list_history(limit=100):
    conn = get_conn()
    rows = conn.execute(
        """
        SELECT s.*, MIN(r.price) as min_price, COUNT(r.id) as num_results
        FROM searches s
        LEFT JOIN results r ON r.search_id = s.id
        GROUP BY s.id
        ORDER BY s.searched_at DESC
        LIMIT ?
        """,
        (limit,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def count_live_scrapes_today():
    conn = get_conn()
    today = datetime.now().date().isoformat()
    row = conn.execute(
        "SELECT COUNT(*) as c FROM searches WHERE from_cache = 0 AND date(searched_at) = ?",
        (today,),
    ).fetchone()
    conn.close()
    return row["c"]


def last_live_scrape_time():
    conn = get_conn()
    row = conn.execute(
        "SELECT searched_at FROM searches WHERE from_cache = 0 ORDER BY searched_at DESC LIMIT 1"
    ).fetchone()
    conn.close()
    return datetime.fromisoformat(row["searched_at"]) if row else None
