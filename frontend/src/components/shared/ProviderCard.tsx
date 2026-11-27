'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Briefcase, ShieldCheck, Clock } from 'lucide-react';
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

  const availabilityStyles =
    provider.availabilityLabel === 'Available Today'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : provider.availabilityLabel === 'Available Tomorrow'
      ? 'bg-blue-50 text-blue-800 border-blue-200'
      : 'bg-slate-100 text-slate-700 border-slate-300';

  return (
    <article
      className={[
        'bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-all p-5 flex flex-col justify-between h-full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div>
        {/* Header: Avatar, Identity & Availability */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {provider.avatar && provider.avatar.startsWith('http') ? (
              <img
                src={provider.avatar}
                alt={provider.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
              />
            ) : (
              <div
                aria-hidden="true"
                className="w-12 h-12 rounded-full bg-indigo-900 text-white font-semibold text-sm flex items-center justify-center shrink-0"
              >
                {initials}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base font-semibold text-slate-900 truncate">
                  {provider.name}
                </h3>
                {isVerified && (
                  <span
                    title="Verified Provider (Demo)"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    <ShieldCheck className="w-3 h-3 shrink-0" aria-hidden="true" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-indigo-700 truncate mt-0.5">
                {provider.title}
              </p>
            </div>
          </div>
        </div>

        {/* Rating & Availability Badge */}
        <div className="mt-3.5 flex items-center justify-between gap-2 flex-wrap">
          <RatingDisplay
            rating={provider.rating}
            reviewCount={provider.reviewCount}
            size="sm"
          />
          <span
            className={[
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
              availabilityStyles,
            ].join(' ')}
          >
            <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>{provider.availabilityLabel}</span>
          </span>
        </div>

        {/* Bio excerpt */}
        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {provider.bio}
        </p>

        {/* Meta info: Experience & Location */}
        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>
              {provider.experienceYears}{' '}
              {provider.experienceYears === 1 ? 'year' : 'years'} exp.
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>
              {provider.neighborhood
                ? `${provider.neighborhood}, ${provider.primaryCity}`
                : provider.serviceAreas.join(', ')}
            </span>
          </span>
        </div>
      </div>

      {/* Footer: Starting Price & Actions */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Starting price</span>
          <PriceDisplay
            amount={provider.startingPrice}
            unit={provider.priceUnit}
            size="md"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
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
              className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-sm transition-colors"
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
              className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-lg bg-indigo-900 text-white hover:bg-indigo-800 shadow-sm transition-colors"
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
