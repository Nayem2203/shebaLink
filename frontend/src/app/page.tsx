'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  Search,
  Users,
  CalendarCheck,
  CheckCircle2,
  Droplets,
  Home,
  Wrench,
  LayoutDashboard,
} from 'lucide-react';
import { SharedLayout } from '@/components/layout/SharedLayout';
import {
  CategoryCard,
  PriceDisplay,
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

const HOW_IT_WORKS_STEPS = [
  {
    step: '1',
    title: 'Find a Service',
    description: 'Search and choose from 16 local categories.',
    Icon: Search,
  },
  {
    step: '2',
    title: 'Choose a Provider',
    description: 'Compare profiles, ratings, and BDT rates.',
    Icon: Users,
  },
  {
    step: '3',
    title: 'Book the Service',
    description: 'Pick a preferred date, time, and address.',
    Icon: CalendarCheck,
  },
  {
    step: '4',
    title: 'Get It Done',
    description: 'Track progress from Pending to Completed.',
    Icon: CheckCircle2,
  },
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
      setFeaturedProviders(getFeaturedProviders(4));
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
      {/* 1. Reference-Inspired Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-900/10 bg-gradient-to-br from-[#f6f5fe] via-white to-[#eef0ff] pt-10 pb-10 sm:pt-14 sm:pb-12 lg:pt-16 lg:pb-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Eyebrow, Two-Tone Headline, Search Bar & Trust Row */}
            <div className="lg:col-span-6 lg:pb-16 animate-enter">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-600/15 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">
                <MapPin className="h-3.5 w-3.5 text-brand-600" strokeWidth={1.5} aria-hidden="true" />
                <span>Local Services, Right at Your Doorstep</span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-5xl sm:leading-[1.08]">
                Find Trusted Local{' '}
                <span className="text-brand-600">Service Providers</span>
              </h1>

              <p className="mt-4 max-w-xl text-base text-zinc-600 sm:text-lg leading-relaxed">
                From home repairs to cleaning, delivery to moving &mdash; compare
                verified professionals in Rajshahi, Dhaka, and Chattogram with
                transparent BDT (&#2547;) rates.
              </p>

              <div className="mt-7">
                <SearchBar
                  keyword={keyword}
                  location={city}
                  onKeywordChange={setKeyword}
                  onLocationChange={setCity}
                  onSubmit={handleSearchSubmit}
                  size="lg"
                  ctaLabel="Search"
                  placeholder="Search for services (e.g., electrician, plumber, AC)"
                />
              </div>

              {/* 3 Compact Trust Indicators */}
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-zinc-700">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" strokeWidth={1.5} aria-hidden="true" />
                  <span>Verified Providers</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-brand-600" strokeWidth={1.5} aria-hidden="true" />
                  <span>Quick Booking</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" strokeWidth={1.5} aria-hidden="true" />
                  <span>Rated &amp; Reviewed</span>
                </span>
              </div>
            </div>

            {/* Right Column: Hero Technician Photograph + Floating Category Highlights */}
            <div className="relative lg:col-span-6 flex justify-center lg:self-end">
              <div className="relative w-full max-w-lg lg:max-w-none">
                <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden rounded-2xl border border-zinc-900/10 bg-white shadow-[0_12px_32px_rgba(30,27,75,0.08)] lg:rounded-b-none lg:border-b-0">
                  <Image
                    src="/images/hero-technician.jpg"
                    alt="Friendly Bangladeshi home service technician ready to assist"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-top"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/70 to-transparent lg:from-[#eef0ff]/80"
                  />
                </div>

                {/* Floating Stat Badges (Desktop / Tablet) */}
                <Link
                  href="/categories/plumber"
                  className="hidden sm:flex items-center gap-2.5 rounded-xl border border-zinc-900/10 bg-white/95 px-3.5 py-2.5 shadow-[0_8px_24px_rgba(24,24,27,0.08)] backdrop-blur-sm transition-transform duration-150 hover:-translate-y-0.5 sm:absolute sm:-left-4 sm:top-10"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                    <Droplets className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900">Plumbing</p>
                    <p className="font-mono text-xs text-zinc-600 tabular-nums">
                      <span className="text-amber-500">&#9733;</span> 4.9 (56)
                    </p>
                  </div>
                </Link>

                <Link
                  href="/categories/home-cleaning"
                  className="hidden sm:flex items-center gap-2.5 rounded-xl border border-zinc-900/10 bg-white/95 px-3.5 py-2.5 shadow-[0_8px_24px_rgba(24,24,27,0.08)] backdrop-blur-sm transition-transform duration-150 hover:-translate-y-0.5 sm:absolute sm:-right-3 sm:top-8"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Home className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900">Cleaning</p>
                    <p className="font-mono text-xs text-zinc-600 tabular-nums">
                      <span className="text-amber-500">&#9733;</span> 4.9 (47)
                    </p>
                  </div>
                </Link>

                <Link
                  href="/categories/electrician"
                  className="hidden sm:flex items-center gap-2.5 rounded-xl border border-zinc-900/10 bg-white/95 px-3.5 py-2.5 shadow-[0_8px_24px_rgba(24,24,27,0.08)] backdrop-blur-sm transition-transform duration-150 hover:-translate-y-0.5 sm:absolute sm:right-4 sm:bottom-6"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                    <Zap className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900">Electrical</p>
                    <p className="font-mono text-xs text-zinc-600 tabular-nums">
                      <span className="text-amber-500">&#9733;</span> 4.8 (42)
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Browse Service Categories (with Generated Photography) */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
                Browse Service Categories
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Select a category to inspect local providers and transparent BDT
                starting rates.
              </p>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors duration-150"
            >
              <span>View All Categories</span>
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* 3. How ShebaLink Works (4-Step Horizontal Flow Band) */}
      <section id="how-it-works" className="bg-white pb-12 sm:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-brand-900/10 bg-[#f4f3fd] p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-3">
                <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
                  How ShebaLink Works
                </h2>
                <p className="mt-1.5 text-sm text-zinc-600 leading-relaxed">
                  Get your household job done in four simple steps.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-4">
                {HOW_IT_WORKS_STEPS.map((item) => {
                  const Icon = item.Icon;
                  return (
                    <div
                      key={item.step}
                      className="rounded-xl border border-zinc-900/5 bg-white p-4 shadow-[0_1px_2px_rgba(24,24,27,0.03)]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                          <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                        </div>
                        <span className="font-mono text-xs font-medium text-zinc-400 tabular-nums">
                          0{item.step}
                        </span>
                      </div>
                      <h3 className="mt-3 text-sm font-semibold text-zinc-900">
                        {item.step}. {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Service Providers (4-Column Grid) */}
      <section className="border-t border-zinc-900/10 bg-surface-canvas py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
                Featured Service Providers
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Verified local professionals ready for electrical, plumbing, AC,
                and home care requests.
              </p>
            </div>
            <Link
              href="/providers"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors duration-150"
            >
              <span>View All Providers</span>
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Interactive Quick-Booking & Demo Portal Banner */}
      <section
        id="become-provider"
        className="border-t border-zinc-900/10 bg-white py-12 sm:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-brand-950/15 bg-gradient-to-r from-[#5648de] to-[#312e81] p-7 text-white shadow-[0_12px_32px_rgba(30,27,75,0.12)] sm:p-10">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              {/* Coded Product Card Preview */}
              <div className="lg:col-span-5">
                <div className="rounded-xl border border-white/15 bg-white p-5 text-zinc-900 shadow-lg">
                  <div className="flex items-center justify-between border-b border-zinc-900/10 pb-3">
                    <div>
                      <p className="text-xs text-zinc-500">Live booking preview</p>
                      <p className="font-mono text-sm font-semibold text-zinc-900 tabular-nums">
                        bk-001 &bull; Rahim Uddin
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-900/15 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Completed
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-zinc-600">Boalia, Rajshahi</span>
                    <PriceDisplay amount={500} unit="per visit" size="sm" />
                  </div>
                </div>
              </div>

              {/* Banner Copy & Real Working Actions */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-100">
                  <Wrench className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  <span>Customer, Provider &amp; Admin Demo Workflows</span>
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Book services and manage jobs in one place
                </h2>
                <p className="mt-2.5 max-w-xl text-sm text-indigo-100 leading-relaxed">
                  Submit a local service request with photo preview, or switch
                  to Provider Demo Mode to accept incoming requests and update
                  BDT rates.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/book"
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-5 text-sm font-medium text-zinc-900 shadow-sm transition-colors duration-150 hover:bg-surface-canvas"
                  >
                    <span>Book a Service</span>
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                  <Link
                    href="/dashboard/provider"
                    onClick={() => setRole('provider')}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-white/20"
                  >
                    <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    <span>Open Provider Dashboard</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. What Our Users Say */}
      <section className="border-t border-zinc-900/10 bg-surface-canvas py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
                What Our Users Say
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Verified demo reviews from completed household bookings.
              </p>
            </div>
            <Link
              href="/services"
              className="text-xs font-medium text-brand-700 hover:text-brand-900"
            >
              Read provider reviews &rarr;
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {testimonials.map((review) => {
              const initials = (review.customerName || 'CU')
                .split(' ')
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              return (
                <article
                  key={review.id}
                  className="flex flex-col justify-between rounded-xl border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)]"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-900 font-mono text-xs font-medium text-white"
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900">
                          {review.customerName || 'Verified Customer'}
                        </p>
                        <RatingDisplay
                          rating={review.rating}
                          showCount={false}
                          size="sm"
                        />
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-zinc-700 leading-relaxed">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  </div>

                  <p className="mt-4 border-t border-zinc-900/5 pt-3 text-xs text-zinc-500">
                    {review.serviceTitle || 'Household Service'}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </SharedLayout>
  );
}
