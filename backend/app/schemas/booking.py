from enum import Enum
from pydantic import BaseModel, Field


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


class CreateBookingSchema(BaseModel):
    provider_id: str
    provider_service_id: str
    problem_description: str = Field(..., min_length=10, max_length=600)
    service_address: str = Field(..., min_length=5, max_length=250)
    preferred_at: str
    additional_instructions: str | None = Field(default=None, max_length=300)
    problem_image_url: str | None = None


class BookingStatusUpdateSchema(BaseModel):
    status: BookingStatus


class CreateReviewSchema(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=5, max_length=500)
