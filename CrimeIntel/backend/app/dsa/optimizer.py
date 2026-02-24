"""
DSA Optimizer — Algorithmic utilities for efficient data operations.

All public functions include time-complexity annotations.
"""
import heapq
from bisect import bisect_left, bisect_right
from collections import Counter, defaultdict
from datetime import datetime, timedelta


# ═════════════════════════════════════════════════════════════════════════════
#  BINARY SEARCH — Date Range Filtering
# ═════════════════════════════════════════════════════════════════════════════

def filter_by_date_range(
    crimes: list[dict], start_date: str, end_date: str
) -> list[dict]:
    """
    Filter crimes within [start_date, end_date] using binary search.
    Assumes `crimes` is sorted by the 'date' field (ISO format strings).

    Time complexity: O(log n + k), where n = total crimes, k = result size.
    """
    dates = [c["date"] for c in crimes]
    lo = bisect_left(dates, start_date)
    hi = bisect_right(dates, end_date)
    return crimes[lo:hi]


# ═════════════════════════════════════════════════════════════════════════════
#  MIN-HEAP — Top K Dangerous Districts
# ═════════════════════════════════════════════════════════════════════════════

def top_k_dangerous_districts(crimes: list[dict], k: int = 5) -> list[dict]:
    """
    Return top k districts by crime count using a min-heap.

    Time complexity: O(n + d log k), where n = crimes counted, d = unique districts.
    """
    # Count crimes per district — O(n)
    counter: dict[str, int] = defaultdict(int)
    for crime in crimes:
        dist = crime.get("district", "")
        if dist:
            counter[dist] += 1

    # Use nlargest with a heap — O(d log k)
    top = heapq.nlargest(k, counter.items(), key=lambda x: x[1])
    return [{"district": d, "count": c} for d, c in top]


# ═════════════════════════════════════════════════════════════════════════════
#  SLIDING WINDOW — Moving Averages
# ═════════════════════════════════════════════════════════════════════════════

def moving_average(daily_counts: list[int], window: int = 7) -> list[float]:
    """
    Calculate moving average over a list of daily counts using sliding window.

    Time complexity: O(n), where n = len(daily_counts).
    Space complexity: O(n) for output.
    """
    if len(daily_counts) < window:
        return [sum(daily_counts) / len(daily_counts)] if daily_counts else []

    result: list[float] = []
    window_sum = sum(daily_counts[:window])
    result.append(window_sum / window)

    for i in range(window, len(daily_counts)):
        window_sum += daily_counts[i] - daily_counts[i - window]
        result.append(window_sum / window)

    return result


# ═════════════════════════════════════════════════════════════════════════════
#  PREFIX SUMS — Cumulative Trend
# ═════════════════════════════════════════════════════════════════════════════

def build_prefix_sums(daily_counts: list[int]) -> list[int]:
    """
    Build prefix sum array for O(1) range-sum queries.

    Time complexity: O(n) build.
    Query any range [i, j] total = prefix[j+1] - prefix[i] in O(1).
    """
    prefix = [0] * (len(daily_counts) + 1)
    for i, val in enumerate(daily_counts):
        prefix[i + 1] = prefix[i] + val
    return prefix


def range_sum(prefix: list[int], i: int, j: int) -> int:
    """
    Sum of elements in [i, j] inclusive. O(1).
    """
    return prefix[j + 1] - prefix[i]


# ═════════════════════════════════════════════════════════════════════════════
#  FIXED ARRAY — Peak Hour Detection
# ═════════════════════════════════════════════════════════════════════════════

def peak_hours(crimes: list[dict]) -> list[dict]:
    """
    Count crimes per hour of day using a fixed 24-element array.

    Time complexity: O(n) build, O(1) per query.
    Returns list of {hour, count} sorted by count descending.
    """
    freq = [0] * 24
    for crime in crimes:
        h = crime.get("hour")
        if h is not None and 0 <= h < 24:
            freq[h] += 1

    result = [{"hour": h, "count": freq[h]} for h in range(24)]
    result.sort(key=lambda x: x["count"], reverse=True)
    return result


# ═════════════════════════════════════════════════════════════════════════════
#  AGGREGATIONS
# ═════════════════════════════════════════════════════════════════════════════

def group_by_type(crimes: list[dict]) -> list[dict]:
    """
    Group crimes by primary_type and count.
    Time complexity: O(n).
    """
    counter = Counter(c.get("primary_type", "UNKNOWN") for c in crimes)
    return [{"type": t, "count": c} for t, c in counter.most_common()]


def group_by_district(crimes: list[dict]) -> list[dict]:
    """
    Group crimes by district and count.
    Time complexity: O(n).
    """
    counter = Counter(c.get("district", "") for c in crimes if c.get("district"))
    return [{"district": d, "count": c} for d, c in counter.most_common()]


def daily_counts_from_crimes(crimes: list[dict], days: int = 180) -> tuple[list[str], list[int]]:
    """
    Build a contiguous day-by-day count array for the last `days` days.
    Time complexity: O(n + days).

    Returns (dates_list, counts_list).
    """
    now = datetime.utcnow()
    start = now - timedelta(days=days)
    start_str = start.strftime("%Y-%m-%d")

    day_counter: dict[str, int] = defaultdict(int)
    for crime in crimes:
        d = crime.get("date", "")[:10]  # YYYY-MM-DD
        if d >= start_str:
            day_counter[d] += 1

    dates: list[str] = []
    counts: list[int] = []
    current = start
    for _ in range(days):
        ds = current.strftime("%Y-%m-%d")
        dates.append(ds)
        counts.append(day_counter.get(ds, 0))
        current += timedelta(days=1)

    return dates, counts


def compute_trend(crimes: list[dict], interval: str = "day") -> list[dict]:
    """
    Compute crime trend (count per day or month).
    Time complexity: O(n).
    """
    counter: dict[str, int] = defaultdict(int)
    for crime in crimes:
        d = crime.get("date", "")
        if interval == "month":
            key = d[:7]   # YYYY-MM
        else:
            key = d[:10]  # YYYY-MM-DD
        if key:
            counter[key] += 1

    items = sorted(counter.items())
    return [{"date": k, "count": v} for k, v in items]


def detect_anomalies(crimes: list[dict], z_threshold: float = 2.0) -> list[dict]:
    """
    Detect anomalous days where crime count deviates significantly from mean.
    Uses z-score approach.
    Time complexity: O(n + days).
    """
    _, counts = daily_counts_from_crimes(crimes, days=90)
    if not counts:
        return []

    mean = sum(counts) / len(counts)
    variance = sum((c - mean) ** 2 for c in counts) / len(counts)
    std = variance ** 0.5 if variance > 0 else 1.0

    now = datetime.utcnow()
    start = now - timedelta(days=90)

    anomalies = []
    for i, count in enumerate(counts):
        z = (count - mean) / std
        if abs(z) >= z_threshold:
            day = (start + timedelta(days=i)).strftime("%Y-%m-%d")
            anomalies.append({
                "date": day,
                "count": count,
                "z_score": round(z, 2),
                "type": "spike" if z > 0 else "drop",
            })

    return anomalies
