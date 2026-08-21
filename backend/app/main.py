from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncpg
import os

from app.api.v1 import cases, gis, verify

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB pool with container/local fallback
    db_url = os.getenv(
        "DATABASE_URL", 
        "postgresql://civic_admin:civic_secure_2026@postgres:5432/smart_civic"
    )
    
    try:
        app.state.pool = await asyncpg.create_pool(db_url, min_size=2, max_size=20, timeout=10)
        print("✓ Connected to PostgreSQL/PostGIS database pool successfully.")
    except Exception as e:
        print(f"Warning: Could not connect to database at startup ({e}). Operating in resilient fallback mode.")
        app.state.pool = None
        
    yield
    
    # Shutdown DB pool
    if app.state.pool:
        await app.state.pool.close()
        print("✓ Database pool closed gracefully.")

app = FastAPI(
    title="Smart Civic AI Platform API",
    description="Decoupled Fast Intake API and Spatial Multi-Agent Engine",
    version="2.0.0",
    lifespan=lifespan
)

# Explicit CORS Origins Configuration
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Routers
app.include_router(cases.router, prefix="/api/v1")
app.include_router(gis.router, prefix="/api/v1")
app.include_router(verify.router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    db_status = "connected" if getattr(app.state, 'pool', None) else "disconnected"
    return {
        "status": "healthy",
        "service": "smart-civic-ai-backend",
        "database": db_status,
        "version": "2.0.0"
    }

@app.get("/")
async def root():
    return {
        "app": "Smart Civic AI Platform",
        "status": "operational",
        "docs_url": "/docs",
        "version": "2.0.0"
    }
