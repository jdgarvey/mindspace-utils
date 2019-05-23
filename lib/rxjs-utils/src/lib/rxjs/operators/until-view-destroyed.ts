/**
 *  When manually subscribing to an observable in a view component, developers are traditionally required
 *  to unsubscribe during ngOnDestroy. This utility method auto-configures and manages that relationship
 *  by watching the DOM with a MutationObserver and internally using the takeUntil RxJS operator.
 *
 *  Angular has stricter enforcements and throws errors with monkey-patching of view component life-cycle methods.
 *  Here is an updated version that uses MutationObserver to accomplish the  same goal.
 *
 *  @code
 *
 *  import {untilViewDestroyed} from '@mindspace/rxjs-utils'
 *
 *  @Component({})
 *  export class TicketDetails {
 *    search: FormControl;
 *
 *    constructor(private ticketService: TicketService, private elRef: ElementRef){}
 *    ngOnInit() {
 *      this.search.valueChanges.pipe(
 *        untilViewDestroyed(elRef),
 *        switchMap(()=> this.ticketService.loadAll()),
 *        map(ticket=> ticket.name)
 *      )
 *      .subscribe( tickets => this.tickets = tickets );
 *    }
 *
 *  }
 *
 *  Utility method to hide complexity of bridging a view component instance to a manual observable subs
 */
import { ElementRef } from '@angular/core';

import { Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 *  Wait until the DOM element has been removed (destroyed) and then
 *  use `takeUntil()` to complete the source subscription.
 *
 *  If the `pipe(untilViewDestroyed(element.nativeEl))` is used in the constructor
 *  we must delay until the new view has been inserted into the DOM.
 */
export function untilViewDestroyed<T>(element: ElementRef): (source: Observable<T>) => Observable<T> {
  const destroyed$ = (element && element.nativeElement) ? watchElementDestroyed(element.nativeElement) : null;
  return (source$: Observable<T>) => destroyed$ ? source$.pipe(takeUntil(destroyed$)) : source$;
}

/**
 * Unique hashkey
 */
const destroy$ = 'destroy$';

/**
 * Use MutationObserver to watch for Element being removed from the DOM: destroyed
 * When destroyed, stop subscriptions upstream.
 */
export function watchElementDestroyed(nativeEl: Element, delay: number = 20): Observable<boolean> {
  const parentNode = nativeEl.parentNode as Node;

  if (!nativeEl[destroy$] && parentNode ) {
    if (typeof MutationObserver !== 'undefined') {
      const stop$ = new ReplaySubject<boolean>();
      const hasBeenRemoved = isElementRemoved(nativeEl);

      nativeEl[destroy$] = stop$.asObservable();
      setTimeout(() => {
        const domObserver = new MutationObserver((records: MutationRecord[]) => {
          if (records.some(hasBeenRemoved)) {
            stop$.next(true);
            stop$.complete();

            domObserver.disconnect();
            nativeEl[destroy$] = null;
          }
        });

        domObserver.observe(parentNode, { childList: true });
      }, delay);
    }
  }

  return nativeEl[destroy$];
}

export function isElementRemoved(nativeEl) {
  return (record: MutationRecord) => {
    return Array.from(record.removedNodes).indexOf(nativeEl) > -1;
  };
}
