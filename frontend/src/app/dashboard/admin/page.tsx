'use client';

import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Grid,
  CalendarCheck,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button, StatusBadge, useToast } from '@/components/ui';
import { DashboardStatCard, PageHeader, PriceDisplay } from '@/components/shared';
import { BookingDetailModal } from '@/components/booking/BookingDetailModal';
import { STORAGE_CUSTOM_EVENT_NAME } from '@/lib/patterns/ObserverPattern';
import { getPlatformStats, resetAllDemoData } from '@/services/adminService';
import {
  getBookings,
  getComplaints,
  getCustomers,
  updateComplaintStatus,
} from '@/services/bookingService';
import {
  getCategories,
  getProviders,
  toggleCategoryActive,
  updateProviderVerification,
} from '@/services/discoveryService';
import type {
  Booking,
  Complaint,
  ComplaintStatus,
  PlatformStats,
  ProviderProfile,
  ServiceCategory,
  User,
  VerificationStatus,
} from '@/types';

export default function AdminDashboardPage() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const loadAdminData = () => {
      setStats(getPlatformStats());
      setProviders(getProviders());
      setCustomers(getCustomers());
      setCategories(getCategories());
      setBookings(getBookings());
      setComplaints(getComplaints());
    };

    loadAdminData();
    window.addEventListener(STORAGE_CUSTOM_EVENT_NAME, loadAdminData);
    return () => {
      window.removeEventListener(STORAGE_CUSTOM_EVENT_NAME, loadAdminData);
    };
  }, []);

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />,
    },
    {
      id: 'providers',
      label: 'Providers',
      icon: <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />,
      badgeCount: stats?.pendingVerificationProviders ?? 0,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <Users className="w-4 h-4" strokeWidth={1.5} />,
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: <Grid className="w-4 h-4" strokeWidth={1.5} />,
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: <CalendarCheck className="w-4 h-4" strokeWidth={1.5} />,
    },
    {
      id: 'complaints',
      label: 'Complaints',
      icon: <AlertCircle className="w-4 h-4" strokeWidth={1.5} />,
      badgeCount: stats?.openComplaints ?? 0,
    },
  ];

  const handleVerificationChange = (
    providerId: string,
    status: VerificationStatus
  ) => {
    updateProviderVerification(providerId, status);
    showToast({
      title: 'Verification status updated',
      message: `Provider marked as ${status}.`,
      type: 'success',
    });
  };

  const handleComplaintStatus = (
    complaintId: string,
    status: ComplaintStatus
  ) => {
    updateComplaintStatus(complaintId, status);
    showToast({
      title: 'Complaint updated',
      message: `Complaint ${complaintId} marked as ${status}.`,
      type: 'info',
    });
  };

  return (
    <DashboardLayout
      role="admin"
      items={navItems}
      activeItemId={activeTab}
      onSelectItem={setActiveTab}
    >
      <PageHeader
        title="Admin Console"
        subtitle="Inspect platform metrics, demo provider verifications, categories, bookings, and complaints."
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />}
            onClick={() => {
              resetAllDemoData();
              showToast({
                title: 'Demo platform reset',
                message: 'All LocalStorage records restored to initial seed state.',
                type: 'info',
              });
            }}
          >
            Reset All Demo Data
          </Button>
        }
      />

      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <DashboardStatCard label="Total bookings" value={stats.totalBookings} />
            <DashboardStatCard
              label="Verified providers"
              value={`${stats.verifiedProviders}/${stats.totalProviders}`}
            />
            <DashboardStatCard
              label="Active categories"
              value={`${stats.activeCategories}/${stats.totalCategories}`}
            />
            <DashboardStatCard
              label="Open complaints"
              value={stats.openComplaints}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Primary Chart (2/3 width) */}
            <section className="rounded-xl border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)] lg:col-span-8">
              <h2 className="text-base font-medium text-zinc-900">
                Bookings by status
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Live distribution derived from LocalStorage booking records.
              </p>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.bookingsByStatus}
                    margin={{ top: 8, right: 12, left: -16, bottom: 4 }}
                  >
                    <CartesianGrid
                      stroke="rgba(24,24,27,0.07)"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="status"
                      tick={{ fontSize: 12, fill: '#52525b' }}
                      axisLine={{ stroke: 'rgba(24,24,27,0.1)' }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: '#52525b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(24,24,27,0.04)' }}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: 'rgba(24,24,27,0.12)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Bookings"
                      fill="#1e1b4b"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Secondary Ranked Table (1/3 width) */}
            <section className="rounded-xl border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)] lg:col-span-4">
              <h2 className="text-base font-medium text-zinc-900">
                Bookings by city
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Regional volume across demo cities.
              </p>

              <div className="mt-5 space-y-4">
                {stats.bookingsByCity.map((row) => {
                  const pct =
                    stats.totalBookings > 0
                      ? Math.round((row.count / stats.totalBookings) * 100)
                      : 0;
                  return (
                    <div key={row.city}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-zinc-900">
                          {row.city}
                        </span>
                        <span className="font-mono text-zinc-600 tabular-nums">
                          {row.count} ({pct}%)
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-surface-subtle">
                        <div
                          className="h-1.5 rounded-full bg-brand-900"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 border-t border-zinc-900/5 pt-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Completed volume</span>
                  <PriceDisplay amount={stats.totalRevenueBDT} size="sm" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-zinc-500">Platform rating avg</span>
                  <span className="font-mono font-medium text-zinc-900 tabular-nums">
                    {stats.averagePlatformRating} / 5.0
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === 'providers' && (
        <section className="rounded-xl border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)]">
          <h2 className="text-base font-medium text-zinc-900">
            Provider verification queue
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-900/10 text-xs font-medium text-zinc-500">
                  <th className="py-2.5 pr-4">Provider</th>
                  <th className="py-2.5 pr-4">City</th>
                  <th className="py-2.5 pr-4">Rate</th>
                  <th className="py-2.5 pr-4">Status</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/5">
                {providers.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-zinc-900">{p.name}</p>
                      <p className="text-xs text-zinc-500">{p.title}</p>
                    </td>
                    <td className="py-3 pr-4 text-xs text-zinc-600">
                      {p.primaryCity}
                    </td>
                    <td className="py-3 pr-4">
                      <PriceDisplay amount={p.startingPrice} size="sm" />
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={p.verifiedStatus} size="sm" />
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {p.verifiedStatus !== 'verified' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() =>
                              handleVerificationChange(p.id, 'verified')
                            }
                          >
                            Verify
                          </Button>
                        )}
                        {p.verifiedStatus === 'verified' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleVerificationChange(p.id, 'unverified')
                            }
                          >
                            Unverify
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'customers' && (
        <section className="rounded-xl border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)]">
          <h2 className="text-base font-medium text-zinc-900">
            Demo customers ({customers.length})
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-900/10 text-xs font-medium text-zinc-500">
                  <th className="py-2.5 pr-4">Name</th>
                  <th className="py-2.5 pr-4">Phone</th>
                  <th className="py-2.5 pr-4">City</th>
                  <th className="py-2.5">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/5">
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-zinc-900">{c.name}</p>
                      <p className="text-xs text-zinc-500">{c.email}</p>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-zinc-700 tabular-nums">
                      {c.phone}
                    </td>
                    <td className="py-3 pr-4 text-xs text-zinc-600">
                      {c.city}
                    </td>
                    <td className="py-3 text-xs text-zinc-600">{c.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'categories' && (
        <section className="rounded-xl border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)]">
          <h2 className="text-base font-medium text-zinc-900">
            Service categories ({categories.length})
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-900/10 text-xs font-medium text-zinc-500">
                  <th className="py-2.5 pr-4">Category</th>
                  <th className="py-2.5 pr-4">Group</th>
                  <th className="py-2.5 pr-4">State</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/5">
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-zinc-900">{cat.name}</p>
                      <p className="font-mono text-xs text-zinc-500">
                        /{cat.slug}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-xs text-zinc-600">
                      {cat.group}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${
                          cat.active
                            ? 'border-emerald-900/15 bg-emerald-50/80 text-emerald-900'
                            : 'border-zinc-900/10 bg-surface-subtle text-zinc-600'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            cat.active ? 'bg-emerald-600' : 'bg-zinc-400'
                          }`}
                        />
                        {cat.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          toggleCategoryActive(cat.id);
                          showToast({
                            title: 'Category updated',
                            message: `${cat.name} toggled.`,
                            type: 'info',
                          });
                        }}
                      >
                        {cat.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'bookings' && (
        <section className="rounded-xl border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)]">
          <h2 className="text-base font-medium text-zinc-900">
            All platform bookings ({bookings.length})
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-900/10 text-xs font-medium text-zinc-500">
                  <th className="py-2.5 pr-4">ID</th>
                  <th className="py-2.5 pr-4">Service</th>
                  <th className="py-2.5 pr-4">Customer / Provider</th>
                  <th className="py-2.5 pr-4">Estimate</th>
                  <th className="py-2.5 pr-4">Status</th>
                  <th className="py-2.5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/5">
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="py-3 pr-4 font-mono text-xs text-zinc-600 tabular-nums">
                      {b.id}
                    </td>
                    <td className="py-3 pr-4 font-medium text-zinc-900">
                      {b.serviceTitle || b.categoryName}
                    </td>
                    <td className="py-3 pr-4 text-xs text-zinc-600">
                      {b.customerName} &rarr; {b.providerName}
                    </td>
                    <td className="py-3 pr-4">
                      {b.quotedPrice ? (
                        <PriceDisplay amount={b.quotedPrice} size="sm" />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDetailBooking(b)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'complaints' && (
        <section className="space-y-4">
          {complaints.map((cmp) => (
            <article
              key={cmp.id}
              className="rounded-xl border border-zinc-900/10 bg-white p-5 shadow-[0_1px_2px_rgba(24,24,27,0.04)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-surface-subtle px-2 py-0.5 font-mono text-xs text-zinc-600 tabular-nums">
                      {cmp.id}
                    </span>
                    <span className="font-mono text-xs text-zinc-500 tabular-nums">
                      Booking {cmp.bookingId}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-zinc-900">
                    {cmp.subject}
                  </h3>
                </div>
                <StatusBadge status={cmp.status} size="sm" />
              </div>

              <p className="mt-2 text-sm text-zinc-600">{cmp.description}</p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-900/5 pt-3 text-xs text-zinc-500">
                <span>
                  Customer: {cmp.customerName} &bull; Provider:{' '}
                  {cmp.providerName}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(['Open', 'In Review', 'Resolved', 'Dismissed'] as ComplaintStatus[]).map(
                    (st) => (
                      <Button
                        key={st}
                        size="sm"
                        variant={cmp.status === st ? 'primary' : 'outline'}
                        onClick={() => handleComplaintStatus(cmp.id, st)}
                      >
                        {st}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <BookingDetailModal
        booking={detailBooking}
        onClose={() => setDetailBooking(null)}
      />
    </DashboardLayout>
  );
}
