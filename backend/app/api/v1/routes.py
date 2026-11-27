from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.schemas.booking import (
    AdminOverviewResponse,
    BookingResponse,
    BookingStatus,
    BookingStatusUpdateSchema,
    CategoryResponse,
    CreateBookingSchema,
    CreateReviewSchema,
    ErrorResponse,
    HealthResponse,
    ProviderResponse,
    ReviewResponse,
    UserRole,
)
from app.services.booking_status import can_transition_booking_status
from app.services.repository import (
    InMemoryMarketplaceRepository,
    NotificationGateway,
    get_notification_gateway,
    get_repository,
)

router = APIRouter()


@router.get(
    "/health",
    tags=["System"],
    response_model=HealthResponse,
    summary="Health check",
    description="Verify that the ShebaLink FastAPI service and repository layer are operational.",
)
def api_health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="ShebaLink Local Services API",
        version="1.0.0",
        database="in-memory-repository (postgresql-ready)",
    )


@router.get(
    "/categories",
    tags=["Catalog"],
    response_model=list[CategoryResponse],
    summary="List service categories",
    description="Return Bangladesh household, repair, and delivery service categories.",
)
def list_categories(
    active_only: bool = Query(default=False, description="Return only active categories."),
    repo: InMemoryMarketplaceRepository = Depends(get_repository),
) -> list[dict]:
    return repo.list_categories(active_only=active_only)


@router.get(
    "/categories/{slug}",
    tags=["Catalog"],
    response_model=CategoryResponse,
    responses={404: {"model": ErrorResponse, "description": "Category not found"}},
    summary="Get category by slug",
)
def get_category(
    slug: str,
    repo: InMemoryMarketplaceRepository = Depends(get_repository),
) -> dict:
    category = repo.get_category_by_slug(slug)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category '{slug}' was not found.",
        )
    return category


@router.get(
    "/providers",
    tags=["Providers"],
    response_model=list[ProviderResponse],
    summary="Search and filter local providers",
    description="Filter verified service providers by search query, category slug, Bangladesh city, or rating.",
)
def list_providers(
    q: str | None = Query(default=None, description="Keyword matching name, title, or area."),
    category: str | None = Query(default=None, description="Filter by category slug."),
    city: str | None = Query(default=None, description="City filter (Rajshahi, Dhaka, Chattogram)."),
    min_rating: float | None = Query(default=None, ge=0.0, le=5.0, description="Minimum star rating."),
    verified_only: bool = Query(default=False, description="Only return verified providers."),
    repo: InMemoryMarketplaceRepository = Depends(get_repository),
) -> list[dict]:
    return repo.list_providers(
        q=q,
        category=category,
        city=city,
        min_rating=min_rating,
        verified_only=verified_only,
    )


@router.get(
    "/providers/{provider_id}",
    tags=["Providers"],
    response_model=ProviderResponse,
    responses={404: {"model": ErrorResponse, "description": "Provider not found"}},
    summary="Get provider profile",
)
def get_provider(
    provider_id: str,
    repo: InMemoryMarketplaceRepository = Depends(get_repository),
) -> dict:
    provider = repo.get_provider(provider_id)
    if provider is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provider '{provider_id}' was not found.",
        )
    return provider


@router.get(
    "/bookings",
    tags=["Bookings"],
    response_model=list[BookingResponse],
    summary="List bookings",
    description="List service bookings with optional lifecycle status filtering.",
)
def list_bookings(
    booking_status: BookingStatus | None = Query(
        default=None,
        alias="status",
        description="Filter bookings by lifecycle status.",
    ),
    repo: InMemoryMarketplaceRepository = Depends(get_repository),
) -> list[dict]:
    return repo.list_bookings(status=booking_status)


@router.post(
    "/bookings",
    tags=["Bookings"],
    status_code=status.HTTP_201_CREATED,
    response_model=BookingResponse,
    responses={404: {"model": ErrorResponse, "description": "Target provider not found"}},
    summary="Create a new service booking",
    description="Validate booking inputs via Pydantic and notify the assigned provider via NotificationGateway.",
)
def create_booking(
    payload: CreateBookingSchema,
    repo: InMemoryMarketplaceRepository = Depends(get_repository),
    notifier: NotificationGateway = Depends(get_notification_gateway),
) -> dict:
    provider = repo.get_provider(payload.provider_id)
    if provider is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provider '{payload.provider_id}' was not found.",
        )

    temp_booking = repo.create_booking(payload, notification_dispatched=False)
    sent = notifier.send_booking_event(
        event="booking.created",
        booking_id=temp_booking["id"],
        recipient_phone=provider["phone"],
    )
    if sent:
        temp_booking["notification_dispatched"] = True
        for stored in repo.bookings:
            if stored["id"] == temp_booking["id"]:
                stored["notification_dispatched"] = True
                break
    return temp_booking


