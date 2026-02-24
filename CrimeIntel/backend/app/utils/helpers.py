"""
Shared utility functions.
"""
from datetime import datetime

DATE_FMT = "%Y-%m-%dT%H:%M:%S.%f"


def parse_date(date_str: str | None) -> datetime | None:
    """Parse a Socrata date string into a datetime object."""
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str.replace("Z", "+00:00").split("+")[0])
    except (ValueError, AttributeError):
        return None


def normalize_record(raw: dict) -> dict | None:
    """
    Normalise a raw Socrata record into a clean dict.
    Returns None if the record is unusable (missing key fields).
    """
    case = raw.get("case_number")
    date_str = raw.get("date")
    if not case or not date_str:
        return None

    dt = parse_date(date_str)
    if dt is None:
        return None

    return {
        "id": raw.get("id", ""),
        "case_number": case,
        "date": dt.isoformat(),
        "block": raw.get("block", ""),
        "iucr": raw.get("iucr", ""),
        "primary_type": raw.get("primary_type", "UNKNOWN"),
        "description": raw.get("description", ""),
        "location_description": raw.get("location_description", ""),
        "arrest": raw.get("arrest", False),
        "domestic": raw.get("domestic", False),
        "beat": raw.get("beat", ""),
        "district": raw.get("district", ""),
        "ward": raw.get("ward", ""),
        "community_area": raw.get("community_area", ""),
        "year": raw.get("year", ""),
        "latitude": float(raw["latitude"]) if raw.get("latitude") else None,
        "longitude": float(raw["longitude"]) if raw.get("longitude") else None,
        "hour": dt.hour,
    }
