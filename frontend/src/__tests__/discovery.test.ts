import { beforeEach, describe, expect, it } from 'vitest';
import { INITIAL_CATEGORIES } from '@/data/categories';
import { INITIAL_PROVIDERS } from '@/data/providers';
import { INITIAL_REVIEWS } from '@/data/reviews';
import { INITIAL_PROVIDER_SERVICES } from '@/data/services';
import {
  clearCatalogMemoryCache,
  initializeCatalogStorage,
  resetCatalogStorage,
} from '@/lib/storage/catalogStorage';
import {
  filterAndSortProviders,
  getCategories,
  getProviderCountByCategory,
  getProviders,
  searchAndFilterProviders,
  toggleCategoryActive,
  updateProviderAvailability,
  updateProviderVerification,
} from '@/services/discoveryService';

describe('ShebaLink Seed Catalog & Discovery Service', () => {
  beforeEach(() => {
    clearCatalogMemoryCache();
    resetCatalogStorage();
    initializeCatalogStorage();
  });

  it('meets Bangladesh demo dataset minimums (categories, providers, services, reviews)', () => {
    expect(INITIAL_CATEGORIES.length).toBeGreaterThanOrEqual(12);
    expect(INITIAL_PROVIDERS.length).toBeGreaterThanOrEqual(15);
    expect(INITIAL_PROVIDER_SERVICES.length).toBeGreaterThanOrEqual(15);
    expect(INITIAL_REVIEWS.length).toBeGreaterThanOrEqual(15);

    const groups = new Set(INITIAL_CATEGORIES.map((c) => c.group));
    expect(groups.has('home-repair')).toBe(true);
    expect(groups.has('cleaning-household')).toBe(true);
    expect(groups.has('delivery-moving')).toBe(true);

    const rahim = INITIAL_PROVIDERS.find((p) => p.name === 'Rahim Uddin');
    expect(rahim).toBeDefined();
    expect(rahim?.primaryCity).toBe('Rajshahi');
    expect(rahim?.startingPrice).toBe(500);
    expect(rahim?.rating).toBe(4.8);

    INITIAL_PROVIDERS.forEach((p) => {
      expect(p.phone).toMatch(/^\+8801\d{9}$/);
      expect(p.startingPrice).toBeGreaterThan(0);
    });
  });

  it('searches providers by keyword across name, title, skills, and neighborhood', () => {
    const byName = filterAndSortProviders(
      INITIAL_PROVIDERS,
      INITIAL_PROVIDER_SERVICES,
      INITIAL_CATEGORIES,
      { query: 'Rahim' }
    );
    expect(byName.some((p) => p.id === 'prov-001')).toBe(true);

    const bySkill = filterAndSortProviders(
      INITIAL_PROVIDERS,
      INITIAL_PROVIDER_SERVICES,
      INITIAL_CATEGORIES,
      { query: 'IPS' }
    );
    expect(bySkill.some((p) => p.id === 'prov-001')).toBe(true);

    const byNeighborhood = filterAndSortProviders(
      INITIAL_PROVIDERS,
      INITIAL_PROVIDER_SERVICES,
      INITIAL_CATEGORIES,
      { query: 'Shaheb Bazar' }
    );
    expect(byNeighborhood.some((p) => p.id === 'prov-002')).toBe(true);
  });

  it('filters providers by categorySlug, city, price range, rating, verifiedOnly, and availableOnly', () => {
    const rajshahiPlumbers = filterAndSortProviders(
      INITIAL_PROVIDERS,
      INITIAL_PROVIDER_SERVICES,
      INITIAL_CATEGORIES,
      {
        categorySlug: 'plumber',
        city: 'Rajshahi',
        maxPrice: 500,
        minRating: 4.8,
        verifiedOnly: true,
        availableOnly: true,
      }
    );

    expect(rajshahiPlumbers.length).toBeGreaterThanOrEqual(1);
    expect(rajshahiPlumbers.every((p) => p.serviceAreas.includes('Rajshahi'))).toBe(true);
    expect(rajshahiPlumbers.every((p) => p.startingPrice <= 500)).toBe(true);
    expect(rajshahiPlumbers.every((p) => p.rating >= 4.8)).toBe(true);
    expect(rajshahiPlumbers.every((p) => p.verifiedStatus === 'verified')).toBe(true);
    expect(rajshahiPlumbers.every((p) => p.isAvailable)).toBe(true);
  });

  it('returns empty array for unknown categorySlug or impossible price constraints', () => {
    const unknownCat = filterAndSortProviders(
      INITIAL_PROVIDERS,
      INITIAL_PROVIDER_SERVICES,
      INITIAL_CATEGORIES,
      { categorySlug: 'nonexistent-category' }
    );
    expect(unknownCat).toEqual([]);

    const impossiblePrice = filterAndSortProviders(
      INITIAL_PROVIDERS,
      INITIAL_PROVIDER_SERVICES,
      INITIAL_CATEGORIES,
      { minPrice: 999999 }
    );
    expect(impossiblePrice).toEqual([]);
  });

  it('sorts providers accurately across all sort options', () => {
    const ratingDesc = searchAndFilterProviders({ sortBy: 'rating-desc' });
    for (let i = 1; i < ratingDesc.length; i++) {
      expect(ratingDesc[i - 1].rating).toBeGreaterThanOrEqual(ratingDesc[i].rating);
    }

    const priceAsc = searchAndFilterProviders({ sortBy: 'price-asc' });
    for (let i = 1; i < priceAsc.length; i++) {
      expect(priceAsc[i - 1].startingPrice).toBeLessThanOrEqual(
        priceAsc[i].startingPrice
      );
    }

    const priceDesc = searchAndFilterProviders({ sortBy: 'price-desc' });
    for (let i = 1; i < priceDesc.length; i++) {
      expect(priceDesc[i - 1].startingPrice).toBeGreaterThanOrEqual(
        priceDesc[i].startingPrice
      );
    }

    const expDesc = searchAndFilterProviders({ sortBy: 'experience-desc' });
    for (let i = 1; i < expDesc.length; i++) {
      expect(expDesc[i - 1].experienceYears).toBeGreaterThanOrEqual(
        expDesc[i].experienceYears
      );
    }
  });

  it('persists category active toggle, provider verification, and availability mutations', () => {
    const toggled = toggleCategoryActive('cat-electrician');
    expect(toggled?.active).toBe(false);
    expect(getCategories({ onlyActive: true }).some((c) => c.id === 'cat-electrician')).toBe(false);

    const verified = updateProviderVerification('prov-007', 'verified');
    expect(verified?.verifiedStatus).toBe('verified');

    const unavailable = updateProviderAvailability('prov-001', false, 'Busy');
    expect(unavailable?.isAvailable).toBe(false);
    expect(unavailable?.availabilityLabel).toBe('Busy');

    expect(getProviderCountByCategory('cat-plumber')).toBeGreaterThanOrEqual(1);

    resetCatalogStorage();
    expect(getCategories({ onlyActive: true }).length).toBe(INITIAL_CATEGORIES.length);
    expect(getProviders().find((p) => p.id === 'prov-001')?.isAvailable).toBe(true);
  });
});
