# ShebaLink --- Project Details

## 1. Project Overview

**ShebaLink** is a local service discovery and booking platform. It
helps customers find nearby professionals for everyday household and
local needs, compare provider profiles, and submit service requests.

The initial target market is Bangladesh, starting with a prototype
focused on Rajshahi. The prototype is for the CSE 3206 Software
Engineering Sessional project.

### Core value

-   Customers can discover services in one place.
-   Providers can present their skills, prices, service areas, and
    availability.
-   Customers can request a service and follow its booking status.
-   Administrators can manage categories, providers, bookings, and
    complaints.

## 2. Scope of the Current Prototype

This is a **frontend-first functional prototype**, not a production
marketplace.

### In scope

-   Responsive web interface
-   Demo role switching: Customer, Provider, Admin
-   Service category browsing
-   Search, filtering, and sorting
-   Provider listing and profile pages
-   Service request form with local image preview
-   Booking management and status updates
-   LocalStorage persistence
-   Mock provider, customer, booking, and review data
-   Basic tests for important business logic

### Out of scope for this version

-   Real user authentication or authorization
-   Real backend or cloud database
-   Real-time GPS tracking
-   Online payment
-   SMS/email delivery
-   Real identity verification
-   Production provider onboarding

Keep boundaries clear so these capabilities can be added later through
an API.

## 3. User Roles

### Customer

-   Browse service categories
-   Search and filter providers
-   View provider details and reviews
-   Submit a service request
-   View booking history and status
-   Cancel eligible pending bookings
-   Submit a review for a completed booking

### Service Provider

-   View incoming service requests
-   Accept or reject requests
-   Update accepted bookings through supported statuses
-   Manage listed services, starting prices, and availability
-   View basic job and earnings summaries

### Admin

-   View platform summary statistics
-   Review provider verification status (demo only)
-   Manage service categories
-   View customers, providers, bookings, and complaints
-   Change demo provider verification status

## 4. Service Categories

### Home repair and maintenance

-   Electrician
-   Plumber
-   AC repair and servicing
-   Refrigerator repair
-   Washing machine repair
-   Carpenter
-   Painter
-   Bathroom fittings and sanitary repair

### Cleaning and household

-   Home cleaning
-   Pest control
-   Laundry and ironing
-   Water tank cleaning

### Delivery and moving

-   Parcel delivery
-   Grocery delivery
-   Home shifting
-   Emergency roadside assistance

Each category should have a name, slug, description, icon, image, and
active/inactive state.

## 5. Main User Workflows

### Workflow A: Find and request a plumber

1.  Customer opens the service discovery page.
2.  Customer selects Plumber or searches for a plumbing issue.
3.  Customer filters providers by location, rating, and starting price.
4.  Customer opens a provider profile.
5.  Customer selects Request Service.
6.  Customer describes the issue, adds an optional image, address, date,
    and time.
7.  The app validates and saves the request locally.
8.  Customer sees a confirmation and the booking in their dashboard.

### Workflow B: Provider handles a request

1.  Provider switches to Provider Demo Mode.
2.  Provider opens incoming requests.
3.  Provider views request details.
4.  Provider accepts or rejects the request.
5.  Provider updates an accepted booking to In Progress and then
    Completed.
6.  Customer dashboard reflects the changed status.

### Workflow C: Customer reviews a completed job

1.  Customer opens a completed booking.
2.  Customer submits a rating and written review.
3.  Review is saved locally and appears in the relevant provider
    profile.

### Workflow D: Admin manages the platform

1.  Admin switches to Admin Demo Mode.
2.  Admin views summary statistics.
3.  Admin reviews providers and demo verification status.
4.  Admin views categories, bookings, and complaints.
5.  Admin can perform basic demo management actions.

## 6. Functional Requirements

-   FR-01: The system shall display available service categories.
-   FR-02: The system shall allow users to search services and
    providers.
-   FR-03: The system shall filter providers by category, location,
    rating, and price.
-   FR-04: The system shall display provider profiles and reviews.
-   FR-05: The system shall validate and create service requests.
-   FR-06: The system shall persist prototype bookings in LocalStorage.
-   FR-07: The system shall allow customers to view their bookings.
-   FR-08: The system shall allow cancellation of eligible pending
    bookings.
-   FR-09: The system shall allow providers to accept or reject
    requests.
-   FR-10: The system shall support valid booking status transitions.
-   FR-11: The system shall allow customers to review completed
    bookings.
-   FR-12: The system shall provide separate demo dashboards for
    Customer, Provider, and Admin.
-   FR-13: The system shall provide basic admin management views.

## 7. Non-Functional Requirements

-   Usability: Main tasks should be understandable without instructions.
-   Responsiveness: Layout must work on mobile, tablet, and desktop.
-   Performance: Local interactions should feel immediate.
-   Reliability: Invalid booking data and invalid status transitions
    must be rejected.
-   Maintainability: Reusable components, typed models, and separated
    business logic.
-   Extensibility: LocalStorage access must be isolated behind
    repository/storage functions so a future API can replace it.
-   Accessibility: Semantic HTML, keyboard-friendly controls, labels,
    and visible focus states.
-   Privacy: Use fictional demo data only; do not collect real sensitive
    information.

## 8. Main Data Entities

-   User: id, name, email, phone, role, avatar
-   ProviderProfile: id, userId, title, bio, experienceYears, rating,
    reviewCount, serviceAreas, verifiedStatus
-   ServiceCategory: id, name, slug, description, icon, image, active
-   ProviderService: id, providerId, categoryId, description,
    startingPrice, priceUnit, active
-   Booking: id, customerId, providerId, serviceId, problemDescription,
    imagePreview, address, preferredDate, preferredTime, instructions,
    status, createdAt
-   Review: id, bookingId, customerId, providerId, rating, comment,
    createdAt
-   Complaint: id, bookingId, customerId, subject, description, status,
    createdAt

Use TypeScript interfaces and stable IDs. Store dates in ISO format.

## 9. Booking Status Model

Use these statuses: - Pending - Accepted - Rejected - In Progress -
Completed - Cancelled

Suggested allowed transitions: - Pending → Accepted, Rejected,
Cancelled - Accepted → In Progress, Cancelled - In Progress →
Completed - Rejected, Completed, Cancelled → no further transition

Centralize transition validation. Do not let UI components change status
arbitrarily.

## 10. Demo Data

Use realistic but fictional Bangladesh-oriented data: - Locations:
Rajshahi, Dhaka, Chattogram - Currency: BDT (৳) - Phone display format:
+8801XXXXXXXXX - At least 12 categories - At least 15 providers - At
least 20 bookings across different statuses - At least 15 reviews

Example provider: - Name: Rahim Uddin - Profession: Electrician -
Experience: 5 years - Rating: 4.8 - Starting price: ৳500 - Service area:
Rajshahi

Clearly label demo content where appropriate.

## 11. Success Criteria

The prototype is successful when a user can: 1. Browse and search for a
service. 2. Filter and compare providers. 3. Open a provider profile. 4.
Submit a valid service request. 5. See the booking after refreshing the
page. 6. Switch to Provider Demo Mode and process that request. 7.
Switch back to Customer Demo Mode and see the updated status. 8. Review
a completed booking. 9. Switch to Admin Demo Mode and inspect management
views. 10. Use the application on mobile and desktop without broken
layouts.
