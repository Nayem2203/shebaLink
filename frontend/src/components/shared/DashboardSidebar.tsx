'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { User, Briefcase, Shield, type LucideIcon } from 'lucide-react';
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
    Icon: LucideIcon;
  }
> = {
  customer: {
    title: 'Customer Portal',
    subtitle: 'Bookings and reviews',
    Icon: User,
  },
  provider: {
    title: 'Provider Portal',
    subtitle: 'Requests and rates',
    Icon: Briefcase,
  },
  admin: {
    title: 'Admin Console',
    subtitle: 'Moderation and catalog',
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
      {/* Mobile / Tablet Horizontal Tabs */}
      <div className="lg:hidden mb-4 bg-white border border-zinc-900/10 rounded-xl p-2 shadow-[0_1px_2px_rgba(24,24,27,0.04)]">
        <div className="flex items-center justify-between px-2 py-2 mb-2 border-b border-zinc-900/5">
          <div className="flex items-center gap-2">
            <RoleIcon className="w-4 h-4 text-zinc-600" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-xs font-medium text-zinc-900">
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
                    'px-2 py-1 text-xs font-medium rounded-md capitalize transition-colors duration-150',
                    role === r
                      ? 'bg-brand-900 text-white'
                      : 'text-zinc-600 hover:bg-surface-subtle',
                  ].join(' ')}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto pb-1">
          {items.map((item) => {
            const isActive = item.id === activeItemId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'inline-flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-colors duration-150',
                  isActive
                    ? 'bg-brand-900 text-white'
                    : 'text-zinc-700 hover:bg-surface-subtle',
                ].join(' ')}
              >
                {item.icon && <span className="shrink-0 w-4 h-4 flex items-center justify-center">{item.icon}</span>}
                <span>{item.label}</span>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    className={[
                      'text-xs font-mono tabular-nums',
                      isActive ? 'text-white/80' : 'text-zinc-500',
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
      <div className="hidden lg:flex flex-col bg-white border border-zinc-900/10 rounded-xl p-4 shadow-[0_1px_2px_rgba(24,24,27,0.04)] sticky top-24">
        <div className="pb-4 mb-4 border-b border-zinc-900/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-surface-subtle text-zinc-700 flex items-center justify-center shrink-0">
              <RoleIcon className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-zinc-900">
                {currentRole.title}
              </h2>
              <p className="text-xs text-zinc-500">{currentRole.subtitle}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = item.id === activeItemId;
            const classes = [
              'w-full h-9 flex items-center justify-between gap-2 px-3 rounded-lg text-sm font-medium transition-colors duration-150 text-left',
              isActive
                ? 'bg-brand-900 text-white'
                : 'text-zinc-700 hover:bg-surface-subtle hover:text-zinc-900',
            ].join(' ');

            if (item.href && !onSelectItem) {
              return (
                <Link key={item.id} href={item.href} className={classes}>
                  <span className="inline-flex items-center gap-2.5 truncate">
                    {item.icon && (
                      <span className="shrink-0 w-4 h-4 flex items-center justify-center">
                        {item.icon}
                      </span>
                    )}
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span
                      className={[
                        'text-xs font-mono tabular-nums',
                        isActive ? 'text-white/80' : 'text-zinc-500',
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
                  {item.icon && (
                    <span className="shrink-0 w-4 h-4 flex items-center justify-center">
                      {item.icon}
                    </span>
                  )}
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    className={[
                      'text-xs font-mono tabular-nums',
                      isActive ? 'text-white/80' : 'text-zinc-500',
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
          <div className="mt-6 pt-4 border-t border-zinc-900/5">
            <p className="text-xs font-medium text-zinc-500 mb-2">
              Demo role
            </p>
            <div className="grid grid-cols-3 gap-1 bg-surface-subtle p-1 rounded-lg">
              {(['customer', 'provider', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRoleChange(r)}
                  className={[
                    'py-1.5 text-xs font-medium rounded-md capitalize transition-colors duration-150',
                    role === r
                      ? 'bg-white text-zinc-900 shadow-[0_1px_2px_rgba(24,24,27,0.05)]'
                      : 'text-zinc-600 hover:text-zinc-900',
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
