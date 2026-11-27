from enum import Enum
from pydantic import BaseModel, ConfigDict, Field


class UserRole(str, Enum):
    CUSTOMER = "customer"
    PROVIDER = "provider"
    ADMIN = "admin"


class BookingStatus(str, Enum):
    PENDING = "Pending"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class VerificationStatus(str, Enum):
    VERIFIED = "verified"
    PENDING = "pending"
    UNVERIFIED = "unverified"


class CreateBookingSchema(BaseModel):
    provider_id: str = Field(
        ...,
        description="Target provider identifier (e.g., 'prov-001').",
        examples=["prov-001"],
    )
    provider_service_id: str = Field(
        ...,
        description="Selected service package ID offered by the provider.",
        examples=["srv-001"],
    )
    customer_id: str = Field(
        default="cust-001",
        description="Customer account ID submitting the service request.",
        examples=["cust-001"],
    )
    problem_description: str = Field(
        ...,
        min_length=10,
        max_length=600,
        description="Detailed description of the household or maintenance issue.",
        examples=["Main circuit breaker trips whenever the kitchen oven starts."],
    )
    service_address: str = Field(
        ...,
        min_length=5,
        max_length=250,
        description="Full service location address in Bangladesh.",
        examples=["House 24, Padma Residential Area, Boalia, Rajshahi"],
    )
    customer_phone: str = Field(
        default="+8801711223344",
        pattern=r"^(?:\+8801|01)[3-9]\d{8}$",
        description="Valid Bangladesh mobile number (+8801XXXXXXXXX or 01XXXXXXXXX).",
        examples=["+8801711223344"],
    )
    preferred_at: str = Field(
        ...,
        description="Requested service date and window (ISO date or timestamp).",
        examples=["2026-12-01T10:30:00"],
    )
    additional_instructions: str | None = Field(
        default=None,
        max_length=300,
        description="Optional arrival notes or gate instructions.",
        examples=["Call 10 minutes before arrival at Gate 2."],
    )
    problem_image_url: str | None = Field(
        default=None,
        description="Optional uploaded photo URL of the issue.",
    )


class BookingStatusUpdateSchema(BaseModel):
    status: BookingStatus = Field(
        ...,
        description="Target booking lifecycle status.",
        examples=[BookingStatus.ACCEPTED],
    )
    actor_role: UserRole = Field(
        default=UserRole.PROVIDER,
        description="Role executing the status transition.",
        examples=[UserRole.PROVIDER],
    )


class CreateReviewSchema(BaseModel):
    customer_id: str = Field(
        default="cust-001",
        description="Customer ID submitting the review.",
        examples=["cust-001"],
    )
    rating: int = Field(
        ...,
        ge=1,
        le=5,
        description="Star rating between 1 and 5.",
        examples=[5],
    )
    comment: str = Field(
        ...,
        min_length=5,
        max_length=500,
        description="Customer review comment for the completed service.",
        examples=["Arrived on time and fixed the switchboard neatly."],
    )


class HealthResponse(BaseModel):
    status: str = Field(..., examples=["ok"])
    service: str = Field(..., examples=["ShebaLink Local Services API"])
    version: str = Field(..., examples=["1.0.0"])
    database: str = Field(..., examples=["in-memory-repository (postgresql-ready)"])


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., examples=["cat-electrician"])
    name: str = Field(..., examples=["Electrician"])
    slug: str = Field(..., examples=["electrician"])
    group: str = Field(..., examples=["home-repair"])
    description: str
    active: bool = True
    provider_count: int = Field(..., ge=0)


class ProviderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., examples=["prov-001"])
    name: str = Field(..., examples=["Rahim Uddin"])
    title: str = Field(..., examples=["Electrician"])
    primary_category_slug: str = Field(..., examples=["electrician"])
    primary_category_name: str = Field(..., examples=["Electrician"])
    primary_city: str = Field(..., examples=["Rajshahi"])
    neighborhood: str = Field(..., examples=["Boalia"])
    experience_years: int = Field(..., ge=0, examples=[5])
    rating: float = Field(..., ge=0.0, le=5.0, examples=[4.8])
    review_count: int = Field(..., ge=0, examples=[42])
    starting_price_bdt: int = Field(..., ge=0, examples=[500])
    verified_status: VerificationStatus = VerificationStatus.VERIFIED
    is_available: bool = True
    phone: str = Field(..., examples=["+8801711001101"])


class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., examples=["bk-001"])
    customer_id: str
    provider_id: str
    provider_service_id: str
    problem_description: str
    service_address: str
    customer_phone: str
    preferred_at: str
    additional_instructions: str | None = None
    status: BookingStatus
    quoted_price_bdt: int = Field(..., ge=0)
    notification_dispatched: bool = True
    created_at: str
    updated_at: str


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., examples=["rev-101"])
    booking_id: str
    customer_id: str
    provider_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: str
    created_at: str


class AdminOverviewResponse(BaseModel):
    total_categories: int
    active_categories: int
    total_providers: int
    verified_providers: int
    total_bookings: int
    pending_bookings: int
    completed_bookings: int
    total_reviews: int
    total_revenue_bdt: int


class ErrorResponse(BaseModel):
    detail: str = Field(..., examples=["Requested booking was not found."])
