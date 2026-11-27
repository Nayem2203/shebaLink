import React from 'react';
import { Star } from 'lucide-react';

export interface RatingDisplayProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: {
    icon: 'w-3.5 h-3.5',
    ratingText: 'text-xs font-medium text-zinc-900 font-mono tabular-nums',
    countText: 'text-xs text-zinc-500 font-mono tabular-nums',
  },
  md: {
    icon: 'w-4 h-4',
    ratingText: 'text-sm font-medium text-zinc-900 font-mono tabular-nums',
    countText: 'text-xs text-zinc-500 font-mono tabular-nums',
  },
  lg: {
    icon: 'w-4 h-4',
    ratingText: 'text-base font-semibold text-zinc-900 font-mono tabular-nums',
    countText: 'text-sm text-zinc-500 font-mono tabular-nums',
  },
};

export function RatingDisplay({
  rating,
  reviewCount,
  size = 'md',
  showCount = true,
  className = '',
}: RatingDisplayProps) {
  const styles = sizeStyles[size];
  const formattedRating = Number.isFinite(rating) ? rating.toFixed(1) : '0.0';

  return (
    <div
      className={['inline-flex items-center gap-1.5', className]
        .filter(Boolean)
        .join(' ')}
      aria-label={`Rating ${formattedRating} out of 5${
        showCount && reviewCount !== undefined
          ? ` from ${reviewCount} reviews`
          : ''
      }`}
    >
      <Star
        className={[styles.icon, 'text-amber-500 fill-amber-500 shrink-0'].join(
          ' '
        )}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span className={styles.ratingText}>{formattedRating}</span>
      {showCount && reviewCount !== undefined && (
        <span className={styles.countText}>({reviewCount})</span>
      )}
    </div>
  );
}

export default RatingDisplay;
