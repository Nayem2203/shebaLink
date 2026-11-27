import { beforeEach, describe, expect, it } from 'vitest';
import { INITIAL_BOOKINGS } from '@/data/bookings';
import { INITIAL_COMPLAINTS } from '@/data/complaints';
import { INITIAL_REVIEWS } from '@/data/reviews';
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
import {
  cancelBooking,
  createBooking,
  createReview,
  getBookingById,
  getBookings,
  getReviewsByProvider,
  updateBookingStatus,
} from '@/services/bookingService';
import {
  canTransitionBookingStatus,
  getAllowedNextStatuses,
  validateStatusTransition,
} from '@/services/bookingStatusEngine';
import {
  bookingFormSchema,
  getTodayIsoDate,
  validateCreateBooking,
  validateReviewSubmission,
} from '@/services/bookingValidator';
import { getProviderById } from '@/services/discoveryService';
import type { BookingStatus } from '@/types';

describe('ShebaLink Booking Engine, Validation, Persistence & Reviews', () => {
  beforeEach(() => {
    clearCatalogMemoryCache();
    clearBookingMemoryCache();
    resetCatalogStorage();
    resetBookingStorage();
    initializeCatalogStorage();
    initializeBookingStorage();
  });

  it('meets seed data minimums across all 6 booking statuses, reviews, and complaints', () => {
    expect(INITIAL_BOOKINGS.length).toBeGreaterThanOrEqual(20);
    expect(INITIAL_REVIEWS.length).toBeGreaterThanOrEqual(15);
    expect(INITIAL_COMPLAINTS.length).toBeGreaterThanOrEqual(5);

    const expectedStatuses: BookingStatus[] = [
      'Pending',
      'Accepted',
      'Rejected',
      'In Progress',
      'Completed',
      'Cancelled',
    ];
    const present = new Set(INITIAL_BOOKINGS.map((b) => b.status));
    expectedStatuses.forEach((st) => {
      expect(present.has(st)).toBe(true);
    });
  });

  it('enforces centralized booking status transitions and role permissions', () => {
    expect(canTransitionBookingStatus('Pending', 'Accepted', 'provider')).toBe(true);
    expect(canTransitionBookingStatus('Pending', 'Rejected', 'provider')).toBe(true);
    expect(canTransitionBookingStatus('Pending', 'Cancelled', 'customer')).toBe(true);
    expect(canTransitionBookingStatus('Accepted', 'In Progress', 'provider')).toBe(true);
    expect(canTransitionBookingStatus('Accepted', 'Cancelled', 'provider')).toBe(true);
    expect(canTransitionBookingStatus('In Progress', 'Completed', 'provider')).toBe(true);

    // Invalid skips and terminal transitions
    expect(canTransitionBookingStatus('Pending', 'Completed', 'provider')).toBe(false);
    expect(canTransitionBookingStatus('Pending', 'In Progress', 'provider')).toBe(false);
    expect(canTransitionBookingStatus('In Progress', 'Cancelled', 'provider')).toBe(false);
    expect(canTransitionBookingStatus('Completed', 'Cancelled', 'admin')).toBe(false);
    expect(canTransitionBookingStatus('Rejected', 'Accepted', 'provider')).toBe(false);
    expect(canTransitionBookingStatus('Cancelled', 'Pending', 'admin')).toBe(false);

    // Customer cannot accept or complete bookings or cancel accepted ones
    expect(canTransitionBookingStatus('Pending', 'Accepted', 'customer')).toBe(false);
    expect(canTransitionBookingStatus('Accepted', 'Cancelled', 'customer')).toBe(false);

    expect(getAllowedNextStatuses('Pending', 'customer')).toEqual(['Cancelled']);
    expect(getAllowedNextStatuses('Completed', 'provider')).toEqual([]);

    const invalidCheck = validateStatusTransition('Completed', 'Pending', 'admin');
    expect(invalidCheck.valid).toBe(false);
    expect(invalidCheck.error).toBeDefined();
  });

  it('validates booking request inputs via Zod schema and pure validator', () => {
    const today = getTodayIsoDate();

    const bad = validateCreateBooking({
      customerId: 'cust-001',
      providerId: 'prov-001',
      serviceId: 'srv-001',
      problemDescription: 'short',
      address: 'abc',
      customerPhone: '12345',
      preferredDate: '2020-01-01',
      preferredTime: '',
    });
    expect(bad.valid).toBe(false);
    expect(bad.errors.problemDescription).toBeDefined();
    expect(bad.errors.address).toBeDefined();
    expect(bad.errors.customerPhone).toBeDefined();
    expect(bad.errors.preferredDate).toBeDefined();
    expect(bad.errors.preferredTime).toBeDefined();

    const parsed = bookingFormSchema.safeParse({
      providerId: 'prov-001',
      serviceId: 'srv-001',
      problemDescription: 'Kitchen circuit breaker trips whenever toaster runs.',
      address: 'House 24, Padma Residential Area, Rajshahi',
      customerPhone: '+8801711223344',
      preferredDate: today,
      preferredTime: '10:30 AM',
      instructions: 'Call on arrival.',
    });
    expect(parsed.success).toBe(true);
  });

  it('creates, persists, progresses, and cancels bookings cleanly', () => {
    const today = getTodayIsoDate();
    const initialCount = getBookings().length;

    const created = createBooking({
      customerId: 'cust-001',
      customerName: 'Tariqul Islam',
      customerPhone: '+8801711223344',
      providerId: 'prov-001',
      providerName: 'Rahim Uddin',
      serviceId: 'srv-001',
      serviceTitle: 'Electrical Inspection & Switchboard Repair',
      problemDescription: 'Main switchboard overheating near kitchen line.',
      address: 'House 24, Padma Residential, Rajshahi',
      preferredDate: today,
      preferredTime: '10:30 AM',
      quotedPrice: 500,
    });

    expect(created.success).toBe(true);
    if (!created.success) return;

    expect(created.booking.id).toMatch(/^bk-/);
    expect(created.booking.status).toBe('Pending');
    expect(getBookings().length).toBe(initialCount + 1);
    expect(getBookingById(created.booking.id)?.status).toBe('Pending');

    // Customer cancels eligible pending booking
    const cancelled = cancelBooking(created.booking.id, 'customer');
    expect(cancelled.success).toBe(true);
    expect(getBookingById(created.booking.id)?.status).toBe('Cancelled');

    // Provider cannot accept a cancelled booking
    const invalidAccept = updateBookingStatus(
      created.booking.id,
      'Accepted',
      'provider'
    );
    expect(invalidAccept.success).toBe(false);
  });

  it('enforces review eligibility and updates provider rating on completed booking review', () => {
    // Reject review on Pending booking bk-018
    const pendingAttempt = createReview({
      bookingId: 'bk-018',
      customerId: 'cust-001',
      rating: 5,
      comment: 'Cannot review before completion.',
    });
    expect(pendingAttempt.success).toBe(false);

    // Reject duplicate review on already-reviewed bk-001
    const duplicateAttempt = createReview({
      bookingId: 'bk-001',
      customerId: 'cust-001',
      rating: 4,
      comment: 'Duplicate review attempt.',
    });
    expect(duplicateAttempt.success).toBe(false);

    // Reject wrong customer on bk-017 (owned by cust-001)
    const wrongOwner = validateReviewSubmission(
      {
        bookingId: 'bk-017',
        customerId: 'cust-002',
        rating: 5,
        comment: 'Wrong customer trying to review.',
      },
      getBookingById('bk-017')
    );
    expect(wrongOwner.valid).toBe(false);

    // Submit valid review for completed unreviewed booking bk-017 (prov-002 Kamrul Hasan)
    const beforeReviews = getReviewsByProvider('prov-002').length;
    const beforeProviderCount = getProviderById('prov-002')?.reviewCount ?? 0;

    const okReview = createReview({
      bookingId: 'bk-017',
      customerId: 'cust-001',
      rating: 5,
      comment: 'Flush tank repair was quick and leak-free.',
    });
    expect(okReview.success).toBe(true);
    expect(getReviewsByProvider('prov-002').length).toBe(beforeReviews + 1);
    expect(getProviderById('prov-002')?.reviewCount).toBe(beforeProviderCount + 1);
  });
});
