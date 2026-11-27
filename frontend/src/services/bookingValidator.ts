import { z } from 'zod';
import type {
  Booking,
  CreateBookingInput,
  CreateReviewInput,
  Review,
} from '@/types';

const BD_PHONE_REGEX = /^(\+88)?01[3-9]\d{8}$/;

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const bookingFormSchema = z.object({
  providerId: z.string().trim().min(1, 'Please select a service provider.'),
  serviceId: z.string().trim().min(1, 'Please select a service.'),
  problemDescription: z
    .string()
    .trim()
    .min(10, 'Describe the problem in at least 10 characters.')
    .max(600, 'Problem description cannot exceed 600 characters.'),
  address: z
    .string()
    .trim()
    .min(5, 'Please provide a complete service address (min 5 characters).')
    .max(250, 'Address cannot exceed 250 characters.'),
  customerPhone: z
    .string()
    .trim()
    .regex(
      BD_PHONE_REGEX,
      'Enter a valid Bangladesh phone number (e.g., +8801711223344 or 01711223344).'
    ),
  preferredDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose a valid preferred date.')
    .refine(
      (dateStr) => dateStr >= getTodayIsoDate(),
      'Preferred date cannot be in the past.'
    ),
  preferredTime: z
    .string()
    .trim()
    .min(1, 'Please select a preferred time slot.'),
  instructions: z
    .string()
    .trim()
    .max(300, 'Instructions cannot exceed 300 characters.')
    .optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const reviewFormSchema = z.object({
  rating: z
    .number({ invalid_type_error: 'Rating must be a number between 1 and 5.' })
    .int('Rating must be a whole number.')
    .min(1, 'Rating must be at least 1 star.')
    .max(5, 'Rating cannot exceed 5 stars.'),
  comment: z
    .string()
    .trim()
    .min(5, 'Please write a short review (at least 5 characters).')
    .max(500, 'Review comment cannot exceed 500 characters.'),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function validateCreateBooking(
  input: CreateBookingInput,
  options?: { allowPastDateForTests?: boolean }
): {
  valid: boolean;
  errors: Partial<Record<keyof CreateBookingInput, string>>;
} {
  const errors: Partial<Record<keyof CreateBookingInput, string>> = {};

  if (!input.customerId?.trim()) {
    errors.customerId = 'Customer ID is required.';
  }
  if (!input.providerId?.trim()) {
    errors.providerId = 'Provider selection is required.';
  }
  if (!input.serviceId?.trim()) {
    errors.serviceId = 'Service selection is required.';
  }
  if (!input.problemDescription || input.problemDescription.trim().length < 10) {
    errors.problemDescription =
      'Describe the problem in at least 10 characters.';
  }
  if (!input.address || input.address.trim().length < 5) {
    errors.address = 'Please provide a valid service address (min 5 characters).';
  }
  if (input.customerPhone && !BD_PHONE_REGEX.test(input.customerPhone.trim())) {
    errors.customerPhone =
      'Enter a valid Bangladesh phone number (+8801XXXXXXXXX).';
  }
  if (!input.preferredDate || !/^\d{4}-\d{2}-\d{2}$/.test(input.preferredDate.trim())) {
    errors.preferredDate = 'Please select a valid preferred date.';
  } else if (
    !options?.allowPastDateForTests &&
    input.preferredDate.trim() < getTodayIsoDate()
  ) {
    errors.preferredDate = 'Preferred date cannot be in the past.';
  }
  if (!input.preferredTime?.trim()) {
    errors.preferredTime = 'Please select a preferred time slot.';
  }
  if (
    input.imagePreview &&
    !input.imagePreview.startsWith('data:image/') &&
    !input.imagePreview.startsWith('/') &&
    !input.imagePreview.startsWith('http')
  ) {
    errors.imagePreview = 'Invalid image preview format.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateReviewSubmission(
  input: CreateReviewInput,
  booking?: Booking,
  existingReview?: Review
): { valid: boolean; error?: string } {
  if (!booking) {
    return { valid: false, error: 'Booking does not exist.' };
  }
  if (booking.status !== 'Completed') {
    return {
      valid: false,
      error: 'Reviews can only be submitted for completed bookings.',
    };
  }
  if (booking.customerId !== input.customerId) {
    return {
      valid: false,
      error: 'Only the customer who placed this booking can review it.',
    };
  }
  if (existingReview) {
    return {
      valid: false,
      error: 'A review has already been submitted for this booking.',
    };
  }
  if (
    !Number.isInteger(input.rating) ||
    input.rating < 1 ||
    input.rating > 5
  ) {
    return {
      valid: false,
      error: 'Rating must be an integer between 1 and 5.',
    };
  }
  if (!input.comment || input.comment.trim().length < 5) {
    return {
      valid: false,
      error: 'Review comment must be at least 5 characters.',
    };
  }

  return { valid: true };
}
