import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearBookingMemoryCache,
  initializeBookingStorage,
  resetBookingStorage,
} from '@/lib/storage/bookingStorage';
import {
  clearCatalogMemoryCache,
  initializeCatalogStorage,
  resetCatalogStorage,
} from '@/lib/storage/catalogStorage';
import { getPlatformStats, resetAllDemoData } from '@/services/adminService';
import { updateBookingStatus } from '@/services/bookingService';

describe('ShebaLink Admin Platform Stats & Demo Reset', () => {
  beforeEach(() => {
    clearCatalogMemoryCache();
    clearBookingMemoryCache();
    resetCatalogStorage();
    resetBookingStorage();
    initializeCatalogStorage();
    initializeBookingStorage();
  });

  it('computes accurate platform statistics across bookings, providers, categories, and complaints', () => {
    const stats = getPlatformStats();
    expect(stats.totalBookings).toBeGreaterThanOrEqual(20);
    expect(stats.totalProviders).toBeGreaterThanOrEqual(15);
    expect(stats.totalCategories).toBeGreaterThanOrEqual(12);
    expect(stats.totalReviews).toBeGreaterThanOrEqual(15);
    expect(stats.openComplaints).toBeGreaterThanOrEqual(1);

    const statusSum = stats.bookingsByStatus.reduce(
      (sum, row) => sum + row.count,
      0
    );
    expect(statusSum).toBe(stats.totalBookings);

    const citySum = stats.bookingsByCity.reduce(
      (sum, row) => sum + row.count,
      0
    );
    expect(citySum).toBe(stats.totalBookings);
  });

  it('resets mutations back to initial seed state via resetAllDemoData', () => {
    const beforePending = getPlatformStats().pendingBookings;
    updateBookingStatus('bk-018', 'Accepted', 'provider');
    expect(getPlatformStats().pendingBookings).toBe(beforePending - 1);

    resetAllDemoData();
    expect(getPlatformStats().pendingBookings).toBe(beforePending);
  });
});
