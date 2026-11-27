'use client';

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  Droplets,
  Wind,
  ThermometerSnowflake,
  WashingMachine,
  Hammer,
  Paintbrush,
  Pipette,
  Sparkles,
  Bug,
  Shirt,
  Container,
  Package,
  ShoppingBag,
  Truck,
  Wrench,
  ArrowRight,
} from 'lucide-react';
import type { ServiceCategory } from '@/types';

export interface CategoryCardProps {
  category: ServiceCategory;
  providerCount?: number;
  onClick?: (category: ServiceCategory) => void;
  href?: string;
  isSelected?: boolean;
  compact?: boolean;
  className?: string;
}

const iconRegistry: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Droplets,
  Wind,
  ThermometerSnowflake,
  WashingMachine,
  Hammer,
  Paintbrush,
  Pipette,
  Sparkles,
  Bug,
  Shirt,
  Container,
  Package,
  ShoppingBag,
  Truck,
  Wrench,
  electrician: Zap,
  plumber: Droplets,
  'ac-repair': Wind,
  'refrigerator-repair': ThermometerSnowflake,
  'washing-machine-repair': WashingMachine,
  carpenter: Hammer,
  painter: Paintbrush,
  'bathroom-fittings': Pipette,
  'home-cleaning': Sparkles,
  'pest-control': Bug,
  'laundry-ironing': Shirt,
  'water-tank-cleaning': Container,
  'parcel-delivery': Package,
  'grocery-delivery': ShoppingBag,
  'home-shifting': Truck,
  'roadside-assistance': Wrench,
};

function resolveCategoryIcon(category: ServiceCategory) {
  return (
    iconRegistry[category.icon] ||
    iconRegistry[category.slug] ||
    Wrench
  );
}

export function CategoryCard({
  category,
  providerCount,
  onClick,
  href,
  isSelected = false,
  compact = false,
  className = '',
}: CategoryCardProps) {
  const Icon = resolveCategoryIcon(category);

  const baseClasses = [
    'group relative flex transition-all duration-150 rounded-xl border text-left w-full',
    compact
      ? 'items-center gap-3 p-3.5'
      : 'flex-col justify-between p-5 h-full',
    isSelected
      ? 'bg-indigo-50/70 border-indigo-600 ring-1 ring-indigo-600 shadow-sm'
      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = compact ? (
    <>
      <div
        className={[
          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors',
          isSelected
            ? 'bg-indigo-600 text-white'
            : 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100',
        ].join(' ')}
      >
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 truncate">
          {category.name}
        </p>
        {providerCount !== undefined && (
          <p className="text-xs text-slate-500">
            {providerCount} {providerCount === 1 ? 'provider' : 'providers'}
          </p>
        )}
      </div>
    </>
  ) : (
    <>
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className={[
              'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors',
              isSelected
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100',
            ].join(' ')}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
          {providerCount !== undefined && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {providerCount} {providerCount === 1 ? 'pro' : 'pros'}
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-900 transition-colors">
          {category.name}
        </h3>
        <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {category.description}
        </p>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-indigo-700">
        <span>Browse providers</span>
        <ArrowRight
          className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
          aria-hidden="true"
        />
      </div>
    </>
  );

  if (href && !onClick) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick?.(category)}
      aria-pressed={isSelected}
      className={baseClasses}
    >
      {content}
    </button>
  );
}

export default CategoryCard;
