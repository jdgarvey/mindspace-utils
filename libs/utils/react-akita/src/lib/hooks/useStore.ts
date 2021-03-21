import { produce } from 'immer';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { useEffect, useLayoutEffect } from 'react';
import { Query, Store, StoreConfigOptions, StoreConfig, UpdateStateCallback } from '@datorama/akita';

import { useObservable } from './useObservable';

import {
  Destroy,
  GetState,
  SetState,
  CustomValue,
  ComputedProperty,
  AddComputedProperty,
  State,
  StateCreator,
  StateCreatorOptions,
  StateSelector,
  StateListener,
  StateSliceListener,
  Unsubscribe,
  Subscribe,
  StoreApi,
  UseStore,
} from './store.interfaces';

/**
 * Akita expects a store decorator to be used to assign a name. If a name is not available,
 * a `console.error()` is thrown and inter-store messaging is not setup properly.
 * @see reinitStore() for the 'hack' fix
 */
@StoreConfig({ name: 'mindspace-io' })
class StoreWithConfig<T> extends Store<T> {}

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const identity = (s) => s as any;
const NOOP = () => {};

/**
 * Create a store with specified state
 *
 * The store instances is actually a React hook with Store API added
 * All stores are decorated with Status state (isLoading, error, setIsLoading, and setError)
 * Return a UseStore hook that will return either all state or partial state based on passed selector.
 *
 */
export function createStore<TState extends State>(
  createState: StateCreator<TState>,
  options: StateCreatorOptions = {}
): UseStore<TState> {
  // Create the internal Akita Store + Query instances
  // Note: Immer immutability is auto-applied via the `producerFn` configuration
  const name = options.storeName || `ReactAkitStore${Math.random()}`;
  const store = new StoreWithConfig<TState>({}, { producerFn: produce, name });
  const query = new Query<TState>(store);

  // Build API methods used that delegate to the store and query
  const getState: GetState<TState> = store.getValue.bind(store);
  const setState: SetState<TState> = (partial, replace) => {
    const isCallback = partial instanceof Function;
    const updateWithValue: UpdateStateCallback<TState> = (s) => (replace ? s : { ...s, ...partial });
    store.update(!isCallback ? updateWithValue : (partial as UpdateStateCallback<TState>));
  };

  const setIsLoading = (isLoading = true) => store.update((s) => ({ ...s, isLoading }));
  const setError = (error: Error | unknown) => store.update((s) => ({ ...s, error }));

  const addComputedProperty: AddComputedProperty<TState> = <K extends any, U>(
    property: ComputedProperty<TState, K, U>
  ) => {
    const makeStream = (predicate) => query.select(predicate);
    const source$ = combineLatest(property.selectors.map(makeStream)).pipe(map(property.predicate));

    source$.subscribe((computedValue: unknown) => {
      // Update the state at the END of the microtask queue
      Promise.resolve(computedValue).then(() => {
        setState((s) => ({ ...s, ...{ [property.name]: computedValue } }));
      });
    });
  };

  // The subscribe function allows components to bind to a state-portion without forcing re-render on changes
  const subscribe: Subscribe<TState> = <StateSlice>(
    listener: StateListener<TState> | StateSliceListener<StateSlice>,
    selector: StateSelector<TState, StateSlice> = identity
  ): Unsubscribe => {
    const onNext = (s: TState & StateSlice) => listener(s);
    const watcher = query.select(selector).subscribe(onNext);
    return () => watcher.unsubscribe();
  };
  const destroy: Destroy = () => store.destroy();

  const api: StoreApi<TState> = { destroy, subscribe, getState, setState, addComputedProperty, setIsLoading, setError };
  const state = produce({}, () => createState(setState, getState, api));

  // Build and assign actual state
  reinitStore(store, name, { ...state, ...{ error: null, isLoading: false } });

  /**
   * After the store has been created and initialized with state.
   * Developer will use a custom react hook to 'select' state data. This selection
   * will re-emit data anytime the selected state changes.
   *
   * Here we build the custom hook to observe state or state slice
   * Remit slice value when distinctly changed
   * This hook is implicitly connected to its associated store
   *
   * Warning!!
   *   1) Do not use same 'useStore' hook multiple times in the same component.
   *   2) To extract multiple slices, use a single selector to return a hashmap or tuple
   */
  const useStore: any = <StateSlice>(selector: StateSelector<TState, StateSlice> = identity) => {
    const [slice, setSlice$] = useObservable<string>(null, () => <any>selector(getState()));
    const buildQuery = () => {
      if (selector instanceof Array) {
        const list = <StateSelector<TState, StateSlice>[]>selector;
        return list.length == 1 ? query.select(list[0]) : combineLatest(list.map((it) => query.select(it)));
      }
      return query.select(selector);
    };

    useIsoLayoutEffect(() => {
      setSlice$(buildQuery());

      return () => destroy();
    }, [selector]);

    return typeof slice == 'undefined' ? selector(getState()) : slice;
  };

  // Decorate hook function with API methods
  Object.assign(useStore, api);

  // Publish the custom hook (with extra store APIs)
  return useStore;
}

export function addComputedProperty<T extends State, SelectorTypes, PropType extends CustomValue = CustomValue>(
  target: UseStore<T>,
  property: ComputedProperty<T, SelectorTypes, PropType>
): void {
  target.addComputedProperty(property);
}

// *******************************************************
// Hacks
// *******************************************************

/**
 * Currently Akita expects a store class to be decorated with @StoreConfi() to set a store name
 * If this is not done, the constructor will assert a `console.error()`
 * @param store
 * @param name
 */
function reinitStore(store: Store, name: string, state) {
  if (!!name && store.storeName != name) {
    store.constructor['akitaConfig'].storeName = name;
    (store['options'] as StoreConfigOptions & {
      storeName: string;
    }).storeName = name;
  }
  // Reinitalize
  store['onInit'](state);
}
