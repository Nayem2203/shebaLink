'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SharedLayout } from '@/components/layout/SharedLayout';
import { EmptyState } from '@/components/ui';
import { CategoryCard, PageHeader } from '@/components/shared';
import { SERVICE_GROUP_META } from '@/data/categories';
import { STORAGE_CUSTOM_EVENT_NAME } from '@/lib/patterns/ObserverPattern';
import {
  getCategories,
  getProviderCountByCategory,
} from '@/services/discoveryService';
import type { ServiceCategory, ServiceGroup } from '@/types';

const GROUPS_ORDER: ServiceGroup[] = [
  'home-repair',
  'cleaning-household',
  'delivery-moving',
];

export default function CategoriesPage() {
  const [selectedGroup, setSelectedGroup] = useState<'all' | ServiceGroup>('all');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [providerCounts, setProviderCounts] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    const loadCategories = () => {
      const active = getCategories({ onlyActive: true });
      setCategories(active);
      const counts: Record<string, number> = {};
      active.forEach((cat) => {
        counts[cat.id] = getProviderCountByCategory(cat.id);
      });
      setProviderCounts(counts);
    };

    loadCategories();
    window.addEventListener(STORAGE_CUSTOM_EVENT_NAME, loadCategories);
    return () => {
      window.removeEventListener(STORAGE_CUSTOM_EVENT_NAME, loadCategories);
    };
  }, []);

  const visibleGroups = useMemo(() => {
    return selectedGroup === 'all' ? GROUPS_ORDER : [selectedGroup];
  }, [selectedGroup]);

  return (
    <SharedLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Service Categories"
          subtitle="Explore local services grouped by home repair, household cleaning, and delivery and moving."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Categories' },
          ]}
          actions={
            <Link
              href="/services"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-900 px-4 text-xs font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(24,24,27,0.08)] transition-colors duration-150 hover:bg-brand-800"
            >
              <span>Search All Providers</span>
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          }
        />

        {/* Group filter tabs */}
        <div
          role="tablist"
          aria-label="Filter categories by service group"
          className="mt-6 flex flex-wrap gap-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedGroup === 'all'}
            onClick={() => setSelectedGroup('all')}
            className={`h-9 rounded-lg border px-3.5 text-xs font-medium transition-colors duration-150 ${
              selectedGroup === 'all'
                ? 'border-brand-900 bg-brand-900 text-white'
                : 'border-zinc-900/10 bg-white text-zinc-700 hover:bg-surface-hover'
            }`}
          >
            All Categories{' '}
            <span className="ml-1 font-mono tabular-nums opacity-75">
              {categories.length}
            </span>
          </button>
          {GROUPS_ORDER.map((group) => {
            const count = categories.filter((c) => c.group === group).length;
            const active = selectedGroup === group;
            return (
              <button
                key={group}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedGroup(group)}
                className={`h-9 rounded-lg border px-3.5 text-xs font-medium transition-colors duration-150 ${
                  active
                    ? 'border-brand-900 bg-brand-900 text-white'
                    : 'border-zinc-900/10 bg-white text-zinc-700 hover:bg-surface-hover'
                }`}
              >
                {SERVICE_GROUP_META[group].label}{' '}
                <span className="ml-1 font-mono tabular-nums opacity-75">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grouped Category Grids */}
        {categories.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No active categories"
              description="No service categories are currently active in the demo catalog."
            />
          </div>
        ) : (
          <div className="mt-8 space-y-12">
            {visibleGroups.map((group) => {
              const groupCategories = categories.filter(
                (c) => c.group === group
              );
              if (groupCategories.length === 0) return null;
              const meta = SERVICE_GROUP_META[group];

              return (
                <section key={group} aria-labelledby={`group-${group}`}>
                  <div className="mb-5 border-b border-zinc-900/10 pb-3">
                    <h2
                      id={`group-${group}`}
                      className="text-lg font-semibold text-zinc-900"
                    >
                      {meta.label}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600">
                      {meta.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {groupCategories.map((category) => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        providerCount={providerCounts[category.id] ?? 0}
                        href={`/categories/${category.slug}`}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </SharedLayout>
  );
}
