"""
Main entry point for EduPredict AI FastAPI Backend Application.
Uses modern async lifespan context manager.
Serves API routes under /api and mounts production frontend build when available.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.core.config import settings
from backend.app.api.endpoints import router as api_router
from backend.app.database.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure SQLite database schema is initialized
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Machine Learning Powered Student Final Marks Prediction System",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

# Mount frontend production build if present
frontend_dist_dir = os.path.abspath(os.path.join(settings.BASE_DIR, "..", "frontend", "dist"))
if os.path.exists(frontend_dist_dir):
    assets_dir = os.path.join(frontend_dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Serve API docs or API routes if unhandled
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        index_file = os.path.join(frontend_dist_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"project": settings.PROJECT_NAME, "version": settings.VERSION}
else:
    @app.get("/")
    async def root():
        return {
            "project": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "docs": "/docs",
            "api_status": "/api/health"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
