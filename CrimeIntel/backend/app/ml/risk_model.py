"""
ML Risk Model — District-level crime risk scoring.

Target: predicted crime count for next 7 days per district.
Uses Ridge regression from scikit-learn for speed.
"""
import logging
from collections import defaultdict
from datetime import datetime, timedelta

import numpy as np
from sklearn.linear_model import Ridge

logger = logging.getLogger(__name__)

# Violent crime types for weighted scoring
VIOLENT_TYPES = frozenset({
    "HOMICIDE", "ASSAULT", "BATTERY", "ROBBERY",
    "CRIM SEXUAL ASSAULT", "KIDNAPPING", "HUMAN TRAFFICKING",
})

# Trained model state
_model: Ridge | None = None
_district_features: dict[str, dict] = {}
_risk_scores: list[dict] = []


def _extract_features(crimes: list[dict]) -> dict[str, dict]:
    """
    Build feature vectors per district from crime data.
    Time complexity: O(n) where n = len(crimes).

    Features per district:
      - last_7_days: crime count in trailing 7 days
      - last_30_days: crime count in trailing 30 days
      - growth_rate: (last_7 - prev_7) / max(prev_7, 1)
      - violent_weight: ratio of violent crimes
      - peak_hour_factor: fraction of crimes in top-3 hours vs total
    """
    now = datetime.utcnow()
    d7 = (now - timedelta(days=7)).isoformat()
    d14 = (now - timedelta(days=14)).isoformat()
    d30 = (now - timedelta(days=30)).isoformat()

    district_data: dict[str, dict] = defaultdict(lambda: {
        "last_7": 0, "prev_7": 0, "last_30": 0,
        "violent": 0, "total": 0, "hours": [0] * 24,
    })

    for crime in crimes:
        dist = crime.get("district", "")
        if not dist:
            continue
        date = crime.get("date", "")
        dd = district_data[dist]

        if date >= d30:
            dd["last_30"] += 1
            dd["total"] += 1

            if crime.get("primary_type", "") in VIOLENT_TYPES:
                dd["violent"] += 1

            h = crime.get("hour")
            if h is not None:
                dd["hours"][h] += 1

            if date >= d7:
                dd["last_7"] += 1
            elif date >= d14:
                dd["prev_7"] += 1

    features: dict[str, dict] = {}
    for dist, dd in district_data.items():
        total = max(dd["total"], 1)
        prev_7 = max(dd["prev_7"], 1)

        # Peak hour factor: fraction of crimes in top-3 hours
        sorted_hours = sorted(dd["hours"], reverse=True)
        top3 = sum(sorted_hours[:3])
        peak_factor = top3 / total if total else 0

        features[dist] = {
            "last_7_days": dd["last_7"],
            "last_30_days": dd["last_30"],
            "growth_rate": (dd["last_7"] - dd["prev_7"]) / prev_7,
            "violent_weight": dd["violent"] / total,
            "peak_hour_factor": peak_factor,
        }

    return features


def _build_training_data(crimes: list[dict]) -> tuple[np.ndarray, np.ndarray, list[str]]:
    """
    Build X, y matrices using rolling 7-day windows over last 6 months.
    Each sample: features for a district in a 30-day window → target = next 7-day count.

    Time complexity: O(n * windows) ≈ O(n) for bounded window count.
    """
    now = datetime.utcnow()
    # Group by district and date
    dist_day: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    for crime in crimes:
        dist = crime.get("district", "")
        if not dist:
            continue
        d = crime.get("date", "")[:10]
        if d:
            dist_day[dist][d] += 1

    X_rows = []
    y_rows = []
    district_labels = []

    # Create rolling windows — step every 7 days
    for dist, day_counts in dist_day.items():
        for offset in range(0, 150, 7):  # ~5 months of windows
            window_end = now - timedelta(days=offset + 7)
            window_start = window_end - timedelta(days=30)
            target_end = now - timedelta(days=offset)

            # Count crimes in the 30-day feature window
            last_30 = 0
            last_7 = 0
            prev_7 = 0
            violent = 0
            total = 0
            hours = [0] * 24

            for crime in crimes:
                if crime.get("district") != dist:
                    continue
                cd = crime.get("date", "")[:10]
                if not cd:
                    continue
                ws = window_start.strftime("%Y-%m-%d")
                we = window_end.strftime("%Y-%m-%d")
                if ws <= cd <= we:
                    last_30 += 1
                    total += 1
                    d7s = (window_end - timedelta(days=7)).strftime("%Y-%m-%d")
                    d14s = (window_end - timedelta(days=14)).strftime("%Y-%m-%d")
                    if cd >= d7s:
                        last_7 += 1
                    elif cd >= d14s:
                        prev_7 += 1

            if total < 5:
                continue

            prev_7 = max(prev_7, 1)

            # Target: crimes in the next 7 days after window_end
            target_count = 0
            te = target_end.strftime("%Y-%m-%d")
            we_str = window_end.strftime("%Y-%m-%d")
            for d, c in day_counts.items():
                if we_str < d <= te:
                    target_count += c

            X_rows.append([
                last_7,
                last_30,
                (last_7 - prev_7) / prev_7,
                0.3,   # simplified violent weight placeholder
                0.15,  # simplified peak hour placeholder
            ])
            y_rows.append(target_count)
            district_labels.append(dist)

    if not X_rows:
        return np.array([]), np.array([]), []

    return np.array(X_rows), np.array(y_rows), district_labels


