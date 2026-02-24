"""
Data Service — Heart of the backend.

Responsibilities:
- Bulk-load crime data from Chicago Open Data API on first startup.
- Incremental updates every 10 minutes.
- Maintain in-memory data + indexes for O(1)/O(log n) access.
- Thread-safe mutations with atomic JSON persistence.
"""
import json
import logging
import os
import threading
from datetime import datetime, timedelta
from pathlib import Path

import httpx

from app.config import (
    BULK_FETCH_LIMIT,
    CRIMES_FILE,
    DATA_DIR,
    INCREMENTAL_FETCH_LIMIT,
    INITIAL_LOAD_MONTHS,
    SOCRATA_APP_TOKEN,
    SOCRATA_BASE_URL,
)
from app.utils.helpers import normalize_record

logger = logging.getLogger(__name__)

# ── Thread lock for mutations ────────────────────────────────────────────────
_lock = threading.Lock()

# ── In-memory state ──────────────────────────────────────────────────────────
crimes: list[dict] = []
case_number_index: dict[str, int] = {}       # case_number → index in crimes list
district_index: dict[str, list[int]] = {}    # district → [indices]
type_index: dict[str, list[int]] = {}        # primary_type → [indices]


# ═════════════════════════════════════════════════════════════════════════════
#  INDEX MANAGEMENT
# ═════════════════════════════════════════════════════════════════════════════

def _rebuild_indexes() -> None:
    """
    Rebuild all in-memory indexes from the crimes list.
    Time complexity: O(n) where n = len(crimes).
    Must be called while _lock is held.
    """
    global case_number_index, district_index, type_index
    case_number_index = {}
    district_index = {}
    type_index = {}
    for i, crime in enumerate(crimes):
        cn = crime.get("case_number", "")
        case_number_index[cn] = i

        dist = crime.get("district", "")
        if dist:
            district_index.setdefault(dist, []).append(i)

        ptype = crime.get("primary_type", "")
        if ptype:
            type_index.setdefault(ptype, []).append(i)


def _append_and_index(records: list[dict]) -> int:
    """
    Append new (deduplicated) records to the crimes list and update indexes.
    Time complexity: O(k) where k = len(records).
    Must be called while _lock is held.
    Returns the number of actually appended records.
    """
    added = 0
    for rec in records:
        cn = rec.get("case_number", "")
        if cn in case_number_index:
            continue  # O(1) duplicate check
        idx = len(crimes)
        crimes.append(rec)
        case_number_index[cn] = idx

        dist = rec.get("district", "")
        if dist:
            district_index.setdefault(dist, []).append(idx)

        ptype = rec.get("primary_type", "")
        if ptype:
            type_index.setdefault(ptype, []).append(idx)

        added += 1
    return added


# ═════════════════════════════════════════════════════════════════════════════
#  PERSISTENCE
# ═════════════════════════════════════════════════════════════════════════════

def _save_to_disk() -> None:
    """
    Atomic write: write tmp → os.replace.
    Must be called while _lock is held.
    """
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp_path = CRIMES_FILE.with_suffix(".tmp.json")
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(crimes, f, separators=(",", ":"))  # compact JSON
    os.replace(str(tmp_path), str(CRIMES_FILE))
    logger.info("Persisted %d records to %s", len(crimes), CRIMES_FILE)


def _load_from_disk() -> bool:
    """
    Load crimes.json into memory and rebuild indexes.
    Returns True if data was loaded, False if file doesn't exist.
    """
    global crimes
    if not CRIMES_FILE.exists():
        return False
    with open(CRIMES_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list) or len(data) == 0:
        return False
    crimes = data
    # Sort by date to maintain sorted order — O(n log n)
    crimes.sort(key=lambda c: c.get("date", ""))
    _rebuild_indexes()
    logger.info("Loaded %d records from disk", len(crimes))
    return True


# ═════════════════════════════════════════════════════════════════════════════
#  SOCRATA FETCHING
# ═════════════════════════════════════════════════════════════════════════════

