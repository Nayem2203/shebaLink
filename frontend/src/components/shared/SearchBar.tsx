'use client';

import React, { FormEvent, useId } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface SearchBarProps {
  keyword: string;
  location?: string;
  locations?: string[];
  onKeywordChange: (val: string) => void;
  onLocationChange?: (loc: string) => void;
  onSubmit: (keyword: string, location?: string) => void;
  placeholder?: string;
  showLocationSelector?: boolean;
  size?: 'md' | 'lg';
  ctaLabel?: string;
  className?: string;
}

const DEFAULT_LOCATIONS = ['All Locations', 'Rajshahi', 'Dhaka', 'Chattogram'];

export function SearchBar({
  keyword,
  location = '',
  locations = DEFAULT_LOCATIONS,
  onKeywordChange,
  onLocationChange,
  onSubmit,
  placeholder = 'Search services or providers (e.g., Electrician, Plumber, AC repair)...',
  showLocationSelector = true,
  size = 'md',
  ctaLabel = 'Find a Service',
  className = '',
}: SearchBarProps) {
  const keywordId = useId();
  const locationId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(keyword.trim(), location);
  };

  const isLarge = size === 'lg';

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search local services and providers"
      className={[
        'w-full bg-white border border-slate-200 rounded-xl shadow-sm p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="relative flex-1 flex items-center">
        <label htmlFor={keywordId} className="sr-only">
          Service or provider keyword
        </label>
        <Search
          className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none"
          aria-hidden="true"
        />
        <input
          id={keywordId}
          type="search"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder={placeholder}
          className={[
            'w-full bg-transparent pl-10 pr-3 text-slate-900 placeholder:text-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600',
            isLarge ? 'h-12 text-base' : 'h-10 text-sm',
          ].join(' ')}
        />
      </div>

      {showLocationSelector && (
        <div className="relative sm:w-48 sm:border-l sm:border-slate-200 sm:pl-2 flex items-center">
          <label htmlFor={locationId} className="sr-only">
            Service location
          </label>
          <MapPin
            className="w-4 h-4 text-indigo-600 absolute left-3.5 sm:left-4 pointer-events-none"
            aria-hidden="true"
          />
          <select
            id={locationId}
            value={location}
            onChange={(e) => onLocationChange?.(e.target.value)}
            className={[
              'w-full bg-transparent pl-9 sm:pl-8 pr-6 text-slate-800 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600',
              isLarge ? 'h-12 text-sm' : 'h-10 text-sm',
            ].join(' ')}
          >
            {locations.map((loc) => {
              const value = loc === 'All Locations' ? '' : loc;
              return (
                <option key={loc} value={value}>
                  {loc}
                </option>
              );
            })}
          </select>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size={isLarge ? 'lg' : 'md'}
        className="shrink-0"
      >
        {ctaLabel}
      </Button>
    </form>
  );
}

export default SearchBar;
