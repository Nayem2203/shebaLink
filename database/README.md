# ShebaLink — PostgreSQL Database Blueprint

This folder holds the planned **PostgreSQL** database schema and seed scripts aligned with [doc/backend.md](../doc/backend.md).

> **Prototype Note:** The current CSE 3206 frontend prototype in `frontend/` uses mock data and browser `LocalStorage` (isolated behind `frontend/src/lib/storage/*`) and does **not** connect to a live PostgreSQL server yet.

## Contents

- `schema.sql` — PostgreSQL DDL creating custom enum types, 8 core tables (`users`, `provider_profiles`, `service_categories`, `provider_services`, `provider_availability`, `bookings`, `reviews`, `complaints`), constraints, and discovery/dashboard indexes.
- `seed.sql` — Fictional Bangladesh/Rajshahi sample rows mirroring `frontend/src/data/*`.

## Planned Usage (Future Backend Phase)

```bash
createdb shebalink
psql -d shebalink -f database/schema.sql
psql -d shebalink -f database/seed.sql
```
