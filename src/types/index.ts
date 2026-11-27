/**
 * ShebaLink — Shared Domain Contracts & PostgreSQL-Ready Types
 * Aligned 1:1 with doc/details.md and doc/backend.md
 */

export type UserRole = 'customer' | 'provider' | 'admin';

export type BookingStatus =
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export type VerificationStatus = 'verified' | 'pending' | 'unverified';

export type ComplaintStatus = 'Open' | 'In Review' | 'Resolved' | 'Dismissed';

export type CityLocation = 'Rajshahi' | 'Dhaka' | 'Chattogram';

export type PriceUnit = 'per visit' | 'per hour' | 'per job' | 'per unit';

export type ServiceGroup =
  | 'home-repair'
  | 'cleaning-household'
  | 'delivery-moving';

export type AvailabilityLabel =
  | 'Available Today'
  | 'Available Tomorrow'
  | 'Busy';

export type SortOption =
  | 'relevance'
  | 'rating-desc'
  | 'price-asc'
  | 'price-desc'
  | 'experience-desc';

/**
 * Maps to PostgreSQL `users` table
 */
export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  city?: CityLocation;
  address?: string;
  accountStatus?: 'active' | 'suspended';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Maps to PostgreSQL `provider_profiles` joined with `users` for frontend convenience
 */
export interface ProviderProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  title: string;
  primaryCategoryId: string;
  primaryCategoryName?: string;
  bio: string;
  skills: string[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  priceUnit: PriceUnit;
  serviceAreas: CityLocation[];
  primaryCity: CityLocation;
  neighborhood: string;
  verifiedStatus: VerificationStatus;
  availabilityLabel: AvailabilityLabel;
  isAvailable: boolean;
  completedJobsCount?: number;
  responseTime?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Maps to PostgreSQL `service_categories` table
 */
export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  group: ServiceGroup;
  description: string;
  icon: string;
  image: string;
  active: boolean;
  parentId?: string | null;
}

/**
 * Maps to PostgreSQL `provider_services` table
 */
export interface ProviderService {
  id: string;
  providerId: string;
  categoryId: string;
  title: string;
  description: string;
  startingPrice: number;
  priceUnit: PriceUnit;
  active: boolean;
}

/**
 * Maps to PostgreSQL `provider_availability` table
 */
export interface ProviderAvailability {
  id: string;
  providerId: string;
  weekday: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

/**
 * Maps to PostgreSQL `bookings` table
 */
export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  problemDescription: string;
  imagePreview?: string | null;
  address: string;
  preferredDate: string;
  preferredTime: string;
  instructions?: string;
  status: BookingStatus;
  quotedPrice?: number;
  customerName?: string;
  customerPhone?: string;
  providerName?: string;
  serviceTitle?: string;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingInput {
  customerId: string;
  providerId: string;
  serviceId: string;
  problemDescription: string;
  imagePreview?: string | null;
  address: string;
  preferredDate: string;
  preferredTime: string;
  instructions?: string;
  quotedPrice?: number;
  customerName?: string;
  customerPhone?: string;
  providerName?: string;
  serviceTitle?: string;
  categoryName?: string;
}

/**
 * Maps to PostgreSQL `reviews` table
 */
export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment: string;
  customerName?: string;
  customerAvatar?: string;
  serviceTitle?: string;
  createdAt: string;
}

export interface CreateReviewInput {
  bookingId: string;
  customerId: string;
  providerId?: string;
  rating: number;
  comment: string;
  customerName?: string;
  customerAvatar?: string;
  serviceTitle?: string;
}

/**
 * Maps to PostgreSQL `complaints` table
 */
export interface Complaint {
  id: string;
  bookingId: string;
  customerId: string;
  providerId?: string;
  subject: string;
  description: string;
  status: ComplaintStatus;
  customerName?: string;
  providerName?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintInput {
  bookingId: string;
  customerId: string;
  providerId?: string;
  subject: string;
  description: string;
  customerName?: string;
  providerName?: string;
}

/**
 * Search, filtering, and sorting criteria for Service Discovery
 */
export interface ProviderFilterCriteria {
  query?: string;
  categoryId?: string;
  categorySlug?: string;
  city?: CityLocation | string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  verifiedOnly?: boolean;
  availableOnly?: boolean;
  sortBy?: SortOption;
}

/**
 * Platform summary metrics for Admin Dashboard
 */
export interface PlatformStats {
  totalBookings: number;
  pendingBookings: number;
  acceptedBookings: number;
  inProgressBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  rejectedBookings: number;
  totalProviders: number;
  verifiedProviders: number;
  pendingVerificationProviders: number;
  totalCustomers: number;
  totalCategories: number;
  activeCategories: number;
  totalReviews: number;
  averagePlatformRating: number;
  totalRevenueBDT: number;
  openComplaints: number;
  resolvedComplaints: number;
  bookingsByStatus: { status: BookingStatus; count: number }[];
  bookingsByCity: { city: CityLocation; count: number }[];
}
