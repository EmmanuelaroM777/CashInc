from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_to_database, close_database_connection
from app.auth.routes import router as auth_router
from app.assets.routes import router as assets_router
from app.assets.maintenance_routes import router as maintenance_router
from app.audit.routes import router as audit_router
from app.finances.routes import router as finances_router
from app.reports.routes import router as reports_router
from app.alerts.routes import router as alerts_router
from app.ai.routes import router as ai_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle — connect/disconnect DB."""
    await connect_to_database()
    yield
    await close_database_connection()


app = FastAPI(
    title="InfraControl API",
    description="Plataforma de gestión financiera de infraestructura",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Wildcard or Vercel URLs will be configured here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(assets_router, prefix="/api/assets", tags=["Activos"])
app.include_router(maintenance_router, prefix="/api/maintenance", tags=["Mantenimiento"])
app.include_router(audit_router, prefix="/api/audit", tags=["Auditoría"])
app.include_router(finances_router, prefix="/api/finances", tags=["Finanzas"])
app.include_router(reports_router, prefix="/api/reports", tags=["Reportes"])
app.include_router(alerts_router, prefix="/api/alerts", tags=["Alertas"])
app.include_router(ai_router, prefix="/api/ai", tags=["Inteligencia Artificial"])


@app.get("/")
async def root():
    return {
        "app": "InfraControl API",
        "version": "1.0.0",
        "docs": "/docs",
    }
