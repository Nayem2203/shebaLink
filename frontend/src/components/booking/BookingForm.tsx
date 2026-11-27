'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckCircle2,
  ImagePlus,
  Trash2,
  Calendar,
  MapPin,
  Phone,
  ArrowRight,
  ClipboardCheck,
} from 'lucide-react';
import {
  Button,
  DateInput,
  Input,
  Select,
  StatusBadge,
  Textarea,
  useToast,
} from '@/components/ui';
import { PageHeader, PriceDisplay } from '@/components/shared';
import { useRole } from '@/context/RoleContext';
import { createBooking } from '@/services/bookingService';
import {
  bookingFormSchema,
  getTodayIsoDate,
  type BookingFormValues,
} from '@/services/bookingValidator';
import {
  getCategoryById,
  getProviders,
  getProviderServices,
} from '@/services/discoveryService';
import type { Booking, ProviderProfile, ProviderService } from '@/types';

const TIME_SLOTS = [
  { value: '09:00 AM', label: '09:00 AM — Morning' },
  { value: '10:30 AM', label: '10:30 AM — Late Morning' },
  { value: '12:00 PM', label: '12:00 PM — Midday' },
  { value: '02:00 PM', label: '02:00 PM — Afternoon' },
  { value: '04:00 PM', label: '04:00 PM — Late Afternoon' },
  { value: '06:00 PM', label: '06:00 PM — Evening' },
];

