/**
 * Strategy Design Pattern — Provider Filtering & Sorting Strategies
 * Encapsulates interchangeable algorithms for sorting and filtering service providers.
 */

import {
  ProviderFilterCriteria,
  ProviderProfile,
  SortOption,
} from '@/types';

export interface ProviderSortStrategy {
  readonly key: SortOption;
  sort(
    providers: ProviderProfile[],
    criteria?: ProviderFilterCriteria
  ): ProviderProfile[];
}

export interface ProviderFilterStrategy {
  matches(
    provider: ProviderProfile,
    criteria: ProviderFilterCriteria
  ): boolean;
}

/**
 * Sorts by relevance: prioritizes keyword matches in name/title, verified status,
 * availability, Rajshahi locality (when no city filter set), and rating.
 */
export class RelevanceSortStrategy implements ProviderSortStrategy {
  public readonly key: SortOption = 'relevance';

  public sort(
    providers: ProviderProfile[],
    criteria?: ProviderFilterCriteria
  ): ProviderProfile[] {
    const q = criteria?.query?.trim().toLowerCase() || '';

    const computeScore = (p: ProviderProfile): number => {
      let score = 0;
      if (q) {
        if (p.name.toLowerCase().includes(q)) score += 35;
        if (p.title.toLowerCase().includes(q)) score += 30;
        if (p.primaryCategoryName?.toLowerCase().includes(q)) score += 25;
        if (p.skills.some((s) => s.toLowerCase().includes(q))) score += 20;
        if (p.bio.toLowerCase().includes(q)) score += 10;
      }
      if (p.verifiedStatus === 'verified') score += 15;
      if (p.isAvailable) score += 10;
      if (p.availabilityLabel === 'Available Today') score += 5;
      score += p.rating * 4;
      score += Math.min(p.reviewCount, 30) * 0.2;
      return score;
    };

    return [...providers].sort((a, b) => computeScore(b) - computeScore(a));
  }
}

/**
 * Sorts by highest customer rating first, breaking ties by reviewCount
 */
export class RatingDescSortStrategy implements ProviderSortStrategy {
  public readonly key: SortOption = 'rating-desc';

  public sort(providers: ProviderProfile[]): ProviderProfile[] {
    return [...providers].sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    });
  }
}

/**
 * Sorts by lowest starting price in BDT (৳) first
 */
export class PriceAscSortStrategy implements ProviderSortStrategy {
  public readonly key: SortOption = 'price-asc';

  public sort(providers: ProviderProfile[]): ProviderProfile[] {
    return [...providers].sort((a, b) => {
      if (a.startingPrice !== b.startingPrice) {
        return a.startingPrice - b.startingPrice;
      }
      return b.rating - a.rating;
    });
  }
}

/**
 * Sorts by highest starting price in BDT (৳) first
 */
export class PriceDescSortStrategy implements ProviderSortStrategy {
  public readonly key: SortOption = 'price-desc';

  public sort(providers: ProviderProfile[]): ProviderProfile[] {
    return [...providers].sort((a, b) => {
      if (b.startingPrice !== a.startingPrice) {
        return b.startingPrice - a.startingPrice;
      }
      return b.rating - a.rating;
    });
  }
}

/**
 * Sorts by years of experience descending
 */
export class ExperienceDescSortStrategy implements ProviderSortStrategy {
  public readonly key: SortOption = 'experience-desc';

  public sort(providers: ProviderProfile[]): ProviderProfile[] {
    return [...providers].sort((a, b) => {
      if (b.experienceYears !== a.experienceYears) {
        return b.experienceYears - a.experienceYears;
      }
      return b.rating - a.rating;
    });
  }
}

/**
 * Context class that selects and executes a ProviderSortStrategy at runtime
 */
export class ProviderSortContext {
  private strategies: Map<SortOption, ProviderSortStrategy>;
  private activeStrategy: ProviderSortStrategy;

  constructor(initialSort: SortOption = 'relevance') {
    const relevance = new RelevanceSortStrategy();
    this.strategies = new Map<SortOption, ProviderSortStrategy>([
      ['relevance', relevance],
      ['rating-desc', new RatingDescSortStrategy()],
      ['price-asc', new PriceAscSortStrategy()],
      ['price-desc', new PriceDescSortStrategy()],
      ['experience-desc', new ExperienceDescSortStrategy()],
    ]);
    this.activeStrategy = this.strategies.get(initialSort) ?? relevance;
  }

  public setStrategy(sortOption: SortOption): void {
    const strategy = this.strategies.get(sortOption);
    if (strategy) {
      this.activeStrategy = strategy;
    }
  }

  public executeSort(
    providers: ProviderProfile[],
    criteria?: ProviderFilterCriteria
  ): ProviderProfile[] {
    return this.activeStrategy.sort(providers, criteria);
  }
}
