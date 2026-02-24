"""
Application configuration.
Loads environment variables with sensible defaults.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# ── Socrata API ──────────────────────────────────────────────────────────────
SOCRATA_APP_TOKEN: str = os.getenv("SOCRATA_APP_TOKEN", "")
SOCRATA_DATASET_ID: str = "ijzp-q8t2"
SOCRATA_BASE_URL: str = f"https://data.cityofchicago.org/resource/{SOCRATA_DATASET_ID}.json"

# ── Data storage ─────────────────────────────────────────────────────────────
DATA_DIR: Path = Path(os.getenv("DATA_DIR", "./data"))
CRIMES_FILE: Path = DATA_DIR / "crimes.json"

# ── CORS ─────────────────────────────────────────────────────────────────────
CORS_ORIGINS: list[str] = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")

# ── Scheduler intervals (seconds) ───────────────────────────────────────────
FETCH_INTERVAL_SECONDS: int = 600        # 10 minutes
RETRAIN_INTERVAL_SECONDS: int = 86400    # 24 hours

# ── Data scope ───────────────────────────────────────────────────────────────
INITIAL_LOAD_MONTHS: int = 6             # Fetch last N months on first boot
BULK_FETCH_LIMIT: int = 50000            # Max rows per Socrata request
INCREMENTAL_FETCH_LIMIT: int = 5000
