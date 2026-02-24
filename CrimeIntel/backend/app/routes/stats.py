"""
Stats routes — /stats endpoints.
"""
from fastapi import APIRouter, Query

from app.dsa.optimizer import (
    compute_trend,
    detect_anomalies,
    group_by_district,
    group_by_type,
    peak_hours,
    top_k_dangerous_districts,
)
from app.services import data_service

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("/by-type")
def stats_by_type():
    """Crime count grouped by type. O(n)."""
    return group_by_type(data_service.get_all_crimes())


@router.get("/by-district")
def stats_by_district():
    """Crime count grouped by district. O(n)."""
    return group_by_district(data_service.get_all_crimes())


@router.get("/trend")
def stats_trend(interval: str = Query("day", regex="^(day|month)$")):
    """Crime count trend by day or month. O(n)."""
    return compute_trend(data_service.get_all_crimes(), interval)


@router.get("/top-dangerous")
def stats_top_dangerous(k: int = Query(5, ge=1, le=30)):
    """Top k dangerous districts using min-heap. O(n + d log k)."""
    return top_k_dangerous_districts(data_service.get_all_crimes(), k)


@router.get("/peak-hours")
def stats_peak_hours():
    """Crime count per hour of day. O(n) build, O(1) query."""
    return peak_hours(data_service.get_all_crimes())


@router.get("/anomalies")
def stats_anomalies(z: float = Query(2.0, ge=1.0, le=5.0)):
    """Detect anomalous crime days using z-score. O(n)."""
    return detect_anomalies(data_service.get_all_crimes(), z)
