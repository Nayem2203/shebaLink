import { describe, it, expect, beforeEach } from 'vitest';
import {
  EventObserver,
  StorageEventBus,
  StorageChangeEvent,
  storageEventBus,
} from '@/lib/patterns/ObserverPattern';
import { EntityFactory } from '@/lib/patterns/FactoryPattern';
import {
  ProviderSortContext,
  RelevanceSortStrategy,
  RatingDescSortStrategy,
  PriceAscSortStrategy,
  PriceDescSortStrategy,
  ExperienceDescSortStrategy,
} from '@/lib/patterns/StrategyPattern';
import { ProviderProfile } from '@/types';

describe('Phase 1 Foundation: Design Patterns & Core Types', () => {
  describe('ObserverPattern (EventObserver & StorageEventBus)', () => {
    beforeEach(() => {
      storageEventBus.clear();
    });

    it('subscribes, notifies, and delivers events to a single subscriber', () => {
      const received: StorageChangeEvent[] = [];
      storageEventBus.subscribe((event) => {
        received.push(event);
      });

      expect(storageEventBus.getListenerCount()).toBe(1);

      storageEventBus.emitChange('bookings', 'create', 'bk-101');

      expect(received).toHaveLength(1);
      expect(received[0].entity).toBe('bookings');
      expect(received[0].action).toBe('create');
      expect(received[0].entityId).toBe('bk-101');
      expect(() => new Date(received[0].timestamp).toISOString()).not.toThrow();
    });

    it('supports multiple subscribers and delivers events to all active listeners', () => {
      const subA: string[] = [];
      const subB: string[] = [];

      const unsubA = storageEventBus.subscribe((ev) => subA.push(`${ev.entity}:${ev.action}`));
      const unsubB = storageEventBus.subscribe((ev) => subB.push(`${ev.entity}:${ev.action}`));

      expect(storageEventBus.getListenerCount()).toBe(2);

      storageEventBus.emitChange('reviews', 'create', 'rev-01');
      expect(subA).toEqual(['reviews:create']);
      expect(subB).toEqual(['reviews:create']);

      unsubA();
      expect(storageEventBus.getListenerCount()).toBe(1);

      storageEventBus.emitChange('providers', 'update', 'prov-01');
      expect(subA).toEqual(['reviews:create']);
      expect(subB).toEqual(['reviews:create', 'providers:update']);

      unsubB();
      expect(storageEventBus.getListenerCount()).toBe(0);
    });

    it('unsubscribes directly via unsubscribe(callback) method', () => {
      const events: number[] = [];
      const bus = new EventObserver<number>();
      const handler = (val: number) => events.push(val);

      bus.subscribe(handler);
      bus.notify(10);
      bus.unsubscribe(handler);
      bus.notify(20);

      expect(events).toEqual([10]);
      expect(bus.getListenerCount()).toBe(0);
    });

    it('returns the same singleton instance from StorageEventBus.getInstance()', () => {
      expect(StorageEventBus.getInstance()).toBe(storageEventBus);
    });
  });

  describe('FactoryPattern (EntityFactory)', () => {
    it('creates a normalized Booking with bk- prefix, Pending status, and ISO timestamps', () => {
      const booking = EntityFactory.createBooking({
        customerId: '  cust-001 ',
        providerId: ' prov-001 ',
        serviceId: ' srv-001 ',
        problemDescription: '  Main distribution board circuit breaker keeps tripping. ',
        address: ' House 14, Road 3, Padma Residential Area, Rajshahi ',
        preferredDate: ' 2026-12-05 ',
        preferredTime: ' 10:00 AM ',
        instructions: '  Call before arriving ',
        quotedPrice: 500,
      });

      expect(booking.id).toMatch(/^bk-[a-z0-9]+$/);
      expect(booking.status).toBe('Pending');
      expect(booking.customerId).toBe('cust-001');
      expect(booking.providerId).toBe('prov-001');
      expect(booking.serviceId).toBe('srv-001');
      expect(booking.problemDescription).toBe(
        'Main distribution board circuit breaker keeps tripping.'
      );
      expect(booking.address).toBe('House 14, Road 3, Padma Residential Area, Rajshahi');
      expect(booking.preferredDate).toBe('2026-12-05');
      expect(booking.preferredTime).toBe('10:00 AM');
      expect(booking.instructions).toBe('Call before arriving');
      expect(booking.imagePreview).toBeNull();
      expect(booking.quotedPrice).toBe(500);
      expect(booking.createdAt).toBe(booking.updatedAt);
      expect(Number.isNaN(Date.parse(booking.createdAt))).toBe(false);
    });

    it('creates a normalized Review with rev- prefix, clamped integer rating (1..5), and ISO timestamp', () => {
      const reviewHigh = EntityFactory.createReview({
        bookingId: ' bk-001 ',
        customerId: ' cust-001 ',
        providerId: ' prov-001 ',
        rating: 6.4,
        comment: '  Prompt and reliable electrical repair in Boalia! ',
      });

      expect(reviewHigh.id).toMatch(/^rev-[a-z0-9]+$/);
      expect(reviewHigh.bookingId).toBe('bk-001');
      expect(reviewHigh.customerId).toBe('cust-001');
      expect(reviewHigh.providerId).toBe('prov-001');
      expect(reviewHigh.rating).toBe(5);
      expect(reviewHigh.comment).toBe('Prompt and reliable electrical repair in Boalia!');
      expect(Number.isNaN(Date.parse(reviewHigh.createdAt))).toBe(false);

      const reviewLow = EntityFactory.createReview(
        {
          bookingId: 'bk-002',
          customerId: 'cust-001',
          providerId: 'prov-002',
          rating: 0,
          comment: 'Late arrival.',
        },
        { idOverride: 'rev-custom-01', nowOverride: '2026-11-27T10:00:00.000Z' }
      );

      expect(reviewLow.id).toBe('rev-custom-01');
      expect(reviewLow.rating).toBe(1);
      expect(reviewLow.createdAt).toBe('2026-11-27T10:00:00.000Z');
    });

    it('creates a normalized Complaint with cmp- prefix, Open status, and ISO timestamps', () => {
      const complaint = EntityFactory.createComplaint({
        bookingId: ' bk-005 ',
        customerId: ' cust-002 ',
        providerId: ' prov-003 ',
        subject: '  Delayed arrival ',
        description: '  Technician arrived 2 hours after scheduled window. ',
      });

      expect(complaint.id).toMatch(/^cmp-[a-z0-9]+$/);
      expect(complaint.status).toBe('Open');
      expect(complaint.bookingId).toBe('bk-005');
      expect(complaint.customerId).toBe('cust-002');
      expect(complaint.providerId).toBe('prov-003');
      expect(complaint.subject).toBe('Delayed arrival');
      expect(complaint.description).toBe(
        'Technician arrived 2 hours after scheduled window.'
      );
      expect(complaint.createdAt).toBe(complaint.updatedAt);
      expect(Number.isNaN(Date.parse(complaint.createdAt))).toBe(false);
    });
  });

  describe('StrategyPattern (ProviderSortContext & Concrete Strategies)', () => {
    const sampleProviders: ProviderProfile[] = [
      {
        id: 'prov-1',
        userId: 'u-1',
        name: 'Rahim Uddin',
        avatar: '/avatars/rahim.png',
        phone: '+8801711000001',
        email: 'rahim@shebalink.demo',
        title: 'Senior Electrician',
        primaryCategoryId: 'cat-electrician',
        primaryCategoryName: 'Electrician',
        bio: 'Certified residential and commercial electrician in Rajshahi.',
        skills: ['Wiring', 'Circuit Breaker', 'MCB'],
        experienceYears: 5,
        rating: 4.8,
        reviewCount: 24,
        startingPrice: 500,
        priceUnit: 'per visit',
        serviceAreas: ['Rajshahi'],
        primaryCity: 'Rajshahi',
        neighborhood: 'Boalia',
        verifiedStatus: 'verified',
        availabilityLabel: 'Available Today',
        isAvailable: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'prov-2',
        userId: 'u-2',
        name: 'Karim Hossain',
        avatar: '/avatars/karim.png',
        phone: '+8801711000002',
        email: 'karim@shebalink.demo',
        title: 'Master Plumber & Pipe Specialist',
        primaryCategoryId: 'cat-plumber',
        primaryCategoryName: 'Plumber',
        bio: 'Expert plumbing and leakage repair in Rajshahi.',
        skills: ['Pipe Fitting', 'Water Tank', 'Leak Repair'],
        experienceYears: 9,
        rating: 4.9,
        reviewCount: 31,
        startingPrice: 400,
        priceUnit: 'per visit',
        serviceAreas: ['Rajshahi'],
        primaryCity: 'Rajshahi',
        neighborhood: 'Motihar',
        verifiedStatus: 'verified',
        availabilityLabel: 'Available Tomorrow',
        isAvailable: true,
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
      {
        id: 'prov-3',
        userId: 'u-3',
        name: 'Tanvir Ahmed',
        avatar: '/avatars/tanvir.png',
        phone: '+8801711000003',
        email: 'tanvir@shebalink.demo',
        title: 'AC Servicing Technician',
        primaryCategoryId: 'cat-ac',
        primaryCategoryName: 'AC Repair & Servicing',
        bio: 'Split and window AC servicing across Dhaka and Rajshahi.',
        skills: ['AC Gas Refill', 'Compressor Repair'],
        experienceYears: 3,
        rating: 4.5,
        reviewCount: 10,
        startingPrice: 800,
        priceUnit: 'per unit',
        serviceAreas: ['Dhaka', 'Rajshahi'],
        primaryCity: 'Dhaka',
        neighborhood: 'Dhanmondi',
        verifiedStatus: 'pending',
        availabilityLabel: 'Busy',
        isAvailable: false,
        createdAt: '2026-01-03T00:00:00.000Z',
        updatedAt: '2026-01-03T00:00:00.000Z',
      },
    ];

    it('dynamically switches strategies in ProviderSortContext', () => {
      const context = new ProviderSortContext('relevance');

      // 1. Relevance sort with keyword matching Tanvir's AC service
      const byRelevanceAC = context.executeSort(sampleProviders, { query: 'AC Servicing' });
      expect(byRelevanceAC[0].id).toBe('prov-3');

      // 2. Rating descending: 4.9 (prov-2) -> 4.8 (prov-1) -> 4.5 (prov-3)
      context.setStrategy('rating-desc');
      const byRating = context.executeSort(sampleProviders);
      expect(byRating.map((p) => p.id)).toEqual(['prov-2', 'prov-1', 'prov-3']);

      // 3. Price ascending: 400 (prov-2) -> 500 (prov-1) -> 800 (prov-3)
      context.setStrategy('price-asc');
      const byPriceAsc = context.executeSort(sampleProviders);
      expect(byPriceAsc.map((p) => p.startingPrice)).toEqual([400, 500, 800]);

      // 4. Price descending: 800 (prov-3) -> 500 (prov-1) -> 400 (prov-2)
      context.setStrategy('price-desc');
      const byPriceDesc = context.executeSort(sampleProviders);
      expect(byPriceDesc.map((p) => p.startingPrice)).toEqual([800, 500, 400]);

      // 5. Experience descending: 9 yrs (prov-2) -> 5 yrs (prov-1) -> 3 yrs (prov-3)
      context.setStrategy('experience-desc');
      const byExperience = context.executeSort(sampleProviders);
      expect(byExperience.map((p) => p.experienceYears)).toEqual([9, 5, 3]);
    });

    it('exposes standalone strategy classes with expected key identifiers', () => {
      expect(new RelevanceSortStrategy().key).toBe('relevance');
      expect(new RatingDescSortStrategy().key).toBe('rating-desc');
      expect(new PriceAscSortStrategy().key).toBe('price-asc');
      expect(new PriceDescSortStrategy().key).toBe('price-desc');
      expect(new ExperienceDescSortStrategy().key).toBe('experience-desc');
    });
  });
});
