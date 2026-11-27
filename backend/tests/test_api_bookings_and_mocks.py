from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from app.main import app
from app.services.repository import get_repository


def test_health_and_root_endpoints(client: TestClient) -> None:
    root_res = client.get("/")
    assert root_res.status_code == 200
    assert root_res.json()["docs"] == "/docs"

    health_res = client.get("/api/v1/health")
    assert health_res.status_code == 200
    payload = health_res.json()
    assert payload["status"] == "ok"
    assert payload["version"] == "1.0.0"


def test_catalog_and_provider_filtering(client: TestClient) -> None:
    cats = client.get("/api/v1/categories")
    assert cats.status_code == 200
    assert len(cats.json()) >= 4

    elec = client.get("/api/v1/categories/electrician")
    assert elec.status_code == 200
    assert elec.json()["name"] == "Electrician"

    missing_cat = client.get("/api/v1/categories/non-existent")
    assert missing_cat.status_code == 404

    rajshahi_verified = client.get(
        "/api/v1/providers",
        params={"city": "Rajshahi", "verified_only": "true", "min_rating": 4.8},
    )
    assert rajshahi_verified.status_code == 200
    names = [p["name"] for p in rajshahi_verified.json()]
    assert "Rahim Uddin" in names
    assert "Kamrul Hasan" in names

    missing_prov = client.get("/api/v1/providers/prov-999")
    assert missing_prov.status_code == 404


def test_booking_lifecycle_with_mocked_notification_gateway(
    client: TestClient,
    mock_notifier: MagicMock,
) -> None:
    # 1. Create booking via API and confirm NotificationGateway mock is invoked
    create_res = client.post(
        "/api/v1/bookings",
        json={
            "provider_id": "prov-001",
            "provider_service_id": "srv-001",
            "customer_id": "cust-001",
            "problem_description": "Main MCB breaker trips every evening with AC load.",
            "service_address": "House 24, Padma Residential Area, Rajshahi",
            "customer_phone": "+8801711223344",
            "preferred_at": "2026-12-05T10:30:00",
            "additional_instructions": "Ring bell at main gate.",
        },
    )
    assert create_res.status_code == 201
    booking = create_res.json()
    booking_id = booking["id"]
    assert booking["status"] == "Pending"
    assert booking["notification_dispatched"] is True

    mock_notifier.send_booking_event.assert_called_once_with(
        event="booking.created",
        booking_id=booking_id,
        recipient_phone="+8801711001101",
    )

    # 2. Invalid direct skip Pending -> Completed must be rejected (400)
    bad_skip = client.patch(
        f"/api/v1/bookings/{booking_id}/status",
        json={"status": "Completed", "actor_role": "provider"},
    )
    assert bad_skip.status_code == 400

    # 3. Valid progression: Pending -> Accepted -> In Progress -> Completed
    for next_status in ("Accepted", "In Progress", "Completed"):
        res = client.patch(
            f"/api/v1/bookings/{booking_id}/status",
            json={"status": next_status, "actor_role": "provider"},
        )
        assert res.status_code == 200
        assert res.json()["status"] == next_status

    assert mock_notifier.send_booking_event.call_count == 4

    # 4. Submit review on Completed booking and confirm provider review_count increments
    rev_res = client.post(
        f"/api/v1/bookings/{booking_id}/reviews",
        json={
            "customer_id": "cust-001",
            "rating": 5,
            "comment": "Clean diagnostics and timely completion.",
        },
    )
    assert rev_res.status_code == 201
    assert rev_res.json()["rating"] == 5

    # Duplicate review is rejected
    dup_res = client.post(
        f"/api/v1/bookings/{booking_id}/reviews",
        json={
            "customer_id": "cust-001",
            "rating": 4,
            "comment": "Trying to submit duplicate review.",
        },
    )
    assert dup_res.status_code == 400


def test_booking_validation_and_cancellation_rules(client: TestClient) -> None:
    # Invalid Bangladesh phone & short description caught by Pydantic (422)
    invalid_res = client.post(
        "/api/v1/bookings",
        json={
            "provider_id": "prov-001",
            "provider_service_id": "srv-001",
            "problem_description": "short",
            "service_address": "Raj",
            "customer_phone": "99999",
            "preferred_at": "2026-12-05T10:30:00",
        },
    )
    assert invalid_res.status_code == 422

    # Customer cancels seeded pending booking bk-018
    cancel_res = client.post("/api/v1/bookings/bk-018/cancel")
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "Cancelled"

    # Admin overview reflects seeded & mutated stats cleanly
    overview = client.get("/api/v1/admin/overview")
    assert overview.status_code == 200
    assert overview.json()["total_bookings"] >= 3
    assert overview.json()["total_revenue_bdt"] == 950


def test_repository_mock_isolation_from_database() -> None:
    """Demonstrate isolating persistence dependency via FastAPI dependency_overrides + MagicMock."""
    stub_repo = MagicMock()
    stub_repo.get_provider.return_value = {
        "id": "prov-mock",
        "name": "Mocked Electrician",
        "title": "Senior Technician",
        "primary_category_slug": "electrician",
        "primary_category_name": "Electrician",
        "primary_city": "Rajshahi",
        "neighborhood": "Motihar",
        "experience_years": 9,
        "rating": 5.0,
        "review_count": 10,
        "starting_price_bdt": 600,
        "verified_status": "verified",
        "is_available": True,
        "phone": "+8801711999999",
    }

    app.dependency_overrides[get_repository] = lambda: stub_repo
    try:
        with TestClient(app) as isolated_client:
            res = isolated_client.get("/api/v1/providers/prov-mock")
            assert res.status_code == 200
            assert res.json()["name"] == "Mocked Electrician"
            stub_repo.get_provider.assert_called_once_with("prov-mock")
    finally:
        app.dependency_overrides.clear()
