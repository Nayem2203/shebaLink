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
  placeholder = 'Search electrician, plumber, AC repair',
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
        'w-full bg-white border border-zinc-900/15 rounded-xl shadow-[0_1px_2px_rgba(24,24,27,0.04)] p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2',
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
          className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <input
          id={keywordId}
          type="search"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder={placeholder}
          className={[
            'w-full bg-transparent pl-9 pr-3 text-zinc-900 placeholder:text-zinc-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700/20',
            isLarge ? 'h-11 text-sm sm:text-base' : 'h-10 text-sm',
          ].join(' ')}
        />
      </div>

      {showLocationSelector && (
        <div className="relative sm:w-44 sm:border-l sm:border-zinc-900/10 sm:pl-2 flex items-center">
          <label htmlFor={locationId} className="sr-only">
            Service location
          </label>
          <MapPin
            className="w-4 h-4 text-zinc-500 absolute left-3 sm:left-4 pointer-events-none"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <select
            id={locationId}
            value={location}
            onChange={(e) => onLocationChange?.(e.target.value)}
            className={[
              'w-full bg-transparent pl-9 sm:pl-8 pr-6 text-zinc-800 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700/20',
              isLarge ? 'h-11 text-sm' : 'h-10 text-sm',
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
