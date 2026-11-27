from collections.abc import Generator
from unittest.mock import MagicMock

from fastapi.testclient import TestClient
import pytest

from app.main import app
from app.services.repository import (
    InMemoryMarketplaceRepository,
    NotificationGateway,
    get_notification_gateway,
    get_repository,
)


@pytest.fixture
def fresh_repo() -> InMemoryMarketplaceRepository:
    """Isolated seeded repository per test case (no cross-test state leakage)."""
    return InMemoryMarketplaceRepository()


@pytest.fixture
def mock_notifier() -> MagicMock:
    """Mocked external SMS/notification gateway (avoids real network/SMS calls)."""
    mock = MagicMock(spec=NotificationGateway)
    mock.send_booking_event.return_value = True
    return mock


@pytest.fixture
def client(
    fresh_repo: InMemoryMarketplaceRepository,
    mock_notifier: MagicMock,
) -> Generator[TestClient, None, None]:
    """FastAPI TestClient with dependency-injected repository and mocked gateway."""
    app.dependency_overrides[get_repository] = lambda: fresh_repo
    app.dependency_overrides[get_notification_gateway] = lambda: mock_notifier
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