export function BookingForm() {
  const searchParams = useSearchParams();
  const initialProviderId = searchParams.get('provider') ?? '';
  const initialServiceId = searchParams.get('service') ?? '';

  const { currentUser } = useRole();
  const { showToast } = useToast();

  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(
    null
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      providerId: initialProviderId || 'prov-001',
      serviceId: initialServiceId || '',
      problemDescription: '',
      address:
        currentUser.role === 'customer' && currentUser.address
          ? currentUser.address
          : 'House 24, Padma Residential Area, Rajshahi',
      customerPhone:
        currentUser.role === 'customer'
          ? currentUser.phone
          : '+8801711223344',
      preferredDate: getTodayIsoDate(),
      preferredTime: '10:30 AM',
      instructions: '',
    },
  });

  useEffect(() => {
    const loadedProviders = getProviders();
    setProviders(loadedProviders);
    if (
      initialProviderId &&
      loadedProviders.some((p) => p.id === initialProviderId)
    ) {
      setValue('providerId', initialProviderId);
    } else if (loadedProviders.length > 0 && !initialProviderId) {
      setValue('providerId', loadedProviders[0].id);
    }
  }, [initialProviderId, setValue]);

  const selectedProviderId = watch('providerId');
  const selectedServiceId = watch('serviceId');

  const selectedProvider = useMemo(
    () => providers.find((p) => p.id === selectedProviderId),
    [providers, selectedProviderId]
  );

  const providerServices: ProviderService[] = useMemo(() => {
    if (!selectedProviderId) return [];
    return getProviderServices(selectedProviderId, true);
  }, [selectedProviderId]);

  useEffect(() => {
    if (providerServices.length === 0) {
      setValue('serviceId', '');
      return;
    }
    const matching = providerServices.find((s) => s.id === selectedServiceId);
    if (!matching) {
      const urlMatch = providerServices.find((s) => s.id === initialServiceId);
      setValue('serviceId', urlMatch ? urlMatch.id : providerServices[0].id);
    }
  }, [providerServices, selectedServiceId, initialServiceId, setValue]);

  const selectedService = useMemo(
    () => providerServices.find((s) => s.id === selectedServiceId),
    [providerServices, selectedServiceId]
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please choose a valid image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Image size must be under 2 MB for LocalStorage preview.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (values: BookingFormValues) => {
    const category = selectedService
      ? getCategoryById(selectedService.categoryId)
      : undefined;

    // Customer Demo ID: always bind customer requests to active customer or cust-001 in demo
    const customerId =
      currentUser.role === 'customer' ? currentUser.id : 'cust-001';
    const customerName =
      currentUser.role === 'customer' ? currentUser.name : 'Tariqul Islam';

    const result = createBooking({
      customerId,
      customerName,
      customerPhone: values.customerPhone,
      providerId: values.providerId,
      providerName: selectedProvider?.name,
      serviceId: values.serviceId,
      serviceTitle: selectedService?.title,
      categoryName: category?.name ?? selectedProvider?.primaryCategoryName,
      problemDescription: values.problemDescription,
      imagePreview,
      address: values.address,
      preferredDate: values.preferredDate,
      preferredTime: values.preferredTime,
      instructions: values.instructions,
      quotedPrice:
        selectedService?.startingPrice ?? selectedProvider?.startingPrice,
    });

    if (!result.success) {
      showToast({
        title: 'Could not submit request',
        message: result.error,
        type: 'error',
      });
      return;
    }

    setSubmittedBooking(result.booking);
    showToast({
      title: 'Service Request Submitted',
      message: `Booking ${result.booking.id} saved locally in Pending state.`,
      type: 'success',
    });
  };

  if (submittedBooking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              Service Request Confirmed!
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Your booking request has been saved to LocalStorage and is now
              visible to the provider.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
              <span className="text-xs font-medium text-slate-500">
                Booking ID:
              </span>
              <span className="font-mono text-sm font-bold text-indigo-900">
                {submittedBooking.id}
              </span>
              <StatusBadge status={submittedBooking.status} size="sm" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Provider</p>
              <p className="font-semibold text-slate-900">
                {submittedBooking.providerName}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Requested Service</p>
              <p className="font-semibold text-slate-900">
                {submittedBooking.serviceTitle}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Preferred Schedule</p>
              <p className="font-semibold text-slate-900">
                {submittedBooking.preferredDate} at{' '}
                {submittedBooking.preferredTime}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Starting Estimate</p>
              {submittedBooking.quotedPrice ? (
                <PriceDisplay amount={submittedBooking.quotedPrice} size="sm" />
              ) : (
                <p className="font-semibold text-slate-900">To be quoted</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-500">Service Address</p>
              <p className="font-medium text-slate-800">
                {submittedBooking.address}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard/customer"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-800"
            >
              <span>Track in Customer Dashboard</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSubmittedBooking(null);
                setImagePreview(null);
                reset();
              }}
            >
              Create Another Request
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Request a Service"
        subtitle="Complete the grouped steps below to send a service request to a local professional."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Services', href: '/services' },
          { label: 'Request Service' },
        ]}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12"
      >
        {/* Left: Grouped Form Steps */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Service & Provider */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">
              1. Service &amp; Problem Details
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Choose the provider, exact service package, and describe the issue.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Service Provider"
                required
                error={errors.providerId?.message}
                options={providers.map((p) => ({
                  value: p.id,
                  label: `${p.name} — ${p.title} (${p.primaryCity})`,
                }))}
                {...register('providerId')}
              />

              <Select
                label="Service Package"
                required
                error={errors.serviceId?.message}
                options={providerServices.map((s) => ({
                  value: s.id,
                  label: `${s.title} (৳${s.startingPrice})`,
                }))}
                {...register('serviceId')}
              />
            </div>

            <div className="mt-4">
              <Textarea
                label="Problem Description"
                required
                rows={4}
                placeholder="Describe what needs fixing or servicing (e.g., Main kitchen socket sparking when turning on electric kettle)..."
                error={errors.problemDescription?.message}
                helperText="Minimum 10 characters so the technician can prepare the right tools."
                {...register('problemDescription')}
              />
            </div>
          </section>

          {/* Step 2: Optional Image Upload with Local Preview */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">
              2. Optional Photo Preview
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Attach a photo of the issue (stored locally in browser preview, max
              2 MB).
            </p>

            <div className="mt-4">
              <label
                htmlFor="booking-image-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-6 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/40"
              >
                <ImagePlus
                  className="h-7 w-7 text-indigo-700"
                  aria-hidden="true"
                />
                <span className="mt-2 text-sm font-medium text-slate-700">
                  Click to upload an issue photo (optional)
                </span>
                <span className="mt-0.5 text-xs text-slate-500">
                  PNG, JPG, or WebP up to 2 MB
                </span>
                <input
                  id="booking-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>

              {imageError && (
                <p
                  role="alert"
                  className="mt-2 text-xs font-medium text-rose-600"
                >
                  {imageError}
                </p>
              )}

              {imagePreview && (
                <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Uploaded problem preview"
                      className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Local Image Attached
                      </p>
                      <p className="text-xs text-slate-500">
                        Visible on your booking card and provider request view.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setImagePreview(null)}
                    leftIcon={<Trash2 className="h-3.5 w-3.5 text-rose-600" />}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* Step 3: Address & Contact Information */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">
              3. Address &amp; Contact Information
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Service Address"
                  required
                  leftIcon={<MapPin className="h-4 w-4" />}
                  placeholder="House/Flat, Road, Area (e.g., House 24, Padma Residential, Rajshahi)"
                  error={errors.address?.message}
                  {...register('address')}
                />
              </div>

              <Input
                label="Contact Phone (Bangladesh)"
                required
                leftIcon={<Phone className="h-4 w-4" />}
                placeholder="+8801711223344"
                error={errors.customerPhone?.message}
                helperText="Format: +8801XXXXXXXXX or 01XXXXXXXXX"
                {...register('customerPhone')}
              />
            </div>
          </section>

          {/* Step 4: Preferred Date, Time & Additional Instructions */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">
              4. Preferred Date, Time &amp; Instructions
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DateInput
                label="Preferred Date"
                required
                minDate={getTodayIsoDate()}
                error={errors.preferredDate?.message}
                {...register('preferredDate')}
              />

              <Select
                label="Preferred Time Slot"
                required
                error={errors.preferredTime?.message}
                options={TIME_SLOTS}
                {...register('preferredTime')}
              />

              <div className="sm:col-span-2">
                <Textarea
                  label="Additional Instructions (Optional)"
                  rows={2}
                  placeholder="Gate directions, parking notes, or ladder requirements..."
                  error={errors.instructions?.message}
                  {...register('instructions')}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right: Review & Submit Card */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ClipboardCheck
                className="h-5 w-5 text-indigo-700"
                aria-hidden="true"
              />
              <h2 className="text-base font-bold text-slate-900">
                5. Review &amp; Submit
              </h2>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Selected Provider</dt>
                <dd className="font-semibold text-slate-900">
                  {selectedProvider?.name || '—'}
                </dd>
                {selectedProvider && (
                  <dd className="text-xs text-slate-500">
                    {selectedProvider.neighborhood},{' '}
                    {selectedProvider.primaryCity}
                  </dd>
                )}
              </div>

              <div>
                <dt className="text-xs text-slate-500">Selected Service</dt>
                <dd className="font-semibold text-slate-900">
                  {selectedService?.title || '—'}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">Starting Rate</dt>
                <dd className="mt-0.5">
                  <PriceDisplay
                    amount={
                      selectedService?.startingPrice ??
                      selectedProvider?.startingPrice ??
                      0
                    }
                    unit={
                      selectedService?.priceUnit ??
                      selectedProvider?.priceUnit ??
                      'per visit'
                    }
                    size="md"
                  />
                </dd>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <Calendar className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                <span>
                  {watch('preferredDate')} &bull; {watch('preferredTime')}
                </span>
              </div>
            </dl>

            <div className="mt-5">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
              >
                Submit Service Request
              </Button>
            </div>

            <p className="mt-3 text-center text-xs text-slate-500">
              Prototype mode: stored locally in browser LocalStorage. No payment
              charged.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
