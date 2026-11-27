# ShebaLink --- Backend Architecture Plan

## 1. Purpose

This document describes the planned backend for a future version of
ShebaLink. **The current lab prototype does not require a real
backend.** Use mock data and LocalStorage for now, but organize frontend
code so the backend can be integrated later without rewriting the UI.

## 2. Proposed Future Stack

-   API: FastAPI (Python)
-   Database: PostgreSQL
-   ORM: SQLAlchemy
-   Validation: Pydantic
-   Authentication: JWT access and refresh tokens
-   File storage: S3-compatible object storage or equivalent
-   Real-time updates: WebSocket, introduced only when needed
-   API documentation: OpenAPI/Swagger
-   Deployment: Docker

## 3. High-Level Architecture

Client (Next.js) → REST API (FastAPI) → Service Layer → Repository Layer
→ PostgreSQL

Supporting components: - Object storage for uploaded service/problem
images - Notification service for email/SMS/push integrations -
Background worker for asynchronous notifications, if required later

Do not implement these external services in the current prototype.

## 4. Planned Backend Modules

### Authentication and users

Responsibilities: - Register and authenticate customers and providers -
Manage profiles - Enforce role-based access - Store account status

### Service catalog

Responsibilities: - Manage service categories - Search categories -
Activate/deactivate categories - Support category hierarchy in a future
release

### Provider management

Responsibilities: - Provider profiles - Skills and service offerings -
Pricing and price units - Service coverage areas - Availability
schedules - Verification documents and review status

### Discovery

Responsibilities: - Search providers by service - Filter by location,
price, rating, and availability - Sort results - Add geospatial search
in a later release

### Booking

Responsibilities: - Create service requests - Assign provider -
Accept/reject requests - Reschedule or cancel according to policy -
Track booking status - Keep booking history

### Reviews

Responsibilities: - Allow reviews only for eligible completed bookings -
Store rating and comment - Calculate provider rating from reviews

### Admin and moderation

Responsibilities: - Manage users and providers - Review provider
verification - Manage categories - Handle complaints - Inspect bookings
and platform metrics

### Notifications

Responsibilities: - Notify customers about booking status changes -
Notify providers about new requests - Keep notification preferences

## 5. Initial Database Model

### users

-   id (UUID, primary key)
-   full_name
-   email (unique, nullable only if phone-based login is chosen)
-   phone (unique)
-   password_hash
-   role (customer, provider, admin)
-   account_status
-   created_at
-   updated_at

### provider_profiles

-   id (UUID, primary key)
-   user_id (FK → users.id, unique)
-   professional_title
-   bio
-   experience_years
-   verification_status
-   service_area_text
-   created_at
-   updated_at

### service_categories

-   id (UUID, primary key)
-   name
-   slug (unique)
-   description
-   icon_key
-   image_url
-   is_active
-   parent_id (nullable self-reference for future subcategories)

### provider_services

-   id (UUID, primary key)
-   provider_id (FK → provider_profiles.id)
-   category_id (FK → service_categories.id)
-   description
-   starting_price
-   price_unit
-   is_active

### bookings

-   id (UUID, primary key)
-   customer_id (FK → users.id)
-   provider_id (FK → provider_profiles.id)
-   provider_service_id (FK → provider_services.id)
-   problem_description
-   problem_image_url (nullable)
-   service_address
-   preferred_at
-   additional_instructions
-   status
-   quoted_price (nullable)
-   created_at
-   updated_at

### reviews

-   id (UUID, primary key)
-   booking_id (FK → bookings.id, unique)
-   customer_id (FK → users.id)
-   provider_id (FK → provider_profiles.id)
-   rating (1--5)
-   comment
-   created_at

### complaints

-   id (UUID, primary key)
-   booking_id (FK → bookings.id)
-   customer_id (FK → users.id)
-   subject
-   description
-   status
-   created_at
-   updated_at

### provider_availability

-   id (UUID, primary key)
-   provider_id (FK → provider_profiles.id)
-   weekday
-   start_time
-   end_time
-   is_available

## 6. API Endpoint Plan

### Authentication

-   POST /api/v1/auth/register
-   POST /api/v1/auth/login
-   POST /api/v1/auth/refresh
-   POST /api/v1/auth/logout
-   GET /api/v1/users/me

### Services

-   GET /api/v1/categories
-   GET /api/v1/categories/{category_id}
-   GET /api/v1/services/search

### Providers

-   GET /api/v1/providers
-   GET /api/v1/providers/{provider_id}
-   GET /api/v1/providers/{provider_id}/services
-   POST /api/v1/provider/services
-   PATCH /api/v1/provider/services/{service_id}

### Bookings

-   POST /api/v1/bookings
-   GET /api/v1/bookings
-   GET /api/v1/bookings/{booking_id}
-   PATCH /api/v1/bookings/{booking_id}/status
-   POST /api/v1/bookings/{booking_id}/cancel

### Reviews

-   POST /api/v1/bookings/{booking_id}/reviews
-   GET /api/v1/providers/{provider_id}/reviews

### Admin

-   GET /api/v1/admin/overview
-   GET /api/v1/admin/providers
-   PATCH /api/v1/admin/providers/{provider_id}/verification
-   CRUD /api/v1/admin/categories
-   GET /api/v1/admin/bookings
-   GET /api/v1/admin/complaints

## 7. Booking Rules and Data Integrity

-   A customer can only view and manage their own bookings.
-   A provider can only process requests assigned to them.
-   Only an authorized admin can manage provider verification and
    categories.
-   A review can only be submitted for a completed booking.
-   A booking cannot be accepted after it has been cancelled or
    rejected.
-   Status transitions must be validated in the service layer.
-   Booking status changes should be recorded in an audit history in a
    production version.
-   Provider availability and overlapping bookings must be checked
    before confirming a time slot.

## 8. Security Plan

For the future backend: - Hash passwords using a suitable password
hashing algorithm. - Never store plaintext passwords. - Enforce
authorization on the server, not only in the frontend. - Validate all
request data. - Restrict upload file types and sizes. - Avoid exposing
private contact or verification data. - Apply rate limiting to sensitive
endpoints. - Use HTTPS in deployment. - Keep secrets in environment
variables. - Log security-relevant events without logging passwords or
tokens.

## 9. Frontend-to-Backend Migration Plan

For the prototype: - Define typed entities in a shared TypeScript types
area. - Keep LocalStorage access inside storage/repository modules. -
Let UI components call service functions rather than directly
reading/writing LocalStorage. - Use stable IDs and consistent status
enums. - Keep mock data separate from components.

For the future: 1. Implement FastAPI endpoints matching the API plan. 2.
Implement authentication and authorization. 3. Create PostgreSQL schema
and migrations. 4. Implement service and repository layers. 5. Replace
LocalStorage repository implementations with API clients. 6. Add upload
storage and notifications. 7. Add integration tests and deployment
configuration.

## 10. Backend Testing Plan

Future backend tests should cover: - Registration and login validation -
Role permissions - Provider search and filters - Booking creation -
Booking status transitions - Cancellation rules - Review eligibility -
Provider availability conflicts - Admin-only operations

Use Pytest, isolated test database fixtures, and mocks for external
services.

## 11. Current Prototype Boundary

Do not build this backend for the initial lab prototype. This document
is an architectural plan for future development and a guide for keeping
the frontend extensible.
