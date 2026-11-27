'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UserCheck, Wrench, ShieldAlert, ChevronDown, Sparkles } from 'lucide-react';
import type { UserRole } from '@/types';
import { useRole, DEMO_USERS, getDashboardPathForRole } from '@/context/RoleContext';

const ROLE_OPTIONS: {
  role: UserRole;
  label: string;
  shortDesc: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    role: 'customer',
    label: 'Customer',
    shortDesc: 'Browse services, book & review',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: UserCheck,
  },
  {
    role: 'provider',
    label: 'Provider',
    shortDesc: 'Accept jobs, update status & pricing',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: Wrench,
  },
  {
    role: 'admin',
    label: 'Admin',
    shortDesc: 'Verify providers, categories & complaints',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: ShieldAlert,
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
  const ActiveIcon = activeConfig.icon;

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
        aria-label={`Demo Mode Role Switcher, currently ${activeConfig.label}`}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm transition-colors hover:border-indigo-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-1"
      >
        <span className="inline-flex items-center gap-1 rounded bg-indigo-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
          <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
          Demo Mode
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
          <ActiveIcon className="h-3.5 w-3.5 text-indigo-700" aria-hidden="true" />
          <span>{activeConfig.label}</span>
          {!compact && (
            <span className="hidden text-slate-500 sm:inline">
              ({currentUser.name.split(' ')[0]})
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select demo role"
          className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-xl border border-slate-200 bg-white p-2 shadow-lg ring-1 ring-black/5"
        >
          <div className="mb-1.5 border-b border-slate-100 px-2.5 pb-2 pt-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-900">
              Prototype Role Switcher
            </p>
            <p className="text-xs text-slate-500">
              Switch persona to test Customer, Provider &amp; Admin workflows.
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
                  className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/90 text-indigo-950 ring-1 ring-indigo-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${option.badgeColor}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-slate-900">
                        {option.label} Demo
                      </span>
                      {isSelected && (
                        <span className="rounded-full bg-indigo-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs font-medium text-slate-600">
                      {demoPerson.name}
                    </p>
                    <p className="text-[11px] text-slate-500">{option.shortDesc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2 border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push(getDashboardPathForRole(currentRole));
              }}
              className="flex w-full items-center justify-center rounded-lg bg-indigo-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-800"
            >
              Open {activeConfig.label} Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
