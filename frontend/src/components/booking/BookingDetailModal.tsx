'use client';

import React, { useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, User, Wrench, X } from 'lucide-react';
import { Button, StatusBadge } from '@/components/ui';
import { PriceDisplay } from '@/components/shared';
import type { Booking } from '@/types';

export interface BookingDetailModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export function BookingDetailModal({
  booking,
  onClose,
}: BookingDetailModalProps) {
  useEffect(() => {
    if (!booking) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [booking, onClose]);

  if (!booking) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/45 p-4"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-900/10 bg-white p-6 shadow-[0_8px_24px_rgba(24,24,27,0.12)] animate-enter max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close booking details"
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 hover:text-zinc-700"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <div className="flex flex-wrap items-center gap-2 pr-8">
          <span className="rounded bg-surface-subtle px-2 py-0.5 font-mono text-xs font-medium text-zinc-700 tabular-nums">
            {booking.id}
          </span>
          <StatusBadge status={booking.status} size="sm" />
        </div>

        <h2
          id="booking-detail-title"
          className="mt-3 text-lg font-semibold text-zinc-900"
        >
          {booking.serviceTitle || booking.categoryName || 'Service Request'}
        </h2>

        <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
          {booking.problemDescription}
        </p>

        {booking.imagePreview && (
          <div className="mt-4 overflow-hidden rounded-lg border border-zinc-900/10 bg-surface-canvas">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={booking.imagePreview}
              alt="Attached issue preview"
              className="max-h-52 w-full object-cover"
            />
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl border border-zinc-900/10 bg-surface-canvas p-4 text-xs sm:grid-cols-2">
          <div className="flex items-center gap-2 text-zinc-700">
            <Wrench className="h-4 w-4 text-zinc-400 shrink-0" strokeWidth={1.5} />
            <span>
              Provider:{' '}
              <strong className="font-medium text-zinc-900">
                {booking.providerName || booking.providerId}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-zinc-700">
            <User className="h-4 w-4 text-zinc-400 shrink-0" strokeWidth={1.5} />
            <span>
              Customer:{' '}
              <strong className="font-medium text-zinc-900">
                {booking.customerName || booking.customerId}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-zinc-700 tabular-nums">
            <Calendar className="h-4 w-4 text-zinc-400 shrink-0" strokeWidth={1.5} />
            <span>{booking.preferredDate}</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-zinc-700 tabular-nums">
            <Clock className="h-4 w-4 text-zinc-400 shrink-0" strokeWidth={1.5} />
            <span>{booking.preferredTime}</span>
          </div>

          {booking.customerPhone && (
            <div className="flex items-center gap-2 font-mono text-zinc-700 tabular-nums sm:col-span-2">
              <Phone className="h-4 w-4 text-zinc-400 shrink-0" strokeWidth={1.5} />
              <span>{booking.customerPhone}</span>
            </div>
          )}

          <div className="flex items-start gap-2 text-zinc-700 sm:col-span-2">
            <MapPin className="mt-0.5 h-4 w-4 text-zinc-400 shrink-0" strokeWidth={1.5} />
            <span>{booking.address}</span>
          </div>
        </div>

        {booking.instructions && (
          <div className="mt-4">
            <p className="text-xs font-medium text-zinc-500">
              Additional instructions
            </p>
            <p className="mt-1 text-sm text-zinc-700">{booking.instructions}</p>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-zinc-900/5 pt-4">
          <div>
            <span className="block text-xs text-zinc-500">Estimated rate</span>
            {booking.quotedPrice !== undefined ? (
              <PriceDisplay amount={booking.quotedPrice} size="md" />
            ) : (
              <span className="text-sm font-medium text-zinc-900">
                To be quoted
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
