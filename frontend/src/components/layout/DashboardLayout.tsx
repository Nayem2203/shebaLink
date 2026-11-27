'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, UserCheck, Wrench, ShieldAlert } from 'lucide-react';
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
    bannerBg: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  customer: {
    badgeLabel: 'Customer Demo Mode',
    bannerBg: 'bg-indigo-900 text-white',
    description:
      'Viewing as demo customer. Track service requests, cancel eligible pending bookings, or review completed jobs.',
    icon: UserCheck,
  },
  provider: {
    badgeLabel: 'Provider Demo Mode',
    bannerBg: 'bg-emerald-900 text-white',
    description:
      'Viewing as demo service provider. Accept or reject incoming requests, progress active jobs, and manage BDT pricing.',
    icon: Wrench,
  },
  admin: {
    badgeLabel: 'Admin Demo Mode',
    bannerBg: 'bg-slate-900 text-white',
    description:
      'Viewing as platform administrator. Review provider verifications, manage service categories, and resolve complaints.',
    icon: ShieldAlert,
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
  const RoleIcon = meta.icon;

  const handleRoleChange = (nextRole: UserRole) => {
    setRole(nextRole);
    router.push(getDashboardPathForRole(nextRole));
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-slate-50 text-slate-900">
      <Navbar />

      {/* Demo Mode Context Banner */}
      <div className={`border-b border-white/10 ${meta.bannerBg}`}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-white/15 px-2 py-0.5 font-semibold tracking-wide">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {meta.badgeLabel}
            </span>
            <span className="hidden text-white/85 md:inline">{meta.description}</span>
          </div>
          <div className="flex items-center gap-2 font-medium text-white/90">
            <RoleIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              Active Persona: <strong>{currentUser.name}</strong> ({currentUser.city ?? 'Rajshahi'})
            </span>
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
