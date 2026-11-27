import { ProviderSortContext } from '@/lib/patterns/StrategyPattern';
import {
  getStoredCategories,
  getStoredProviders,
  getStoredProviderServices,
  saveStoredCategories,
  saveStoredProviderServices,
  updateStoredProviderAvailability,
  updateStoredProviderVerification,
  upsertStoredCategory,
  upsertStoredProviderService,
} from '@/lib/storage/catalogStorage';
import type {
  ProviderFilterCriteria,
  ProviderProfile,
  ProviderService,
  ServiceCategory,
  ServiceGroup,
  VerificationStatus,
} from '@/types';

/**
 * Pure, deterministic search, filter, and sort function (unit-testable without DOM).
 */
export function filterAndSortProviders(
  providers: ProviderProfile[],
  services: ProviderService[],
  categories: ServiceCategory[],
  criteria: ProviderFilterCriteria = {}
): ProviderProfile[] {
  const activeCategoriesById = new Map(
    categories.filter((c) => c.active).map((c) => [c.id, c])
  );
  const categoriesBySlug = new Map(categories.map((c) => [c.slug, c]));

  let targetCategoryId = criteria.categoryId?.trim() || '';
  if (!targetCategoryId && criteria.categorySlug) {
    const matchedCat = categoriesBySlug.get(criteria.categorySlug.trim());
    if (matchedCat) {
      targetCategoryId = matchedCat.id;
    } else {
      return [];
    }
  }

  const normalizedQuery = criteria.query?.trim().toLowerCase() || '';
  const normalizedCity = criteria.city?.trim().toLowerCase() || '';

  const filtered = providers.filter((provider) => {
    const providerServices = services.filter(
      (s) => s.providerId === provider.id && s.active
    );

    // 1. Category filter (matches primaryCategoryId OR any active offered service category)
    if (targetCategoryId) {
      if (!activeCategoriesById.has(targetCategoryId)) {
        return false;
      }
      const matchesPrimary = provider.primaryCategoryId === targetCategoryId;
      const matchesService = providerServices.some(
        (s) => s.categoryId === targetCategoryId
      );
      if (!matchesPrimary && !matchesService) {
        return false;
      }
    }

    // 2. City / Service Area filter
    if (normalizedCity && normalizedCity !== 'all') {
      const coversCity =
        provider.primaryCity.toLowerCase() === normalizedCity ||
        provider.serviceAreas.some(
          (area) => area.toLowerCase() === normalizedCity
        );
      if (!coversCity) {
        return false;
      }
    }

    // 3. Starting price bounds (BDT ৳)
    if (
      typeof criteria.minPrice === 'number' &&
      !Number.isNaN(criteria.minPrice) &&
      provider.startingPrice < criteria.minPrice
    ) {
      return false;
    }
    if (
      typeof criteria.maxPrice === 'number' &&
      !Number.isNaN(criteria.maxPrice) &&
      provider.startingPrice > criteria.maxPrice
    ) {
      return false;
    }

    // 4. Minimum rating filter
    if (
      typeof criteria.minRating === 'number' &&
      !Number.isNaN(criteria.minRating) &&
      provider.rating < criteria.minRating
    ) {
      return false;
    }

    // 5. Verified-only filter
    if (criteria.verifiedOnly && provider.verifiedStatus !== 'verified') {
      return false;
    }

    // 6. Available-only filter
    if (criteria.availableOnly && !provider.isAvailable) {
      return false;
    }

    // 7. Keyword query across name, title, category, neighborhood, bio, skills, services
    if (normalizedQuery) {
      const primaryCategory = activeCategoriesById.get(
        provider.primaryCategoryId
      );
      const searchableParts = [
        provider.name,
        provider.title,
        provider.primaryCategoryName ?? '',
        primaryCategory?.name ?? '',
        primaryCategory?.description ?? '',
        provider.neighborhood,
        provider.primaryCity,
        provider.bio,
        ...provider.skills,
        ...providerServices.map((s) => `${s.title} ${s.description}`),
      ]
        .join(' ')
        .toLowerCase();

      if (!searchableParts.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });

  // Apply Strategy Pattern for sorting
  const sortContext = new ProviderSortContext(criteria.sortBy ?? 'relevance');
  return sortContext.executeSort(filtered, criteria);
}

// Repository-backed Discovery Service API

export function getCategories(options?: {
  onlyActive?: boolean;
  group?: ServiceGroup;
}): ServiceCategory[] {
  let list = getStoredCategories();
  if (options?.onlyActive) {
    list = list.filter((c) => c.active);
  }
  if (options?.group) {
    list = list.filter((c) => c.group === options.group);
  }
  return list;
}

export function getCategoryBySlug(slug: string): ServiceCategory | undefined {
  return getStoredCategories().find((c) => c.slug === slug);
}

export function getCategoryById(id: string): ServiceCategory | undefined {
  return getStoredCategories().find((c) => c.id === id);
}

export function getProviderCountByCategory(categoryId: string): number {
  const providers = getStoredProviders();
  const services = getStoredProviderServices();
  return providers.filter(
    (p) =>
      p.primaryCategoryId === categoryId ||
      services.some(
        (s) => s.providerId === p.id && s.categoryId === categoryId && s.active
      )
  ).length;
}

export function getProviders(): ProviderProfile[] {
  return getStoredProviders();
}

export function getProviderById(id: string): ProviderProfile | undefined {
  return getStoredProviders().find((p) => p.id === id);
}

export function getProviderServices(
  providerId: string,
  onlyActive = true
): ProviderService[] {
  return getStoredProviderServices().filter(
    (s) => s.providerId === providerId && (!onlyActive || s.active)
  );
}

export function getFeaturedProviders(limit = 6): ProviderProfile[] {
  const providers = getStoredProviders().filter((p) => p.verifiedStatus === 'verified');
  const sortContext = new ProviderSortContext('rating-desc');
  return sortContext.executeSort(providers).slice(0, limit);
}

export function searchAndFilterProviders(
  criteria: ProviderFilterCriteria = {}
): ProviderProfile[] {
  return filterAndSortProviders(
    getStoredProviders(),
    getStoredProviderServices(),
    getStoredCategories(),
    criteria
  );
}

export function saveCategory(category: ServiceCategory): ServiceCategory[] {
  return upsertStoredCategory(category);
}

export function toggleCategoryActive(
  categoryId: string
): ServiceCategory | undefined {
  const categories = getStoredCategories();
  let updated: ServiceCategory | undefined;
  const next = categories.map((c) => {
    if (c.id !== categoryId) return c;
    updated = { ...c, active: !c.active };
    return updated;
  });
  if (updated) {
    saveStoredCategories(next);
  }
  return updated;
}

export function updateProviderVerification(
  providerId: string,
  verifiedStatus: VerificationStatus
): ProviderProfile | undefined {
  return updateStoredProviderVerification(providerId, verifiedStatus);
}

export function updateProviderAvailability(
  providerId: string,
  isAvailable: boolean,
  availabilityLabel?: ProviderProfile['availabilityLabel']
): ProviderProfile | undefined {
  return updateStoredProviderAvailability(
    providerId,
    isAvailable,
    availabilityLabel
  );
}

export function upsertProviderService(
  service: ProviderService
): ProviderService[] {
  return upsertStoredProviderService(service);
}

export function toggleProviderServiceActive(
  serviceId: string
): ProviderService | undefined {
  const services = getStoredProviderServices();
  let updated: ProviderService | undefined;
  const next = services.map((s) => {
    if (s.id !== serviceId) return s;
    updated = { ...s, active: !s.active };
    return updated;
  });
  if (updated) {
    saveStoredProviderServices(next);
  }
  return updated;
}
