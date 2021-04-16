import { filter, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

export enum CollectionEvent {
  ITEM_ADDED = 'itemAdded',
  ITEM_UPDATED = 'itemUpdated',
  ITEM_REMOVED = 'itemRemoved',
  ITEM_ERROR = 'eventError',
}

export interface EmitEvent<K extends unknown> {
  type: string;
  data: K;
}

export class ItemEvent<K> implements EmitEvent<K> {
  constructor(public type: string, public data: K) {}
}

export const itemUpdated = (item: any) => new ItemEvent(CollectionEvent.ITEM_UPDATED, item);
export const itemRemoved = (itemId: string) => new ItemEvent(CollectionEvent.ITEM_REMOVED, itemId);
export const itemError = (error: any) => new ItemEvent(CollectionEvent.ITEM_ERROR, error);

/**
 * Simply Pub/Sub mechanism that support decoupled communication between services
 * Note: this EventBus does NOT cache previously emitted events...
 */
export class EventBus {
  private emitter = new Subject<EmitEvent<unknown>>();

  emit(event: EmitEvent<any>) {
    this.emitter.next(event);
  }

  on<T>(event: string, notify: (data: T) => void): () => void {
    const watch$ = this.emitter.pipe(
      filter((e: EmitEvent<T>) => e.type === event),
      map((e: EmitEvent<T>) => e.data)
    );
    const subscription = watch$.subscribe(notify);

    return subscription.unsubscribe.bind(subscription);
  }

  observableFor<T>(event: string): Observable<T> {
    const watch$ = this.emitter.pipe(
      filter((e: EmitEvent<T>) => e.type === event),
      map((e: EmitEvent<T>) => e.data)
    );
    return watch$;
  }
}
