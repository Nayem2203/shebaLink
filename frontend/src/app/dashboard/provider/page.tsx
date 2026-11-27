'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Inbox,
  Wrench,
  Clock,
  Wallet,
  Plus,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Button,
  ConfirmDialog,
  EmptyState,
  Input,
  Select,
  StatusBadge,
  Textarea,
  useToast,
} from '@/components/ui';
import {
  BookingCard,
  DashboardStatCard,
  PageHeader,
  PriceDisplay,
} from '@/components/shared';
import { BookingDetailModal } from '@/components/booking/BookingDetailModal';
import { STORAGE_CUSTOM_EVENT_NAME } from '@/lib/patterns/ObserverPattern';
import {
  getBookingsByProvider,
  updateBookingStatus,
} from '@/services/bookingService';
import { getAllowedNextStatuses } from '@/services/bookingStatusEngine';
import {
  getCategories,
  getProviderById,
  getProviderServices,
  toggleProviderServiceActive,
  updateProviderAvailability,
  upsertProviderService,
} from '@/services/discoveryService';
import type {
  AvailabilityLabel,
  Booking,
  BookingStatus,
  PriceUnit,
  ProviderProfile,
  ProviderService,
  ServiceCategory,
} from '@/types';

const DEMO_PROVIDER_ID = 'prov-001';

