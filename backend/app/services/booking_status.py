from app.schemas.booking import BookingStatus, UserRole

ALLOWED_TRANSITIONS: dict[BookingStatus, tuple[BookingStatus, ...]] = {
    BookingStatus.PENDING: (
        BookingStatus.ACCEPTED,
        BookingStatus.REJECTED,
        BookingStatus.CANCELLED,
    ),
    BookingStatus.ACCEPTED: (
        BookingStatus.IN_PROGRESS,
        BookingStatus.CANCELLED,
    ),
    BookingStatus.IN_PROGRESS: (BookingStatus.COMPLETED,),
    BookingStatus.REJECTED: (),
    BookingStatus.COMPLETED: (),
    BookingStatus.CANCELLED: (),
}


def can_transition_booking_status(
    current: BookingStatus,
    target: BookingStatus,
    actor_role: UserRole | None = None,
) -> bool:
    if current == target:
        return False
    if target not in ALLOWED_TRANSITIONS.get(current, ()):
        return False
    if actor_role == UserRole.CUSTOMER:
        return (
            current == BookingStatus.PENDING
            and target == BookingStatus.CANCELLED
        )
    return True
