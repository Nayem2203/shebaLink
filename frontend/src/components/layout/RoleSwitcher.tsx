'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User, Wrench, Shield, ChevronDown, type LucideIcon } from 'lucide-react';
import type { UserRole } from '@/types';
import { useRole, DEMO_USERS, getDashboardPathForRole } from '@/context/RoleContext';

const ROLE_OPTIONS: {
  role: UserRole;
  label: string;
  shortDesc: string;
  dotColor: string;
  icon: LucideIcon;
}[] = [
  {
    role: 'customer',
    label: 'Customer',
    shortDesc: 'Browse services, book and review',
    dotColor: 'bg-sky-600',
    icon: User,
  },
  {
    role: 'provider',
    label: 'Provider',
    shortDesc: 'Accept jobs, update status and rates',
    dotColor: 'bg-emerald-600',
    icon: Wrench,
  },
  {
    role: 'admin',
    label: 'Admin',
    shortDesc: 'Verify providers and moderate complaints',
    dotColor: 'bg-amber-600',
    icon: Shield,
  },
];

export interface RoleSwitcherProps {
  compact?: boolean;
  navigateOnSwitch?: boolean;
  className?: string;
}

export function RoleSwitcher({
  compact = false,
  navigateOnSwitch = true,
  className = '',
}: RoleSwitcherProps) {
  const { currentRole, currentUser, setRole } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const activeConfig =
    ROLE_OPTIONS.find((item) => item.role === currentRole) ?? ROLE_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelectRole = (nextRole: UserRole) => {
    setRole(nextRole);
    setIsOpen(false);
    if (navigateOnSwitch && pathname && pathname.startsWith('/dashboard')) {
      router.push(getDashboardPathForRole(nextRole));
    }
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Demo mode role switcher, currently ${activeConfig.label}`}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-900/15 bg-white px-3 text-xs font-medium text-zinc-800 shadow-[0_1px_2px_rgba(24,24,27,0.04)] transition-colors duration-150 hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand-700/20"
      >
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${activeConfig.dotColor}`}
          aria-hidden="true"
        />
        <span className="text-zinc-500">Demo:</span>
        <span className="font-medium text-zinc-900">
          {activeConfig.label}
          {!compact && (
            <span className="hidden text-zinc-500 font-normal sm:inline">
              {' '}
              ({currentUser.name.split(' ')[0]})
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select demo role"
          className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-xl border border-zinc-900/10 bg-white p-2 shadow-[0_8px_24px_rgba(24,24,27,0.08)] animate-enter"
        >
          <div className="mb-1 border-b border-zinc-900/5 px-2.5 pb-2 pt-1">
            <p className="text-xs font-medium text-zinc-900">
              Demo role switcher
            </p>
            <p className="text-xs text-zinc-500">
              Preview Customer, Provider, or Admin workflows.
            </p>
          </div>

          <div className="space-y-1">
            {ROLE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = option.role === currentRole;
              const demoPerson = DEMO_USERS[option.role];
              return (
                <button
                  key={option.role}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectRole(option.role)}
                  className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 ${
                    isSelected
                      ? 'bg-surface-subtle text-zinc-900'
                      : 'text-zinc-700 hover:bg-surface-hover'
                  }`}
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-900/10 bg-white text-zinc-600">
                    <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-zinc-900">
                        {option.label}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-800">
                          <span className={`h-1.5 w-1.5 rounded-full ${option.dotColor}`} />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-zinc-600">
                      {demoPerson.name}
                    </p>
                    <p className="text-xs text-zinc-500">{option.shortDesc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2 border-t border-zinc-900/5 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push(getDashboardPathForRole(currentRole));
              }}
              className="flex h-8 w-full items-center justify-center rounded-lg bg-brand-900 px-3 text-xs font-medium text-white transition-colors duration-150 hover:bg-brand-800"
            >
              Open {activeConfig.label} Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
