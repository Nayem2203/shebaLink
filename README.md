# ShebaLink — Local Service Discovery & Booking Marketplace

[![ShebaLink CI](https://github.com/Nayem2203/shebaLink/actions/workflows/ci.yml/badge.svg)](https://github.com/Nayem2203/shebaLink/actions/workflows/ci.yml)

**ShebaLink** is a Bangladesh-first (Rajshahi-focused, BDT `৳`, `+8801XXXXXXXXX`) local service discovery and booking marketplace prototype built for **CSE 3206 — Software Engineering Sessional (RUET, Department of CSE)**.

The project combines a **Next.js 14 + TypeScript + Tailwind CSS** consumer & multi-role dashboard frontend with an **OpenAPI 3.1 / Swagger** REST API specification (`FastAPI + Pydantic`), **PyTest** unit/mock/contract verification, **GitHub Actions CI/CD**, and a normalized **PostgreSQL** schema blueprint.

---

## Core Functional Modules

1. **Service Catalog & Category Directory (`/categories`, `/categories/[slug]`)** — 16 Bangladesh-oriented service categories across 3 groups (*Home Repair & Maintenance*, *Cleaning & Household*, *Delivery & Moving*) with custom flat-vector illustrations and active/inactive admin toggles.
2. **Service Discovery & Provider Directory (`/services`, `/providers`, `/providers/[id]`)** — Keyword search, city filter (`Rajshahi`, `Dhaka`, `Chattogram`), category, price range (`৳`), minimum rating, Verified-only filter, and runtime sorting via the Strategy pattern.
3. **Booking Request & Lifecycle Engine (`/book`, `/api/v1/bookings`)** — React Hook Form + Zod validated request submission (`+8801XXXXXXXXX` checks, date validation, optional image preview) backed by a centralized, role-guarded state machine (`Pending → Accepted / Rejected / Cancelled → In Progress → Completed`).
4. **Customer, Provider & Admin Dashboards (`/dashboard/customer`, `/dashboard/provider`, `/dashboard/admin`)** — Multi-role demo switcher (`Customer`, `Provider`, `Admin`), booking status progression, review submission on completed bookings, provider verification queue, category toggles, and Recharts analytics.
5. **FastAPI + Swagger/OpenAPI 3.1 Service (`backend/`)** — Runnable REST API implementing 13 OpenAPI paths (`/docs`, `/redoc`, `/openapi.json`) backed by an injectable `InMemoryMarketplaceRepository` and mockable `NotificationGateway` boundary, tested with **PyTest** + coverage reporting.
6. **PostgreSQL Architectural Blueprint (`database/`)** — Normalized 7-table schema (`schema.sql`) and seed dataset (`seed.sql`) ready for future SQLAlchemy + Alembic migration.

---

## Architecture & Repository Layout

```text
shebaLink/
├── .github/workflows/
│   └── ci.yml                  # GitHub Actions CI (Frontend + PyTest + OpenAPI drift check)
├── frontend/                   # Next.js 14.2.18 (App Router, TypeScript, Tailwind, Vitest)
│   ├── public/images/          # Hero visual + 16 cartoon category SVG illustrations
│   └── src/
│       ├── app/                # Pages: /, /categories, /services, /providers, /book, /dashboard/*
│       ├── components/         # UI primitives, shared domain cards, booking forms, layouts
│       ├── context/            # Demo RoleContext (Customer / Provider / Admin)
│       ├── data/               # Seed categories, providers, services, bookings, reviews, users
│       ├── lib/patterns/       # EntityFactory (Creational), StorageEventBus (Observer), ProviderSortStrategy (Strategy)
│       ├── lib/storage/        # Isolated LocalStorage repositories (replaceable by FastAPI client)
│       ├── services/           # discoveryService, bookingService, bookingStatusEngine, adminService
│       └── __tests__/          # Vitest suites (foundation, discovery, booking, admin, mocks)
├── backend/                    # FastAPI + OpenAPI 3.1 + PyTest service
│   ├── app/
│   │   ├── api/v1/routes.py    # 13 versioned REST endpoints with OpenAPI schemas & responses
│   │   ├── core/config.py      # Pydantic Settings configuration
│   │   ├── models/entities.py  # SQLAlchemy ORM blueprint models
│   │   ├── schemas/booking.py  # Pydantic v2 request/response contracts
│   │   └── services/           # booking_status state machine & injectable repository/gateway
│   ├── scripts/export_openapi.py
│   ├── tests/                  # PyTest unit, mock-isolation, API & OpenAPI contract suites
│   └── pytest.ini
├── database/                   # PostgreSQL schema.sql & seed.sql blueprint
├── backend/openapi.json        # Exported OpenAPI 3.1.0 specification
└── DEVELOPMENT_LOG.md
```

---

## Software Engineering Design Patterns

| Category | Pattern | Implementation | Problem Solved |
| --- | --- | --- | --- |
| **Creational** | **Factory Method / Static Factory** | `EntityFactory` (`frontend/src/lib/patterns/FactoryPattern.ts`) | Standardizes Booking, Review, and Complaint entity construction with prefix IDs (`bk-`, `rev-`, `cmp-`), `Pending`/`Open` defaults, trimmed inputs, and rating clamping (`1..5`). |
| **Behavioral** | **Observer + Singleton** | `EventObserver<T>` & `StorageEventBus` (`frontend/src/lib/patterns/ObserverPattern.ts`) | Keeps Customer, Provider, and Admin dashboards synchronized automatically on local mutations and cross-tab `storage` events without prop drilling. |
| **Behavioral** | **Strategy** | `ProviderSortContext` & 5 `ProviderSortStrategy` implementations (`frontend/src/lib/patterns/StrategyPattern.ts`) | Decouples ranking algorithms (`relevance`, `rating-desc`, `price-asc`, `price-desc`, `experience-desc`) from discovery UI and service filters. |

---

## Running Locally

### 1. Frontend (Next.js App + Vitest)

```bash
# Install dependencies (from workspace root or frontend/)
npm --prefix frontend install

# Run development server at http://localhost:3000
npm run dev

# Run verification checks
npm run typecheck
npm run lint
npm test
npm run build
```

### 2. Backend REST API (FastAPI + Swagger UI + PyTest)

```bash
cd backend
pip install -r requirements.txt

# Launch interactive Swagger UI at http://127.0.0.1:8000/docs
uvicorn app.main:app --reload --port 8000

# Run PyTest suite with coverage report
pytest --cov=app --cov-report=term-missing

# Verify exported OpenAPI 3.1 specification matches FastAPI app
python scripts/export_openapi.py --check
```

---

## Automated Testing, New Tools & CI/CD

- **Frontend (`Vitest`)**: 5 test files, 24 tests covering design patterns, discovery filtering/sorting, booking lifecycle & validation, admin statistics, and `vi.fn()` / `vi.spyOn()` mock isolation.
- **Validation (`Zod + React Hook Form`)**: Type-safe runtime validation in `bookingValidator.ts` enforcing `+8801XXXXXXXXX` numbers, address/issue lengths, and non-past dates.
- **Backend (`PyTest`)**: 21 tests (including parametrized transition matrix checks, FastAPI `TestClient` endpoint flows, `MagicMock` isolation of `NotificationGateway` & repository, and OpenAPI 3.1 contract validation) with **91% statement coverage**.
- **API Docs (`Swagger / OpenAPI 3.1`)**: Interactive `/docs` UI and exported spec in [backend/openapi.json](backend/openapi.json) (`13` endpoints) checked automatically via `python scripts/export_openapi.py --check`.
- **CI Pipeline (`.github/workflows/ci.yml`)**: Automatically runs `typecheck`, `lint`, `vitest`, `next build`, `pytest --cov-fail-under=85`, and `export_openapi.py --check` on every push and pull request to `main`.

---

## Deploying Frontend on Vercel

1. Push the repository to GitHub (`https://github.com/Nayem2203/shebaLink`).
2. In **Vercel** (`vercel.com` → *Add New Project*), import `Nayem2203/shebaLink`.
3. Under **Root Directory**, select **`frontend`** (Next.js App Router is detected automatically).
4. Leave environment variables empty (prototype persistence runs locally in `LocalStorage`) and click **Deploy**.

---

## Documentation

- **Exported OpenAPI 3.1 Spec:** [backend/openapi.json](backend/openapi.json)
- **Backend Guide:** [backend/README.md](backend/README.md)
- **Database Guide:** [database/README.md](database/README.md)
- **Development Log:** [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md)
