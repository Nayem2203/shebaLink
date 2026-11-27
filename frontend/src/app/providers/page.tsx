'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { SharedLayout } from '@/components/layout/SharedLayout';
import { Select } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { PageHeader, ProviderCard } from '@/components/shared';
import { STORAGE_CUSTOM_EVENT_NAME } from '@/lib/patterns/ObserverPattern';
import { searchAndFilterProviders } from '@/services/discoveryService';
import type { ProviderProfile, SortOption } from '@/types';

const CITY_TABS = ['All', 'Rajshahi', 'Dhaka', 'Chattogram'] as const;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'price-asc', label: 'Lowest Starting Price' },
  { value: 'price-desc', label: 'Highest Starting Price' },
  { value: 'experience-desc', label: 'Most Experienced' },
  { value: 'relevance', label: 'Relevance' },
];

export default function ProvidersDirectoryPage() {
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('rating-desc');
  const [storageTick, setStorageTick] = useState(0);

  useEffect(() => {
    const onStorage = () => setStorageTick((t) => t + 1);
    window.addEventListener(STORAGE_CUSTOM_EVENT_NAME, onStorage);
    return () => {
      window.removeEventListener(STORAGE_CUSTOM_EVENT_NAME, onStorage);
    };
  }, []);

  const providers: ProviderProfile[] = useMemo(() => {
    void storageTick;
    return searchAndFilterProviders({
      city: selectedCity === 'All' ? undefined : selectedCity,
      verifiedOnly,
      sortBy,
    });
  }, [selectedCity, verifiedOnly, sortBy, storageTick]);

  return (
    <SharedLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Local Service Providers"
          subtitle="Compare verified professionals, ratings, experience, availability, and transparent BDT starting prices."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Providers' },
          ]}
          actions={
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Advanced Search &amp; Filters</span>
            </Link>
          }
        />

        {/* Quick Filter Bar */}
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {CITY_TABS.map((city) => {
              const active = selectedCity === city;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'border-indigo-900 bg-indigo-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {city === 'All' ? 'All Cities' : city}
                </button>
              );
            })}

            <label className="ml-1 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-900 focus:ring-indigo-600"
              />
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              <span>Verified Only</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
              {providers.length} {providers.length === 1 ? 'provider' : 'providers'}
            </span>
            <div className="w-48">
              <Select
                label="Sort providers"
                hideLabel
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                options={SORT_OPTIONS}
              />
            </div>
          </div>
        </div>

        {providers.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No providers match these filters"
              description="Try switching back to All Cities or disabling the Verified Only filter."
              actionLabel="Reset Filters"
              onAction={() => {
                setSelectedCity('All');
                setVerifiedOnly(false);
              }}
            />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}
      </div>
    </SharedLayout>
  );
}
