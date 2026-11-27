'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  Wrench,
  Star,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Eye,
} from 'lucide-react';
import type { Booking, BookingStatus, UserRole } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { PriceDisplay } from './PriceDisplay';

export interface BookingCardProps {
  booking: Booking;
  providerName?: string;
  customerName?: string;
  serviceName?: string;
  viewerRole: UserRole;
  allowedTransitions?: BookingStatus[];
  canCancel?: boolean;
  canReview?: boolean;
  hasReview?: boolean;
  onStatusChange?: (bookingId: string, nextStatus: BookingStatus) => void;
  onCancel?: (bookingId: string) => void;
  onReview?: (bookingId: string) => void;
  onViewDetails?: (bookingId: string) => void;
  className?: string;
}

export function BookingCard({
  booking,
  providerName,
  customerName,
  serviceName,
  viewerRole,
  allowedTransitions = [],
  canCancel = false,
  canReview = false,
  hasReview = false,
  onStatusChange,
  onCancel,
  onReview,
  onViewDetails,
  className = '',
}: BookingCardProps) {
  const displayService =
    serviceName ||
    booking.serviceTitle ||
    booking.categoryName ||
    'Household Service Request';
  const displayProvider =
    providerName || booking.providerName || `Provider #${booking.providerId}`;
  const displayCustomer =
    customerName || booking.customerName || `Customer #${booking.customerId}`;

  return (
    <article
      className={[
        'bg-white border border-zinc-900/10 rounded-xl shadow-[0_1px_2px_rgba(24,24,27,0.04)] p-5 flex flex-col justify-between gap-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-zinc-600 bg-surface-subtle px-2 py-0.5 rounded">
                {booking.id}
              </span>
              {booking.categoryName && (
                <span className="text-xs font-medium text-zinc-600">
                  {booking.categoryName}
                </span>
              )}
            </div>
            <h3 className="mt-2 text-base font-medium text-zinc-900">
              {displayService}
            </h3>
          </div>
          <StatusBadge status={booking.status} size="md" />
        </div>

        <p className="mt-2 text-sm text-zinc-600 line-clamp-2 leading-relaxed">
          {booking.problemDescription}
        </p>

        <div className="mt-4 pt-3 border-t border-zinc-900/5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-600">
          {viewerRole !== 'provider' && (
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span>
                Provider:{' '}
                <strong className="font-medium text-zinc-900">
                  {displayProvider}
                </strong>
              </span>
            </div>
          )}

          {viewerRole !== 'customer' && (
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span>
                Customer:{' '}
                <strong className="font-medium text-zinc-900">
                  {displayCustomer}
                </strong>
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 font-mono tabular-nums">
            <Calendar className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span>{booking.preferredDate}</span>
            <Clock className="w-4 h-4 text-zinc-400 shrink-0 ml-1" strokeWidth={1.5} aria-hidden="true" />
            <span>{booking.preferredTime}</span>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <MapPin className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className="truncate">{booking.address}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-zinc-900/5 flex items-center justify-between gap-3 flex-wrap">
        <div>
          {booking.quotedPrice !== undefined ? (
            <PriceDisplay
              amount={booking.quotedPrice}
              prefix="Est."
              size="sm"
            />
          ) : (
            <span className="text-xs text-zinc-500 font-mono tabular-nums">
              {new Date(booking.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Eye className="w-4 h-4" strokeWidth={1.5} />}
              onClick={() => onViewDetails(booking.id)}
            >
              Details
            </Button>
          )}

          {viewerRole === 'provider' &&
            onStatusChange &&
            allowedTransitions.includes('Accepted') && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />}
                onClick={() => onStatusChange(booking.id, 'Accepted')}
              >
                Accept
              </Button>
            )}

          {viewerRole === 'provider' &&
            onStatusChange &&
            allowedTransitions.includes('Rejected') && (
              <Button
                variant="destructive"
                size="sm"
                leftIcon={<XCircle className="w-4 h-4" strokeWidth={1.5} />}
                onClick={() => onStatusChange(booking.id, 'Rejected')}
              >
                Reject
              </Button>
            )}

          {viewerRole === 'provider' &&
            onStatusChange &&
            allowedTransitions.includes('In Progress') && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlayCircle className="w-4 h-4" strokeWidth={1.5} />}
                onClick={() => onStatusChange(booking.id, 'In Progress')}
              >
                Start Work
              </Button>
            )}

          {viewerRole === 'provider' &&
            onStatusChange &&
            allowedTransitions.includes('Completed') && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />}
                onClick={() => onStatusChange(booking.id, 'Completed')}
              >
                Mark Completed
              </Button>
            )}

          {canCancel && onCancel && (
            <Button
              variant="outline"
              size="sm"
              className="text-rose-700 border-rose-900/15 hover:bg-rose-50"
              onClick={() => onCancel(booking.id)}
            >
              Cancel Booking
            </Button>
          )}

          {viewerRole === 'customer' &&
            booking.status === 'Completed' &&
            canReview &&
            !hasReview &&
            onReview && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Star className="w-4 h-4" strokeWidth={1.5} />}
                onClick={() => onReview(booking.id)}
              >
                Leave Review
              </Button>
            )}

          {viewerRole === 'customer' &&
            booking.status === 'Completed' &&
            hasReview && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-900 bg-emerald-50/80 border border-emerald-900/15 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                Reviewed
              </span>
            )}
        </div>
      </div>
    </article>
  );
}

export default BookingCard;
