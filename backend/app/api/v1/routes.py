from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def api_health() -> dict[str, str]:
    return {"status": "ok", "database": "postgresql-planned"}


@router.get("/categories")
def list_categories_blueprint() -> dict[str, str]:
    return {
        "message": "PostgreSQL-backed categories endpoint planned for future backend release."
    }


@router.get("/providers")
def list_providers_blueprint() -> dict[str, str]:
    return {
        "message": "PostgreSQL-backed providers endpoint planned for future backend release."
    }


@router.get("/bookings")
def list_bookings_blueprint() -> dict[str, str]:
    return {
        "message": "PostgreSQL-backed bookings endpoint planned for future backend release."
    }
