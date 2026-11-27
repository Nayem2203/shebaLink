import React from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Wrench,
  Ban,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';
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
  icon: React.ComponentType<{ className?: string }>;
}

const statusMap: Record<BadgeStatusValue, StatusStyleConfig> = {
  Pending: {
    label: 'Pending',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  Accepted: {
    label: 'Accepted',
    classes: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: CheckCircle2,
  },
  'In Progress': {
    label: 'In Progress',
    classes: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    icon: Wrench,
  },
  Completed: {
    label: 'Completed',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  Rejected: {
    label: 'Rejected',
    classes: 'bg-rose-50 text-rose-800 border-rose-200',
    icon: XCircle,
  },
  Cancelled: {
    label: 'Cancelled',
    classes: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: Ban,
  },
  verified: {
    label: 'Verified',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: ShieldCheck,
  },
  pending: {
    label: 'Pending Verification',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  pending_verification: {
    label: 'Pending Verification',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  unverified: {
    label: 'Unverified',
    classes: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: ShieldAlert,
  },
  rejected_verification: {
    label: 'Verification Rejected',
    classes: 'bg-rose-50 text-rose-800 border-rose-200',
    icon: XCircle,
  },
  Open: {
    label: 'Open',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: AlertCircle,
  },
  open: {
    label: 'Open',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: AlertCircle,
  },
  'In Review': {
    label: 'In Review',
    classes: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: Clock,
  },
  Resolved: {
    label: 'Resolved',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  resolved: {
    label: 'Resolved',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  Dismissed: {
    label: 'Dismissed',
    classes: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: Ban,
  },
};

export function StatusBadge({
  status,
  size = 'md',
  className = '',
}: StatusBadgeProps) {
  const config = statusMap[status] ?? {
    label: String(status),
    classes: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: AlertCircle,
  };
  const Icon = config.icon;

  return (
    <span
      className={[
        'inline-flex items-center font-medium border rounded-full whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5',
        config.classes,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon
        className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'}
        aria-hidden="true"
      />
      <span>{config.label}</span>
    </span>
  );
}

export default StatusBadge;
