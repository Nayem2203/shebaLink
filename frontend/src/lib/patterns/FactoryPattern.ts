/**
 * Factory Design Pattern — Standardized EntityFactory
 * Produces PostgreSQL-compatible Booking, Review, and Complaint domain records
 * with deterministic/stable ID prefixes and ISO 8601 timestamps.
 */

import {
  Booking,
  Complaint,
  CreateBookingInput,
  CreateComplaintInput,
  CreateReviewInput,
  Review,
} from '@/types';

export interface EntityFactoryOptions {
  idOverride?: string;
  nowOverride?: string;
}

export class EntityFactory {
  private static generateStableId(prefix: string): string {
    const timestampPart = Date.now().toString(36).slice(-5);
    const randomPart = Math.random().toString(36).substring(2, 6);
    return `${prefix}-${timestampPart}${randomPart}`;
  }

  /**
   * Creates a normalized Booking entity initialized to 'Pending' status
   */
  public static createBooking(
    input: CreateBookingInput,
    options?: EntityFactoryOptions
  ): Booking {
    const now = options?.nowOverride ?? new Date().toISOString();
    const id = options?.idOverride ?? this.generateStableId('bk');

    return {
      id,
      customerId: input.customerId.trim(),
      providerId: input.providerId.trim(),
      serviceId: input.serviceId.trim(),
      problemDescription: input.problemDescription.trim(),
      imagePreview: input.imagePreview ?? null,
      address: input.address.trim(),
      preferredDate: input.preferredDate.trim(),
      preferredTime: input.preferredTime.trim(),
      instructions: input.instructions?.trim() || '',
      status: 'Pending',
      quotedPrice: input.quotedPrice,
      customerName: input.customerName?.trim(),
      customerPhone: input.customerPhone?.trim(),
      providerName: input.providerName?.trim(),
      serviceTitle: input.serviceTitle?.trim(),
      categoryName: input.categoryName?.trim(),
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Creates a normalized Review entity with integer 1..5 rating
   */
  public static createReview(
    input: CreateReviewInput & { providerId: string },
    options?: EntityFactoryOptions
  ): Review {
    const now = options?.nowOverride ?? new Date().toISOString();
    const id = options?.idOverride ?? this.generateStableId('rev');
    const clampedRating = Math.min(5, Math.max(1, Math.round(input.rating)));

    return {
      id,
      bookingId: input.bookingId.trim(),
      customerId: input.customerId.trim(),
      providerId: input.providerId.trim(),
      rating: clampedRating,
      comment: input.comment.trim(),
      customerName: input.customerName?.trim(),
      customerAvatar: input.customerAvatar,
      serviceTitle: input.serviceTitle?.trim(),
      createdAt: now,
    };
  }

  /**
   * Creates a normalized Complaint entity initialized to 'Open' status
   */
  public static createComplaint(
    input: CreateComplaintInput,
    options?: EntityFactoryOptions
  ): Complaint {
    const now = options?.nowOverride ?? new Date().toISOString();
    const id = options?.idOverride ?? this.generateStableId('cmp');

    return {
      id,
      bookingId: input.bookingId.trim(),
      customerId: input.customerId.trim(),
      providerId: input.providerId?.trim(),
      subject: input.subject.trim(),
      description: input.description.trim(),
      status: 'Open',
      customerName: input.customerName?.trim(),
      providerName: input.providerName?.trim(),
      createdAt: now,
      updatedAt: now,
    };
  }
}
