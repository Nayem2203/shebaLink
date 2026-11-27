'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  CalendarPlus,
  MessageSquareQuote,
  ArrowLeft,
} from 'lucide-react';
import { SharedLayout } from '@/components/layout/SharedLayout';
import { EmptyState, StatusBadge } from '@/components/ui';
import {
  PageHeader,
  PriceDisplay,
  RatingDisplay,
} from '@/components/shared';
import { STORAGE_CUSTOM_EVENT_NAME } from '@/lib/patterns/ObserverPattern';
import { getReviewsByProvider } from '@/services/bookingService';
import {
  getProviderById,
  getProviderServices,
} from '@/services/discoveryService';
import type { ProviderProfile, ProviderService, Review } from '@/types';

export default function ProviderProfilePage() {
  const params = useParams<{ id: string }>();
  const providerId = typeof params?.id === 'string' ? params.id : '';

  const [provider, setProvider] = useState<ProviderProfile | undefined>(
    undefined
  );
  const [services, setServices] = useState<ProviderService[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadProfile = () => {
      const found = getProviderById(providerId);
      setProvider(found);
      if (found) {
        setServices(getProviderServices(found.id, true));
        setReviews(getReviewsByProvider(found.id));
      } else {
        setServices([]);
        setReviews([]);
      }
      setLoaded(true);
    };

    loadProfile();
    window.addEventListener(STORAGE_CUSTOM_EVENT_NAME, loadProfile);
    return () => {
      window.removeEventListener(STORAGE_CUSTOM_EVENT_NAME, loadProfile);
    };
  }, [providerId]);

  const initials = provider
    ? provider.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  return (
    <SharedLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!loaded ? null : !provider ? (
          <EmptyState
            title="Provider profile not found"
            description="We could not find the requested service professional."
            actionLabel="Browse Providers"
            onAction={() => {
              window.location.href = '/services';
            }}
          />
        ) : (
          <>
            <PageHeader
              title={provider.name}
              subtitle={`${provider.title} • ${provider.neighborhood}, ${provider.primaryCity}`}
              breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'Services', href: '/services' },
                { label: provider.name },
              ]}
              actions={
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Back to Discovery</span>
                </Link>
              }
            />

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Main Left Content */}
              <div className="lg:col-span-8 space-y-6">
                {/* Identity Summary Card */}
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        aria-hidden="true"
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-900 text-lg font-bold text-white"
                      >
                        {initials}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold text-slate-900">
                            {provider.name}
                          </h2>
                          {provider.verifiedStatus === 'verified' ? (
                            <StatusBadge status="verified" size="sm" />
                          ) : (
                            <StatusBadge
                              status={provider.verifiedStatus}
                              size="sm"
                            />
                          )}
                        </div>
                        <p className="mt-0.5 text-sm font-medium text-indigo-700">
                          {provider.title}
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-4">
                          <RatingDisplay
                            rating={provider.rating}
                            reviewCount={provider.reviewCount}
                            size="md"
                          />
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                            <Clock className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
                            <span>{provider.availabilityLabel} (Demo)</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Metrics Strip */}
                  <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-slate-500">Experience</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        <Briefcase className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        <span>{provider.experienceYears} years</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Service Areas</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        <span>{provider.serviceAreas.join(', ')}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Demo Jobs Done</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                        <span>{provider.completedJobsCount ?? 50}+</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Demo Contact</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        <Phone className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        <span>{provider.phone}</span>
                      </p>
                    </div>
                  </div>
                </section>

                {/* About & Skills */}
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900">
                    About &amp; Specializations
                  </h2>
                  <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                    {provider.bio}
                  </p>

                  <div className="mt-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Core Skills
                    </h3>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {provider.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Services & BDT Pricing */}
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Services &amp; Starting Rates
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Transparent base rates in Bangladeshi Taka (&#2547;). Final quote may vary after on-site inspection.
                      </p>
                    </div>
                  </div>

                  {services.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">
                      No active service packages listed right now.
                    </p>
                  ) : (
                    <div className="mt-4 divide-y divide-slate-100">
                      {services.map((service) => (
                        <div
                          key={service.id}
                          className="flex flex-col gap-3 py-4 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-slate-900">
                              {service.title}
                            </h3>
                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                              {service.description}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                            <PriceDisplay
                              amount={service.startingPrice}
                              unit={service.priceUnit}
                              size="md"
                            />
                            <Link
                              href={`/book?provider=${provider.id}&service=${service.id}`}
                              className="inline-flex items-center justify-center rounded-lg bg-indigo-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-800"
                            >
                              Request
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Customer Reviews */}
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      Customer Reviews ({reviews.length})
                    </h2>
                    <RatingDisplay
                      rating={provider.rating}
                      reviewCount={provider.reviewCount}
                      size="sm"
                    />
                  </div>

                  {reviews.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">
                      No written reviews recorded yet for this provider.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {reviews.map((review) => (
                        <article
                          key={review.id}
                          className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {review.customerName || 'Customer'}
                              </p>
                              {review.serviceTitle && (
                                <p className="text-xs text-slate-500">
                                  {review.serviceTitle}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <RatingDisplay
                                rating={review.rating}
                                showCount={false}
                                size="sm"
                              />
                              <span className="text-xs text-slate-400">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="mt-2.5 flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                            <MessageSquareQuote
                              className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                              aria-hidden="true"
                            />
                            <span>{review.comment}</span>
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Right Sticky Booking CTA */}
              <aside className="lg:col-span-4">
                <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Starting Rate
                  </p>
                  <div className="mt-1">
                    <PriceDisplay
                      amount={provider.startingPrice}
                      unit={provider.priceUnit}
                      size="lg"
                    />
                  </div>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                    {provider.responseTime || 'Usually responds promptly'} &bull;{' '}
                    Coverage in {provider.neighborhood}, {provider.primaryCity}
                  </p>

                  <div className="mt-5 space-y-2.5">
                    <Link
                      href={`/book?provider=${provider.id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-800"
                    >
                      <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                      <span>Request Service</span>
                    </Link>
                  </div>

                  <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <ShieldCheck
                        className="h-4 w-4 shrink-0 text-emerald-600"
                        aria-hidden="true"
                      />
                      <span>
                        {provider.verifiedStatus === 'verified'
                          ? 'Demo Verified Provider Profile'
                          : 'Pending Verification (Demo)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock
                        className="h-4 w-4 shrink-0 text-indigo-600"
                        aria-hidden="true"
                      />
                      <span>Saved locally in browser LocalStorage</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </SharedLayout>
  );
}
