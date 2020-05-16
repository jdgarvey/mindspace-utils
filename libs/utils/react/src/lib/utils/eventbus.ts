import { filter, map } from 'rxjs/operators';
import { Subject, Subscription, Observable } from 'rxjs';

export const enum BusEventTypes {
  UPDATED,
  REMOVED,
  ERROR
}

export class EmitEvent<T extends any, K extends any> {
  constructor(public type: T, public data: K) {}
}

export const orderUpdated = (order: Order) => new EmitEvent(BusEventTypes.ORDER_UPDATED, order);
export const orderRemoved = (orderId: string) => new EmitEvent(BusEventTypes.ORDER_REMOVED, orderId);
export const orderError = (error: any) => new EmitEvent(BusEventTypes.ORDER_ERROR, error);

export class EventBus {
  private emitter = new Subject<EmitEvent<any,any>>();

  emit(event: EmitEvent) {
    this.emitter.next(event);
  }

  on(event: BusEventTypes, notify: (data: any) => {}): Subscription | Observable<any> {
    const watch$ = this.emitter.pipe(
      filter((e: EmitEvent) => e.type === event),
      map((e: EmitEvent) => e.data)
    );

    return !notify ? watch$ : watch$.subscribe(notify);
  }
}
