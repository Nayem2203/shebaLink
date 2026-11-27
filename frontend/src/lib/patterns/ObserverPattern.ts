/**
 * Observer Design Pattern — Typed EventObserver & Reactive StorageEventBus
 * Synchronizes state across Customer, Provider, and Admin dashboards on LocalStorage mutations.
 */

export type StorageEntityKey =
  | 'users'
  | 'providers'
  | 'categories'
  | 'services'
  | 'bookings'
  | 'reviews'
  | 'complaints'
  | 'role'
  | 'all';

export interface StorageChangeEvent {
  entity: StorageEntityKey;
  action: 'create' | 'update' | 'delete' | 'reset';
  entityId?: string;
  timestamp: string;
}

export type ObserverCallback<T> = (event: T) => void;

export const STORAGE_CUSTOM_EVENT_NAME = 'shebalink-storage-updated';

/**
 * Generic Typed EventObserver<T>
 */
export class EventObserver<T> {
  private listeners: Set<ObserverCallback<T>> = new Set();

  public subscribe(callback: ObserverCallback<T>): () => void {
    this.listeners.add(callback);
    return () => this.unsubscribe(callback);
  }

  public unsubscribe(callback: ObserverCallback<T>): void {
    this.listeners.delete(callback);
  }

  public notify(event: T): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[EventObserver] Listener error:', err);
      }
    });
  }

  public clear(): void {
    this.listeners.clear();
  }

  public getListenerCount(): number {
    return this.listeners.size;
  }
}

/**
 * Singleton StorageEventBus bridging in-memory observers and window CustomEvent
 * ('shebalink-storage-updated') + cross-tab window 'storage' events.
 */
export class StorageEventBus extends EventObserver<StorageChangeEvent> {
  private static instance: StorageEventBus | null = null;
  private browserListenerAttached = false;

  private constructor() {
    super();
    this.attachBrowserBridge();
  }

  public static getInstance(): StorageEventBus {
    if (!StorageEventBus.instance) {
      StorageEventBus.instance = new StorageEventBus();
    }
    return StorageEventBus.instance;
  }

  private attachBrowserBridge(): void {
    if (this.browserListenerAttached) return;
    if (typeof window === 'undefined') return;

    this.browserListenerAttached = true;

    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key && e.key.startsWith('shebalink_')) {
        super.notify({
          entity: 'all',
          action: 'update',
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  public override notify(event: StorageChangeEvent): void {
    super.notify(event);
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(
          new CustomEvent<StorageChangeEvent>(STORAGE_CUSTOM_EVENT_NAME, {
            detail: event,
          })
        );
      } catch {
        // Ignore in non-DOM test environments
      }
    }
  }

  public emitChange(
    entity: StorageEntityKey,
    action: StorageChangeEvent['action'] = 'update',
    entityId?: string
  ): void {
    this.notify({
      entity,
      action,
      entityId,
      timestamp: new Date().toISOString(),
    });
  }
}

export const storageEventBus = StorageEventBus.getInstance();