def train(crimes: list[dict]) -> None:
    """
    Train the Ridge regression model.
    Target: < 3 seconds training time.
    """
    global _model, _district_features, _risk_scores

    import time
    start = time.time()

    _district_features = _extract_features(crimes)

    if len(_district_features) < 2:
        logger.warning("Not enough district data to train ML model")
        return

    # Build quick training data using feature vectors for prediction
    districts = list(_district_features.keys())
    X = []
    for dist in districts:
        f = _district_features[dist]
        X.append([
            f["last_7_days"],
            f["last_30_days"],
            f["growth_rate"],
            f["violent_weight"],
            f["peak_hour_factor"],
        ])

    X = np.array(X)
    # Use last_7_days as proxy target for training (self-supervised bootstrap)
    # In production, use rolling windows target but for speed we use this heuristic
    y = X[:, 0].copy()  # last_7_days as self-target for initial model

    # Try rolling window if enough data
    X_train, y_train, labels = _build_training_data(crimes)
    if len(X_train) > 10:
        _model = Ridge(alpha=1.0)
        _model.fit(X_train, y_train)
        logger.info("Trained ML model on %d rolling-window samples", len(X_train))
    elif len(X) > 2:
        _model = Ridge(alpha=1.0)
        _model.fit(X, y)
        logger.info("Trained ML model on %d district feature samples (bootstrap)", len(X))
    else:
        logger.warning("Insufficient data to train ML model")
        _model = None

    # Generate predictions + risk scores
    _risk_scores = []
    if _model is not None:
        predictions = _model.predict(X)
        max_pred = max(predictions) if max(predictions) > 0 else 1

        for i, dist in enumerate(districts):
            pred = max(0, predictions[i])
            score = min(100, int((pred / max_pred) * 100))
            f = _district_features[dist]
            trend = "increasing" if f["growth_rate"] > 0.05 else (
                "decreasing" if f["growth_rate"] < -0.05 else "stable"
            )
            _risk_scores.append({
                "district": dist,
                "predicted_next_week": round(pred, 1),
                "risk_score": score,
                "trend": trend,
                "features": f,
            })

        _risk_scores.sort(key=lambda x: x["risk_score"], reverse=True)

    elapsed = time.time() - start
    logger.info("ML training completed in %.2fs", elapsed)


def get_risk_scores() -> list[dict]:
    """Return all district risk scores, sorted descending."""
    return _risk_scores


def get_risk_score(district: str) -> dict | None:
    """Return risk score for a specific district. O(k) where k = districts."""
    for rs in _risk_scores:
        if rs["district"] == district:
            return rs
    return None


def get_explanation(district: str) -> dict | None:
    """Return feature explanation for a district's risk score."""
    rs = get_risk_score(district)
    if not rs:
        return None

    f = rs.get("features", {})
    explanations = []

    if f.get("growth_rate", 0) > 0.1:
        explanations.append(
            f"Crime is increasing — {f['growth_rate']:.0%} growth vs previous week."
        )
    elif f.get("growth_rate", 0) < -0.1:
        explanations.append(
            f"Crime is decreasing — {abs(f['growth_rate']):.0%} reduction vs previous week."
        )

    if f.get("violent_weight", 0) > 0.3:
        explanations.append(
            f"High violent crime ratio: {f['violent_weight']:.0%} of all crimes."
        )

    if f.get("peak_hour_factor", 0) > 0.25:
        explanations.append(
            "Crime is heavily concentrated in a few peak hours."
        )

    return {
        "district": district,
        "risk_score": rs["risk_score"],
        "predicted_next_week": rs["predicted_next_week"],
        "trend": rs["trend"],
        "features": f,
        "explanations": explanations,
    }
