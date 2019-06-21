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
 *  export class TicketDetails implements OnInit, OnDestroy {
 *    search: FormControl;
 *
 *    constructor(private ticketService: TicketService){}
 *    ngOnInit() {
 *      this.search.valueChanges.pipe(
 *        untilViewDestroyed(this),
 *        switchMap(()=> this.ticketService.loadAll()),
 *        map(ticket=> ticket.name)
 *      )
 *      .subscribe( tickets => this.tickets = tickets );
 *    }
 *
 *    ngOnDestroy() { };
 *  }
 *
 *  Utility method to hide complexity of bridging a view component instance to a manual observable subs
 */
import { ElementRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface NgViewComponent {
  ngOnInit?: () => void;
  ngOnDestroy ?: () => void;
}

/**
 *  Wait until the DOM element has been removed (destroyed) and then
 *  use `takeUntil()` to complete the source subscription.
 *
 *  If the `pipe(untilViewDestroyed(element.nativeEl))` is used in the constructor
 *  we must delay until the new view has been inserted into the DOM.
 */
export function untilViewDestroyed<T>(element: ElementRef<HTMLElement> | NgViewComponent): (source: Observable<T>) => Observable<T> {
  const elRef = element['nativeElement'] as HTMLElement;
  const destroyed$ = (elRef) ? watchElementDestroyed(elRef) : watchViewDestroyed(element as NgViewComponent);
  return (source$: Observable<T>) => destroyed$ ? source$.pipe(takeUntil(destroyed$)) : source$;
}

/**
 * Unique hashkey
 */
const destroy$ = 'destroy$';
/**
 * Lifecycle method for Angular Components
 */
const ON_DESTROY = 'ngOnDestroy';

/**
 * Use MutationObserver to watch for Element being removed from the DOM: destroyed
 * When destroyed, stop subscriptions upstream.
 */
export function watchElementDestroyed(nativeEl: Element, delay: number = 20): Observable<boolean> {
  const parentNode = nativeEl.parentNode as Node;

  if (!nativeEl[destroy$] && parentNode ) {
    if (typeof MutationObserver !== 'undefined') {
      const stop$ = new Subject<boolean>();
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

/**
 * Monkey-Patch the ngOnDestroy lifecycle hook.
 *
 * Note: to hook into the ngOnDestroy lifecycle method of an Angular view component
 * the `ngOnDestroy()` method must be defined (even if empty)
 */
export function watchViewDestroyed(view:NgViewComponent): Observable<boolean> {
  if (!isPatched(view)) {
    const origOnDestroy = view[ON_DESTROY];
    const isFunction = (value) => (typeof value === 'function');

    if (isFunction(origOnDestroy) === false) {
      throw new Error(
        `When using untilViewDestroyed(), ${view.constructor.name}::${ON_DESTROY} is required!`
      );
    }

    const stop$ = new Subject<boolean>();
    view[ON_DESTROY] = () => {
      // Monkey-patch
      stop$.next(true);
      stop$.complete();

      origOnDestroy.call(view);
      view[destroy$] = undefined;
    };

    view[destroy$] = stop$.asObservable();
  }
  return view[destroy$];
}

export function isElementRemoved(nativeEl) {
  return (record: MutationRecord) => {
    return Array.from(record.removedNodes).indexOf(nativeEl) > -1;
  };
}

/**
 * Has this view component instance already been monkey-patched ?
 */
export function isPatched(cmpInstance: NgViewComponent): boolean {
  return !!cmpInstance[destroy$];
}

