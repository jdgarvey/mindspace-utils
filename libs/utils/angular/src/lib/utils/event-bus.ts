import { filter, map } from 'rxjs/operators';
import { Subject, Subscription, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

export const enum BusEventTypes {
  ADDED,
  CHANGED,
  REMOVED,
  ERROR
}

export class EmitEvent {
  constructor(public type: BusEventTypes, public data: any) {}
}

export const addEvent = (it: any) => new EmitEvent(BusEventTypes.ADDED, it);
export const changeEvent = (it: any) => new EmitEvent(BusEventTypes.CHANGED, it);
export const removeEvent = (it: any) => new EmitEvent(BusEventTypes.REMOVED, it);
export const errorEvent = (error: any) => new EmitEvent(BusEventTypes.ERROR, error);

@Injectable()
export class EventBus {
  private emitter = new Subject<EmitEvent>();

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
