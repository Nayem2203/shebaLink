from fastapi.testclient import TestClient


def test_openapi_schema_contract_and_swagger_ui(client: TestClient) -> None:
    openapi_res = client.get("/openapi.json")
    assert openapi_res.status_code == 200
    spec = openapi_res.json()

    assert spec["openapi"].startswith("3.1")
    assert spec["info"]["title"] == "ShebaLink Local Services API"
    assert spec["info"]["version"] == "1.0.0"

    expected_paths = {
        "/api/v1/health",
        "/api/v1/categories",
        "/api/v1/categories/{slug}",
        "/api/v1/providers",
        "/api/v1/providers/{provider_id}",
        "/api/v1/bookings",
        "/api/v1/bookings/{booking_id}",
        "/api/v1/bookings/{booking_id}/status",
        "/api/v1/bookings/{booking_id}/cancel",
        "/api/v1/bookings/{booking_id}/reviews",
        "/api/v1/providers/{provider_id}/reviews",
        "/api/v1/admin/overview",
    }
    assert expected_paths.issubset(set(spec["paths"].keys()))

    schemas = spec["components"]["schemas"]
    for required_schema in (
        "CreateBookingSchema",
        "BookingStatusUpdateSchema",
        "CreateReviewSchema",
        "BookingResponse",
        "ProviderResponse",
        "AdminOverviewResponse",
    ):
        assert required_schema in schemas

    docs_res = client.get("/docs")
    assert docs_res.status_code == 200
    assert "Swagger UI" in docs_res.text
