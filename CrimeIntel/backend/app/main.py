"""
Chicago Crime Intelligence — FastAPI entry point.

Startup:
  1. Load (or bulk-fetch) crime data into memory.
  2. Build in-memory indexes.
  3. Train ML risk model.
  4. Start background scheduler for incremental updates + retraining.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.ml import risk_model
from app.routes import crimes, ml, stats
from app.scheduler import jobs
from app.services import data_service

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    logger.info("🚀 Starting Chicago Crime Intelligence …")

    # 1. Load / fetch data
    data_service.initialize()

    # 2. Train ML model
    all_crimes = data_service.get_all_crimes()
    if all_crimes:
        risk_model.train(all_crimes)

    # 3. Start scheduler
    jobs.start()

    logger.info("✅ Application ready")
    yield

    # Shutdown
    jobs.stop()
    logger.info("👋 Shutting down")


# ── FastAPI app ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Chicago Crime Intelligence",
    description="Real-time analytics & predictive insights for Chicago crime data",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ───────────────────────────────────────────────────────────────────
app.include_router(crimes.router)
app.include_router(stats.router)
app.include_router(ml.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "Chicago Crime Intelligence",
        "status": "operational",
        "total_records": len(data_service.get_all_crimes()),
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
