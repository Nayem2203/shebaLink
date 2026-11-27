'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RotateCcw, SlidersHorizontal, ShieldCheck, Clock } from 'lucide-react';
import { Button, EmptyState, Input, Select } from '@/components/ui';
import {
  PageHeader,
  ProviderCard,
  SearchBar,
} from '@/components/shared';
import { STORAGE_CUSTOM_EVENT_NAME } from '@/lib/patterns/ObserverPattern';
import {
  getCategories,
  searchAndFilterProviders,
} from '@/services/discoveryService';
import type {
  ProviderFilterCriteria,
  ProviderProfile,
  ServiceCategory,
  SortOption,
} from '@/types';

const CITY_OPTIONS = [
  { value: '', label: 'All Cities' },
  { value: 'Rajshahi', label: 'Rajshahi' },
  { value: 'Dhaka', label: 'Dhaka' },
  { value: 'Chattogram', label: 'Chattogram' },
];

const RATING_OPTIONS = [
  { value: '', label: 'Any Rating' },
  { value: '4.5', label: '4.5 stars and up' },
  { value: '4.7', label: '4.7 stars and up' },
  { value: '4.8', label: '4.8 stars and up' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Sort: Relevance' },
  { value: 'rating-desc', label: 'Sort: Highest Rated' },
  { value: 'price-asc', label: 'Sort: Price Low to High' },
  { value: 'price-desc', label: 'Sort: Price High to Low' },
  { value: 'experience-desc', label: 'Sort: Most Experienced' },
];

export function ServiceDiscoveryClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [categorySlug, setCategorySlug] = useState(
    searchParams.get('category') ?? ''
  );
  const [city, setCity] = useState(searchParams.get('city') ?? '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [storageTick, setStorageTick] = useState(0);

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
    setCategorySlug(searchParams.get('category') ?? '');
    setCity(searchParams.get('city') ?? '');
  }, [searchParams]);

  useEffect(() => {
    const syncCatalog = () => {
      setCategories(getCategories({ onlyActive: true }));
      setStorageTick((t) => t + 1);
    };

    syncCatalog();
    window.addEventListener(STORAGE_CUSTOM_EVENT_NAME, syncCatalog);
    return () => {
      window.removeEventListener(STORAGE_CUSTOM_EVENT_NAME, syncCatalog);
    };
  }, []);

  const criteria: ProviderFilterCriteria = useMemo(
    () => ({
      query: query.trim() || undefined,
      categorySlug: categorySlug || undefined,
      city: city || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      verifiedOnly,
      availableOnly,
      sortBy,
    }),
    [
      query,
      categorySlug,
      city,
      minPrice,
      maxPrice,
      minRating,
      verifiedOnly,
      availableOnly,
      sortBy,
    ]
  );

  const providers: ProviderProfile[] = useMemo(() => {
    void storageTick;
    return searchAndFilterProviders(criteria);
  }, [criteria, storageTick]);

  const hasActiveFilters = Boolean(
    query.trim() ||
      categorySlug ||
      city ||
      minPrice ||
      maxPrice ||
      minRating ||
      verifiedOnly ||
      availableOnly ||
      sortBy !== 'relevance'
  );

  const updateUrlParams = (nextQ: string, nextCat: string, nextCity: string) => {
    const params = new URLSearchParams();
    if (nextQ.trim()) params.set('q', nextQ.trim());
    if (nextCat) params.set('category', nextCat);
    if (nextCity) params.set('city', nextCity);
    const qs = params.toString();
    router.replace(qs ? `/services?${qs}` : '/services', { scroll: false });
  };

  const handleResetFilters = () => {
    setQuery('');
    setCategorySlug('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setVerifiedOnly(false);
    setAvailableOnly(false);
    setSortBy('relevance');
    router.replace('/services', { scroll: false });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Discover Local Services"
        subtitle="Search and filter verified professionals across Rajshahi, Dhaka, and Chattogram by category, BDT rate, and rating."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Services' },
        ]}
      />

      {/* Search Bar */}
      <div className="mt-6">
        <SearchBar
          keyword={query}
          location={city}
          onKeywordChange={(val) => {
            setQuery(val);
          }}
          onLocationChange={(loc) => {
            setCity(loc);
            updateUrlParams(query, categorySlug, loc);
          }}
          onSubmit={(kw, loc) => {
            setQuery(kw);
            const nextLoc = loc ?? '';
            setCity(nextLoc);
            updateUrlParams(kw, categorySlug, nextLoc);
          }}
          ctaLabel="Search"
          placeholder="Search service, provider, skill, or neighborhood"
        />
      </div>

      {/* Category Filter Tabs */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => {
            setCategorySlug('');
            updateUrlParams(query, '', city);
          }}
          className={`h-8 shrink-0 rounded-lg border px-3 text-xs font-medium transition-colors duration-150 ${
            categorySlug === ''
              ? 'border-brand-900 bg-brand-900 text-white'
              : 'border-zinc-900/10 bg-white text-zinc-700 hover:bg-surface-hover'
          }`}
        >
          All Services
        </button>
        {categories.map((cat) => {
          const active = categorySlug === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                const next = active ? '' : cat.slug;
                setCategorySlug(next);
                updateUrlParams(query, next, city);
              }}
              className={`h-8 shrink-0 rounded-lg border px-3 text-xs font-medium transition-colors duration-150 ${
                active
                  ? 'border-brand-900 bg-brand-900 text-white'
                  : 'border-zinc-900/10 bg-white text-zinc-700 hover:bg-surface-hover'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Main Layout: Sidebar Filters + Results Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside
          aria-label="Service filters"
          className="lg:col-span-3 space-y-5 rounded-xl border border-zinc-900/10 bg-white p-5 shadow-[0_1px_2px_rgba(24,24,27,0.04)] h-fit"
        >
          <div className="flex items-center justify-between border-b border-zinc-900/5 pb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
              <SlidersHorizontal className="h-4 w-4 text-zinc-500" strokeWidth={1.5} aria-hidden="true" />
              <span>Filters</span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-800 hover:text-brand-950"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <Select
            label="Location (City)"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              updateUrlParams(query, categorySlug, e.target.value);
            }}
            options={CITY_OPTIONS}
          />

          <Select
            label="Category"
            value={categorySlug}
            onChange={(e) => {
              setCategorySlug(e.target.value);
              updateUrlParams(query, e.target.value, city);
            }}
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map((c) => ({ value: c.slug, label: c.name })),
            ]}
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Min Price (৳)"
              type="number"
              min={0}
              step={50}
              placeholder="300"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <Input
              label="Max Price (৳)"
              type="number"
              min={0}
              step={50}
              placeholder="1500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <Select
            label="Minimum Rating"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            options={RATING_OPTIONS}
          />

          <div className="space-y-2.5 border-t border-zinc-900/5 pt-3">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-brand-900 focus:ring-brand-700"
              />
              <ShieldCheck className="h-4 w-4 text-zinc-500" strokeWidth={1.5} aria-hidden="true" />
              <span>Verified Providers Only</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-brand-900 focus:ring-brand-700"
              />
              <Clock className="h-4 w-4 text-zinc-500" strokeWidth={1.5} aria-hidden="true" />
              <span>Available Now Only</span>
            </label>
          </div>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              fullWidth
              onClick={handleResetFilters}
              leftIcon={<RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />}
            >
              Reset All Filters
            </Button>
          )}
        </aside>

        <div className="lg:col-span-9">
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-zinc-900/10 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(24,24,27,0.04)] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-600">
              Showing{' '}
              <span className="font-mono font-medium text-zinc-900 tabular-nums">
                {providers.length}
              </span>{' '}
              {providers.length === 1 ? 'provider' : 'providers'}
              {city ? ` in ${city}` : ' across Bangladesh'}
            </p>

            <div className="w-full sm:w-60">
              <Select
                label="Sort providers"
                hideLabel
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                options={SORT_OPTIONS}
              />
            </div>
          </div>

          {providers.length === 0 ? (
            <EmptyState
              title="No matching service providers found"
              description="Try clearing your price limits, switching cities, or searching with a broader service keyword."
              actionLabel="Reset Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