export default function ProviderDashboardPage() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [provider, setProvider] = useState<ProviderProfile | undefined>(
    undefined
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ProviderService[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);

  // Add service form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('500');
  const [newUnit, setNewUnit] = useState<PriceUnit>('per visit');
  const [newCatId, setNewCatId] = useState('cat-electrician');

  useEffect(() => {
    const loadProviderState = () => {
      setProvider(getProviderById(DEMO_PROVIDER_ID));
      setBookings(getBookingsByProvider(DEMO_PROVIDER_ID));
      setServices(getProviderServices(DEMO_PROVIDER_ID, false));
      setCategories(getCategories({ onlyActive: true }));
    };

    loadProviderState();
    window.addEventListener(STORAGE_CUSTOM_EVENT_NAME, loadProviderState);
    return () => {
      window.removeEventListener(STORAGE_CUSTOM_EVENT_NAME, loadProviderState);
    };
  }, []);

  const metrics = useMemo(() => {
    const pending = bookings.filter((b) => b.status === 'Pending');
    const active = bookings.filter(
      (b) => b.status === 'Accepted' || b.status === 'In Progress'
    );
    const completed = bookings.filter((b) => b.status === 'Completed');
    const earnings = completed.reduce((sum, b) => sum + (b.quotedPrice ?? 0), 0);
    return {
      pendingCount: pending.length,
      activeCount: active.length,
      completedCount: completed.length,
      earnings,
      completedList: completed,
    };
  }, [bookings]);

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />,
    },
    {
      id: 'requests',
      label: 'Requests',
      icon: <Inbox className="w-4 h-4" strokeWidth={1.5} />,
      badgeCount: metrics.pendingCount,
    },
    {
      id: 'services',
      label: 'My Services',
      icon: <Wrench className="w-4 h-4" strokeWidth={1.5} />,
    },
    {
      id: 'availability',
      label: 'Availability',
      icon: <Clock className="w-4 h-4" strokeWidth={1.5} />,
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: <Wallet className="w-4 h-4" strokeWidth={1.5} />,
    },
  ];

  const handleStatusUpdate = (bookingId: string, nextStatus: BookingStatus) => {
    if (nextStatus === 'Rejected') {
      setRejectTargetId(bookingId);
      return;
    }
    const res = updateBookingStatus(bookingId, nextStatus, 'provider');
    if (!res.success) {
      showToast({
        title: 'Status update rejected',
        message: res.error,
        type: 'error',
      });
      return;
    }
    showToast({
      title: `Booking ${nextStatus}`,
      message: `${res.booking.id} moved to ${nextStatus}.`,
      type: 'success',
    });
  };

  const handleConfirmReject = () => {
    if (!rejectTargetId) return;
    const res = updateBookingStatus(rejectTargetId, 'Rejected', 'provider');
    setRejectTargetId(null);
    if (!res.success) {
      showToast({
        title: 'Could not reject request',
        message: res.error,
        type: 'error',
      });
      return;
    }
    showToast({
      title: 'Request rejected',
      message: `${res.booking.id} has been marked as Rejected.`,
      type: 'info',
    });
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(newPrice);
    if (!newTitle.trim() || !newDesc.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      showToast({
        title: 'Invalid service details',
        message: 'Provide a title, description, and valid BDT starting price.',
        type: 'error',
      });
      return;
    }
    const newService: ProviderService = {
      id: `srv-${Date.now().toString(36).slice(-5)}`,
      providerId: DEMO_PROVIDER_ID,
      categoryId: newCatId,
      title: newTitle.trim(),
      description: newDesc.trim(),
      startingPrice: numericPrice,
      priceUnit: newUnit,
      active: true,
    };
    upsertProviderService(newService);
    setNewTitle('');
    setNewDesc('');
    setNewPrice('500');
    showToast({
      title: 'Service added',
      message: `${newService.title} is now listed on your profile.`,
      type: 'success',
    });
  };

  return (
    <DashboardLayout
      role="provider"
      items={navItems}
      activeItemId={activeTab}
      onSelectItem={setActiveTab}
    >
      <PageHeader
        title="Provider Dashboard"
        subtitle={
          provider
            ? `${provider.name} • ${provider.title} (${provider.neighborhood}, ${provider.primaryCity})`
            : 'Manage incoming requests, service rates, and availability.'
        }
        badge={
          provider ? (
            <StatusBadge status={provider.verifiedStatus} size="sm" />
          ) : undefined
        }
      />

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <DashboardStatCard
              label="Incoming pending"
              value={metrics.pendingCount}
            />
            <DashboardStatCard
              label="Active jobs"
              value={metrics.activeCount}
            />
            <DashboardStatCard
              label="Completed jobs"
              value={metrics.completedCount}
            />
            <DashboardStatCard
              label="Completed earnings"
              value={`৳${metrics.earnings.toLocaleString('en-BD')}`}
            />
          </div>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-medium text-zinc-900">
                Actionable requests
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('requests')}
                className="text-xs font-medium text-brand-800 hover:text-brand-950"
              >
                All requests ({bookings.length})
              </button>
            </div>
            {bookings.length === 0 ? (
              <EmptyState
                title="No service requests assigned yet"
                description="Incoming customer bookings will appear here."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {bookings.slice(0, 4).map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    viewerRole="provider"
                    allowedTransitions={getAllowedNextStatuses(
                      booking.status,
                      'provider'
                    )}
                    onStatusChange={handleStatusUpdate}
                    onViewDetails={(id) =>
                      setDetailBooking(bookings.find((b) => b.id === id) ?? null)
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <EmptyState
              title="No requests found"
              description="Customer booking requests assigned to your profile appear here."
            />
          ) : (
            bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                viewerRole="provider"
                allowedTransitions={getAllowedNextStatuses(
                  booking.status,
                  'provider'
                )}
                onStatusChange={handleStatusUpdate}
                onViewDetails={(id) =>
                  setDetailBooking(bookings.find((b) => b.id === id) ?? null)
                }
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'services' && (
        <div className="space-y-6">
          <section className="rounded-xl border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)]">
            <h2 className="text-base font-medium text-zinc-900">
              Listed services and BDT rates
            </h2>
            <div className="mt-4 divide-y divide-zinc-900/5">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="flex flex-col gap-3 py-4 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-zinc-900">
                        {srv.title}
                      </h3>
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                          srv.active
                            ? 'bg-emerald-50 text-emerald-900'
                            : 'bg-surface-subtle text-zinc-600'
                        }`}
                      >
                        {srv.active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-600">
                      {srv.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <PriceDisplay
                      amount={srv.startingPrice}
                      unit={srv.priceUnit}
                      size="sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleProviderServiceActive(srv.id)}
                    >
                      {srv.active ? 'Pause' : 'Activate'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <form
            onSubmit={handleAddService}
            className="rounded-xl border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)]"
          >
            <h2 className="text-base font-medium text-zinc-900">
              Add a new service offering
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Service title"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Sub-meter Installation"
              />
              <Select
                label="Category"
                value={newCatId}
                onChange={(e) => setNewCatId(e.target.value)}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
              <Input
                label="Starting price (BDT ৳)"
                type="number"
                required
                min={50}
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
              <Select
                label="Price unit"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value as PriceUnit)}
                options={[
                  { value: 'per visit', label: 'per visit' },
                  { value: 'per job', label: 'per job' },
                  { value: 'per unit', label: 'per unit' },
                  { value: 'per hour', label: 'per hour' },
                ]}
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="Service description"
                  required
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Briefly explain what is included in the starting rate"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" strokeWidth={1.5} />}
              >
                Add Service
              </Button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'availability' && provider && (
        <section className="rounded-xl border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)]">
          <h2 className="text-base font-medium text-zinc-900">
            Mock availability controls
          </h2>
          <p className="mt-1 text-xs text-zinc-600">
            Updates appear immediately across Service Discovery and your public
            provider card.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {(
              [
                { label: 'Available Today', available: true },
                { label: 'Available Tomorrow', available: true },
                { label: 'Busy', available: false },
              ] as { label: AvailabilityLabel; available: boolean }[]
            ).map((opt) => {
              const selected = provider.availabilityLabel === opt.label;
              return (
                <Button
                  key={opt.label}
                  variant={selected ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => {
                    updateProviderAvailability(
                      provider.id,
                      opt.available,
                      opt.label
                    );
                    showToast({
                      title: 'Availability updated',
                      message: `Status set to "${opt.label}".`,
                      type: 'success',
                    });
                  }}
                >
                  {opt.label}
                </Button>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === 'earnings' && (
        <section className="rounded-xl border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900/5 pb-4">
            <div>
              <h2 className="text-base font-medium text-zinc-900">
                Completed jobs earnings ledger
              </h2>
              <p className="text-xs text-zinc-500">
                Calculated from demo bookings marked Completed.
              </p>
            </div>
            <PriceDisplay amount={metrics.earnings} size="lg" />
          </div>

          {metrics.completedList.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">
              No completed jobs recorded yet.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-900/10 text-xs font-medium text-zinc-500">
                    <th className="py-2.5 pr-4">Booking ID</th>
                    <th className="py-2.5 pr-4">Service</th>
                    <th className="py-2.5 pr-4">Date</th>
                    <th className="py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/5">
                  {metrics.completedList.map((b) => (
                    <tr key={b.id}>
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-600 tabular-nums">
                        {b.id}
                      </td>
                      <td className="py-3 pr-4 font-medium text-zinc-900">
                        {b.serviceTitle || b.categoryName}
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-600 tabular-nums">
                        {b.preferredDate}
                      </td>
                      <td className="py-3 text-right">
                        <PriceDisplay amount={b.quotedPrice ?? 0} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <ConfirmDialog
        isOpen={Boolean(rejectTargetId)}
        title="Reject booking request"
        description="Rejecting a request is terminal. Are you sure you cannot fulfill this service request?"
        confirmLabel="Reject Request"
        variant="destructive"
        onConfirm={handleConfirmReject}
        onClose={() => setRejectTargetId(null)}
      />

      <BookingDetailModal
        booking={detailBooking}
        onClose={() => setDetailBooking(null)}
      />
    </DashboardLayout>
  );
}
