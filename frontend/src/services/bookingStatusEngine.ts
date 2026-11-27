import type { BookingStatus, UserRole } from '@/types';

/**
 * Centralized Booking Status Transition Rules (FR-08, FR-09, FR-10)
 * Pending -> Accepted | Rejected | Cancelled
 * Accepted -> In Progress | Cancelled
 * In Progress -> Completed
 * Rejected | Completed | Cancelled -> Terminal (no further transitions)
 */
export const ALLOWED_TRANSITIONS: Record<
  BookingStatus,
  readonly BookingStatus[]
> = {
  Pending: ['Accepted', 'Rejected', 'Cancelled'],
  Accepted: ['In Progress', 'Cancelled'],
  'In Progress': ['Completed'],
  Rejected: [],
  Completed: [],
  Cancelled: [],
};

export const TERMINAL_BOOKING_STATUSES: readonly BookingStatus[] = [
  'Rejected',
  'Completed',
  'Cancelled',
];

const ROLE_ALLOWED_TARGETS: Record<UserRole, readonly BookingStatus[]> = {
  customer: ['Cancelled'],
  provider: ['Accepted', 'Rejected', 'In Progress', 'Completed', 'Cancelled'],
  admin: ['Accepted', 'Rejected', 'In Progress', 'Completed', 'Cancelled'],
};

export function isTerminalStatus(status: BookingStatus): boolean {
  return TERMINAL_BOOKING_STATUSES.includes(status);
}

export function canTransitionBookingStatus(
  from: BookingStatus,
  to: BookingStatus,
  actorRole?: UserRole
): boolean {
  if (from === to) return false;

  const allowedNext = ALLOWED_TRANSITIONS[from] ?? [];
  if (!allowedNext.includes(to)) {
    return false;
  }

  if (actorRole) {
    // Customer can cancel eligible pending bookings (and accepted bookings per policy,
    // while FR-08 primarily highlights pending cancellation; wait — let's restrict customer
    // cancellation to Pending only so FR-08 "eligible pending bookings" is strictly honored!)
    if (actorRole === 'customer') {
      return from === 'Pending' && to === 'Cancelled';
    }
    return ROLE_ALLOWED_TARGETS[actorRole].includes(to);
  }

  return true;
}

export function getAllowedNextStatuses(
  current: BookingStatus,
  actorRole?: UserRole
): BookingStatus[] {
  const candidates = ALLOWED_TRANSITIONS[current] ?? [];
  return candidates.filter((next) =>
    canTransitionBookingStatus(current, next, actorRole)
  );
}

export function validateStatusTransition(
  from: BookingStatus,
  to: BookingStatus,
  actorRole?: UserRole
): { valid: boolean; error?: string } {
  if (from === to) {
    return {
      valid: false,
      error: `Booking is already in '${from}' status.`,
    };
  }

  if (isTerminalStatus(from)) {
    return {
      valid: false,
      error: `Cannot transition from terminal status '${from}'.`,
    };
  }

  const allowed = ALLOWED_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    return {
      valid: false,
      error: `Transition from '${from}' to '${to}' is not allowed.`,
    };
  }

  if (actorRole === 'customer' && !(from === 'Pending' && to === 'Cancelled')) {
    return {
      valid: false,
      error: 'Customers can only cancel pending bookings.',
    };
  }

  if (actorRole && !ROLE_ALLOWED_TARGETS[actorRole].includes(to)) {
    return {
      valid: false,
      error: `Role '${actorRole}' is not permitted to transition a booking to '${to}'.`,
    };
  }

  return { valid: true };
}
