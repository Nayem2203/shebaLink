'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Zap,
  Droplets,
  Wind,
  ThermometerSnowflake,
  WashingMachine,
  Hammer,
  Paintbrush,
  Pipette,
  Home,
  Bug,
  Shirt,
  Container,
  Package,
  ShoppingBag,
  Truck,
  Wrench,
  ArrowRight,
  type LucideIcon,
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

const iconRegistry: Record<string, LucideIcon> = {
  Zap,
  Droplets,
  Wind,
  ThermometerSnowflake,
  WashingMachine,
  Hammer,
  Paintbrush,
  Pipette,
  Sparkles: Home,
  Home,
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
  'home-cleaning': Home,
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

function hasPhotoAsset(image?: string): boolean {
  if (!image) return false;
  return /\.(svg|jpg|jpeg|png|webp)$/i.test(image);
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
  const showPhoto = !compact && hasPhotoAsset(category.image);

  const baseClasses = [
    'group relative flex overflow-hidden rounded-xl border text-left w-full transition-[border-color,background-color,box-shadow] duration-150 ease-ease',
    compact
      ? 'items-center gap-3 p-4'
      : 'flex-col justify-between h-full',
    isSelected
      ? 'bg-brand-50/70 border-brand-800 ring-1 ring-brand-800 shadow-[0_1px_2px_rgba(24,24,27,0.04)]'
      : 'bg-white border-zinc-900/10 hover:border-brand-700/35 shadow-[0_1px_2px_rgba(24,24,27,0.04)] hover:shadow-[0_6px_18px_rgba(30,27,75,0.06)]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = compact ? (
    <>
      <div
        className={[
          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-150',
          isSelected
            ? 'bg-brand-900 text-white'
            : 'bg-surface-subtle text-zinc-700 group-hover:text-brand-900',
        ].join(' ')}
      >
        <Icon className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-900 truncate">
          {category.name}
        </p>
        {providerCount !== undefined && (
          <p className="text-xs text-zinc-500 font-mono tabular-nums">
            {providerCount} {providerCount === 1 ? 'pro' : 'pros'}
          </p>
        )}
      </div>
    </>
  ) : (
    <>
      <div>
        {showPhoto ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-subtle border-b border-zinc-900/5">
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 ease-ease group-hover:scale-[1.03]"
            />
            <div className="absolute left-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900/10 bg-white/95 text-brand-900 shadow-sm">
              <Icon className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            </div>
            {providerCount !== undefined && (
              <span className="absolute right-3 bottom-3 rounded-md border border-zinc-900/10 bg-white/95 px-2 py-0.5 font-mono text-xs font-medium text-zinc-800 tabular-nums shadow-sm">
                {providerCount} {providerCount === 1 ? 'pro' : 'pros'}
              </span>
            )}
          </div>
        ) : (
          <div className="aspect-[16/9] w-full bg-surface-canvas border-b border-zinc-900/5 flex items-center justify-between px-5">
            <div
              className={[
                'w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-150',
                isSelected
                  ? 'bg-brand-900 text-white'
                  : 'bg-white border border-zinc-900/10 text-brand-900',
              ].join(' ')}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
            </div>
            {providerCount !== undefined && (
              <span className="rounded-md border border-zinc-900/10 bg-white px-2.5 py-1 font-mono text-xs text-zinc-600 tabular-nums">
                {providerCount} {providerCount === 1 ? 'pro' : 'pros'}
              </span>
            )}
          </div>
        )}

        <div className="p-5 pb-3">
          <h3 className="text-base font-medium text-zinc-900 group-hover:text-brand-900 transition-colors duration-150">
            {category.name}
          </h3>
          <p className="mt-1.5 text-xs text-zinc-600 line-clamp-2 leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      <div className="mx-5 mb-4 pt-3 border-t border-zinc-900/5 flex items-center justify-between text-xs font-medium text-brand-800">
        <span>Browse providers</span>
        <ArrowRight
          className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150"
          strokeWidth={1.5}
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
