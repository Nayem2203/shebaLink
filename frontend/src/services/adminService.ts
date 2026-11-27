import {
  getStoredBookings,
  getStoredComplaints,
  getStoredCustomers,
  getStoredReviews,
  resetBookingStorage,
} from '@/lib/storage/bookingStorage';
import {
  getStoredCategories,
  getStoredProviders,
  resetCatalogStorage,
} from '@/lib/storage/catalogStorage';
import type { BookingStatus, CityLocation, PlatformStats } from '@/types';

const STATUS_ORDER: BookingStatus[] = [
  'Pending',
  'Accepted',
  'In Progress',
  'Completed',
  'Rejected',
  'Cancelled',
];

const CITIES: CityLocation[] = ['Rajshahi', 'Dhaka', 'Chattogram'];

export function getPlatformStats(): PlatformStats {
  const bookings = getStoredBookings();
  const providers = getStoredProviders();
  const customers = getStoredCustomers();
  const categories = getStoredCategories();
  const reviews = getStoredReviews();
  const complaints = getStoredComplaints();

  const statusCounts = new Map<BookingStatus, number>();
  STATUS_ORDER.forEach((s) => statusCounts.set(s, 0));
  bookings.forEach((b) => {
    statusCounts.set(b.status, (statusCounts.get(b.status) ?? 0) + 1);
  });

  const providerCityMap = new Map(providers.map((p) => [p.id, p.primaryCity]));
  const cityCounts = new Map<CityLocation, number>();
  CITIES.forEach((c) => cityCounts.set(c, 0));

  bookings.forEach((b) => {
    const city = providerCityMap.get(b.providerId) ?? 'Rajshahi';
    cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1);
  });

  const completedRevenue = bookings
    .filter((b) => b.status === 'Completed')
    .reduce((sum, b) => sum + (b.quotedPrice ?? 0), 0);

  const avgRating =
    reviews.length > 0
      ? Number(
          (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1)
        )
      : 0;

  return {
    totalBookings: bookings.length,
    pendingBookings: statusCounts.get('Pending') ?? 0,
    acceptedBookings: statusCounts.get('Accepted') ?? 0,
    inProgressBookings: statusCounts.get('In Progress') ?? 0,
    completedBookings: statusCounts.get('Completed') ?? 0,
    cancelledBookings: statusCounts.get('Cancelled') ?? 0,
    rejectedBookings: statusCounts.get('Rejected') ?? 0,
    totalProviders: providers.length,
    verifiedProviders: providers.filter((p) => p.verifiedStatus === 'verified')
      .length,
    pendingVerificationProviders: providers.filter(
      (p) => p.verifiedStatus === 'pending'
    ).length,
    totalCustomers: customers.length,
    totalCategories: categories.length,
    activeCategories: categories.filter((c) => c.active).length,
    totalReviews: reviews.length,
    averagePlatformRating: avgRating,
    totalRevenueBDT: completedRevenue,
    openComplaints: complaints.filter(
      (c) => c.status === 'Open' || c.status === 'In Review'
    ).length,
    resolvedComplaints: complaints.filter((c) => c.status === 'Resolved')
      .length,
    bookingsByStatus: STATUS_ORDER.map((status) => ({
      status,
      count: statusCounts.get(status) ?? 0,
    })),
    bookingsByCity: CITIES.map((city) => ({
      city,
      count: cityCounts.get(city) ?? 0,
    })),
  };
}

export function resetAllDemoData(): void {
  resetCatalogStorage();
  resetBookingStorage();
}
