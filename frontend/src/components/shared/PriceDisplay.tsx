import React from 'react';

export interface PriceDisplayProps {
  amount: number;
  unit?: string;
  prefix?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: {
    amount: 'text-sm font-medium text-zinc-900 font-mono tabular-nums',
    meta: 'text-xs text-zinc-500',
  },
  md: {
    amount: 'text-base font-semibold text-zinc-900 font-mono tabular-nums',
    meta: 'text-xs text-zinc-500',
  },
  lg: {
    amount: 'text-2xl font-semibold text-zinc-900 font-mono tabular-nums tracking-tight',
    meta: 'text-sm text-zinc-500',
  },
};

export function PriceDisplay({
  amount,
  unit,
  prefix,
  size = 'md',
  className = '',
}: PriceDisplayProps) {
  const styles = sizeClasses[size];
  const formattedAmount = Number.isFinite(amount)
    ? amount.toLocaleString('en-BD')
    : '0';

  return (
    <span
      className={['inline-flex items-baseline gap-1', className]
        .filter(Boolean)
        .join(' ')}
    >
      {prefix && <span className={styles.meta}>{prefix}</span>}
      <span className={styles.amount}>৳{formattedAmount}</span>
      {unit && (
        <span className={styles.meta}>
          {unit.startsWith('/') ? unit : `/ ${unit.replace(/^per\s+/i, '')}`}
        </span>
      )}
    </span>
  );
}

export default PriceDisplay;
