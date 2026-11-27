# ShebaLink --- UI/UX Design Specification

## 1. Product Design Goal

Design ShebaLink as a trustworthy, approachable, modern local-services
marketplace for Bangladesh. The interface should make it easy to find a
suitable professional and request help without confusion.

The visual style should feel like a polished consumer product, not a
generic admin template.

## 2. Brand Direction

-   Product name: ShebaLink
-   Tagline: Find trusted help, right around you.
-   Personality: Helpful, reliable, clear, local, professional
-   Primary color: Deep indigo/navy
-   Accent: Blue or violet
-   Surfaces: White cards on a very light neutral background
-   Text: Dark slate for primary text, muted slate for secondary text
-   Status colors: Use restrained semantic colors for pending, accepted,
    rejected, in-progress, and completed states.

Avoid excessive gradients, glassmorphism, oversized rounded cards,
decorative emojis, and unnecessary animation.

## 3. Layout and Navigation

### Public navigation

-   Logo and brand name
-   Home
-   Services
-   How It Works
-   Become a Provider
-   Sign In / Demo Dashboard entry

### Customer navigation

-   Overview
-   Find Services
-   My Bookings
-   Profile

### Provider navigation

-   Overview
-   Requests
-   My Services
-   Availability
-   Earnings

### Admin navigation

-   Overview
-   Providers
-   Customers
-   Categories
-   Bookings
-   Complaints

Provide a clear demo role switcher, preferably in the account menu or a
visible prototype control. Make it obvious that role switching is for
demonstration only.

## 4. Page Specifications

### A. Homepage

1.  Responsive header.
2.  Hero area with headline: "Find trusted professionals for every home
    need."
3.  Supporting sentence explaining discovery and booking.
4.  Search input with service keyword and location.
5.  Primary CTA: Find a Service.
6.  Popular category grid.
7.  Featured providers with rating, starting price, and service area.
8.  Three-step "How it works" section.
9.  Trust and safety information.
10. Customer testimonials.
11. Provider onboarding CTA.
12. Footer with navigation and contact placeholders.

The hero should prioritize the search action. Do not bury the main
function below decorative content.

### B. Service Discovery

-   Page title and short explanation
-   Search field
-   Category chips or sidebar
-   Location selector
-   Price range filter
-   Minimum rating filter
-   Sort by relevance, rating, and price
-   Result count
-   Responsive provider cards
-   Empty state with clear reset filters action

### C. Provider Card

Each card should show: - Provider photo/avatar - Name and profession -
Verified indicator only when demo data says verified - Rating and review
count - Experience - Service area - Starting price in BDT - Availability
label - View Profile and Request Service actions

Do not invent live availability. Use a clearly marked mock availability
value.

### D. Provider Profile

-   Profile header and identity
-   Rating and review count
-   Experience and service area
-   About and skills
-   Services and starting prices
-   Reviews
-   Clear Request Service CTA

### E. Booking Form

Use a focused step-by-step or clearly grouped form: 1. Service and
problem details 2. Optional image upload with local preview 3. Address
and contact information 4. Preferred date and time 5. Additional
instructions 6. Review and submit

Show inline validation messages, required-field indicators,
loading/submit feedback, and a confirmation screen with booking ID.

### F. Customer Dashboard

-   Welcome header
-   Summary cards for total, pending, and completed bookings
-   Recent bookings list
-   Status badges
-   Booking detail view
-   Cancel action only when allowed
-   Review action only for completed bookings

### G. Provider Dashboard

-   Summary metrics
-   Incoming request list
-   Request details
-   Accept and Reject actions
-   Status progression controls
-   Service listing management
-   Availability toggle
-   Basic earnings summary

### H. Admin Dashboard

-   Summary cards
-   Simple booking trend chart
-   Provider verification queue
-   Category management table
-   Booking table
-   Customer/provider lists
-   Complaint list and status controls

## 5. Component Design System

Create reusable components: - Button: primary, secondary, outline,
destructive, ghost - Input, Select, Textarea, Date input - SearchBar -
CategoryCard - ProviderCard - RatingDisplay - PriceDisplay -
StatusBadge - BookingCard - EmptyState - LoadingState - ConfirmDialog -
PageHeader - DashboardSidebar - DashboardStatCard - Toast/notification
feedback

Keep component variants consistent.

## 6. Responsive Behavior

-   Mobile: single-column content, compact header, drawer or bottom
    navigation where appropriate.
-   Tablet: two-column grids when space permits.
-   Desktop: wider content container, sidebar filters, multi-column
    dashboards.
-   Avoid horizontal overflow.
-   Forms must remain comfortable to use on small screens.

## 7. Interaction Details

-   Search should work on Enter and search button click.
-   Filters must update visible results.
-   Clear filters must reset all active filters.
-   Provider cards must open the correct profile.
-   Booking actions must provide visible feedback.
-   Dashboard counts must derive from current stored data.
-   Status badges must reflect actual booking status.
-   Role switching must update navigation and dashboard content.
-   Use confirmation dialogs for destructive actions.
-   Show helpful empty states instead of blank sections.

## 8. Accessibility and Content

-   Use semantic headings and landmarks.
-   Every input needs a visible label.
-   Ensure keyboard focus is visible.
-   Use sufficient text contrast.
-   Do not rely on color alone for booking status.
-   Use realistic, concise English UI copy.
-   Format prices as BDT (৳).
-   Use fictional names and contact details in demo data.

## 9. Visual Quality Checklist

-   Consistent spacing and typography
-   Consistent icon style
-   High-quality, relevant service imagery
-   No broken image placeholders
-   No dead buttons
-   No inconsistent card heights within the same grid
-   No unnecessary animations
-   Clear loading, error, empty, and success states
-   Mobile layout checked for every main page
