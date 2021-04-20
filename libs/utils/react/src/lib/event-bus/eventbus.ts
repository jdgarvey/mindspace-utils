import { Subject, Observable } from 'rxjs';
import { filter, map, startWith, tap, takeUntil } from 'rxjs/operators';

export enum CollectionEvent {
  ITEM_ADDED = 'itemAdded',
  ITEM_UPDATED = 'itemUpdated',
  ITEM_REMOVED = 'itemRemoved',
  ITEM_ERROR = 'eventError',
}

export interface EmitEvent<K extends unknown> {
  type: string;
  data?: K;
}

export class ItemEvent<K> implements EmitEvent<K> {
  constructor(public type: string, public data: K) {}
}

export const itemUpdated = (item: any) => new ItemEvent(CollectionEvent.ITEM_UPDATED, item);
export const itemRemoved = (itemId: string) => new ItemEvent(CollectionEvent.ITEM_REMOVED, itemId);
export const itemError = (error: any) => new ItemEvent(CollectionEvent.ITEM_ERROR, error);

const DestroyEvent = '[EventBus] destory';
export const destroyEventBus = () => ({ type: DestroyEvent });
/**
 * Simply Pub/Sub mechanism that support decoupled communication between services
 * Note: This EventBus does cache the most recent event for EACH type...
 */
export class EventBus {
  private cache: Record<string, EmitEvent<unknown>>;
  private emitter: Subject<EmitEvent<unknown>>;

  constructor() {
    this.cache = {};
    this.emitter = new Subject<EmitEvent<unknown>>();

    // Enable events to stop internal subscriptions
    const captureToCache = (e: EmitEvent<unknown>) => (this.cache[e.type] = e);
    const destroy$ = this.emitter.pipe(filter(({ type }) => type === DestroyEvent));

    this.emitter.pipe(tap(captureToCache), takeUntil(destroy$)).subscribe();
  }

  /**
   * Emit an event to all listeners on this messaging queu
   */
  emit(event: EmitEvent<any>) {
    this.emitter.next(event);
  }

  /**
   * Easily listen to a collection of events
   * And provide single teardown to disconnect all
   * internal connections.
   */
  onMany(collection: Record<string, (data: any) => void>): () => void {
    const eventKeys = Object.keys(collection);
    const connections = eventKeys.map((key) => this.on(key, collection[key]));

    return () => {
      connections.map((teardown) => teardown());
    };
  }

  /**
   * Listen on a single event, extract data
   * Publish a teardown function to disconnect later
   */
  on<T>(event: string, notify: (data: T) => void): () => void {
    const watch$ = this.emitter.pipe(
      startWith(this.cache[event]),
      filter((e: EmitEvent<T>) => e?.type === event),
      map((e: EmitEvent<T>) => e.data)
    );
    const subscription = watch$.subscribe(notify);

    return subscription.unsubscribe.bind(subscription);
  }

  /**
   * Get an observable stream for a specific event
   */
  observableFor<T>(event: string): Observable<T> {
    const watch$ = this.emitter.pipe(
      filter((e: EmitEvent<T>) => e.type === event),
      map((e: EmitEvent<T>) => e.data)
    );
    return watch$;
  }
}
