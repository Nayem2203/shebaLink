import { beforeEach, describe, expect, it, vi } from 'vitest';
import { storageEventBus } from '@/lib/patterns/ObserverPattern';
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
import { createBooking } from '@/services/bookingService';
import { getTodayIsoDate } from '@/services/bookingValidator';
import { updateProviderVerification } from '@/services/discoveryService';

describe('ShebaLink Frontend Mock Isolation Tests', () => {
  beforeEach(() => {
    clearCatalogMemoryCache();
    clearBookingMemoryCache();
    resetCatalogStorage();
    resetBookingStorage();
    initializeCatalogStorage();
    initializeBookingStorage();
    vi.restoreAllMocks();
  });

  it('notifies mocked Observer subscribers when creating a booking', () => {
    const listener = vi.fn();
    const unsubscribe = storageEventBus.subscribe(listener);

    const res = createBooking({
      customerId: 'cust-001',
      customerName: 'Tariqul Islam',
      customerPhone: '+8801711223344',
      providerId: 'prov-001',
      providerName: 'Rahim Uddin',
      serviceId: 'srv-001',
      serviceTitle: 'Electrical Inspection & Switchboard Repair',
      problemDescription: 'Kitchen circuit breaker trips whenever induction stove turns on.',
      address: 'House 24, Padma Residential, Rajshahi',
      preferredDate: getTodayIsoDate(),
      preferredTime: '10:30 AM',
      quotedPrice: 500,
    });

    unsubscribe();

    expect(res.success).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        entity: 'bookings',
        action: 'create',
      })
    );
  });

  it('spies on storageEventBus.emitChange when admin updates provider verification', () => {
    const emitSpy = vi.spyOn(storageEventBus, 'emitChange');

    const updated = updateProviderVerification('prov-004', 'verified');
    expect(updated?.verifiedStatus).toBe('verified');
    expect(emitSpy).toHaveBeenCalledWith('providers', 'update');
  });
});
