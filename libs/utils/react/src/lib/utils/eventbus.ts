import { filter, map } from 'rxjs/operators';
import { Subject, Subscription, Observable } from 'rxjs';

export const enum BusEventTypes {
  ITEM_UPDATED = 'itemUpdated',
  ITEM_REMOVED = 'itemRemoved',
  ITEM_ERROR = 'eventError'
}

export class EmitEvent<T extends any, K extends any> {
  constructor(public type: T, public data: K) {}
}

export const itemUpdated = (item: any) => new EmitEvent(BusEventTypes.ITEM_UPDATED, item);
export const itemRemoved = (itemId: string) => new EmitEvent(BusEventTypes.ITEM_REMOVED, itemId);
export const itemError = (error: any) => new EmitEvent(BusEventTypes.ITEM_ERROR, error);

export class EventBus {
  private emitter = new Subject<EmitEvent<any, any>>();

  emit(event: EmitEvent<string, any>) {
    this.emitter.next(event);
  }

  on(event: BusEventTypes, notify: (data: any) => {}): Subscription | Observable<any> {
    const watch$ = this.emitter.pipe(
      filter((e: EmitEvent<string, any>) => e.type === event),
      map((e: EmitEvent<string, any>) => e.data)
    );

    return !notify ? watch$ : watch$.subscribe(notify);
  }
}
