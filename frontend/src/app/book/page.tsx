import React, { Suspense } from 'react';
import { SharedLayout } from '@/components/layout/SharedLayout';
import { LoadingState } from '@/components/ui';
import { BookingForm } from '@/components/booking/BookingForm';

export default function BookServicePage() {
  return (
    <SharedLayout>
      <Suspense
        fallback={
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <LoadingState variant="spinner" message="Loading booking form..." />
          </div>
        }
      >
        <BookingForm />
      </Suspense>
    </SharedLayout>
  );
}
