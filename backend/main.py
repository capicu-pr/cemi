"""CEMI backend API: auth, runs, ingestion (cloud path)."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes import router as api_router
from backend.ingestion import router as ingestion_router
from backend.metrics_stream import router as metrics_stream_router

app = FastAPI(title="CEMI API", version="0.1.2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(ingestion_router)
app.include_router(metrics_stream_router)


@app.get("/api/health")
async def health() -> dict[str, str]:
    """Simple healthcheck endpoint for the cloud backend."""
    return {"status": "ok", "mode": "remote"}


@app.get("/health")
async def root_health() -> dict[str, str]:
    """Alias healthcheck without /api prefix for infra checks."""
    return {"status": "ok", "mode": "remote"}
