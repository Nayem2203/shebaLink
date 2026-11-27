import { INITIAL_BOOKINGS } from '@/data/bookings';
import { INITIAL_COMPLAINTS } from '@/data/complaints';
import { INITIAL_REVIEWS } from '@/data/reviews';
import { INITIAL_CUSTOMERS } from '@/data/users';
import { storageEventBus } from '@/lib/patterns/ObserverPattern';
import type { Booking, Complaint, Review, User } from '@/types';

export const BOOKING_STORAGE_KEYS = {
  BOOKINGS: 'shebalink_bookings_v1',
  REVIEWS: 'shebalink_reviews_v1',
  COMPLAINTS: 'shebalink_complaints_v1',
  CUSTOMERS: 'shebalink_customers_v1',
} as const;

const memoryFallback = new Map<string, string>();

function canUseBrowserStorage(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined'
    );
  } catch {
    return false;
  }
}

function readRaw(key: string): string | null {
  if (canUseBrowserStorage()) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryFallback.get(key) ?? null;
    }
  }
  return memoryFallback.get(key) ?? null;
}

function writeRaw(key: string, value: string): void {
  memoryFallback.set(key, value);
  if (canUseBrowserStorage()) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore quota/private-mode errors
    }
  }
}

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

function readOrSeed<T>(key: string, seed: T[]): T[] {
  const existing = readRaw(key);
  if (existing) {
    try {
      const parsed = JSON.parse(existing) as T[];
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Re-seed if corrupted
    }
  }
  const clonedSeed = clone(seed);
  writeRaw(key, JSON.stringify(clonedSeed));
  return clonedSeed;
}

export function initializeBookingStorage(): void {
  readOrSeed(BOOKING_STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  readOrSeed(BOOKING_STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  readOrSeed(BOOKING_STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
  readOrSeed(BOOKING_STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
}

export function resetBookingStorage(): void {
  writeRaw(
    BOOKING_STORAGE_KEYS.BOOKINGS,
    JSON.stringify(clone(INITIAL_BOOKINGS))
  );
  writeRaw(
    BOOKING_STORAGE_KEYS.REVIEWS,
    JSON.stringify(clone(INITIAL_REVIEWS))
  );
  writeRaw(
    BOOKING_STORAGE_KEYS.COMPLAINTS,
    JSON.stringify(clone(INITIAL_COMPLAINTS))
  );
  writeRaw(
    BOOKING_STORAGE_KEYS.CUSTOMERS,
    JSON.stringify(clone(INITIAL_CUSTOMERS))
  );
  storageEventBus.emitChange('all', 'reset');
}

export function clearBookingMemoryCache(): void {
  memoryFallback.clear();
}

export function getStoredBookings(): Booking[] {
  return readOrSeed(BOOKING_STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
}

export function saveStoredBookings(
  bookings: Booking[],
  action: 'create' | 'update' | 'delete' = 'update',
  entityId?: string
): void {
  writeRaw(BOOKING_STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  storageEventBus.emitChange('bookings', action, entityId);
}

export function getStoredReviews(): Review[] {
  return readOrSeed(BOOKING_STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
}

export function saveStoredReviews(
  reviews: Review[],
  action: 'create' | 'update' | 'delete' = 'update',
  entityId?: string
): void {
  writeRaw(BOOKING_STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  storageEventBus.emitChange('reviews', action, entityId);
}

export function getStoredComplaints(): Complaint[] {
  return readOrSeed(BOOKING_STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
}

export function saveStoredComplaints(
  complaints: Complaint[],
  action: 'create' | 'update' | 'delete' = 'update',
  entityId?: string
): void {
  writeRaw(BOOKING_STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  storageEventBus.emitChange('complaints', action, entityId);
}

export function getStoredCustomers(): User[] {
  return readOrSeed(BOOKING_STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
}
