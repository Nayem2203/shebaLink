'use client';

import React, { useEffect, useState } from 'react';
import { Star, X } from 'lucide-react';
import { Button, Textarea } from '@/components/ui';
import { reviewFormSchema } from '@/services/bookingValidator';
import type { Booking } from '@/types';

export interface ReviewModalProps {
  booking: Booking | null;
  onClose: () => void;
  onSubmitReview: (bookingId: string, rating: number, comment: string) => void;
}

export function ReviewModal({
  booking,
  onClose,
  onSubmitReview,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!booking) return;
    setRating(5);
    setComment('');
    setError(null);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [booking, onClose]);

  if (!booking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = reviewFormSchema.safeParse({ rating, comment });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid review input.');
      return;
    }
    onSubmitReview(booking.id, parsed.data.rating, parsed.data.comment);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/45 p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-2xl border border-zinc-900/10 bg-white p-6 shadow-[0_8px_24px_rgba(24,24,27,0.12)] animate-enter"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close review modal"
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 hover:text-zinc-700"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <h2
          id="review-modal-title"
          className="text-lg font-semibold text-zinc-900"
        >
          Review completed service
        </h2>
        <p className="mt-1 text-xs text-zinc-600">
          {booking.serviceTitle} with{' '}
          <strong className="font-medium text-zinc-900">
            {booking.providerName}
          </strong>
        </p>

        <div className="mt-5">
          <span className="block text-sm font-medium text-zinc-800">
            Rating
          </span>
          <div className="mt-2 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const selected = star <= rating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} out of 5`}
                  className="rounded-lg border border-zinc-900/10 bg-surface-canvas p-2 transition-colors duration-150 hover:bg-surface-subtle"
                >
                  <Star
                    className={`h-5 w-5 ${
                      selected
                        ? 'fill-amber-500 text-amber-500'
                        : 'text-zinc-300'
                    }`}
                    strokeWidth={1.5}
                  />
                </button>
              );
            })}
            <span className="ml-2 font-mono text-sm font-medium text-zinc-700 tabular-nums">
              {rating}/5
            </span>
          </div>
        </div>

        <div className="mt-4">
          <Textarea
            label="Written review"
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share punctuality, workmanship, and price clarity"
            error={error ?? undefined}
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Submit Review
          </Button>
        </div>
      </form>
    </div>
  );
}
