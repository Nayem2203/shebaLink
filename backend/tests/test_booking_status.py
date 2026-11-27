import pytest

from app.schemas.booking import BookingStatus, UserRole
from app.services.booking_status import can_transition_booking_status


@pytest.mark.parametrize(
    ("current", "target", "actor", "expected"),
    [
        # Valid lifecycle progressions
        (BookingStatus.PENDING, BookingStatus.ACCEPTED, UserRole.PROVIDER, True),
        (BookingStatus.PENDING, BookingStatus.REJECTED, UserRole.PROVIDER, True),
        (BookingStatus.PENDING, BookingStatus.CANCELLED, UserRole.CUSTOMER, True),
        (BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS, UserRole.PROVIDER, True),
        (BookingStatus.ACCEPTED, BookingStatus.CANCELLED, UserRole.PROVIDER, True),
        (BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED, UserRole.PROVIDER, True),
        # No-op self transitions blocked
        (BookingStatus.PENDING, BookingStatus.PENDING, UserRole.PROVIDER, False),
        # Illegal state skips
        (BookingStatus.PENDING, BookingStatus.COMPLETED, UserRole.PROVIDER, False),
        (BookingStatus.PENDING, BookingStatus.IN_PROGRESS, UserRole.PROVIDER, False),
        (BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED, UserRole.PROVIDER, False),
        # Terminal state immutability
        (BookingStatus.COMPLETED, BookingStatus.CANCELLED, UserRole.ADMIN, False),
        (BookingStatus.REJECTED, BookingStatus.ACCEPTED, UserRole.PROVIDER, False),
        (BookingStatus.CANCELLED, BookingStatus.PENDING, UserRole.ADMIN, False),
        # Role-based guards for Customer
        (BookingStatus.PENDING, BookingStatus.ACCEPTED, UserRole.CUSTOMER, False),
        (BookingStatus.ACCEPTED, BookingStatus.CANCELLED, UserRole.CUSTOMER, False),
    ],
)
def test_booking_status_transition_matrix(
    current: BookingStatus,
    target: BookingStatus,
    actor: UserRole,
    expected: bool,
) -> None:
    assert (
        can_transition_booking_status(
            current=current,
            target=target,
            actor_role=actor,
        )
        is expected
    )
