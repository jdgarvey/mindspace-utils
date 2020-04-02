import { ReplaySubject, Subscription } from 'rxjs';

import {isElementRemoved} from './operators/until-view-destroyed';

/**
 * Auto-unsubscribe when the targeted element is removed from the DOM
 */
export function autoUnsubscribe<T>(subscription: Subscription, element: HTMLElement): void {
  if (typeof MutationObserver !== 'undefined') {
    const stop$ = new ReplaySubject<boolean>();
    const hasBeenRemoved = isElementRemoved(element);

    setTimeout(() => {
      const domObserver = new MutationObserver((records: MutationRecord[]) => {
        if (records.some(hasBeenRemoved)) {
          subscription.unsubscribe();
          domObserver.disconnect();
        }
      });

      domObserver.observe(element.parentNode as Node, { childList: true });
    }, 20);
  }
}

