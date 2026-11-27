"""Injectable repository & external gateway boundary for ShebaLink FastAPI backend.

Provides a clean PostgreSQL-compatible storage abstraction backed by seeded Bangladesh
(Rajshahi-first) demo records, plus an external NotificationGateway interface that can be
mocked cleanly in PyTest unit/integration tests without external SMS or network calls.
"""

from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from typing import Protocol

from app.schemas.booking import (
    BookingStatus,
    CreateBookingSchema,
    CreateReviewSchema,
    VerificationStatus,
)


class NotificationGateway(Protocol):
    """External SMS/push notification gateway port (mocked in unit tests)."""

    def send_booking_event(
        self,
        event: str,
        booking_id: str,
        recipient_phone: str,
    ) -> bool: ...


class ConsoleNotificationGateway:
    """No-op demo notification adapter used when running FastAPI locally."""

    def send_booking_event(
        self,
        event: str,
        booking_id: str,
        recipient_phone: str,
    ) -> bool:
        return True


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


class InMemoryMarketplaceRepository:
    """In-memory repository mirroring the PostgreSQL schema in database/schema.sql."""

    def __init__(self) -> None:
        self._seq_counter = 100
        self.categories: list[dict] = [
            {
                "id": "cat-electrician",
                "name": "Electrician",
                "slug": "electrician",
                "group": "home-repair",
                "description": "Switchboard repair, IPS/inverter wiring, ceiling fans, and short-circuit diagnostics.",
                "active": True,
                "provider_count": 3,
            },
            {
                "id": "cat-plumber",
                "name": "Plumber",
                "slug": "plumber",
                "group": "home-repair",
                "description": "Pipe leak repair, water motor setup, sanitary fittings, and drain unblocking.",
                "active": True,
                "provider_count": 3,
            },
            {
                "id": "cat-ac-repair",
                "name": "AC Repair & Servicing",
                "slug": "ac-repair",
                "group": "home-repair",
                "description": "Split/window AC servicing, gas refill, coil wash, and compressor inspection.",
                "active": True,
                "provider_count": 2,
            },
            {
                "id": "cat-home-cleaning",
                "name": "Home Cleaning",
                "slug": "home-cleaning",
                "group": "cleaning-household",
                "description": "Full apartment deep cleaning, kitchen degreasing, and bathroom sanitization.",
                "active": True,
                "provider_count": 2,
            },
        ]
        self.providers: list[dict] = [
            {
                "id": "prov-001",
                "name": "Rahim Uddin",
                "title": "Electrician",
                "primary_category_slug": "electrician",
                "primary_category_name": "Electrician",
                "primary_city": "Rajshahi",
                "neighborhood": "Boalia",
                "experience_years": 5,
                "rating": 4.8,
                "review_count": 42,
                "starting_price_bdt": 500,
                "verified_status": VerificationStatus.VERIFIED,
                "is_available": True,
                "phone": "+8801711001101",
            },
            {
                "id": "prov-002",
                "name": "Kamrul Hasan",
                "title": "Senior Plumber & Sanitary Technician",
                "primary_category_slug": "plumber",
                "primary_category_name": "Plumber",
                "primary_city": "Rajshahi",
                "neighborhood": "Shaheb Bazar",
                "experience_years": 7,
                "rating": 4.9,
                "review_count": 56,
                "starting_price_bdt": 450,
                "verified_status": VerificationStatus.VERIFIED,
                "is_available": True,
                "phone": "+8801712002202",
            },
            {
                "id": "prov-003",
                "name": "Sohel Rana",
                "title": "AC & Cooling Specialist",
                "primary_category_slug": "ac-repair",
                "primary_category_name": "AC Repair & Servicing",
                "primary_city": "Dhaka",
                "neighborhood": "Mirpur 10",
                "experience_years": 6,
                "rating": 4.6,
                "review_count": 29,
                "starting_price_bdt": 800,
                "verified_status": VerificationStatus.VERIFIED,
                "is_available": True,
                "phone": "+8801713003303",
            },
            {
                "id": "prov-004",
                "name": "Mizanur Rahman",
                "title": "Residential Deep Cleaning Lead",
                "primary_category_slug": "home-cleaning",
                "primary_category_name": "Home Cleaning",
                "primary_city": "Chattogram",
                "neighborhood": "Nasirabad",
                "experience_years": 4,
                "rating": 4.5,
                "review_count": 18,
                "starting_price_bdt": 1200,
                "verified_status": VerificationStatus.PENDING,
                "is_available": False,
                "phone": "+8801714004404",
            },
        ]
        self.service_prices: dict[str, int] = {
            "srv-001": 500,
            "srv-002": 450,
            "srv-003": 800,
            "srv-004": 1200,
        }
        self.bookings: list[dict] = [
            {
                "id": "bk-001",
                "customer_id": "cust-001",
                "provider_id": "prov-001",
                "provider_service_id": "srv-001",
                "problem_description": "Bedroom ceiling fan capacitor replacement and regulator wiring.",
                "service_address": "House 12, Upashahar Sector 2, Rajshahi",
                "customer_phone": "+8801711223344",
                "preferred_at": "2026-11-20T10:30:00",
                "additional_instructions": "Ring doorbell twice.",
                "status": BookingStatus.COMPLETED,
                "quoted_price_bdt": 500,
                "notification_dispatched": True,
                "created_at": "2026-11-19T08:00:00+00:00",
                "updated_at": "2026-11-20T12:15:00+00:00",
            },
            {
                "id": "bk-017",
                "customer_id": "cust-001",
                "provider_id": "prov-002",
                "provider_service_id": "srv-002",
                "problem_description": "Flush tank leakage and bathroom basin tap gasket replacement.",
                "service_address": "Flat 3B, Kazla, Rajshahi",
                "customer_phone": "+8801711223344",
                "preferred_at": "2026-11-24T15:00:00",
                "additional_instructions": None,
                "status": BookingStatus.COMPLETED,
                "quoted_price_bdt": 450,
                "notification_dispatched": True,
                "created_at": "2026-11-23T09:00:00+00:00",
                "updated_at": "2026-11-24T16:40:00+00:00",
            },
            {
                "id": "bk-018",
                "customer_id": "cust-001",
                "provider_id": "prov-001",
                "provider_service_id": "srv-001",
                "problem_description": "IPS battery terminal sparking and load balancing check.",
                "service_address": "House 24, Padma Residential, Rajshahi",
                "customer_phone": "+8801711223344",
                "preferred_at": "2026-11-29T11:00:00",
                "additional_instructions": "Call before entering lane.",
                "status": BookingStatus.PENDING,
                "quoted_price_bdt": 500,
                "notification_dispatched": True,
                "created_at": "2026-11-26T10:00:00+00:00",
                "updated_at": "2026-11-26T10:00:00+00:00",
            },
        ]
        self.reviews: list[dict] = [
            {
                "id": "rev-001",
                "booking_id": "bk-001",
                "customer_id": "cust-001",
                "provider_id": "prov-001",
                "rating": 5,
                "comment": "Punctual and clean wiring job in Upashahar.",
                "created_at": "2026-11-20T14:00:00+00:00",
            }
        ]

    def next_id(self, prefix: str) -> str:
        self._seq_counter += 1
        return f"{prefix}-{self._seq_counter}"

    def list_categories(self, active_only: bool = False) -> list[dict]:
        items = self.categories
        if active_only:
            items = [c for c in items if c["active"]]
        return deepcopy(items)

    def get_category_by_slug(self, slug: str) -> dict | None:
        for cat in self.categories:
            if cat["slug"] == slug:
                return deepcopy(cat)
        return None

    def list_providers(
        self,
        q: str | None = None,
        category: str | None = None,
        city: str | None = None,
        min_rating: float | None = None,
        verified_only: bool = False,
    ) -> list[dict]:
        results = self.providers
        if q:
            needle = q.strip().lower()
            results = [
                p
                for p in results
                if needle in p["name"].lower()
                or needle in p["title"].lower()
                or needle in p["primary_category_name"].lower()
                or needle in p["neighborhood"].lower()
            ]
        if category:
            cat_slug = category.strip().lower()
            results = [
                p for p in results if p["primary_category_slug"].lower() == cat_slug
            ]
        if city:
            city_lower = city.strip().lower()
            results = [p for p in results if p["primary_city"].lower() == city_lower]
        if min_rating is not None:
            results = [p for p in results if p["rating"] >= min_rating]
        if verified_only:
            results = [
                p
                for p in results
                if p["verified_status"] == VerificationStatus.VERIFIED
            ]
        return deepcopy(results)

    def get_provider(self, provider_id: str) -> dict | None:
        for provider in self.providers:
            if provider["id"] == provider_id:
                return deepcopy(provider)
        return None

    def list_bookings(self, status: BookingStatus | None = None) -> list[dict]:
        if status is None:
            return deepcopy(self.bookings)
        return deepcopy([b for b in self.bookings if b["status"] == status])

    def get_booking(self, booking_id: str) -> dict | None:
        for booking in self.bookings:
            if booking["id"] == booking_id:
                return deepcopy(booking)
        return None

    def create_booking(
        self,
        payload: CreateBookingSchema,
        notification_dispatched: bool = True,
    ) -> dict:
        now = _utc_now_iso()
        provider = self.get_provider(payload.provider_id)
        quoted_price = self.service_prices.get(
            payload.provider_service_id,
            provider["starting_price_bdt"] if provider else 500,
        )
        record = {
            "id": self.next_id("bk"),
            "customer_id": payload.customer_id,
            "provider_id": payload.provider_id,
            "provider_service_id": payload.provider_service_id,
            "problem_description": payload.problem_description,
            "service_address": payload.service_address,
            "customer_phone": payload.customer_phone,
            "preferred_at": payload.preferred_at,
            "additional_instructions": payload.additional_instructions,
            "status": BookingStatus.PENDING,
            "quoted_price_bdt": quoted_price,
            "notification_dispatched": notification_dispatched,
            "created_at": now,
            "updated_at": now,
        }
        self.bookings.insert(0, record)
        return deepcopy(record)

    def update_booking_status(
        self,
        booking_id: str,
        target_status: BookingStatus,
        notification_dispatched: bool = True,
    ) -> dict | None:
        for booking in self.bookings:
            if booking["id"] == booking_id:
                booking["status"] = target_status
                booking["updated_at"] = _utc_now_iso()
                booking["notification_dispatched"] = notification_dispatched
                return deepcopy(booking)
        return None

    def has_review_for_booking(self, booking_id: str) -> bool:
        return any(r["booking_id"] == booking_id for r in self.reviews)

    def create_review(
        self,
        booking_id: str,
        provider_id: str,
        payload: CreateReviewSchema,
    ) -> dict:
        review = {
            "id": self.next_id("rev"),
            "booking_id": booking_id,
            "customer_id": payload.customer_id,
            "provider_id": provider_id,
            "rating": payload.rating,
            "comment": payload.comment,
            "created_at": _utc_now_iso(),
        }
        self.reviews.append(review)

        for provider in self.providers:
            if provider["id"] == provider_id:
                old_count = provider["review_count"]
                old_total = provider["rating"] * old_count
                new_count = old_count + 1
                provider["review_count"] = new_count
                provider["rating"] = round((old_total + payload.rating) / new_count, 2)
                break

        return deepcopy(review)

    def list_reviews_by_provider(self, provider_id: str) -> list[dict]:
        return deepcopy([r for r in self.reviews if r["provider_id"] == provider_id])

    def get_admin_overview(self) -> dict:
        completed = [
            b for b in self.bookings if b["status"] == BookingStatus.COMPLETED
        ]
        pending = [b for b in self.bookings if b["status"] == BookingStatus.PENDING]
        return {
            "total_categories": len(self.categories),
            "active_categories": sum(1 for c in self.categories if c["active"]),
            "total_providers": len(self.providers),
            "verified_providers": sum(
                1
                for p in self.providers
                if p["verified_status"] == VerificationStatus.VERIFIED
            ),
            "total_bookings": len(self.bookings),
            "pending_bookings": len(pending),
            "completed_bookings": len(completed),
            "total_reviews": len(self.reviews),
            "total_revenue_bdt": sum(b["quoted_price_bdt"] for b in completed),
        }


_default_repository = InMemoryMarketplaceRepository()
_default_gateway = ConsoleNotificationGateway()


def get_repository() -> InMemoryMarketplaceRepository:
    return _default_repository


def get_notification_gateway() -> NotificationGateway:
    return _default_gateway


def reset_repository() -> None:
    global _default_repository
    _default_repository = InMemoryMarketplaceRepository()
