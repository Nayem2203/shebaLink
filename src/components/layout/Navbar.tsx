'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Menu, X, LayoutDashboard, MapPin } from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { RoleSwitcher } from './RoleSwitcher';

const PUBLIC_NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Become a Provider', href: '/#become-provider' },
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-indigo-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-lg"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-900 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none tracking-tight text-slate-900">
                Sheba<span className="text-indigo-700">Link</span>
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-slate-500">
                <MapPin className="h-2.5 w-2.5 text-indigo-600" aria-hidden="true" />
                Rajshahi &bull; BD
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Public Navigation */}
        <nav aria-label="Main navigation" className="hidden md:flex md:items-center md:gap-1 lg:gap-2">
          {PUBLIC_NAV_LINKS.map((item) => {
            const active = isActiveLink(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Role Switcher & Demo Dashboard CTA */}
        <div className="hidden md:flex md:items-center md:gap-3">
          <RoleSwitcher />
          <Link
            href={dashboardHref}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-1 ${
              pathname?.startsWith('/dashboard')
                ? 'bg-indigo-950 text-white'
                : 'bg-indigo-900 text-white hover:bg-indigo-800'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Demo Dashboard</span>
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
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-3 shadow-lg md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col space-y-1">
            {PUBLIC_NAV_LINKS.map((item) => {
              const active = isActiveLink(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                    active
                      ? 'bg-indigo-50 text-indigo-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
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
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-800"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                <span>Open Demo Dashboard</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
