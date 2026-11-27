import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Phone, Mail, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5 text-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-900 text-white">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Sheba<span className="text-indigo-700">Link</span>
              </span>
            </Link>
            <p className="text-sm font-medium text-slate-700">
              Find trusted help, right around you.
            </p>
            <p className="text-xs leading-relaxed text-slate-500">
              Local service discovery and booking prototype built for Bangladesh, starting with
              verified household and repair professionals in Rajshahi.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Platform Navigation
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-indigo-700 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-indigo-700 transition-colors">
                  Browse All Services
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-indigo-700 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/dashboard/customer" className="hover:text-indigo-700 transition-colors">
                  Customer Demo Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/provider" className="hover:text-indigo-700 transition-colors">
                  Provider Demo Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin" className="hover:text-indigo-700 transition-colors">
                  Admin Demo Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Service Coverage Areas */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Service Coverage
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-700" aria-hidden="true" />
                <div>
                  <span className="font-medium text-slate-800">Rajshahi (Primary Hub)</span>
                  <p className="text-xs text-slate-500">
                    Boalia, Shaheb Bazar, Motihar, Kazla, Rajpara, Padma Residential
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <div>
                  <span className="font-medium text-slate-800">Dhaka</span>
                  <p className="text-xs text-slate-500">Dhanmondi, Uttara, Mirpur, Gulshan</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <div>
                  <span className="font-medium text-slate-800">Chattogram</span>
                  <p className="text-xs text-slate-500">Agrabad, Nasirabad, GEC Circle</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Placeholders */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Contact &amp; Support (Demo)
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li className="flex items-center gap-2 text-slate-600">
                <Phone className="h-4 w-4 shrink-0 text-indigo-700" aria-hidden="true" />
                <span>+8801700000000</span>
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <Mail className="h-4 w-4 shrink-0 text-indigo-700" aria-hidden="true" />
                <span>support@shebalink.demo</span>
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <Clock className="h-4 w-4 shrink-0 text-indigo-700" aria-hidden="true" />
                <span>Daily: 8:00 AM &ndash; 10:00 PM (BST)</span>
              </li>
              <li className="pt-1">
                <span className="inline-block rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  CSE 3206 Software Engineering Sessional Prototype
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} ShebaLink Prototype. Fictional demo data only.</p>
          <p>Currency: Bangladeshi Taka (BDT &#2547;) &bull; LocalStorage Persistence</p>
        </div>
      </div>
    </footer>
  );
}
