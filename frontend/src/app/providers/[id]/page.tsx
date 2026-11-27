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
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-900/15 bg-white px-3.5 text-xs font-medium text-zinc-800 shadow-[0_1px_2px_rgba(24,24,27,0.04)] hover:bg-surface-hover"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.5} aria-hidden="true" />
                  <span>Back to Discovery</span>
                </Link>
              }
            />

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-6">
                {/* Identity Summary Card */}
                <section className="rounded-xl border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)]">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        aria-hidden="true"
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-900 font-mono text-base font-medium text-white"
                      >
                        {initials}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-zinc-900">
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
                        <p className="mt-0.5 text-sm font-medium text-zinc-600">
                          {provider.title}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-4">
                          <RatingDisplay
                            rating={provider.rating}
                            reviewCount={provider.reviewCount}
                            size="md"
                          />
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-900/10 bg-surface-canvas px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                            <Clock className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.5} aria-hidden="true" />
                            <span>{provider.availabilityLabel} (Demo)</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Metrics Strip */}
                  <div className="mt-6 grid grid-cols-2 gap-4 border-t border-zinc-900/5 pt-5 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-zinc-500">Experience</p>
                      <p className="mt-1 flex items-center gap-1.5 font-mono text-sm font-medium text-zinc-900 tabular-nums">
                        <Briefcase className="h-4 w-4 text-zinc-400" strokeWidth={1.5} aria-hidden="true" />
                        <span>{provider.experienceYears} years</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Service areas</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-zinc-900">
                        <MapPin className="h-4 w-4 text-zinc-400" strokeWidth={1.5} aria-hidden="true" />
                        <span>{provider.serviceAreas.join(', ')}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Demo jobs done</p>
                      <p className="mt-1 flex items-center gap-1.5 font-mono text-sm font-medium text-zinc-900 tabular-nums">
                        <CheckCircle2 className="h-4 w-4 text-zinc-400" strokeWidth={1.5} aria-hidden="true" />
                        <span>{provider.completedJobsCount ?? 50}+</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Demo contact</p>
                      <p className="mt-1 flex items-center gap-1.5 font-mono text-sm font-medium text-zinc-900 tabular-nums">
                        <Phone className="h-4 w-4 text-zinc-400" strokeWidth={1.5} aria-hidden="true" />
                        <span>{provider.phone}</span>
                      </p>
                    </div>
                  </div>
                </section>

                {/* About & Skills */}
                <section className="rounded-xl border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)]">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    About and specializations
                  </h2>
                  <p className="mt-2.5 text-sm text-zinc-600 leading-relaxed">
                    {provider.bio}
                  </p>

                  <div className="mt-5">
                    <h3 className="text-xs font-medium text-zinc-500">
                      Core skills
                    </h3>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {provider.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md border border-zinc-900/10 bg-surface-canvas px-3 py-1 text-xs font-medium text-zinc-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Services & BDT Rate Sheet */}
                <section className="rounded-xl border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)]">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">
                      Services and starting rates
                    </h2>
                    <p className="mt-1 text-xs text-zinc-500">
                      Transparent base rates in Bangladeshi Taka (&#2547;). Final quote may vary after on-site inspection.
                    </p>
                  </div>

                  {services.length === 0 ? (
                    <p className="mt-4 text-sm text-zinc-500">
                      No active service packages listed right now.
                    </p>
                  ) : (
                    <div className="mt-4 divide-y divide-zinc-900/5">
                      {services.map((service) => (
                        <div
                          key={service.id}
                          className="flex flex-col gap-3 py-4 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <h3 className="text-sm font-medium text-zinc-900">
                              {service.title}
                            </h3>
                            <p className="mt-1 text-xs text-zinc-600 leading-relaxed">
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
                              className="inline-flex h-8 items-center justify-center rounded-lg bg-brand-900 px-3 text-xs font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(24,24,27,0.08)] transition-colors duration-150 hover:bg-brand-800"
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
                <section className="rounded-xl border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)]">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold text-zinc-900">
                      Customer reviews{' '}
                      <span className="font-mono text-sm font-normal text-zinc-500 tabular-nums">
                        ({reviews.length})
                      </span>
                    </h2>
                    <RatingDisplay
                      rating={provider.rating}
                      reviewCount={provider.reviewCount}
                      size="sm"
                    />
                  </div>

                  {reviews.length === 0 ? (
                    <p className="mt-4 text-sm text-zinc-500">
                      No written reviews recorded yet for this provider.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {reviews.map((review) => (
                        <article
                          key={review.id}
                          className="rounded-lg border border-zinc-900/5 bg-surface-canvas p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-zinc-900">
                                {review.customerName || 'Customer'}
                              </p>
                              {review.serviceTitle && (
                                <p className="text-xs text-zinc-500">
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
                              <span className="font-mono text-xs text-zinc-500 tabular-nums">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="mt-2.5 flex items-start gap-2 text-sm text-zinc-700 leading-relaxed">
                            <MessageSquareQuote
                              className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400"
                              strokeWidth={1.5}
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
                <div className="sticky top-24 rounded-xl border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)]">
                  <p className="text-xs font-medium text-zinc-500">
                    Starting rate
                  </p>
                  <div className="mt-1">
                    <PriceDisplay
                      amount={provider.startingPrice}
                      unit={provider.priceUnit}
                      size="lg"
                    />
                  </div>

                  <p className="mt-3 text-xs text-zinc-600 leading-relaxed">
                    {provider.responseTime || 'Usually responds promptly'} &bull;{' '}
                    Coverage in {provider.neighborhood}, {provider.primaryCity}
                  </p>

                  <div className="mt-5">
                    <Link
                      href={`/book?provider=${provider.id}`}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-900 px-4 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(24,24,27,0.08)] transition-colors duration-150 hover:bg-brand-800"
                    >
                      <CalendarPlus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                      <span>Request Service</span>
                    </Link>
                  </div>

                  <div className="mt-5 space-y-2.5 border-t border-zinc-900/5 pt-4 text-xs text-zinc-600">
                    <div className="flex items-center gap-2">
                      <ShieldCheck
                        className="h-4 w-4 shrink-0 text-zinc-500"
                        strokeWidth={1.5}
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
                        className="h-4 w-4 shrink-0 text-zinc-500"
                        strokeWidth={1.5}
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
