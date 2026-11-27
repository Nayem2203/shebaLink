'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { User, Briefcase, Shield } from 'lucide-react';
import type { UserRole } from '@/types';

export interface DashboardNavItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  badgeCount?: number;
}

export interface DashboardSidebarProps {
  role: UserRole;
  items: DashboardNavItem[];
  activeItemId: string;
  onSelectItem: (id: string) => void;
  onRoleChange?: (role: UserRole) => void;
  className?: string;
}

const roleConfig: Record<
  UserRole,
  {
    title: string;
    subtitle: string;
    badgeClasses: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  customer: {
    title: 'Customer Portal',
    subtitle: 'Discover & manage bookings',
    badgeClasses: 'bg-blue-50 text-blue-800 border-blue-200',
    Icon: User,
  },
  provider: {
    title: 'Provider Portal',
    subtitle: 'Manage jobs & services',
    badgeClasses: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    Icon: Briefcase,
  },
  admin: {
    title: 'Admin Console',
    subtitle: 'Moderation & overview',
    badgeClasses: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Icon: Shield,
  },
};

export function DashboardSidebar({
  role,
  items,
  activeItemId,
  onSelectItem,
  onRoleChange,
  className = '',
}: DashboardSidebarProps) {
  const currentRole = roleConfig[role] || roleConfig.customer;
  const RoleIcon = currentRole.Icon;

  return (
    <aside
      aria-label={`${currentRole.title} navigation`}
      className={['w-full lg:w-64 shrink-0', className]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Mobile / Tablet Horizontal Scrollable Tabs */}
      <div className="lg:hidden mb-4 bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
        <div className="flex items-center justify-between px-2 py-1.5 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <RoleIcon className="w-4 h-4 text-indigo-700" aria-hidden="true" />
            <span className="text-xs font-semibold text-slate-900">
              {currentRole.title}
            </span>
          </div>
          {onRoleChange && (
            <div className="flex items-center gap-1">
              {(['customer', 'provider', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRoleChange(r)}
                  className={[
                    'px-2 py-0.5 text-xs font-medium rounded capitalize transition-colors',
                    role === r
                      ? 'bg-indigo-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100',
                  ].join(' ')}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {items.map((item) => {
            const isActive = item.id === activeItemId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-indigo-900 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100',
                ].join(' ')}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    className={[
                      'px-1.5 py-0.2 rounded-full text-[11px] font-semibold',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-800',
                    ].join(' ')}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col bg-white border border-slate-200 rounded-xl p-4 shadow-sm sticky top-24">
        <div className="pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-900 text-white flex items-center justify-center shrink-0">
              <RoleIcon className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {currentRole.title}
              </h2>
              <p className="text-xs text-slate-500">{currentRole.subtitle}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = item.id === activeItemId;
            const classes = [
              'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
              isActive
                ? 'bg-indigo-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
            ].join(' ');

            if (item.href && !onSelectItem) {
              return (
                <Link key={item.id} href={item.href} className={classes}>
                  <span className="inline-flex items-center gap-2.5 truncate">
                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span
                      className={[
                        'px-2 py-0.5 rounded-full text-xs font-semibold',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-700',
                      ].join(' ')}
                    >
                      {item.badgeCount}
                    </span>
                  )}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={classes}
              >
                <span className="inline-flex items-center gap-2.5 truncate">
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    className={[
                      'px-2 py-0.5 rounded-full text-xs font-semibold',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-700',
                    ].join(' ')}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {onRoleChange && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Switch Demo Role
            </p>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
              {(['customer', 'provider', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRoleChange(r)}
                  className={[
                    'py-1.5 text-xs font-medium rounded-md capitalize transition-colors',
                    role === r
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900',
                  ].join(' ')}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default DashboardSidebar;
