'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { SharedLayout } from '@/components/layout/SharedLayout';
import { EmptyState } from '@/components/ui';
import {
  PageHeader,
  ProviderCard,
} from '@/components/shared';
import { SERVICE_GROUP_META } from '@/data/categories';
import { STORAGE_CUSTOM_EVENT_NAME } from '@/lib/patterns/ObserverPattern';
import {
  getCategoryBySlug,
  searchAndFilterProviders,
} from '@/services/discoveryService';
import type { ProviderProfile, ServiceCategory } from '@/types';

export default function CategoryDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const [category, setCategory] = useState<ServiceCategory | undefined>(
    undefined
  );
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadCategory = () => {
      const cat = getCategoryBySlug(slug);
      setCategory(cat);
      if (cat && cat.active) {
        setProviders(
          searchAndFilterProviders({
            categoryId: cat.id,
            sortBy: 'rating-desc',
          })
        );
      } else {
        setProviders([]);
      }
      setLoaded(true);
    };

    loadCategory();
    window.addEventListener(STORAGE_CUSTOM_EVENT_NAME, loadCategory);
    return () => {
      window.removeEventListener(STORAGE_CUSTOM_EVENT_NAME, loadCategory);
    };
  }, [slug]);

  return (
    <SharedLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!loaded ? null : !category ? (
          <EmptyState
            title="Category not found"
            description="The requested service category does not exist in our catalog."
            actionLabel="Back to Categories"
            onAction={() => {
              window.location.href = '/categories';
            }}
          />
        ) : (
          <>
            <PageHeader
              title={category.name}
              subtitle={category.description}
              breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'Categories', href: '/categories' },
                { label: category.name },
              ]}
              badge={
                <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                  {SERVICE_GROUP_META[category.group].label}
                </span>
              }
              actions={
                <Link
                  href={`/services?category=${category.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-800"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Filter by City &amp; Price</span>
                </Link>
              }
            />

            <div className="mt-6 flex items-center justify-between border-b border-slate-200 pb-3">
              <p className="text-sm text-slate-600">
                Showing{' '}
                <span className="font-semibold text-slate-900">
                  {providers.length}
                </span>{' '}
                {providers.length === 1 ? 'provider' : 'providers'} for{' '}
                <span className="font-semibold text-slate-900">
                  {category.name}
                </span>
              </p>
              <Link
                href="/categories"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
              >
                <span>All Categories</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            {providers.length === 0 ? (
              <div className="mt-8">
                <EmptyState
                  title="No providers listed yet"
                  description={
                    category.active
                      ? 'There are currently no matching providers in this category.'
                      : 'This category is currently inactive.'
                  }
                  actionLabel="Browse All Services"
                  onAction={() => {
                    window.location.href = '/services';
                  }}
                />
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {providers.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </SharedLayout>
  );
}
