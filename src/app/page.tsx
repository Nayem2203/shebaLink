'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  Wrench,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';
import { SharedLayout } from '@/components/layout/SharedLayout';
import { useRole } from '@/context/RoleContext';

export default function HomePage() {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('Rajshahi');
  const router = useRouter();
  const { currentRole, getDashboardPath } = useRole();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (city) params.set('city', city);
    const queryString = params.toString();
    router.push(queryString ? `/services?${queryString}` : '/services');
  };

  return (
    <SharedLayout>
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-white py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-900">
              <MapPin className="h-3.5 w-3.5 text-indigo-700" aria-hidden="true" />
              <span>Trusted Household Services in Rajshahi, Dhaka &amp; Chattogram</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Find trusted professionals for every home need.
            </h1>

            <p className="mt-4 text-base text-slate-600 sm:text-lg">
              Compare verified local electricians, plumbers, AC technicians, cleaners, and
              movers with transparent BDT (&#2547;) starting prices and instant booking tracking.
            </p>

            {/* Primary Search Bar */}
            <form
              onSubmit={handleSearch}
              className="mt-8 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="relative flex-1">
                <label htmlFor="hero-service-search" className="sr-only">
                  Search for a service or issue
                </label>
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="hero-service-search"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="What do you need help with? (e.g., Electrician, Plumber, AC repair)"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>

              <div className="sm:w-44">
                <label htmlFor="hero-city-select" className="sr-only">
                  Select city
                </label>
                <select
                  id="hero-city-select"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                >
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chattogram">Chattogram</option>
                </select>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-1"
              >
                <span>Find a Service</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            {/* Quick Links */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-500">Quick Actions:</span>
              <Link
                href="/services"
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-800"
              >
                Browse All Services
              </Link>
              <Link
                href={getDashboardPath(currentRole)}
                className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 font-semibold text-indigo-900 hover:bg-indigo-100"
              >
                <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Open {currentRole} Demo Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Anchor Section */}
      <section id="how-it-works" className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              How ShebaLink Works
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Book verified household assistance in three straightforward steps.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-900">
                <Search className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                1. Discover &amp; Compare
              </h3>
              <p className="mt-1.5 text-sm text-slate-600">
                Search by category, neighborhood, BDT starting price, and verified customer
                ratings.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-900">
                <Clock className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                2. Submit a Service Request
              </h3>
              <p className="mt-1.5 text-sm text-slate-600">
                Describe the issue, attach an optional photo, and select your preferred date
                and time slot.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-900">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                3. Track &amp; Review
              </h3>
              <p className="mt-1.5 text-sm text-slate-600">
                Follow live status updates from Pending to Completed and leave a verified
                rating.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Provider Anchor Section */}
      <section id="become-provider" className="border-t border-slate-200 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-slate-200 bg-slate-900 p-8 text-white md:flex-row md:items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-indigo-200">
                <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                <span>For Skilled Technicians &amp; Service Professionals</span>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">
                Grow your local service business with ShebaLink
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Switch to Provider Demo Mode to inspect incoming service requests, accept jobs,
                update booking progress, and manage your BDT service rates.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/provider"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-100"
              >
                <Sparkles className="h-4 w-4 text-indigo-700" aria-hidden="true" />
                <span>Try Provider Demo Mode</span>
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <span>Explore Directory</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SharedLayout>
  );
}
