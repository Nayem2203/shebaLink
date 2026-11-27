import React, { Suspense } from 'react';
import { SharedLayout } from '@/components/layout/SharedLayout';
import { LoadingState } from '@/components/ui';
import { ServiceDiscoveryClient } from '@/components/services/ServiceDiscoveryClient';

export default function ServicesPage() {
  return (
    <SharedLayout>
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <LoadingState variant="skeleton-cards" count={6} />
          </div>
        }
      >
        <ServiceDiscoveryClient />
      </Suspense>
    </SharedLayout>
  );
}
