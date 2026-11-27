import { INITIAL_CATEGORIES } from '@/data/categories';
import { INITIAL_PROVIDERS } from '@/data/providers';
import { INITIAL_PROVIDER_SERVICES } from '@/data/services';
import { storageEventBus } from '@/lib/patterns/ObserverPattern';
import type {
  ProviderProfile,
  ProviderService,
  ServiceCategory,
  VerificationStatus,
} from '@/types';

export const CATALOG_STORAGE_KEYS = {
  CATEGORIES: 'shebalink_categories_v1',
  PROVIDERS: 'shebalink_providers_v1',
  SERVICES: 'shebalink_services_v1',
} as const;

// In-memory fallback when running in SSR or Node/Vitest without window.localStorage
const memoryFallback = new Map<string, string>();

function canUseBrowserStorage(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined'
    );
  } catch {
    return false;
  }
}

function readRaw(key: string): string | null {
  if (canUseBrowserStorage()) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryFallback.get(key) ?? null;
    }
  }
  return memoryFallback.get(key) ?? null;
}

function writeRaw(key: string, value: string): void {
  memoryFallback.set(key, value);
  if (canUseBrowserStorage()) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore quota/private-mode errors
    }
  }
}

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

function readOrSeed<T>(key: string, seed: T[]): T[] {
  const existing = readRaw(key);
  if (existing) {
    try {
      const parsed = JSON.parse(existing) as T[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Re-seed if corrupted
    }
  }
  const clonedSeed = clone(seed);
  writeRaw(key, JSON.stringify(clonedSeed));
  return clonedSeed;
}

export function initializeCatalogStorage(): void {
  readOrSeed(CATALOG_STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  readOrSeed(CATALOG_STORAGE_KEYS.PROVIDERS, INITIAL_PROVIDERS);
  readOrSeed(CATALOG_STORAGE_KEYS.SERVICES, INITIAL_PROVIDER_SERVICES);
}

export function resetCatalogStorage(): void {
  writeRaw(
    CATALOG_STORAGE_KEYS.CATEGORIES,
    JSON.stringify(clone(INITIAL_CATEGORIES))
  );
  writeRaw(
    CATALOG_STORAGE_KEYS.PROVIDERS,
    JSON.stringify(clone(INITIAL_PROVIDERS))
  );
  writeRaw(
    CATALOG_STORAGE_KEYS.SERVICES,
    JSON.stringify(clone(INITIAL_PROVIDER_SERVICES))
  );
  storageEventBus.emitChange('all', 'reset');
}

export function clearCatalogMemoryCache(): void {
  memoryFallback.clear();
}

export function getStoredCategories(): ServiceCategory[] {
  return readOrSeed(CATALOG_STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
}

export function saveStoredCategories(categories: ServiceCategory[]): void {
  writeRaw(CATALOG_STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  storageEventBus.emitChange('categories', 'update');
}

export function upsertStoredCategory(
  category: ServiceCategory
): ServiceCategory[] {
  const current = getStoredCategories();
  const idx = current.findIndex((c) => c.id === category.id);
  const next =
    idx >= 0
      ? current.map((c) => (c.id === category.id ? category : c))
      : [...current, category];
  saveStoredCategories(next);
  return next;
}

export function getStoredProviders(): ProviderProfile[] {
  return readOrSeed(CATALOG_STORAGE_KEYS.PROVIDERS, INITIAL_PROVIDERS);
}

export function saveStoredProviders(providers: ProviderProfile[]): void {
  writeRaw(CATALOG_STORAGE_KEYS.PROVIDERS, JSON.stringify(providers));
  storageEventBus.emitChange('providers', 'update');
}

export function updateStoredProviderVerification(
  providerId: string,
  verifiedStatus: VerificationStatus
): ProviderProfile | undefined {
  const providers = getStoredProviders();
  let updated: ProviderProfile | undefined;
  const next = providers.map((p) => {
    if (p.id !== providerId) return p;
    updated = {
      ...p,
      verifiedStatus,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  if (updated) {
    saveStoredProviders(next);
  }
  return updated;
}

export function updateStoredProviderAvailability(
  providerId: string,
  isAvailable: boolean,
  availabilityLabel?: ProviderProfile['availabilityLabel']
): ProviderProfile | undefined {
  const providers = getStoredProviders();
  let updated: ProviderProfile | undefined;
  const next = providers.map((p) => {
    if (p.id !== providerId) return p;
    updated = {
      ...p,
      isAvailable,
      availabilityLabel:
        availabilityLabel ?? (isAvailable ? 'Available Today' : 'Busy'),
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  if (updated) {
    saveStoredProviders(next);
  }
  return updated;
}

export function updateStoredProviderRating(
  providerId: string,
  rating: number,
  reviewCount: number
): ProviderProfile | undefined {
  const providers = getStoredProviders();
  let updated: ProviderProfile | undefined;
  const next = providers.map((p) => {
    if (p.id !== providerId) return p;
    updated = {
      ...p,
      rating: Number(rating.toFixed(1)),
      reviewCount,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  if (updated) {
    saveStoredProviders(next);
  }
  return updated;
}

export function getStoredProviderServices(): ProviderService[] {
  return readOrSeed(CATALOG_STORAGE_KEYS.SERVICES, INITIAL_PROVIDER_SERVICES);
}

export function saveStoredProviderServices(services: ProviderService[]): void {
  writeRaw(CATALOG_STORAGE_KEYS.SERVICES, JSON.stringify(services));
  storageEventBus.emitChange('services', 'update');
}

export function upsertStoredProviderService(
  service: ProviderService
): ProviderService[] {
  const current = getStoredProviderServices();
  const idx = current.findIndex((s) => s.id === service.id);
  const next =
    idx >= 0
      ? current.map((s) => (s.id === service.id ? service : s))
      : [...current, service];
  saveStoredProviderServices(next);
  return next;
}
