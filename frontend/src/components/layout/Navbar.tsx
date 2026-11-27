'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Menu, X } from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { RoleSwitcher } from './RoleSwitcher';

const PUBLIC_NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Categories', href: '/categories' },
  { label: 'Providers', href: '/providers' },
  { label: 'How It Works', href: '/#how-it-works' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { currentRole, getDashboardPath } = useRole();

  const dashboardHref = getDashboardPath(currentRole);

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return false;
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-900/10 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Flat Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded-lg"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-900 text-white">
            <ShieldCheck className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <span className="text-base font-semibold tracking-tight text-zinc-900">
            ShebaLink
          </span>
        </Link>

        {/* Desktop Public Navigation */}
        <nav aria-label="Main navigation" className="hidden md:flex md:items-center md:gap-1">
          {PUBLIC_NAV_LINKS.map((item) => {
            const active = isActiveLink(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${active
                    ? 'bg-surface-subtle text-zinc-900'
                    : 'text-zinc-600 hover:bg-surface-hover hover:text-zinc-900'
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Role Switcher & Single Primary CTA */}
        <div className="hidden md:flex md:items-center md:gap-2">
          <RoleSwitcher />
          <Link
            href={dashboardHref}
            className="inline-flex h-9 items-center rounded-lg bg-brand-900 px-3.5 text-xs font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(24,24,27,0.08)] transition-colors duration-150 hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:ring-offset-1"
          >
            Dashboard
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <RoleSwitcher compact />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-900/15 text-zinc-700 hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand-700"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-900/10 bg-white px-4 pb-4 pt-3 shadow-[0_8px_24px_rgba(24,24,27,0.08)] md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col space-y-1">
            {PUBLIC_NAV_LINKS.map((item) => {
              const active = isActiveLink(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${active
                      ? 'bg-surface-subtle text-zinc-900'
                      : 'text-zinc-700 hover:bg-surface-hover'
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2">
              <Link
                href={dashboardHref}
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-full items-center justify-center rounded-lg bg-brand-900 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-800"
              >
                Open Dashboard
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
