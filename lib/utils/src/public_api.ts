/*
 * Public API Surface of observable-utils
 */

export * from './lib/di';
export * from './lib/hooks/useObservable';
export * from './lib/misc/switchCase';

export { autoUnsubscribe  } from './lib/rxjs/auto-unsubscribe';
export { untilViewDestroyed, watchElementDestroyed } from './lib/rxjs/operators/until-view-destroyed';
