'use client';

import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center bg-white border border-zinc-900/10 rounded-xl p-8 sm:p-12 shadow-[0_1px_2px_rgba(24,24,27,0.04)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="w-11 h-11 rounded-lg bg-surface-subtle text-zinc-600 flex items-center justify-center mb-4">
        {icon || <Inbox className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />}
      </div>
      <h3 className="text-base font-medium text-zinc-900 mb-1">{title}</h3>
      <p className="text-sm text-zinc-600 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