@router.get(
    "/bookings/{booking_id}",
    tags=["Bookings"],
    response_model=BookingResponse,
    responses={404: {"model": ErrorResponse, "description": "Booking not found"}},
    summary="Get booking details",
)
def get_booking(
    booking_id: str,
    repo: InMemoryMarketplaceRepository = Depends(get_repository),
) -> dict:
    booking = repo.get_booking(booking_id)
    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking '{booking_id}' was not found.",
        )
    return booking


@router.patch(
    "/bookings/{booking_id}/status",
    tags=["Bookings"],
    response_model=BookingResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid booking status transition"},
        404: {"model": ErrorResponse, "description": "Booking not found"},
    },
    summary="Transition booking lifecycle status",
    description="Enforces centralized booking state transitions and role constraints before persisting.",
)
def update_booking_status(
    booking_id: str,
    payload: BookingStatusUpdateSchema,
    repo: InMemoryMarketplaceRepository = Depends(get_repository),
    notifier: NotificationGateway = Depends(get_notification_gateway),
) -> dict:
    booking = repo.get_booking(booking_id)
    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking '{booking_id}' was not found.",
        )

    current_status = BookingStatus(booking["status"])
    if not can_transition_booking_status(
        current=current_status,
        target=payload.status,
        actor_role=payload.actor_role,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Transition from '{current_status.value}' to '{payload.status.value}' "
                f"is not permitted for role '{payload.actor_role.value}'."
            ),
        )

    sent = notifier.send_booking_event(
        event=f"booking.status.{payload.status.value.lower().replace(' ', '_')}",
        booking_id=booking_id,
        recipient_phone=booking["customer_phone"],
    )
    updated = repo.update_booking_status(
        booking_id=booking_id,
        target_status=payload.status,
        notification_dispatched=bool(sent),
    )
    return updated  # type: ignore[return-value]


@router.post(
    "/bookings/{booking_id}/cancel",
    tags=["Bookings"],
    response_model=BookingResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Booking cannot be cancelled"},
        404: {"model": ErrorResponse, "description": "Booking not found"},
    },
    summary="Cancel an eligible Pending booking (Customer)",
)
def cancel_booking(
    booking_id: str,
    repo: InMemoryMarketplaceRepository = Depends(get_repository),
    notifier: NotificationGateway = Depends(get_notification_gateway),
) -> dict:
    return update_booking_status(
        booking_id=booking_id,
        payload=BookingStatusUpdateSchema(
            status=BookingStatus.CANCELLED,
            actor_role=UserRole.CUSTOMER,
        ),
        repo=repo,
        notifier=notifier,
    )


@router.post(
    "/bookings/{booking_id}/reviews",
    tags=["Reviews"],
    status_code=status.HTTP_201_CREATED,
    response_model=ReviewResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Booking is not Completed or already reviewed"},
        404: {"model": ErrorResponse, "description": "Booking not found"},
    },
    summary="Submit a review for a completed booking",
)
def create_review(
    booking_id: str,
    payload: CreateReviewSchema,
    repo: InMemoryMarketplaceRepository = Depends(get_repository),
) -> dict:
    booking = repo.get_booking(booking_id)
    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking '{booking_id}' was not found.",
        )
    if BookingStatus(booking["status"]) != BookingStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only Completed bookings can be reviewed.",
        )
    if booking["customer_id"] != payload.customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only the booking owner can submit a review.",
        )
    if repo.has_review_for_booking(booking_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Booking '{booking_id}' has already been reviewed.",
        )

    return repo.create_review(
        booking_id=booking_id,
        provider_id=booking["provider_id"],
        payload=payload,
    )


@router.get(
    "/providers/{provider_id}/reviews",
    tags=["Reviews"],
    response_model=list[ReviewResponse],
    responses={404: {"model": ErrorResponse, "description": "Provider not found"}},
    summary="List customer reviews for a provider",
)
def list_provider_reviews(
    provider_id: str,
    repo: InMemoryMarketplaceRepository = Depends(get_repository),
) -> list[dict]:
    if repo.get_provider(provider_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provider '{provider_id}' was not found.",
        )
    return repo.list_reviews_by_provider(provider_id)


@router.get(
    "/admin/overview",
    tags=["Admin"],
    response_model=AdminOverviewResponse,
    summary="Platform KPI summary for Admin dashboard",
)
def admin_overview(
    repo: InMemoryMarketplaceRepository = Depends(get_repository),
) -> dict:
    return repo.get_admin_overview()