def _socrata_headers() -> dict:
    headers = {"Accept": "application/json"}
    if SOCRATA_APP_TOKEN:
        headers["X-App-Token"] = SOCRATA_APP_TOKEN
    return headers


def _fetch_from_socrata(where_clause: str, limit: int, offset: int = 0) -> list[dict]:
    """Fetch records from Socrata with SoQL where clause."""
    from urllib.parse import urlencode

    query = urlencode({
        "$where": where_clause,
        "$order": "date ASC",
        "$limit": str(limit),
        "$offset": str(offset),
    })
    url = f"{SOCRATA_BASE_URL}?{query}"
    try:
        with httpx.Client(timeout=60.0) as client:
            resp = client.get(url, headers=_socrata_headers())
            resp.raise_for_status()
            return resp.json()
    except Exception as e:
        logger.error("Socrata fetch error: %s", e)
        return []


def bulk_load() -> None:
    """
    Bulk-download the last INITIAL_LOAD_MONTHS of crime data.
    Called once on first startup when no crimes.json exists.
    Time complexity: O(n log n) for sorting after load.
    """
    start_date = (datetime.utcnow() - timedelta(days=INITIAL_LOAD_MONTHS * 30)).strftime(
        "%Y-%m-%dT00:00:00"
    )
    where = f"date > '{start_date}'"
    all_records: list[dict] = []
    offset = 0

    logger.info("Bulk loading crimes since %s …", start_date)
    while True:
        batch = _fetch_from_socrata(where, BULK_FETCH_LIMIT, offset)
        if not batch:
            break
        all_records.extend(batch)
        logger.info("  fetched %d (total %d)", len(batch), len(all_records))
        if len(batch) < BULK_FETCH_LIMIT:
            break
        offset += BULK_FETCH_LIMIT

    # Normalise
    normalised = []
    for raw in all_records:
        rec = normalize_record(raw)
        if rec:
            normalised.append(rec)

    normalised.sort(key=lambda c: c["date"])

    with _lock:
        global crimes
        crimes = normalised
        _rebuild_indexes()
        _save_to_disk()

    logger.info("Bulk load complete: %d records stored", len(crimes))


def incremental_update() -> None:
    """
    Fetch new crimes since last stored date.
    Deduplicates via case_number_index in O(1).
    Called every 10 minutes by the scheduler.
    """
    if not crimes:
        logger.warning("No existing data — running bulk load instead")
        bulk_load()
        return

    last_date = crimes[-1].get("date", "")
    if not last_date:
        return

    where = f"date > '{last_date}'"
    raw_batch = _fetch_from_socrata(where, INCREMENTAL_FETCH_LIMIT)

    normalised = []
    for raw in raw_batch:
        rec = normalize_record(raw)
        if rec:
            normalised.append(rec)

    if not normalised:
        logger.info("Incremental update: 0 new records")
        return

    normalised.sort(key=lambda c: c["date"])

    with _lock:
        added = _append_and_index(normalised)
        if added > 0:
            _save_to_disk()
        logger.info("Incremental update: %d new records added", added)


# ═════════════════════════════════════════════════════════════════════════════
#  STARTUP
# ═════════════════════════════════════════════════════════════════════════════

def initialize() -> None:
    """Called once at application startup."""
    loaded = _load_from_disk()
    if not loaded:
        bulk_load()
    logger.info(
        "Data service ready — %d crimes, %d districts, %d types",
        len(crimes),
        len(district_index),
        len(type_index),
    )


# ═════════════════════════════════════════════════════════════════════════════
#  READ HELPERS (lock-free, snapshot-safe)
# ═════════════════════════════════════════════════════════════════════════════

def get_crimes(limit: int = 100) -> list[dict]:
    """Return the latest `limit` crimes. O(limit)."""
    return crimes[-limit:]


def get_latest(n: int = 20) -> list[dict]:
    """Return very latest n crimes. O(n)."""
    return list(reversed(crimes[-n:]))


def get_all_crimes() -> list[dict]:
    """Return reference to full list (read-only by convention)."""
    return crimes


def get_districts() -> list[str]:
    return list(district_index.keys())


def get_crime_types() -> list[str]:
    return list(type_index.keys())
