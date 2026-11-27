import React from 'react';
import type {
  BookingStatus,
  VerificationStatus,
  ComplaintStatus,
} from '@/types';

export type BadgeStatusValue =
  | BookingStatus
  | VerificationStatus
  | ComplaintStatus
  | 'pending_verification'
  | 'rejected_verification'
  | 'open'
  | 'resolved';

export interface StatusBadgeProps {
  status: BadgeStatusValue;
  size?: 'sm' | 'md';
  className?: string;
}

interface StatusStyleConfig {
  label: string;
  classes: string;
  dotColor: string;
}

const statusMap: Record<BadgeStatusValue, StatusStyleConfig> = {
  Pending: {
    label: 'Pending',
    classes: 'bg-amber-50/80 text-amber-900 border-amber-900/15',
    dotColor: 'bg-amber-600',
  },
  Accepted: {
    label: 'Accepted',
    classes: 'bg-sky-50/80 text-sky-900 border-sky-900/15',
    dotColor: 'bg-sky-600',
  },
  'In Progress': {
    label: 'In Progress',
    classes: 'bg-brand-50 text-brand-900 border-brand-900/15',
    dotColor: 'bg-brand-700',
  },
  Completed: {
    label: 'Completed',
    classes: 'bg-emerald-50/80 text-emerald-900 border-emerald-900/15',
    dotColor: 'bg-emerald-600',
  },
  Rejected: {
    label: 'Rejected',
    classes: 'bg-rose-50/80 text-rose-900 border-rose-900/15',
    dotColor: 'bg-rose-600',
  },
  Cancelled: {
    label: 'Cancelled',
    classes: 'bg-surface-subtle text-zinc-700 border-zinc-900/10',
    dotColor: 'bg-zinc-400',
  },
  verified: {
    label: 'Verified',
    classes: 'bg-emerald-50/80 text-emerald-900 border-emerald-900/15',
    dotColor: 'bg-emerald-600',
  },
  pending: {
    label: 'Pending Verification',
    classes: 'bg-amber-50/80 text-amber-900 border-amber-900/15',
    dotColor: 'bg-amber-600',
  },
  pending_verification: {
    label: 'Pending Verification',
    classes: 'bg-amber-50/80 text-amber-900 border-amber-900/15',
    dotColor: 'bg-amber-600',
  },
  unverified: {
    label: 'Unverified',
    classes: 'bg-surface-subtle text-zinc-700 border-zinc-900/10',
    dotColor: 'bg-zinc-400',
  },
  rejected_verification: {
    label: 'Verification Rejected',
    classes: 'bg-rose-50/80 text-rose-900 border-rose-900/15',
    dotColor: 'bg-rose-600',
  },
  Open: {
    label: 'Open',
    classes: 'bg-amber-50/80 text-amber-900 border-amber-900/15',
    dotColor: 'bg-amber-600',
  },
  open: {
    label: 'Open',
    classes: 'bg-amber-50/80 text-amber-900 border-amber-900/15',
    dotColor: 'bg-amber-600',
  },
  'In Review': {
    label: 'In Review',
    classes: 'bg-sky-50/80 text-sky-900 border-sky-900/15',
    dotColor: 'bg-sky-600',
  },
  Resolved: {
    label: 'Resolved',
    classes: 'bg-emerald-50/80 text-emerald-900 border-emerald-900/15',
    dotColor: 'bg-emerald-600',
  },
  resolved: {
    label: 'Resolved',
    classes: 'bg-emerald-50/80 text-emerald-900 border-emerald-900/15',
    dotColor: 'bg-emerald-600',
  },
  Dismissed: {
    label: 'Dismissed',
    classes: 'bg-surface-subtle text-zinc-700 border-zinc-900/10',
    dotColor: 'bg-zinc-400',
  },
};

export function StatusBadge({
  status,
  size = 'md',
  className = '',
}: StatusBadgeProps) {
  const config = statusMap[status] ?? {
    label: String(status),
    classes: 'bg-surface-subtle text-zinc-700 border-zinc-900/10',
    dotColor: 'bg-zinc-400',
  };

  return (
    <span
      className={[
        'inline-flex items-center font-medium border rounded-md whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs gap-1.5' : 'px-2.5 py-1 text-xs gap-1.5',
        config.classes,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={['w-1.5 h-1.5 rounded-full shrink-0', config.dotColor].join(' ')}
        aria-hidden="true"
      />
      <span>{config.label}</span>
    </span>
  );
}

export default StatusBadge;
