"""
Crime routes — /crimes endpoints.
"""
from fastapi import APIRouter, Query

from app.dsa.optimizer import filter_by_date_range
from app.services import data_service

router = APIRouter(prefix="/crimes", tags=["Crimes"])


@router.get("")
def get_crimes(limit: int = Query(100, ge=1, le=5000)):
    """Return latest N crimes."""
    return data_service.get_crimes(limit)


@router.get("/latest")
def get_latest():
    """Return the 20 most recent crimes."""
    return data_service.get_latest(20)


@router.get("/filter")
def filter_crimes(
    type: str | None = Query(None),
    district: str | None = Query(None),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
    limit: int = Query(500, ge=1, le=5000),
):
    """
    Filter crimes by type, district, and/or date range.
    Date range uses binary search for O(log n + k) performance.
    """
    crimes = data_service.get_all_crimes()

    # Date range filter via binary search — O(log n + k)
    if start_date and end_date:
        crimes = filter_by_date_range(crimes, start_date, end_date)
    elif start_date:
        crimes = filter_by_date_range(crimes, start_date, "9999-12-31")
    elif end_date:
        crimes = filter_by_date_range(crimes, "0000-01-01", end_date)

    # Type filter — O(k)
    if type:
        crimes = [c for c in crimes if c.get("primary_type", "").upper() == type.upper()]

    # District filter — O(k)
    if district:
        crimes = [c for c in crimes if c.get("district") == district]

    return crimes[-limit:]


@router.get("/heatmap")
def get_heatmap(limit: int = Query(2000, ge=100, le=10000)):
    """Return lat/lng + intensity data for heatmap rendering."""
    crimes = data_service.get_all_crimes()
    points = []
    for crime in crimes[-limit:]:
        lat = crime.get("latitude")
        lng = crime.get("longitude")
        if lat and lng:
            points.append({"lat": lat, "lng": lng, "type": crime.get("primary_type", "")})
    return points


@router.get("/meta")
def get_meta():
    """Return available filter options."""
    return {
        "districts": sorted(data_service.get_districts()),
        "crime_types": sorted(data_service.get_crime_types()),
        "total_records": len(data_service.get_all_crimes()),
    }
