'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';
import { useToast } from '@/components/ui';

export function Footer() {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast({
        title: 'Enter a valid email',
        message: 'Provide an email address for demo updates.',
        type: 'warning',
      });
      return;
    }
    setEmail('');
    showToast({
      title: 'Subscribed (Demo)',
      message: 'Demo prototype newsletter preference noted locally.',
      type: 'success',
    });
  };

  return (
    <footer className="border-t border-white/10 bg-brand-950 text-zinc-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12">
          {/* Column 1: Brand & Coverage */}
          <div className="space-y-4 lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <ShieldCheck className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <span className="text-base font-semibold tracking-tight text-white">
                ShebaLink
              </span>
            </Link>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-xs">
              Your trusted local service marketplace for Rajshahi, Dhaka, and
              Chattogram. Find, book, and track home services with transparent BDT
              rates.
            </p>
            <div className="space-y-1.5 text-xs text-zinc-400">
              <p className="flex items-center gap-2 font-mono tabular-nums">
                <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>+8801700000000</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>support@shebalink.demo</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>Rajshahi (Primary Hub) &bull; Dhaka &bull; Chattogram</span>
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-medium text-white">Quick Links</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors duration-150">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors duration-150">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition-colors duration-150">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/providers" className="hover:text-white transition-colors duration-150">
                  Providers
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors duration-150">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Users & Providers */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-medium text-white">Demo Portals</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/book" className="hover:text-white transition-colors duration-150">
                  Book a Service
                </Link>
              </li>
              <li>
                <Link href="/dashboard/customer" className="hover:text-white transition-colors duration-150">
                  Customer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/provider" className="hover:text-white transition-colors duration-150">
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin" className="hover:text-white transition-colors duration-150">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Stay Connected */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-medium text-white">Stay Connected</h3>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Get prototype updates and local service availability notes.
            </p>
            <form onSubmit={handleSubscribe} className="mt-3 flex gap-2">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="h-9 min-w-0 flex-1 rounded-lg border border-white/15 bg-white/10 px-3 text-xs text-white placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              />
              <button
                type="submit"
                className="h-9 shrink-0 rounded-lg bg-brand-600 px-3.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-brand-700"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-zinc-400 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} ShebaLink Prototype &bull; CSE 3206 Software Engineering Sessional
          </p>
          <p className="font-mono tabular-nums">
            Currency: BDT (&#2547;) &bull; Fictional Demo Data
          </p>
        </div>
      </div>
    </footer>
  );
}
