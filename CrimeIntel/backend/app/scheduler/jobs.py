"""
Background scheduler for periodic data fetching and ML retraining.
"""
import logging

from apscheduler.schedulers.background import BackgroundScheduler

from app.config import FETCH_INTERVAL_SECONDS, RETRAIN_INTERVAL_SECONDS
from app.ml import risk_model
from app.services import data_service

logger = logging.getLogger(__name__)

_scheduler: BackgroundScheduler | None = None


def _fetch_job() -> None:
    """Periodic incremental data fetch."""
    try:
        data_service.incremental_update()
    except Exception as e:
        logger.error("Scheduled fetch failed: %s", e)


def _retrain_job() -> None:
    """Periodic ML model retraining."""
    try:
        crimes = data_service.get_all_crimes()
        if crimes:
            risk_model.train(crimes)
    except Exception as e:
        logger.error("Scheduled retrain failed: %s", e)


def start() -> None:
    """Start the background scheduler."""
    global _scheduler
    _scheduler = BackgroundScheduler()

    _scheduler.add_job(
        _fetch_job,
        "interval",
        seconds=FETCH_INTERVAL_SECONDS,
        id="incremental_fetch",
        name="Incremental crime data fetch",
    )

    _scheduler.add_job(
        _retrain_job,
        "interval",
        seconds=RETRAIN_INTERVAL_SECONDS,
        id="ml_retrain",
        name="ML model retrain",
    )

    _scheduler.start()
    logger.info(
        "Scheduler started — fetch every %ds, retrain every %ds",
        FETCH_INTERVAL_SECONDS,
        RETRAIN_INTERVAL_SECONDS,
    )


def stop() -> None:
    """Shutdown the scheduler gracefully."""
    global _scheduler
    if _scheduler:
        _scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")
