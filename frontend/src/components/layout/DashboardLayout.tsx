'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types';
import { useRole, getDashboardPathForRole } from '@/context/RoleContext';
import { DashboardSidebar } from '@/components/shared/DashboardSidebar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export interface DashboardNavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badgeCount?: number;
}

export interface DashboardLayoutProps {
  role: UserRole;
  items: DashboardNavItem[];
  activeItemId: string;
  onSelectItem: (id: string) => void;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

const ROLE_META: Record<
  UserRole,
  {
    badgeLabel: string;
    dotColor: string;
    description: string;
  }
> = {
  customer: {
    badgeLabel: 'Customer Demo Mode',
    dotColor: 'bg-sky-600',
    description:
      'Track service requests, cancel eligible pending bookings, or review completed jobs.',
  },
  provider: {
    badgeLabel: 'Provider Demo Mode',
    dotColor: 'bg-emerald-600',
    description:
      'Accept or reject incoming requests, progress active jobs, and manage BDT rates.',
  },
  admin: {
    badgeLabel: 'Admin Demo Mode',
    dotColor: 'bg-amber-600',
    description:
      'Review provider verifications, manage service categories, and resolve complaints.',
  },
};

export function DashboardLayout({
  role,
  items,
  activeItemId,
  onSelectItem,
  children,
}: DashboardLayoutProps) {
  const { currentUser, setRole } = useRole();
  const router = useRouter();
  const meta = ROLE_META[role];

  const handleRoleChange = (nextRole: UserRole) => {
    setRole(nextRole);
    router.push(getDashboardPathForRole(nextRole));
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-surface-canvas text-zinc-900">
      <Navbar />

      {/* Calm Hairline Demo Mode Context Bar */}
      <div className="border-b border-zinc-900/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-900/10 bg-surface-subtle px-2 py-0.5 font-medium text-zinc-800">
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dotColor}`} aria-hidden="true" />
              {meta.badgeLabel}
            </span>
            <span className="hidden text-zinc-600 md:inline">{meta.description}</span>
          </div>
          <div className="text-zinc-600">
            Active persona:{' '}
            <strong className="font-medium text-zinc-900">{currentUser.name}</strong>{' '}
            <span className="text-zinc-500">({currentUser.city ?? 'Rajshahi'})</span>
          </div>
        </div>
      </div>

      {/* Dashboard Body */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full shrink-0 lg:w-64">
          <DashboardSidebar
            role={role}
            items={items}
            activeItemId={activeItemId}
            onSelectItem={onSelectItem}
            onRoleChange={handleRoleChange}
          />
        </aside>

        <main id="dashboard-main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
