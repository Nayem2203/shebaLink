'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  Wrench,
  Sparkles,
  BadgeCheck,
  Wallet,
  MessageSquareQuote,
} from 'lucide-react';
import { SharedLayout } from '@/components/layout/SharedLayout';
import {
  CategoryCard,
  ProviderCard,
  RatingDisplay,
  SearchBar,
} from '@/components/shared';
import { useRole } from '@/context/RoleContext';
import { INITIAL_REVIEWS } from '@/data/reviews';
import { STORAGE_CUSTOM_EVENT_NAME } from '@/lib/patterns/ObserverPattern';
import {
  getCategories,
  getFeaturedProviders,
  getProviderCountByCategory,
} from '@/services/discoveryService';
import type { ProviderProfile, ServiceCategory } from '@/types';

const POPULAR_TAGS = [
  { label: 'Electrician', slug: 'electrician' },
  { label: 'Plumber', slug: 'plumber' },
  { label: 'AC Repair', slug: 'ac-repair' },
  { label: 'Home Cleaning', slug: 'home-cleaning' },
  { label: 'Home Shifting', slug: 'home-shifting' },
];

export default function HomePage() {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('Rajshahi');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [featuredProviders, setFeaturedProviders] = useState<ProviderProfile[]>(
    []
  );
  const [providerCounts, setProviderCounts] = useState<Record<string, number>>(
    {}
  );

  const router = useRouter();
  const { setRole } = useRole();

  useEffect(() => {
    const loadData = () => {
      const activeCategories = getCategories({ onlyActive: true });
      setCategories(activeCategories.slice(0, 8));
      const counts: Record<string, number> = {};
      activeCategories.forEach((cat) => {
        counts[cat.id] = getProviderCountByCategory(cat.id);
      });
      setProviderCounts(counts);
      setFeaturedProviders(getFeaturedProviders(6));
    };

    loadData();
    window.addEventListener(STORAGE_CUSTOM_EVENT_NAME, loadData);
    return () => {
      window.removeEventListener(STORAGE_CUSTOM_EVENT_NAME, loadData);
    };
  }, []);

  const testimonials = useMemo(() => INITIAL_REVIEWS.slice(0, 3), []);

  const handleSearchSubmit = (kw: string, selectedCity?: string) => {
    const params = new URLSearchParams();
    if (kw.trim()) params.set('q', kw.trim());
    if (selectedCity && selectedCity !== 'All Locations') {
      params.set('city', selectedCity);
    }
    const qs = params.toString();
    router.push(qs ? `/services?${qs}` : '/services');
  };

  return (
    <SharedLayout>
      {/* 1. Hero Section — Search First */}
      <section className="border-b border-slate-200 bg-white py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-900">
              <MapPin className="h-3.5 w-3.5 text-indigo-700" aria-hidden="true" />
              <span>
                Local Service Marketplace &bull; Rajshahi, Dhaka &amp; Chattogram
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Find trusted professionals for every home need.
            </h1>

            <p className="mt-4 text-base text-slate-600 sm:text-lg leading-relaxed">
              Discover verified electricians, plumbers, AC technicians, home
              cleaners, and movers around you. Compare transparent BDT (&#2547;)
              starting prices and submit a service request in minutes.
            </p>

            {/* Primary Search Bar */}
            <div className="mt-8">
              <SearchBar
                keyword={keyword}
                location={city}
                onKeywordChange={setKeyword}
                onLocationChange={setCity}
                onSubmit={handleSearchSubmit}
                size="lg"
                ctaLabel="Find a Service"
                placeholder="Search service or provider (e.g., Electrician, Plumber, Rahim)..."
              />
            </div>

            {/* Popular quick-filter chips */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="font-medium text-slate-500">Popular:</span>
              {POPULAR_TAGS.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/services?category=${tag.slug}${city ? `&city=${city}` : ''}`}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-900"
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Service Categories */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Popular Service Categories
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Browse essential household repair, cleaning, and moving services.
              </p>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
            >
              <span>View all 16 categories</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                providerCount={providerCounts[category.id] ?? 0}
                href={`/categories/${category.slug}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Providers */}
      <section className="border-t border-slate-200 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Featured Local Professionals
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Top-rated demo providers ready for electrical, plumbing, cooling,
                and home care requests.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
            >
              <span>Explore all providers</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Three-Step How It Works */}
      <section
        id="how-it-works"
        className="border-t border-slate-200 bg-slate-50 py-12 sm:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              How ShebaLink Works
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              From finding the right specialist to tracking completion and
              leaving feedback.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-900">
                <Search className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                1. Discover &amp; Compare
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                Filter nearby providers by category, city neighborhood, customer
                rating, and BDT (&#2547;) starting fee.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-900">
                <Clock className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                2. Submit a Service Request
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                Explain the issue, attach an optional photo preview, and pick your
                preferred date, time, and address.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-900">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                3. Track &amp; Review
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                Follow status updates from Pending to Accepted, In Progress, and
                Completed, then rate the service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Trust & Safety */}
      <section className="border-t border-slate-200 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Trust &amp; Clarity First</span>
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                Designed for dependable local bookings
              </h2>
              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                Every provider profile clearly separates demo verification
                badges, years of experience, service coverage, and starting BDT
                rates so households can book with confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <BadgeCheck className="h-5 w-5 text-indigo-700" aria-hidden="true" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  Clear Verification Status
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Verified indicators appear only for admin-approved profiles in
                  the platform directory.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <Wallet className="h-5 w-5 text-indigo-700" aria-hidden="true" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  Transparent BDT Pricing
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Upfront starting rates in Bangladeshi Taka (&#2547;) per visit,
                  unit, or job before requesting.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <CheckCircle2 className="h-5 w-5 text-indigo-700" aria-hidden="true" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  Guarded Job Lifecycle
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Strict status transitions ensure accurate tracking and fair
                  reviews after completion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Testimonials */}
      <section className="border-t border-slate-200 bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Recent Customer Feedback
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Sample demo reviews from completed household bookings across
              Bangladesh.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {testimonials.map((review) => (
              <article
                key={review.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <RatingDisplay
                      rating={review.rating}
                      showCount={false}
                      size="sm"
                    />
                    <MessageSquareQuote
                      className="h-4 w-4 text-slate-300"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {review.customerName || 'Verified Customer'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {review.serviceTitle || 'Household Service'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Provider Onboarding CTA */}
      <section
        id="become-provider"
        className="border-t border-slate-200 bg-white py-12 sm:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-slate-200 bg-slate-900 p-8 text-white md:flex-row md:items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-indigo-200">
                <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                <span>For Skilled Technicians &amp; Service Professionals</span>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">
                Grow your local service business with ShebaLink
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Switch to Provider Demo Mode to inspect incoming service
                requests, accept or decline jobs, update work progress, and
                manage your BDT rates.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/provider"
                onClick={() => setRole('provider')}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-100"
              >
                <Sparkles
                  className="h-4 w-4 text-indigo-700"
                  aria-hidden="true"
                />
                <span>Try Provider Demo Mode</span>
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <span>Explore Directory</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SharedLayout>
  );
}
