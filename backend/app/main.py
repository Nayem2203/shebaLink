from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes import router as v1_router
from app.core.config import settings

OPENAPI_TAGS = [
    {
        "name": "System",
        "description": "Service health and runtime diagnostics.",
    },
    {
        "name": "Catalog",
        "description": "Service categories available across Bangladesh cities.",
    },
    {
        "name": "Providers",
        "description": "Verified local technician discovery, filtering, and profiles.",
    },
    {
        "name": "Bookings",
        "description": "Service request creation, centralized lifecycle transitions, and cancellation.",
    },
    {
        "name": "Reviews",
        "description": "Completed-booking customer ratings and provider score recalculation.",
    },
    {
        "name": "Admin",
        "description": "Platform KPI overview and operational statistics.",
    },
]

app = FastAPI(
    title="ShebaLink Local Services API",
    version="1.0.0",
    summary="OpenAPI 3.1 contract and REST reference implementation for ShebaLink (CSE 3206).",
    description=(
        "REST API & OpenAPI/Swagger specification for **ShebaLink**, a Bangladesh-first "
        "local service discovery and booking marketplace. Uses Pydantic validation, centralized "
        "booking state-machine rules, and PostgreSQL-aligned repository/gateway interfaces."
    ),
    openapi_tags=OPENAPI_TAGS,
    contact={
        "name": "ShebaLink CSE 3206 Engineering",
        "url": "https://github.com/Nayem2203/shebaLink",
    },
    license_info={
        "name": "MIT License (Academic Prototype)",
    },
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router, prefix=settings.api_v1_prefix)


@app.get("/", tags=["System"], summary="API root metadata")
def root() -> dict[str, str]:
    return {
        "service": "ShebaLink Local Services API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "openapi": "/openapi.json",
    }
