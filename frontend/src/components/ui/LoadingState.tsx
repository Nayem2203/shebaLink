import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'skeleton-cards' | 'skeleton-table';
  count?: number;
  className?: string;
}

export function LoadingState({
  message = 'Loading content...',
  variant = 'spinner',
  count = 3,
  className = '',
}: LoadingStateProps) {
  if (variant === 'skeleton-cards') {
    return (
      <div
        role="status"
        aria-label={message}
        className={[
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-5/6" />
            <div className="pt-2 flex justify-between items-center">
              <div className="h-5 bg-slate-200 rounded w-20" />
              <div className="h-9 bg-slate-200 rounded-lg w-28" />
            </div>
          </div>
        ))}
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  if (variant === 'skeleton-table') {
    return (
      <div
        role="status"
        aria-label={message}
        className={[
          'bg-white border border-slate-200 rounded-xl p-5 animate-pulse space-y-3',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-2 border-b border-slate-100 last:border-none gap-4"
          >
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-100 rounded w-1/3" />
            <div className="h-6 bg-slate-200 rounded-full w-20" />
          </div>
        ))}
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Loader2
        className="w-8 h-8 text-indigo-600 animate-spin mb-3"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}

export default LoadingState;
