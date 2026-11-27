# ShebaLink — Backend Architecture Blueprint (FastAPI + PostgreSQL)

This folder defines the modular **FastAPI + SQLAlchemy + Pydantic + PostgreSQL** backend structure planned in [doc/backend.md](../doc/backend.md).

> **Prototype Boundary:** Per project scope, the current deliverable is a frontend-first prototype in `frontend/` using mock data and `LocalStorage`. This `backend/` directory establishes clean boundaries and PostgreSQL-ready models/schemas/services so REST API integration can replace `frontend/src/lib/storage/*` without rewriting the UI.

## Structure

- `requirements.txt` — Planned Python dependencies (FastAPI, Uvicorn, SQLAlchemy, psycopg2-binary, Pydantic, Alembic, Pytest).
- `.env.example` — Environment template with PostgreSQL connection string (`DATABASE_URL`).
- `app/core/config.py` — Typed settings via `pydantic-settings`.
- `app/models/entities.py` — SQLAlchemy ORM models matching `database/schema.sql`.
- `app/schemas/booking.py` — Pydantic request/response contracts and enums matching `frontend/src/types/index.ts`.
- `app/services/booking_status.py` — Centralized booking status transition validator mirroring `frontend/src/services/bookingStatusEngine.ts`.
- `app/api/v1/routes.py` — Versioned FastAPI route definitions aligned with `doc/backend.md` Section 6.
- `app/main.py` — FastAPI application entry point.
