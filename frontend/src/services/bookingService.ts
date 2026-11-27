import { EntityFactory } from '@/lib/patterns/FactoryPattern';
import {
  getStoredBookings,
  getStoredComplaints,
  getStoredCustomers,
  getStoredReviews,
  saveStoredBookings,
  saveStoredComplaints,
  saveStoredReviews,
} from '@/lib/storage/bookingStorage';
import {
  getStoredProviders,
  updateStoredProviderRating,
} from '@/lib/storage/catalogStorage';
import { validateStatusTransition } from '@/services/bookingStatusEngine';
import {
  validateCreateBooking,
  validateReviewSubmission,
} from '@/services/bookingValidator';
import type {
  Booking,
  BookingStatus,
  Complaint,
  ComplaintStatus,
  CreateBookingInput,
  CreateComplaintInput,
  CreateReviewInput,
  Review,
  User,
  UserRole,
} from '@/types';

export function getBookings(): Booking[] {
  return [...getStoredBookings()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export function getBookingById(id: string): Booking | undefined {
  return getStoredBookings().find((b) => b.id === id);
}

export function getBookingsByCustomer(customerId: string): Booking[] {
  return getBookings().filter((b) => b.customerId === customerId);
}

export function getBookingsByProvider(providerId: string): Booking[] {
  return getBookings().filter((b) => b.providerId === providerId);
}

export function createBooking(
  input: CreateBookingInput
): { success: true; booking: Booking } | { success: false; error: string } {
  const validation = validateCreateBooking(input);
  if (!validation.valid) {
    const firstError =
      Object.values(validation.errors)[0] ?? 'Invalid booking request data.';
    return { success: false, error: firstError };
  }

  const newBooking = EntityFactory.createBooking(input);
  const current = getStoredBookings();
  saveStoredBookings([newBooking, ...current], 'create', newBooking.id);
  return { success: true, booking: newBooking };
}

export function updateBookingStatus(
  bookingId: string,
  nextStatus: BookingStatus,
  actorRole?: UserRole
): { success: true; booking: Booking } | { success: false; error: string } {
  const bookings = getStoredBookings();
  const target = bookings.find((b) => b.id === bookingId);
  if (!target) {
    return { success: false, error: 'Booking not found.' };
  }

  const transitionCheck = validateStatusTransition(
    target.status,
    nextStatus,
    actorRole
  );
  if (!transitionCheck.valid) {
    return {
      success: false,
      error: transitionCheck.error ?? 'Invalid status transition.',
    };
  }

  const updatedBooking: Booking = {
    ...target,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };

  const nextList = bookings.map((b) =>
    b.id === bookingId ? updatedBooking : b
  );
  saveStoredBookings(nextList, 'update', bookingId);
  return { success: true, booking: updatedBooking };
}

export function cancelBooking(
  bookingId: string,
  actorRole: UserRole = 'customer'
): { success: true; booking: Booking } | { success: false; error: string } {
  return updateBookingStatus(bookingId, 'Cancelled', actorRole);
}

export function getReviews(): Review[] {
  return [...getStoredReviews()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export function getReviewsByProvider(providerId: string): Review[] {
  return getReviews().filter((r) => r.providerId === providerId);
}

export function getReviewByBookingId(bookingId: string): Review | undefined {
  return getStoredReviews().find((r) => r.bookingId === bookingId);
}

export function createReview(
  input: CreateReviewInput
): { success: true; review: Review } | { success: false; error: string } {
  const booking = getBookingById(input.bookingId);
  const existingReview = getReviewByBookingId(input.bookingId);

  const check = validateReviewSubmission(input, booking, existingReview);
  if (!check.valid || !booking) {
    return {
      success: false,
      error: check.error ?? 'Cannot submit review for this booking.',
    };
  }

  const review = EntityFactory.createReview({
    ...input,
    providerId: input.providerId ?? booking.providerId,
    customerName: input.customerName ?? booking.customerName,
    serviceTitle: input.serviceTitle ?? booking.serviceTitle,
  });

  const currentReviews = getStoredReviews();
  const nextReviews = [review, ...currentReviews];
  saveStoredReviews(nextReviews, 'create', review.id);

  // Recalculate provider rating & reviewCount cleanly
  const providerReviews = nextReviews.filter(
    (r) => r.providerId === review.providerId
  );
  const provider = getStoredProviders().find((p) => p.id === review.providerId);
  if (provider && providerReviews.length > 0) {
    const sum = providerReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = sum / providerReviews.length;
    updateStoredProviderRating(
      provider.id,
      avg,
      Math.max(provider.reviewCount + 1, providerReviews.length)
    );
  }

  return { success: true, review };
}

export function getComplaints(): Complaint[] {
  return [...getStoredComplaints()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export function createComplaint(
  input: CreateComplaintInput
): { success: true; complaint: Complaint } | { success: false; error: string } {
  if (!input.subject.trim() || !input.description.trim()) {
    return {
      success: false,
      error: 'Complaint subject and description are required.',
    };
  }
  const complaint = EntityFactory.createComplaint(input);
  const current = getStoredComplaints();
  saveStoredComplaints([complaint, ...current], 'create', complaint.id);
  return { success: true, complaint };
}

export function updateComplaintStatus(
  complaintId: string,
  status: ComplaintStatus,
  resolutionNotes?: string
): Complaint | undefined {
  const current = getStoredComplaints();
  let updated: Complaint | undefined;
  const next = current.map((c) => {
    if (c.id !== complaintId) return c;
    updated = {
      ...c,
      status,
      resolutionNotes: resolutionNotes ?? c.resolutionNotes,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  if (updated) {
    saveStoredComplaints(next, 'update', complaintId);
  }
  return updated;
}

export function getCustomers(): User[] {
  return getStoredCustomers();
}
