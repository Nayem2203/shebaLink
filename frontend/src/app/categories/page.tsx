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
          subtitle="Explore verified local services grouped by home repair, household cleaning, and delivery & moving."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Categories' },
          ]}
          actions={
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-800"
            >
              <span>Search All Providers</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
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
            className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
              selectedGroup === 'all'
                ? 'border-indigo-900 bg-indigo-900 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Categories ({categories.length})
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
                className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-indigo-900 bg-indigo-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {SERVICE_GROUP_META[group].label} ({count})
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
          <div className="mt-8 space-y-10">
            {visibleGroups.map((group) => {
              const groupCategories = categories.filter(
                (c) => c.group === group
              );
              if (groupCategories.length === 0) return null;
              const meta = SERVICE_GROUP_META[group];

              return (
                <section key={group} aria-labelledby={`group-${group}`}>
                  <div className="mb-4 border-b border-slate-200 pb-3">
                    <h2
                      id={`group-${group}`}
                      className="text-lg font-bold text-slate-900"
                    >
                      {meta.label}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
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
