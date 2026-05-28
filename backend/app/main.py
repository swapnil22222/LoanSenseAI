"""
LoanSense AI - FastAPI Application Entry Point

Initializes the app with:
- CORS middleware for frontend (localhost:5173)
- Lifespan context manager for Spark + ML model initialization
- All API routers
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import init_db
from app.routes import eligibility, emi, comparison, financial_health, recommendations, analytics, history


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup / shutdown lifecycle manager.

    On startup:
    1. Initialize database tables
    2. Pre-load the ML model into memory
    3. Attempt to initialize SparkSession (non-blocking)

    On shutdown:
    1. Stop SparkSession if active
    """
    # --- STARTUP ---
    print("🚀 Starting LoanSense AI Backend...")

    # 1. Initialize database
    init_db()
    print("✅ Database initialized")

    # 2. Pre-load ML model
    try:
        from app.ml.predict import load_model
        load_model()
        print("✅ ML model loaded")
    except FileNotFoundError:
        print("⚠️  ML model not found. Run 'python -m app.ml.train' to train.")
    except Exception as e:
        print(f"⚠️  ML model load error: {e}")

    # 3. Try to initialize Spark (non-blocking)
    spark_session = None
    try:
        from app.spark_jobs.spark_etl import get_spark_session
        spark_session = get_spark_session()
        if spark_session:
            print("✅ SparkSession initialized (local mode)")
        else:
            print("ℹ️  Spark not available, using pandas fallback")
    except Exception as e:
        print(f"ℹ️  Spark init skipped: {e}")

    yield

    # --- SHUTDOWN ---
    print("🛑 Shutting down LoanSense AI Backend...")
    if spark_session:
        try:
            spark_session.stop()
            print("✅ SparkSession stopped")
        except Exception:
            pass


# Create FastAPI app
app = FastAPI(
    title="LoanSense AI",
    description="AI-powered loan eligibility prediction platform with financial analytics",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(eligibility.router)
app.include_router(emi.router)
app.include_router(comparison.router)
app.include_router(financial_health.router)
app.include_router(recommendations.router)
app.include_router(analytics.router)
app.include_router(history.router)


@app.get("/", tags=["Root"])
def root():
    """Health check / API info endpoint."""
    return {
        "name": "LoanSense AI",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": [
            "POST /predict",
            "POST /emi",
            "POST /loan-compare",
            "POST /financial-health",
            "POST /credit-improvement",
            "GET /analytics/overview",
            "GET /analytics/spark-stats",
            "GET /history",
            "GET /history/{id}",
        ],
    }


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    """Dummy favicon endpoint to prevent 404 errors in browser."""
    from fastapi.responses import Response
    return Response(content=b"", media_type="image/x-icon")

