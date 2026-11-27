'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Briefcase, ShieldCheck } from 'lucide-react';
import type { ProviderProfile } from '@/types';
import { RatingDisplay } from './RatingDisplay';
import { PriceDisplay } from './PriceDisplay';
import { Button } from '@/components/ui/Button';

export interface ProviderCardProps {
  provider: ProviderProfile;
  onViewProfile?: (id: string) => void;
  onRequestService?: (id: string) => void;
  className?: string;
}

export function ProviderCard({
  provider,
  onViewProfile,
  onRequestService,
  className = '',
}: ProviderCardProps) {
  const isVerified = provider.verifiedStatus === 'verified';
  const initials = provider.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const availabilityDot =
    provider.availabilityLabel === 'Available Today'
      ? 'bg-emerald-600'
      : provider.availabilityLabel === 'Available Tomorrow'
      ? 'bg-sky-600'
      : 'bg-zinc-400';

  const availabilityStyles =
    provider.availabilityLabel === 'Available Today'
      ? 'bg-emerald-50/80 text-emerald-900 border-emerald-900/15'
      : provider.availabilityLabel === 'Available Tomorrow'
      ? 'bg-sky-50/80 text-sky-900 border-sky-900/15'
      : 'bg-surface-subtle text-zinc-700 border-zinc-900/10';

  return (
    <article
      className={[
        'bg-white border border-zinc-900/10 rounded-xl shadow-[0_1px_2px_rgba(24,24,27,0.04)] hover:border-zinc-900/20 transition-[border-color,box-shadow] duration-150 ease-ease p-5 flex flex-col justify-between h-full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div>
        {/* Header: Initials Monogram & Identity */}
        <div className="flex items-start gap-3">
          <div
            aria-hidden="true"
            className="w-11 h-11 rounded-lg bg-brand-900 text-white font-medium text-sm font-mono flex items-center justify-center shrink-0"
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-medium text-zinc-900 truncate">
                {provider.name}
              </h3>
              {isVerified && (
                <span
                  title="Verified Provider (Demo)"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50/80 text-emerald-900 border border-emerald-900/15"
                >
                  <ShieldCheck className="w-3 h-3 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <span>Verified</span>
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-zinc-600 truncate mt-0.5">
              {provider.title}
            </p>
          </div>
        </div>

        {/* Rating & Availability */}
        <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
          <RatingDisplay
            rating={provider.rating}
            reviewCount={provider.reviewCount}
            size="sm"
          />
          <span
            className={[
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border',
              availabilityStyles,
            ].join(' ')}
          >
            <span
              className={['w-1.5 h-1.5 rounded-full shrink-0', availabilityDot].join(' ')}
              aria-hidden="true"
            />
            <span>{provider.availabilityLabel}</span>
          </span>
        </div>

        {/* Bio excerpt */}
        <p className="mt-3 text-xs text-zinc-600 line-clamp-2 leading-relaxed">
          {provider.bio}
        </p>

        {/* Meta info: Experience & Location */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-600">
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className="font-mono tabular-nums">
              {provider.experienceYears}{' '}
              {provider.experienceYears === 1 ? 'yr' : 'yrs'}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span>
              {provider.neighborhood
                ? `${provider.neighborhood}, ${provider.primaryCity}`
                : provider.serviceAreas.join(', ')}
            </span>
          </span>
        </div>
      </div>

      {/* Footer: Starting Price & Actions */}
      <div className="mt-5 pt-4 border-t border-zinc-900/5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Starting rate</span>
          <PriceDisplay
            amount={provider.startingPrice}
            unit={provider.priceUnit}
            size="md"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {onViewProfile ? (
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => onViewProfile(provider.id)}
            >
              View Profile
            </Button>
          ) : (
            <Link
              href={`/providers/${provider.id}`}
              className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-lg bg-white text-zinc-800 hover:bg-surface-hover border border-zinc-900/15 shadow-[0_1px_2px_rgba(24,24,27,0.04)] transition-colors duration-150"
            >
              View Profile
            </Link>
          )}

          {onRequestService ? (
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => onRequestService(provider.id)}
            >
              Request Service
            </Button>
          ) : (
            <Link
              href={`/book?provider=${provider.id}`}
              className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-lg bg-brand-900 text-white hover:bg-brand-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(24,24,27,0.08)] transition-colors duration-150"
            >
              Request Service
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProviderCard;
