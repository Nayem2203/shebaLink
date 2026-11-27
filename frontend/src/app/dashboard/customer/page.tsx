'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  User as UserIcon,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Button,
  ConfirmDialog,
  EmptyState,
  useToast,
} from '@/components/ui';
import {
  BookingCard,
  DashboardStatCard,
  PageHeader,
} from '@/components/shared';
import { BookingDetailModal } from '@/components/booking/BookingDetailModal';
import { ReviewModal } from '@/components/booking/ReviewModal';
import { useRole } from '@/context/RoleContext';
import { STORAGE_CUSTOM_EVENT_NAME } from '@/lib/patterns/ObserverPattern';
import { resetAllDemoData } from '@/services/adminService';
import {
  cancelBooking,
  createReview,
  getBookingsByCustomer,
  getReviewByBookingId,
} from '@/services/bookingService';
import { canTransitionBookingStatus } from '@/services/bookingStatusEngine';
import type { Booking, BookingStatus } from '@/types';

const STATUS_FILTERS: ('All' | BookingStatus)[] = [
  'All',
  'Pending',
  'Accepted',
  'In Progress',
  'Completed',
  'Cancelled',
  'Rejected',
];

export default function CustomerDashboardPage() {
  const { currentUser, setRole } = useRole();
  const { showToast } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState<'All' | BookingStatus>('All');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [storageTick, setStorageTick] = useState(0);

  const customerId =
    currentUser.role === 'customer' ? currentUser.id : 'cust-001';

  useEffect(() => {
    const loadBookings = () => {
      setBookings(getBookingsByCustomer(customerId));
      setStorageTick((t) => t + 1);
    };
    loadBookings();
    window.addEventListener(STORAGE_CUSTOM_EVENT_NAME, loadBookings);
    return () => {
      window.removeEventListener(STORAGE_CUSTOM_EVENT_NAME, loadBookings);
    };
  }, [customerId]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'Pending').length,
      active: bookings.filter(
        (b) => b.status === 'Accepted' || b.status === 'In Progress'
      ).length,
      completed: bookings.filter((b) => b.status === 'Completed').length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'All') return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />,
    },
    {
      id: 'find-services',
      label: 'Find Services',
      icon: <Search className="w-4 h-4" strokeWidth={1.5} />,
    },
    {
      id: 'bookings',
      label: 'My Bookings',
      icon: <CalendarCheck className="w-4 h-4" strokeWidth={1.5} />,
      badgeCount: stats.pending,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <UserIcon className="w-4 h-4" strokeWidth={1.5} />,
    },
  ];

  const handleSelectNav = (id: string) => {
    if (id === 'find-services') {
      router.push('/services');
      return;
    }
    setActiveTab(id);
  };

  const handleConfirmCancel = () => {
    if (!cancelTargetId) return;
    const res = cancelBooking(cancelTargetId, 'customer');
    setCancelTargetId(null);
    if (!res.success) {
      showToast({
        title: 'Cannot cancel booking',
        message: res.error,
        type: 'error',
      });
      return;
    }
    showToast({
      title: 'Booking cancelled',
      message: `${res.booking.id} status updated to Cancelled.`,
      type: 'info',
    });
  };

  const handleSubmitReview = (
    bookingId: string,
    rating: number,
    comment: string
  ) => {
    const res = createReview({
      bookingId,
      customerId,
      rating,
      comment,
      customerName:
        currentUser.role === 'customer' ? currentUser.name : 'Tariqul Islam',
    });
    if (!res.success) {
      showToast({
        title: 'Review not submitted',
        message: res.error,
        type: 'error',
      });
      return;
    }
    setReviewBooking(null);
    showToast({
      title: 'Review published',
      message: 'Your rating is now visible on the provider profile.',
      type: 'success',
    });
  };

  const renderBookingList = (items: Booking[]) => {
    void storageTick;
    if (items.length === 0) {
      return (
        <EmptyState
          title="No bookings in this view"
          description="Submit a new service request or clear the status filter to inspect your booking history."
          actionLabel="Find a Service"
          onAction={() => router.push('/services')}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {items.map((booking) => {
          const existingReview = getReviewByBookingId(booking.id);
          const canCancel = canTransitionBookingStatus(
            booking.status,
            'Cancelled',
            'customer'
          );
          const canReview = booking.status === 'Completed' && !existingReview;

          return (
            <BookingCard
              key={booking.id}
              booking={booking}
              viewerRole="customer"
              canCancel={canCancel}
              canReview={canReview}
              hasReview={Boolean(existingReview)}
              onCancel={(id) => setCancelTargetId(id)}
              onReview={(id) => {
                const found = bookings.find((b) => b.id === id) ?? null;
                setReviewBooking(found);
              }}
              onViewDetails={(id) => {
                const found = bookings.find((b) => b.id === id) ?? null;
                setDetailBooking(found);
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayout
      role="customer"
      items={navItems}
      activeItemId={activeTab}
      onSelectItem={handleSelectNav}
    >
      <PageHeader
        title="Customer Dashboard"
        subtitle="Track service requests, cancel eligible pending bookings, and review completed jobs."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />}
              onClick={() => {
                resetAllDemoData();
                setRole('customer');
                showToast({
                  title: 'Demo data reset',
                  message: 'Restored default Bangladesh seed bookings and reviews.',
                  type: 'info',
                });
              }}
            >
              Reset Demo
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" strokeWidth={1.5} />}
              onClick={() => router.push('/book')}
            >
              New Request
            </Button>
          </div>
        }
      />

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <DashboardStatCard label="Total bookings" value={stats.total} />
            <DashboardStatCard label="Pending" value={stats.pending} />
            <DashboardStatCard label="Active jobs" value={stats.active} />
            <DashboardStatCard label="Completed" value={stats.completed} />
          </div>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-medium text-zinc-900">
                Recent bookings
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className="text-xs font-medium text-brand-800 hover:text-brand-950"
              >
                View all ({bookings.length})
              </button>
            </div>
            {renderBookingList(bookings.slice(0, 4))}
          </section>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((status) => {
              const active = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`h-8 rounded-lg border px-3 text-xs font-medium transition-colors duration-150 ${
                    active
                      ? 'border-brand-900 bg-brand-900 text-white'
                      : 'border-zinc-900/10 bg-white text-zinc-700 hover:bg-surface-hover'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
          {renderBookingList(filteredBookings)}
        </div>
      )}

      {activeTab === 'profile' && (
        <section className="rounded-xl border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)]">
          <h2 className="text-base font-medium text-zinc-900">
            Demo customer profile
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-zinc-500">Full name</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">
                {currentUser.role === 'customer'
                  ? currentUser.name
                  : 'Tariqul Islam'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Phone</dt>
              <dd className="mt-0.5 font-mono text-zinc-900 tabular-nums">
                {currentUser.role === 'customer'
                  ? currentUser.phone
                  : '+8801711223344'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Email</dt>
              <dd className="mt-0.5 text-zinc-800">
                {currentUser.role === 'customer'
                  ? currentUser.email
                  : 'tariqul.islam@shebalink.demo'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Default address</dt>
              <dd className="mt-0.5 text-zinc-800">
                {currentUser.role === 'customer' && currentUser.address
                  ? currentUser.address
                  : 'House 24, Padma Residential Area, Rajshahi'}
              </dd>
            </div>
          </dl>
        </section>
      )}

      <ConfirmDialog
        isOpen={Boolean(cancelTargetId)}
        title="Cancel pending booking"
        description="Are you sure you want to cancel this service request? Cancelled bookings cannot be reopened."
        confirmLabel="Cancel Booking"
        variant="destructive"
        onConfirm={handleConfirmCancel}
        onClose={() => setCancelTargetId(null)}
      />

      <BookingDetailModal
        booking={detailBooking}
        onClose={() => setDetailBooking(null)}
      />

      <ReviewModal
        booking={reviewBooking}
        onClose={() => setReviewBooking(null)}
        onSubmitReview={handleSubmitReview}
      />
    </DashboardLayout>
  );
}
